'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hotel, Eye, EyeOff, Languages } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input, FormLabel, FormGroup } from '@/components/ui/form';

export default function LoginPage() {
  const { currentUser, authReady, login } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authReady && currentUser) {
      router.replace(currentUser.role === 'caretaker' ? '/checkout' : '/dashboard');
    }
  }, [authReady, currentUser, router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = login(username, password);
    setLoading(false);
    if (result.success) {
      router.push(result.role === 'caretaker' ? '/checkout' : '/dashboard');
    } else {
      setError(t(result.error === 'disabled' ? 'login.disabled' : 'login.invalid'));
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-4">
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl animate-glow" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl animate-glow" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center animate-fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur">
            <Hotel className="h-9 w-9" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white drop-shadow-sm">{t('appName')}</h1>
          <p className="mt-1 text-emerald-200">{t('appSubtitle')}</p>
        </div>

        <div className="rounded-3xl bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur animate-pop-in sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{t('login.title')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('login.subtitle')}</p>
            </div>
            <button
              onClick={toggleLang}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Languages className="h-4 w-4" />
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <FormGroup>
              <FormLabel htmlFor="username">{t('user.username')}</FormLabel>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={t('login.usernamePlaceholder')}
                required
                autoComplete="username"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="password">{t('login.password')}</FormLabel>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormGroup>

            {error && (
              <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 animate-fade-up">
                {error}
              </div>
            )}

            <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={loading}>
              {loading ? t('common.loading') : t('login.button')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}