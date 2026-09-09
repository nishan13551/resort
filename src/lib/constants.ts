import { GuestType, UserRole, PaymentStatus, BookingStatus } from './types';

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  bwdb: 'বিডব্লিউডিবি',
  govt_other: 'অন্যান্য সরকারি অফিস',
  private: 'এনজিও / সাধারণ',
  ngo: 'এনজিও',
  general: 'সাধারণ',
};

export const GUEST_TYPE_RATES: Record<GuestType, number> = {
  bwdb: 70,
  govt_other: 280,
  private: 600,
  ngo: 600,
  general: 600,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'অ্যাডমিন',
  caretaker: 'কেয়ারটেকার',
  viewer: 'দর্শক',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'পরিশোধিত',
  partial: 'আংশিক',
  unpaid: 'অপরিশোধিত',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  booked: 'বুক করা',
  checked_in: 'চেক-ইন সম্পন্ন',
  checked_out: 'চেক-আউট সম্পন্ন',
  cancelled: 'বাতিল',
};

export const ROOM_STATUS_LABELS: Record<string, string> = {
  available: 'খালি',
  booked: 'বুক করা',
  occupied: 'অবস্থানরত',
};

export const BENGALI = {
  // Navigation
  appName: 'ধানসিঁড়ি রেস্ট হাউজ ম্যানেজমেন্ট সিস্টেম',
  dashboard: 'ড্যাশবোর্ড',
  rooms: 'রুমসমূহ',
  bookings: 'বুকিং',
  newBooking: 'নতুন বুকিং',
  checkin: 'চেক-ইন',
  checkout: 'চেক-আউট',
  calendar: 'ক্যালেন্ডার',
  reports: 'রিপোর্ট',
  history: 'বুকিং ইতিহাস',
  users: 'ব্যবহারকারী',
  settings: 'সেটিংস',

  // Dashboard
  todayBookings: 'আজকের বুকিং',
  todayRevenue: 'আজকের আয়',
  monthRevenue: 'এই মাসের আয়',
  totalBookings: 'মোট বুকিং',
  availableRooms: 'খালি রুম',
  bookedRooms: 'বুক করা রুম',
  occupiedRooms: 'অবস্থানরত রুম',
  todaysCheckin: 'আজকের চেক-ইন',
  todaysCheckout: 'আজকের চেক-আউট',
  roomStatusOverview: 'রুমের অবস্থা',
  noCheckins: 'আজ কোনো চেক-ইন নেই',
  noCheckouts: 'আজ কোনো চেক-আউট নেই',

  // Room Management
  roomNumber: 'রুম নম্বর',
  roomName: 'রুমের নাম',
  roomStatus: 'রুমের অবস্থা',
  addRoom: 'রুম যোগ করুন',
  editRoom: 'রুম সম্পাদনা',
  deactivateRoom: 'রুম নিষ্ক্রিয় করুন',
  activateRoom: 'রুম সক্রিয় করুন',
  currentGuest: 'বর্তমান অতিথি',
  bookingHistory: 'বুকিং ইতিহাস',
  noActiveBooking: 'কোনো সক্রিয় বুকিং নেই',

  // Booking
  bookingDate: 'বুকিং তারিখ',
  guestName: 'অতিথির নাম',
  guestType: 'অতিথির ধরন',
  organization: 'প্রতিষ্ঠান/বিভাগ',
  numberOfDays: 'অবস্থানের দিন সংখ্যা',
  checkInDate: 'চেক-ইন তারিখ',
  checkOutDate: 'চেক-আউট তারিখ',
  dailyRent: 'দৈনিক ভাড়া',
  totalRent: 'মোট ভাড়া',
  notes: 'নোট',
  createBooking: 'বুকিং তৈরি করুন',
  bookingCreated: 'বুকিং সফলভাবে তৈরি হয়েছে!',

  // Check-in/out
  selectBooking: 'বুকিং নির্বাচন করুন',
  performCheckin: 'চেক-ইন সম্পন্ন করুন',
  performCheckout: 'চেক-আউট সম্পন্ন করুন',
  checkinSuccess: 'চেক-ইন সফল হয়েছে!',
  checkoutSuccess: 'চেক-আউট সফল হয়েছে!',

  // Payment
  payment: 'পেমেন্ট',
  amountPaid: 'পরিশোধিত পরিমাণ',
  dueAmount: 'বকেয়া',
  paymentStatus: 'পেমেন্ট অবস্থা',
  enterPaymentAmount: 'পরিশোধিত পরিমাণ লিখুন',

  // Reports
  totalRevenue: 'মোট আয়',
  totalCollected: 'মোট সংগ্রহ',
  totalDue: 'মোট বকেয়া',
  revenueByGuestType: 'অতিথির ধরন অনুযায়ী আয়',
  roomWiseRevenue: 'রুম অনুযায়ী আয়',
  guestStayReport: 'অতিথির অবস্থান রিপোর্ট',
  monthlyRevenueChart: 'মাসিক আয় চার্ট',
  occupancyChart: 'অবস্থান চার্ট',
  filterByDate: 'তারিখ অনুযায়ী ফিল্টার',
  filterByGuestType: 'অতিথির ধরন অনুযায়ী ফিল্টার',
  filterByRoom: 'রুম অনুযায়ী ফিল্টার',
  today: 'আজ',
  thisWeek: 'এই সপ্তাহ',
  thisMonth: 'এই মাস',
  customRange: 'কাস্টম তারিখ',

  // User Management
  addUser: 'ব্যবহারকারী যোগ করুন',
  editUser: 'ব্যবহারকারী সম্পাদনা',
  fullName: 'পুরো নাম',
  email: 'ইমেইল',
  password: 'পাসওয়ার্ড',
  role: 'ভূমিকা',
  active: 'সক্রিয়',
  inactive: 'নিষ্ক্রিয়',

  // Actions
  save: 'সংরক্ষণ করুন',
  cancel: 'বাতিল',
  edit: 'সম্পাদনা',
  delete: 'মুছুন',
  search: 'অনুসন্ধান',
  exportCSV: 'CSV এক্সপোর্ট',
  filter: 'ফিল্টার',
  noData: 'কোনো তথ্য নেই',

  // Conflict
  roomUnavailable: 'রুম ইতিমধ্যে বুক করা হয়েছে',
  roomAvailable: 'রুম খালি আছে',
  conflictWarning: 'এই তারিখে রুম ইতিমধ্যে বুক করা হয়েছে!',

  // Login
  login: 'লগইন',
  logout: 'লগআউট',
  welcome: 'স্বাগতম',
  invalidCredentials: 'ভুল ইমেইল বা পাসওয়ার্ড',

  // Misc
  currency: '৳',
  taka: 'টাকা',
  status: 'অবস্থা',
  date: 'তারিখ',
  action: 'কার্যক্রম',
  id: 'আইডি',
  days: 'দিন',
  from: 'থেকে',
  to: 'পর্যন্ত',
  of: 'এর',
  total: 'মোট',
  confirm: 'নিশ্চিত করুন',
  close: 'বন্ধ করুন',
  loading: 'লোড হচ্ছে...',
  error: 'ত্রুটি',
  success: 'সফল',
  warning: 'সতর্কতা',
} as const;
