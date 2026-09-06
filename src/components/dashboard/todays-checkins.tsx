'use client';

import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { Booking } from '@/lib/types';
import { useLang, guestTypeLabel } from '@/lib/i18n';
import { isToday } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TodaysCheckins({ bookings }: { bookings: Booking[] }) {
  const { t, lang, fmtDate, fmtCurrency } = useLang();
  const todays = bookings.filter(b => isToday(b.check_in_date));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-4 w-4 text-emerald-600" />
          {t('dash.todaysCheckin')}
        </CardTitle>
        {todays.length > 0 && <Badge tone="green">{t('common.peopleCount', { n: todays.length })}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        {todays.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">{t('dash.noCheckins')}</p>
        ) : (
          todays.map(b => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-800">{b.guest_name}</div>
                <div className="text-xs text-slate-500">
                  {t('roomLabel')} {b.room_number} • {guestTypeLabel(b.guest_type, lang)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-slate-500">{t('dash.checkoutOn')} {fmtDate(b.check_out_date)}</div>
                <div className="text-sm font-semibold text-emerald-700">{fmtCurrency(b.total_rent)}</div>
              </div>
            </div>
          ))
        )}
        {todays.length > 0 && (
          <Link href="/checkin" className="mt-2 block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800">
            {t('dash.goToCheckin')} →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function TodaysCheckouts({ bookings }: { bookings: Booking[] }) {
  const { t, lang, fmtCurrency } = useLang();
  const todays = bookings.filter(b => isToday(b.check_out_date));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <LogOut className="h-4 w-4 text-amber-600" />
          {t('dash.todaysCheckout')}
        </CardTitle>
        {todays.length > 0 && <Badge tone="yellow">{t('common.peopleCount', { n: todays.length })}</Badge>}
      </CardHeader>
      <CardContent className="space-y-3">
        {todays.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">{t('dash.noCheckouts')}</p>
        ) : (
          todays.map(b => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-800">{b.guest_name}</div>
                <div className="text-xs text-slate-500">
                  {t('roomLabel')} {b.room_number} • {guestTypeLabel(b.guest_type, lang)}
                </div>
              </div>
              <div className="text-right">
                {b.due_amount > 0 ? (
                  <Badge tone="red">{t('dueLabel')}: {fmtCurrency(b.due_amount)}</Badge>
                ) : (
                  <Badge tone="green">{t('paymentStatus.paid')}</Badge>
                )}
                <div className="mt-1 text-xs text-slate-400">{t('totalRentLabel')}: {fmtCurrency(b.total_rent)}</div>
              </div>
            </div>
          ))
        )}
        {todays.length > 0 && (
          <Link href="/checkout" className="mt-2 block text-center text-sm font-medium text-amber-700 hover:text-amber-800">
            {t('dash.goToCheckout')} →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}