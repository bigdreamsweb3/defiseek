'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { UserButton } from '@civic/auth/react';

export default function Page() {
  // Store redirectTo parameter in a short-lived cookie
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirectTo');
    if (redirectTo) {
      document.cookie = `redirectTo=${redirectTo}; path=/; max-age=300; samesite=lax`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Side - Branding */}
        <div className="flex flex-col justify-center items-center p-10 text-center">
          <Image
            src="/images/logo.svg"
            alt="DeFiSeek Logo"
            width={80}
            height={80}
            className="drop-shadow-md rounded-full mb-6"
            priority
          />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome to DeFiSeek
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xs">
            Access your account securely with Civic Auth
          </p>
        </div>

        {/* Right Side - Civic Inline Auth */}
        <div className="p-10 border-l border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <UserButton className="w-full !static !transform-none !shadow-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
