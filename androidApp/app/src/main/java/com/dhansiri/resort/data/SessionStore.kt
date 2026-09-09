package com.dhansiri.resort.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "session")

class SessionStore(private val context: Context) {

    private val sessionKey = stringPreferencesKey("user_id")

    suspend fun currentUserId(): String? =
        context.dataStore.data.first()[sessionKey]

    suspend fun store(userId: String) {
        context.dataStore.edit { it[sessionKey] = userId }
    }

    suspend fun clear() {
        context.dataStore.edit { it.remove(sessionKey) }
    }

    suspend fun currentUser(): User? {
        val id = currentUserId() ?: return null
        return SeedUsers.all.firstOrNull { it.id == id }
    }
}