package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.Booking
import com.dhansiri.resort.data.BookingStatus
import com.dhansiri.resort.data.GuestType
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.PaymentStatus
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.EmptyState
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.strings.Lang
import com.dhansiri.resort.ui.strings.Tx
import com.dhansiri.resort.ui.strings.bookingStatusLabel
import com.dhansiri.resort.ui.strings.guestTypeLabel
import com.dhansiri.resort.ui.strings.paymentStatusLabel
import com.dhansiri.resort.ui.theme.Amber
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.SlateMuted
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

@Composable
fun CheckoutScreen(
    repository: Repository,
    onSnack: (String) -> Unit,
    isAdmin: Boolean = true,
    onLogout: () -> Unit = {},
) {
    val strings = LocalStrings.current
    val bn = LocalLang.current == Lang.BN
    val scope = rememberCoroutineScope()

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val loading by repository.loading.collectAsState()

    var pending by remember { mutableStateOf<Booking?>(null) }
    var amountText by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var showManual by remember { mutableStateOf(false) }

    val active = remember(bookings) {
        bookings.filter {
            it.bookingStatus == BookingStatus.BOOKED || it.bookingStatus == BookingStatus.CHECKED_IN
        }.sortedBy { it.checkOutDate }
    }

    fun openCheckout(booking: Booking) {
        pending = booking
        amountText = booking.amountPaid.toLong().toString()
    }

    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(start = 16.dp, end = 8.dp, top = 12.dp, bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                SectionTitle(strings.checkout, modifier = Modifier.weight(1f))
                if (!isAdmin) {
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.Logout, contentDescription = strings.logout, tint = SlateMuted)
                    }
                }
            }
            if (loading && bookings.isEmpty()) {
                LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(4) { LoadingShimmer() }
                }
            } else if (active.isEmpty()) {
                EmptyState(strings.noBookingsToCheckout)
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 96.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(active, key = { it.id }) { booking ->
                        val chipColor =
                            if (booking.bookingStatus == BookingStatus.BOOKED) Amber else MaterialTheme.colorScheme.error
                        Card(
                            shape = RoundedCornerShape(18.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            modifier = Modifier.fillMaxWidth().clickable { openCheckout(booking) },
                        ) {
                            Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        booking.guestName,
                                        fontWeight = FontWeight.SemiBold,
                                        style = MaterialTheme.typography.bodyLarge,
                                        modifier = Modifier.weight(1f),
                                    )
                                    StatusChip(bookingStatusLabel(booking.bookingStatus, bn), chipColor)
                                }
                                Text(
                                    "${Logic.bookingRoomsLabel(booking, rooms)}  •  ${guestTypeLabel(booking.guestType, bn)}" +
                                        (if (booking.organization.isNotBlank()) "  •  ${booking.organization}" else ""),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = SlateMuted,
                                )
                                Text(
                                    "${strings.checkOutDate}: ${Logic.formatDate(booking.checkOutDate, bn)}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = SlateMuted,
                                )
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.fillMaxWidth(),
                                ) {
                                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                        Text(
                                            "${strings.totalRent}: ${Logic.formatCurrency(booking.totalRent, bn)}",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = EmeraldDark,
                                        )
                                        Text(
                                            "${strings.dueAmount}: ${Logic.formatCurrency(booking.dueAmount, bn)}",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = SlateMuted,
                                        )
                                    }
                                    Button(
                                        onClick = { openCheckout(booking) },
                                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = Emerald),
                                    ) {
                                        Text(strings.checkOutGuest)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = { showManual = true },
            modifier = Modifier.align(Alignment.BottomEnd).padding(end = 20.dp, bottom = 100.dp),
            containerColor = Emerald,
            contentColor = Color.White,
        ) {
            Icon(Icons.Default.Add, contentDescription = strings.newCheckout)
        }
    }

    val target = pending
    if (target != null) {
        val parsedPaid = amountText.toDoubleOrNull() ?: 0.0
        val paid = parsedPaid.coerceIn(0.0, target.totalRent)
        val due = Logic.dueAmount(target.totalRent, paid)
        val status = when {
            due <= 0.0 -> PaymentStatus.PAID
            paid > 0.0 -> PaymentStatus.PARTIAL
            else -> PaymentStatus.UNPAID
        }
        AlertDialog(
            onDismissRequest = { if (!busy) pending = null },
            title = { Text("${strings.checkout} - ${target.guestName}") },
            text = {
                Column(
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        "${guestTypeLabel(target.guestType, bn)}  •  ${strings.roomsLabel}: ${Logic.bookingRoomsLabel(target, rooms)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = SlateMuted,
                    )
                    if (target.organization.isNotBlank()) {
                        Text(target.organization, style = MaterialTheme.typography.bodySmall, color = SlateMuted)
                    }
                    InfoRow(strings.bookingDate, Logic.formatDate(target.bookingDate, bn))
                    InfoRow(strings.checkInDate, Logic.formatDate(target.checkInDate, bn))
                    InfoRow(strings.checkOutDate, Logic.formatDate(target.checkOutDate, bn))
                    InfoRow(strings.numberOfDays, "${target.numberOfDays}")
                    InfoRow(strings.dailyRateLabel, Logic.formatCurrency(target.dailyRate, bn))
                    Text(
                        "${Logic.formatCurrency(target.dailyRate, bn)} × ${target.numberOfDays} × ${Logic.bookingRoomsOf(target).size} = ${Logic.formatCurrency(target.totalRent, bn)}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldDark,
                    )
                    if (target.notes.isNotBlank()) {
                        Text(target.notes, style = MaterialTheme.typography.bodySmall, color = SlateMuted)
                    }
                    OutlinedTextField(
                        value = amountText,
                        onValueChange = { amountText = it.filter { c -> c.isDigit() } },
                        label = { Text(strings.enterPaymentAmount) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                    )
                    MoneyBoxes(paid = paid, due = due, total = target.totalRent, strings = strings, bn = bn)
                    Text(
                        "${strings.paymentStatus}: ${paymentStatusLabel(status, bn)}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                    )
                }
            },
            confirmButton = {
                TextButton(
                    enabled = !busy,
                    onClick = {
                        busy = true
                        scope.launch {
                            val result = repository.checkOut(target.id, paid)
                            busy = false
                            if (result.isSuccess) onSnack(strings.checkoutSuccess) else onSnack(strings.error)
                            pending = null
                        }
                    },
                ) { Text(strings.checkOutGuest) }
            },
            dismissButton = {
                TextButton(onClick = { pending = null }) { Text(strings.cancel) }
            },
        )
    }

    if (showManual) {
        ManualCheckoutDialog(
            repository = repository,
            onDone = { showManual = false },
            onSnack = onSnack,
        )
    }
}

