import { Booking, GuestType, Room, User } from '../lib/types';
import { calculateTotalRent, getDailyRate } from '../lib/rent-calculator';

function dateStr(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split('T')[0];
}

function timeAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function makeBooking(
  id: string,
  bookingDate: string,
  guestName: string,
  org: string,
  guestType: GuestType,
  roomId: string,
  roomNumber: string,
  checkIn: string,
  checkOut: string,
  status: Booking['booking_status'],
  amountPaid: number,
  createdBy: string
): Booking {
  const days = Math.max(Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000), 1);
  const daily = getDailyRate(guestType);
  const total = calculateTotalRent(guestType, days);
  const due = Math.max(total - amountPaid, 0);
  const paymentStatus: Booking['payment_status'] = due === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid';

  return {
    id,
    booking_date: bookingDate,
    guest_name: guestName,
    organization: org,
    guest_type: guestType,
    room_id: roomId,
    room_number: roomNumber,
    check_in_date: checkIn,
    check_out_date: checkOut,
    number_of_days: days,
    daily_rate: daily,
    total_rent: total,
    amount_paid: amountPaid,
    due_amount: due,
    payment_status: paymentStatus,
    booking_status: status,
    actual_check_in: status !== 'booked' ? timeAgo(Math.abs(new Date(checkIn).getTime() - Date.now()) / 86400000) : undefined,
    actual_check_out: status === 'checked_out' ? timeAgo(Math.abs(new Date(checkOut).getTime() - Date.now()) / 86400000) : undefined,
    notes: '',
    created_by: createdBy,
    created_at: timeAgo(Math.abs(new Date(bookingDate).getTime() - Date.now()) / 86400000),
    updated_at: timeAgo(Math.abs(new Date(bookingDate).getTime() - Date.now()) / 86400000),
  };
}

export const seedUsers: User[] = [
  {
    id: 'u_admin',
    username: 'admin',
    full_name: 'রাসেল (অ্যাডমিন)',
    role: 'admin',
    is_active: true,
    created_at: timeAgo(90),
    updated_at: timeAgo(90),
  },
  {
    id: 'u_caretaker',
    username: 'caretaker',
    full_name: 'কেয়ারটেকার',
    role: 'caretaker',
    is_active: true,
    created_at: timeAgo(90),
    updated_at: timeAgo(90),
  },
];

