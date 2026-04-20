'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Debug logging
    if (typeof window !== 'undefined') {
      console.log('🔍 ProtectedRoute - Current path:', window.location.pathname);
      console.log('🔍 ProtectedRoute - Is authenticated:', isAuthenticated);
    }
    
    // Only redirect to login if not authenticated
    if (!isAuthenticated) {
      console.log('🔄 ProtectedRoute - Redirecting to /admin/login (not authenticated)');
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  // Prevent rendering children if not authenticated or not yet mounted
  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
