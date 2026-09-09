'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseEnabled } from './supabase';
import { useAuth } from './auth-provider';

const OVERRIDES_KEY = 'dhansiri_dashboard_overrides';

const ONLINE = isSupabaseEnabled();

interface OverrideRow {
  key: string;
  value: number;
}

function loadLocal(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(OVERRIDES_KEY);
    if (stored) return JSON.parse(stored) as Record<string, number>;
  } catch (e) {
    console.error('Failed to load dashboard overrides', e);
  }
  return {};
}

export interface DashboardOverridesValue {
  overrides: Record<string, number>;
  loading: boolean;
  setOverride: (key: string, value: number) => void;
  clearOverride: (key: string) => void;
}

export function useDashboardOverrides(): DashboardOverridesValue {
  const { currentUser } = useAuth();
  const [overrides, setOverrides] = useState<Record<string, number>>(() => (ONLINE ? {} : loadLocal()));
  const [loading, setLoading] = useState(ONLINE);

  useEffect(() => {
    if (!ONLINE || !supabase) return;
    const db = supabase;
    let active = true;

    (async () => {
      try {
        const { data, error } = await db.from('dashboard_overrides').select('key,value');
        if (!error && active && data) {
          const map: Record<string, number> = {};
          for (const row of data) map[row.key] = Number(row.value);
          setOverrides(map);
        }
      } catch {
        /* keep defaults */
      } finally {
        if (active) setLoading(false);
      }
    })();

    const channel = db
      .channel(`dhansiri-overrides-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dashboard_overrides' },
        payload => {
          if (payload.eventType === 'DELETE') {
            const key = payload.old.key as string;
            setOverrides(prev => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
          } else {
            const row = payload.new as OverrideRow;
            setOverrides(prev => ({ ...prev, [row.key]: Number(row.value) }));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      db.removeChannel(channel);
    };
  }, []);

  const persistLocal = useCallback((next: Record<string, number>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
    }
  }, []);

  const setOverride = useCallback(
    (key: string, value: number) => {
      setOverrides(prev => {
        const next = { ...prev, [key]: value };
        if (!ONLINE) persistLocal(next);
        return next;
      });
      if (ONLINE && supabase) {
        supabase
          .from('dashboard_overrides')
          .upsert(
            {
              key,
              value,
              updated_by: currentUser?.username ?? currentUser?.full_name ?? 'admin',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'key' }
          )
          .then(({ error }) => {
            if (error) console.error('supabase override upsert failed', error);
          });
      }
    },
    [currentUser, persistLocal]
  );

  const clearOverride = useCallback(
    (key: string) => {
      setOverrides(prev => {
        const next = { ...prev };
        delete next[key];
        if (!ONLINE) persistLocal(next);
        return next;
      });
      if (ONLINE && supabase) {
        supabase
          .from('dashboard_overrides')
          .delete()
          .eq('key', key)
          .then(({ error }) => {
            if (error) console.error('supabase override delete failed', error);
          });
      }
    },
    [persistLocal]
  );

  return { overrides, loading, setOverride, clearOverride };
}