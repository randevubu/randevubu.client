# Cancellation Policies - Usage Examples

This guide shows how to use the cancellation policies features in your frontend components.

---

## 1. Display Customer Policy Status

### In Customer Detail Page

```typescript
import { CustomerPolicyStatus } from '@/components/ui';

const CustomerDetailPage = ({ customerId }) => {
  return (
    <div className="space-y-6">
      <h1>Customer Details</h1>

      {/* Show customer policy status */}
      <CustomerPolicyStatus
        customerId={customerId}
        showRefreshButton={true}
      />

      {/* Rest of customer details */}
    </div>
  );
};
```

### In Customer List (Compact View)

```typescript
import { CustomerPolicyStatus } from '@/components/ui';

const CustomerListItem = ({ customer }) => {
  return (
    <tr>
      <td>{customer.name}</td>
      <td>{customer.email}</td>
      <td>
        {/* Compact status indicator */}
        <CustomerPolicyStatus
          customerId={customer.id}
          compact={true}
        />
      </td>
    </tr>
  );
};
```

---

## 2. Check Booking Eligibility

### Before Showing Booking Form

```typescript
import { useState, useEffect } from 'react';
import { checkBookingEligibility, getPolicyErrorMessage } from '@/lib/utils/policyValidation';

const BookingPage = ({ customerId }) => {
  const [eligibility, setEligibility] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkEligibility = async () => {
      setIsChecking(true);
      const result = await checkBookingEligibility(customerId);
      setEligibility(result);
      setIsChecking(false);
    };

    checkEligibility();
  }, [customerId]);

  if (isChecking) {
    return <div>Müşteri durumu kontrol ediliyor...</div>;
  }

  if (!eligibility?.eligible) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-800">Randevu Alınamaz</h3>
        <p className="text-red-600">{eligibility?.reason}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Show booking form */}
      <BookingForm customerId={customerId} />
    </div>
  );
};
```

### With Loading State and Retry

```typescript
import { useState } from 'react';
import { checkBookingEligibility } from '@/lib/utils/policyValidation';

const BookingFormWrapper = ({ customerId }) => {
  const [eligibility, setEligibility] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkEligibility = async () => {
    setIsChecking(true);
    try {
      const result = await checkBookingEligibility(customerId);
      setEligibility(result);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkEligibility();
  }, [customerId]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  if (!eligibility?.eligible) {
    return (
      <div className="error-container">
        <p>{eligibility?.reason}</p>
        <button onClick={checkEligibility}>Tekrar Kontrol Et</button>
      </div>
    );
  }

  return <BookingForm customerId={customerId} />;
};
```

---

## 3. Check Cancellation Eligibility

### Before Allowing Cancellation

```typescript
import { checkCancellationEligibility } from '@/lib/utils/policyValidation';
import { useCancellationPolicies } from '@/lib/hooks/useCancellationPolicies';

const AppointmentActions = ({ appointment }) => {
  const { policies } = useCancellationPolicies();
  const [canCancel, setCanCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (policies) {
      const eligibility = checkCancellationEligibility(
        appointment.startTime,
        policies.minCancellationHours
      );
      setCanCancel(eligibility.eligible);
      setCancelReason(eligibility.reason || '');
    }
  }, [appointment, policies]);

  const handleCancel = async () => {
    if (!canCancel) {
      alert(cancelReason);
      return;
    }

    // Proceed with cancellation
    await cancelAppointment(appointment.id);
  };

  return (
    <div>
      <button
        onClick={handleCancel}
        disabled={!canCancel}
        className={canCancel ? 'btn-danger' : 'btn-disabled'}
      >
        {canCancel ? 'İptal Et' : 'İptal Edilemez'}
      </button>
      {!canCancel && (
        <p className="text-sm text-gray-600 mt-1">{cancelReason}</p>
      )}
    </div>
  );
};
```

---

## 4. Real-time Policy Status Monitoring

### Using the usePolicyStatus Hook

```typescript
import { usePolicyStatus } from '@/lib/hooks/usePolicyStatus';

const CustomerDashboard = ({ customerId }) => {
  const { status, isLoading, error, statusIndicator, isAtRisk, refetch } = usePolicyStatus(customerId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div>
      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <span>{statusIndicator.icon}</span>
        <span className={`text-${statusIndicator.color}-600`}>
          {statusIndicator.text}
        </span>
      </div>

      {/* Show warning if at risk */}
      {isAtRisk && (
        <div className="warning-banner mt-4">
          <p>⚠️ Bu müşteri limit eşiklerine yaklaşıyor!</p>
        </div>
      )}

      {/* Monthly Stats */}
      {status && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Bu Ay İptal</label>
            <p>
              {status.currentCancellations} / {status.policySettings.maxMonthlyCancellations}
            </p>
          </div>
          <div>
            <label>Bu Ay Gelmeme</label>
            <p>
              {status.currentNoShows} / {status.policySettings.maxMonthlyNoShows}
            </p>
          </div>
        </div>
      )}

      <button onClick={refetch} className="mt-4">
        Durumu Yenile
      </button>
    </div>
  );
};
```

### Auto-refresh Every 5 Minutes

