'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/custom/auth-form';
import { SubmitButton } from '@/components/custom/submit-button';
import { login, LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: 'idle' }
  );

  useEffect(() => {
    if (!state?.status) return;

    switch (state.status) {
      case 'failed':
        toast.error('Invalid credentials!');
        break;
      case 'invalid_data':
        toast.error('Please fill in all required fields!');
        break;
      case 'success':
        setIsSuccessful(true);
        toast.success('Logged in!');
        router.refresh();
        break;
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 md:px-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-8 md:p-10 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo.svg"
              alt="DeFiSeek Logo"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sign in with your email and password
          </p>
        </div>

        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Create one
            </Link>
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
