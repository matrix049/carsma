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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-asphalt px-4 py-12">
      <NightDrive className="absolute inset-0 h-full w-full opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,11,0.55),rgba(10,10,11,0.95)_75%)]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Plate size="md" left="L7IT" letter="ح" right="1" aria-label="L7IT" />
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-smoke">Admin</p>
        </div>

        <div className="rounded-3xl bg-carbon/90 p-6 ring-1 ring-white/[0.08] backdrop-blur-xl sm:p-8">
          <h1 className="font-display text-xl font-semibold uppercase text-chalk stretch-125">Sign in</h1>
          <p className="mt-1 text-sm text-smoke">Manage orders, products and messages.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-inset ring-red-400/30">
                {error}
              </div>
            )}
            <label htmlFor="email-address" className="block space-y-2">
              <span className={fieldLabel}>Email</span>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputField}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label htmlFor="password" className="block space-y-2">
              <span className={fieldLabel}>Password</span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputField}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" disabled={isLoading} className={`${btnPrimary} !mt-6 w-full`}>
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
