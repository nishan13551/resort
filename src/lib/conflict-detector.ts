import { Booking } from './types';
import { datesOverlap, getToday } from './utils';

export interface BookingInput {
  booking_date: string;
  guest_name: string;
  organization: string;
  guest_type: 'bwdb' | 'govt_other' | 'private';
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_days: number;
  daily_rate: number;
  total_rent: number;
  amount_paid: number;
  notes: string;
  created_by: string;
}

export interface ConflictResult {
  hasError: boolean;
  booking?: Booking;
  roomNumber?: string;
  message: string;
}

export function detectBookingConflict(
  bookings: Booking[],
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: string
): ConflictResult {
  const conflicting = bookings.find(b => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.room_id !== roomId) return false;
    if (b.booking_status === 'cancelled') return false;
    return datesOverlap(b.check_in_date, b.check_out_date, checkInDate, checkOutDate);
  });

  if (conflicting) {
    return {
      hasError: true,
      booking: conflicting,
      roomNumber: conflicting.room_number,
      message: `রুমটি নির্বাচিত তারিখের জন্য ইতিমধ্যে বুক করা হয়েছে।`,
    };
  }
  return { hasError: false, message: 'রুমটি নির্বাচিত তারিখের জন্য খালি আছে।' };
}

export function computeRoomStatus(
  roomId: string,
  bookings: Booking[]
): 'available' | 'booked' | 'occupied' {
  const today = getToday();
  const active = bookings.filter(
    b => b.room_id === roomId &&
      (b.booking_status === 'booked' || b.booking_status === 'checked_in') &&
      b.check_in_date <= today && b.check_out_date >= today
  );
  if (active.length === 0) return 'available';
  const live = active.find(b => b.booking_status === 'checked_in');
  if (live) return 'occupied';
  return 'booked';
}

export function validateBookingInput(input: BookingInput, bookings: Booking[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.guest_name.trim()) errors.push('অতিথির নাম প্রয়োজন');
  if (!input.room_id) errors.push('রুম নির্বাচন করা আবশ্যক');
  if (!input.check_in_date) errors.push('চেক-ইন তারিখ প্রয়োজন');
  if (!input.check_out_date) errors.push('চেক-আউট তারিখ প্রয়োজন');
  if (new Date(input.check_in_date) >= new Date(input.check_out_date)) {
    errors.push('চেক-আউট তারিখ অবশ্যই চেক-ইন তারিখের পরে হতে হবে');
  }
  if (input.number_of_days <= 0) errors.push('দিন সংখ্যা ১-এর বেশি হওয়া আবশ্যক');

  const conflict = detectBookingConflict(bookings, input.room_id, input.check_in_date, input.check_out_date);
  if (conflict.hasError) errors.push(conflict.message);

  return { valid: errors.length === 0, errors };
}

export function createId(prefix: string): string {
  const now = new Date();
  const parts = [
    now.getFullYear().toString().slice(2),
    (now.getMonth() + 1).toString().padStart(2, '0'),
    now.getDate().toString().padStart(2, '0'),
    now.getHours().toString().padStart(2, '0'),
    now.getMinutes().toString().padStart(2, '0'),
    now.getSeconds().toString().padStart(2, '0'),
    Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
  ];
  return `${prefix}_${parts.join('')}`;
}