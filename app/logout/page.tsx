'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserButton } from '@civic/auth/react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Logging out...
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              You will be redirected to the home page shortly
            </p>
            
            <div className="space-y-4">
              <UserButton />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Or click the button above to log out immediately
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
