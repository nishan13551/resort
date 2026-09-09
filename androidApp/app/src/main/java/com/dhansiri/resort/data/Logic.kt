package com.dhansiri.resort.data

import java.text.NumberFormat
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale
import java.util.UUID

/** Mirrors src/lib/utils.ts, rent-calculator.ts, conflict-detector.ts, use-dashboard-data.ts. */
object Logic {

    fun todayIso(): String = LocalDate.now().toString()

    fun monthStartIso(): String = LocalDate.now().withDayOfMonth(1).toString()

    fun monthEndIso(): String = LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1).toString()

    fun addDaysIso(dateIso: String, days: Long): String =
        LocalDate.parse(dateIso).plusDays(days).toString()

    fun calculateDays(checkIn: String, checkOut: String): Int {
        val days = try {
            ChronoUnit.DAYS.between(LocalDate.parse(checkIn), LocalDate.parse(checkOut))
        } catch (e: Exception) {
            0
        }
        return days.toInt().coerceAtLeast(1)
    }

    fun datesOverlap(s1: String, e1: String, s2: String, e2: String): Boolean {
        return try {
            LocalDate.parse(s1).isBefore(LocalDate.parse(e2)) &&
                LocalDate.parse(s2).isBefore(LocalDate.parse(e1))
        } catch (e: Exception) {
            false
        }
    }

    val guestTypeRates: Map<GuestType, Double> = mapOf(
        GuestType.BWDB to 70.0,
        GuestType.GOVT_OTHER to 280.0,
        GuestType.PRIVATE to 600.0,
        GuestType.NGO to 600.0,
        GuestType.GENERAL to 600.0,
    )

    fun dailyRate(guestType: GuestType): Double = guestTypeRates[guestType] ?: 0.0

    fun totalRent(guestType: GuestType, days: Int): Double = dailyRate(guestType) * days

    fun dueAmount(totalRent: Double, amountPaid: Double): Double =
        (totalRent - amountPaid).coerceAtLeast(0.0)

    fun coversRoom(booking: Booking, roomId: String): Boolean =
        booking.roomId == roomId || booking.roomIds.contains(roomId)

    fun detectBookingConflict(
        bookings: List<Booking>,
        roomId: String,
        checkIn: String,
        checkOut: String,
        excludeBookingId: String? = null,
    ): Booking? {
        return bookings.firstOrNull { b ->
            if (excludeBookingId != null && b.id == excludeBookingId) return@firstOrNull false
            if (!coversRoom(b, roomId)) return@firstOrNull false
            if (b.bookingStatus == BookingStatus.CANCELLED) return@firstOrNull false
            datesOverlap(b.checkInDate, b.checkOutDate, checkIn, checkOut)
        }
    }

    fun bookingRoomsOf(booking: Booking): List<String> =
        if (booking.roomIds.isNotEmpty()) booking.roomIds else listOf(booking.roomId)

    fun bookingRoomsLabel(booking: Booking, rooms: List<Room>): String {
        val byId = rooms.associateBy { it.id }
        return bookingRoomsOf(booking)
            .mapNotNull { byId[it]?.roomNumber }
            .ifEmpty { listOf(booking.roomId) }
            .joinToString(", ")
    }

    fun computeRoomStatus(roomId: String, bookings: List<Booking>): String {
        val today = todayIso()
        val active = bookings.filter {
            coversRoom(it, roomId) &&
                (it.bookingStatus == BookingStatus.BOOKED || it.bookingStatus == BookingStatus.CHECKED_IN) &&
                it.checkInDate <= today && it.checkOutDate >= today
        }
        if (active.isEmpty()) return "available"
        return if (active.any { it.bookingStatus == BookingStatus.CHECKED_IN }) "occupied" else "booked"
    }

    fun currentBookingFor(roomId: String, bookings: List<Booking>): Booking? {
        val today = todayIso()
        return bookings.firstOrNull {
            coversRoom(it, roomId) &&
                (it.bookingStatus == BookingStatus.BOOKED || it.bookingStatus == BookingStatus.CHECKED_IN) &&
                it.checkInDate <= today && it.checkOutDate >= today
        }
    }

    data class DashboardStats(
        val todayBookings: Int,
        val todayRevenue: Double,
        val monthRevenue: Double,
        val totalBookings: Int,
        val availableRooms: Int,
        val bookedRooms: Int,
        val occupiedRooms: Int,
    )

    fun dashboardStats(bookings: List<Booking>, rooms: List<Room>): DashboardStats {
        val today = todayIso()
        val mStart = monthStartIso()
        val mEnd = monthEndIso()

        val todayBookingsArr = bookings.filter { it.bookingDate == today }
        val todayRevenue = todayBookingsArr.sumOf { it.totalRent }
        val monthRevenue = bookings
            .filter { !(it.checkOutDate < mStart || it.checkInDate > mEnd) }
            .sumOf { it.totalRent }

        var available = 0
        var booked = 0
        var occupied = 0
        rooms.filter { it.isActive }.forEach { room ->
            when (computeRoomStatus(room.id, bookings)) {
                "available" -> available++
                "booked" -> booked++
                "occupied" -> occupied++
            }
        }

        return DashboardStats(
            todayBookings = todayBookingsArr.size,
            todayRevenue = todayRevenue,
            monthRevenue = monthRevenue,
            totalBookings = bookings.size,
            availableRooms = available,
            bookedRooms = booked,
            occupiedRooms = occupied,
        )
    }

    fun randomId(): String = UUID.randomUUID().toString()

    // ---------- formatting ----------
    private val bnMonths = listOf(
        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
    )

    fun formatCurrency(amount: Double, bengali: Boolean): String {
        val formatted = NumberFormat.getNumberInstance(if (bengali) Locale.forLanguageTag("bn-BD") else Locale.ENGLISH)
            .format(amount.toLong())
        return "৳$formatted"
    }

    fun formatDate(dateIso: String, bengali: Boolean): String {
        if (dateIso.isBlank()) return ""
        return try {
            val d = LocalDate.parse(dateIso.take(10))
            if (bengali) {
                "${d.dayOfMonth} ${bnMonths[d.monthValue - 1]}, ${d.year}"
            } else {
                val formatter = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH)
                d.format(formatter)
            }
        } catch (e: Exception) {
            dateIso
        }
    }

    fun formatDateShort(dateIso: String): String {
        if (dateIso.isBlank()) return ""
        return try {
            val d = LocalDate.parse(dateIso.take(10))
            d.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        } catch (e: Exception) {
            dateIso
        }
    }

    fun formatDateTime(dateIso: String, bengali: Boolean): String {
        if (dateIso.isBlank()) return ""
        return try {
            val zdt = java.time.OffsetDateTime.parse(dateIso)
                .atZoneSameInstant(ZoneId.systemDefault())
            if (bengali) {
                "${formatDate(zdt.toLocalDate().toString(), true)} ${zdt.format(DateTimeFormatter.ofPattern("hh:mm a"))}"
            } else {
                zdt.format(DateTimeFormatter.ofPattern("dd MMM hh:mm a", Locale.ENGLISH))
            }
        } catch (e: Exception) {
            dateIso
        }
    }
}