'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole, GuestType, PaymentStatus, BookingStatus } from './types';

export type Lang = 'bn' | 'en';

type Dict = Record<string, string>;

const bn: Dict = {
  appName: 'ধানসিঁড়ি রেস্ট হাউজ',
  appSubtitle: 'ব্যবস্থাপনা সিস্টেম',
  version: 'সংস্করণ',

  // Navigation
  'nav.dashboard': 'ড্যাশবোর্ড',
  'nav.rooms': 'রুমসমূহ',
  'nav.bookings': 'বুকিং',
  'nav.newBooking': 'নতুন বুকিং',
  'nav.checkin': 'চেক-ইন',
  'nav.checkout': 'চেক-আউট',
  'nav.calendar': 'রুম ক্যালেন্ডার',
  'nav.reports': 'রিপোর্ট',
  'nav.history': 'বুকিং ইতিহাস',
  'nav.users': 'ব্যবহারকারী',
  'nav.settings': 'সেটিংস',
  'nav.logout': 'লগআউট',

  // Page titles
  'title.dashboard': 'ড্যাশবোর্ড',
  'title.rooms': 'রুমসমূহ',
  'title.bookings': 'বুকিং তালিকা',
  'title.checkin': 'চেক-ইন',
  'title.checkout': 'চেক-আউট',
  'title.calendar': 'রুম ক্যালেন্ডার',
  'title.reports': 'রিপোর্ট ও পরিসংখ্যান',
  'title.history': 'বুকিং ইতিহাস',
  'title.users': 'ব্যবহারকারী ব্যবস্থাপনা',
  'title.settings': 'সেটিংস',

  // Common
  'common.cancel': 'বাতিল',
  'common.save': 'সংরক্ষণ করুন',
  'common.edit': 'সম্পাদনা',
  'common.delete': 'মুছুন',
  'common.search': 'অনুসন্ধান',
  'common.action': 'কার্যক্রম',
  'common.id': 'আইডি',
  'common.status': 'স্থিতি',
  'common.date': 'তারিখ',
  'common.notes': 'নোট',
  'common.close': 'বন্ধ করুন',
  'common.confirm': 'নিশ্চিত করুন',
  'common.loading': 'লোড হচ্ছে...',
  'common.total': 'মোট',
  'common.yes': 'হ্যাঁ',
  'common.no': 'না',
  'common.add': 'যোগ করুন',
  'common.history': 'ইতিহাস',
  'common.all': 'সব',
  'common.optional': 'আপশনাল',
  'common.from': 'থেকে',
  'common.to': 'পর্যন্ত',
  'common.today': 'আজ',
  'common.more': 'আরও',
  'common.selected': 'নির্বাচিত',
  'common.busy': 'ব্যস্ত',
  'common.noData': 'কোনো তথ্য নেই',
  'common.peopleCount': '{n} জন',
  'common.permissionDenied': 'অনুমতি নেই',
  'common.permissionDeniedDesc': 'এই পৃষ্ঠায় প্রবেশের জন্য আপনার অনুমতি নেই।',
  'common.notFound': 'পৃষ্ঠাটি পাওয়া যায়নি',
  'common.notFoundDesc': 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই।',
  'common.goHome': 'হোম পেজে যান',

  // Roles
  'role.admin': 'অ্যাডমিন',
  'role.caretaker': 'কেয়ারটেকার',
  'role.viewer': 'দর্শক',
  'common.active': 'সক্রিয়',
  'common.inactive': 'নিষ্ক্রিয়',

  // Guest types
  'guestType.bwdb': 'বিডব্লিউডিবি',
  'guestType.govtOther': 'অন্যান্য সরকারি অফিস',
  'guestType.private': 'এনজিও / সাধারণ',

  // Labels
  guestNameLabel: 'অতিথির নাম',
  guestTypeLabel: 'অতিথির ধরন',
  orgLabel: 'প্রতিষ্ঠান/বিভাগ',
  bookingDateLabel: 'বুকিং তারিখ',
  checkInLabel: 'চেক-ইন তারিখ',
  checkOutLabel: 'চেক-আউট তারিখ',
  numberDaysLabel: 'অবস্থানের দিন সংখ্যা',
  dailyRateLabel: 'দৈনিক ভাড়া',
  totalRentLabel: 'মোট ভাড়া',
  amountPaidLabel: 'পরিশোধিত পরিমাণ',
  dueLabel: 'বকেয়া',
  paymentStatusLabel: 'পেমেন্ট অবস্থা',
  roomLabel: 'রুম',
  roomNumberLabel: 'রুম নম্বর',
  roomNameLabel: 'রুমের নাম',
  currentGuestLabel: 'বর্তমান অতিথি',
  noActiveBookingLabel: 'কোনো সক্রিয় বুকিং নেই',
  roomStatusLabel: 'রুমের অবস্থা',
  selectRoomLabel: 'রুম নির্বাচন করুন',

  // Payment / booking status
  'paymentStatus.paid': 'পরিশোধিত',
  'paymentStatus.partial': 'আংশিক',
  'paymentStatus.unpaid': 'অপরিশোধিত',
  'bookingStatus.booked': 'বুক করা',
  'bookingStatus.checkedIn': 'অবস্থানরত',
  'bookingStatus.checkedOut': 'সম্পন্ন',
  'bookingStatus.cancelled': 'বাতিল',
  'roomStatus.available': 'খালি',
  'roomStatus.booked': 'বুক করা',
  'roomStatus.occupied': 'অবস্থানরত',

  // Dashboard
  'dash.todayBookings': 'আজকের বুকিং',
  'dash.todayRevenue': 'আজকের আয়',
  'dash.monthRevenue': 'এই মাসের আয়',
  'dash.totalBookings': 'মোট বুকিং',
  'dash.availableRooms': 'খালি রুম',
  'dash.bookedRooms': 'বুক করা রুম',
  'dash.occupiedRooms': 'অবস্থানরত রুম',
  'dash.subTodayBookings': 'আজকের বুকিং',
  'dash.subTodayRevenue': 'আজকের আয়',
  'dash.subMonthRevenue': 'চলমান মাস',
  'dash.subTotalBookings': 'মোট বুকিং',
  'dash.subAvailableRooms': 'ব্যবহারের জন্য খালি',
  'dash.subBookedRooms': 'আগামী বুকিং',
  'dash.subOccupiedRooms': 'বর্তমানে অবস্থানরত',
  'dash.todaysCheckin': 'আজকের চেক-ইন',
  'dash.todaysCheckout': 'আজকের চেক-আউট',
  'dash.roomStatusOverview': 'রুমের অবস্থা',
  'dash.noCheckins': 'আজ কোনো চেক-ইন নেই',
  'dash.noCheckouts': 'আজ কোনো চেক-আউট নেই',
  'dash.checkoutOn': 'চেক-আউট:',
  'dash.goToCheckin': 'চেক-ইন পেজে যান',
  'dash.goToCheckout': 'চেক-আউট পেজে যান',
  'dash.clickToEdit': 'সম্পাদনা করুন',
  'dash.editValue': 'মান সম্পাদনা',
  'dash.autoValue': 'স্বয়ংক্রিয় মান',
  'dash.overrideValue': 'নতুন মান',
  'dash.clearOverride': 'স্বয়ংক্রিয় মানে ফেরত',

  // Room cards
  'room.currentGuest': 'বর্তমান অতিথি',
  'room.bookingHistory': 'বুকিং ইতিহাস (সাম্প্রতিক)',
  'room.noGuest': 'কোনো সক্রিয় অতিথি নেই — রুমটি খালি',
  'room.bookingsCount': '{n} টি বুকিং',
  'room.addRoom': 'রুম যোগ করুন',
  'room.editRoom': 'রুম সম্পাদনা',
  'room.newRoom': 'নতুন রুম যোগ করুন',
  'room.roomNumberRequired': 'রুম নম্বর প্রয়োজন',
  'room.updated': 'রুম আপডেট করা হয়েছে',
  'room.added': 'নতুন রুম যোগ করা হয়েছে',
  'room.deactivated': 'রুম নিষ্ক্রিয় করা হয়েছে',
  'room.activated': 'রুম সক্রিয় করা হয়েছে',
  'room.exampleNumber': 'যেমন: 204',
  'room.exampleName': 'যেমন: রুম ২০৪',
  'room.noBookings': 'এই রুমে কোনো বুকিং নেই',
  'room.roomNumber2': 'রুম নম্বর',
  'room.roomName2': 'রুমের নাম (ঐচ্ছিক)',

  // Booking form
  'form.bookingDate': 'বুকিং তারিখ',
  'form.guestName': 'অতিথির নাম',
  'form.guestNameRequired': 'অতিথির নাম লিখুন',
  'form.org': 'প্রতিষ্ঠান/বিভাগ (ঐচ্ছিক)',
  'form.orgPlaceholder': 'যেমন: বিডব্লিউডিবি, এলজিইডি',
  'form.guestType': 'অতিথির ধরন',
  'form.checkIn': 'চেক-ইন তারিখ',
  'form.checkOut': 'চেক-আউট তারিখ',
  'form.checkoutAfterCheckin': 'চেক-আউট তারিখ অবশ্যই চেক-ইন তারিখের পরে হতে হবে',
  'form.daysMin': 'অবস্থানের দিন সংখ্যা কমপক্ষে ১ দিন হতে হবে',
  'form.selectRoomRequired': 'রুম নির্বাচন করুন',
  'form.datesRequired': 'চেক-ইন ও চেক-আউট তারিখ দিন',
  'form.notes': 'নোট (ঐচ্ছিক)',
  'form.notesPlaceholder': 'কোনো বিশেষ নির্দেশনা থাকলে লিখুন',
  'form.selectRoom': 'রুম নির্বাচন করুন',
  'form.reservedDatesNote': 'নির্বাচিত তারিখে ব্যস্ত',
  'form.rentCalculation': 'ভাড়া গণনা',
  'form.dailyRate': 'দৈনিক ভাড়া',
  'form.numberOfDays': 'অবস্থানের দিন সংখ্যা',
  'form.roomCount': 'রুম সংখ্যা',
  'form.selectedRooms': 'নির্বাচিত রুম',
  'form.totalRent': 'মোট ভাড়া',
  'form.calculationText': '{type} × {rate}/দিন = {total}',
  'form.createBooking': 'বুকিং তৈরি করুন',
  'form.bookingCreated': 'বুকিং সফলভাবে তৈরি হয়েছে',
  'form.validate': 'দয়া করে ফর্মটি যাচাই করুন',
  'form.roomBusyNow': 'রুমটি নির্বাচিত তারিখের জন্য এখন ব্যস্ত, অন্য রুম নির্বাচন করুন',
  'form.conflictError': 'রুমটি নির্বাচিত তারিখের জন্য ইতিমধ্যে বুক করা হয়েছে।',
  'form.conflictDetail': 'এই রুমে {guest} ({start} থেকে {end}) পর্যন্ত অবস্থান করবেন।',

  // Bookings list
  'list.active': 'সক্রিয়:',
  'list.todaysBookings': 'আজকের বুকিং:',
  'list.occupiedRooms': 'অবস্থানরত রুম:',
  'list.newBooking': 'নতুন বুকিং',
  'list.searchPlaceholder': 'অতিথির নাম বা রুম নম্বর অনুসন্ধান',
  'list.allGuestTypes': 'সব ধরনের অতিথি',
  'list.allRooms': 'সব রুম',
  'list.allStatuses': 'সব স্থিতি',
  'list.allRooms2': 'সব রুম',
  'list.noBookings': 'কোনো বুকিং পাওয়া যায়নি',
  'list.deleteBookig': 'বুকিং মুছুন',
  'list.deleteConfirm': 'আপনি কি নিশ্চিতভাবে এই বুকিং মুছে ফেলতে চান?',
  'list.deleted': 'বুকিং মুছে ফেলা হয়েছে',
  'list.cancelBooking': 'বুকিং বাতিল করুন',
  'list.cancelConfirm': '-এর বুকিং বাতিল করবেন?',
  'list.cancelled': 'বুকিং বাতিল করা হয়েছে',
  'list.cancelBooking2': 'বাতিল করুন',
  'list.checkinDone': '{name}-এর চেক-ইন সম্পন্ন হয়েছে',
  'list.checkoutTitle': 'চেক-আউট',
  'list.columnCheckin': 'চেক-ইন',
  'list.columnCheckout': 'চেক-আউট',
  'list.columnGuest': 'অতিথির নাম',
  'list.columnRoom': 'রুম',
  'list.columnGuestType': 'অতিথির ধরন',
  'list.columnTotal': 'মোট ভাড়া',
  'list.columnDue': 'বকেয়া',
  'list.columnStatus': 'স্থিতি',

  // Check-in
  'ci.pending': 'পেন্ডিং চেক-ইন',
  'ci.currentlyOccupied': 'বর্তমানে অবস্থানরত রুমসমূহ',
  'ci.noPending': 'পেন্ডিং কোনো চেক-ইন নেই',
  'ci.noOccupied': 'বর্তমানে কোনো রুমে অতিথি অবস্থান করছেন না',
  'ci.todayTag': 'আজ',
  'ci.lateTag': 'দেরি',
  'ci.upcomingTag': 'আসন্ন',
  'ci.button': 'চেক-ইন',
  'ci.confirmTitle': 'চেক-ইন নিশ্চিত করুন',
  'ci.confirmDesc': 'অতিথির চেক-ইন নিশ্চিত করতে চান?',
  'ci.complete': 'চেক-ইন সম্পন্ন করুন',
  'ci.done': 'চেক-ইন সফল হয়েছে!',
  'ci.sendToCheckout': 'চেক-আউটে পাঠান',
  'ci.access': 'শুধুমাত্র অ্যাডমিন বা কেয়ারটেকার চেক-ইন করতে পারেন।',
  'ci.days': 'দিন',
  'ci.checkoutOn': 'চেক-আউট:',

  // Check-out
  'co.currentlyCheckedIn': 'বর্তমানে চেক-ইন করা অতিথিরা',
  'co.activeGuests': 'সক্রিয় অতিথিরা',
  'co.formIntro': 'অতিথির তথ্য প্রবেশ করিয়ে চেক-আউট সম্পন্ন করুন',
  'co.noGuests': 'চেক-আউটের জন্য কোনো অতিথি নেই',
  'co.todayTag': 'আজ',
  'co.button': 'চেক-আউট',
  'co.title': 'চেক-আউট',
  'co.bookingSummary': 'বুকিং সারসংক্ষেপ',
  'co.guestDetails': 'অতিথির বিবরণ',
  'co.totalRent': 'মোট ভাড়া',
  'co.amountPaid': 'পরিশোধিত পরিমাণ',
  'co.paid': 'পরিশোধিত',
  'co.due': 'বকেয়া',
  'co.complete': 'চেক-আউট সম্পন্ন করুন',
  'co.done': 'চেক-আউট সম্পন্ন — রুম খালি করা হয়েছে',
  'co.access': 'শুধুমাত্র অ্যাডমিন বা কেয়ারটেকার চেক-আউট করতে পারেন।',
  'co.notPaid': 'অপরিশোধিত',
  'co.paidShort': 'পরিশোধিত',
  'co.calculation': 'দৈনিক ভাড়া × দিন',
  'co.calcDetail': '{rate}/দিন × {days} দিন × {rooms} রুম = {total}',
  'co.checkInOn': 'চেক-ইন',
  'co.checkOutOn': 'চেক-আউট',
  'co.days': 'অবস্থানের দিন',

  // Calendar
  'cal.daily': 'দৈনিক',
  'cal.weekly': 'সাপ্তাহিক',
  'cal.monthly': 'মাসিক',
  'cal.title': 'রুম ক্যালেন্ডার',
  'cal.subtitle': 'সব রুমের বুকিং এক নজরে',
  'cal.free': 'খালি',
  'cal.booked': 'বুক করা',
  'cal.occupied': 'অবস্থানরত',
  'cal.completed': 'সম্পন্ন',
  'cal.noBooking': 'কোনো বুকিং নেই',
  'cal.more': '+{n} আরও',
  'cal.room': 'রুম',

  // Reports
  'rep.title': 'রিপোর্ট ও পরিসংখ্যান',
  'rep.filterToday': 'আজ',
  'rep.filterWeek': 'এই সপ্তাহ',
  'rep.filterMonth': 'এই মাস',
  'rep.filterCustom': 'কাস্টম',
  'rep.startDate': 'শুরুর তারিখ',
  'rep.endDate': 'শেষ তারিখ',
  'rep.totalBookings': 'মোট বুকিং',
  'rep.totalRevenue': 'মোট আয়',
  'rep.totalCollected': 'মোট সংগ্রহ',
  'rep.totalDue': 'মোট বকেয়া',
  'rep.monthlyChart': 'মাসিক আয় চার্ট',
  'rep.revenueByType': 'অতিথির ধরন অনুযায়ী আয়',
  'rep.roomWise': 'রুম অনুযায়ী আয়',
  'rep.occupancy': 'রুম দখল পরিস্থিতি',
  'rep.occupied': 'অবস্থানরত',
  'rep.booked': 'বুক করা',
  'rep.available': 'খালি',
  'rep.revenueAnalysis': 'অতিথির ধরন অনুযায়ী আয়ের বিশ্লেষণ',
  'rep.stayReport': 'অতিথির অবস্থান রিপোর্ট',
  'rep.bookingsCount': '{n} টি বুকিং',
  'rep.noData': 'এই সময়সীমায় কোনো বুকিং নেই',
  'rep.revenue': 'আয়',
  'rep.guestName': 'অতিথির নাম',
  'rep.room': 'রুম',
  'rep.guestType': 'অতিথির ধরন',
  'rep.checkIn': 'চেক-ইন',
  'rep.checkOut': 'চেক-আউট',
  'rep.days': 'দিন',
  'rep.totalRent': 'মোট ভাড়া',
  'rep.payment': 'পেমেন্ট',
  'rep.paid': 'পরিশোধিত',
  'rep.partial': 'আংশিক',
  'rep.unpaid': 'অপরিশোধিত',

  // History
  'his.title': 'বুকিং ইতিহাস',
  'his.resultCount': '{n} টি বুকিং পাওয়া গেছে',
  'his.export': 'CSV এক্সপোর্ট',
  'his.searchPlaceholder': 'অতিথির নাম / রুম',
  'his.fromDate': 'শুরুর তারিখ',
  'his.toDate': 'শেষ তারিখ',
  'his.guestTypeFilter': 'সব অতিথির ধরন',
  'his.roomFilter': 'সব রুম',
  'his.statusFilter': 'সব স্থিতি',
  'his.totalRent': 'মোট ভাড়া:',
  'his.totalPaid': 'মোট পরিশোধিত:',
  'his.totalDue': 'মোট বকেয়া:',
  'his.csvDownloaded': 'CSV ফাইল ডাউনলোড করা হয়েছে',
  'his.bookingId': 'বুকিং আইডি',
  'his.guestName': 'অতিথির নাম',
  'his.room': 'রুম',
  'his.guestType': 'অতিথির ধরন',
  'his.checkIn': 'চেক-ইন',
  'his.checkOut': 'চেক-আউট',
  'his.days': 'দিন',
  'his.totalRentCol': 'মোট ভাড়া',
  'his.paidCol': 'পরিশোধিত',
  'his.dueCol': 'বকেয়া',
  'his.statusCol': 'স্থিতি',
  'his.noData': 'কোনো বুকিং পাওয়া যায়নি',

  // Users
  'user.title': 'ব্যবহারকারী ব্যবস্থাপনা',
  'user.subtitle': 'অ্যাডমিন, কেয়ারটেকার ও দর্শক পরিচালনা',
  'user.add': 'ব্যবহারকারী যোগ করুন',
  'user.edit': 'ব্যবহারকারী সম্পাদনা',
  'user.new': 'নতুন ব্যবহারকারী',
  'user.fullName': 'পুরো নাম',
  'user.email': 'ইমেইল',
  'user.password': 'প্রাথমিক পাসওয়ার্ড',
  'user.passwordPlaceholder': 'নতুন ব্যবহারকারীর জন্য একটি পাসওয়ার্ড দিন',
  'user.role': 'ভূমিকা',
  'user.nameRequired': 'নাম ও ইমেইল প্রয়োজন',
  'user.updated': 'ব্যবহারকারী আপডেট করা হয়েছে',
  'user.added': 'নতুন ব্যবহারকারী যোগ করা হয়েছে',
  'user.deactivated': 'ব্যবহারকারী নিষ্ক্রিয় করা হয়েছে',
  'user.activated': 'ব্যবহারকারী সক্রিয় করা হয়েছে',
  'user.bookingsCreated': '{n} টি বুকিং তৈরি',
  'user.addedDate': 'যোগ:',
  'user.adminOnly': 'এই পৃষ্ঠাটি শুধুমাত্র অ্যাডমিন ব্যবহার করতে পারেন।',

  // Settings
  'set.title': 'সেটিংস',
  'set.subtitle': 'সিস্টেম কনফিগারেশন',
  'set.rentRates': 'ভাড়ার হার',
  'set.perDay': '/ দিন',
  'set.dataManagement': 'ডেটা ব্যবস্থাপনা',
  'set.resetDemo': 'ডেমো ডেটা রিসেট',
  'set.resetConfirm': 'আপনি কি নিশ্চিত? সব বুকিং ও রুম ডেটা রিসেট হয়ে ডিফল্ট ডেমো ডেটায় ফিরে যাবে।',
  'set.resetDone': 'ডেটা রিসেট করে ডেমো ডেটা লোড হয়েছে',
  'set.resetFailed': 'রিসেট ব্যর্থ হয়েছে',
  'set.resetInProgress': 'রিসেট হচ্ছে...',
  'set.reset': 'রিসেট করুন',
  'set.deleteConfim': 'আপনি কি নিশ্চিতভাবে এই বুকিং মুছে ফেলতে চান?',
  'set.rateAdminNote': 'ভাড়ার হার পরিবর্তন করতে অ্যাডমিনের অনুমোদন প্রয়োজন। (Supabase সংযোগের পরে সম্পূর্ণ হবেন)',
  'set.rateCaretakerNote': 'কেবল অ্যাডমিন ভাড়ার হার পরিবর্তন করতে পারেন।',
  'set.localStorageNote': 'এই সংস্করণে ডেটা ব্রাউজারে সংরক্ষিত হয়। Supabase সংযোগের পরে সব ডেটা ক্লাউডে সংরক্ষিত হবে।',
  'set.onlineResetNote': 'ক্লাউড ডেটা সক্রিয় — শেয়ার করা ডেটা রিসেট করতে টার্মিনালে `npm run seed:supabase` চালান।',

  // Login
  'login.title': 'লগইন করুন',
  'login.subtitle': 'আপনার অ্যাকাউন্টে প্রবেশ করুন',
  'login.emailPlaceholder': 'your@email.com',
  'login.passwordPlaceholder': '••••••••',
  'login.button': 'লগইন করুন',
  'login.invalid': 'ভুল ইমেইল বা পাসওয়ার্ড',
  'login.disabled': 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে',
  'login.failed': 'লগইন ব্যর্থ হয়েছে',

  // Toast
  ok: 'ঠিক আছে',
};

