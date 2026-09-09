package com.dhansiri.resort.data

import com.dhansiri.resort.data.ApiClient.api
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.time.OffsetDateTime

class Repository(private val session: SessionStore) {

    private val apiKey = AppConfig.SUPABASE_ANON_KEY
    private val auth = "Bearer ${AppConfig.SUPABASE_ANON_KEY}"

    private val _bookings = MutableStateFlow<List<Booking>>(emptyList())
    val bookings: StateFlow<List<Booking>> = _bookings.asStateFlow()

    private val _rooms = MutableStateFlow<List<Room>>(emptyList())
    val rooms: StateFlow<List<Room>> = _rooms.asStateFlow()

    private val _payments = MutableStateFlow<List<Payment>>(emptyList())
    val payments: StateFlow<List<Payment>> = _payments.asStateFlow()

    private val _overrides = MutableStateFlow<Map<String, Double>>(emptyMap())
    val overrides: StateFlow<Map<String, Double>> = _overrides.asStateFlow()

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private var loggedInUserId: String? = null

    suspend fun currentUser(): User? {
        loggedInUserId = session.currentUserId()
        return session.currentUser()
    }

    suspend fun login(email: String, password: String): Result<User> {
        val user = SeedUsers.all.firstOrNull { it.email.equals(email.trim(), ignoreCase = true) }
            ?: return Result.failure(Exception("invalid"))
        if (!user.isActive) return Result.failure(Exception("disabled"))
        val expected = DemoPasswords.map[user.email.lowercase()] ?: "demo-pass-12345"
        if (password != expected) return Result.failure(Exception("invalid"))
        session.store(user.id)
        loggedInUserId = user.id
        return Result.success(user)
    }

    suspend fun logout() {
        session.clear()
        loggedInUserId = null
    }

    suspend fun refresh() {
        _loading.value = true
        _error.value = null
        val failures = mutableListOf<String>()
        try {
            _rooms.value = withContext(Dispatchers.IO) { api.getRooms(apiKey, auth) }
        } catch (e: Exception) {
            failures += "rooms: ${e.message}"
        }
        try {
            _bookings.value = withContext(Dispatchers.IO) { api.getBookings(apiKey, auth) }
        } catch (e: Exception) {
            failures += "bookings: ${e.message}"
        }
        try {
            val overridesList = withContext(Dispatchers.IO) { api.getOverrides(apiKey, auth) }
            _overrides.value = overridesList.associate { it.key to it.value }
        } catch (e: Exception) {
            // dashboard_overrides is optional (admin display tweaks) — never block the app on it.
            failures += "overrides: ${e.message}"
        }
        try {
            _payments.value = withContext(Dispatchers.IO) { api.getPayments(apiKey, auth) }
        } catch (e: Exception) {
            failures += "payments: ${e.message}"
        }
        if (failures.isNotEmpty()) {
            _error.value = failures.joinToString("; ")
        }
        _loading.value = false
    }

