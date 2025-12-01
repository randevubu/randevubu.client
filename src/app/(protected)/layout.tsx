'use client';

import { ReactNode } from 'react';
import AuthGuard from '@/src/components/ui/AuthGuard';

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}

