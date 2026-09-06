'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

export default function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    } else {
      router.replace(currentUser.role === 'caretaker' ? '/bookings' : '/dashboard');
    }
  }, [currentUser, router]);

  return null;
}