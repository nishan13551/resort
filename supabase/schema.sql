-- Dhansiri Rest House Management System
-- Supabase schema (paste this into the Supabase SQL Editor once)

-- ============================================================
-- ROOMS
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY,
  booking_date DATE NOT NULL,
  guest_name TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  guest_type TEXT NOT NULL CHECK (guest_type IN ('bwdb', 'govt_other', 'private')),
  room_id UUID NOT NULL REFERENCES rooms(id),
  room_ids UUID[] DEFAULT ARRAY[]::UUID[],
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_days INTEGER NOT NULL CHECK (number_of_days > 0),
  daily_rate NUMERIC NOT NULL,
  total_rent NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  due_amount NUMERIC DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
  booking_status TEXT NOT NULL DEFAULT 'booked' CHECK (booking_status IN ('booked', 'checked_in', 'checked_out', 'cancelled')),
  actual_check_in TIMESTAMPTZ,
  actual_check_out TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_type ON bookings(guest_type);

-- ============================================================
-- STORAGE WE CANNOT CREATE: see seed script
-- (No RLS is enforced for this app; anon key is read/write.)
-- ============================================================

-- ============================================================
-- REALTIME (so the admin and caretaker see each other's changes live)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;