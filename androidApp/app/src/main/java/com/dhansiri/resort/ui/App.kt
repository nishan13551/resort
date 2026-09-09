package com.dhansiri.resort.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import com.dhansiri.resort.DhansiriApp
import com.dhansiri.resort.data.User
import com.dhansiri.resort.ui.navigation.HomeNavigation
import com.dhansiri.resort.ui.screens.LoginScreen
import com.dhansiri.resort.ui.strings.Lang
import com.dhansiri.resort.ui.strings.Tx
import kotlinx.coroutines.launch

val LocalStrings = staticCompositionLocalOf { Tx(true) }

val LocalLang = staticCompositionLocalOf { Lang.BN }

val LocalUser = staticCompositionLocalOf<User?> { null }

val LocalSnackbar = staticCompositionLocalOf { SnackbarHostState() }

@Composable
fun App() {
    val app = androidx.compose.ui.platform.LocalContext.current.applicationContext as DhansiriApp
    val repository = app.repository
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    var lang by remember { mutableStateOf(Lang.BN) }
    var user by remember { mutableStateOf<User?>(null) }
    var checking by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        user = repository.currentUser()
        checking = false
        // Pre-warm data so the first screen renders instantly.
        if (user != null) repository.refresh()
    }

    fun snack(message: String) {
        scope.launch { snackbarHostState.showSnackbar(message) }
    }

    val strings = Tx(lang == Lang.BN)

    CompositionLocalProvider(
        LocalStrings provides strings,
        LocalLang provides lang,
        LocalUser provides user,
        LocalSnackbar provides snackbarHostState,
    ) {
        when {
            checking -> Scaffold(containerColor = androidx.compose.material3.MaterialTheme.colorScheme.background) {
                com.dhansiri.resort.ui.components.FullLoading(Modifier.fillMaxSize().padding(it))
            }

            user == null -> LoginScreen(
                onLogin = { logged ->
                    user = logged
                    repository.refresh()
                    snack(strings.welcome + "!")
                },
            )

            else -> {
                // Provide a messenger abstraction so screens can toast without importing scope.
                val messenger = LocalSnackbar
                Scaffold(
                    snackbarHost = { SnackbarHost(messenger.current) },
                ) { padding ->
                    HomeNavigation(
                        repository = repository,
                        user = user,
                        modifier = Modifier.padding(padding),
                        onLangChange = { lang = it },
                        onLogout = {
                            scope.launch {
                                repository.logout()
                                user = null
                            }
                        },
                        onSnack = ::snack,
                    )
                }
            }
        }
    }
}