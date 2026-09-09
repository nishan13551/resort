package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.BookingStatus
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.EmptyState
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.strings.bookingStatusLabel
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.SlateMuted

@Composable
fun HistoryScreen(repository: Repository) {
    val strings = LocalStrings.current
    val lang = LocalLang.current
    val bn = lang == com.dhansiri.resort.ui.strings.Lang.BN

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val loading by repository.loading.collectAsState()

    var query by remember { mutableStateOf("") }

    val history = remember(bookings, query) {
        bookings.filter {
            it.bookingStatus == BookingStatus.CHECKED_OUT || it.bookingStatus == BookingStatus.CANCELLED
        }.filter {
            query.isBlank() || it.guestName.contains(query, ignoreCase = true) || it.organization.contains(query, ignoreCase = true)
        }.sortedByDescending { it.checkOutDate ?: it.createdAt }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item { SectionTitle(strings.history) }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                label = { Text(strings.search) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
            )
        }
        if (loading && bookings.isEmpty()) {
            items(4) { LoadingShimmer() }
        } else if (history.isEmpty()) {
            item { EmptyState(strings.noData) }
        } else {
            items(history, key = { it.id }) { booking ->
                val cancelled = booking.bookingStatus == BookingStatus.CANCELLED
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White),
                ) {
                    Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                booking.guestName,
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.weight(1f),
                            )
                            StatusChip(
                                bookingStatusLabel(booking.bookingStatus, bn),
                                if (cancelled) MaterialTheme.colorScheme.error else SlateMuted,
                            )
                        }
                        Text(
                            "${Logic.bookingRoomsLabel(booking, rooms)}  •  ${Logic.formatDate(booking.checkInDate, bn)} → ${Logic.formatDate(booking.checkOutDate, bn)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = SlateMuted,
                        )
                        if (!cancelled) {
                            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    "${strings.totalRent}: ${Logic.formatCurrency(booking.totalRent, bn)}  •  ${strings.amountPaid}: ${Logic.formatCurrency(booking.amountPaid, bn)}",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = SlateMuted,
                                )
                                Text(
                                    strings.paymentStatus + ": " + com.dhansiri.resort.ui.strings.paymentStatusLabel(booking.paymentStatus, bn),
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldDark,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}