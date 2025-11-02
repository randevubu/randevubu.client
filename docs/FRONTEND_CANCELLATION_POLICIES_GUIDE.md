# Frontend Implementation Guide: Cancellation & No-Show Policies

## Overview

This guide covers what the frontend needs to implement to work with the cancellation and no-show policies system. The backend handles all policy logic and enforcement - the frontend's job is to display settings, show status, and handle user interactions.

---

## 1. Settings Page Implementation

### UI Components Needed

#### Policy Configuration Form
Create a settings section with these form fields:

```typescript
interface CancellationPolicyForm {
  minCancellationHours: number;        // 1-168 (dropdown: 1, 2, 4, 6, 12, 24, 48, 72, 168)
  maxMonthlyCancellations: number;     // 0-50 (dropdown: 0, 1, 2, 3, 5, 10, 20, 50)
  maxMonthlyNoShows: number;          // 0-20 (dropdown: 0, 1, 2, 3, 5, 10, 20)
  enablePolicyEnforcement: boolean;    // Toggle switch
  policyWarningMessage: string;        // Text area (max 500 chars)
  gracePeriodDays: number;            // 0-30 (dropdown: 0, 1, 3, 7, 14, 30)
  autoBanEnabled: boolean;            // Toggle switch
  banDurationDays: number;            // 1-365 (dropdown: 1, 7, 30, 90, 365) - only show if autoBanEnabled is true
}
```

#### Form Layout
```
┌─────────────────────────────────────────────────────────┐
│ İptal ve Gelmeme Politikaları                          │
├─────────────────────────────────────────────────────────┤
│ ⚠️  Önemli Uyarı                                       │
│ Bu kuralları aşan müşteriler sistemden otomatik        │
│ olarak engellenecek ve bir daha işletmenizden          │
│ randevu alamayacaktır...                               │
├─────────────────────────────────────────────────────────┤
│ Randevu İptali İçin Minimum Süre: [4 saat önce ▼]     │
│ Maksimum İptal Sayısı (Aylık): [3 iptal ▼]            │
│ Maksimum Gelmeme Sayısı (Aylık): [2 gelmeme ▼]        │
│                                                         │
│ [✓] Politika uygulamasını etkinleştir                  │
│ [✓] Otomatik engelleme etkinleştir                     │
│ Engelleme süresi: [30 gün ▼]                           │
│                                                         │
│ [Kaydet] [İptal]                                       │
└─────────────────────────────────────────────────────────┘
```

### API Integration

#### Load Current Policies
```typescript
const loadPolicies = async () => {
  try {
    const response = await fetch('/api/v1/businesses/my-business/cancellation-policies', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      setFormData(data.data);
    }
  } catch (error) {
    showError('Politika ayarları yüklenemedi');
  }
};
```

#### Save Policies
```typescript
const savePolicies = async (formData) => {
  try {
    const response = await fetch('/api/v1/businesses/my-business/cancellation-policies', {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Politika ayarları güncellendi');
    } else {
      showError(data.error);
    }
  } catch (error) {
    showError('Politika ayarları kaydedilemedi');
  }
};
```

---

## 2. Customer Management Integration

### Customer List View
Add policy status indicators to customer lists:

```typescript
interface CustomerWithPolicyStatus {
  id: string;
  name: string;
  email: string;
  phone: string;
  policyStatus: {
    currentCancellations: number;
    currentNoShows: number;
    isBanned: boolean;
    gracePeriodActive: boolean;
  };
}
```

#### Status Indicators
```typescript
const getStatusIndicator = (customer) => {
  if (customer.policyStatus.isBanned) {
    return { color: 'red', icon: '🚫', text: 'Engellenmiş' };
  }
  
  if (customer.policyStatus.gracePeriodActive) {
    return { color: 'blue', icon: '🆕', text: 'Yeni müşteri' };
  }
  
  const totalViolations = customer.policyStatus.currentCancellations + customer.policyStatus.currentNoShows;
  
  if (totalViolations >= 4) {
    return { color: 'red', icon: '⚠️', text: 'Riskli' };
  } else if (totalViolations >= 2) {
    return { color: 'yellow', icon: '⚡', text: 'Dikkat' };
  } else {
    return { color: 'green', icon: '✅', text: 'Normal' };
  }
};
```

### Customer Detail View
Show detailed policy status:

