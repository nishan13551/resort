package com.dhansiri.resort.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface RestApi {

    // ---------- rooms ----------
    @GET("/rest/v1/rooms")
    suspend fun getRooms(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
    ): List<Room>

    @POST("/rest/v1/rooms")
    suspend fun insertRoom(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "return=representation",
        @Body body: Room,
    ): List<Room>

    @PATCH("/rest/v1/rooms")
    suspend fun updateRoom(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "return=representation",
        @Query("id") id: String,
        @Body body: Map<String, Any>,
    ): List<Room>

    // ---------- bookings ----------
    @GET("/rest/v1/bookings")
    suspend fun getBookings(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Query("select") select: String = "*",
        @Query("order") order: String = "booking_date.desc",
    ): List<Booking>

    @POST("/rest/v1/bookings")
    suspend fun insertBooking(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "return=representation",
        @Body body: BookingInsert,
    ): List<Booking>

    @PATCH("/rest/v1/bookings")
    suspend fun updateBooking(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "return=representation",
        @Query("id") id: String,
        @Body body: Map<String, Any>,
    ): List<Booking>

    @DELETE("/rest/v1/bookings")
    suspend fun deleteBooking(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "return=minimal",
        @Query("id") id: String,
    )

    // ---------- payments ----------
    @GET("/rest/v1/payments")
    suspend fun getPayments(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Query("select") select: String = "*",
        @Query("order") order: String = "created_at.desc",
    ): List<Payment>

    @POST("/rest/v1/payments")
    suspend fun insertPayment(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "return=representation",
        @Body body: Payment,
    ): List<Payment>

    // ---------- dashboard overrides ----------
    @GET("/rest/v1/dashboard_overrides")
    suspend fun getOverrides(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Query("select") select: String = "*",
    ): List<DashboardOverride>

    @POST("/rest/v1/dashboard_overrides")
    suspend fun upsertOverride(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "resolution=merge-duplicates,return=representation",
        @Query("on_conflict") onConflict: String = "key",
        @Body body: DashboardOverride,
    ): List<DashboardOverride>

    @DELETE("/rest/v1/dashboard_overrides")
    suspend fun deleteOverride(
        @Header("apikey") apikey: String,
        @Header("Authorization") auth: String,
        @Header("Prefer") prefer: String = "return=minimal",
        @Query("key") key: String,
    )
}