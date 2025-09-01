'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';
import { businessService } from '../../src/lib/services/business';
import { Business } from '../../src/types/business';
import { canViewBusinessStats, isAdmin } from '../../src/lib/utils/permissions';
import { handleApiError } from '../../src/lib/utils/toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation items for the cards
  const navigationItems = [
    { 
      id: 'appointments', 
      name: 'Randevular', 
      href: '/dashboard/appointments', 
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      id: 'customers', 
      name: 'Müşteriler', 
      href: '/dashboard/customers', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    { 
      id: 'services', 
      name: 'Hizmetler', 
      href: '/dashboard/services', 
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    { 
      id: 'reports', 
      name: 'Raporlar', 
      href: '/dashboard/reports', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    { 
      id: 'discount-codes', 
      name: 'İndirim Kodları', 
      href: '/dashboard/discount-codes', 
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    { 
      id: 'subscription', 
      name: 'Abonelik', 
      href: '/dashboard/subscription', 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
              textColor: 'text-indigo-700'
      },
      {
        id: 'usage',
        name: 'Kullanım',
        href: '/dashboard/usage',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700'
      },
      {
        id: 'settings',
        name: 'Ayarlar', 
      href: '/dashboard/settings', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700'
    },
  ];

  useEffect(() => {
    if (authLoading) return;
    
    checkAccessAndLoadData();
  }, [user, isAuthenticated, authLoading]);

  const checkAccessAndLoadData = async () => {
    try {
      // 1. Check if user is authenticated
      if (!isAuthenticated || !user) {
        router.push('/auth');
        return;
      }

      // 2. Load business data and check subscription (API is source of truth)
      await loadBusinessData();

    } catch (error) {
      console.error('Access check failed:', error);
      handleApiError(error);
    }
  };

  const loadBusinessData = async () => {
    try {
      const response = await businessService.getMyBusiness('?includeSubscription=true');
      console.log('Dashboard - API response:', response);
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        const subscription = primaryBusiness.subscription;
        
        console.log('Dashboard - Business:', primaryBusiness.name);
        console.log('Dashboard - Subscription:', subscription);
        
        if (!subscription || !['ACTIVE', 'TRIAL', 'PAST_DUE'].includes(subscription.status)) {
          console.log('Dashboard - No active subscription, redirecting to subscription page');
          router.push('/subscription');
          return;
        }
        
        console.log('Dashboard - Active subscription found, showing dashboard');
        setBusiness(primaryBusiness);
      } else {
        console.log('Dashboard - No business found, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }
      
    } catch (error) {
      console.error('Business data loading failed:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen during checks
  if (authLoading || isLoading || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300">
            {authLoading ? 'Yetkilendirme kontrol ediliyor...' : 'Dashboard yükleniyor...'}
          </span>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Navigation Cards - Mobile Only */}
      <div className="lg:hidden bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
        <div className="px-4 sm:px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] flex items-center transition-colors duration-300">
            <svg className="w-5 h-5 mr-2 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Hızlı Erişim
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {navigationItems
              .filter(item => {
                // Only show discount-codes to admins
                if (item.id === 'discount-codes') {
                  return isAdmin(user);
                }
                return true;
              })
              .map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                                  className={`group relative overflow-hidden rounded-lg p-2.5 sm:p-3 transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  item.bgColor
                } border border-white/20 hover:border-white/40 min-h-[80px]`}
                >
                  {/* Background gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`relative z-10 w-6 h-6 mx-auto mb-2 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  
                  {/* Label */}
                  <div className="relative z-10 text-center">
                    <span className={`text-[10px] leading-tight font-medium ${item.textColor} group-hover:text-[var(--theme-foreground)] transition-colors duration-300`}>
                      {item.name}
                    </span>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Business Details & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 012-2h2a2 2 0 012 2v9m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--theme-foreground)] transition-colors duration-300">{business.name}</h3>
                    <p className="text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">{business.city}, {business.country}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                    business.isActive 
                      ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                      : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 transition-colors duration-300 ${
                      business.isActive ? 'bg-[var(--theme-success)]' : 'bg-[var(--theme-error)]'
                    }`}></div>
                    {business.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  {business.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] transition-colors duration-300">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Doğrulanmış
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">


              {/* Contact & Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[var(--theme-foregroundSecondary)] uppercase tracking-wide mb-3">İletişim Bilgileri</h4>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300">
                      <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">E-posta</label>
                      {business.email ? (
                        <a href={`mailto:${business.email}`} className="text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] hover:underline transition-colors duration-300">
                          {business.email}
                        </a>
                      ) : (
                        <p className="text-sm text-[var(--theme-foregroundMuted)] transition-colors duration-300">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300">
                      <svg className="w-4 h-4 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Telefon</label>
                      {business.phone ? (
                        <a href={`tel:${business.phone}`} className="text-sm text-[var(--theme-success)] hover:text-[var(--theme-success)]/80 hover:underline transition-colors duration-300">
                          {business.phone}
                        </a>
                      ) : (
                        <p className="text-sm text-[var(--theme-foregroundMuted)] transition-colors duration-300">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-info)]/10 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300">
                      <svg className="w-4 h-4 text-[var(--theme-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Website</label>
                      {business.website ? (
                        <a 
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-[var(--theme-info)] hover:text-[var(--theme-info)]/80 hover:underline inline-flex items-center transition-colors duration-300"
                        >
                          {business.website}
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <p className="text-sm text-[var(--theme-foregroundMuted)] transition-colors duration-300">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[var(--theme-foregroundSecondary)] uppercase tracking-wide mb-3">Konum & Detaylar</h4>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-accent)]/10 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300">
                      <svg className="w-4 h-4 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Adres</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300">{business.address || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300">
                      <svg className="w-4 h-4 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Zaman Dilimi</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300">{business.timezone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-foregroundSecondary)]/10 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300">
                      <svg className="w-4 h-4 text-[var(--theme-foregroundSecondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Kuruluş Tarihi</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300">{new Date(business.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Business Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[var(--theme-foregroundSecondary)] uppercase tracking-wide mb-2">İşletme Detayları</h4>
                
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--theme-primary)]/20 rounded-md flex items-center justify-center mt-0.5 transition-colors duration-300">
                    <svg className="w-3 h-3 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-0.5 transition-colors duration-300">İşletme Türü</label>
                    <p className="text-xs text-[var(--theme-foreground)] transition-colors duration-300">Genel İşletme</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--theme-success)]/20 rounded-md flex items-center justify-center mt-0.5 transition-colors duration-300">
                    <svg className="w-3 h-3 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-0.5 transition-colors duration-300">Abonelik Durumu</label>
                    <p className="text-xs text-[var(--theme-foreground)] transition-colors duration-300">
                      {business.subscription?.status === 'ACTIVE' && 'Aktif'}
                      {business.subscription?.status === 'TRIAL' && 'Deneme Süresi'}
                      {business.subscription?.status === 'PAST_DUE' && 'Ödeme Gecikmiş'}
                      {business.subscription?.status === 'CANCELED' && 'İptal Edildi'}
                      {!business.subscription?.status && 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-4 transition-colors duration-300">Son Aktiviteler</h3>
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-[var(--theme-foregroundMuted)] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Henüz aktivite bulunmuyor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}