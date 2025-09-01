'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
  isCustomerOnly, 
  hasBusinessNoSubscriptionFromAPI, 
  hasBusinessAndSubscriptionFromAPI, 
  getPrimaryBusinessId,
  isCustomer
} from '../../lib/utils/permissions';
import { subscriptionService } from '../../lib/services/subscription';
import { BusinessSubscription } from '../../types/subscription';
import ThemeSelector from '../ui/ThemeSelector';
import { businessService } from '../../lib/services/business';
import { Business } from '../../types/business';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const { user, isAuthenticated, logout, hasInitialized, isLoading } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch businesses for the user (now includes subscription info)
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user || !hasInitialized || isLoading) return;

      try {
        setBusinessesLoading(true);
        // Add timestamp to ensure fresh data
        console.log('🔄 Fetching fresh business data...');
        const response = await businessService.getMyBusiness();
        if (response.success && response.data?.businesses) {
          setBusinesses(response.data.businesses);
          console.log('🏢 Fetched businesses:', response.data.businesses);
          
          // Also set subscriptions from the same response if available
          if (response.data.subscriptions) {
            setSubscriptions(response.data.subscriptions);
            console.log('📱 Fetched subscriptions from business response:', response.data.subscriptions);
          } else {
            console.log('❌ No subscriptions in business response');
            setSubscriptions([]);
          }
        } else {
          setBusinesses([]);
          setSubscriptions([]);
          console.log('❌ No businesses found or API error');
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
        setBusinesses([]);
        setSubscriptions([]);
      } finally {
        setBusinessesLoading(false);
        setSubscriptionsLoading(false);
      }
    };

    fetchBusinesses();
  }, [user?.id, hasInitialized, isLoading]); // Use user.id instead of user object for more precise dependency

  // Debug logging
  useEffect(() => {
    if (user && hasInitialized && !isLoading) {
      const customerOnly = isCustomerOnly(user);
      const businessNoSub = hasBusinessNoSubscriptionFromAPI(user, businesses, subscriptions);
      const businessAndSub = hasBusinessAndSubscriptionFromAPI(user, businesses, subscriptions);
      
      console.log('🔍 Navbar Debug Info:', {
        user: user.id,
        username: user.firstName,
        roles: user.roles?.map(r => r.name),
        isAuthenticated,
        hasInitialized,
        isLoading,
        businesses: businesses.map(b => ({ id: b.id, name: b.name })),
        businessesLoading,
        subscriptions: subscriptions.map(s => ({ id: s.id, status: s.status })),
        subscriptionsLoading,
        businessCount: businesses.length,
        subscriptionCount: subscriptions.length,
        // Decision logic
        customerOnly,
        businessNoSub,
        businessAndSub,
        showButtons: customerOnly ? 'Keşfet + İşletme Oluştur' : 
                    businessNoSub ? 'Abonelik' :
                    businessAndSub ? 'İşletmem' : 'None'
      });
    }
  }, [user, isAuthenticated, hasInitialized, isLoading, businesses, businessesLoading, subscriptions, subscriptionsLoading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-[var(--theme-navbar)] backdrop-blur-xl border-b border-[var(--theme-border)] sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center h-16">
          {/* Logo - Left side */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 sm:w-8 sm:h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl sm:text-lg font-black text-[var(--theme-navbarForeground)]">
                RandevuBu
              </span>
            </Link>
          </div>

          {/* Navigation links - Center */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-6">
              <Link href="/features" className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors text-sm">
                Özellikler
              </Link>
              <Link href="/pricing" className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors text-sm">
                Fiyatlandırma
              </Link>
              <Link href="/contact" className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors text-sm">
                İletişim
              </Link>
              <Link href="/about" className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors text-sm">
                Hakkımızda
              </Link>
            </div>
          </div>

          {/* Auth/Profile section - Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
            {/* Theme Selector - Hidden on small screens */}
            <div className="hidden sm:block">
              <ThemeSelector />
            </div>
            {!hasInitialized ? (
              // Show loading state until auth is initialized to prevent hydration mismatch
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-12 sm:w-16 h-8 bg-[var(--theme-secondary)] animate-pulse rounded"></div>
                <div className="w-8 sm:w-12 h-8 bg-[var(--theme-secondary)] animate-pulse rounded"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                {/* Conditional navigation based on user state */}
                {subscriptionsLoading || businessesLoading ? (
                  // Show loading state
                  <div className="hidden sm:block w-24 h-8 bg-[var(--theme-secondary)] animate-pulse rounded-lg"></div>
                ) : hasBusinessAndSubscriptionFromAPI(user, businesses, subscriptions) ? (
                  // User has business and subscription - show only İşletmem
                  <Link 
                    href="/dashboard" 
                    className="hidden sm:inline-flex bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                    title="İşletmem"
                  >
                    <span className="hidden md:inline">İşletmem</span>
                    <span className="md:hidden">İşletme</span>
                  </Link>
                ) : hasBusinessNoSubscriptionFromAPI(user, businesses, subscriptions) ? (
                  // User has business but no subscription - show only subscription button
                  <Link 
                    href="/subscription" 
                    className="hidden sm:inline-flex bg-[var(--theme-accent)] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-accentHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                    title="Abonelik"
                  >
                    <span className="hidden md:inline">Abonelik</span>
                    <span className="md:hidden">Abone</span>
                  </Link>
                ) : isCustomerOnly(user) ? (
                  // Customer only - show both Randevu Al and İşletme Oluştur
                  <>
                    <Link 
                      href="/businesses" 
                      className="hidden sm:inline-flex bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                      title="Randevu Al"
                    >
                      <span className="hidden md:inline">Randevu Al</span>
                      <span className="md:hidden">Keşfet</span>
                    </Link>
                    <Link 
                      href="/onboarding" 
                      className="hidden sm:inline-flex bg-[var(--theme-accent)] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-accentHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                      title="İşletme Oluştur"
                    >
                      <span className="hidden md:inline">İşletme Oluştur</span>
                      <span className="md:hidden">Oluştur</span>
                    </Link>
                  </>
                ) : null}
                
                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors p-2 rounded-xl hover:bg-[var(--theme-backgroundSecondary)] min-h-[44px] min-w-[44px]"
                  >
                    <div className="w-10 h-10 sm:w-8 sm:h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                
                  {isProfileOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 sm:w-56 rounded-2xl py-2 z-20"
                      style={{
                        backgroundColor: '#ffffff',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {/* Theme selector on mobile */}
                      <div className="sm:hidden px-4 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#ffffff' }}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">Tema Seçici</span>
                        </div>
                        <ThemeSelector />
                      </div>
                      
                      <div className="px-2 py-1">
                        <Link 
                          href="/profile" 
                          className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="font-semibold">Profil</span>
                        </Link>
                        
                        {isCustomer(user) && (
                          <Link 
                            href="/appointments" 
                            className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-green-50 rounded-xl transition-all duration-200 group"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
                              </svg>
                            </div>
                            <span className="font-semibold">Randevularım</span>
                          </Link>
                        )}
                        
                        {/* Conditional mobile navigation based on user state */}
                        {subscriptionsLoading || businessesLoading ? (
                          <div className="px-3 py-3 sm:hidden">
                            <div className="w-full h-12 bg-gray-200 animate-pulse rounded-xl"></div>
                          </div>
                        ) : hasBusinessAndSubscriptionFromAPI(user, businesses, subscriptions) ? (
                          // User has business and subscription - show only İşletmem
                          <Link 
                            href="/dashboard" 
                            className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-purple-50 rounded-xl transition-all duration-200 group sm:hidden"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <span className="font-semibold">İşletmem</span>
                          </Link>
                        ) : hasBusinessNoSubscriptionFromAPI(user, businesses, subscriptions) ? (
                          // User has business but no subscription - show only subscription button
                          <Link 
                            href="/subscription" 
                            className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-yellow-50 rounded-xl transition-all duration-200 group sm:hidden"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="font-semibold">Abonelik</span>
                          </Link>
                        ) : isCustomerOnly(user) ? (
                          // Customer only - show both Randevu Al and İşletme Oluştur
                          <>
                            <Link 
                              href="/businesses" 
                              className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-orange-50 rounded-xl transition-all duration-200 group sm:hidden"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                              <span className="font-semibold">Randevu Al</span>
                            </Link>
                            <Link 
                              href="/onboarding" 
                              className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-indigo-50 rounded-xl transition-all duration-200 group sm:hidden"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <span className="font-semibold">İşletme Oluştur</span>
                            </Link>
                          </>
                        ) : null}
                        
                        <Link 
                          href="/settings" 
                          className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="font-semibold">Ayarlar</span>
                        </Link>
                        
                      </div>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                            window.location.href = '/';
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span className="font-semibold">Çıkış Yap</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors text-sm">
                  Giriş Yap
                </Link>
                <Link href="/auth" className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm">
                  Başla
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] p-3 rounded-xl hover:bg-[var(--theme-backgroundSecondary)] transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Enhanced backdrop - blur and darken */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        />
        
        {/* Sliding menu panel with enhanced shadow */}
        <div 
          className={`fixed inset-0 transform transition-all duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ 
            backgroundColor: '#ffffff',
            backgroundImage: 'none',
            opacity: 1,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            zIndex: 60,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          
          {/* Menu header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">
                RandevuBu
              </span>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu content */}
          <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff' }}>
            {/* Theme Selector - Mobile */}
            <div className="px-4 py-4 border-b border-gray-200" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">0</span>
                </div>
                <span className="font-medium text-gray-900">Tema Seçici</span>
                <div className="ml-auto">
                  <ThemeSelector mobile={true} compact={true} />
                </div>
              </div>
            </div>
            
            {/* Navigation links */}
            <nav className="flex-1 px-4 py-6 space-y-2" style={{ backgroundColor: '#ffffff' }}>
              {/* Public navigation links only - user-specific items removed as they're in profile dropdown */}
              <Link 
                href="/features" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-medium group-hover:text-blue-600 text-gray-900">
                  Özellikler
                </span>
              </Link>

              <Link 
                href="/pricing" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="font-medium group-hover:text-green-600 text-gray-900">
                  Fiyatlandırma
                </span>
              </Link>

              <Link 
                href="/contact" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium group-hover:text-purple-600 text-gray-900">
                  İletişim
                </span>
              </Link>

              <Link 
                href="/about" 
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium group-hover:text-orange-600 text-gray-900">
                  Hakkımızda
                </span>
              </Link>
            </nav>

            {/* Bottom auth section - only for non-authenticated users */}
            {!hasInitialized ? (
              <div className="p-4 border-t border-gray-200" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
                <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            ) : !isAuthenticated && (
              <div className="p-4 border-t border-gray-200 space-y-3" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
                <Link 
                  href="/auth" 
                  className="block w-full text-center px-4 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/auth" 
                  className="block w-full text-center px-4 py-3 rounded-lg font-bold text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105 bg-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Başla
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}