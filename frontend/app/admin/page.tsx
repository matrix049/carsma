'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔍 AdminLogin component - Current path:', window.location.pathname);
      console.log('🔍 AdminLogin component - Is authenticated:', isAuthenticated);
      console.log('🔍 AdminLogin component - Mounted:', mounted);
    }
  }, [mounted, isAuthenticated]);

  // Only redirect if we're authenticated and specifically on the /admin login page
  useEffect(() => {
    if (mounted && isAuthenticated && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      console.log('🔍 Redirect check - Current path:', currentPath);
      // Only redirect if we're exactly on the login page, not on other admin pages
      if (currentPath === '/admin' || currentPath === '/admin/') {
        console.log('🔄 Redirecting to dashboard from login page');
        router.push('/admin/dashboard');
      }
    }
  }, [mounted, isAuthenticated, router]);

  // Early return if not mounted
  if (!mounted) return null;

  // If we're NOT on the login page, don't render this component at all
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath !== '/admin' && currentPath !== '/admin/') {
      return null;
    }
  }

  // If we're authenticated and on the login page, show loading while redirecting
  if (mounted && isAuthenticated && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath === '/admin' || currentPath === '/admin/') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      );
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await adminLogin({ email, password });
      // The context handles storing the token correctly as per our fixes
      login(response.token, response.admin);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-6 md:space-y-8 rounded-2xl md:rounded-3xl border border-zinc-200 bg-white p-6 md:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h2 className="mt-2 text-center text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to access the dashboard
          </p>
        </div>
        <form className="mt-6 md:mt-8 space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}
          <div className="space-y-3 md:space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-xl border-zinc-300 px-4 py-3 placeholder-zinc-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white border"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-xl border-zinc-300 px-4 py-3 placeholder-zinc-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white border"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}