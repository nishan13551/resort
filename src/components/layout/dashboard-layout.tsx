'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { BottomNav } from './bottom-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/60 to-slate-100">
      <div className="pointer-events-none fixed -top-24 right-0 h-64 w-64 rounded-full bg-teal-200/50 blur-3xl animate-glow" />
      <div className="pointer-events-none fixed bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl animate-glow" />

      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-lg px-4 pb-32 pt-4 sm:px-6 sm:pb-28">
          {children}
        </main>
      </div>

      <BottomNav onMenuClick={() => setSidebarOpen(true)} />
    </div>
  );
}