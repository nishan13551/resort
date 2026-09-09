'use client';

import { useState } from 'react';
import { Save, RotateCcw, Info, Database } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { GUEST_TYPE_RATES } from '@/lib/constants';
import { useLang, guestTypeLabel } from '@/lib/i18n';
import { isSupabaseEnabled } from '@/lib/supabase';

const ONLINE = isSupabaseEnabled();

export default function SettingsPage() {
  const { hasRole } = useAuth();
  const { bookings, rooms, payments, refresh } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtCurrency } = useLang();

  const [resetOpen, setResetOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const canEditRates = hasRole('admin');

  function handleReset() {
    setClearing(true);
    try {
      [
        'dhansiri_bookings',
        'dhansiri_rooms',
        'dhansiri_payments',
        'dhansiri_users',
        'dhansiri_session',
        'dhansiri_lang',
      ].forEach(key => localStorage.removeItem(key));
      refresh();
      showToast(t('set.resetDone'));
    } catch {
      showToast(t('set.resetFailed'), 'error');
    } finally {
      setClearing(false);
      setResetOpen(false);
    }
  }

  const demoStats = {
    bookings: bookings.length,
    rooms: rooms.length,
    payments: payments.length,
  };

  return (
    <RequireAuth roles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{t('set.title')}</h2>
            <p className="text-sm text-slate-500">{t('set.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-700" />
                  {t('set.rentRates')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['bwdb', 'govt_other', 'private'] as const).map(type => (
                    <div key={type} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{guestTypeLabel(type, lang)}</div>
                        <div className="text-xs text-slate-400">{t('dailyRateLabel')}</div>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-emerald-700">{fmtCurrency(GUEST_TYPE_RATES[type])}</span>
                        <span className="text-xs text-slate-400">{t('set.perDay')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {canEditRates ? (
                  <p className="mt-3 text-xs text-slate-400">
                    {t('set.rateAdminNote')}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">{t('set.rateCaretakerNote')}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-700" />
                  {t('set.dataManagement')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg bg-slate-50 p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{demoStats.bookings}</div>
                      <div className="text-xs text-slate-500">{t('set.records')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{demoStats.rooms}</div>
                      <div className="text-xs text-slate-500">{t('nav.rooms')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{demoStats.payments}</div>
                      <div className="text-xs text-slate-500">{t('paymentStatusLabel')}</div>
                    </div>
                  </div>
                </div>

                {canEditRates && (
                  <div className="flex flex-wrap gap-3">
                    {ONLINE ? (
                      <p className="w-full rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
                        {t('set.onlineResetNote')}
                      </p>
                    ) : (
                      <Button variant="outline" onClick={() => setResetOpen(true)}>
                        <RotateCcw className="h-4 w-4" />
                        {t('set.resetDemo')}
                      </Button>
                    )}
                    <Button variant="outline" disabled>
                      <Save className="h-4 w-4" />
                      {t('common.save')}
                    </Button>
                  </div>
                )}
                <p className="mt-3 text-xs text-slate-400">
                  {t('set.localStorageNote')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal open={resetOpen} onClose={() => setResetOpen(false)} title={t('set.resetDemo')} size="sm">
          <p className="text-sm text-slate-600">
            {t('set.resetConfirm')}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResetOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleReset} disabled={clearing}>
              {clearing ? t('set.resetInProgress') : t('set.reset')}
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </RequireAuth>
  );
}