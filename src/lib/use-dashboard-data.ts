'use client';

import { useMemo } from 'react';
import { useData } from '@/lib/data-provider';
import { computeRoomStatus } from '@/lib/conflict-detector';
import { Room } from '@/lib/types';

export function useRoomsWithStatus(): Room[] {
  const { rooms, bookings } = useData();

  return useMemo(() => {
    return rooms.map(room => {
      const status = computeRoomStatus(room.id, bookings);
      const activeBooking = bookings.find(
        b =>
          b.room_id === room.id &&
          (b.booking_status === 'booked' || b.booking_status === 'checked_in') &&
          b.check_in_date <= new Date().toISOString().split('T')[0] &&
          b.check_out_date >= new Date().toISOString().split('T')[0]
      );
      return {
        ...room,
        status,
        current_booking: activeBooking
          ? { ...activeBooking, room_number: room.room_number }
          : undefined,
      };
    });
  }, [rooms, bookings]);
}

export function useDashboardStats() {
  const { bookings } = useData();
  const roomsWithStatus = useRoomsWithStatus();

  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const monthNow = new Date();
    const monthStart = new Date(monthNow.getFullYear(), monthNow.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(monthNow.getFullYear(), monthNow.getMonth() + 1, 0).toISOString().split('T')[0];

    const todayBookingsArr = bookings.filter(b => b.booking_date === today);

    const todayRevenue = todayBookingsArr.reduce((sum, b) => sum + b.total_rent, 0);
    const monthRevenue = bookings
      .filter(b => {
        const cin = b.check_in_date;
        const cout = b.check_out_date;
        return !(cout < monthStart || cin > monthEnd);
      })
      .reduce((sum, b) => sum + b.total_rent, 0);

    const availableRooms = roomsWithStatus.filter(r => r.status === 'available').length;
    const bookedRooms = roomsWithStatus.filter(r => r.status === 'booked').length;
    const occupiedRooms = roomsWithStatus.filter(r => r.status === 'occupied').length;

    return {
      todayBookings: todayBookingsArr.length,
      todayRevenue,
      monthRevenue,
      totalBookings: bookings.length,
      availableRooms,
      bookedRooms,
      occupiedRooms,
    };
  }, [bookings, roomsWithStatus]);
}