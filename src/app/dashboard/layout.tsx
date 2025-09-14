'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../lib/services/business';
import { Business } from '../../types/business';
import { canViewBusinessStats, isAdmin } from '../../lib/utils/permissions';
import { handleApiError } from '../../lib/utils/toast';
import SubscriptionGuard from '../../components/features/SubscriptionGuard';
import ProfileGuard from '../../components/features/ProfileGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && canViewBusinessStats(user)) {
      loadBusinessData();
    } else if (user && !canViewBusinessStats(user)) {
      setError('Bu sayfaya erişim yetkiniz bulunmuyor.');
      setIsLoading(false);
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await businessService.getMyBusiness();
      
      if (!response.success) {
        setError(response.error?.message || 'İşletme bilgileri alınamadı.');
        return;
      }

      if (!response.data?.businesses || response.data.businesses.length === 0) {
        setError('Henüz bir işletmeniz bulunmuyor.');
        return;
      }

      const primaryBusiness = response.data.businesses[0];
      setBusiness(primaryBusiness);
      
    } catch (error) {
      console.error('Business data loading failed:', error);
      handleApiError(error);
      setError('İşletme bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sidebar navigation items
  const navigationItems = [
    { id: 'overview', name: 'Genel Bakış', href: '/dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'appointments', name: 'Randevular', href: '/dashboard/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z' },
    { id: 'customers', name: 'Müşteriler', href: '/dashboard/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { id: 'staff', name: 'Personel', href: '/dashboard/staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'services', name: 'Hizmetler', href: '/dashboard/services', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'reports', name: 'Raporlar', href: '/dashboard/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },

            { id: 'subscription', name: 'Abonelik', href: '/dashboard/subscription', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { id: 'usage', name: 'Kullanım', href: '/dashboard/usage', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { id: 'settings', name: 'Ayarlar', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  // Show access denied for customers  
  if (user && !canViewBusinessStats(user)) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-[var(--theme-card)] rounded-lg shadow-lg p-8 transition-colors duration-300">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-error)]/20 mb-4 transition-colors duration-300">
              <svg className="h-8 w-8 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--theme-foreground)] mb-2 transition-colors duration-300">Erişim Reddedildi</h1>
            <p className="text-[var(--theme-foregroundSecondary)] mb-6 transition-colors duration-300">Dashboard'a erişim yetkiniz bulunmuyor.</p>
            <Link href="/" className="inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg hover:bg-[var(--theme-primaryHover)] transition-colors duration-300">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">Dashboard yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-[var(--theme-card)] rounded-lg shadow-lg p-8 transition-colors duration-300">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-primary)]/20 mb-4 transition-colors duration-300">
              <svg className="h-8 w-8 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 012-2h2a2 2 0 012 2v9m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2 transition-colors duration-300">Henüz işletmeniz yok</h3>
            <p className="text-[var(--theme-foregroundSecondary)] mb-6 transition-colors duration-300">Dashboard'u görüntülemek için önce bir işletme oluşturmalısınız.</p>
            <button className="inline-flex items-center px-6 py-3 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              İşletme Oluştur
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wrap the dashboard content with ProfileGuard and SubscriptionGuard
  return (
    <ProfileGuard>
      <SubscriptionGuard>
        <div className="min-h-screen bg-[var(--theme-background)] flex transition-colors duration-300">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--theme-card)] shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Logo/Brand */}
          <div className="flex items-center h-16 px-6 border-b border-[var(--theme-border)] transition-colors duration-300">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[var(--theme-foreground)] transition-colors duration-300">RandevuBu</span>
            </Link>
          </div>

          {/* Business Info */}
          <div className="px-6 py-4 border-b border-[var(--theme-border)] transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center transition-colors duration-300">
                <svg className="w-5 h-5 text-[var(--theme-primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--theme-foreground)] truncate transition-colors duration-300">{business.name}</p>
                <p className="text-xs text-[var(--theme-foregroundMuted)] truncate transition-colors duration-300">{business.city}, {business.country}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                    isActive
                      ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                      : 'text-[var(--theme-foregroundSecondary)] hover:bg-[var(--theme-backgroundSecondary)] hover:text-[var(--theme-foreground)]'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--theme-border)] transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--theme-foreground)] truncate transition-colors duration-300">{user?.phoneNumber || 'Kullanıcı'}</p>
                <p className="text-xs text-[var(--theme-foregroundMuted)] transition-colors duration-300">Online</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                className="p-2 text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-foregroundSecondary)] transition-colors duration-300"
                title="Çıkış Yap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="bg-[var(--theme-card)] shadow-sm border-b border-[var(--theme-border)] h-16 flex items-center transition-colors duration-300">
            <div className="flex-1 flex items-center justify-between px-4 sm:px-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] lg:hidden transition-colors duration-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1 text-center lg:text-left lg:flex-none">
                <h1 className="text-lg sm:text-xl font-bold text-[var(--theme-foreground)] transition-colors duration-300">
                  {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className={`hidden sm:inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  business.isActive 
                    ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                    : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-1 sm:mr-2 transition-colors duration-300 ${
                    business.isActive ? 'bg-[var(--theme-success)]' : 'bg-[var(--theme-error)]'
                  }`}></div>
                  <span className="hidden sm:inline">{business.isActive ? 'Aktif' : 'Pasif'}</span>
                </span>
                {business.isVerified && (
                  <span className="hidden sm:inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] transition-colors duration-300">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Doğrulanmış</span>
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="">
            {children}
          </main>
        </div>
      </div>
    </SubscriptionGuard>
    </ProfileGuard>
  );
}