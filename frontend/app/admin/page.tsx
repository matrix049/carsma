'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRedirect() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If authenticated, go to dashboard
    if (isAuthenticated) {
      console.log('🔄 AdminRedirect - Authenticated user, redirecting to dashboard');
      router.push('/admin/dashboard');
    } else {
      // If not authenticated, go to login
      console.log('🔄 AdminRedirect - Not authenticated, redirecting to login');
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}