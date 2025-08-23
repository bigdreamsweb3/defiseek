'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@civic/auth/react';

export function useAuthRedirect() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Store the current path as the redirect destination
      const currentPath = window.location.pathname + window.location.search;
      document.cookie = `redirectTo=${currentPath}; path=/; max-age=300; samesite=lax`;
      
      // Redirect to login
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading, isAuthenticated: !!user };
}
