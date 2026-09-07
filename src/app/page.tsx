'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { useLang } from '@/lib/i18n';

export default function Home() {
  const { currentUser, authReady } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  useEffect(() => {
    if (!authReady) return;
    if (!currentUser) {
      router.replace('/login');
    } else {
      router.replace(currentUser.role === 'caretaker' ? '/bookings' : '/dashboard');
    }
  }, [authReady, currentUser, router]);

  if (!authReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return null;
}