    /**
     * Manual / walk-in check-in: creates a booking that is already checked in,
     * mirroring the New Check-in flow on the website.
     */
    suspend fun directCheckin(
        guestName: String,
        organization: String,
        guestType: GuestType,
        roomIds: List<String>,
        checkIn: String,
        checkOut: String,
        notes: String,
    ): Result<Unit> {
        val days = Logic.calculateDays(checkIn, checkOut)
        val rate = Logic.dailyRate(guestType)
        val rent = rate * days * roomIds.size
        val nowIso = OffsetDateTime.now().toString()
        val insert = BookingInsert(
            id = Logic.randomId(),
            bookingDate = Logic.todayIso(),
            guestName = guestName.trim(),
            organization = organization.trim(),
            guestType = guestType,
            roomId = roomIds.first(),
            roomIds = roomIds,
            checkInDate = checkIn,
            checkOutDate = checkOut,
            numberOfDays = days,
            dailyRate = rate,
            totalRent = rent,
            amountPaid = 0.0,
            dueAmount = rent,
            paymentStatus = PaymentStatus.UNPAID,
            bookingStatus = BookingStatus.CHECKED_IN,
            actualCheckIn = nowIso,
            actualCheckOut = null,
            notes = notes.trim(),
            createdBy = loggedInUserId,
            createdAt = nowIso,
            updatedAt = nowIso,
        )
        return withContext(Dispatchers.IO) {
            try {
                val inserted = api.insertBooking(apiKey, auth, body = insert)
                val saved = if (inserted.isNotEmpty()) inserted.first() else insert.toBooking()
                _bookings.value = listOf(saved) + _bookings.value
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun checkIn(bookingId: String): Result<Unit> {
        val body = mapOf(
            "booking_status" to BookingStatus.CHECKED_IN.serialName(),
            "actual_check_in" to OffsetDateTime.now().toString(),
            "updated_at" to OffsetDateTime.now().toString(),
        )
        return updateBookingApi(bookingId, body) { b ->
            b.copy(
                bookingStatus = BookingStatus.CHECKED_IN,
                actualCheckIn = body["actual_check_in"] as String,
                updatedAt = body["updated_at"] as String,
            )
        }
    }

    suspend fun checkOut(bookingId: String, amountPaid: Double): Result<Unit> {
        val booking = _bookings.value.firstOrNull { it.id == bookingId } ?: return Result.failure(Exception("not found"))
        val due = Logic.dueAmount(booking.totalRent, amountPaid)
        val status = when {
            due <= 0.0 -> PaymentStatus.PAID
            amountPaid > 0.0 -> PaymentStatus.PARTIAL
            else -> PaymentStatus.UNPAID
        }
        val nowIso = OffsetDateTime.now().toString()
        val body = mapOf(
            "booking_status" to BookingStatus.CHECKED_OUT.serialName(),
            "actual_check_out" to nowIso,
            "amount_paid" to amountPaid,
            "due_amount" to due,
            "payment_status" to status.serialName(),
            "updated_at" to nowIso,
        )
        val result = updateBookingApi(bookingId, body) { b ->
            b.copy(
                bookingStatus = BookingStatus.CHECKED_OUT,
                actualCheckOut = nowIso,
                amountPaid = amountPaid,
                dueAmount = due,
                paymentStatus = status,
                updatedAt = nowIso,
            )
        }
        if (amountPaid > 0.0) {
            val payment = Payment(
                id = Logic.randomId(),
                bookingId = bookingId,
                amount = amountPaid,
                paymentDate = Logic.todayIso(),
                paymentMethod = "cash",
                notes = body["notes"] as? String,
                recordedBy = loggedInUserId,
                createdAt = nowIso,
            )
            try {
                val inserted = withContext(Dispatchers.IO) { api.insertPayment(apiKey, auth, body = payment) }
                if (inserted.isNotEmpty()) {
                    _payments.value = listOf(inserted.first()) + _payments.value
                }
            } catch (e: Exception) {
                // non-fatal: booking is still checked out
            }
        }
        return result
    }

    /**
     * Manual / walk-out checkout: creates a booking that is already checked out,
     * mirroring the caretaker manual checkout form on the website.
     */
    suspend fun directCheckout(
        guestName: String,
        organization: String,
        guestType: GuestType,
        roomIds: List<String>,
        checkIn: String,
        checkOut: String,
        notes: String,
        amountPaidInput: Double,
    ): Result<Unit> {
        val days = Logic.calculateDays(checkIn, checkOut)
        val rate = Logic.dailyRate(guestType)
        val rent = rate * days * roomIds.size
        val paid = amountPaidInput.coerceIn(0.0, rent)
        val due = Logic.dueAmount(rent, paid)
        val status = when {
            due <= 0.0 -> PaymentStatus.PAID
            paid > 0.0 -> PaymentStatus.PARTIAL
            else -> PaymentStatus.UNPAID
        }
        val nowIso = OffsetDateTime.now().toString()
        val insert = BookingInsert(
            id = Logic.randomId(),
            bookingDate = Logic.todayIso(),
            guestName = guestName.trim(),
            organization = organization.trim(),
            guestType = guestType,
            roomId = roomIds.first(),
            roomIds = roomIds,
            checkInDate = checkIn,
            checkOutDate = checkOut,
            numberOfDays = days,
            dailyRate = rate,
            totalRent = rent,
            amountPaid = paid,
            dueAmount = due,
            paymentStatus = status,
            bookingStatus = BookingStatus.CHECKED_OUT,
            actualCheckIn = nowIso,
            actualCheckOut = nowIso,
            notes = notes.trim(),
            createdBy = loggedInUserId,
            createdAt = nowIso,
            updatedAt = nowIso,
        )
        return withContext(Dispatchers.IO) {
            try {
                val inserted = api.insertBooking(apiKey, auth, body = insert)
                val saved = if (inserted.isNotEmpty()) inserted.first() else insert.toBooking()
                _bookings.value = listOf(saved) + _bookings.value
                if (paid > 0.0) {
                    try {
                        val payment = Payment(
                            id = Logic.randomId(),
                            bookingId = saved.id,
                            amount = paid,
                            paymentDate = Logic.todayIso(),
                            paymentMethod = "cash",
                            notes = null,
                            recordedBy = loggedInUserId,
                            createdAt = nowIso,
                        )
                        val paymentInserted = api.insertPayment(apiKey, auth, body = payment)
                        if (paymentInserted.isNotEmpty()) {
                            _payments.value = listOf(paymentInserted.first()) + _payments.value
                        }
                    } catch (e: Exception) {
                        // non-fatal: booking is still checked out
                    }
                }
                Result.success(Unit)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun cancelBooking(bookingId: String): Result<Unit> {
        val body = mapOf(
            "booking_status" to BookingStatus.CANCELLED.serialName(),
            "updated_at" to OffsetDateTime.now().toString(),
        )
        return updateBookingApi(bookingId, body) { b ->
            b.copy(bookingStatus = BookingStatus.CANCELLED, updatedAt = body["updated_at"] as String)
        }
    }

    suspend fun setOverride(key: String, value: Double): Result<Unit> {
        _overrides.value = _overrides.value + (key to value)
        return try {
            withContext(Dispatchers.IO) {
                api.upsertOverride(
                    apiKey,
                    auth,
                    body = DashboardOverride(key = key, value = value, updatedBy = loggedInUserId ?: "admin")
                )
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun clearOverride(key: String): Result<Unit> {
        _overrides.value = _overrides.value - key
        return try {
            withContext(Dispatchers.IO) { api.deleteOverride(apiKey, auth, key = key) }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private suspend fun updateBookingApi(
        bookingId: String,
        body: Map<String, Any>,
        localTransform: (Booking) -> Booking,
    ): Result<Unit> {
        _bookings.value = _bookings.value.map { if (it.id == bookingId) localTransform(it) else it }
        return try {
            withContext(Dispatchers.IO) { api.updateBooking(apiKey, auth, id = bookingId, body = body) }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

private fun BookingStatus.serialName(): String = when (this) {
    BookingStatus.BOOKED -> "booked"
    BookingStatus.CHECKED_IN -> "checked_in"
    BookingStatus.CHECKED_OUT -> "checked_out"
    BookingStatus.CANCELLED -> "cancelled"
}

private fun PaymentStatus.serialName(): String = when (this) {
    PaymentStatus.PAID -> "paid"
    PaymentStatus.PARTIAL -> "partial"
    PaymentStatus.UNPAID -> "unpaid"
}

private fun BookingInsert.toBooking(): Booking = Booking(
    id = id,
    bookingDate = bookingDate,
    guestName = guestName,
    organization = organization,
    guestType = guestType,
    roomId = roomId,
    roomIds = roomIds,
    checkInDate = checkInDate,
    checkOutDate = checkOutDate,
    numberOfDays = numberOfDays,
    dailyRate = dailyRate,
    totalRent = totalRent,
    amountPaid = amountPaid,
    dueAmount = dueAmount,
    paymentStatus = paymentStatus,
    bookingStatus = bookingStatus,
    actualCheckIn = actualCheckIn,
    actualCheckOut = actualCheckOut,
    notes = notes,
    createdBy = createdBy,
    createdAt = createdAt,
    updatedAt = updatedAt,
)