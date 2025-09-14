'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setCurrentLocale } from '@/src/lib/api';
import { getCurrentLocale } from '@/src/lib/utils/locale';
import type { Locale } from '@/src/i18n';

interface LocaleContextType {
  locale: Locale;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

export function LocaleProvider({ children, locale }: LocaleProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Update API client with current locale
    setCurrentLocale(locale);
  }, [locale]);

  useEffect(() => {
    // Update locale when pathname changes
    const currentLocale = getCurrentLocale(pathname);
    setCurrentLocale(currentLocale);
  }, [pathname]);

  return (
    <LocaleContext.Provider value={{ locale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}