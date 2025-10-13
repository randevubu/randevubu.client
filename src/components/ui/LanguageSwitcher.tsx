'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/src/context/LocaleContext';
import { ChevronDown } from 'lucide-react';
import { locales, type Locale } from '@/src/i18n';
import { createLocalizedUrl, removeLocalePrefix } from '@/src/lib/utils/locale';

interface LanguageSwitcherProps {
  className?: string;
}

const languageNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

const languageFlags: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇺🇸',
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Remove current locale from pathname
    const pathWithoutLocale = removeLocalePrefix(pathname);

    // Create new URL with the selected locale
    const newUrl = createLocalizedUrl(pathWithoutLocale, newLocale);

    router.push(newUrl);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value as Locale)}
        className="appearance-none bg-transparent border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
      >
        {locales.map((localeOption) => (
          <option key={localeOption} value={localeOption}>
            {languageFlags[localeOption]} {languageNames[localeOption]}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

// Alternative button-style switcher
export function LanguageSwitcherButton({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    const pathWithoutLocale = removeLocalePrefix(pathname);
    const newUrl = createLocalizedUrl(pathWithoutLocale, newLocale);
    router.push(newUrl);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {locales.map((localeOption) => (
        <button
          key={localeOption}
          onClick={() => handleLanguageChange(localeOption)}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            locale === localeOption
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {languageFlags[localeOption]} {localeOption.toUpperCase()}
        </button>
      ))}
    </div>
  );
}