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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.MoveToInbox
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
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.Booking
import com.dhansiri.resort.data.BookingStatus
import com.dhansiri.resort.data.GuestType
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.EmptyState
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.strings.Lang
import com.dhansiri.resort.ui.strings.guestTypeLabel
import com.dhansiri.resort.ui.theme.Amber
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.SlateMuted
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

@Composable
fun CheckinScreen(repository: Repository, onSnack: (String) -> Unit) {
    val strings = LocalStrings.current
    val bn = LocalLang.current == Lang.BN
    val scope = rememberCoroutineScope()

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val loading by repository.loading.collectAsState()

    var pending by remember { mutableStateOf<Booking?>(null) }
    var busy by remember { mutableStateOf(false) }
    var showManual by remember { mutableStateOf(false) }

    val due = remember(bookings) {
        bookings.filter { it.bookingStatus == BookingStatus.BOOKED }
            .sortedWith(compareBy({ it.checkInDate }, { it.createdAt }))
    }

    Box(Modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            SectionTitle(
                strings.checkin,
                modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp),
            )
            if (loading && bookings.isEmpty()) {
                LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(4) { LoadingShimmer() }
                }
            } else if (due.isEmpty()) {
                EmptyState(strings.noBookingsToCheckin)
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 96.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(due, key = { it.id }) { booking ->
                        val today = Logic.todayIso()
                        val tagText = when {
                            booking.checkInDate == today -> strings.todayTag
                            booking.checkInDate < today -> strings.lateTag
                            else -> strings.upcomingTag
                        }
                        val tagColor = when {
                            booking.checkInDate == today -> Emerald
                            booking.checkInDate < today -> Amber
                            else -> SlateMuted
                        }
                        Card(
                            shape = RoundedCornerShape(18.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            modifier = Modifier.fillMaxWidth().clickable { pending = booking },
                        ) {
                            Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.MoveToInbox, contentDescription = null, tint = Amber)
                                    Spacer(Modifier.width(8.dp))
                                    Text(
                                        booking.guestName,
                                        fontWeight = FontWeight.SemiBold,
                                        style = MaterialTheme.typography.bodyLarge,
                                        modifier = Modifier.weight(1f),
                                    )
                                    StatusChip(tagText, tagColor)
                                }
                                Text(
                                    "${Logic.bookingRoomsLabel(booking, rooms)}  •  ${guestTypeLabel(booking.guestType, bn)}" +
                                        (if (booking.organization.isNotBlank()) "  •  ${booking.organization}" else ""),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = SlateMuted,
                                )
                                Text(
                                    "${Logic.formatDate(booking.checkInDate, bn)} → ${Logic.formatDate(booking.checkOutDate, bn)}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = SlateMuted,
                                )
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.fillMaxWidth(),
                                ) {
                                    Text(
                                        "${strings.totalRent}: ${Logic.formatCurrency(booking.totalRent, bn)}",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = EmeraldDark,
                                        modifier = Modifier.weight(1f),
                                    )
                                    Button(
                                        onClick = { pending = booking },
                                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = Emerald),
                                    ) {
                                        Text(strings.checkin)
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
            modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp),
            containerColor = Emerald,
            contentColor = Color.White,
        ) {
            Icon(Icons.Default.Add, contentDescription = strings.newCheckin)
        }
    }

    val target = pending
    if (target != null) {
        AlertDialog(
            onDismissRequest = { if (!busy) pending = null },
            title = { Text(strings.confirmCheckin) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(target.guestName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleSmall)
                    Text(
                        "${Logic.bookingRoomsLabel(target, rooms)}  •  ${guestTypeLabel(target.guestType, bn)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = SlateMuted,
                    )
                    if (target.organization.isNotBlank()) {
                        Text(target.organization, style = MaterialTheme.typography.bodySmall, color = SlateMuted)
                    }
                    Row(Modifier.fillMaxWidth()) {
                        Column(Modifier.weight(1f)) {
                            Text(strings.checkInDate, style = MaterialTheme.typography.labelSmall, color = SlateMuted)
                            Text(Logic.formatDate(target.checkInDate, bn), style = MaterialTheme.typography.bodyMedium)
                        }
                        Column(Modifier.weight(1f)) {
                            Text(strings.checkOutDate, style = MaterialTheme.typography.labelSmall, color = SlateMuted)
                            Text(Logic.formatDate(target.checkOutDate, bn), style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                    Row(Modifier.fillMaxWidth()) {
                        Column(Modifier.weight(1f)) {
                            Text(strings.numberOfDays, style = MaterialTheme.typography.labelSmall, color = SlateMuted)
                            Text("${target.numberOfDays}", style = MaterialTheme.typography.bodyMedium)
                        }
                        Column(Modifier.weight(1f)) {
                            Text(strings.totalRent, style = MaterialTheme.typography.labelSmall, color = SlateMuted)
                            Text(
                                Logic.formatCurrency(target.totalRent, bn),
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldDark,
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(
                    enabled = !busy,
                    onClick = {
                        busy = true
                        scope.launch {
                            val result = repository.checkIn(target.id)
                            busy = false
                            if (result.isSuccess) onSnack(strings.checkinSuccess) else onSnack(strings.error)
                            pending = null
                        }
                    },
                ) { Text(strings.confirm) }
            },
            dismissButton = {
                TextButton(onClick = { pending = null }) { Text(strings.cancel) }
            },
        )
    }

    if (showManual) {
        ManualCheckinDialog(
            repository = repository,
            onDone = { showManual = false },
            onSnack = onSnack,
        )
    }
}

/** Manual walk-in check-in — same guest fields as the booking form, checked in immediately. */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun ManualCheckinDialog(
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
    var datePickerTarget by remember { mutableStateOf<String?>(null) }
    var submitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val rate = Logic.dailyRate(guestType)
    val days = if (checkIn.isNotBlank() && checkOut.isNotBlank()) {
        Logic.calculateDays(checkIn, checkOut).coerceAtLeast(1)
    } else 0
    val rent = rate * days * selectedRooms.size

    fun defaultOutIfBlank(): String = if (checkIn.isEmpty()) Logic.todayIso() else Logic.addDaysIso(checkIn, 1)

    AlertDialog(
        onDismissRequest = { if (!submitting) onDone() },
        title = { Text(strings.newCheckin) },
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
                    GuestType.entries.forEach { type ->
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
                CiDateField(value = checkIn, label = strings.checkInDate, bn = bn) { datePickerTarget = "in" }
                CiDateField(value = checkOut, label = strings.checkOutDate, bn = bn) { datePickerTarget = "out" }
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text(strings.notes) },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                )
                Row(Modifier.fillMaxWidth()) {
                    Text(
                        "${strings.dailyRateLabel} (${guestTypeLabel(guestType, bn)})",
                        Modifier.weight(1f),
                        style = MaterialTheme.typography.bodyMedium,
                        color = SlateMuted,
                    )
                    Text(Logic.formatCurrency(rate, bn), style = MaterialTheme.typography.bodyMedium)
                }
                Row(Modifier.fillMaxWidth()) {
                    Text(strings.numberOfDays, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = SlateMuted)
                    Text("$days", style = MaterialTheme.typography.bodyMedium)
                }
                Row(Modifier.fillMaxWidth()) {
                    Text(strings.roomCount, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = SlateMuted)
                    Text("${selectedRooms.size}", style = MaterialTheme.typography.bodyMedium)
                }
                Row(Modifier.fillMaxWidth()) {
                    Text(
                        strings.totalRent,
                        Modifier.weight(1f),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        Logic.formatCurrency(rent, bn),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldDark,
                    )
                }
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
                                val result = repository.directCheckin(
                                    guestName = guestName,
                                    organization = organization,
                                    guestType = guestType,
                                    roomIds = selectedRooms.toList(),
                                    checkIn = checkIn,
                                    checkOut = checkOut,
                                    notes = notes,
                                )
                                submitting = false
                                if (result.isSuccess) {
                                    onSnack(strings.checkinSuccess)
                                    onDone()
                                } else {
                                    errorMessage = result.exceptionOrNull()?.message ?: strings.error
                                }
                            }
                        }
                    }
                },
            ) { Text(strings.checkin) }
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
private fun CiDateField(value: String, label: String, bn: Boolean, onClick: () -> Unit) {
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
