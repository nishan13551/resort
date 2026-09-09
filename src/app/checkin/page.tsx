'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useRoomsWithStatus } from '@/lib/use-dashboard-data';
import { BookingForm } from '@/components/bookings/booking-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { RoomStatusBadge } from '@/components/ui/badge';
import { useLang } from '@/lib/i18n';

export default function CheckinPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const rooms = useRoomsWithStatus();
  const { t, fmtDate, fmtCurrency } = useLang();

  const [showNewCheckin, setShowNewCheckin] = useState(false);

  const occupiedRooms = rooms.filter(r => r.status === 'occupied');

  const canCheckIn = hasRole('admin');

  return (
    <RequireAuth roles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {canCheckIn && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">{t('nav.checkin')}</h2>
              <Button onClick={() => setShowNewCheckin(true)}>
                <Plus className="h-4 w-4" />
                {t('ci.newCheckin')}
              </Button>
            </div>
          )}
          {!canCheckIn && (
            <Card>
              <CardHeader><CardTitle>{t('common.permissionDenied')}</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-500">
                {t('ci.access')}
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

        <Modal open={showNewCheckin} onClose={() => setShowNewCheckin(false)} title={t('ci.newCheckin')} size="lg">
          <BookingForm mode="checkin" onDone={() => setShowNewCheckin(false)} />
        </Modal>
      </DashboardLayout>
    </RequireAuth>
  );
}