@Composable
private fun InfoRow(label: String, value: String, valueColor: Color = MaterialTheme.colorScheme.onSurface) {
    Row(Modifier.fillMaxWidth()) {
        Text(label, Modifier.weight(1f), style = MaterialTheme.typography.bodySmall, color = SlateMuted)
        Text(value, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Medium, color = valueColor)
    }
}

@Composable
private fun MoneyBoxes(total: Double, paid: Double, due: Double, strings: Tx, bn: Boolean) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        MoneyBox(strings.totalRent, Logic.formatCurrency(total, bn), MaterialTheme.colorScheme.onSurface, Modifier.weight(1f))
        MoneyBox(strings.paid, Logic.formatCurrency(paid, bn), EmeraldDark, Modifier.weight(1f))
        MoneyBox(strings.dueAmount, Logic.formatCurrency(due, bn), MaterialTheme.colorScheme.error, Modifier.weight(1f))
    }
}

@Composable
private fun MoneyBox(label: String, value: String, valueColor: Color, modifier: Modifier = Modifier) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = modifier,
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp, horizontal = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = SlateMuted)
            Text(value, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = valueColor)
        }
    }
}

/** Manual walk-out checkout — mirrors the caretaker manual checkout form on the website. */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun ManualCheckoutDialog(
    repository: Repository,
    onDone: () -> Unit,
    onSnack: (String) -> Unit,
) {
    val strings = LocalStrings.current
    val bn = LocalLang.current == Lang.BN
    val scope = rememberCoroutineScope()

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()

    var guestName by remember { mutableStateOf("") }
    var organization by remember { mutableStateOf("") }
    var guestType by remember { mutableStateOf(GuestType.BWDB) }
    var checkIn by remember { mutableStateOf(Logic.todayIso()) }
    var checkOut by remember { mutableStateOf(Logic.addDaysIso(Logic.todayIso(), 1)) }
    var notes by remember { mutableStateOf("") }
    val selectedRooms = remember { mutableStateListOf<String>() }
    var amountText by remember { mutableStateOf("0") }
    var datePickerTarget by remember { mutableStateOf<String?>(null) }
    var submitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val rate = Logic.dailyRate(guestType)
    val days = if (checkIn.isNotBlank() && checkOut.isNotBlank()) {
        Logic.calculateDays(checkIn, checkOut).coerceAtLeast(1)
    } else 0
    val rent = rate * days * selectedRooms.size
    val paid = (amountText.toDoubleOrNull() ?: 0.0).coerceIn(0.0, rent)
    val due = Logic.dueAmount(rent, paid)
    val status = when {
        due <= 0.0 -> PaymentStatus.PAID
        paid > 0.0 -> PaymentStatus.PARTIAL
        else -> PaymentStatus.UNPAID
    }

    fun defaultOutIfBlank(): String = if (checkIn.isEmpty()) Logic.todayIso() else Logic.addDaysIso(checkIn, 1)

    AlertDialog(
        onDismissRequest = { if (!submitting) onDone() },
        title = { Text(strings.newCheckout) },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                OutlinedTextField(
                    value = guestName,
                    onValueChange = { guestName = it },
                    label = { Text(strings.guestName) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = organization,
                    onValueChange = { organization = it },
                    label = { Text(strings.organization) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Text(strings.guestType, style = MaterialTheme.typography.labelLarge)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    GuestType.entries.filter { it != GuestType.PRIVATE }.forEach { type ->
                        FilterChip(
                            selected = guestType == type,
                            onClick = { guestType = type },
                            label = { Text(guestTypeLabel(type, bn)) },
                        )
                    }
                }
                Text(strings.selectRoom, style = MaterialTheme.typography.labelLarge)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    rooms.filter { it.isActive }.forEach { room ->
                        FilterChip(
                            selected = selectedRooms.contains(room.id),
                            onClick = {
                                if (selectedRooms.contains(room.id)) selectedRooms.remove(room.id)
                                else selectedRooms.add(room.id)
                            },
                            label = { Text(room.roomNumber) },
                        )
                    }
                }
                if (selectedRooms.isNotEmpty() && checkIn.isNotEmpty() && checkOut.isNotEmpty()) {
                    val busyCount = selectedRooms.count { roomId ->
                        Logic.detectBookingConflict(bookings, roomId, checkIn, checkOut) != null
                    }
                    if (busyCount > 0) {
                        StatusChip("${strings.roomBusy}: $busyCount", MaterialTheme.colorScheme.error)
                    } else {
                        StatusChip("${strings.selectedRooms}: ${selectedRooms.size}", EmeraldDark)
                    }
                }
                CoDateField(value = checkIn, label = strings.checkInDate, bn = bn) { datePickerTarget = "in" }
                CoDateField(value = checkOut, label = strings.checkOutDate, bn = bn) { datePickerTarget = "out" }
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text(strings.notes) },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                )
                InfoRow("${strings.dailyRateLabel} (${guestTypeLabel(guestType, bn)})", Logic.formatCurrency(rate, bn))
                InfoRow(strings.numberOfDays, "$days")
                InfoRow(strings.roomCount, "${selectedRooms.size}")
                InfoRow(strings.totalRent, Logic.formatCurrency(rent, bn), EmeraldDark)
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it.filter { c -> c.isDigit() } },
                    label = { Text(strings.enterPaymentAmount) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                )
                MoneyBoxes(total = rent, paid = paid, due = due, strings = strings, bn = bn)
                Text(
                    "${strings.paymentStatus}: ${paymentStatusLabel(status, bn)}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                )
            }
        },
        confirmButton = {
            TextButton(
                enabled = !submitting,
                onClick = {
                    when {
                        guestName.isBlank() -> errorMessage = strings.guestNameRequired
                        selectedRooms.isEmpty() -> errorMessage = strings.roomRequired
                        checkIn.isBlank() || checkOut.isBlank() -> errorMessage = strings.datesRequired
                        Logic.calculateDays(checkIn, checkOut) < 1 -> errorMessage = strings.invalidDateRange
                        selectedRooms.any { Logic.detectBookingConflict(bookings, it, checkIn, checkOut) != null } ->
                            errorMessage = strings.roomBusy
                        else -> {
                            submitting = true
                            scope.launch {
                                val result = repository.directCheckout(
                                    guestName = guestName,
                                    organization = organization,
                                    guestType = guestType,
                                    roomIds = selectedRooms.toList(),
                                    checkIn = checkIn,
                                    checkOut = checkOut,
                                    notes = notes,
                                    amountPaidInput = amountText.toDoubleOrNull() ?: 0.0,
                                )
                                submitting = false
                                if (result.isSuccess) {
                                    onSnack(strings.checkoutSuccess)
                                    onDone()
                                } else {
                                    errorMessage = result.exceptionOrNull()?.message ?: strings.error
                                }
                            }
                        }
                    }
                },
            ) { Text(strings.checkOutGuest) }
        },
        dismissButton = {
            TextButton(onClick = { if (!submitting) onDone() }) { Text(strings.cancel) }
        },
    )

    val target = datePickerTarget
    if (target != null) {
        val initialIso = when (target) {
            "in" -> checkIn.ifBlank { Logic.todayIso() }
            else -> checkOut.ifBlank { defaultOutIfBlank() }
        }
        val initialMillis = try {
            LocalDate.parse(initialIso).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
        val pickerState = androidx.compose.material3.rememberDatePickerState(initialSelectedDateMillis = initialMillis)
        DatePickerDialog(
            onDismissRequest = { datePickerTarget = null },
            confirmButton = {
                TextButton(
                    onClick = {
                        val millis = pickerState.selectedDateMillis
                        if (millis != null) {
                            val iso = Instant.ofEpochMilli(millis).atZone(ZoneOffset.UTC).toLocalDate().toString()
                            if (target == "in") checkIn = iso else checkOut = iso
                        }
                        datePickerTarget = null
                    },
                ) { Text(strings.save) }
            },
            dismissButton = {
                TextButton(onClick = { datePickerTarget = null }) { Text(strings.cancel) }
            },
        ) {
            DatePicker(state = pickerState)
        }
    }

    val message = errorMessage
    if (message != null) {
        AlertDialog(
            onDismissRequest = { errorMessage = null },
            confirmButton = { TextButton(onClick = { errorMessage = null }) { Text(strings.close) } },
            title = { Text(strings.error) },
            text = { Text(message) },
        )
    }
}

@Composable
private fun CoDateField(value: String, label: String, bn: Boolean, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Default.DateRange, contentDescription = null, tint = Emerald)
            Spacer(Modifier.width(12.dp))
            Text(
                text = if (value.isBlank()) label else Logic.formatDate(value, bn),
                style = MaterialTheme.typography.bodyLarge,
                color = if (value.isBlank()) SlateMuted else EmeraldDark,
            )
        }
    }
}
