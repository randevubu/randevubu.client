'use client';

import { PhoneAuth } from '../../components';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/5 via-[var(--theme-background)] to-[var(--theme-accent)]/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full">
        <PhoneAuth />
      </div>
    </div>
  );
}