'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Chat Not Found</h1>
        <p className="text-muted-foreground max-w-md">
  {`This chat doesn't exist or you don't have permission to view it. You'll be redirected to the home page shortly.`}
</p>

        <div className="flex gap-2">
          <Button onClick={() => router.push('/')} variant="default">
            Go Home
          </Button>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
