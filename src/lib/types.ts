export type UserRole = 'admin' | 'caretaker' | 'viewer';
export type GuestType = 'bwdb' | 'govt_other' | 'private' | 'ngo' | 'general';
export type BookingStatus = 'booked' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  room_name: string;
  is_active: boolean;
  status: 'available' | 'booked' | 'occupied';
  current_booking?: Booking;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_date: string;
  guest_name: string;
  organization: string;
  guest_type: GuestType;
  room_id: string;
  room_number?: string;
  room_ids?: string[];
  check_in_date: string;
  check_out_date: string;
  number_of_days: number;
  daily_rate: number;
  total_rent: number;
  amount_paid: number;
  due_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  actual_check_in?: string;
  actual_check_out?: string;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
  recorded_by: string;
  created_at: string;
}

export interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  monthRevenue: number;
  totalBookings: number;
  availableRooms: number;
  bookedRooms: number;
  occupiedRooms: number;
}

export interface RoomWithStatus extends Room {
  status: 'available' | 'booked' | 'occupied';
  current_booking?: Booking;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ReportFilters {
  dateRange: DateRange;
  guestType?: GuestType;
  roomId?: string;
}
