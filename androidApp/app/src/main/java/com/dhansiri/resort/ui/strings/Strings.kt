package com.dhansiri.resort.ui.strings

import com.dhansiri.resort.data.BookingStatus
import com.dhansiri.resort.data.GuestType
import com.dhansiri.resort.data.PaymentStatus
import com.dhansiri.resort.data.UserRole

enum class Lang { BN, EN }

/** Static UI strings for both languages. Mirrors src/lib/constants.ts + i18n.tsx keys. */
class Tx(private val bn: Boolean) {

    private fun p(bnText: String, enText: String): String = if (bn) bnText else enText

    val isBn: Boolean get() = bn

    // App / nav
    val appName = p("ধানসিঁড়ি রেস্ট হাউজ", "Dhansiri Rest House")
    val dashboard = p("ড্যাশবোর্ড", "Dashboard")
    val bookings = p("বুকিং", "Bookings")
    val checkin = p("চেক-ইন", "Check-in")
    val checkout = p("চেক-আউট", "Check-out")
    val rooms = p("রুমসমূহ", "Rooms")
    val history = p("বুকিং ইতিহাস", "Booking History")
    val reports = p("রিপোর্ট", "Reports")
    val more = p("আরও", "More")
    val settings = p("সেটিংস", "Settings")
    val newBooking = p("নতুন বুকিং", "New Booking")
    val logout = p("লগআউট", "Logout")

    // Login
    val welcome = p("স্বাগতম", "Welcome")
    val loginSubtitle = p("রেস্ট হাউজ ব্যবস্থাপনায় প্রবেশ করুন", "Sign in to the rest house manager")
    val email = p("ইমেইল", "Email")
    val password = p("পাসওয়ার্ড", "Password")
    val login = p("লগইন", "Sign in")
    val loggingIn = p("প্রবেশ হচ্ছে...", "Signing in...")
    val invalidCredentials = p("ভুল ইমেইল বা পাসওয়ার্ড", "Invalid email or password")
    val accountDisabled = p("অ্যাকাউন্ট নিষ্ক্রিয়", "This account is disabled")

    // Dashboard
    val todayBookings = p("আজকের বুকিং", "Today's Bookings")
    val todayRevenue = p("আজকের আয়", "Today's Revenue")
    val monthRevenue = p("এই মাসের আয়", "Monthly Revenue")
    val totalBookings = p("মোট বুকিং", "Total Bookings")
    val availableRooms = p("খালি রুম", "Available Rooms")
    val bookedRooms = p("বুক করা রুম", "Booked Rooms")
    val occupiedRooms = p("অবস্থানরত রুম", "Occupied Rooms")
    val todaysCheckin = p("আজকের চেক-ইন", "Today's Check-ins")
    val todaysCheckout = p("আজকের চেক-আউট", "Today's Check-outs")
    val roomOverview = p("রুমের অবস্থা", "Room Overview")
    val noCheckins = p("আজ কোনো চেক-ইন নেই", "No check-ins today")
    val noCheckouts = p("আজ কোনো চেক-আউট নেই", "No check-outs today")
    val editValue = p("মান সম্পাদনা", "Edit value")
    val autoValue = p("স্বয়ংক্রিয় মান", "Auto value")
    val overrideValue = p("নতুন মান", "Override value")
    val save = p("সংরক্ষণ করুন", "Save")
    val cancel = p("বাতিল", "Cancel")
    val resetToAuto = p("স্বয়ংক্রিয় মানে ফেরান", "Reset to auto")

    // Bookings
    val guestName = p("অতিথির নাম", "Guest Name")
    val organization = p("প্রতিষ্ঠান/বিভাগ", "Organization")
    val guestType = p("অতিথির ধরন", "Guest Type")
    val checkInDate = p("চেক-ইন তারিখ", "Check-in Date")
    val checkOutDate = p("চেক-আউট তারিখ", "Check-out Date")
    val notes = p("নোট", "Notes")
    val selectRoom = p("রুম নির্বাচন করুন", "Select Rooms")
    val selectedRooms = p("নির্বাচিত রুম", "Selected Rooms")
    val rentBreakdown = p("ভাড়ার হিসাব", "Rent Breakdown")
    val dailyRateLabel = p("দৈনিক ভাড়া", "Daily Rate")
    val numberOfDays = p("দিন সংখ্যা", "Days")
    val roomCount = p("রুম সংখ্যা", "Rooms")
    val totalRent = p("মোট ভাড়া", "Total Rent")
    val amountPaid = p("পরিশোধিত পরিমাণ", "Amount Paid")
    val dueAmount = p("বকেয়া", "Due")
    val paymentStatus = p("পেমেন্ট অবস্থা", "Payment Status")
    val guestNameRequired = p("অতিথির নাম প্রয়োজন", "Guest name is required")
    val roomRequired = p("অন্তত একটি রুম নির্বাচন করুন", "Select at least one room")
    val datesRequired = p("তারিখ প্রয়োজন", "Dates are required")
    val invalidDateRange = p("চেক-আউট তারিখ অবশ্যই চেক-ইন তারিখের পরে হতে হবে", "Check-out must be after check-in")
    val roomBusy = p("রুমটি ইতিমধ্যে বুক করা হয়েছে", "Room is already booked")
    val busy = p("ব্যস্ত", "Busy")

