package com.dhansiri.resort.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.sp

val Emerald = Color(0xFF059669)
val EmeraldDark = Color(0xFF047857)
val EmeraldSoft = Color(0xFFD1FAE5)
val Teal = Color(0xFF14B8A6)
val Slate = Color(0xFF0F172A)
val SlateMuted = Color(0xFF64748B)
val SlateSoft = Color(0xFFF1F5F9)
val Amber = Color(0xFFB45309)
val AmberSoft = Color(0xFFFEF3C7)
val RedSoft = Color(0xFFFEE2E2)
val BlueSoft = Color(0xFFDBEAFE)
val PurpleSoft = Color(0xFFEDE9FE)

private val LightColors = lightColorScheme(
    primary = Emerald,
    onPrimary = Color.White,
    primaryContainer = EmeraldSoft,
    onPrimaryContainer = EmeraldDark,
    secondary = Teal,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFCCFBF1),
    onSecondaryContainer = Color(0xFF134E4A),
    surface = Color(0xFFF8FAFC),
    onSurface = Slate,
    surfaceVariant = SlateSoft,
    onSurfaceVariant = SlateMuted,
    background = Color(0xFFF8FAFC),
    onBackground = Slate,
    error = Color(0xFFB91C1C),
)

private fun scaleUp(style: TextStyle, factor: Float = 1.12f): TextStyle {
    val size = style.fontSize.value * factor
    val lineHeight = style.lineHeight.value * factor
    return style.copy(fontSize = size.sp, lineHeight = lineHeight.sp)
}

private val AppTypography = run {
    val base = Typography()
    Typography(
        displayLarge = scaleUp(base.displayLarge),
        displayMedium = scaleUp(base.displayMedium),
        displaySmall = scaleUp(base.displaySmall),
        headlineLarge = scaleUp(base.headlineLarge),
        headlineMedium = scaleUp(base.headlineMedium),
        headlineSmall = scaleUp(base.headlineSmall),
        titleLarge = scaleUp(base.titleLarge),
        titleMedium = scaleUp(base.titleMedium),
        titleSmall = scaleUp(base.titleSmall),
        bodyLarge = scaleUp(base.bodyLarge),
        bodyMedium = scaleUp(base.bodyMedium),
        bodySmall = scaleUp(base.bodySmall),
        labelLarge = scaleUp(base.labelLarge),
        labelMedium = scaleUp(base.labelMedium),
        labelSmall = scaleUp(base.labelSmall),
    )
}

@Composable
fun DhansiriTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = AppTypography,
        content = content,
    )
}