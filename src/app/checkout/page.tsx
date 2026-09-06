'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LogOut, ReceiptText } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Input, FormLabel, FormGroup } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { useLang, guestTypeLabel, paymentStatusLabel, bookingStatusLabel } from '@/lib/i18n';
import { Booking, PaymentStatus } from '@/lib/types';
import { bookingRoomsLabel, bookingRoomsOf, isToday } from '@/lib/utils';
import { calculateDueAmount } from '@/lib/rent-calculator';

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const { currentUser, hasRole } = useAuth();
  const { bookings, rooms, updateBooking } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtDate, fmtCurrency } = useLang();

  const [checkoutTarget, setCheckoutTarget] = useState<string | null>(null);
  const [amountPaidStr, setAmountPaidStr] = useState('0');

  const currentlyCheckedIn = useMemo(
    () =>
      bookings
        .filter(b => ['booked', 'checked_in'].includes(b.booking_status))
        .sort((a, b) => a.check_out_date.localeCompare(b.check_out_date)),
    [bookings]
  );

  useEffect(() => {
    const bookingId = searchParams.get('booking');
    if (bookingId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckoutTarget(bookingId);
    }
  }, [searchParams]);

  const canCheckout = hasRole('admin', 'caretaker');

  const target = checkoutTarget ? bookings.find(b => b.id === checkoutTarget) : null;

  const amountPaid = Math.min(Math.max(Number(amountPaidStr) || 0, 0), (target?.total_rent ?? 0));
  const dueAmount = target ? calculateDueAmount(target.total_rent, amountPaid) : 0;
  const paymentStatus: PaymentStatus = target ? (dueAmount === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid') : 'unpaid';

  function openCheckout(b: Booking) {
    setCheckoutTarget(b.id);
    setAmountPaidStr(String(b.amount_paid || 0));
  }

  function handleComplete() {
    if (!target) return;
    updateBooking(target.id, {
      booking_status: 'checked_out',
      actual_check_in: target.actual_check_in ?? new Date().toISOString(),
      actual_check_out: new Date().toISOString(),
      amount_paid: amountPaid,
      due_amount: dueAmount,
      payment_status: paymentStatus,
    });
    showToast(t('co.done'));
    setCheckoutTarget(null);
    setAmountPaidStr('0');
  }

  if (!currentUser) return null;

  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="space-y-6">
          {!canCheckout && (
            <Card>
              <CardHeader><CardTitle>{t('common.permissionDenied')}</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-500">
                {t('co.access')}
              </CardContent>
            </Card>
          )}

          {canCheckout && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-amber-600" />
                  {t('co.activeGuests')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentlyCheckedIn.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">{t('co.noGuests')}</p>
                ) : (
                  currentlyCheckedIn.map(b => (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{b.guest_name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                          <span>{t('roomLabel')} {bookingRoomsLabel(b, rooms)}</span>
                          <span>• {guestTypeLabel(b.guest_type, lang)}</span>
                          <Badge tone={b.booking_status === 'booked' ? 'yellow' : 'red'}>{bookingStatusLabel(b.booking_status, lang)}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {t('co.checkOutOn')}: {fmtDate(b.check_out_date)}
                          {isToday(b.check_out_date) && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">{t('co.todayTag')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-700">{fmtCurrency(b.total_rent)}</div>
                          <div className="text-xs text-slate-500">
                            {b.due_amount > 0 ? `${t('dueLabel')}: ${fmtCurrency(b.due_amount)}` : t('paymentStatus.paid')}
                          </div>
                        </div>
                        <Button onClick={() => openCheckout(b)}>
                          <ReceiptText className="h-4 w-4" />
                          {t('co.button')}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Modal open={!!target} onClose={() => setCheckoutTarget(null)} title={`${t('co.title')} - ${target?.guest_name ?? ''}`} size="lg">
          {target && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold text-slate-800">
                      {target.guest_name}
                      <span className="ml-2 text-xs font-normal text-slate-500">{guestTypeLabel(target.guest_type, lang)}</span>
                    </div>
                    {target.organization && <div className="text-sm text-slate-500">{target.organization}</div>}
                  </div>
                  <Badge tone="blue">{t('roomLabel')} {bookingRoomsLabel(target, rooms)}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div>
                    <div className="text-xs text-slate-400">{t('form.bookingDate')}</div>
                    <div className="text-sm font-medium text-slate-700">{fmtDate(target.booking_date)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t('co.checkInOn')}</div>
                    <div className="text-sm font-medium text-slate-700">{fmtDate(target.check_in_date)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t('co.checkOutOn')}</div>
                    <div className="text-sm font-medium text-slate-700">{fmtDate(target.check_out_date)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t('co.days')}</div>
                    <div className="text-sm font-medium text-slate-700">{target.number_of_days} {t('co.days')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t('dailyRateLabel')}</div>
                    <div className="text-sm font-medium text-slate-700">{fmtCurrency(target.daily_rate)}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t('co.calculation')}</span>
                    <span className="text-slate-700">{t('co.calcDetail', { rate: fmtCurrency(target.daily_rate), days: target.number_of_days, rooms: bookingRoomsOf(target).length, total: fmtCurrency(target.total_rent) })}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-slate-700">{t('co.totalRent')}</span>
                    <span className="text-emerald-700">{fmtCurrency(target.total_rent)}</span>
                  </div>
                </div>
              </div>

              {target.notes && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">{t('form.notes')}</div>
                  <div className="mt-1 whitespace-pre-line text-sm text-slate-700">{target.notes}</div>
                </div>
              )}

              <div className="space-y-3">
                <FormGroup>
                  <FormLabel>{t('co.amountPaid')} ({t('co.totalRent')}: {fmtCurrency(target.total_rent)})</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    max={target.total_rent}
                    value={amountPaidStr}
                    onChange={e => setAmountPaidStr(e.target.value)}
                    placeholder={t('amountPaidLabel')}
                  />
                </FormGroup>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 p-3 text-center">
                    <div className="text-xs text-slate-500">{t('co.totalRent')}</div>
                    <div className="text-lg font-bold text-slate-800">{fmtCurrency(target.total_rent)}</div>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                    <div className="text-xs text-slate-500">{t('co.paid')}</div>
                    <div className="text-lg font-bold text-green-700">{fmtCurrency(amountPaid)}</div>
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                    <div className="text-xs text-slate-500">{t('co.due')}</div>
                    <div className="text-lg font-bold text-red-600">{fmtCurrency(dueAmount)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                  <span className="text-sm text-slate-600">{t('paymentStatusLabel')}</span>
                  <select
                    value={paymentStatus}
                    disabled
                    className="rounded-md bg-white text-sm font-medium text-slate-700"
                  >
                    <option value={paymentStatus}>{paymentStatusLabel(paymentStatus, lang)}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCheckoutTarget(null)}>{t('common.cancel')}</Button>
                <Button onClick={handleComplete}>
                  {t('co.complete')}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </RequireAuth>
  );
}
export default function CheckoutPage() {
  const { t } = useLang();
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-slate-400">{t('common.loading')}</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}