    // Statuses
    val booked = p("বুক করা", "Booked")
    val checkedIn = p("চেক-ইন সম্পন্ন", "Checked in")
    val checkedOut = p("চেক-আউট সম্পন্ন", "Checked out")
    val cancelled = p("বাতিল", "Cancelled")
    val available = p("খালি", "Available")
    val occupied = p("অবস্থানরত", "Occupied")
    val paid = p("পরিশোধিত", "Paid")
    val partial = p("আংশিক", "Partial")
    val unpaid = p("অপরিশোধিত", "Unpaid")
    val active = p("সক্রিয়", "Active")
    val inactive = p("নিষ্ক্রিয়", "Inactive")
    val currentGuest = p("বর্তমান অতিথি", "Current Guest")

    // Check-in / out
    val selectBookingToCheckin = p("চেক-ইনের জন্য বুকিং নির্বাচন করুন", "Select a booking to check in")
    val selectBookingToCheckout = p("চেক-আউটের জন্য বুকিং নির্বাচন করুন", "Select a booking to check out")
    val confirmCheckin = p("চেক-ইন নিশ্চিত করুন", "Confirm check-in")
    val confirmCheckout = p("চেক-আউট নিশ্চিত করুন", "Confirm check-out")
    val checkinSuccess = p("চেক-ইন সফল হয়েছে!", "Checked in!")
    val checkoutSuccess = p("চেক-আউট সফল হয়েছে!", "Checked out!")
    val noBookingsToCheckin = p("চেক-ইনের জন্য কোনো বুকিং নেই", "No bookings to check in")
    val noBookingsToCheckout = p("কোনো সক্রিয় অতিথি নেই", "No active guests")
    val enterPaymentAmount = p("পরিশোধিত পরিমাণ লিখুন", "Enter amount paid")
    val checkOutGuest = p("চেক-আউট", "Check out")
    val confirm = p("নিশ্চিত করুন", "Confirm")
    val newCheckout = p("নতুন চেক-আউট", "New Checkout")
    val newCheckin = p("নতুন চেক-ইন", "New Check-in")
    val bookingDate = p("বুকিং তারিখ", "Booking Date")
    val todayTag = p("আজ", "Today")
    val lateTag = p("দেরি", "Late")
    val upcomingTag = p("আসন্ন", "Upcoming")

    // Common
    val loading = p("লোড হচ্ছে...", "Loading...")
    val refreshing = p("রিফ্রেশ হচ্ছে...", "Refreshing...")
    val noData = p("কোনো তথ্য নেই", "No data")
    val search = p("অনুসন্ধান", "Search")
    val total = p("মোট", "Total")
    val delete = p("মুছুন", "Delete")
    val error = p("ত্রুটি", "Error")
    val retry = p("আবার চেষ্টা করুন", "Retry")
    val language = p("ভাষা", "Language")
    val bengali = p("বাংলা", "Bengali")
    val english = p("English", "English")
    val guest = p("অতিথি", "Guest")
    val daysShort = p("দিন", "days")
    val roomsLabel = p("রুম", "Room")
    val perDay = p("/দিন", "/day")
    val close = p("বন্ধ করুন", "Close")

    // Reports
    val totalRevenue = p("মোট আয়", "Total Revenue")
    val totalCollected = p("মোট সংগ্রহ", "Collected")
    val totalDue = p("মোট বকেয়া", "Total Due")
    val recentPayments = p("সাম্প্রতিক পেমেন্ট", "Recent Payments")

    val currencySymbol = "৳"
}

fun guestTypeLabel(type: GuestType, bn: Boolean): String = when (type) {
    GuestType.BWDB -> if (bn) "বিডব্লিউডিবি" else "BWDB"
    GuestType.GOVT_OTHER -> if (bn) "অন্যান্য সরকারি অফিস" else "Other Govt. Office"
    GuestType.PRIVATE -> if (bn) "এনজিও / সাধারণ" else "NGO / General"
    GuestType.NGO -> if (bn) "এনজিও" else "NGO"
    GuestType.GENERAL -> if (bn) "সাধারণ" else "General"
}

fun guestTypeName(type: GuestType): String = when (type) {
    GuestType.BWDB -> "bwdb"
    GuestType.GOVT_OTHER -> "govt_other"
    GuestType.PRIVATE -> "private"
    GuestType.NGO -> "ngo"
    GuestType.GENERAL -> "general"
}

fun bookingStatusLabel(status: BookingStatus, bn: Boolean): String = when (status) {
    BookingStatus.BOOKED -> if (bn) "বুক করা" else "Booked"
    BookingStatus.CHECKED_IN -> if (bn) "চেক-ইন" else "Checked in"
    BookingStatus.CHECKED_OUT -> if (bn) "চেক-আউট" else "Checked out"
    BookingStatus.CANCELLED -> if (bn) "বাতিল" else "Cancelled"
}

fun roomStatusLabel(status: String, bn: Boolean): String = when (status) {
    "available" -> if (bn) "খালি" else "Available"
    "booked" -> if (bn) "বুক করা" else "Booked"
    "occupied" -> if (bn) "অবস্থানরত" else "Occupied"
    else -> status
}

fun paymentStatusLabel(status: PaymentStatus, bn: Boolean): String = when (status) {
    PaymentStatus.PAID -> if (bn) "পরিশোধিত" else "Paid"
    PaymentStatus.PARTIAL -> if (bn) "আংশিক" else "Partial"
    PaymentStatus.UNPAID -> if (bn) "অপরিশোধিত" else "Unpaid"
}

fun roleLabel(role: UserRole, bn: Boolean): String = when (role) {
    UserRole.ADMIN -> if (bn) "অ্যাডমিন" else "Admin"
    UserRole.CARETAKER -> if (bn) "কেয়ারটেকার" else "Caretaker"
    UserRole.VIEWER -> if (bn) "দর্শক" else "Viewer"
}