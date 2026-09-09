package com.dhansiri.resort.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MailOutline
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.dhansiri.resort.DhansiriApp
import com.dhansiri.resort.data.User
import com.dhansiri.resort.ui.LocalStrings
import com.dhansiri.resort.ui.components.BrandMark
import com.dhansiri.resort.ui.components.PrimaryButton
import com.dhansiri.resort.ui.theme.SlateMuted
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLogin: (User) -> Unit) {
    val strings = LocalStrings.current
    val context = LocalContext.current
    val app = context.applicationContext as DhansiriApp
    val repository = app.repository
    val scope = rememberCoroutineScope()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val scale by animateFloatAsState(targetValue = 1f, animationSpec = tween(500), label = "brand")

    fun submit() {
        if (loading) return
        loading = true
        errorMessage = null
        scope.launch {
            val result = repository.login(email, password)
            loading = false
            if (result.isSuccess) {
                onLogin(result.getOrThrow())
            } else {
                errorMessage = when (result.exceptionOrNull()?.message) {
                    "disabled" -> strings.accountDisabled
                    else -> strings.invalidCredentials
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(Color(0xFFEBFDF5), Color(0xFFE0F2FE), Color(0xFFF8FAFC)),
                ),
            ),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Box(modifier = Modifier.shadow(12.dp, RoundedCornerShape(24.dp)).scale(scale)) {
                BrandMark(size = 88)
            }
            Spacer(Modifier.height(20.dp))
            Text(
                text = strings.welcome,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = strings.loginSubtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = SlateMuted,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(32.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(strings.email) },
                leadingIcon = { Icon(Icons.Default.MailOutline, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                enabled = !loading,
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(strings.password) },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = null,
                        )
                    }
                },
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardActions = KeyboardActions(onDone = { submit() }),
                shape = RoundedCornerShape(16.dp),
                enabled = !loading,
            )
            Spacer(Modifier.height(24.dp))
            PrimaryButton(
                text = strings.login,
                onClick = ::submit,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                loading = loading,
            )
            Spacer(Modifier.height(16.dp))
            Text(
                text = strings.demoHint,
                style = MaterialTheme.typography.labelSmall,
                color = SlateMuted,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(24.dp))
        }
    }

    if (errorMessage != null) {
        AlertDialog(
            onDismissRequest = { errorMessage = null },
            confirmButton = {
                TextButton(onClick = { errorMessage = null }) { Text(strings.close) }
            },
            title = { Text(strings.error) },
            text = { Text(errorMessage.orEmpty()) },
        )
    }
}