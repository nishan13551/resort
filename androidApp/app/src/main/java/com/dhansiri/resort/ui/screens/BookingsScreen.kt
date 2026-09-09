package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PullToRefreshBox
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.Booking
import com.dhansiri.resort.data.BookingStatus
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.data.Room
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.EmptyState
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.strings.Tx
import com.dhansiri.resort.ui.strings.bookingStatusLabel
import com.dhansiri.resort.ui.theme.Amber
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.SlateMuted
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingsScreen(
    repository: Repository,
    onNewBooking: () -> Unit,
    onSnack: (String) -> Unit,
) {
    val strings = LocalStrings.current
    val lang = LocalLang.current
    val bn = lang == com.dhansiri.resort.ui.strings.Lang.BN
    val scope = rememberCoroutineScope()

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val loading by repository.loading.collectAsState()

    var filter by remember { mutableStateOf("all") }
    var refreshing by remember { mutableStateOf(false) }
    var cancelTarget by remember { mutableStateOf<Booking?>(null) }

    val filtered = remember(bookings, filter) {
        when (filter) {
            "booked" -> bookings.filter { it.bookingStatus == BookingStatus.BOOKED }
            "checked_in" -> bookings.filter { it.bookingStatus == BookingStatus.CHECKED_IN }
            "checked_out" -> bookings.filter { it.bookingStatus == BookingStatus.CHECKED_OUT }
            else -> bookings
        }.sortedByDescending { it.createdAt }
    }

    val statuses = listOf("all", "booked", "checked_in", "checked_out")

    Box(Modifier.fillMaxSize()) {
        PullToRefreshBox(
            isRefreshing = refreshing,
            onRefresh = {
                refreshing = true
                scope.launch {
                    repository.refresh()
                    refreshing = false
                }
            },
            modifier = Modifier.fillMaxSize(),
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                item {
                    SectionTitle("${strings.bookings} (${filtered.size})")
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        statuses.forEach { s ->
                            StatusChip(
                                text = statusLabel(s, strings, bn),
                                color = if (filter == s) Emerald else SlateMuted,
                                modifier = Modifier.clickable { filter = s },
                            )
                        }
                    }
                }

                if (loading && bookings.isEmpty()) {
                    items(4) { LoadingShimmer() }
                } else if (filtered.isEmpty()) {
                    item { EmptyState(strings.noData) }
                } else {
                    items(filtered, key = { it.id }) { booking ->
                        BookingCard(
                            booking = booking,
                            rooms = rooms,
                            strings = strings,
                            bn = bn,
                            onCancel = if (booking.bookingStatus == BookingStatus.BOOKED) {
                                { cancelTarget = booking }
                            } else null,
                        )
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = onNewBooking,
            modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp),
            containerColor = Emerald,
            contentColor = androidx.compose.ui.graphics.Color.White,
        ) {
            Icon(Icons.Default.Add, contentDescription = strings.newBooking)
        }
    }

    cancelTarget?.let { target ->
        AlertDialog(
            onDismissRequest = { cancelTarget = null },
            title = { Text(strings.cancelled) },
            text = { Text("\"${target.guestName}\"?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        scope.launch { repository.cancelBooking(target.id) }
                        cancelTarget = null
                    },
                ) { Text(strings.delete) }
            },
            dismissButton = {
                TextButton(onClick = { cancelTarget = null }) { Text(strings.close) }
            },
        )
    }
}

private fun statusLabel(s: String, strings: Tx, bn: Boolean): String = when (s) {
    "booked" -> bookingStatusLabel(BookingStatus.BOOKED, bn)
    "checked_in" -> bookingStatusLabel(BookingStatus.CHECKED_IN, bn)
    "checked_out" -> bookingStatusLabel(BookingStatus.CHECKED_OUT, bn)
    else -> if (bn) "সকল" else "All"
}

@Composable
private fun BookingCard(
    booking: Booking,
    rooms: List<Room>,
    strings: Tx,
    bn: Boolean,
    onCancel: (() -> Unit)?,
) {
    val statusColor = when (booking.bookingStatus) {
        BookingStatus.BOOKED -> Emerald
        BookingStatus.CHECKED_IN -> Amber
        BookingStatus.CHECKED_OUT -> SlateMuted
        BookingStatus.CANCELLED -> MaterialTheme.colorScheme.error
    }
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(14.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(booking.guestName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                Text(
                    "${strings.roomsLabel}: ${Logic.bookingRoomsLabel(booking, rooms)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted,
                )
                Text(
                    "${Logic.formatDate(booking.checkInDate, bn)} → ${Logic.formatDate(booking.checkOutDate, bn)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted,
                )
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatusChip(bookingStatusLabel(booking.bookingStatus, bn), statusColor)
                    Text(
                        Logic.formatCurrency(booking.totalRent, bn),
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldDark,
                    )
                }
            }
            if (onCancel != null) {
                IconButton(onClick = onCancel, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Outlined.Close, contentDescription = strings.cancel, tint = SlateMuted)
                }
            }
        }
    }
}