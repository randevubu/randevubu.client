# Secure Notifications - Frontend Implementation Guide

## 📋 Overview

This document provides a comprehensive guide on how to use the newly implemented secure notifications system in your Next.js application. The implementation follows industry best practices and provides a type-safe, robust solution for sending notifications to your customers.

## 🎯 What Has Been Implemented

### 1. TypeScript Types (`src/types/notification.ts`)

Complete type definitions for all notification API endpoints:

- **Request Types**: `SecureNotificationRequest`, `BroadcastNotificationRequest`, etc.
- **Response Types**: `SecureNotificationResponse`, `NotificationStatsResponse`, etc.
- **Enums**: `NotificationType`, `NotificationChannel`, `RateLimitStatus`, etc.

### 2. Service Layer (`src/lib/services/secureNotifications.ts`)

Enterprise-grade service with:
- Input validation before API calls
- Comprehensive error handling
- Type safety
- Consistent API interface
- Detailed logging

### 3. React Hooks

#### `useSecureNotifications` (`src/lib/hooks/useSecureNotifications.ts`)
Hook for sending notifications with:
- Multiple mutation methods (send, broadcast, closure, test)
- Loading states
- Automatic toast notifications
- Error handling
- Success callbacks

#### `useNotificationStats` (`src/lib/hooks/useNotificationStats.ts`)
Hook for monitoring notifications with:
- Real-time statistics
- Rate limit monitoring
- Security alerts
- Auto-refetching
- Computed helpers

### 4. Example Component

**`SecureNotificationSender`** (`src/components/features/SecureNotificationSender.tsx`)
- Complete UI for sending notifications
- Form validation
- Rate limit warnings
- Multiple channel support
- Recipient filtering
- Statistics display

---

## 🚀 Quick Start

### Basic Usage - Sending a Broadcast Notification

```tsx
'use client';

import { useSecureNotifications } from '@/src/lib/hooks/useSecureNotifications';

export function MyNotificationComponent() {
  const { sendBroadcast, isLoading } = useSecureNotifications();

  const handleSendHolidayMessage = async () => {
    try {
      await sendBroadcast.mutateAsync({
        businessId: 'your-business-id',
        title: 'Holiday Closure Notice',
        body: 'We will be closed from Dec 24-26. Happy holidays!',
        notificationType: 'HOLIDAY',
        channels: ['PUSH', 'SMS'],
        filters: {
          relationshipType: 'ACTIVE_CUSTOMER',
          minAppointments: 1,
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <button
      onClick={handleSendHolidayMessage}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      {isLoading ? 'Sending...' : 'Send Holiday Message'}
    </button>
  );
}
```

### Monitoring Notification Statistics

```tsx
'use client';

import { useNotificationStats } from '@/src/lib/hooks/useNotificationStats';

export function NotificationDashboard({ businessId }: { businessId: string }) {
  const {
    stats,
    isLoading,
    isRateLimitHealthy,
    isRateLimitWarning,
    isRateLimitBlocked,
    successRate,
  } = useNotificationStats({ businessId });

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div>
      <h2>Notification Statistics</h2>

      {/* Rate Limit Status */}
      <div className={`alert ${isRateLimitBlocked ? 'alert-error' : isRateLimitWarning ? 'alert-warning' : 'alert-success'}`}>
        {isRateLimitBlocked && 'Rate limit exceeded!'}
        {isRateLimitWarning && 'Approaching rate limit'}
        {isRateLimitHealthy && 'All systems healthy'}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p>Total Sent</p>
          <h3>{stats?.totalSent}</h3>
        </div>
        <div>
          <p>Success Rate</p>
          <h3>{successRate.toFixed(1)}%</h3>
        </div>
        <div>
          <p>Active Customers</p>
          <h3>{stats?.customerStats.activeCustomers}</h3>
        </div>
      </div>
    </div>
  );
}
```

---

## 📚 Detailed API Reference

### useSecureNotifications Hook

