'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, LogOut, ChevronDown, Languages } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { useLang, roleLabel } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { currentUser, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const titleMap: Record<string, string> = {
    dashboard: 'title.dashboard',
    rooms: 'title.rooms',
    bookings: 'title.bookings',
    checkin: 'title.checkin',
    checkout: 'title.checkout',
    calendar: 'title.calendar',
    reports: 'title.reports',
    history: 'title.history',
    users: 'title.users',
    settings: 'title.settings',
  };

  const segment = pathname.split('/')[1] || 'dashboard';
  const pageTitle = t(titleMap[segment] ?? 'title.dashboard');
  const homeHref = currentUser?.role === 'caretaker' ? '/rooms' : '/dashboard';

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-800 via-teal-700 to-teal-600 text-white shadow-md shadow-emerald-900/10">
      <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between gap-2 px-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-emerald-50 transition-colors hover:bg-white/10 active:scale-95"
          title={t('common.more')}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href={homeHref} className="flex min-w-0 flex-1 items-center justify-center">
          <h1 className="truncate text-base font-semibold tracking-tight">{pageTitle}</h1>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleLang}
            className={cn(
              'flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold transition-all active:scale-95',
              lang === 'bn' ? 'bg-white/15 text-emerald-50 hover:bg-white/25' : 'bg-emerald-50 text-emerald-800 hover:bg-white'
            )}
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Languages className="h-4 w-4" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              className="flex items-center rounded-xl px-1 py-1 transition-colors hover:bg-white/10 active:scale-95"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-emerald-100 text-sm font-bold text-emerald-900 ring-2 ring-white/30">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : '?'}
              </div>
              <ChevronDown className="ml-0.5 h-4 w-4 text-emerald-100" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl animate-pop-in">
                <div className="border-b border-emerald-50 bg-emerald-50/60 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-800">{currentUser?.full_name}</div>
                  <div className="text-xs text-slate-500">{currentUser?.email}</div>
                  <div className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {currentUser ? roleLabel(currentUser.role, lang) : ''}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}