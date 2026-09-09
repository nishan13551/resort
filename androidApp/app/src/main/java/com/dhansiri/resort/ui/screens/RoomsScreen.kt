package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.data.Logic
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.ui.LocalLang
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.LoadingShimmer
import com.dhansiri.resort.ui.components.StatusChip
import com.dhansiri.resort.ui.strings.Tx
import com.dhansiri.resort.ui.strings.roomStatusLabel
import com.dhansiri.resort.ui.theme.Amber
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.EmeraldDark
import com.dhansiri.resort.ui.theme.SlateMuted

@Composable
fun RoomsScreen(repository: Repository) {
    val strings = LocalStrings.current
    val lang = LocalLang.current
    val bn = lang == com.dhansiri.resort.ui.strings.Lang.BN

    val bookings by repository.bookings.collectAsState()
    val rooms by repository.rooms.collectAsState()
    val loading by repository.loading.collectAsState()

    Column(Modifier.fillMaxSize()) {
        Text(
            strings.rooms,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp),
        )
        if (loading && rooms.isEmpty()) {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize(),
            ) {
                items(6) { LoadingShimmer() }
            }
        } else {
            val activeRooms = remember(rooms) { rooms.filter { it.isActive } }
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize(),
            ) {
                items(activeRooms, key = { it.id }) { room ->
                    val status = Logic.computeRoomStatus(room.id, bookings)
                    val current = Logic.currentBookingFor(room.id, bookings)
                    val color = when (status) {
                        "available" -> Emerald
                        "booked" -> Amber
                        else -> MaterialTheme.colorScheme.error
                    }
                    Card(
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(14.dp),
                            horizontalAlignment = Alignment.Start,
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Text(
                                room.roomNumber,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldDark,
                            )
                            room.roomName?.takeIf { it.isNotBlank() }?.let {
                                Text(it, style = MaterialTheme.typography.labelMedium, color = SlateMuted)
                            }
                            StatusChip(roomStatusLabel(status, bn), color)
                            if (status != "available" && current != null) {
                                Spacer(Modifier.height(2.dp))
                                Text(
                                    strings.currentGuest,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = SlateMuted,
                                )
                                Text(
                                    current.guestName,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.SemiBold,
                                )
                                Text(
                                    "${current.checkInDate} → ${current.checkOutDate}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = SlateMuted,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}