package com.dhansiri.resort.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.QueryStats
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.SlateMuted

private data class MoreItem(
    val label: String,
    val icon: ImageVector,
)

@Composable
fun MoreScreen(
    onOpenRooms: () -> Unit,
    onOpenHistory: () -> Unit,
    onOpenReports: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    val strings = LocalStrings.current
    val items = listOf(
        MoreItem(strings.rooms, Icons.Default.Hotel) to onOpenRooms,
        MoreItem(strings.history, Icons.Default.History) to onOpenHistory,
        MoreItem(strings.reports, Icons.Default.QueryStats) to onOpenReports,
        MoreItem(strings.settings, Icons.Default.Settings) to onOpenSettings,
    )

    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(strings.more, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        items.forEachIndexed { index, (item, action) ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color.White),
                modifier = Modifier.fillMaxWidth().clickable { action() },
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(item.icon, contentDescription = null, tint = Emerald, modifier = Modifier.size(22.dp))
                    Text(
                        "    ${item.label}",
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.weight(1f),
                    )
                    Text("›", style = MaterialTheme.typography.titleLarge, color = SlateMuted)
                }
            }
        }
    }
}