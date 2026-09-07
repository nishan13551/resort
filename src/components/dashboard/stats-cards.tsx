'use client';

import { useState } from 'react';
import { Building2, CalendarCheck, Banknote, TrendingUp, BedDouble, BookCheck, AlarmClock, Pencil, RotateCcw } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { useLang } from '@/lib/i18n';
import { useDashboardOverrides } from '@/lib/use-dashboard-overrides';
import { Modal } from '@/components/ui/modal';

type CardKey =
  | 'todayBookings'
  | 'todayRevenue'
  | 'monthRevenue'
  | 'totalBookings'
  | 'availableRooms'
  | 'bookedRooms'
  | 'occupiedRooms';

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const { t, fmtCurrency } = useLang();
  const { overrides, loading, setOverride, clearOverride } = useDashboardOverrides();
  const [editing, setEditing] = useState<CardKey | null>(null);
  const [draft, setDraft] = useState('');

  const isCurrency = (key: CardKey) => key === 'todayRevenue' || key === 'monthRevenue';

  const displayValue = (key: CardKey) => {
    const computed = Number(stats[key]);
    const value = overrides[key] !== undefined ? overrides[key] : computed;
    return isCurrency(key) ? fmtCurrency(value) : String(value);
  };

  const hasOverride = (key: CardKey) => overrides[key] !== undefined;

  const openEdit = (key: CardKey) => {
    const current = overrides[key] !== undefined ? overrides[key] : Number(stats[key]);
    setDraft(String(current));
    setEditing(key);
  };

  const cards = [
    { key: 'todayBookings' as CardKey, label: t('dash.todayBookings'), sub: t('dash.subTodayBookings'), icon: CalendarCheck, color: 'bg-blue-100 text-blue-700' },
    { key: 'todayRevenue' as CardKey, label: t('dash.todayRevenue'), sub: t('dash.subTodayRevenue'), icon: Banknote, color: 'bg-green-100 text-green-700' },
    { key: 'monthRevenue' as CardKey, label: t('dash.monthRevenue'), sub: t('dash.subMonthRevenue'), icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700' },
    { key: 'totalBookings' as CardKey, label: t('dash.totalBookings'), sub: t('dash.subTotalBookings'), icon: Building2, color: 'bg-purple-100 text-purple-700' },
    { key: 'availableRooms' as CardKey, label: t('dash.availableRooms'), sub: t('dash.subAvailableRooms'), icon: BedDouble, color: 'bg-slate-100 text-slate-700' },
    { key: 'bookedRooms' as CardKey, label: t('dash.bookedRooms'), sub: t('dash.subBookedRooms'), icon: BookCheck, color: 'bg-amber-100 text-amber-700' },
    { key: 'occupiedRooms' as CardKey, label: t('dash.occupiedRooms'), sub: t('dash.subOccupiedRooms'), icon: AlarmClock, color: 'bg-red-100 text-red-700' },
  ];

  const editingCard = cards.find(c => c.key === editing);

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <button
          key={card.key}
          type="button"
          onClick={() => openEdit(card.key)}
          className={`animate-fade-up animate-delay-${Math.min(i, 4)} group relative rounded-2xl border border-emerald-100/70 bg-white/90 p-3.5 text-left shadow-sm shadow-emerald-900/5 transition-transform active:scale-[0.98] ${hasOverride(card.key) ? 'ring-2 ring-emerald-300' : 'hover:border-emerald-300'}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 text-right text-[10px] font-medium leading-tight text-slate-400">{card.sub}</div>
          </div>
          <div className="mt-2 truncate text-lg font-bold leading-tight text-slate-800">{displayValue(card.key)}</div>
          <div className="flex items-center justify-between gap-1">
            <div className="truncate text-xs font-medium text-slate-500">{card.label}</div>
            <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
              <Pencil className="h-2.5 w-2.5" />
              {t('dash.clickToEdit')}
            </span>
          </div>
          {hasOverride(card.key) && !editing && (
            <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-sm">
              •
            </span>
          )}
        </button>
      ))}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editingCard ? `${t('dash.editValue')} — ${editingCard.label}` : ''}
        size="sm"
      >
        {editingCard && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="text-xs font-medium text-slate-400">{t('dash.autoValue')}</div>
              <div className="mt-0.5 text-lg font-bold text-slate-800">
                {isCurrency(editingCard.key) ? fmtCurrency(Number(stats[editingCard.key])) : String(stats[editingCard.key])}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('dash.overrideValue')}</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step="any"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {hasOverride(editingCard.key) && (
                <button
                  type="button"
                  onClick={() => {
                    clearOverride(editingCard.key);
                    setEditing(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('dash.clearOverride')}
                </button>
              )}
              <div className="flex gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const value = Number(draft);
                    if (!Number.isNaN(value) && value >= 0) {
                      setOverride(editingCard.key, value);
                      setEditing(null);
                    }
                  }}
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
            {loading && <div className="text-[10px] text-slate-400">{t('common.loading')}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}