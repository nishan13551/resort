package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.GuestType
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.PrimaryButton
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.strings.Tx
import com.dhansiri.resort.ui.strings.guestTypeLabel
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.RedSoft
import com.dhansiri.resort.ui.theme.SlateMuted
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun NewBookingScreen(
    repository: Repository,
    onDone: () -> Unit,
    onSnack: (String) -> Unit,
) {
    val strings = LocalStrings.current
    val lang = LocalLang.current
    val bn = lang == com.dhansiri.resort.ui.strings.Lang.BN
    val scope = rememberCoroutineScope()

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val loading by repository.loading.collectAsState()

    var guestName by remember { mutableStateOf("") }
    var organization by remember { mutableStateOf("") }
    var guestType by remember { mutableStateOf(GuestType.BWDB) }
    var checkIn by remember { mutableStateOf("") }
    var checkOut by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    val selectedRooms = remember { mutableStateListOf<String>() }

    var datePickerTarget by remember { mutableStateOf<String?>(null) }
    var submitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    fun defaultOutIfBlank(): String = if (checkIn.isEmpty()) Logic.todayIso() else Logic.addDaysIso(checkIn, 1)

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { SectionTitle(strings.newBooking) }

        if (loading && rooms.isEmpty()) {
            item { LoadingShimmer() }
        } else {
            item {
                OutlinedTextField(
                    value = guestName,
                    onValueChange = { guestName = it },
                    label = { Text(strings.guestName) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                )
            }
            item {
                OutlinedTextField(
                    value = organization,
                    onValueChange = { organization = it },
                    label = { Text(strings.organization) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                )
            }
            item { SectionTitle(strings.guestType) }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    GuestType.entries.forEach { type ->
                        FilterChip(
                            selected = guestType == type,
                            onClick = { guestType = type },
                            label = { Text(guestTypeLabel(type, bn)) },
                        )
                    }
                }
            }
            item { SectionTitle(strings.selectRoom) }
            item {
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
            }
            if (selectedRooms.isNotEmpty()) {
                item {
                    if (checkIn.isNotEmpty() && checkOut.isNotEmpty()) {
                        val busyCount = selectedRooms.count { roomId ->
                            Logic.detectBookingConflict(bookings, roomId, checkIn, checkOut) != null
                        }
                        if (busyCount > 0) {
                            StatusChip("${strings.roomBusy}: $busyCount", MaterialTheme.colorScheme.error)
                        } else {
                            StatusChip("${strings.selectedRooms}: ${selectedRooms.size}", EmeraldDark)
                        }
                    }
                }
            }
            item { SectionTitle(strings.checkInDate) }
            item {
                DateField(
                    value = checkIn,
                    label = strings.checkInDate,
                    onClick = { datePickerTarget = "in" },
                )
            }
            item { SectionTitle(strings.checkOutDate) }
            item {
                DateField(
                    value = checkOut,
                    label = strings.checkOutDate,
                    onClick = { datePickerTarget = "out" },
                )
            }
            item {
                RentPreview(
                    guestType = guestType,
                    checkIn = checkIn,
                    checkOut = checkOut,
                    roomCount = selectedRooms.size,
                    strings = strings,
                    bn = bn,
                )
            }
            item {
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text(strings.notes) },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    shape = RoundedCornerShape(16.dp),
                )
            }
            item {
                Spacer(Modifier.height(4.dp))
                PrimaryButton(
                    text = strings.createBooking,
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
                                    val result = repository.createBooking(
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
                                        onSnack(strings.bookingCreated)
                                        onDone()
                                    } else {
                                        errorMessage = result.exceptionOrNull()?.message ?: strings.error
                                    }
                                }
                            }
                        }
                    },
                    loading = submitting,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                )
            }
            item { Spacer(Modifier.height(8.dp)) }
        }
    }

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
        val pickerState = rememberDatePickerState(initialSelectedDateMillis = initialMillis)
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
private fun DateField(value: String, label: String, onClick: () -> Unit) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White),
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Default.DateRange, contentDescription = null, tint = Emerald)
            Spacer(Modifier.width(12.dp))
            Text(
                text = if (value.isBlank()) {
                    label
                } else {
                    Logic.formatDate(value, LocalLang.current == com.dhansiri.resort.ui.strings.Lang.BN)
                },
                style = MaterialTheme.typography.bodyLarge,
                color = if (value.isBlank()) SlateMuted else EmeraldDark,
            )
        }
    }
}

@Composable
private fun RentPreview(
    guestType: GuestType,
    checkIn: String,
    checkOut: String,
    roomCount: Int,
    strings: Tx,
    bn: Boolean,
) {
    val rate = Logic.dailyRate(guestType)
    val days = if (checkIn.isNotBlank() && checkOut.isNotBlank()) {
        Logic.calculateDays(checkIn, checkOut).coerceAtLeast(1)
    } else 0
    val rent = rate * days * roomCount
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = RedSoft),
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(strings.rentBreakdown, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.titleSmall)
            Row(Modifier.fillMaxWidth()) {
                Text("${strings.dailyRateLabel} (${guestTypeLabel(guestType, bn)})", Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = SlateMuted)
                Text(Logic.formatCurrency(rate, bn), style = MaterialTheme.typography.bodyMedium)
            }
            Row(Modifier.fillMaxWidth()) {
                Text(strings.numberOfDays, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = SlateMuted)
                Text("$days", style = MaterialTheme.typography.bodyMedium)
            }
            Row(Modifier.fillMaxWidth()) {
                Text(strings.roomCount, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = SlateMuted)
                Text("$roomCount", style = MaterialTheme.typography.bodyMedium)
            }
            Row(Modifier.fillMaxWidth()) {
                Text(strings.totalRent, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                Text(Logic.formatCurrency(rent, bn), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = EmeraldDark)
            }
        }
    }
}