const en: Dict = {
  appName: 'Dhansiri Rest House',
  appSubtitle: 'Management System',
  version: 'Version',

  'nav.dashboard': 'Dashboard',
  'nav.rooms': 'Rooms',
  'nav.bookings': 'Bookings',
  'nav.newBooking': 'New Booking',
  'nav.checkin': 'Check-In',
  'nav.checkout': 'Check-Out',
  'nav.calendar': 'Room Calendar',
  'nav.reports': 'Reports',
  'nav.history': 'Booking History',
  'nav.users': 'Users',
  'nav.settings': 'Settings',
  'nav.logout': 'Logout',

  'title.dashboard': 'Dashboard',
  'title.rooms': 'Rooms',
  'title.bookings': 'Booking List',
  'title.checkin': 'Check-In',
  'title.checkout': 'Check-Out',
  'title.calendar': 'Room Calendar',
  'title.reports': 'Reports & Analytics',
  'title.history': 'Booking History',
  'title.users': 'User Management',
  'title.settings': 'Settings',

  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.search': 'Search',
  'common.action': 'Actions',
  'common.id': 'ID',
  'common.status': 'Status',
  'common.date': 'Date',
  'common.notes': 'Notes',
  'common.close': 'Close',
  'common.confirm': 'Confirm',
  'common.loading': 'Loading...',
  'common.total': 'Total',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.add': 'Add',
  'common.history': 'History',
  'common.all': 'All',
  'common.optional': 'Optional',
  'common.from': 'From',
  'common.to': 'To',
  'common.today': 'Today',
  'common.more': 'More',
  'common.selected': 'Selected',
  'common.busy': 'Busy',
  'common.noData': 'No data available',
  'common.peopleCount': '{n} people',
  'common.permissionDenied': 'Permission Denied',
  'common.permissionDeniedDesc': 'You are not authorized to view this page.',
  'common.notFound': 'Page not found',
  'common.notFoundDesc': 'The page you are looking for does not exist.',
  'common.goHome': 'Go to Home',

  'role.admin': 'Admin',
  'role.caretaker': 'Caretaker',
  'role.viewer': 'Viewer',
  'common.active': 'Active',
  'common.inactive': 'Inactive',

  'guestType.bwdb': 'BWDB',
  'guestType.govtOther': 'Other Govt. Office',
  'guestType.private': 'NGO / General',

  guestNameLabel: 'Guest Name',
  guestTypeLabel: 'Guest Type',
  orgLabel: 'Organization/Department',
  bookingDateLabel: 'Booking Date',
  checkInLabel: 'Check-In Date',
  checkOutLabel: 'Check-Out Date',
  numberDaysLabel: 'Number of Days',
  dailyRateLabel: 'Daily Rent',
  totalRentLabel: 'Total Rent',
  amountPaidLabel: 'Amount Paid',
  dueLabel: 'Due',
  paymentStatusLabel: 'Payment Status',
  roomLabel: 'Room',
  roomNumberLabel: 'Room Number',
  roomNameLabel: 'Room Name',
  currentGuestLabel: 'Current Guest',
  noActiveBookingLabel: 'No active booking',
  roomStatusLabel: 'Room Status',
  selectRoomLabel: 'Select a Room',

  'paymentStatus.paid': 'Paid',
  'paymentStatus.partial': 'Partial',
  'paymentStatus.unpaid': 'Unpaid',
  'bookingStatus.booked': 'Booked',
  'bookingStatus.checkedIn': 'Occupied',
  'bookingStatus.checkedOut': 'Completed',
  'bookingStatus.cancelled': 'Cancelled',
  'roomStatus.available': 'Available',
  'roomStatus.booked': 'Booked',
  'roomStatus.occupied': 'Occupied',

  'dash.todayBookings': "Today's Bookings",
  'dash.todayRevenue': "Today's Revenue",
  'dash.monthRevenue': "This Month's Revenue",
  'dash.totalBookings': 'Total Bookings',
  'dash.availableRooms': 'Available Rooms',
  'dash.bookedRooms': 'Booked Rooms',
  'dash.occupiedRooms': 'Occupied Rooms',
  'dash.subTodayBookings': "Today's bookings",
  'dash.subTodayRevenue': "Today's revenue",
  'dash.subMonthRevenue': 'Current month',
  'dash.subTotalBookings': 'All bookings',
  'dash.subAvailableRooms': 'Ready to use',
  'dash.subBookedRooms': 'Upcoming bookings',
  'dash.subOccupiedRooms': 'Currently staying',
  'dash.todaysCheckin': "Today's Check-Ins",
  'dash.todaysCheckout': "Today's Check-Outs",
  'dash.roomStatusOverview': 'Room Status Overview',
  'dash.noCheckins': 'No check-ins today',
  'dash.noCheckouts': 'No check-outs today',
  'dash.checkoutOn': 'Check-out:',
  'dash.goToCheckin': 'Go to Check-In page',
  'dash.goToCheckout': 'Go to Check-Out page',
  'dash.clickToEdit': 'Edit',
  'dash.editValue': 'Edit Value',
  'dash.autoValue': 'Auto value',
  'dash.overrideValue': 'New value',
  'dash.clearOverride': 'Reset to auto',

  'room.currentGuest': 'Current Guest',
  'room.bookingHistory': 'Booking History (Recent)',
  'room.noGuest': 'No active guest — room is available',
  'room.bookingsCount': '{n} bookings',
  'room.addRoom': 'Add Room',
  'room.editRoom': 'Edit Room',
  'room.newRoom': 'Add New Room',
  'room.roomNumberRequired': 'Room number is required',
  'room.updated': 'Room updated',
  'room.added': 'New room added',
  'room.deactivated': 'Room deactivated',
  'room.activated': 'Room activated',
  'room.exampleNumber': 'e.g. 204',
  'room.exampleName': 'e.g. Room 204',
  'room.noBookings': 'No bookings for this room',
  'room.roomNumber2': 'Room Number',
  'room.roomName2': 'Room Name (optional)',

  'form.bookingDate': 'Booking Date',
  'form.guestName': 'Guest Name',
  'form.guestNameRequired': 'Please enter guest name',
  'form.org': 'Organization/Department (optional)',
  'form.orgPlaceholder': 'e.g. BWDB, LGED',
  'form.guestType': 'Guest Type',
  'form.checkIn': 'Check-In Date',
  'form.checkOut': 'Check-Out Date',
  'form.checkoutAfterCheckin': 'Check-out date must be after check-in date',
  'form.daysMin': 'Number of days must be at least 1',
  'form.selectRoomRequired': 'Please select a room',
  'form.datesRequired': 'Please provide check-in and check-out dates',
  'form.notes': 'Notes (optional)',
  'form.notesPlaceholder': 'Write any special instructions',
  'form.selectRoom': 'Select a Room',
  'form.reservedDatesNote': 'Busy for selected dates',
  'form.rentCalculation': 'Rent Calculation',
  'form.dailyRate': 'Daily Rate',
  'form.numberOfDays': 'Number of Days',
  'form.roomCount': 'Rooms',
  'form.selectedRooms': 'Selected Rooms',
  'form.totalRent': 'Total Rent',
  'form.calculationText': '{type} × {rate}/day = {total}',
  'form.createBooking': 'Create Booking',
  'form.bookingCreated': 'Booking created successfully',
  'form.validate': 'Please review the form',
  'form.roomBusyNow': 'Room is now busy for the selected dates, please pick another room',
  'form.conflictError': 'Room is already booked for the selected dates.',
  'form.conflictDetail': '{guest} will occupy this room from {start} to {end}.',

  'list.active': 'Active:',
  'list.todaysBookings': "Today's bookings:",
  'list.occupiedRooms': 'Occupied rooms:',
  'list.newBooking': 'New Booking',
  'list.searchPlaceholder': 'Search guest name or room number',
  'list.allGuestTypes': 'All guest types',
  'list.allRooms': 'All rooms',
  'list.allStatuses': 'All statuses',
  'list.allRooms2': 'All rooms',
  'list.noBookings': 'No bookings found',
  'list.deleteBookig': 'Delete Booking',
  'list.deleteConfirm': 'Are you sure you want to delete this booking?',
  'list.deleted': 'Booking deleted',
  'list.cancelBooking': 'Cancel Booking',
  'list.cancelConfirm': 'Cancel the booking for',
  'list.cancelled': 'Booking cancelled',
  'list.cancelBooking2': 'Cancel Booking',
  'list.checkinDone': '{name} checked in successfully',
  'list.checkoutTitle': 'Check-Out',
  'list.columnCheckin': 'Check-In',
  'list.columnCheckout': 'Check-Out',
  'list.columnGuest': 'Guest Name',
  'list.columnRoom': 'Room',
  'list.columnGuestType': 'Guest Type',
  'list.columnTotal': 'Total Rent',
  'list.columnDue': 'Due',
  'list.columnStatus': 'Status',

  'ci.pending': 'Pending Check-Ins',
  'ci.currentlyOccupied': 'Currently Occupied Rooms',
  'ci.noPending': 'No pending check-ins',
  'ci.noOccupied': 'No guests are currently staying',
  'ci.todayTag': 'Today',
  'ci.lateTag': 'Late',
  'ci.upcomingTag': 'Upcoming',
  'ci.button': 'Check-In',
  'ci.confirmTitle': 'Confirm Check-In',
  'ci.confirmDesc': 'Confirm check-in for this guest?',
  'ci.complete': 'Complete Check-In',
  'ci.done': 'Check-in successful!',
  'ci.sendToCheckout': 'Go to Check-Out',
  'ci.access': 'Only admins or caretakers can perform check-in.',
  'ci.days': 'days',
  'ci.checkoutOn': 'Check-out:',

  'co.currentlyCheckedIn': 'Currently Checked-In Guests',
  'co.activeGuests': 'Active Guests',
  'co.formIntro': 'Enter guest details to complete the check-out',
  'co.noGuests': 'No guests available for check-out',
  'co.todayTag': 'Today',
  'co.button': 'Check-Out',
  'co.title': 'Check-Out',
  'co.bookingSummary': 'Booking Summary',
  'co.guestDetails': 'Guest Details',
  'co.totalRent': 'Total Rent',
  'co.amountPaid': 'Amount Paid',
  'co.paid': 'Paid',
  'co.due': 'Due',
  'co.complete': 'Complete Check-Out',
  'co.done': 'Check-out completed — room is now available',
  'co.access': 'Only admins or caretakers can perform check-out.',
  'co.notPaid': 'Unpaid',
  'co.paidShort': 'Paid',
  'co.calculation': 'Daily Rate × Days',
  'co.calcDetail': '{rate}/day × {days} days × {rooms} rooms = {total}',
  'co.checkInOn': 'Check-In',
  'co.checkOutOn': 'Check-Out',
  'co.days': 'Days',

  'cal.daily': 'Daily',
  'cal.weekly': 'Weekly',
  'cal.monthly': 'Monthly',
  'cal.title': 'Room Calendar',
  'cal.subtitle': 'All room bookings at a glance',
  'cal.free': 'Available',
  'cal.booked': 'Booked',
  'cal.occupied': 'Occupied',
  'cal.completed': 'Completed',
  'cal.noBooking': 'No bookings',
  'cal.more': '+{n} more',
  'cal.room': 'Room',

  'rep.title': 'Reports & Analytics',
  'rep.filterToday': 'Today',
  'rep.filterWeek': 'This Week',
  'rep.filterMonth': 'This Month',
  'rep.filterCustom': 'Custom',
  'rep.startDate': 'Start Date',
  'rep.endDate': 'End Date',
  'rep.totalBookings': 'Total Bookings',
  'rep.totalRevenue': 'Total Revenue',
  'rep.totalCollected': 'Total Collected',
  'rep.totalDue': 'Total Due',
  'rep.monthlyChart': 'Monthly Revenue Chart',
  'rep.revenueByType': 'Revenue by Guest Type',
  'rep.roomWise': 'Room-wise Revenue',
  'rep.occupancy': 'Room Occupancy',
  'rep.occupied': 'Occupied',
  'rep.booked': 'Booked',
  'rep.available': 'Available',
  'rep.revenueAnalysis': 'Revenue Analysis by Guest Type',
  'rep.stayReport': 'Guest Stay Report',
  'rep.bookingsCount': '{n} bookings',
  'rep.noData': 'No bookings in this period',
  'rep.revenue': 'Revenue',
  'rep.guestName': 'Guest Name',
  'rep.room': 'Room',
  'rep.guestType': 'Guest Type',
  'rep.checkIn': 'Check-In',
  'rep.checkOut': 'Check-Out',
  'rep.days': 'Days',
  'rep.totalRent': 'Total Rent',
  'rep.payment': 'Payment',
  'rep.paid': 'Paid',
  'rep.partial': 'Partial',
  'rep.unpaid': 'Unpaid',

  'his.title': 'Booking History',
  'his.resultCount': '{n} bookings found',
  'his.export': 'Export CSV',
  'his.searchPlaceholder': 'Guest name / Room',
  'his.fromDate': 'Start Date',
  'his.toDate': 'End Date',
  'his.guestTypeFilter': 'All guest types',
  'his.roomFilter': 'All rooms',
  'his.statusFilter': 'All statuses',
  'his.totalRent': 'Total Rent:',
  'his.totalPaid': 'Total Paid:',
  'his.totalDue': 'Total Due:',
  'his.csvDownloaded': 'CSV file downloaded',
  'his.bookingId': 'Booking ID',
  'his.guestName': 'Guest Name',
  'his.room': 'Room',
  'his.guestType': 'Guest Type',
  'his.checkIn': 'Check-In',
  'his.checkOut': 'Check-Out',
  'his.days': 'Days',
  'his.totalRentCol': 'Total Rent',
  'his.paidCol': 'Paid',
  'his.dueCol': 'Due',
  'his.statusCol': 'Status',
  'his.noData': 'No bookings found',

  'user.title': 'User Management',
  'user.subtitle': 'Manage admins, caretakers and viewers',
  'user.add': 'Add User',
  'user.edit': 'Edit User',
  'user.new': 'New User',
  'user.fullName': 'Full Name',
  'user.email': 'Email',
  'user.password': 'Initial Password',
  'user.passwordPlaceholder': 'Set a password for the new user',
  'user.role': 'Role',
  'user.nameRequired': 'Name and email are required',
  'user.updated': 'User updated',
  'user.added': 'New user added',
  'user.deactivated': 'User deactivated',
  'user.activated': 'User activated',
  'user.bookingsCreated': '{n} bookings created',
  'user.addedDate': 'Added:',
  'user.adminOnly': 'This page is only accessible to admins.',

  'set.title': 'Settings',
  'set.subtitle': 'System configuration',
  'set.rentRates': 'Rental Rates',
  'set.perDay': '/ day',
  'set.dataManagement': 'Data Management',
  'set.resetDemo': 'Reset Demo Data',
  'set.resetConfirm': 'Are you sure? All bookings and room data will be reset to the default demo data.',
  'set.resetDone': 'Data reset to demo data',
  'set.resetFailed': 'Reset failed',
  'set.resetInProgress': 'Resetting...',
  'set.reset': 'Reset',
  'set.deleteConfim': 'Are you sure you want to delete this booking?',
  'set.rateAdminNote': 'Changing rental rates requires admin approval. (Will be enabled after connecting Supabase)',
  'set.rateCaretakerNote': 'Only admins can change rental rates.',
  'set.localStorageNote': 'In this version, data is stored in the browser. After connecting Supabase, all data will be stored in the cloud.',
  'set.onlineResetNote': 'Cloud data active — run `npm run seed:supabase` in the terminal to reset the shared data.',

  'login.title': 'Sign In',
  'login.subtitle': 'Enter your account to continue',
  'login.emailPlaceholder': 'your@email.com',
  'login.passwordPlaceholder': '••••••••',
  'login.button': 'Sign In',
  'login.password': 'Password',
  'login.invalid': 'Invalid email or password',
  'login.disabled': 'This account has been disabled',
  'login.failed': 'Login failed',

  ok: 'OK',
};

