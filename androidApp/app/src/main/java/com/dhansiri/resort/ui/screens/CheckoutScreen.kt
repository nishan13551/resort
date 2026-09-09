package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.Booking
import com.dhansiri.resort.data.BookingStatus
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.EmptyState
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.theme.Amber
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.SlateMuted
import kotlinx.coroutines.launch
import androidx.compose.foundation.text.KeyboardOptions

@Composable
fun CheckoutScreen(repository: Repository, onSnack: (String) -> Unit) {
    val strings = LocalStrings.current
    val lang = LocalLang.current
    val bn = lang == com.dhansiri.resort.ui.strings.Lang.BN
    val scope = rememberCoroutineScope()

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val loading by repository.loading.collectAsState()

    var pending by remember { mutableStateOf<Booking?>(null) }
    var amountText by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }

    val checkedIn = remember(bookings) {
        bookings.filter { it.bookingStatus == BookingStatus.CHECKED_IN }
            .sortedByDescending { it.actualCheckIn ?: it.createdAt }
    }

    Column(Modifier.fillMaxSize()) {
        SectionTitle(
            strings.checkout,
            modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp),
        )
        if (loading && bookings.isEmpty()) {
            LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(4) { LoadingShimmer() }
            }
        } else if (checkedIn.isEmpty()) {
            EmptyState(strings.noBookingsToCheckout)
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(checkedIn, key = { it.id }) { booking ->
                    Card(
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White),
                        modifier = Modifier.fillMaxWidth().clickable {
                            pending = booking
                            amountText = booking.dueAmount.toLong().toString()
                        },
                    ) {
                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Logout, contentDescription = null, tint = Amber)
                                Spacer(Modifier.width(8.dp))
                                Text(booking.guestName, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyLarge)
                            }
                            Text(
                                "${Logic.bookingRoomsLabel(booking, rooms)}  •  ${Logic.formatDate(booking.checkInDate, bn)}",
                                style = MaterialTheme.typography.bodySmall,
                                color = SlateMuted,
                            )
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                StatusChip(strings.occupied, Emerald)
                                Text("${strings.totalRent}: ${Logic.formatCurrency(booking.totalRent, bn)}", style = MaterialTheme.typography.labelMedium, color = EmeraldDark)
                                Text("${strings.dueAmount}: ${Logic.formatCurrency(booking.dueAmount, bn)}", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold, color = SlateMuted)
                            }
                        }
                    }
                }
            }
        }
    }

    val target = pending
    if (target != null) {
        AlertDialog(
            onDismissRequest = { if (!busy) pending = null },
            title = { Text(strings.confirmCheckout) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(target.guestName, fontWeight = FontWeight.SemiBold)
                    Text(
                        "${strings.totalRent}: ${Logic.formatCurrency(target.totalRent, bn)}  •  ${strings.dueAmount}: ${Logic.formatCurrency(target.dueAmount, bn)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = SlateMuted,
                    )
                    OutlinedTextField(
                        value = amountText,
                        onValueChange = { amountText = it.filter { c -> c.isDigit() } },
                        label = { Text(strings.enterPaymentAmount) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            },
            confirmButton = {
                TextButton(
                    enabled = !busy,
                    onClick = {
                        busy = true
                        scope.launch {
                            val paid = amountText.toDoubleOrNull() ?: 0.0
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
}