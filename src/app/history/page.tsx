'use client';

import { useMemo, useState } from 'react';
import { Search, FileDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useData } from '@/lib/data-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { useLang, guestTypeLabel, bookingStatusLabel } from '@/lib/i18n';
import { formatDateShort, toCSVRow, bookingRoomsLabel } from '@/lib/utils';
import { BookingStatus, GuestType } from '@/lib/types';

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, 'green' | 'yellow' | 'red' | 'slate'> = {
    booked: 'yellow',
    checked_in: 'red',
    checked_out: 'green',
    cancelled: 'slate',
  };
  const { lang } = useLang();
  return <Badge tone={map[status]}>{bookingStatusLabel(status, lang)}</Badge>;
}

export default function HistoryPage() {
  const { bookings, rooms } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtDate, fmtCurrency } = useLang();

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [guestType, setGuestType] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('checked_out');

  const filtered = useMemo(() => {
    return bookings
      .filter(b => {
        if (search && !b.guest_name.toLowerCase().includes(search.toLowerCase()) && !bookingRoomsLabel(b, rooms).toLowerCase().includes(search)) return false;
        if (fromDate && b.check_in_date < fromDate) return false;
        if (toDate && b.check_in_date > toDate) return false;
        if (guestType !== 'all' && b.guest_type !== guestType) return false;
        if (roomFilter !== 'all' && b.room_id !== roomFilter && !(b.room_ids?.length ? b.room_ids.includes(roomFilter) : false)) return false;
        if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date));
  }, [bookings, rooms, search, fromDate, toDate, guestType, roomFilter, statusFilter]);

  function exportCSV() {
    const headers = [
      'Booking ID', 'Guest Name', 'Organization', 'Guest Type', 'Room',
      'Check-in', 'Check-out', 'Days', 'Daily Rate', 'Total Rent',
      'Paid', 'Due', 'Payment Status', 'Booking Status',
    ];
    const rows = filtered.map(b => [
      b.id,
      b.guest_name,
      b.organization,
      b.guest_type,
      bookingRoomsLabel(b, rooms),
      formatDateShort(b.check_in_date),
      formatDateShort(b.check_out_date),
      b.number_of_days,
      b.daily_rate,
      b.total_rent,
      b.amount_paid,
      b.due_amount,
      b.payment_status,
      b.booking_status,
    ]);

    const csv = [toCSVRow(headers), ...rows.map(r => toCSVRow(r as (string | number)[]))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dhansiri_booking_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('his.csvDownloaded'));
  }

  const totals = useMemo(() => {
    const rent = filtered.reduce((s, b) => s + b.total_rent, 0);
    const paid = filtered.reduce((s, b) => s + b.amount_paid, 0);
    const due = filtered.reduce((s, b) => s + b.due_amount, 0);
    return { rent, paid, due };
  }, [filtered]);

  return (
    <RequireAuth roles={['admin', 'caretaker']}>
      <DashboardLayout>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('his.title')}</h2>
              <p className="text-sm text-slate-500">{t('his.resultCount', { n: filtered.length })}</p>
            </div>
            <Button variant="outline" onClick={exportCSV}>
              <FileDown className="h-4 w-4" />
              {t('his.export')}
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder={t('his.searchPlaceholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} title={t('his.fromDate')} />
                <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} title={t('his.toDate')} />
                <Select value={guestType} onChange={e => setGuestType(e.target.value)}>
                  <option value="all">{t('his.guestTypeFilter')}</option>
                  {(['bwdb', 'govt_other', 'private'] as GuestType[]).map(type => (
                    <option key={type} value={type}>{guestTypeLabel(type, lang)}</option>
                  ))}
                </Select>
                <Select value={roomFilter} onChange={e => setRoomFilter(e.target.value)}>
                  <option value="all">{t('his.roomFilter')}</option>
                  {rooms.filter(r => r.is_active).map(r => (
                    <option key={r.id} value={r.id}>{t('roomLabel')} {r.room_number}</option>
                  ))}
                </Select>
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">{t('his.statusFilter')}</option>
                  {(['booked', 'checked_in', 'checked_out', 'cancelled'] as BookingStatus[]).map(s => (
                    <option key={s} value={s}>{bookingStatusLabel(s, lang)}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-500">{t('his.totalRent')} </span>
                  <span className="font-bold text-emerald-700">{fmtCurrency(totals.rent)}</span>
                </div>
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm">
                  <span className="text-slate-500">{t('his.totalPaid')} </span>
                  <span className="font-bold text-green-700">{fmtCurrency(totals.paid)}</span>
                </div>
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm">
                  <span className="text-slate-500">{t('his.totalDue')} </span>
                  <span className="font-bold text-red-600">{fmtCurrency(totals.due)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.bookingId')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.guestName')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.room')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.guestType')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.checkIn')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.checkOut')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.days')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.totalRentCol')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.paidCol')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.dueCol')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('his.statusCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-3 py-10 text-center text-slate-400">{t('his.noData')}</td>
                      </tr>
                    ) : (
                      filtered.map(b => (
                        <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{b.id}</td>
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-slate-800">{b.guest_name}</div>
                            {b.organization && <div className="text-xs text-slate-400">{b.organization}</div>}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{bookingRoomsLabel(b, rooms)}</td>
                          <td className="px-3 py-2.5 text-slate-600">{guestTypeLabel(b.guest_type, lang)}</td>
                          <td className="px-3 py-2.5 text-slate-600">{fmtDate(b.check_in_date)}</td>
                          <td className="px-3 py-2.5 text-slate-600">{fmtDate(b.check_out_date)}</td>
                          <td className="px-3 py-2.5 text-slate-600">{b.number_of_days}</td>
                          <td className="px-3 py-2.5 font-semibold text-emerald-700">{fmtCurrency(b.total_rent)}</td>
                          <td className="px-3 py-2.5 text-slate-600">{fmtCurrency(b.amount_paid)}</td>
                          <td className="px-3 py-2.5">
                            {b.due_amount > 0 ? (
                              <span className="font-medium text-red-600">{fmtCurrency(b.due_amount)}</span>
                            ) : (
                              <span className="text-green-600">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5"><StatusBadge status={b.booking_status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}