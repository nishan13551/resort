'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { addDays, startOfWeek, addWeeks, format } from 'date-fns';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useData } from '@/lib/data-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/lib/types';
import { formatDateShort } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

type ViewMode = 'daily' | 'weekly' | 'monthly';

const STATUS_COLORS: Record<string, string> = {
  booked: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  checked_in: 'bg-red-100 text-red-800 border-red-300',
  checked_out: 'bg-green-100 text-green-800 border-green-300',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const { bookings, rooms } = useData();
  const { t } = useLang();
  const [view, setView] = useState<ViewMode>('monthly');
  const [cursor, setCursor] = useState<Date>(() => new Date());

  const activeRooms = useMemo(() => rooms.filter(r => r.is_active).sort((a, b) => a.room_number.localeCompare(b.room_number)), [rooms]);

  const bookingsForRange = useMemo(() => {
    const start = view === 'daily' ? cursor : view === 'weekly' ? startOfWeek(cursor, { weekStartsOn: 1 }) : new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = view === 'daily' ? cursor : view === 'weekly' ? addDays(startOfWeek(cursor, { weekStartsOn: 1 }), 6) : new Date(cursor.getFullYear(), cursor.getMonth(), getDaysInMonth(cursor.getFullYear(), cursor.getMonth()));
    const s = format(start, 'yyyy-MM-dd');
    const e = format(end, 'yyyy-MM-dd');
    return bookings.filter(b => !(b.check_out_date < s || b.check_in_date > e));
  }, [bookings, view, cursor]);

  function getBookingsForDate(date: Date): Booking[] {
    const ds = format(date, 'yyyy-MM-dd');
    return bookingsForRange.filter(b => b.check_in_date <= ds && b.check_out_date >= ds);
  }

  function navigate(direction: 'prev' | 'next') {
    setCursor(prev => {
      if (view === 'daily') return addDays(prev, direction === 'prev' ? -1 : 1);
      if (view === 'weekly') return addWeeks(prev, direction === 'prev' ? -1 : 1);
      return new Date(prev.getFullYear(), prev.getMonth() + (direction === 'prev' ? -1 : 1), 1);
    });
  }

  function goToday() {
    setCursor(new Date());
  }

  const title =
    view === 'daily'
      ? format(cursor, 'dd MMMM yyyy')
      : view === 'weekly'
        ? `${format(startOfWeek(cursor, { weekStartsOn: 1 }), 'dd MMM')} – ${format(addDays(startOfWeek(cursor, { weekStartsOn: 1 }), 6), 'dd MMM yyyy')}`
        : format(cursor, 'MMMM yyyy');

  return (
    <RequireAuth roles={['admin']}>
      <DashboardLayout>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('cal.title')}</h2>
              <p className="text-sm text-slate-500">{t('cal.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
                {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setView(m)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      view === m ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {m === 'daily' ? t('cal.daily') : m === 'weekly' ? t('cal.weekly') : t('cal.monthly')}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-32 px-2 text-center text-sm font-medium text-slate-700">{title}</span>
                <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={goToday}>{t('common.today')}</Button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><Badge tone="yellow">{t('bookingStatus.booked')}</Badge></span>
            <span className="flex items-center gap-1.5"><Badge tone="red">{t('bookingStatus.checkedIn')}</Badge></span>
            <span className="flex items-center gap-1.5"><Badge tone="green">{t('bookingStatus.checkedOut')}</Badge></span>
          </div>

          {view === 'monthly' && (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full min-w-[900px] table-fixed text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-20 px-3 py-2 text-xs font-semibold text-slate-500">{t('cal.room')}</th>
                      {Array.from({ length: getDaysInMonth(cursor.getFullYear(), cursor.getMonth()) }).map((_, i) => (
                        <th key={i} className="px-0.5 py-2 text-center text-[10px] font-medium text-slate-500">
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeRooms.map(room => (
                      <tr key={room.id} className="border-b border-slate-100">
                        <td className="px-3 py-2 text-xs font-bold text-slate-700">{t('roomLabel')} {room.room_number}</td>
                        {Array.from({ length: getDaysInMonth(cursor.getFullYear(), cursor.getMonth()) }).map((_, i) => {
                          const d = new Date(cursor.getFullYear(), cursor.getMonth(), i + 1);
                          const dayBookings = getBookingsForDate(d);
                          const cellBooking = dayBookings.find(b => b.booking_status !== 'cancelled');
                          const isToday = d.toDateString() === new Date().toDateString();
                          return (
                            <td
                              key={i}
                              className={cn(
                                'h-8 px-0.5 text-center align-middle',
                                isToday && 'bg-emerald-50'
                              )}
                            >
                              {cellBooking ? (
                                <div
                                  className={cn(
                                    'mx-auto flex h-6 w-full items-center justify-center rounded-md border text-[10px] font-medium',
                                    STATUS_COLORS[cellBooking.booking_status]
                                  )}
                                  title={`${cellBooking.guest_name} (${formatDateShort(cellBooking.check_in_date)}–${formatDateShort(cellBooking.check_out_date)})`}
                                >
                                  {cellBooking.guest_name.slice(0, 4)}
                                </div>
                              ) : (
                                <div className="h-6 w-full rounded-md" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {view === 'weekly' && (
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full min-w-[900px] text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-20 px-3 py-2 text-xs font-semibold text-slate-500">{t('cal.room')}</th>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const d = addDays(startOfWeek(cursor, { weekStartsOn: 1 }), i);
                        return (
                          <th key={i} className="px-2 py-2 text-center text-xs font-medium text-slate-600">
                            {format(d, 'EEEE')} <span className="block text-[10px] font-normal text-slate-400">{format(d, 'dd MMM')}</span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {activeRooms.map(room => (
                      <tr key={room.id} className="border-b border-slate-100">
                        <td className="px-3 py-3 text-xs font-bold text-slate-700">{t('roomLabel')} {room.room_number}</td>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const d = addDays(startOfWeek(cursor, { weekStartsOn: 1 }), i);
                          const dayBookings = getBookingsForDate(d).filter(b => b.booking_status !== 'cancelled');
                          return (
                            <td key={i} className="space-y-1 px-1 py-2 align-top">
                              {dayBookings.length === 0 && <div className="text-center text-[10px] text-slate-300">—</div>}
                              {dayBookings.slice(0, 2).map(b => (
                                <div
                                  key={b.id}
                                  className={cn(
                                    'rounded-md border px-2 py-1 text-[11px] leading-tight',
                                    STATUS_COLORS[b.booking_status]
                                  )}
                                  title={`${b.guest_name} (${formatDateShort(b.check_in_date)}–${formatDateShort(b.check_out_date)})`}
                                >
                                  {b.guest_name}
                                </div>
                              ))}
                              {dayBookings.length > 2 && (
                                <div className="text-center text-[10px] text-slate-400">{t('cal.more', { n: dayBookings.length - 2 })}</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {view === 'daily' && (
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = addDays(cursor, i - 3);
                const isTodayFlag = d.toDateString() === new Date().toDateString();
                const dayBookings = getBookingsForDate(d).filter(b => b.booking_status !== 'cancelled');
                return (
                  <Card key={i} className={cn(isTodayFlag && 'border-emerald-400 ring-2 ring-emerald-100')}>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">{format(d, 'EEEE, dd MMMM yyyy')}</span>
                        {isTodayFlag && <Badge tone="green">{t('common.today')}</Badge>}
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {activeRooms.map(room => {
                          const b = dayBookings.find(x => x.room_id === room.id);
                          return (
                            <div key={room.id} className="rounded-lg border border-slate-100 p-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">{t('roomLabel')} {room.room_number}</span>
                                {b ? (
                                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_COLORS[b.booking_status].split(' ').slice(0, 2).join(' '))}>
                                    {b.booking_status === 'checked_in' ? t('roomStatus.occupied') : b.booking_status === 'checked_out' ? t('bookingStatus.checkedOut') : t('bookingStatus.booked')}
                                  </span>
                                ) : (
                                  <Badge tone="green">{t('roomStatus.available')}</Badge>
                                )}
                              </div>
                              {b ? (
                                <div className="mt-1.5">
                                  <div className="truncate text-xs font-medium text-slate-700">{b.guest_name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {formatDateShort(b.check_in_date)}–{formatDateShort(b.check_out_date)}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 text-[10px] text-slate-300">{t('cal.noBooking')}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}