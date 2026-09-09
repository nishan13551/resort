package com.dhansiri.resort.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

enum class GuestType {
    @SerialName("bwdb") BWDB,
    @SerialName("govt_other") GOVT_OTHER,
    @SerialName("private") PRIVATE,
}

enum class PaymentStatus {
    @SerialName("paid") PAID,
    @SerialName("partial") PARTIAL,
    @SerialName("unpaid") UNPAID,
}

enum class BookingStatus {
    @SerialName("booked") BOOKED,
    @SerialName("checked_in") CHECKED_IN,
    @SerialName("checked_out") CHECKED_OUT,
    @SerialName("cancelled") CANCELLED,
}

enum class UserRole {
    @SerialName("admin") ADMIN,
    @SerialName("caretaker") CARETAKER,
    @SerialName("viewer") VIEWER,
}

@Serializable
data class User(
    val id: String,
    val email: String,
    @SerialName("full_name") val fullName: String = "",
    val role: UserRole = UserRole.VIEWER,
    @SerialName("is_active") val isActive: Boolean = true,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String = "",
)

@Serializable
data class Room(
    val id: String,
    @SerialName("room_number") val roomNumber: String,
    @SerialName("room_name") val roomName: String? = null,
    @SerialName("is_active") val isActive: Boolean = true,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String = "",
)

@Serializable
data class Booking(
    val id: String,
    @SerialName("booking_date") val bookingDate: String,
    @SerialName("guest_name") val guestName: String,
    val organization: String = "",
    @SerialName("guest_type") val guestType: GuestType = GuestType.BWDB,
    @SerialName("room_id") val roomId: String,
    @SerialName("room_ids") val roomIds: List<String> = emptyList(),
    @SerialName("check_in_date") val checkInDate: String,
    @SerialName("check_out_date") val checkOutDate: String,
    @SerialName("number_of_days") val numberOfDays: Int,
    @SerialName("daily_rate") val dailyRate: Double,
    @SerialName("total_rent") val totalRent: Double,
    @SerialName("amount_paid") val amountPaid: Double,
    @SerialName("due_amount") val dueAmount: Double,
    @SerialName("payment_status") val paymentStatus: PaymentStatus = PaymentStatus.UNPAID,
    @SerialName("booking_status") val bookingStatus: BookingStatus = BookingStatus.BOOKED,
    @SerialName("actual_check_in") val actualCheckIn: String? = null,
    @SerialName("actual_check_out") val actualCheckOut: String? = null,
    val notes: String = "",
    @SerialName("created_by") val createdBy: String? = null,
    @SerialName("created_at") val createdAt: String = "",
    @SerialName("updated_at") val updatedAt: String = "",
)

@Serializable
data class Payment(
    val id: String,
    @SerialName("booking_id") val bookingId: String,
    val amount: Double,
    @SerialName("payment_date") val paymentDate: String,
    @SerialName("payment_method") val paymentMethod: String? = null,
    val notes: String? = null,
    @SerialName("recorded_by") val recordedBy: String? = null,
    @SerialName("created_at") val createdAt: String = "",
)

@Serializable
data class DashboardOverride(
    val key: String,
    val value: Double,
    @SerialName("updated_by") val updatedBy: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null,
)

/** Payload used when inserting a booking through PostgREST (excludes computed fields). */
@Serializable
data class BookingInsert(
    val id: String,
    @SerialName("booking_date") val bookingDate: String,
    @SerialName("guest_name") val guestName: String,
    val organization: String,
    @SerialName("guest_type") val guestType: GuestType,
    @SerialName("room_id") val roomId: String,
    @SerialName("room_ids") val roomIds: List<String>,
    @SerialName("check_in_date") val checkInDate: String,
    @SerialName("check_out_date") val checkOutDate: String,
    @SerialName("number_of_days") val numberOfDays: Int,
    @SerialName("daily_rate") val dailyRate: Double,
    @SerialName("total_rent") val totalRent: Double,
    @SerialName("amount_paid") val amountPaid: Double,
    @SerialName("due_amount") val dueAmount: Double,
    @SerialName("payment_status") val paymentStatus: PaymentStatus,
    @SerialName("booking_status") val bookingStatus: BookingStatus,
    @SerialName("actual_check_in") val actualCheckIn: String? = null,
    @SerialName("actual_check_out") val actualCheckOut: String? = null,
    val notes: String,
    @SerialName("created_by") val createdBy: String?,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String,
)

/** Seed users — mirrors src/data/mock-data.ts in the web app. */
object SeedUsers {
    val admin = User(
        id = "u_admin",
        email = "admin@dhansiri.com",
        fullName = "রাসেল (অ্যাডমিন)",
        role = UserRole.ADMIN,
        isActive = true,
    )

    val caretaker = User(
        id = "u_caretaker",
        email = "caretaker@dhansiri.com",
        fullName = "কেয়ারটেকার",
        role = UserRole.CARETAKER,
        isActive = true,
    )

    val all: List<User> = listOf(admin, caretaker)
}

object DemoPasswords {
    val map: Map<String, String> = mapOf(
        "admin@dhansiri.com" to "admin098",
        "caretaker@dhansiri.com" to "caretaker123",
    )
}