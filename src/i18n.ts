import { getRequestConfig } from 'next-intl/server';

export const locales = ['tr', 'en'] as const;
export const defaultLocale = 'tr' as const;

export type Locale = typeof locales[number];

export default getRequestConfig(async ({locale}) => {
  // Support locale from middleware or default to Turkish
  const resolvedLocale = locale || defaultLocale;

  if (!locales.includes(resolvedLocale as Locale)) {
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    };
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
});