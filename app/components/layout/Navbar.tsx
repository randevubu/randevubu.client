'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout, hasInitialized, isLoading } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

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
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg font-black text-gray-900">
                  RandevuBu
                </span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link href="/features" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm">
                Özellikler
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm">
                Fiyatlandırma
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm">
                İletişim
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm">
                Hakkımızda
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {!hasInitialized ? (
              // Show loading state until auth is initialized to prevent hydration mismatch
              <div className="flex items-center space-x-3">
                <div className="w-16 h-8 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-12 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profil</span>
                      </div>
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Ayarlar</span>
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Çıkış Yap</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm">
                  Giriş Yap
                </Link>
                <Link href="/auth" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs">
                  Başla
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 p-2"
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

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
            <Link href="/features" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium">
              Özellikler
            </Link>
            <Link href="/pricing" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium">
              Fiyatlandırma
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium">
              İletişim
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium">
              Hakkımızda
            </Link>
            <div className="pt-4 space-y-2">
              {!hasInitialized ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {user?.phoneNumber || 'Kullanıcı'}
                  </div>
                  <Link href="/profile" className="block w-full text-left text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium">
                    Profil
                  </Link>
                  <Link href="/settings" className="block w-full text-left text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium">
                    Ayarlar
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 text-base font-medium"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="block w-full text-left text-gray-700 hover:text-indigo-600 px-3 py-2 text-base font-medium">
                    Giriş Yap
                  </Link>
                  <Link href="/auth" className="block w-full bg-indigo-600 text-white px-6 py-2 rounded-lg text-base font-medium hover:bg-indigo-700 transition-all text-center">
                    Başla
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}