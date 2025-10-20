'use client';

import { AlertCircle, BarChart3, Calendar, CheckCircle, CreditCard, Globe, LogOut, Mail, Menu, Plus, Search, Settings, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import useClickOutside from '../../lib/hooks/useClickOutside';
import { useMyBusiness } from '../../lib/hooks/useMyBusiness';
import {
  hasBusinessAndSubscriptionFromAPI,
  hasBusinessNoSubscriptionFromAPI,
  isCustomer,
  isCustomerOnly
} from '../../lib/utils/permissions';
import ThemeSelector from '../ui/ThemeSelector';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout, hasInitialized, isLoading } = useAuth();
  const { 
    businesses, 
    subscriptions, 
    hasBusinesses, 
    isFirstTimeUser, 
    canCreateBusiness,
    isLoading: businessesLoading 
  } = useMyBusiness();
  const profileRef = useRef<HTMLDivElement>(null);

  // For backward compatibility, also set subscriptionsLoading to match businessesLoading
  const subscriptionsLoading = businessesLoading;
  
  // Only show loading if we're actually loading AND don't have any data yet
  const isDataLoading = businessesLoading && !hasBusinesses;


  // Use custom hook for click outside behavior
  useClickOutside(profileRef, () => setIsProfileOpen(false));

  return (
    <nav className="bg-[var(--theme-navbar)] backdrop-blur-xl border-b border-[var(--theme-border)] sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center h-16">
          {/* Logo - Left side */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 sm:w-8 sm:h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
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
                {isDataLoading ? (
                  // Show loading state only when we don't have data yet
                  <div className="hidden sm:block w-24 h-8 bg-[var(--theme-secondary)] animate-pulse rounded-lg"></div>
                ) : hasBusinessAndSubscriptionFromAPI(user, businesses, subscriptions) ? (
                  // User has business and subscription - show both İşletmem and Randevu Al
                  <>
                    <Link 
                      href="/businesses" 
                      className="hidden sm:inline-flex bg-[var(--theme-accent)] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-accentHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                      title="Randevu Al"
                    >
                      <span className="hidden md:inline">Randevu Al</span>
                      <span className="md:hidden">Keşfet</span>
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="hidden sm:inline-flex bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                      title="İşletmem"
                    >
                      <span className="hidden md:inline">İşletmem</span>
                      <span className="md:hidden">İşletme</span>
                    </Link>
                  </>
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
                      <User className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
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
                            <Settings className="w-4 h-4 text-white" />
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
                            <User className="w-5 h-5 text-blue-600" />
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
                              <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="font-semibold">Randevularım</span>
                          </Link>
                        )}
                        
                        {/* Conditional mobile navigation based on user state */}
                        {isDataLoading ? (
                          <div className="px-3 py-3 sm:hidden">
                            <div className="w-full h-12 bg-gray-200 animate-pulse rounded-xl"></div>
                          </div>
                        ) : hasBusinessAndSubscriptionFromAPI(user, businesses, subscriptions) ? (
                          // User has business and subscription - show both Randevu Al and İşletmem
                          <>
                            <Link 
                              href="/businesses" 
                              className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-orange-50 rounded-xl transition-all duration-200 group sm:hidden"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <Search className="w-5 h-5 text-orange-600" />
                              </div>
                              <span className="font-semibold">Randevu Al</span>
                            </Link>
                            <Link 
                              href="/dashboard" 
                              className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-purple-50 rounded-xl transition-all duration-200 group sm:hidden"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                              </div>
                              <span className="font-semibold">İşletmem</span>
                            </Link>
                          </>
                        ) : hasBusinessNoSubscriptionFromAPI(user, businesses, subscriptions) ? (
                          // User has business but no subscription - show only subscription button
                          <Link 
                            href="/subscription" 
                            className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-yellow-50 rounded-xl transition-all duration-200 group sm:hidden"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                              <CheckCircle className="w-5 h-5 text-yellow-600" />
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
                                <Search className="w-5 h-5 text-orange-600" />
                              </div>
                              <span className="font-semibold">Randevu Al</span>
                            </Link>
                            <Link 
                              href="/onboarding" 
                              className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-900 hover:bg-indigo-50 rounded-xl transition-all duration-200 group sm:hidden"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                <Plus className="w-5 h-5 text-indigo-600" />
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
                            <Settings className="w-5 h-5 text-gray-600" />
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
                            <LogOut className="w-5 h-5 text-red-600" />
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
                {/* Mobile-enhanced Giriş Yap button */}
                <Link href="/auth" className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--theme-border)] text-[var(--theme-navbarForeground)] font-semibold shadow-sm hover:bg-[var(--theme-backgroundSecondary)] active:scale-[0.98] transition-all text-sm">
                  Giriş Yap
                </Link>
                {/* Desktop simple link */}
                <Link href="/auth" className="hidden md:inline-flex text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors text-sm">
                  Giriş Yap
                </Link>
                <Link href="/auth" className="hidden md:inline-flex bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-4 py-2 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm">
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
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
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
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                RandevuBu
              </span>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <X className="w-5 h-5" />
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
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                  <CreditCard className="w-4 h-4 text-green-600" />
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
                  <Mail className="w-4 h-4 text-purple-600" />
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
                  <AlertCircle className="w-4 h-4 text-orange-600" />
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}