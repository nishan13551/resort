'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { History, LayoutDashboard, LogIn, LogOut, Menu, Bed } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-provider';
import { cn } from '@/lib/utils';

export function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { t } = useLang();
  const { currentUser } = useAuth();

  const home = currentUser?.role === 'admin'
    ? { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard }
    : { href: '/rooms', label: t('nav.rooms'), icon: Bed };

  const tabClass = (active: boolean) =>
    cn(
      'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] leading-none font-medium transition-all active:scale-95',
      active ? 'text-emerald-700' : 'text-slate-400 hover:text-emerald-600'
    );

  const isCaretaker = currentUser?.role === 'caretaker';

  const tabs = isCaretaker
    ? [
        { href: '/checkout', label: t('nav.checkout'), icon: LogOut },
        { href: '/history', label: t('nav.history'), icon: History },
      ]
    : [
        { href: '/checkin', label: t('nav.checkin'), icon: LogIn },
        { href: '/checkout', label: t('nav.checkout'), icon: LogOut },
        { href: '/history', label: t('nav.history'), icon: History },
      ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-emerald-100 bg-white/95 shadow-[0_-6px_24px_rgba(16,78,60,0.08)] backdrop-blur-lg [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        <Link href={home.href} className={tabClass(isActive(home.href))}>
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-sm">
            <home.icon className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span>{home.label}</span>
        </Link>

        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={tabClass(isActive(tab.href))}
          >
            <tab.icon className="h-5 w-5" strokeWidth={isActive(tab.href) ? 2.4 : 2} />
            <span className="max-w-full truncate">{tab.label}</span>
          </Link>
        ))}

        <button
          onClick={onMenuClick}
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] leading-none font-medium text-slate-400 transition-all active:scale-95 hover:text-emerald-600"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
          <span>{t('common.more')}</span>
        </button>
      </div>
    </nav>
  );
}