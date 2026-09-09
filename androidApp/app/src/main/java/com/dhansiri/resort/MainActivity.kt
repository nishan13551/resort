package com.dhansiri.resort

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.dhansiri.resort.ui.App
import com.dhansiri.resort.ui.theme.DhansiriTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DhansiriTheme {
                App()
            }
        }
    }
}