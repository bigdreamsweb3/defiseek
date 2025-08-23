'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/custom/auth-form';
import { SubmitButton } from '@/components/custom/submit-button';
import { register, RegisterActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<
    RegisterActionState & { error?: string },
    FormData
  >(register, {
    status: 'idle',
  });

  useEffect(() => {
    if (state.status === 'user_exists') {
      toast.error('Account already exists');
    } else if (state.status === 'failed') {
      toast.error(state.error || 'Failed to create account');
    } else if (state.status === 'invalid_data') {
      toast.error('Please fill in all required fields!');
    } else if (state.status === 'success') {
      toast.success('Account created successfully');
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

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
              Create your account
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Join DeFiSeek and start your crypto journey
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            <AuthForm action={handleSubmit} defaultEmail={email}>
              <SubmitButton isSuccessful={isSuccessful}>Create Account</SubmitButton>
            </AuthForm>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
            >
              Sign in
            </Link>{' '}
            instead.
          </p>
        </div>
      </div>
    </div>
  );
}
