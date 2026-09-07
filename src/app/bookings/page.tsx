'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CalendarX, LogIn, LogOut } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { useLang, guestTypeLabel, bookingStatusLabel } from '@/lib/i18n';
import { Booking, BookingStatus, GuestType } from '@/lib/types';
import { getToday, bookingRoomsLabel } from '@/lib/utils';
import { computeRoomStatus } from '@/lib/conflict-detector';

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, 'green' | 'yellow' | 'red' | 'blue' | 'slate'> = {
    booked: 'yellow',
    checked_in: 'red',
    checked_out: 'green',
    cancelled: 'slate',
  };
  const { lang } = useLang();
  return <Badge tone={map[status]}>{bookingStatusLabel(status, lang)}</Badge>;
}

export default function BookingsPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const { bookings, rooms, deleteBooking, updateBooking } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtDate, fmtCurrency } = useLang();

  const [search, setSearch] = useState('');
  const [guestTypeFilter, setGuestTypeFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const canAdmin = hasRole('admin');
  const canCancel = hasRole('admin', 'caretaker');

  const filtered = useMemo(() => {
    return bookings
      .filter(b => {
        if (search && !b.guest_name.toLowerCase().includes(search.toLowerCase()) && !bookingRoomsLabel(b, rooms).toLowerCase().includes(search)) {
          return false;
        }
        if (guestTypeFilter !== 'all' && b.guest_type !== guestTypeFilter) return false;
        if (roomFilter !== 'all' && b.room_id !== roomFilter && !(b.room_ids?.length ? b.room_ids.includes(roomFilter) : false)) return false;
        if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => b.booking_date.localeCompare(a.booking_date));
  }, [bookings, rooms, search, guestTypeFilter, roomFilter, statusFilter]);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteBooking(deleteTarget.id);
    showToast(t('list.deleted'));
    setDeleteTarget(null);
  }

  function handleCancel() {
    if (!cancelTarget) return;
    updateBooking(cancelTarget.id, { booking_status: 'cancelled' });
    showToast(t('list.cancelled'));
    setCancelTarget(null);
  }

  function handleMarkCheckedIn(booking: Booking) {
    const now = new Date().toISOString();
    updateBooking(booking.id, {
      booking_status: 'checked_in',
      actual_check_in: now,
    });
    showToast(t('list.checkinDone', { name: booking.guest_name }));
  }

  const activeCount = bookings.filter(b => b.booking_status === 'booked' || b.booking_status === 'checked_in').length;
  const today = getToday();
  const todaysBookings = bookings.filter(b => b.check_in_date === today || b.check_out_date === today);
  const occupiedCount = rooms.filter(r => computeRoomStatus(r.id, bookings) === 'occupied').length;

  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('title.bookings')}</h2>
              <p className="text-sm text-slate-500">
                {t('list.active')} {activeCount} • {t('list.todaysBookings')} {todaysBookings.length} • {t('list.occupiedRooms')} {occupiedCount}
              </p>
            </div>
            {hasRole('admin') && (
              <Button onClick={() => router.push('/bookings/new')}>
                <Plus className="h-4 w-4" />
                {t('list.newBooking')}
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input placeholder={t('list.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
                <Select value={guestTypeFilter} onChange={e => setGuestTypeFilter(e.target.value)}>
                  <option value="all">{t('list.allGuestTypes')}</option>
                  {(['bwdb', 'govt_other', 'private'] as GuestType[]).map(type => (
                    <option key={type} value={type}>{guestTypeLabel(type, lang)}</option>
                  ))}
                </Select>
                <Select value={roomFilter} onChange={e => setRoomFilter(e.target.value)}>
                  <option value="all">{t('list.allRooms2')}</option>
                  {rooms.filter(r => r.is_active).map(r => (
                    <option key={r.id} value={r.id}>{t('roomLabel')} {r.room_number}</option>
                  ))}
                </Select>
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">{t('list.allStatuses')}</option>
                  {(['booked', 'checked_in', 'checked_out', 'cancelled'] as BookingStatus[]).map(s => (
                    <option key={s} value={s}>{bookingStatusLabel(s, lang)}</option>
                  ))}
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnGuest')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnRoom')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnGuestType')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnCheckin')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnCheckout')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnTotal')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnDue')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('list.columnStatus')}</th>
                      <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('common.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-10 text-center text-slate-400">{t('list.noBookings')}</td>
                      </tr>
                    ) : filtered.slice(0, 60).map(b => (
                      <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800">{b.guest_name}</div>
                          <div className="text-xs text-slate-400">{b.organization || b.booking_date}</div>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700">{bookingRoomsLabel(b, rooms)}</td>
                        <td className="px-3 py-3 text-slate-600">{guestTypeLabel(b.guest_type, lang)}</td>
                        <td className="px-3 py-3 text-slate-600">{fmtDate(b.check_in_date)}</td>
                        <td className="px-3 py-3 text-slate-600">{fmtDate(b.check_out_date)}</td>
                        <td className="px-3 py-3 font-semibold text-emerald-700">{fmtCurrency(b.total_rent)}</td>
                        <td className="px-3 py-3">
                          {b.due_amount > 0 ? (
                            <span className="font-medium text-red-600">{fmtCurrency(b.due_amount)}</span>
                          ) : (
                            <span className="text-green-600">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3"><BookingStatusBadge status={b.booking_status} /></td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            {hasRole('admin') && b.booking_status === 'booked' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleMarkCheckedIn(b)}
                                className="whitespace-nowrap"
                              >
                                <LogIn className="h-3.5 w-3.5" />
                                {t('ci.button')}
                              </Button>
                            )}
                            {b.booking_status === 'checked_in' && (
                              <Button size="sm" variant="outline" className="whitespace-nowrap" onClick={() => router.push(`/checkout?booking=${b.id}`)}>
                                <LogOut className="h-3.5 w-3.5" />
                                {t('co.button')}
                              </Button>
                            )}
                            {canCancel && b.booking_status !== 'checked_out' && b.booking_status !== 'cancelled' && (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => setCancelTarget(b)} title={t('list.cancelBooking2')}>
                                  <CalendarX className="h-4 w-4" />
                                </Button>
                                {canAdmin && (
                                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(b)} title={t('common.delete')}>
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('list.deleteBookig')} size="sm">
          <p className="text-sm text-slate-600">
            {t('list.deleteConfirm')} <span className="font-semibold">{deleteTarget?.guest_name}</span> ({t('roomLabel')} {deleteTarget && bookingRoomsLabel(deleteTarget, rooms)})
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleDelete}>{t('common.delete')}</Button>
          </div>
        </Modal>

        <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title={t('list.cancelBooking')} size="sm">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">{cancelTarget?.guest_name}</span> ({t('roomLabel')} {cancelTarget && bookingRoomsLabel(cancelTarget, rooms)}) {t('list.cancelConfirm')}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)}>{t('common.no')}</Button>
            <Button variant="danger" onClick={handleCancel}>{t('list.cancelBooking2')}</Button>
          </div>
        </Modal>
      </DashboardLayout>
    </RequireAuth>
  );
}