```tsx
const {
  sendNotification,    // Send to specific recipients
  sendBroadcast,       // Send to all customers (with filters)
  sendClosureNotification,  // Send closure notification
  sendTestNotification,     // Send test notification
  isLoading,           // Combined loading state
} = useSecureNotifications(options);
```

#### Options

```typescript
interface NotificationMutationOptions {
  onSuccess?: (response: any) => void;  // Custom success handler
  onError?: (error: Error) => void;     // Custom error handler
  showToast?: boolean;                  // Auto-show toast (default: true)
}
```

#### Examples

**1. Send to Specific Recipients**

```tsx
await sendNotification.mutateAsync({
  businessId: 'business-123',
  recipientIds: ['customer-1', 'customer-2'],
  title: 'Special Offer',
  body: '50% off your next appointment!',
  notificationType: 'PROMOTION',
  channels: ['PUSH', 'EMAIL'],
  data: {
    offerCode: 'SPECIAL50',
    expiresAt: '2024-12-31',
  },
});
```

**2. Send Broadcast with Filters**

```tsx
await sendBroadcast.mutateAsync({
  businessId: 'business-123',
  title: 'New Service Available',
  body: 'We now offer premium spa treatments!',
  notificationType: 'BROADCAST',
  channels: ['PUSH'],
  filters: {
    relationshipType: 'ACTIVE_CUSTOMER',
    minAppointments: 3,
    lastAppointmentAfter: '2024-01-01',
  },
});
```

**3. Send Closure Notification**

```tsx
await sendClosureNotification.mutateAsync({
  businessId: 'business-123',
  closureId: 'closure-456',
  data: {
    message: 'We are closed today due to maintenance.',
    channels: ['PUSH', 'SMS'],
  },
});
```

**4. Send Test Notification**

```tsx
await sendTestNotification.mutateAsync({
  businessId: 'business-123',
  title: 'Test Notification',
  body: 'This is a test!',
  channels: ['PUSH'],
});
```

### useNotificationStats Hook

```tsx
const {
  stats,               // Full statistics object
  isLoading,           // Loading state
  isFetching,          // Fetching state
  isRefetching,        // Refetching state
  isError,             // Error state
  error,               // Error object
  refetch,             // Manual refetch function

  // Helper properties
  isRateLimitHealthy,
  isRateLimitWarning,
  isRateLimitCritical,
  isRateLimitBlocked,
  successRate,
  failureRate,
} = useNotificationStats({
  businessId: 'business-123',
  startDate: '2024-01-01',  // Optional
  endDate: '2024-12-31',    // Optional
  enabled: true,             // Optional (default: true)
  refetchInterval: 30000,    // Optional (default: 30s)
});
```

### useSecurityAlerts Hook

```tsx
import { useSecurityAlerts } from '@/src/lib/hooks/useNotificationStats';

const {
  alerts,              // Array of security alerts
  totalAlerts,         // Total alert count
  period,              // Time period
  hasCriticalAlerts,   // Boolean helper
  hasHighAlerts,       // Boolean helper
  criticalAlertsCount,
  highAlertsCount,
} = useSecurityAlerts({
  businessId: 'business-123',
  hours: 24,  // Look back period (1-168)
});
```

### Combined Monitoring Hook

```tsx
import { useNotificationMonitoring } from '@/src/lib/hooks/useNotificationStats';

const {
  stats,      // Statistics hook
  alerts,     // Alerts hook
  isLoading,  // Combined loading
  hasIssues,  // true if critical issues exist
} = useNotificationMonitoring('business-123');
```

---

## 🎨 Component Examples

### 1. Simple Notification Button

```tsx
'use client';

import { useSecureNotifications } from '@/src/lib/hooks/useSecureNotifications';

export function SendPromotionButton({ businessId }: { businessId: string }) {
  const { sendBroadcast, isLoading } = useSecureNotifications();

  const handleClick = async () => {
    await sendBroadcast.mutateAsync({
      businessId,
      title: 'Flash Sale! 🎉',
      body: '30% off all services this weekend only!',
      notificationType: 'PROMOTION',
      channels: ['PUSH'],
      filters: {
        relationshipType: 'ACTIVE_CUSTOMER',
      },
    });
  };

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Sending...' : 'Send Promotion'}
    </button>
  );
}
```