export const seedRooms: Room[] = [
  { id: 'r_201', room_number: '201', room_name: 'রুম ২০১', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
  { id: 'r_202', room_number: '202', room_name: 'রুম ২০২', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
  { id: 'r_203', room_number: '203', room_name: 'রুম ২০৩', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
  { id: 'r_301', room_number: '301', room_name: 'রুম ৩০১', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
  { id: 'r_302', room_number: '302', room_name: 'রুম ৩০২', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
  { id: 'r_303', room_number: '303', room_name: 'রুম ৩০৩', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
  { id: 'r_xen', room_number: 'Xen', room_name: 'Xen অফিস', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
  { id: 'r_so', room_number: 'SO', room_name: 'SO অফিস', is_active: true, status: 'available', created_at: timeAgo(90), updated_at: timeAgo(90) },
];

export const seedBookings: Booking[] = [
  // Current active bookings (checked-in today & ongoing)
  makeBooking(
    'bk_001', dateStr(-1), 'মোঃ রফিকুল ইসলাম', 'বিডব্লিউডিবি', 'bwdb',
    'r_201', '201', dateStr(-2), dateStr(2), 'checked_in', 480, 'u_admin'
  ),
  makeBooking(
    'bk_002', dateStr(-1), 'সমীর কুমার', 'সড়ক ও জনপথ বিভাগ', 'govt_other',
    'r_202', '202', dateStr(-1), dateStr(3), 'checked_in', 1120, 'u_admin'
  ),
  makeBooking(
    'bk_003', dateStr(-3), 'আব্দুল করিম', '', 'private',
    'r_203', '203', dateStr(-3), dateStr(1), 'checked_in', 1200, 'u_caretaker'
  ),
  makeBooking(
    'bk_004', dateStr(0), 'ডাঃ ফাতেমা বেগম', '', 'private',
    'r_301', '301', dateStr(0), dateStr(2), 'booked', 0, 'u_caretaker'
  ),
  makeBooking(
    'bk_005', dateStr(0), 'মোঃ শফিকুল আলম', 'এলজিইডি', 'govt_other',
    'r_302', '302', dateStr(1), dateStr(3), 'booked', 0, 'u_caretaker'
  ),
  makeBooking(
    'bk_006', dateStr(1), 'নাসরিন সুলতানা', '', 'private',
    'r_xen', 'Xen', dateStr(1), dateStr(4), 'booked', 0, 'u_admin'
  ),
  makeBooking(
    'bk_007', dateStr(-8), 'মোঃ জসিম উদ্দিন', 'বিডব্লিউডিবি', 'bwdb',
    'r_so', 'SO', dateStr(-6), dateStr(2), 'checked_in', 640, 'u_admin'
  ),

  // Past completed bookings (history)
  makeBooking('bk_100', dateStr(-20), 'রহিম উদ্দিন', 'বিডব্লিউডিবি', 'bwdb', 'r_201', '201', dateStr(-18), dateStr(-14), 'checked_out', 320, 'u_admin'),
  makeBooking('bk_101', dateStr(-22), 'করিম খান', '', 'private', 'r_202', '202', dateStr(-20), dateStr(-15), 'checked_out', 3600, 'u_admin'),
  makeBooking('bk_102', dateStr(-18), 'সালমা বেগম', 'প্রবাসী কল্যাণ ব্যাংক', 'govt_other', 'r_301', '301', dateStr(-16), dateStr(-10), 'checked_out', 1680, 'u_admin'),
  makeBooking('bk_103', dateStr(-15), 'মোঃ কামরুল হাসান', '', 'private', 'r_201', '201', dateStr(-13), dateStr(-9), 'checked_out', 2400, 'u_caretaker'),
  makeBooking('bk_104', dateStr(-12), 'জাহানারা আক্তার', '', 'private', 'r_203', '203', dateStr(-11), dateStr(-5), 'checked_out', 3600, 'u_caretaker'),
  makeBooking('bk_105', dateStr(-10), 'মোঃ ইকবাল হোসেন', 'বিডব্লিউডিবি', 'bwdb', 'r_302', '302', dateStr(-8), dateStr(-6), 'checked_out', 240, 'u_admin'),
  makeBooking('bk_106', dateStr(-9), 'তানভীর আহমেদ', '', 'private', 'r_xen', 'Xen', dateStr(-7), dateStr(-4), 'checked_out', 1800, 'u_admin'),
  makeBooking('bk_107', dateStr(-35), 'শারমিন রহমান', '', 'private', 'r_303', '303', dateStr(-33), dateStr(-28), 'checked_out', 3000, 'u_admin'),
  makeBooking('bk_108', dateStr(-30), 'মোঃ নজরুল ইসলাম', 'পল্লী বিদ্যুৎ', 'govt_other', 'r_202', '202', dateStr(-28), dateStr(-22), 'checked_out', 1680, 'u_admin'),
  makeBooking('bk_109', dateStr(-25), 'লতিফুর রহমান', '', 'private', 'r_301', '301', dateStr(-24), dateStr(-20), 'checked_out', 2400, 'u_caretaker'),
  makeBooking('bk_110', dateStr(-60), 'রুবিনা ইয়াসমিন', '', 'private', 'r_201', '201', dateStr(-58), dateStr(-50), 'checked_out', 4800, 'u_admin'),
  makeBooking('bk_111', dateStr(-55), 'মোঃ শরীফ উদ্দিন', 'বিডব্লিউডিবি', 'bwdb', 'r_303', '303', dateStr(-53), dateStr(-47), 'checked_out', 480, 'u_admin'),
  makeBooking('bk_112', dateStr(-45), 'সৈয়দ নাঈম', '', 'private', 'r_so', 'SO', dateStr(-43), dateStr(-38), 'checked_out', 3000, 'u_caretaker'),
  makeBooking('bk_113', dateStr(-40), 'মোঃ আলমগীর', 'ইউনিয়ন পরিষদ', 'govt_other', 'r_202', '202', dateStr(-38), dateStr(-35), 'checked_out', 840, 'u_admin'),
  makeBooking('bk_114', dateStr(-75), 'সাবিনা ইয়াসমিন', '', 'private', 'r_301', '301', dateStr(-72), dateStr(-68), 'checked_out', 2400, 'u_admin'),
  makeBooking('bk_115', dateStr(-70), 'মোঃ আবু বক্কর', 'বিডব্লিউডিবি', 'bwdb', 'r_xen', 'Xen', dateStr(-68), dateStr(-62), 'checked_out', 480, 'u_admin'),
  makeBooking('bk_116', dateStr(-50), 'জয়নুল আবেদীন', '', 'private', 'r_203', '203', dateStr(-48), dateStr(-44), 'checked_out', 2400, 'u_admin'),
  makeBooking('bk_117', dateStr(-65), 'মাহমুদুল হাসান', '', 'private', 'r_302', '302', dateStr(-63), dateStr(-58), 'checked_out', 3000, 'u_admin'),
  makeBooking('bk_118', dateStr(-85), 'মোঃ মিজানুর রহমান', 'বিডব্লিউডিবি', 'bwdb', 'r_201', '201', dateStr(-83), dateStr(-78), 'checked_out', 400, 'u_admin'),
  makeBooking('bk_119', dateStr(-80), 'ফারহানা পারভিন', '', 'private', 'r_so', 'SO', dateStr(-78), dateStr(-74), 'checked_out', 2400, 'u_admin'),
  makeBooking('bk_120', dateStr(-120), 'মোঃ আকরাম হোসেন', 'বিডব্লিউডিবি', 'bwdb', 'r_202', '202', dateStr(-118), dateStr(-112), 'checked_out', 480, 'u_admin'),
  makeBooking('bk_121', dateStr(-115), 'মিসেস জান্নাতুল ফেরদৌস', '', 'private', 'r_201', '201', dateStr(-113), dateStr(-108), 'checked_out', 3000, 'u_admin'),
  makeBooking('bk_122', dateStr(-100), 'মোঃ নূরুল ইসলাম', 'বিডব্লিউডিবি', 'bwdb', 'r_203', '203', dateStr(-98), dateStr(-92), 'checked_out', 480, 'u_admin'),
  makeBooking('bk_123', dateStr(-90), 'সুমন চক্রবর্তী', '', 'private', 'r_302', '302', dateStr(-88), dateStr(-85), 'checked_out', 1800, 'u_admin'),

  // Future bookings
  makeBooking('bk_200', dateStr(2), 'মোঃ আসিফ রহমান', '', 'private', 'r_303', '303', dateStr(5), dateStr(8), 'booked', 0, 'u_caretaker'),
  makeBooking('bk_201', dateStr(3), 'মোঃ খালেদ হোসেন', 'বিডব্লিউডিবি', 'bwdb', 'r_so', 'SO', dateStr(4), dateStr(6), 'booked', 0, 'u_admin'),
];