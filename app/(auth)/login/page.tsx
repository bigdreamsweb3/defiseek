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
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-3 px-4 text-center sm:px-16">
          <Image
            src="/logo.svg"
            alt="DeFiSeek Logo"
            width={48}
            height={48}
            className="mb-2"
            priority
          />
          <h3 className="text-xl font-semibold text-cyan-600 dark:text-cyan-400">
            Sign In
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>

        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>

          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
