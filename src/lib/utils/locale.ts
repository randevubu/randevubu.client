import { locales, defaultLocale, type Locale } from '@/src/i18n';

// Get browser's preferred locale or fallback to default
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  const browserLanguage = navigator.language.split('-')[0];

  if (locales.includes(browserLanguage as Locale)) {
    return browserLanguage as Locale;
  }

  return defaultLocale;
}

// Get current locale from URL or cookies
export function getCurrentLocale(pathname: string): Locale {
  // Extract locale from pathname
  const segments = pathname.split('/');
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as Locale)) {
    return potentialLocale as Locale;
  }

  return defaultLocale;
}

// Create localized URL
export function createLocalizedUrl(path: string, locale: Locale): string {
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If it's the default locale, don't add prefix
  if (locale === defaultLocale) {
    return `/${cleanPath}`;
  }

  return `/${locale}/${cleanPath}`;
}

// Remove locale prefix from path
export function removeLocalePrefix(path: string): string {
  const segments = path.split('/');
  const potentialLocale = segments[1];

  if (locales.includes(potentialLocale as Locale)) {
    return '/' + segments.slice(2).join('/');
  }

  return path;
}

// Get Accept-Language header value for API requests
export function getAcceptLanguageHeader(locale: Locale): string {
  return locale === 'tr' ? 'tr-TR,tr;q=0.9,en;q=0.8' : 'en-US,en;q=0.9';
}

// Validate locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}