'use client';

import Image from 'next/image';
import { PhoneAuth } from '../../../components';

const backgroundImageUrl =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80&auto=format&fit=crop';

export default function AuthPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={backgroundImageUrl}
          alt="Modern salon interior"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60" />
      </div>

      <div className="relative max-w-md w-full px-2 sm:px-0">
        <PhoneAuth className="backdrop-blur-xl bg-white/85 dark:bg-[var(--theme-background)]/85 rounded-3xl shadow-2xl border border-white/20 dark:border-[var(--theme-border)] p-6 sm:p-8" />
      </div>
    </div>
  );
}