### 2. Notification Form with Validation

```tsx
'use client';

import { useState } from 'react';
import { useSecureNotifications } from '@/src/lib/hooks/useSecureNotifications';
import { secureNotificationService } from '@/src/lib/services/secureNotifications';

export function NotificationForm({ businessId }: { businessId: string }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const { sendBroadcast, isLoading } = useSecureNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before sending
    const validation = secureNotificationService.validateNotification({
      businessId,
      title,
      body,
      channels: ['PUSH'],
    });

    if (!validation.isValid) {
      setErrors(Object.values(validation.errors).flat());
      return;
    }

    setErrors([]);

    await sendBroadcast.mutateAsync({
      businessId,
      title,
      body,
      notificationType: 'BROADCAST',
      channels: ['PUSH'],
    });

    // Reset form
    setTitle('');
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (max 100 chars)"
        maxLength={100}
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message (max 500 chars)"
        maxLength={500}
      />

      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

### 3. Rate Limit Indicator

```tsx
'use client';

import { useNotificationStats } from '@/src/lib/hooks/useNotificationStats';

export function RateLimitIndicator({ businessId }: { businessId: string }) {
  const { stats, isRateLimitHealthy, isRateLimitWarning, isRateLimitCritical, isRateLimitBlocked } =
    useNotificationStats({ businessId });

  if (!stats) return null;

  const { current, limits } = stats.rateLimitStatus;

  return (
    <div className={`rate-limit-indicator ${
      isRateLimitBlocked ? 'blocked' :
      isRateLimitCritical ? 'critical' :
      isRateLimitWarning ? 'warning' : 'healthy'
    }`}>
      <h4>Rate Limit Status</h4>

      <div>
        <p>Hourly: {current.hourly} / {limits.maxNotificationsPerHour}</p>
        <progress value={current.hourly} max={limits.maxNotificationsPerHour} />
      </div>

      <div>
        <p>Daily: {current.daily} / {limits.maxNotificationsPerDay}</p>
        <progress value={current.daily} max={limits.maxNotificationsPerDay} />
      </div>

      <div>
        <p>Weekly: {current.weekly} / {limits.maxNotificationsPerWeek}</p>
        <progress value={current.weekly} max={limits.maxNotificationsPerWeek} />
      </div>

      {stats.rateLimitStatus.recommendations.length > 0 && (
        <div>
          <h5>Recommendations:</h5>
          <ul>
            {stats.rateLimitStatus.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ Best Practices

### 1. Always Validate Input

```tsx
// ✅ Good - Validate before sending
const validation = secureNotificationService.validateNotification(data);
if (!validation.isValid) {
  // Show errors to user
  return;
}

// ❌ Bad - Send without validation
await sendBroadcast.mutateAsync(data);
```

### 2. Handle Errors Properly

```tsx
// ✅ Good - Custom error handling
const { sendBroadcast } = useSecureNotifications({
  onError: (error) => {
    // Log to monitoring service
    logErrorToMonitoring(error);

    // Show user-friendly message
    if (error.message.includes('Rate limit')) {
      showCustomRateLimitModal();
    }
  },
});

// ❌ Bad - Ignore errors
await sendBroadcast.mutateAsync(data);
```

### 3. Monitor Rate Limits

```tsx
// ✅ Good - Check rate limits before sending
const { isRateLimitBlocked } = useNotificationStats({ businessId });

if (isRateLimitBlocked) {
  alert('Rate limit exceeded. Please try again later.');
  return;
}

await sendBroadcast.mutateAsync(data);
```

### 4. Provide User Feedback

```tsx
// ✅ Good - Show loading and success states
const { sendBroadcast, isLoading } = useSecureNotifications({
  onSuccess: (response) => {
    const { sentCount, failedCount } = response.data;
    showSuccessMessage(`Sent to ${sentCount} customers`);

    if (failedCount > 0) {
      showWarning(`${failedCount} notifications failed`);
    }
  },
});

// ❌ Bad - No feedback
await sendBroadcast.mutateAsync(data);
```

### 5. Use Filters Wisely

```tsx
// ✅ Good - Target specific customers
await sendBroadcast.mutateAsync({
  businessId,
  title: 'VIP Offer',
  body: 'Exclusive offer for our best customers!',
  notificationType: 'PROMOTION',
  channels: ['PUSH', 'EMAIL'],
  filters: {
    relationshipType: 'ACTIVE_CUSTOMER',
    minAppointments: 10,  // Only customers with 10+ appointments
    lastAppointmentAfter: '2024-01-01',  // Active this year
  },
});

// ❌ Bad - Send to everyone unnecessarily
await sendBroadcast.mutateAsync({
  businessId,
  title: 'VIP Offer',
  body: 'Exclusive offer!',
  notificationType: 'PROMOTION',
  channels: ['PUSH', 'SMS'],  // SMS costs money!
  filters: {
    relationshipType: 'ALL',  // Everyone gets it
  },
});
```

---

## 🔧 Integration Guide

### Step 1: Add to Existing Page

```tsx
// app/dashboard/notifications/page.tsx
'use client';

import { SecureNotificationSender } from '@/src/components/features/SecureNotificationSender';
import { useAuth } from '@/src/context/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();

  if (!user?.businessId) {
    return <div>Please set up your business first.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Send Notifications</h1>
      <SecureNotificationSender businessId={user.businessId} />
    </div>
  );
}
```

### Step 2: Add to Navigation

```tsx
// components/layout/DashboardNavigation.tsx
const navigationItems = [
  // ... existing items
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: BellIcon,
  },
];
```

### Step 3: Add Monitoring Widget

```tsx
// components/dashboard/NotificationWidget.tsx
'use client';

import { useNotificationStats } from '@/src/lib/hooks/useNotificationStats';

export function NotificationWidget({ businessId }: { businessId: string }) {
  const { stats, isRateLimitWarning, isRateLimitCritical } =
    useNotificationStats({ businessId });

  return (
    <div className="widget">
      <h3>Notifications Today</h3>
      <p className="stat">{stats?.rateLimitStatus.current.daily ?? 0}</p>

      {(isRateLimitWarning || isRateLimitCritical) && (
        <div className="warning">
          ⚠️ Approaching rate limit
        </div>
      )}
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Issue: "Rate limit exceeded" error

**Solution:**
```tsx
// Check rate limit status before sending
const { stats, isRateLimitBlocked } = useNotificationStats({ businessId });

if (isRateLimitBlocked) {
  const resetTime = stats?.rateLimitStatus.current.lastNotification;
  alert(`Rate limit exceeded. Please try again after ${resetTime}`);
  return;
}
```

### Issue: Validation errors

**Solution:**
```tsx
// Use the validation helper
const validation = secureNotificationService.validateNotification({
  businessId,
  title: 'My Title',
  body: 'My Message',
  channels: ['PUSH'],
});

if (!validation.isValid) {
  console.log('Errors:', validation.errors);
  // Fix errors before sending
}
```

### Issue: No toast notifications showing

**Solution:**
```tsx
// Make sure you have toast provider in your app
// app/layout.tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

## 📖 Additional Resources

- **API Guide**: `/FRONTEND_SECURE_NOTIFICATIONS_API_GUIDE.md`
- **Types Reference**: `/src/types/notification.ts`
- **Service Layer**: `/src/lib/services/secureNotifications.ts`
- **Hooks**:
  - `/src/lib/hooks/useSecureNotifications.ts`
  - `/src/lib/hooks/useNotificationStats.ts`

---

## ✅ Summary

You now have a complete, production-ready secure notifications system with:

- ✅ Type-safe API integration
- ✅ Input validation
- ✅ Error handling
- ✅ Rate limit monitoring
- ✅ Real-time statistics
- ✅ Security alerts
- ✅ Toast notifications
- ✅ Loading states
- ✅ Example components

All following industry best practices and ready to use! 🚀
