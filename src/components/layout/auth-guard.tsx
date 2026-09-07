'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { useLang } from '@/lib/i18n';
import { UserRole } from '@/lib/types';

export function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { currentUser, authReady } = useAuth();
  const router = useRouter();
  const { t } = useLang();

  useEffect(() => {
    if (authReady && !currentUser) {
      router.replace('/login');
    }
  }, [authReady, currentUser, router]);

  if (!authReady || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
          {t('common.loading')}
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(currentUser.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="text-5xl">🔒</div>
        <h2 className="mt-4 text-xl font-semibold text-slate-800">{t('common.permissionDenied')}</h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {t('common.permissionDeniedDesc')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  useData();
  return <>{currentUser ? children : null}</>;
}