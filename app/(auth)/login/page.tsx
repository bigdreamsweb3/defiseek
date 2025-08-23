
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { UserButton } from '@civic/auth/react';

export default function Page() {
  // Capture redirectTo parameter and store it in a cookie
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirectTo');
    
    if (redirectTo) {
      // Store the redirect destination in a cookie
      document.cookie = `redirectTo=${redirectTo}; path=/; max-age=300; samesite=lax`;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo.svg"
                alt="DeFiSeek Logo"
                width={56}
                height={56}
                className="drop-shadow-sm"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Login or Create Account
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Get started with DeFiSeek
            </p>
          </div>

          {/* Auth Section */}
          <div className="px-8 pb-8">
            <div className="space-y-4">
              {/* Civic Auth Button */}
              <div className="flex justify-center">
                <UserButton />
              </div>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                    Secure Authentication
                  </span>
                </div>
              </div>

              {/* Info Text */}
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Powered by Civic Auth for enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        {/* <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
