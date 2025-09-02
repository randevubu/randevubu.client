'use client';

import Navbar from '../../src/components/layout/Navbar';
import Footer from '../../src/components/layout/Footer';
import ProfileGuard from '../../src/components/features/ProfileGuard';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileGuard>
      <div className="min-h-screen bg-[var(--theme-background)] transition-colors duration-300">
        <Navbar />
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </ProfileGuard>
  );
}
