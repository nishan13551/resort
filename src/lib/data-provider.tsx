'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Booking, Room, User, Payment } from './types';
import { seedBookings, seedRooms, seedUsers } from '../data/mock-data';
import { computeRoomStatus } from './conflict-detector';
import { supabase, isSupabaseEnabled } from './supabase';

interface DataContextValue {
  bookings: Booking[];
  rooms: Room[];
  users: User[];
  payments: Payment[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  addRoom: (room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'status'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const BOOKINGS_KEY = 'dhansiri_bookings';
const ROOMS_KEY = 'dhansiri_rooms';
const PAYMENTS_KEY = 'dhansiri_payments';

const ONLINE = isSupabaseEnabled();

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch (e) {
    console.error(`Failed to load ${key} from storage`, e);
  }
  return fallback;
}

function upsertById<T extends { id: string }>(prev: T[], rows: T[]): T[] {
  const map = new Map(prev.map(item => [item.id, item]));
  for (const row of rows) map.set(row.id, row);
  return Array.from(map.values());
}

function toRoomStatuses(roomList: Room[], bookingList: Booking[]): Room[] {
  return roomList.map(r => ({ ...r, status: computeRoomStatus(r.id, bookingList) }));
}

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `00000000-0000-0000-0000-${Math.random().toString(16).slice(2, 14)}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function DataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([...seedRooms]);
  const users: User[] = seedUsers;
  const [payments, setPayments] = useState<Payment[]>([]);

  const bookingsRef = useRef<Booking[]>([]);
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  useEffect(() => {
    // Load persisted data after mount to avoid SSR hydration mismatch
    const hydrate = (b: Booking[], r: Room[]) => {
      setBookings(b);
      setRooms(toRoomStatuses(r, b));
    };

    if (ONLINE && supabase) {
      const db = supabase;
      (async () => {
        try {
          const [{ data: bData, error: bErr }, { data: rData, error: rErr }] = await Promise.all([
            db.from('bookings').select('*'),
            db.from('rooms').select('*'),
          ]);
          if (!bErr && !rErr) {
            hydrate((bData ?? []) as Booking[], (rData ?? []) as Room[]);
          }
        } catch {
          /* keep initial state */
        }
      })();
    } else {
      const storedBookings = loadFromStorage<Booking[]>(BOOKINGS_KEY, seedBookings);
      const storedRooms = loadFromStorage<Room[]>(ROOMS_KEY, seedRooms);
      const storedPayments = loadFromStorage<Payment[]>(PAYMENTS_KEY, []);
      hydrate(storedBookings, storedRooms);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPayments(storedPayments);
    }
  }, []);

  useEffect(() => {
    if (bookings.length > 0 && !ONLINE && typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    if (rooms.length > 0 && !ONLINE && typeof window !== 'undefined') {
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    }
  }, [rooms]);

  useEffect(() => {
    if (!ONLINE && typeof window !== 'undefined') {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    }
  }, [payments]);

  // Realtime sync for shared (online) mode
  useEffect(() => {
    if (!ONLINE || !supabase) return;
    const db = supabase;

    const channel = db
      .channel(`dhansiri-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        payload => {
          setBookings(prev => {
            const next =
              payload.eventType === 'DELETE'
                ? prev.filter(b => b.id !== payload.old.id)
                : upsertById(prev, [payload.new as Booking]);
            setRooms(roomList => toRoomStatuses(roomList, next));
            return next;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        payload => {
          setRooms(prev => {
            const next =
              payload.eventType === 'DELETE'
                ? prev.filter(r => r.id !== payload.old.id)
                : upsertById(prev, [payload.new as Room]);
            return toRoomStatuses(next, bookingsRef.current);
          });
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  function refresh() {
    if (ONLINE && supabase) {
      const db = supabase;
      (async () => {
        try {
          const [{ data: bData, error: bErr }, { data: rData, error: rErr }] = await Promise.all([
            db.from('bookings').select('*'),
            db.from('rooms').select('*'),
          ]);
          if (!bErr && !rErr) {
            setBookings((bData ?? []) as Booking[]);
            setRooms(toRoomStatuses((rData ?? []) as Room[], (bData ?? []) as Booking[]));
          }
        } catch {
          /* ignore */
        }
      })();
      return;
    }
    const storedBookings = loadFromStorage<Booking[]>(BOOKINGS_KEY, seedBookings);
    const storedRooms = loadFromStorage<Room[]>(ROOMS_KEY, seedRooms);
    setBookings(storedBookings);
    setRooms(toRoomStatuses(storedRooms, storedBookings));
  }

  function addBooking(booking: Booking) {
    let fullBooking: Booking = { ...booking, room_number: undefined };
    if (ONLINE) {
      const isUuid = UUID_RE.test(fullBooking.id);
      fullBooking = isUuid ? fullBooking : { ...fullBooking, id: makeUuid() };
    }
    setBookings(prev => [fullBooking, ...prev]);
    if (ONLINE && supabase) {
      supabase
        .from('bookings')
        .insert(fullBooking)
        .then(({ error }) => {
          if (error) console.error('supabase insert booking failed', error);
        });
    }
  }

  function updateBooking(id: string, updates: Partial<Booking>) {
    setBookings(prev => {
      const next = prev.map(b => (b.id === id ? { ...b, ...updates } : b));
      setRooms(roomList => toRoomStatuses(roomList, next));
      return next;
    });
    if (ONLINE && supabase) {
      supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('supabase update booking failed', error);
        });
    }
  }

  function deleteBooking(id: string) {
    setBookings(prev => {
      const next = prev.filter(b => b.id !== id);
      setRooms(roomList => toRoomStatuses(roomList, next));
      return next;
    });
    if (ONLINE && supabase) {
      supabase
        .from('bookings')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('supabase delete booking failed', error);
        });
    }
  }

  function addRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const now = new Date().toISOString();
    const id = ONLINE ? makeUuid() : `r_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newRoom: Room = {
      ...room,
      id,
      status: 'available',
      created_at: now,
      updated_at: now,
    };
    setRooms(prev => [...prev, newRoom]);
    if (ONLINE && supabase) {
      supabase
        .from('rooms')
        .insert({ id, room_number: newRoom.room_number, room_name: newRoom.room_name, is_active: newRoom.is_active, created_at: now, updated_at: now })
        .then(({ error }) => {
          if (error) console.error('supabase insert room failed', error);
        });
    }
  }

  function updateRoom(id: string, updates: Partial<Room>) {
    const updatedAt = new Date().toISOString();
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, ...updates, updated_at: updatedAt } : r)));
    if (ONLINE && supabase) {
      supabase
        .from('rooms')
        .update({ ...updates, updated_at: updatedAt })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('supabase update room failed', error);
        });
    }
  }

  function deleteRoom(id: string) {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, is_active: false } : r)));
    if (ONLINE && supabase) {
      supabase
        .from('rooms')
        .update({ is_active: false })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('supabase deactivate room failed', error);
        });
    }
  }

  return (
    <DataContext.Provider
      value={{
        bookings,
        rooms,
        users,
        payments,
        addBooking,
        updateBooking,
        deleteBooking,
        addRoom,
        updateRoom,
        deleteRoom,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}