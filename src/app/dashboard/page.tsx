'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RoomOverview } from '@/components/dashboard/room-overview';
import { TodaysCheckins, TodaysCheckouts } from '@/components/dashboard/todays-checkins';
import { useDashboardStats, useRoomsWithStatus } from '@/lib/use-dashboard-data';
import { useData } from '@/lib/data-provider';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { bookings } = useData();
  const stats = useDashboardStats();
  const rooms = useRoomsWithStatus();

  useEffect(() => {
    if (!currentUser) router.push('/login');
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <RequireAuth roles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <StatsCards stats={stats} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TodaysCheckins bookings={bookings} />
            <TodaysCheckouts bookings={bookings} />
          </div>

          <RoomOverview rooms={rooms} bookings={bookings} />
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}