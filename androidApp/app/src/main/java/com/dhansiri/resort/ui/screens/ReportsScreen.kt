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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.EmptyState
import com.dhansiri.resort.ui.components.SectionTitle
import com.dhansiri.resort.ui.theme.Amber
import com.dhansiri.resort.ui.theme.AmberSoft
import com.dhansiri.resort.ui.theme.BlueSoft
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldSoft
import com.dhansiri.resort.ui.theme.SlateMuted

private data class ReportStat(
    val label: String,
    val value: String,
    val tint: Color,
    val icon: ImageVector,
)

@Composable
fun ReportsScreen(repository: Repository) {
    val strings = LocalStrings.current
    val lang = LocalLang.current
    val bn = lang == com.dhansiri.resort.ui.strings.Lang.BN

    val bookings by repository.bookings.collectAsState()
    val payments by repository.payments.collectAsState()

    val totalCollected = remember(payments) { payments.sumOf { it.amount } }
    val totalRevenue = remember(bookings) {
        bookings.filter { it.bookingStatus != com.dhansiri.resort.data.BookingStatus.CANCELLED }.sumOf { it.totalRent }
    }
    val totalDue = remember(bookings) { bookings.sumOf { it.dueAmount } }
    val recentPayments = remember(payments) {
        payments.sortedByDescending { it.paymentDate }.take(20)
    }
    val bookingsById = remember(bookings) { bookings.associateBy { it.id } }

    val stats = listOf(
        ReportStat(strings.totalRevenue, Logic.formatCurrency(totalRevenue, bn), EmeraldSoft, Icons.Default.Receipt),
        ReportStat(strings.totalCollected, Logic.formatCurrency(totalCollected, bn), BlueSoft, Icons.Default.AccountBalanceWallet),
        ReportStat(strings.totalDue, Logic.formatCurrency(totalDue, bn), AmberSoft, Icons.Default.Payments),
    )

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(strings.reports, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                stats.chunked(2).forEach { rowStats ->
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        rowStats.forEach { stat ->
                            com.dhansiri.resort.ui.components.StatCard(
                                modifier = Modifier.weight(1f),
                                label = stat.label,
                                value = stat.value,
                                tint = stat.tint,
                                icon = { Icon(stat.icon, contentDescription = null, tint = if (stat == stats[0]) Emerald else Amber) },
                            )
                        }
                    }
                }
            }
        }
        item { SectionTitle(strings.recentPayments) }
        if (recentPayments.isEmpty()) {
            item { EmptyState(strings.noData) }
        } else {
            items(recentPayments, key = { it.id }) { payment ->
                val booking = bookingsById[payment.bookingId]
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text(
                                booking?.guestName ?: payment.bookingId,
                                fontWeight = FontWeight.SemiBold,
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                Logic.formatDate(payment.paymentDate, bn),
                                style = MaterialTheme.typography.labelSmall,
                                color = SlateMuted,
                            )
                        }
                        Text(
                            Logic.formatCurrency(payment.amount, bn),
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.bodyLarge,
                            color = Emerald,
                        )
                    }
                }
            }
        }
        item { Spacer(Modifier.height(8.dp)) }
    }
}