```typescript
const CustomerPolicyStatus = ({ customerId }) => {
  const [policyStatus, setPolicyStatus] = useState(null);
  
  useEffect(() => {
    fetchCustomerPolicyStatus(customerId);
  }, [customerId]);
  
  const fetchCustomerPolicyStatus = async (customerId) => {
    try {
      const response = await fetch(`/api/v1/businesses/my-business/customer-policy-status/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setPolicyStatus(data.data);
      }
    } catch (error) {
      showError('Müşteri durumu yüklenemedi');
    }
  };
  
  if (!policyStatus) return <Loading />;
  
  return (
    <div className="policy-status">
      <h3>Politika Durumu</h3>
      <div className="status-grid">
        <div className="status-item">
          <span>Bu Ay İptal:</span>
          <span className={policyStatus.currentCancellations >= 3 ? 'warning' : 'normal'}>
            {policyStatus.currentCancellations} / {policyStatus.policySettings.maxMonthlyCancellations}
          </span>
        </div>
        <div className="status-item">
          <span>Bu Ay Gelmeme:</span>
          <span className={policyStatus.currentNoShows >= 2 ? 'warning' : 'normal'}>
            {policyStatus.currentNoShows} / {policyStatus.policySettings.maxMonthlyNoShows}
          </span>
        </div>
        {policyStatus.isBanned && (
          <div className="status-item banned">
            <span>Durum:</span>
            <span>Engellenmiş - {policyStatus.banReason}</span>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 3. Appointment Booking Integration

### Pre-Booking Validation
Check customer eligibility before showing booking form:

```typescript
const checkBookingEligibility = async (customerId) => {
  try {
    const response = await fetch(`/api/v1/businesses/my-business/customer-policy-status/${customerId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      const status = data.data;
      
      // Check if customer is banned
      if (status.isBanned) {
        showError('Bu müşteri sistemden engellenmiştir');
        return false;
      }
      
      // Check no-show limit
      if (status.currentNoShows >= status.policySettings.maxMonthlyNoShows) {
        showError('Müşteri aylık maksimum gelmeme sayısına ulaştı');
        return false;
      }
      
      return true;
    }
  } catch (error) {
    showError('Müşteri durumu kontrol edilemedi');
    return false;
  }
};
```

### Booking Form Component
```typescript
const BookingForm = ({ customerId, onBookingAttempt }) => {
  const [isEligible, setIsEligible] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    checkEligibility();
  }, [customerId]);
  
  const checkEligibility = async () => {
    setIsLoading(true);
    const eligible = await checkBookingEligibility(customerId);
    setIsEligible(eligible);
    setIsLoading(false);
  };
  
  if (isLoading) return <Loading />;
  
  if (!isEligible) {
    return (
      <div className="booking-blocked">
        <h3>Randevu Alınamaz</h3>
        <p>Bu müşteri için şu anda randevu alınamaz.</p>
        <button onClick={checkEligibility}>Tekrar Kontrol Et</button>
      </div>
    );
  }
  
  return <BookingFormFields onBookingAttempt={onBookingAttempt} />;
};
```

---

## 4. Appointment Cancellation Integration

### Pre-Cancellation Validation
Check if cancellation is allowed:

```typescript
const checkCancellationEligibility = async (appointmentId) => {
  try {
    // Get appointment details
    const appointment = await getAppointment(appointmentId);
    
    // Calculate hours until appointment
    const hoursUntil = calculateHoursUntil(appointment.startTime);
    
    // Get business policies
    const policies = await getBusinessPolicies();
    
    if (hoursUntil < policies.minCancellationHours) {
      showError(`Randevu iptali için en az ${policies.minCancellationHours} saat önceden iptal etmeniz gerekmektedir`);
      return false;
    }
    
    return true;
  } catch (error) {
    showError('İptal kontrolü yapılamadı');
    return false;
  }
};
```

### Cancellation Button
```typescript
const CancellationButton = ({ appointmentId, onCancel }) => {
  const [canCancel, setCanCancel] = useState(null);
  
  useEffect(() => {
    checkCancellationEligibility(appointmentId).then(setCanCancel);
  }, [appointmentId]);
  
  if (canCancel === null) return <Loading />;
  
  if (!canCancel) {
    return (
      <button disabled className="cancel-disabled">
        İptal Edilemez
      </button>
    );
  }
  
  return (
    <button onClick={onCancel} className="cancel-enabled">
      İptal Et
    </button>
  );
};
```

---

## 5. Error Handling

### Common Error Messages
```typescript
const getErrorMessage = (error) => {
  const errorMessages = {
    'Cannot book appointment: Aylık maksimum iptal sayısına ulaştınız': 
      'Müşteri aylık iptal limitine ulaştı',
    'Cannot book appointment: Aylık maksimum gelmeme sayısına ulaştınız': 
      'Müşteri aylık gelmeme limitine ulaştı',
    'Cannot cancel appointment: Randevu iptali için en az X saat önceden iptal etmeniz gerekmektedir': 
      'Randevu iptali için yeterli süre kalmamış',
    'Customer is banned': 
      'Bu müşteri sistemden engellenmiştir'
  };
  
  for (const [key, message] of Object.entries(errorMessages)) {
    if (error.includes(key)) return message;
  }
  
  return 'Bir hata oluştu';
};
```

### Error Display Component
```typescript
const ErrorDisplay = ({ error, onRetry }) => {
  const message = getErrorMessage(error);
  
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-text">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Tekrar Dene
        </button>
      )}
    </div>
  );
};
```

---

## 6. Real-time Updates

### Policy Status Monitoring
```typescript
const usePolicyStatus = (customerId) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/businesses/my-business/customer-policy-status/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Policy status fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);
  
  useEffect(() => {
    fetchStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);
  
  return { status, isLoading, refetch: fetchStatus };
};
```

---

## 7. UI/UX Guidelines

### Visual Indicators
- **Green**: Normal status, within limits
- **Yellow**: Warning, approaching limits
- **Red**: Critical, exceeded limits or banned
- **Blue**: New customer in grace period

### Loading States
- Show loading spinners during policy checks
- Disable forms while validating
- Provide clear feedback for all actions

### Responsive Design
- Ensure all policy status displays work on mobile
- Use appropriate touch targets for mobile users
- Consider collapsible sections for detailed policy info

---

## Summary

The frontend's job is to:
1. **Display** policy settings in a user-friendly form
2. **Show** customer policy status with clear indicators
3. **Validate** actions before allowing them (with backend support)
4. **Handle** errors gracefully with appropriate messages
5. **Update** UI based on policy status changes

The backend handles all the complex policy logic, tracking, and enforcement. The frontend just needs to call the APIs and display the results appropriately.
