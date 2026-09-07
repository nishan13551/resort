'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { useRoomsWithStatus } from '@/lib/use-dashboard-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { RoomStatusBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useLang, guestTypeLabel } from '@/lib/i18n';
import { bookingRoomsLabel, isToday } from '@/lib/utils';

export default function CheckinPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const { bookings, updateBooking } = useData();
  const rooms = useRoomsWithStatus();
  const { showToast } = useToast();
  const { t, lang, fmtDate, fmtCurrency } = useLang();

  const [confirmBooking, setConfirmBooking] = useState<string | null>(null);

  const pendingCheckins = useMemo(
    () =>
      bookings
        .filter(b => b.booking_status === 'booked')
        .sort((a, b) => a.check_in_date.localeCompare(b.check_in_date)),
    [bookings]
  );

  const occupiedRooms = rooms.filter(r => r.status === 'occupied');

  const canCheckIn = hasRole('admin');

  function handleConfirm() {
    if (!confirmBooking) return;
    updateBooking(confirmBooking, {
      booking_status: 'checked_in',
      actual_check_in: new Date().toISOString(),
    });
    showToast(t('ci.done'));
    setConfirmBooking(null);
  }

  const selected = bookings.find(b => b.id === confirmBooking);

  return (
    <RequireAuth roles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {!canCheckIn && (
            <Card>
              <CardHeader><CardTitle>{t('common.permissionDenied')}</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-500">
                {t('ci.access')}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {canCheckIn && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5 text-emerald-600" />
                    {t('ci.pending')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingCheckins.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">{t('ci.noPending')}</p>
                  ) : (
                    pendingCheckins.map(b => (
                      <div key={b.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-800">{b.guest_name}</div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {t('roomLabel')} {bookingRoomsLabel(b, rooms)} • {guestTypeLabel(b.guest_type, lang)}
                              {b.organization ? ` • ${b.organization}` : ''}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            {isToday(b.check_in_date) ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{t('ci.todayTag')}</span>
                            ) : b.check_in_date < new Date().toISOString().split('T')[0] ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{t('ci.lateTag')}</span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{t('ci.upcomingTag')}</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>{t('checkInLabel')}: {fmtDate(b.check_in_date)}</span>
                          <span>{t('checkOutLabel')}: {fmtDate(b.check_out_date)}</span>
                          <Button size="sm" onClick={() => setConfirmBooking(b.id)}>
                            <CheckCircle2 className="h-4 w-4" />
                            {t('ci.button')}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  {t('ci.currentlyOccupied')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {occupiedRooms.length === 0 ? (
                    <p className="col-span-2 py-8 text-center text-sm text-slate-400">{t('ci.noOccupied')}</p>
                  ) : (
                    occupiedRooms.map(r => (
                      <div key={r.id} className="rounded-lg border border-red-100 bg-red-50/50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">{t('roomLabel')} {r.room_number}</span>
                          <RoomStatusBadge status="occupied" />
                        </div>
                        {(() => {
                          const booking = r.current_booking;
                          if (!booking) return null;
                          return (
                            <>
                              <div className="mt-1 text-sm text-slate-700">{booking.guest_name}</div>
                              <div className="text-xs text-slate-500">
                                {t('ci.checkoutOn')} {fmtDate(booking.check_out_date)}
                              </div>
                              <div className="mt-2 text-xs font-medium text-slate-600">
                                {t('totalRentLabel')}: {fmtCurrency(booking.total_rent)}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 w-full"
                                onClick={() => router.push(`/checkout?booking=${booking.id}`)}
                              >
                                {t('ci.sendToCheckout')}
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal open={!!confirmBooking} onClose={() => setConfirmBooking(null)} title={t('ci.confirmTitle')}>
          {selected && (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-base font-semibold text-slate-800">{selected.guest_name}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {t('roomLabel')} {bookingRoomsLabel(selected, rooms)} • {guestTypeLabel(selected.guest_type, lang)}
                </div>
                {selected.organization && <div className="text-sm text-slate-500">{selected.organization}</div>}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">{t('checkInLabel')}</div>
                    <div className="font-medium">{fmtDate(selected.check_in_date)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t('checkOutLabel')}</div>
                    <div className="font-medium">{fmtDate(selected.check_out_date)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t('ci.days')}</div>
                    <div className="font-medium">{selected.number_of_days}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t('totalRentLabel')}</div>
                    <div className="font-medium text-emerald-700">{fmtCurrency(selected.total_rent)}</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600">{t('ci.confirmDesc')}</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmBooking(null)}>{t('common.cancel')}</Button>
                <Button onClick={handleConfirm}>{t('ci.complete')}</Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </RequireAuth>
  );
}