'use client';

import { Building2, CalendarCheck, Banknote, TrendingUp, BedDouble, BookCheck, AlarmClock } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { useLang } from '@/lib/i18n';

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const { t, fmtCurrency } = useLang();

  const cards = [
    {
      label: t('dash.todayBookings'),
      value: String(stats.todayBookings),
      sub: t('dash.subTodayBookings'),
      icon: CalendarCheck,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: t('dash.todayRevenue'),
      value: fmtCurrency(stats.todayRevenue),
      sub: t('dash.subTodayRevenue'),
      icon: Banknote,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: t('dash.monthRevenue'),
      value: fmtCurrency(stats.monthRevenue),
      sub: t('dash.subMonthRevenue'),
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: t('dash.totalBookings'),
      value: String(stats.totalBookings),
      sub: t('dash.subTotalBookings'),
      icon: Building2,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      label: t('dash.availableRooms'),
      value: String(stats.availableRooms),
      sub: t('dash.subAvailableRooms'),
      icon: BedDouble,
      color: 'bg-slate-100 text-slate-700',
    },
    {
      label: t('dash.bookedRooms'),
      value: String(stats.bookedRooms),
      sub: t('dash.subBookedRooms'),
      icon: BookCheck,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      label: t('dash.occupiedRooms'),
      value: String(stats.occupiedRooms),
      sub: t('dash.subOccupiedRooms'),
      icon: AlarmClock,
      color: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`animate-fade-up animate-delay-${Math.min(i, 4)} rounded-2xl border border-emerald-100/70 bg-white/90 p-3.5 shadow-sm shadow-emerald-900/5 transition-transform active:scale-[0.98]`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 text-right text-[10px] font-medium leading-tight text-slate-400">{card.sub}</div>
          </div>
          <div className="mt-2 truncate text-lg font-bold leading-tight text-slate-800">{card.value}</div>
          <div className="truncate text-xs font-medium text-slate-500">{card.label}</div>
        </div>
      ))}
    </div>
  );
}