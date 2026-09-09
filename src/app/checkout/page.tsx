'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LogOut, ReceiptText, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Input, Select, Textarea, FormLabel, FormGroup } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { useLang, guestTypeLabel, paymentStatusLabel, bookingStatusLabel } from '@/lib/i18n';
import { Booking, GuestType, PaymentStatus } from '@/lib/types';
import { GUEST_TYPE_RATES } from '@/lib/constants';
import { detectBookingConflict, createId } from '@/lib/conflict-detector';
import { calculateTotalRent, getDailyRate, calculateDueAmount } from '@/lib/rent-calculator';
import { bookingRoomsLabel, bookingRoomsOf, calculateDays, getToday, isToday, cn } from '@/lib/utils';

/* ---------- Caretaker: manual checkout form ---------- */

function CaretakerCheckout() {
  const { currentUser } = useAuth();
  const { rooms, bookings, addBooking } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtCurrency } = useLang();

  const [bookingDate, setBookingDate] = useState(getToday());
  const [guestName, setGuestName] = useState('');
  const [guestType, setGuestType] = useState<GuestType>('bwdb');
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState(getToday());
  const [checkOutDate, setCheckOutDate] = useState('');
  const [notes, setNotes] = useState('');
  const [amountPaidStr, setAmountPaidStr] = useState('0');
  const [errors, setErrors] = useState<string[]>([]);

  const numberOfDays = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    try { return calculateDays(checkInDate, checkOutDate); } catch { return 0; }
  }, [checkInDate, checkOutDate]);

  const dailyRate = getDailyRate(guestType);
  const roomCount = roomIds.length;
  const totalRent = calculateTotalRent(guestType, numberOfDays) * roomCount;
  const amountPaid = Math.min(Math.max(Number(amountPaidStr) || 0, 0), totalRent);
  const dueAmount = calculateDueAmount(totalRent, amountPaid);
  const paymentStatus: PaymentStatus = dueAmount === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid';

  const unavailableRoomIds = useMemo(() => {
    if (!checkInDate || !checkOutDate) return new Set<string>();
    const notAvailable = new Set<string>();
    for (const room of rooms) {
      if (detectBookingConflict(bookings, room.id, checkInDate, checkOutDate).hasError)
        notAvailable.add(room.id);
    }
    return notAvailable;
  }, [rooms, bookings, checkInDate, checkOutDate]);

  function toggleRoom(id: string) {
    setRoomIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleCheckInChange(value: string) {
    setCheckInDate(value);
    if (checkOutDate && value && new Date(checkOutDate) <= new Date(value)) {
      const d = new Date(value);
      d.setDate(d.getDate() + 1);
      setCheckOutDate(d.toISOString().split('T')[0]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!guestName.trim()) errs.push(t('form.guestNameRequired'));
    if (roomIds.length === 0) errs.push(t('form.selectRoomRequired'));
    if (!checkInDate || !checkOutDate) errs.push(t('form.datesRequired'));
    if (checkInDate && checkOutDate && new Date(checkInDate) >= new Date(checkOutDate))
      errs.push(t('form.checkoutAfterCheckin'));
    if (numberOfDays < 1) errs.push(t('form.daysMin'));
    for (const id of roomIds) {
      if (unavailableRoomIds.has(id)) errs.push(t('form.roomBusyNow'));
      if (detectBookingConflict(bookings, id, checkInDate, checkOutDate).hasError) {
        errs.push(t('form.conflictError'));
        break;
      }
    }
    if (errs.length) { setErrors(errs); showToast(t('form.validate'), 'error'); return; }

    const firstRoom = rooms.find(r => r.id === roomIds[0]);
    const now = new Date().toISOString();
    addBooking({
      id: createId('bk'),
      booking_date: bookingDate,
      guest_name: guestName.trim(),
      organization: '',
      guest_type: guestType,
      room_id: roomIds[0],
      room_ids: roomIds,
      room_number: firstRoom?.room_number,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      number_of_days: numberOfDays,
      daily_rate: dailyRate,
      total_rent: totalRent,
      amount_paid: amountPaid,
      due_amount: dueAmount,
      payment_status: paymentStatus,
      booking_status: 'checked_out',
      actual_check_in: now,
      actual_check_out: now,
      notes: notes.trim(),
      created_by: currentUser?.id ?? '',
      created_at: now,
      updated_at: now,
    });
    showToast(t('co.done'));
    setGuestName('');
    setRoomIds([]);
    setNotes('');
    setAmountPaidStr('0');
    setErrors([]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-amber-600" />
            {t('co.formIntro')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormGroup>
              <FormLabel>{t('form.bookingDate')}</FormLabel>
              <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <FormLabel>{t('form.guestName')} *</FormLabel>
              <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder={t('form.guestName')} />
            </FormGroup>
            <FormGroup>
              <FormLabel>{t('form.guestType')} *</FormLabel>
              <Select value={guestType} onChange={e => setGuestType(e.target.value as GuestType)}>
                {(Object.keys(GUEST_TYPE_RATES) as GuestType[]).filter(t => t === 'bwdb' || t === 'govt_other' || t === 'private').map(type => (
                  <option key={type} value={type}>
                    {guestTypeLabel(type, lang)} ({fmtCurrency(GUEST_TYPE_RATES[type])}{t('set.perDay')})
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <FormLabel>{t('form.checkIn')} *</FormLabel>
              <Input type="date" value={checkInDate} onChange={e => handleCheckInChange(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <FormLabel>{t('form.checkOut')} *</FormLabel>
              <Input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} />
            </FormGroup>
          </div>
          <FormGroup className="mt-4">
            <FormLabel>{t('form.notes')}</FormLabel>
            <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('form.notesPlaceholder')} />
          </FormGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-800">{t('form.selectRoom')}</h3>
            <div className="text-xs text-slate-500">
              <span className="mr-3"><span className="mx-1 inline-block h-3 w-3 rounded-sm bg-green-100 border border-green-300 align-middle" /> {t('roomStatus.available')}</span>
              <span className="mr-3"><span className="mx-1 inline-block h-3 w-3 rounded-sm bg-yellow-100 border border-yellow-300 align-middle" /> {t('roomStatus.booked')}</span>
              <span className="mr-3"><span className="mx-1 inline-block h-3 w-3 rounded-sm bg-red-100 border border-red-300 align-middle" /> {t('roomStatus.occupied')}</span>
              <span className="mr-3"><span className="mx-1 inline-block h-3 w-3 rounded-sm bg-slate-100 border border-slate-300 align-middle" /> {t('form.reservedDatesNote')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-8">
            {rooms.filter(r => r.is_active).map(room => {
              const isUnavailable = unavailableRoomIds.has(room.id);
              const isOccupied = room.status === 'occupied';
              const isNotSelectable = isUnavailable || isOccupied;
              return (
                <button
                  type="button"
                  key={room.id}
                  onClick={() => { if (!isNotSelectable) toggleRoom(room.id); }}
                  className={cn(
                    'relative rounded-lg border-2 p-3 text-left transition-all',
                    roomIds.includes(room.id)
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100'
                      : isUnavailable
                        ? 'border-slate-200 bg-slate-50 opacity-50'
                        : isOccupied
                          ? 'border-red-200 bg-red-50 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-emerald-300 cursor-pointer'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{room.room_number}</span>
                    {roomIds.includes(room.id) && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {isNotSelectable && (
                      <span className="text-[10px] font-medium text-slate-400">
                        {isUnavailable ? t('common.busy') : t('roomStatus.occupied')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{room.room_name}</div>
                </button>
              );
            })}
          </div>
          {roomIds.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-emerald-700">
              <span className="font-medium">{t('form.selectedRooms')}:</span>
              {roomIds.map(id => (
                <span key={id} className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold">
                  {t('roomLabel')} {rooms.find(r => r.id === id)?.room_number}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">{t('form.rentCalculation')}</h3>
          <div className="space-y-2 rounded-lg bg-slate-50 p-4 sm:p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('form.dailyRate')}</span>
              <span className="font-semibold text-slate-800">{fmtCurrency(dailyRate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('form.numberOfDays')}</span>
              <span className="font-semibold text-slate-800">{numberOfDays || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t('form.roomCount')}</span>
              <span className="font-semibold text-slate-800">{roomCount || '—'}</span>
            </div>
            <div className="my-2 border-t border-dashed border-slate-300" />
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-slate-700">{t('form.totalRent')}</span>
              <span className="text-xl font-bold text-emerald-700">{fmtCurrency(totalRent)}</span>
            </div>
            <p className="text-xs text-slate-400">
              {guestTypeLabel(guestType, lang)} — {fmtCurrency(dailyRate)}
              {roomCount ? ` × ${roomCount}` : ''} × {numberOfDays || 0}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <FormGroup>
              <FormLabel>{t('co.amountPaid')} ({t('co.totalRent')}: {fmtCurrency(totalRent)})</FormLabel>
              <Input
                type="number"
                min={0}
                max={totalRent}
                value={amountPaidStr}
                onChange={e => setAmountPaidStr(e.target.value)}
                placeholder={t('co.amountPaid')}
              />
            </FormGroup>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3 text-center">
                <div className="text-xs text-slate-500">{t('co.totalRent')}</div>
                <div className="text-lg font-bold text-slate-800">{fmtCurrency(totalRent)}</div>
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
              <select value={paymentStatus} disabled className="rounded-md bg-white text-sm font-medium text-slate-700">
                <option value={paymentStatus}>{paymentStatusLabel(paymentStatus, lang)}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {t('form.validate')}
          </div>
          <ul className="ml-5 list-disc space-y-0.5 text-sm text-red-600">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg">{t('co.complete')}</Button>
      </div>
    </form>
  );
}

/* ---------- Admin: existing bookings list + checkout modal ---------- */

function AdminCheckoutList() {
  const searchParams = useSearchParams();
  const { bookings, rooms, updateBooking } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtDate, fmtCurrency } = useLang();

  const [checkoutTarget, setCheckoutTarget] = useState<string | null>(null);
  const [amountPaidStr, setAmountPaidStr] = useState('0');

  const currentlyActive = useMemo(
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-amber-600" />
            {t('co.activeGuests')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentlyActive.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">{t('co.noGuests')}</p>
          ) : (
            currentlyActive.map(b => (
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
                  <div className="text-xs text-slate-400">{t('form.dailyRate')}</div>
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

              {target.notes && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">{t('form.notes')}</div>
                  <div className="mt-1 whitespace-pre-line text-sm text-slate-700">{target.notes}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <FormGroup>
                <FormLabel>{t('co.amountPaid')} ({t('co.totalRent')}: {fmtCurrency(target.total_rent)})</FormLabel>
                <Input
                  type="number"
                  min={0}
                  max={target.total_rent}
                  value={amountPaidStr}
                  onChange={e => setAmountPaidStr(e.target.value)}
                  placeholder={t('co.amountPaid')}
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
    </div>
  );
}

/* ---------- Router ---------- */

function CheckoutPageContent() {
  const [showManual, setShowManual] = useState(false);
  const { t } = useLang();

  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-800">{t('co.title')}</h2>
            <Button onClick={() => setShowManual(true)}>
              <Plus className="h-4 w-4" />
              {t('co.newCheckout')}
            </Button>
          </div>
          <AdminCheckoutList />
          <Modal open={showManual} onClose={() => setShowManual(false)} title={t('co.newCheckout')} size="lg">
            <CaretakerCheckout />
          </Modal>
        </div>
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
