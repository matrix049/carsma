'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminLogin } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import NightDrive from '@/components/NightDrive';
import Plate from '@/components/Plate';
import Loader from '@/components/Loader';
import { btnPrimary, fieldLabel, inputField } from '@/lib/uiStyles';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-asphalt">
      <Loader size="lg" />
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isInitialized } = useAuth();

  // Get the redirect URL from query params or default to dashboard
  const redirectTo = searchParams.get('redirect') || '/admin/dashboard';

  // Only redirect if we're authenticated and initialization is complete
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isInitialized, isAuthenticated, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await adminLogin({ email, password });
      login(response.token, response.admin);
      // Redirect will happen via useEffect
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is initializing, or while redirecting once signed in
  if (!isInitialized || isAuthenticated) {
    return <FullScreenLoader />;
  }

  return (
    <div className="relative flex min-h-screen supports-[min-height:100dvh]:min-h-dvh items-center justify-center overflow-hidden bg-asphalt px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:py-12">
      <NightDrive className="absolute inset-0 h-full w-full opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,11,0.55),rgba(10,10,11,0.95)_75%)]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center sm:mb-8">
          <Plate size="md" left="L7IT" letter="ح" right="1" aria-label="L7IT" />
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-smoke">Admin</p>
        </div>

        <div className="rounded-3xl bg-carbon/90 p-5 ring-1 ring-white/[0.08] backdrop-blur-xl min-[380px]:p-6 sm:p-8">
          <h1 className="font-display text-xl font-semibold uppercase text-chalk stretch-125">Sign in</h1>
          <p className="mt-1 text-sm text-smoke">Manage orders, products and messages.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div role="alert" className="break-words rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-inset ring-red-400/30">
                {error}
              </div>
            )}
            <label htmlFor="email-address" className="block space-y-2">
              <span className={fieldLabel}>Email</span>
              <input
                id="email-address"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                required
                // 16px at every width so iOS never zooms in on focus (! beats inputField's sm:text-sm)
                className={`${inputField} sm:!text-base`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className="space-y-2">
              <label htmlFor="password" className={fieldLabel}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  required
                  className={`${inputField} pr-14 sm:!text-base`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-smoke transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon/70"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    {showPassword ? (
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 8.5 4.5 9.5 7a13 13 0 01-2.6 3.7M6.5 6.6C4.4 8 3 10.1 2.5 12c1 2.5 4.5 7 9.5 7a9.7 9.7 0 004.4-1" />
                    ) : (
                      <>
                        <path d="M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} aria-busy={isLoading} className={`${btnPrimary} !mt-6 min-h-[52px] w-full`}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <LoginForm />
    </Suspense>
  );
}
