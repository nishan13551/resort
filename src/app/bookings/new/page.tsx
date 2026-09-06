'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { BookingForm } from '@/components/bookings/booking-form';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/lib/i18n';

export default function NewBookingPage() {
  const router = useRouter();
  const { currentUser, hasRole } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    if (!currentUser) router.push('/login');
  }, [currentUser, router]);

  if (!currentUser) return null;

  const canBook = hasRole('admin');

  return (
    <RequireAuth roles={['admin']}>
      <DashboardLayout>
        {!canBook ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('common.permissionDenied')}</CardTitle>
            </CardHeader>
            <div className="p-4 text-sm text-slate-500">
              {t('common.permissionDeniedDesc')}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <BookingForm />
          </div>
        )}
      </DashboardLayout>
    </RequireAuth>
  );
}