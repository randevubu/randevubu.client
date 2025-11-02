# Trial Subscription Implementation Guide

## Overview

This guide explains how to use the newly implemented trial subscription system that follows the API specification from `SUBSCRIPTION_TRIAL_FLOW.md`.

## 🎯 Key Features Implemented

- **7-day free trial** for basic plans only
- **No trial** for premium plans (immediate payment required)
- **Credit card required upfront** (stored securely, not charged during trial)
- **Automatic conversion** to paid subscription after trial period
- **Industry-standard retry logic** (3 attempts over 3 days)
- **Proper cancellation handling** (access until period end)

## 📁 New Files Created

### 1. Types (`src/types/subscription.ts`)
- Updated `SubscriptionPlan` to include `trialDays` in features
- Updated `BusinessSubscription` with trial-specific fields
- Added `TrialSubscriptionRequest` and `TrialSubscriptionResponse` types
- Added `CancelSubscriptionRequest` and `CancelSubscriptionResponse` types

### 2. Service Layer (`src/lib/services/subscription.ts`)
- Added `createTrialSubscription()` method using new API endpoint
- Updated `cancelBusinessSubscription()` to use `cancelAtPeriodEnd` parameter
- Maintained backward compatibility with existing methods

### 3. Hooks (`src/lib/hooks/useTrialSubscription.ts`)
- `useTrialSubscription()` - Create trial subscriptions
- `useTrialNotifications()` - Trial countdown and notifications
- `usePlanTrialInfo()` - Check if plan has trial

### 4. UI Components
- `TrialCard` - Plan selection with trial badges
- `TrialPaymentForm` - Trial-specific payment form
- `TrialStatus` - Subscription status display
- `TrialNotifications` - Trial countdown notifications

### 5. Pages
- `src/app/(marketing)/subscription-trial/page.tsx` - New trial-enabled subscription page

## 🚀 How to Use

### 1. Basic Trial Subscription Flow

```typescript
import { useTrialSubscription } from '@/lib/hooks/useTrialSubscription';

function MyComponent() {
  const { createTrialSubscription, isLoading } = useTrialSubscription();

  const handleTrialStart = async () => {
    const trialData = {
      planId: 'plan_basic_tier1',
      card: {
        cardHolderName: 'John Doe',
        cardNumber: '5528790000000008',
        expireMonth: '12',
        expireYear: '2030',
        cvc: '123'
      },
      buyer: {
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        gsmNumber: '+905350000000',
        address: 'Test Address, Istanbul',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000'
      }
    };

    try {
      await createTrialSubscription(trialData);
      // Trial started successfully
    } catch (error) {
      // Handle error
    }
  };
}
```

### 2. Plan Selection with Trial Offers

```typescript
import TrialCard from '@/components/ui/TrialCard';
import { usePlanTrialInfo } from '@/lib/hooks/useTrialSubscription';

function PlanSelection({ plans }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map(plan => (
        <TrialCard
          key={plan.id}
          plan={plan}
          onSelect={handlePlanSelect}
          currentSubscription={currentSubscription}
        />
      ))}
    </div>
  );
}
```

### 3. Trial Status Display

```typescript
import TrialStatus from '@/components/ui/TrialStatus';

function SubscriptionDashboard({ subscription }) {
  return (
    <TrialStatus
      subscription={subscription}
      onCancel={handleCancel}
      onUpdatePayment={handleUpdatePayment}
    />
  );
}
```

### 4. Trial Notifications

```typescript
import TrialNotifications from '@/components/ui/TrialNotifications';

function Dashboard({ subscription }) {
  return (
    <>
      <TrialNotifications
        subscription={subscription}
        onUpdatePayment={handleUpdatePayment}
        onSubscribe={handleSubscribe}
      />
      {/* Rest of dashboard */}
    </>
  );
}
```

## 🔧 API Endpoints Used

### 1. Create Trial Subscription
```
POST /api/v1/subscriptions/business/{businessId}/subscribe
```

**Request Body:**
```typescript
{
  "planId": "plan_basic_tier1",
  "card": {
    "cardHolderName": "John Doe",
    "cardNumber": "5528790000000008",
    "expireMonth": "12",
    "expireYear": "2030",
    "cvc": "123"
  },
  "buyer": {
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "gsmNumber": "+905350000000",
    "address": "Test Address, Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "zipCode": "34000"
  }
}
```

