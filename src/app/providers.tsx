'use client';

import { AuthProvider } from '@/lib/auth-provider';
import { DataProvider } from '@/lib/data-provider';
import { ToastProvider } from '@/components/ui/toast';
import { LangProvider } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <LangProvider>
          <ToastProvider>{children}</ToastProvider>
        </LangProvider>
      </DataProvider>
    </AuthProvider>
  );
}