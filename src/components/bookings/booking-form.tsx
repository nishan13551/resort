'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormLabel, FormGroup, Input, Select } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { GUEST_TYPE_RATES } from '@/lib/constants';
import { useLang, guestTypeLabel } from '@/lib/i18n';
import { GuestType } from '@/lib/types';
import { createId } from '@/lib/conflict-detector';
import { calculateTotalRent, getDailyRate } from '@/lib/rent-calculator';
import { calculateDays, getToday } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function BookingForm({ mode = 'booking', onDone }: { mode?: 'booking' | 'checkin'; onDone?: () => void }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { rooms, addBooking } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtCurrency } = useLang();

  const [bookingDate, setBookingDate] = useState(getToday());
  const [guestName, setGuestName] = useState('');
  const [guestType, setGuestType] = useState<GuestType>('bwdb');
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState(getToday());
  const [checkOutDate, setCheckOutDate] = useState('');

  const numberOfDays = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    try {
      return calculateDays(checkInDate, checkOutDate);
    } catch {
      return 0;
    }
  }, [checkInDate, checkOutDate]);

  const dailyRate = getDailyRate(guestType);
  const roomCount = roomIds.length;
  const totalRent = calculateTotalRent(guestType, numberOfDays) * roomCount;

  function toggleRoom(id: string) {
    setRoomIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function handleCheckInChange(value: string) {
    setCheckInDate(value);
    if (checkOutDate && value && new Date(checkOutDate) <= new Date(value)) {
      const d = new Date(value);
      d.setDate(d.getDate() + 1);
      setCheckOutDate(d.toISOString().split('T')[0]);
    }
  }

  function handleCheckOutChange(value: string) {
    setCheckOutDate(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const firstRoom = rooms.find(r => r.id === roomIds[0]);
    const now = new Date().toISOString();
    const isCheckin = mode === 'checkin';
    const booking = {
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
      amount_paid: 0,
      due_amount: totalRent,
      payment_status: 'unpaid' as const,
      booking_status: (isCheckin ? 'checked_in' : 'booked') as 'booked' | 'checked_in',
      actual_check_in: isCheckin ? now : undefined,
      notes: '',
      created_by: currentUser?.id ?? '',
      created_at: now,
      updated_at: now,
    };

    addBooking(booking);
    showToast(isCheckin ? t('ci.done') : t('form.bookingCreated'));
    if (onDone) onDone();
    else router.push('/checkin');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormGroup>
              <FormLabel>{t('form.bookingDate')}</FormLabel>
              <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
            </FormGroup>

            <FormGroup>
              <FormLabel>{t('form.guestName')} *</FormLabel>
              <Input
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder={t('form.guestName')}
              />
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
              <Input type="date" value={checkOutDate} onChange={e => handleCheckOutChange(e.target.value)} />
            </FormGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-800">{t('form.selectRoom')}</h3>
            <div className="text-xs text-slate-500">
              <span className="mr-3"><span className="mx-1 inline-block h-3 w-3 rounded-sm bg-green-100 border border-green-300 align-middle" /> {t('roomStatus.available')}</span>
              <span className="mr-3"><span className="mx-1 inline-block h-3 w-3 rounded-sm bg-red-100 border border-red-300 align-middle" /> {t('roomStatus.occupied')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-8">
            {rooms.filter(r => r.is_active).map(room => {
              const isOccupied = room.status === 'occupied';
              return (
                <button
                  type="button"
                  key={room.id}
                  disabled={false}
                  onClick={() => {
                    if (isOccupied) return;
                    toggleRoom(room.id);
                  }}
                  className={cn(
                    'relative rounded-lg border-2 p-3 text-left transition-all',
                    roomIds.includes(room.id)
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100'
                      : room.status === 'occupied'
                        ? 'border-red-200 bg-red-50 cursor-not-allowed'
                        : 'border-slate-200 bg-white hover:border-emerald-300 cursor-pointer'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{room.room_number}</span>
                    {roomIds.includes(room.id) && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {isOccupied && (
                      <span className="text-[10px] font-medium text-slate-400">
                        {t('roomStatus.occupied')}
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
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg">{mode === 'checkin' ? t('ci.complete') : t('form.createBooking')}</Button>
        <Button type="button" variant="outline" size="lg" onClick={() => { if (onDone) onDone(); else router.push('/checkin'); }}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}