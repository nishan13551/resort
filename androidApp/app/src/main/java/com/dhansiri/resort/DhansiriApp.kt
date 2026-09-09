package com.dhansiri.resort

import android.app.Application
import com.dhansiri.resort.data.Repository
import com.dhansiri.resort.data.SessionStore

class DhansiriApp : Application() {
    lateinit var repository: Repository
        private set

    override fun onCreate() {
        super.onCreate()
        repository = Repository(SessionStore(this))
    }
}