```typescript
import { usePolicyStatus } from '@/lib/hooks/usePolicyStatus';

const LiveCustomerStatus = ({ customerId }) => {
  // Auto-refresh every 5 minutes (default)
  const { status, statusIndicator } = usePolicyStatus(customerId);

  return (
    <div className="status-badge">
      {statusIndicator.icon} {statusIndicator.text}
    </div>
  );
};
```

### Custom Refresh Interval

```typescript
import { usePolicyStatus } from '@/lib/hooks/usePolicyStatus';

const HighPriorityCustomerStatus = ({ customerId }) => {
  // Refresh every 1 minute for VIP customers
  const { status, statusIndicator } = usePolicyStatus(customerId, {
    refetchInterval: 60 * 1000 // 1 minute
  });

  return (
    <div className="vip-status">
      {statusIndicator.icon} {statusIndicator.text}
    </div>
  );
};
```

---

## 5. Settings Page Integration

### Managing Cancellation Policies

```typescript
import { CancellationPolicySettings } from '@/components/ui';

const SettingsPage = () => {
  const handleSettingsUpdated = () => {
    // Optionally refresh other data or show notification
    console.log('Cancellation policies updated successfully');
  };

  return (
    <div className="settings-container">
      <h1>Business Settings</h1>

      {/* Other settings sections */}

      {/* Cancellation Policies Section */}
      <CancellationPolicySettings onSettingsUpdated={handleSettingsUpdated} />

      {/* More settings sections */}
    </div>
  );
};
```

---

## 6. Error Handling

### Using Policy Error Messages

```typescript
import { getPolicyErrorMessage } from '@/lib/utils/policyValidation';

const AppointmentForm = () => {
  const handleSubmit = async (formData) => {
    try {
      await createAppointment(formData);
      showSuccess('Randevu başarıyla oluşturuldu');
    } catch (error) {
      const userFriendlyMessage = getPolicyErrorMessage(error);
      showError(userFriendlyMessage);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
};
```

---

## 7. Complete Booking Flow Example

### Full Implementation with All Checks

```typescript
import { useState, useEffect } from 'react';
import { checkBookingEligibility, getPolicyErrorMessage } from '@/lib/utils/policyValidation';
import { CustomerPolicyStatus } from '@/components/ui';

const CompleteBookingFlow = ({ customerId }) => {
  const [step, setStep] = useState<'checking' | 'blocked' | 'form' | 'submitting'>('checking');
  const [eligibility, setEligibility] = useState(null);
  const [error, setError] = useState('');

  // Step 1: Check eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      setStep('checking');
      try {
        const result = await checkBookingEligibility(customerId);
        setEligibility(result);

        if (result.eligible) {
          setStep('form');
        } else {
          setStep('blocked');
        }
      } catch (error) {
        setError(getPolicyErrorMessage(error));
        setStep('blocked');
      }
    };

    checkEligibility();
  }, [customerId]);

  // Step 2: Handle booking submission
  const handleBooking = async (bookingData) => {
    setStep('submitting');
    try {
      await createAppointment(bookingData);
      showSuccess('Randevu başarıyla oluşturuldu');
      // Redirect or close modal
    } catch (error) {
      setError(getPolicyErrorMessage(error));
      setStep('form');
    }
  };

  // Render based on step
  if (step === 'checking') {
    return (
      <div className="text-center p-8">
        <LoadingSpinner />
        <p>Müşteri durumu kontrol ediliyor...</p>
      </div>
    );
  }

  if (step === 'blocked') {
    return (
      <div className="p-6 space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800">Randevu Alınamaz</h3>
          <p className="text-red-600">{eligibility?.reason || error}</p>
        </div>

        {/* Show customer policy status */}
        <CustomerPolicyStatus customerId={customerId} />

        <button onClick={() => window.history.back()}>
          Geri Dön
        </button>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="text-center p-8">
        <LoadingSpinner />
        <p>Randevu oluşturuluyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show policy status at top */}
      <CustomerPolicyStatus customerId={customerId} compact />

      {/* Booking form */}
      <BookingForm
        customerId={customerId}
        onSubmit={handleBooking}
        disabled={step === 'submitting'}
      />
    </div>
  );
};
```

---

## 8. Integration with Existing Components

### Add to Appointment List

```typescript
import { usePolicyStatus } from '@/lib/hooks/usePolicyStatus';

const AppointmentRow = ({ appointment }) => {
  const { statusIndicator } = usePolicyStatus(appointment.customerId);

  return (
    <tr>
      <td>{appointment.customerName}</td>
      <td>{appointment.date}</td>
      <td>
        <span className="inline-flex items-center space-x-1">
          <span>{statusIndicator.icon}</span>
          <span className={`text-${statusIndicator.color}-600 text-xs`}>
            {statusIndicator.text}
          </span>
        </span>
      </td>
      <td>
        <AppointmentActions appointment={appointment} />
      </td>
    </tr>
  );
};
```

---

## Summary

The cancellation policies system provides:

1. **CancellationPolicySettings** - Component for managing policy settings
2. **CustomerPolicyStatus** - Component for displaying customer policy status
3. **usePolicyStatus** - Hook for real-time policy status monitoring
4. **useCancellationPolicies** - Hook for managing policy settings
5. **Policy Validation Utils** - Helper functions for checking eligibility

All components are fully typed, follow your existing code patterns, and integrate seamlessly with TanStack Query for state management.