### 2. Cancel Subscription
```
POST /api/v1/subscriptions/business/{businessId}/cancel
```

**Request Body:**
```typescript
{
  "cancelAtPeriodEnd": true
}
```

### 3. Get Subscription
```
GET /api/v1/subscriptions/business/{businessId}
```

## 🎨 UI Components Usage

### TrialCard Component
- Shows trial badges for basic plans
- Displays "7-day free trial" messaging
- Handles plan selection with trial awareness
- Shows current plan status

### TrialPaymentForm Component
- Two-step form (card info → billing info)
- Trial-specific messaging
- Card verification without charging
- Form validation

### TrialStatus Component
- Shows trial countdown
- Displays subscription status
- Handles cancellation
- Shows conversion notices

### TrialNotifications Component
- Floating notifications for trial countdown
- 3-day, 1-day, and expiration warnings
- Action buttons for payment updates
- Dismissible notifications

## 📱 Page Integration

### New Trial Subscription Page
Access the new trial-enabled subscription page at:
```
/subscription-trial
```

This page includes:
- Trial-aware plan selection
- Trial-specific payment flow
- Success/error handling
- Confetti animations

### Integration with Existing Pages
To add trial functionality to existing pages:

1. Import the hooks:
```typescript
import { useTrialSubscription, useTrialNotifications } from '@/lib/hooks/useTrialSubscription';
```

2. Use the components:
```typescript
import TrialCard from '@/components/ui/TrialCard';
import TrialStatus from '@/components/ui/TrialStatus';
```

3. Handle trial-specific logic:
```typescript
const { hasTrial, isBasicPlan, trialDays } = usePlanTrialInfo(plan);
```

## 🔄 Subscription Lifecycle

### Trial Flow
1. User selects basic plan with trial
2. Shows trial offer and terms
3. Collects card information (verification only)
4. Creates trial subscription
5. User gets full access for 7 days
6. Automatic conversion to paid after trial

### Cancellation Flow
1. User cancels subscription
2. Sets `cancelAtPeriodEnd: true`
3. User keeps access until period end
4. No further charges after period end

## 🚨 Error Handling

### Common Error Scenarios
- Invalid card information
- Plan not found
- Business already has subscription
- Payment method required for trial

### Error Response Format
```typescript
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## 🧪 Testing

### Test Cards (Iyzico Sandbox)
```typescript
// Successful payment test cards
const testCards = {
  visa: {
    number: '4766620000000001',
    expiry: '12/30',
    cvc: '123'
  },
  mastercard: {
    number: '5528790000000008', 
    expiry: '12/30',
    cvc: '123'
  }
};
```

### Testing Trial Flow
1. Use test cards for verification
2. Check trial countdown functionality
3. Test cancellation flow
4. Verify automatic conversion

## 📊 Status Codes

| Status | Description | User Action Required |
|--------|-------------|---------------------|
| `TRIAL` | Free trial active | None - full access |
| `ACTIVE` | Paid subscription active | None - full access |
| `CANCELED` | Subscription canceled | Subscribe to regain access |
| `EXPIRED` | Trial expired, payment failed | Update payment method and resubscribe |
| `PAST_DUE` | Payment failed, retrying | Update payment method |
| `UNPAID` | Payment required | Complete payment |

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Plan Configuration
Trial days are configured in the plan's `features.trialDays` field:
- Basic plans: 7 days
- Premium plans: 0 days (no trial)

## 📞 Support

For issues with the trial system:
1. Check browser console for errors
2. Verify API endpoint responses
3. Test with sandbox cards
4. Check subscription status in dashboard

## 🎯 Best Practices

### Frontend Implementation
1. Always show trial information for basic plans
2. Collect payment method upfront for trials
3. Display clear trial countdown
4. Handle all subscription statuses
5. Provide easy cancellation
6. Show payment method management

### Security
1. Never store full card numbers in frontend
2. Use HTTPS for all payment requests
3. Validate card information before submission
4. Handle payment failures gracefully
5. Store payment method tokens securely

---

*This implementation follows the exact API specification from the SUBSCRIPTION_TRIAL_FLOW.md documentation and provides a complete trial subscription system.*




