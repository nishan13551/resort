package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.DoorFront
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.HomeWork
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.TravelExplore
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.Booking
import com.dhansiri.resort.data.BookingStatus
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.data.Room
import com.dhansiri.resort.data.User
import com.dhansiri.resort.data.UserRole
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.EmptyState
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.components.StatCard
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.strings.Tx
import com.dhansiri.resort.ui.theme.AmberSoft
import com.dhansiri.resort.ui.theme.BlueSoft
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.EmeraldSoft
import com.dhansiri.resort.ui.theme.PurpleSoft
import com.dhansiri.resort.ui.theme.RedSoft
import com.dhansiri.resort.ui.theme.SlateMuted
import com.dhansiri.resort.ui.theme.SlateSoft
import kotlinx.coroutines.launch

private data class StatSpec(
    val key: String,
    val label: String,
    val tint: Color,
    val icon: ImageVector,
)

@Composable
fun DashboardScreen(repository: Repository, user: User, onSnack: (String) -> Unit) {
    val strings = LocalStrings.current
    val lang = LocalLang.current
    val bn = lang == com.dhansiri.resort.ui.strings.Lang.BN
    val scope = rememberCoroutineScope()

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val overrides by repository.overrides.collectAsState()
    val loading by repository.loading.collectAsState()

    val stats = remember(bookings, rooms) { Logic.dashboardStats(bookings, rooms) }
    val today = Logic.todayIso()

    val todaysCheckins = bookings.filter { it.actualCheckIn?.take(10) == today }
    val todaysCheckouts = bookings.filter { it.actualCheckOut?.take(10) == today }

    var editingKey by remember { mutableStateOf<String?>(null) }
    var draft by remember { mutableStateOf("") }

    val isAdmin = user.role == UserRole.ADMIN

    val specs = listOf(
        StatSpec("todayBookings", strings.todayBookings, BlueSoft, Icons.Default.EventNote),
        StatSpec("todayRevenue", strings.todayRevenue, EmeraldSoft, Icons.Default.AccountBalanceWallet),
        StatSpec("monthRevenue", strings.monthRevenue, AmberSoft, Icons.Default.TrendingUp),
        StatSpec("totalBookings", strings.totalBookings, PurpleSoft, Icons.Default.HomeWork),
        StatSpec("availableRooms", strings.availableRooms, SlateSoft, Icons.Default.DoorFront),
        StatSpec("bookedRooms", strings.bookedRooms, SlateSoft, Icons.Default.CalendarMonth),
        StatSpec("occupiedRooms", strings.occupiedRooms, RedSoft, Icons.Default.TravelExplore),
    )

    fun autoValueOf(key: String, raw: Double): String {
        if (key == "todayRevenue" || key == "monthRevenue") return Logic.formatCurrency(raw, bn)
        return raw.toLong().toString()
    }

    fun autoRaw(key: String): Double = when (key) {
        "todayBookings" -> stats.todayBookings.toDouble()
        "todayRevenue" -> stats.todayRevenue
        "monthRevenue" -> stats.monthRevenue
        "totalBookings" -> stats.totalBookings.toDouble()
        "availableRooms" -> stats.availableRooms.toDouble()
        "bookedRooms" -> stats.bookedRooms.toDouble()
        "occupiedRooms" -> stats.occupiedRooms.toDouble()
        else -> 0.0
    }

    fun displayValue(key: String): String {
        val overridden = overrides[key]
        return if (overridden != null) {
            if (key == "todayRevenue" || key == "monthRevenue") Logic.formatCurrency(overridden, bn)
            else overridden.toLong().toString()
        } else {
            autoValueOf(key, autoRaw(key))
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Column {
                Text(strings.dashboard, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text(
                    Logic.formatDate(today, bn),
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted,
                )
            }
        }

        if (loading) {
            items(4) { LoadingShimmer() }
        } else {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    specs.chunked(2).forEach { rowSpecs ->
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            rowSpecs.forEach { spec ->
                                val hasOverride = overrides[spec.key] != null
                                com.dhansiri.resort.ui.components.StatCard(
                                    modifier = Modifier.weight(1f),
                                    label = spec.label,
                                    value = displayValue(spec.key),
                                    tint = spec.tint,
                                    icon = { Icon(spec.icon, contentDescription = null, tint = EmeraldDark) },
                                    isOverridden = hasOverride,
                                    onClick = if (isAdmin) {
                                        {
                                            draft = autoRaw(spec.key).toLong().toString()
                                            editingKey = spec.key
                                        }
                                    } else null,
                                )
                            }
                        }
                    }
                }
            }

            item {
                SectionTitle(strings.roomOverview)
            }

            item {
                RoomOverviewCard(
                    bookings = bookings,
                    rooms = rooms,
                    strings = strings,
                    bn = bn,
                )
            }

            item {
                SectionTitle(strings.todaysCheckin)
            }
            item {
                TodayList(
                    entries = todaysCheckins,
                    empty = strings.noCheckins,
                    rooms = rooms,
                    strings = strings,
                    bn = bn,
                )
            }
            item {
                SectionTitle(strings.todaysCheckout)
            }
            item {
                TodayList(
                    entries = todaysCheckouts,
                    empty = strings.noCheckouts,
                    rooms = rooms,
                    strings = strings,
                    bn = bn,
                )
            }
            item { Spacer(Modifier.height(8.dp)) }
        }
    }

    if (editingKey != null && isAdmin) {
        val key = editingKey ?: return
        val hasOverride = overrides[key] != null
        val autoLabel = autoValueOf(key, autoRaw(key))
        val isCurrency = key == "todayRevenue" || key == "monthRevenue"
        EditOverrideDialog(
            strings = strings,
            title = specs.first { it.key == key }.label,
            autoValue = autoLabel,
            isCurrency = isCurrency,
            hasOverride = hasOverride,
            draft = draft,
            onDraftChange = { draft = it },
            onCancel = { editingKey = null },
            onSave = {
                val value = draft.toDoubleOrNull()
                if (value != null) {
                    scope.launch {
                        repository.setOverride(key, value)
                        onSnack(strings.save)
                    }
                }
                editingKey = null
            },
            onReset = {
                scope.launch { repository.clearOverride(key) }
                editingKey = null
            },
        )
    }
}

