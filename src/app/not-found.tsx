'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { t } = useLang();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-6xl font-bold text-emerald-600">404</p>
        <h1 className="mt-3 text-xl font-semibold text-slate-800">{t('common.notFound')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('common.notFoundDesc')}</p>
        <Link href="/">
          <Button className="mt-6">
            <Home className="h-4 w-4" />
            {t('common.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}