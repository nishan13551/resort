'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bed,
  CalendarDays,
  PlusCircle,
  LogIn,
  LogOut,
  CalendarRange,
  BarChart3,
  History,
  Users,
  Settings,
  Hotel,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { useLang, roleLabel } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { t, lang } = useLang();

  const NAV_ITEMS = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/rooms', label: t('nav.rooms'), icon: Bed },
    { href: '/bookings', label: t('nav.bookings'), icon: CalendarDays },
    { href: '/bookings/new', label: t('nav.newBooking'), icon: PlusCircle },
    { href: '/checkin', label: t('nav.checkin'), icon: LogIn },
    { href: '/checkout', label: t('nav.checkout'), icon: LogOut },
    { href: '/calendar', label: t('nav.calendar'), icon: CalendarRange },
    { href: '/reports', label: t('nav.reports'), icon: BarChart3 },
    { href: '/history', label: t('nav.history'), icon: History },
  ];

  const showUsers = currentUser?.role === 'admin';
  const caretakerOnly = ['/rooms', '/bookings', '/checkout'];
  const visibleNav = currentUser?.role === 'admin'
    ? NAV_ITEMS
    : NAV_ITEMS.filter(item => caretakerOnly.includes(item.href));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-sm fade-in" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          mobileOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div className="flex items-center gap-2 text-slate-500">
            <ChevronDown className="h-4 w-4" />
            {t('common.more')}
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 active:scale-95"
            title={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-full flex-1 overflow-y-auto px-3 pb-4">
          <nav className="space-y-1">
            {visibleNav.map(item => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]',
                    active
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/20'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 2} />
                  {item.label}
                </Link>
              );
            })}

            {showUsers && (
              <Link
                href="/users"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]',
                  pathname === '/users'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/20'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                )}
              >
                <Users className="h-5 w-5" strokeWidth={2} />
                {t('nav.users')}
              </Link>
            )}

            {currentUser?.role === 'admin' && (
              <Link
                href="/settings"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all active:scale-[0.98]',
                  pathname === '/settings'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/20'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                )}
              >
                <Settings className="h-5 w-5" strokeWidth={2} />
                {t('nav.settings')}
              </Link>
            )}
          </nav>

          <div className="mx-1 mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
            {currentUser && (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-sm font-bold text-white">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-emerald-900">{currentUser.full_name}</div>
                  <div className="truncate text-xs text-emerald-700">{roleLabel(currentUser.role, lang)}</div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-95"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </button>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 px-4 text-center text-[11px] text-slate-400">
            <Hotel className="h-4 w-4" />
            <span>
              {t('appName')} · {t('version')} 1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}