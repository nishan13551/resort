'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Building2, Wallet, TrendingUp, Percent } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useData } from '@/lib/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, FormLabel, FormGroup } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useLang, guestTypeLabel, paymentStatusLabel, BN_MONTHS, EN_MONTHS } from '@/lib/i18n';
import { getToday, getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, bookingRoomsLabel } from '@/lib/utils';

type RangeKey = 'today' | 'week' | 'month' | 'custom';

const PIE_COLORS = ['#047857', '#3b82f6', '#f59e0b'];

export default function ReportsPage() {
  const { bookings, rooms } = useData();
  const { t, lang, fmtDate, fmtCurrency } = useLang();

  const [rangeKey, setRangeKey] = useState<RangeKey>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { start, end } = useMemo(() => {
    switch (rangeKey) {
      case 'today':
        return { start: getToday(), end: getToday() };
      case 'week':
        return { start: getWeekStart(), end: getWeekEnd() };
      case 'month':
        return { start: getMonthStart(), end: getMonthEnd() };
      case 'custom':
        return { start: customStart || getMonthStart(), end: customEnd || getMonthEnd() };
    }
  }, [rangeKey, customStart, customEnd]);

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      if (b.booking_status === 'cancelled') return false;
      return !(b.check_out_date < start || b.check_in_date > end);
    });
  }, [bookings, start, end]);

  const totalRevenue = filtered.reduce((s, b) => s + b.total_rent, 0);
  const totalCollected = filtered.reduce((s, b) => s + b.amount_paid, 0);
  const totalDue = filtered.reduce((s, b) => s + b.due_amount, 0);

  const revenueByType = useMemo(() => {
    const bwdb = filtered.filter(b => b.guest_type === 'bwdb').reduce((s, b) => s + b.total_rent, 0);
    const govt = filtered.filter(b => b.guest_type === 'govt_other').reduce((s, b) => s + b.total_rent, 0);
    const priv = filtered.filter(b => b.guest_type === 'private' || b.guest_type === 'ngo' || b.guest_type === 'general').reduce((s, b) => s + b.total_rent, 0);
    return { bwdb, govt, priv };
  }, [filtered]);

  const roomWise = useMemo(() => {
    return rooms
      .map(r => ({
        room: r.room_number,
        revenue: filtered
          .filter(b => b.room_id === r.id)
          .reduce((s, b) => s + b.total_rent, 0),
      }))
      .filter(r => r.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [rooms, filtered]);

  const monthlyRevenue = useMemo(() => {
    const rows: { key: string; label: string }[] = [];
    const bdToday = new Date(
      new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'numeric', day: 'numeric' }).format()
    );
    const months = lang === 'bn' ? BN_MONTHS : EN_MONTHS;
    for (let i = 5; i >= 0; i--) {
      const ym = new Date(bdToday.getFullYear(), bdToday.getMonth() - i, 1);
      rows.push({
        key: `${ym.getFullYear()}-${String(ym.getMonth() + 1).padStart(2, '0')}`,
        label: months[ym.getMonth()],
      });
    }
    return rows.map(m => ({
      name: m.label,
      revenue: bookings
        .filter(b => {
          if (b.booking_status === 'cancelled') return false;
          return b.check_in_date.startsWith(m.key);
        })
        .reduce((s, b) => s + b.total_rent, 0),
    }));
  }, [bookings, lang]);

  const guestTypeChartData = [
    { name: guestTypeLabel('bwdb', lang), revenue: revenueByType.bwdb },
    { name: guestTypeLabel('govt_other', lang), revenue: revenueByType.govt },
    { name: guestTypeLabel('private', lang), revenue: revenueByType.priv },
  ];

  const statusCounts = useMemo(() => {
    const today = getToday();
    let occupied = 0;
    let booked = 0;
    let available = 0;
    for (const room of rooms) {
      const hasLive = bookings.some(
        b => b.room_id === room.id && b.booking_status === 'checked_in' && b.check_in_date <= today && b.check_out_date >= today
      );
      if (hasLive) occupied++;
      else {
        const hasBooked = bookings.some(
          b => b.room_id === room.id && b.booking_status === 'booked' && b.check_in_date <= today && b.check_out_date >= today
        );
        if (hasBooked) booked++;
        else available++;
      }
    }
    return { occupied, booked, available };
  }, [bookings, rooms]);

  const occupancyData = [
    { name: t('rep.occupied'), value: statusCounts.occupied },
    { name: t('rep.booked'), value: statusCounts.booked },
    { name: t('rep.available'), value: statusCounts.available },
  ];

  const summaryCards = [
    { label: t('rep.totalBookings'), value: String(filtered.length), icon: Building2, color: 'bg-blue-100 text-blue-700' },
    { label: t('rep.totalRevenue'), value: fmtCurrency(totalRevenue), icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700' },
    { label: t('rep.totalCollected'), value: fmtCurrency(totalCollected), icon: Wallet, color: 'bg-green-100 text-green-700' },
    { label: t('rep.totalDue'), value: fmtCurrency(totalDue), icon: Percent, color: 'bg-red-100 text-red-700' },
  ];

  const fmtTooltip = (v: unknown) => fmtCurrency(Number(v));

  return (
    <RequireAuth roles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('rep.title')}</h2>
              <p className="text-sm text-slate-500">
                {fmtDate(start)} — {fmtDate(end)}
              </p>
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              {([
                { key: 'today', label: t('rep.filterToday') },
                { key: 'week', label: t('rep.filterWeek') },
                { key: 'month', label: t('rep.filterMonth') },
                { key: 'custom', label: t('rep.filterCustom') },
              ] as { key: RangeKey; label: string }[]).map(r => (
                <button
                  key={r.key}
                  onClick={() => setRangeKey(r.key)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    rangeKey === r.key ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {rangeKey === 'custom' && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
                  <FormGroup>
                    <FormLabel>{t('rep.startDate')}</FormLabel>
                    <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>{t('rep.endDate')}</FormLabel>
                    <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                  </FormGroup>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map(c => (
              <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-500">{c.label}</div>
                    <div className="mt-1 text-2xl font-bold text-slate-800">{c.value}</div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('rep.monthlyChart')}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(1)}k`} />
                    <Tooltip formatter={fmtTooltip} />
                    <Bar dataKey="revenue" name={t('rep.revenue')} fill="#047857" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('rep.revenueByType')}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={guestTypeChartData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${Math.round((percent ?? 0) * 100)}%)`}
                    >
                      {guestTypeChartData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={fmtTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('rep.roomWise')}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomWise}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="room" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(1)}k`} />
                    <Tooltip formatter={fmtTooltip} />
                    <Bar dataKey="revenue" name={t('rep.revenue')} fill="#065f46" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('rep.occupancy')}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('rep.revenueAnalysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">{guestTypeLabel('bwdb', lang)}</div>
                  <div className="mt-1 text-xl font-bold text-emerald-700">{fmtCurrency(revenueByType.bwdb)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">{guestTypeLabel('govt_other', lang)}</div>
                  <div className="mt-1 text-xl font-bold text-emerald-700">{fmtCurrency(revenueByType.govt)}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">{guestTypeLabel('private', lang)}</div>
                  <div className="mt-1 text-xl font-bold text-emerald-700">{fmtCurrency(revenueByType.priv)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('rep.stayReport')} ({t('rep.bookingsCount', { n: filtered.length })})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.guestName')}</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.room')}</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.guestType')}</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.checkIn')}</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.checkOut')}</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.days')}</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.totalRent')}</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">{t('rep.payment')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-400">{t('rep.noData')}</td></tr>
                  )}
                  {filtered.slice(0, 50).map(b => (
                    <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-medium text-slate-800">{b.guest_name}</td>
                      <td className="px-3 py-2.5 text-slate-600">{bookingRoomsLabel(b, rooms)}</td>
                      <td className="px-3 py-2.5 text-slate-600">{guestTypeLabel(b.guest_type, lang)}</td>
                      <td className="px-3 py-2.5 text-slate-600">{fmtDate(b.check_in_date)}</td>
                      <td className="px-3 py-2.5 text-slate-600">{fmtDate(b.check_out_date)}</td>
                      <td className="px-3 py-2.5 text-slate-600">{b.number_of_days}</td>
                      <td className="px-3 py-2.5 font-semibold text-emerald-700">{fmtCurrency(b.total_rent)}</td>
                      <td className="px-3 py-2.5">
                        {b.due_amount === 0 ? (
                          <Badge tone="green">{paymentStatusLabel('paid', lang)}</Badge>
                        ) : b.amount_paid > 0 ? (
                          <Badge tone="yellow">{paymentStatusLabel('partial', lang)}</Badge>
                        ) : (
                          <Badge tone="red">{paymentStatusLabel('unpaid', lang)}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}