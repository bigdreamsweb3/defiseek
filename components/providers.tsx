'use client';

import { ReactNode } from 'react';
import { CivicAuthProvider } from '@civic/auth/nextjs';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <CivicAuthProvider>
      {children}
    </CivicAuthProvider>
  );
};
