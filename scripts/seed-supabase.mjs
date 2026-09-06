// fresh Supabase seed for Dhansiri Rest House
// Usage: place NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then:
//   node scripts/seed-supabase.mjs
// This drops & recreates the tables, so it also acts as a full data reset.

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function readEnv(key) {
  if (process.env[key]) return process.env[key];
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) return undefined;
  const content = fs.readFileSync(envPath, 'utf8');
  const line = content.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  if (!line) return undefined;
  const value = line.slice(key.length + 1).trim();
  return value.replace(/^["']|["']$/g, '');
}

const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
const anon = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!url || !anon) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, anon);

// Quick sanity check: do the tables exist yet?
const probe = await supabase.from('rooms').select('id').limit(1);
if (probe.error && probe.error.code === '42P01') {
  console.error(
    'Tables are missing. Open your Supabase dashboard -> SQL Editor, paste supabase/schema.sql, run it, then rerun this script.'
  );
  process.exit(1);
}

const daysAgo = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split('T')[0];
};

const rooms = [
  { id: '10000000-0000-0000-0000-000000000001', room_number: '201', room_name: 'রুম ২০১' },
  { id: '10000000-0000-0000-0000-000000000002', room_number: '202', room_name: 'রুম ২০২' },
  { id: '10000000-0000-0000-0000-000000000003', room_number: '203', room_name: 'রুম ২০৩' },
  { id: '10000000-0000-0000-0000-000000000004', room_number: '301', room_name: 'রুম ৩০১' },
  { id: '10000000-0000-0000-0000-000000000005', room_number: '302', room_name: 'রুম ৩০২' },
  { id: '10000000-0000-0000-0000-000000000006', room_number: '303', room_name: 'রুম ৩০৩' },
  { id: '10000000-0000-0000-0000-000000000007', room_number: 'Xen', room_name: 'Xen অফিস' },
  { id: '10000000-0000-0000-0000-000000000008', room_number: 'SO', room_name: 'SO অফিস' },
];

const RATES = { bwdb: 70, govt_other: 280, private: 600 };

const mkBooking = (i, guest, org, guestType, roomId, checkIn, checkOut, status, paid) => {
  const days = Math.max(
    Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000),
    1
  );
  const total = RATES[guestType] * days;
  const due = Math.max(total - paid, 0);
  const paymentStatus = due === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
  return {
    id: `20000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
    booking_date: daysAgo(-1),
    guest_name: guest,
    organization: org,
    guest_type: guestType,
    room_id: roomId,
    room_ids: [roomId],
    check_in_date: checkIn,
    check_out_date: checkOut,
    number_of_days: days,
    daily_rate: RATES[guestType],
    total_rent: total,
    amount_paid: paid,
    due_amount: due,
    payment_status: paymentStatus,
    booking_status: status,
    notes: '',
  };
};

const bookings = [
  mkBooking(1, 'মোঃ রফিকুল ইসলাম', 'বিডব্লিউডিবি', 'bwdb', '10000000-0000-0000-0000-000000000001', daysAgo(-2), daysAgo(2), 'checked_in', 280),
  mkBooking(2, 'সমীর কুমার', 'সড়ক ও জনপথ বিভাগ', 'govt_other', '10000000-0000-0000-0000-000000000002', daysAgo(-1), daysAgo(3), 'checked_in', 1120),
  mkBooking(3, 'আব্দুল করিম', '', 'private', '10000000-0000-0000-0000-000000000003', daysAgo(-3), daysAgo(1), 'checked_in', 1200),
  mkBooking(4, 'ডাঃ ফাতেমা বেগম', '', 'private', '10000000-0000-0000-0000-000000000004', daysAgo(0), daysAgo(2), 'booked', 0),
  mkBooking(5, 'মোঃ শফিকুল আলম', 'এলজিইডি', 'govt_other', '10000000-0000-0000-0000-000000000005', daysAgo(1), daysAgo(3), 'booked', 0),
  mkBooking(6, 'নাসরিন সুলতানা', '', 'private', '10000000-0000-0000-0000-000000000007', daysAgo(1), daysAgo(4), 'booked', 0),
  mkBooking(7, 'মোঃ জসিম উদ্দিন', 'বিডব্লিউডিবি', 'bwdb', '10000000-0000-0000-0000-000000000008', daysAgo(-6), daysAgo(2), 'checked_in', 280),
  mkBooking(8, 'রহিম উদ্দিন', 'বিডব্লিউডিবি', 'bwdb', '10000000-0000-0000-0000-000000000001', daysAgo(-18), daysAgo(-14), 'checked_out', 280),
  mkBooking(9, 'করিম খান', '', 'private', '10000000-0000-0000-0000-000000000002', daysAgo(-20), daysAgo(-15), 'checked_out', 3000),
  mkBooking(10, 'সালমা বেগম', 'প্রবাসী কল্যাণ ব্যাংক', 'govt_other', '10000000-0000-0000-0000-000000000004', daysAgo(-16), daysAgo(-10), 'checked_out', 1680),
  mkBooking(11, 'মোঃ আসিফ রহমান', '', 'private', '10000000-0000-0000-0000-000000000006', daysAgo(5), daysAgo(8), 'booked', 0),
  mkBooking(12, 'মোঃ খালেদ হোসেন', 'বিডব্লিউডিবি', 'bwdb', '10000000-0000-0000-0000-000000000008', daysAgo(4), daysAgo(6), 'booked', 0),
];

async function main() {
  console.log('Resetting tables...');
  const { error: d1 } = await supabase
    .from('bookings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: d2 } = await supabase
    .from('payments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: d3 } = await supabase
    .from('rooms')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (d1) console.log('clear bookings:', d1.message);
  if (d2) console.log('clear payments:', d2.message);
  if (d3) console.log('clear rooms:', d3.message);

  console.log('Seeding rooms...');
  const { error: ir } = await supabase.from('rooms').insert(rooms);
  if (ir) {
    console.error('rooms insert failed:', ir.message);
    process.exit(1);
  }

  console.log('Seeding bookings...');
  const { error: ib } = await supabase.from('bookings').insert(bookings);
  if (ib) {
    console.error('bookings insert failed:', ib.message);
    process.exit(1);
  }

  console.log('Done. Seeded', rooms.length, 'rooms and', bookings.length, 'bookings.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});