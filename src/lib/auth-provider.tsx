'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from './types';
import { seedUsers } from '../data/mock-data';

interface AuthContextValue {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean; role?: UserRole; error?: 'invalid' | 'disabled' | 'failed' };
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>, password?: string) => void;
  updateUser: (id: string, updates: Partial<User> & { password?: string }) => void;
  deleteUser: (id: string) => void;
  can: (permission: string) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = 'dhansiri_users';
const SESSION_KEY = 'dhansiri_session';

// Password store (demo only - will be replaced by Supabase Auth)
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@dhansiri.com': 'admin098',
  'caretaker@dhansiri.com': 'caretaker123',
};

function loadUsers(): User[] {
  if (typeof window === 'undefined') return seedUsers;
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load users from storage', e);
  }
  return seedUsers;
}

function loadSession(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted data after mount to avoid SSR hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsers(loadUsers());
    setCurrentUserId(loadSession());
  }, []);

  useEffect(() => {
    if (users.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users]);

  const currentUser = users.find(u => u.id === currentUserId && u.is_active) ?? null;

  function login(email: string, password: string): { success: boolean; role?: UserRole; error?: 'invalid' | 'disabled' | 'failed' } {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'invalid' };
    }
    if (!user.is_active) {
      return { success: false, error: 'disabled' };
    }
    const expected = DEMO_PASSWORDS[user.email.toLowerCase()] ?? 'demo-pass-12345';
    if (password !== expected) {
      return { success: false, error: 'invalid' };
    }
    setCurrentUserId(user.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, user.id);
    }
    return { success: true, role: user.role };
  }

  function logout() {
    setCurrentUserId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function addUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>, password?: string) {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: `u_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      created_at: now,
      updated_at: now,
    };
    setUsers(prev => [...prev, newUser]);
    DEMO_PASSWORDS[newUser.email.toLowerCase()] = password?.trim() || 'user123';
  }

  function updateUser(id: string, updates: Partial<User> & { password?: string }) {
    if (updates.password) {
      DEMO_PASSWORDS[updates.email?.toLowerCase() ?? ''] = updates.password;
    }
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates, updated_at: new Date().toISOString() } : u)));
  }

  function deleteUser(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function hasRole(...roles: UserRole[]): boolean {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  }

  function can(permission: string): boolean {
    if (!currentUser) return false;
    switch (currentUser.role) {
      case 'admin':
        return true;
      case 'caretaker':
        return !['users:manage', 'rooms:delete', 'rate:edit'].includes(permission);
      case 'viewer':
        return ['view'].includes(permission);
      default:
        return false;
    }
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, users, login, logout, addUser, updateUser, deleteUser, can, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}