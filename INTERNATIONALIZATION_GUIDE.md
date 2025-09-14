# Internationalization (i18n) Implementation Guide

This guide explains how the internationalization system works in your RandevuBu application using `next-intl`.

## Overview

The application supports multiple languages with automatic locale detection, server-side rendering, and seamless error message translation. Currently configured for Turkish (default) and English.

## Architecture

### 1. **Configuration Files**

- `src/i18n.ts` - Main configuration for locales and message loading
- `src/messages/` - Translation files (JSON format)
  - `tr.json` - Turkish translations
  - `en.json` - English translations

### 2. **Route Structure**

```
app/[locale]/
├── (customer)/
├── (marketing)/
├── dashboard/
├── auth/
└── layout.tsx
```

URLs will be:
- Turkish (default): `/dashboard`, `/auth`, etc.
- English: `/en/dashboard`, `/en/auth`, etc.

### 3. **Middleware Integration**

The middleware handles:
- Automatic locale detection from browser preferences
- URL routing with locale prefixes
- Authentication state preservation across locales

## Usage Examples

### 1. **Using Translations in Components**

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useErrorTranslations, useCommonTranslations } from '@/src/lib/utils/translations';

function MyComponent() {
  const t = useTranslations();
  const errorT = useErrorTranslations();
  const commonT = useCommonTranslations();

  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <p>{errorT('auth.unauthorized')}</p>
      <button>{commonT('save')}</button>
    </div>
  );
}
```

### 2. **Error Handling with Translations**

```tsx
'use client';

import { useApiError } from '@/src/lib/hooks/useApiError';

function MyFormComponent() {
  const { handleError, handleSuccess } = useApiError();

  const handleSubmit = async () => {
    try {
      const result = await someApiCall();
      handleSuccess('Operation completed successfully');
    } catch (error) {
      // Automatically translates error and shows toast
      handleError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form content */}
    </form>
  );
}
```

### 3. **Language Switcher**

```tsx
import { LanguageSwitcher, LanguageSwitcherButton } from '@/src/components/features/LanguageSwitcher';

function Navbar() {
  return (
    <nav>
      {/* Dropdown style */}
      <LanguageSwitcher className="ml-4" />

      {/* Button style */}
      <LanguageSwitcherButton className="ml-4" />
    </nav>
  );
}
```

### 4. **Server-Side Translations**

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');

  return (
    <div>
      <h1>{t('loading')}</h1>
    </div>
  );
}
```

## Backend Integration

### 1. **Accept-Language Header**

The API client automatically sends the `Accept-Language` header based on the current locale:

```typescript
// Automatically added by the API client
headers: {
  'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8' // for Turkish
  'Accept-Language': 'en-US,en;q=0.9'          // for English
}
```

### 2. **Expected Backend Response**

Your backend should return translated messages based on the `Accept-Language` header:

```json
{
  "success": false,
  "message": "Oturum açmanız gerekiyor", // Pre-translated by backend
  "code": "auth.unauthorized",
  "statusCode": 401
}
```

If your backend returns error codes instead of translated messages, the frontend will handle translation using the `code` field.

## Adding New Translations

### 1. **Add to Translation Files**

In `src/messages/tr.json`:
```json
{
  "newFeature": {
    "title": "Yeni Özellik",
    "description": "Bu yeni bir özelliktir"
  }
}
```

In `src/messages/en.json`:
```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}
```

### 2. **Update Type Definitions**

Add to `src/lib/utils/translations.ts`:
```typescript
export type NewFeatureTranslationKey = \`newFeature.\${string}\`;
```

### 3. **Create Hook (Optional)**

```typescript
export function useNewFeatureTranslations() {
  return useTranslations('newFeature');
}
```

## Error Translation Flow

1. **API Request** → Includes `Accept-Language` header
2. **Backend Response** → Returns translated message OR error code
3. **Frontend Handling** →
   - If message exists: Use directly
   - If code exists: Translate using local translations
   - Fallback: Use generic error message
4. **Toast Display** → Show translated error to user

## Best Practices

### 1. **Consistent Error Codes**

Use dot notation for error codes:
```
auth.unauthorized
business.notFound
appointment.timeConflict
```

### 2. **Fallback Strategy**

Always provide fallbacks:
```typescript
// Specific → Category → System → Generic
errors.auth.unauthorized → errors.auth.general → errors.system.internalError → "An error occurred"
```

### 3. **Server-Side Safe**

All translation logic works on both client and server:
```tsx
// ✅ Works in both server and client components
const t = useTranslations('common');
const serverT = await getTranslations('common');
```

### 4. **Type Safety**

Use TypeScript for translation keys:
```typescript
type ErrorKey = 'auth.unauthorized' | 'business.notFound';
```

## Testing Translations

### 1. **Change Browser Language**

Set your browser to Turkish/English to test automatic detection.

### 2. **Manual URL Testing**

- Visit `/dashboard` (Turkish)
- Visit `/en/dashboard` (English)

### 3. **Error Testing**

Trigger API errors and verify:
- Toast messages appear in correct language
- Error codes are properly translated
- Fallbacks work for missing translations

## Performance Notes

- Translations are loaded once per locale and cached
- Server-side rendering ensures no hydration mismatches
- Only current locale translations are loaded (code splitting)
- Translation changes require app restart in development

## Common Issues

### 1. **Hydration Mismatches**

Use `suppressHydrationWarning` if needed:
```tsx
<html suppressHydrationWarning>
```

### 2. **Missing Translations**

Always provide English fallbacks for all translation keys.

### 3. **URL Redirects**

The middleware handles locale redirects automatically, but ensure your internal links use the correct format.

This internationalization system provides a professional, scalable solution that matches industry standards used by companies like Airbnb, Uber, and Netflix.