'use client';

import Link from 'next/link';

export default function MobileBottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 mobile-safe-area-bottom">
      {/* Mobile Bottom Navigation */}
      <div className="bg-[var(--theme-card)] mobile-backdrop-blur border-t border-[var(--theme-border)] px-4 py-4">
        <div className="flex justify-center">
          {/* Single CTA Button */}
          <Link href="/businesses" className="w-full text-center flex justify-center items-center bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl mobile-touch-feedback relative overflow-hidden flex items-center space-x-2 min-h-[56px]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="relative z-10">Randevu Al</span>
          </Link>
        </div>
      </div>
    </div>
  );
}