const DICTS: Record<Lang, Dict> = { bn, en };

const LANG_KEY = 'dhansiri_lang';

export interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  fmtDate: (dateStr: string) => string;
  fmtDateTime: (dateStr: string) => string;
  fmtCurrency: (amount: number) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function replaceVars(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

const BD_TIMEZONE = 'Asia/Dhaka';

export const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
export const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function dateFormat(dateStr: string, lang: Lang): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: BD_TIMEZONE, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d);
  const part = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
  const months = lang === 'bn' ? BN_MONTHS : EN_MONTHS;
  return `${part('day')} ${months[part('month') - 1]}, ${part('year')}`;
}

export function dateTimeFormat(dateStr: string, lang: Lang): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BD_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d);
  const part = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  const months = lang === 'bn' ? BN_MONTHS : EN_MONTHS;
  return `${part('day')} ${months[Number(part('month')) - 1]}, ${part('year')}, ${String(part('hour')).padStart(2, '0')}:${part('minute')} ${part('dayPeriod')}`;
}

export function currencyFormat(amount: number, lang: Lang): string {
  const locale = lang === 'bn' ? 'bn-BD' : 'en-IN';
  return `৳${amount.toLocaleString(locale)}`;
}

function loadLang(): Lang {
  if (typeof window === 'undefined') return 'bn';
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'bn';
  } catch {
    return 'bn';
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('bn');

  useEffect(() => {
    // Load persisted language after mount (Bengali is the default)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(loadLang());
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_KEY, l);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next: Lang = prev === 'bn' ? 'en' : 'bn';
      if (typeof window !== 'undefined') localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const text = DICTS[lang][key] ?? bn[key] ?? key;
      return replaceVars(text, vars);
    },
    [lang]
  );

  const fmtDate = useCallback((dateStr: string) => dateFormat(dateStr, lang), [lang]);
  const fmtDateTime = useCallback((dateStr: string) => dateTimeFormat(dateStr, lang), [lang]);
  const fmtCurrency = useCallback((amount: number) => currencyFormat(amount, lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, fmtDate, fmtDateTime, fmtCurrency }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

export function guestTypeLabel(type: GuestType, lang: Lang): string {
  return DICTS[lang][`guestType.${type}`] ?? type;
}

export function roleLabel(role: UserRole, lang: Lang): string {
  return DICTS[lang][`role.${role}`] ?? role;
}

export function paymentStatusLabel(status: PaymentStatus, lang: Lang): string {
  return DICTS[lang][`paymentStatus.${status}`] ?? status;
}

export function bookingStatusLabel(status: BookingStatus, lang: Lang): string {
  const key =
    status === 'booked'
      ? 'bookingStatus.booked'
      : status === 'checked_in'
        ? 'bookingStatus.checkedIn'
        : status === 'checked_out'
          ? 'bookingStatus.checkedOut'
          : 'bookingStatus.cancelled';
  return DICTS[lang][key] ?? status;
}

export const LANGUAGE_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'bn', label: 'বাংলা' },
  { value: 'en', label: 'English' },
];