@Composable
private fun RoomOverviewCard(
    bookings: List<Booking>,
    rooms: List<Room>,
    strings: Tx,
    bn: Boolean,
) {
    val stats = logicRoomCounts(bookings, rooms)
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatusChip("${strings.available}: ${stats["available"] ?: 0}", Emerald)
                StatusChip("${strings.booked}: ${stats["booked"] ?: 0}", androidx.compose.material3.MaterialTheme.colorScheme.primary)
                StatusChip("${strings.occupied}: ${stats["occupied"] ?: 0}", androidx.compose.material3.MaterialTheme.colorScheme.error)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                StatusChip(
                    "${strings.todaysCheckin}: ${bookings.count { it.actualCheckIn?.take(10) == Logic.todayIso() }}",
                    EmeraldDark,
                )
                StatusChip(
                    "${strings.todaysCheckout}: ${bookings.count { it.actualCheckOut?.take(10) == Logic.todayIso() }}",
                    SlateMuted,
                )
            }
        }
    }
}

private fun logicRoomCounts(bookings: List<Booking>, rooms: List<Room>): Map<String, Int> {
    val out = mutableMapOf("available" to 0, "booked" to 0, "occupied" to 0)
    rooms.filter { it.isActive }.forEach { room ->
        val s = Logic.computeRoomStatus(room.id, bookings)
        out[s] = (out[s] ?: 0) + 1
    }
    return out
}

@Composable
private fun TodayList(
    entries: List<Booking>,
    empty: String,
    rooms: List<Room>,
    strings: Tx,
    bn: Boolean,
) {
    if (entries.isEmpty()) {
        EmptyState(empty)
        return
    }
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        entries.forEach { b ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        Icons.Default.CalendarMonth,
                        contentDescription = null,
                        tint = Emerald,
                    )
                    Spacer(Modifier.size(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(b.guestName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium)
                        Text(
                            "${Logic.bookingRoomsLabel(b, rooms)}  •  ${Logic.formatDate(b.checkInDate, bn)}",
                            style = MaterialTheme.typography.labelMedium,
                            color = SlateMuted,
                        )
                    }
                    Text(
                        Logic.formatCurrency(b.totalRent, bn),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = EmeraldDark,
                    )
                }
            }
        }
    }
}

@Composable
private fun EditOverrideDialog(
    strings: Tx,
    title: String,
    autoValue: String,
    isCurrency: Boolean,
    hasOverride: Boolean,
    draft: String,
    onDraftChange: (String) -> Unit,
    onCancel: () -> Unit,
    onSave: () -> Unit,
    onReset: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onCancel,
        title = { Text(strings.editValue) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    "${title} — ${strings.autoValue}: $autoValue",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted,
                )
                OutlinedTextField(
                    value = draft,
                    onValueChange = { onDraftChange(it.filter { c -> c.isDigit() || c == '.' }) },
                    label = { Text(strings.overrideValue) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = if (isCurrency) KeyboardType.Number else KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onSave) { Text(strings.save) }
        },
        dismissButton = {
            Row {
                if (hasOverride) {
                    TextButton(onClick = onReset) { Text(strings.resetToAuto) }
                }
                TextButton(onClick = onCancel) { Text(strings.cancel) }
            }
        },
    )
}