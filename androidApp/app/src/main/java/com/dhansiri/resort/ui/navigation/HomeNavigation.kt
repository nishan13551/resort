package com.dhansiri.resort.ui.navigation

import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.MoveToInbox
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.EventNote
import androidx.compose.material.icons.outlined.FlightTakeoff
import androidx.compose.material.icons.outlined.MoreHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.data.User
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.strings.Lang
import com.dhansiri.resort.ui.theme.Emerald
import com.dhansiri.resort.ui.theme.SlateMuted

object Routes {
    const val DASHBOARD = "dashboard"
    const val BOOKINGS = "bookings"
    const val NEW_BOOKING = "new_booking"
    const val CHECKIN = "checkin"
    const val CHECKOUT = "checkout"
    const val ROOMS = "rooms"
    const val HISTORY = "history"
    const val REPORTS = "reports"
    const val SETTINGS = "settings"
    const val MORE = "more"
}

private data class Tab(
    val route: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
)

@Composable
fun HomeNavigation(
    repository: Repository,
    user: User,
    modifier: Modifier = Modifier,
    onLangChange: (Lang) -> Unit,
    onLogout: () -> Unit,
    onSnack: (String) -> Unit,
) {
    val navController = rememberNavController()
    val strings = LocalStrings.current

    val isAdmin = user.role == com.dhansiri.resort.data.UserRole.ADMIN

    val tabs = buildList {
        if (isAdmin) {
            add(Tab(Routes.DASHBOARD, strings.dashboard, Icons.Filled.Dashboard, Icons.Outlined.Dashboard))
        }
        add(Tab(Routes.BOOKINGS, strings.bookings, Icons.Filled.EventNote, Icons.Outlined.EventNote))
        add(Tab(Routes.CHECKIN, strings.checkin, Icons.Filled.MoveToInbox, Icons.Outlined.FlightTakeoff))
        add(Tab(Routes.CHECKOUT, strings.checkout, Icons.Filled.MoveToInbox, Icons.Outlined.CalendarMonth))
        add(Tab(Routes.MORE, strings.more, Icons.Filled.MoreHoriz, Icons.Outlined.MoreHoriz))
    }

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val showBottomBar = currentRoute in tabRoutes()

    Box(modifier = modifier.fillMaxSize()) {
        NavHost(
            navController = navController,
            startDestination = if (isAdmin) Routes.DASHBOARD else Routes.BOOKINGS,
            modifier = Modifier.fillMaxSize(),
            enterTransition = {
                slideInHorizontally(tween(280)) { it / 8 } + fadeIn(tween(280))
            },
            exitTransition = { fadeOut(tween(200)) },
            popEnterTransition = { fadeIn(tween(280)) },
            popExitTransition = {
                slideOutHorizontally(tween(280)) { it / 8 } + fadeOut(tween(200))
            },
        ) {
            composable(Routes.DASHBOARD) {
                com.dhansiri.resort.ui.screens.DashboardScreen(repository = repository, user = user, onSnack = onSnack)
            }
            composable(Routes.BOOKINGS) {
                com.dhansiri.resort.ui.screens.BookingsScreen(
                    repository = repository,
                    onNewBooking = { navController.navigate(Routes.NEW_BOOKING) },
                    onSnack = onSnack,
                )
            }
            composable(Routes.NEW_BOOKING) {
                com.dhansiri.resort.ui.screens.NewBookingScreen(
                    repository = repository,
                    onDone = { navController.popBackStack() },
                    onSnack = onSnack,
                )
            }
            composable(Routes.CHECKIN) {
                com.dhansiri.resort.ui.screens.CheckinScreen(repository = repository, onSnack = onSnack)
            }
            composable(Routes.CHECKOUT) {
                com.dhansiri.resort.ui.screens.CheckoutScreen(repository = repository, onSnack = onSnack)
            }
            composable(Routes.ROOMS) {
                com.dhansiri.resort.ui.screens.RoomsScreen(repository = repository)
            }
            composable(Routes.HISTORY) {
                com.dhansiri.resort.ui.screens.HistoryScreen(repository = repository)
            }
            composable(Routes.REPORTS) {
                com.dhansiri.resort.ui.screens.ReportsScreen(repository = repository)
            }
            composable(Routes.SETTINGS) {
                com.dhansiri.resort.ui.screens.SettingsScreen(
                    user = user,
                    onLangChange = onLangChange,
                    onLogout = onLogout,
                )
            }
            composable(Routes.MORE) {
                com.dhansiri.resort.ui.screens.MoreScreen(
                    onOpenRooms = { navController.navigate(Routes.ROOMS) },
                    onOpenHistory = { navController.navigate(Routes.HISTORY) },
                    onOpenReports = { navController.navigate(Routes.REPORTS) },
                    onOpenSettings = { navController.navigate(Routes.SETTINGS) },
                )
            }
        }

        if (showBottomBar) {
            NavigationBar(
                modifier = Modifier.align(androidx.compose.ui.Alignment.BottomCenter),
                containerColor = MaterialTheme.colorScheme.surface,
            ) {
                tabs.forEach { tab ->
                    val selected = currentRoute == tab.route
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            navController.navigate(tab.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = {
                            Icon(
                                imageVector = if (selected) tab.selectedIcon else tab.unselectedIcon,
                                contentDescription = tab.label,
                            )
                        },
                        label = { Text(tab.label, maxLines = 1) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Emerald,
                            selectedTextColor = Emerald,
                            indicatorColor = Emerald.copy(alpha = 0.14f),
                            unselectedIconColor = SlateMuted,
                        ),
                    )
                }
            }
        }
    }
}

private fun tabRoutes(): Set<String> = setOf(
    Routes.DASHBOARD,
    Routes.BOOKINGS,
    Routes.CHECKIN,
    Routes.CHECKOUT,
    Routes.MORE,
)