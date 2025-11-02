# Cancellation and No-Show Policies API Documentation

## Overview

The cancellation and no-show policies system allows businesses to configure and enforce rules for customer appointment behavior. This system helps maintain fair booking practices and protects business operations.

## Features

- **Configurable Policies**: Set minimum cancellation time, monthly limits for cancellations and no-shows
- **Real-time Enforcement**: Policies are checked before allowing any appointment actions
- **Customer Status Tracking**: Monitor individual customer behavior and violations
- **Automatic Banning**: Option to automatically ban customers who exceed limits
- **Grace Periods**: New customers can have a grace period before policy enforcement
- **Custom Warning Messages**: Businesses can set custom policy violation messages

---

## API Endpoints

### Base URL
```
https://your-api-domain.com/api/v1
```

### Authentication
All endpoints require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Get Business Cancellation Policies

**Endpoint:** `GET /businesses/my-business/cancellation-policies`

**Description:** Retrieve current cancellation and no-show policy settings for the business.

**Request:**
```http
GET /api/v1/businesses/my-business/cancellation-policies
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "minCancellationHours": 4,
    "maxMonthlyCancellations": 3,
    "maxMonthlyNoShows": 2,
    "enablePolicyEnforcement": true,
    "policyWarningMessage": "Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek ve bir daha işletmenizden randevu alamayacaktır. Bu politikalar müşteri deneyimini korumak ve adil bir rezervasyon sistemi sağlamak için uygulanır.",
    "gracePeriodDays": 0,
    "autoBanEnabled": false,
    "banDurationDays": 30
  },
  "message": "Cancellation policies retrieved successfully"
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Access denied - business role required"
}
```

---

## 2. Update Business Cancellation Policies

**Endpoint:** `PUT /businesses/my-business/cancellation-policies`

**Description:** Update cancellation and no-show policy settings for the business.

**Request Body:**
```json
{
  "minCancellationHours": 4,
  "maxMonthlyCancellations": 3,
  "maxMonthlyNoShows": 2,
  "enablePolicyEnforcement": true,
  "policyWarningMessage": "Custom warning message here...",
  "gracePeriodDays": 0,
  "autoBanEnabled": false,
  "banDurationDays": 30
}
```

**Field Descriptions:**
- `minCancellationHours` (number, 1-168): Minimum hours before appointment that cancellation is allowed
- `maxMonthlyCancellations` (number, 0-50): Maximum cancellations allowed per month per customer
- `maxMonthlyNoShows` (number, 0-20): Maximum no-shows allowed per month per customer
- `enablePolicyEnforcement` (boolean): Enable/disable policy enforcement
- `policyWarningMessage` (string, max 500 chars): Custom warning message for policy violations
- `gracePeriodDays` (number, 0-30): Grace period in days for new customers
- `autoBanEnabled` (boolean): Automatically ban customers who exceed limits
- `banDurationDays` (number, 1-365): Duration of automatic ban in days (required if autoBanEnabled is true)

**Request:**
```http
PUT /api/v1/businesses/my-business/cancellation-policies
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "minCancellationHours": 4,
  "maxMonthlyCancellations": 3,
  "maxMonthlyNoShows": 2,
  "enablePolicyEnforcement": true,
  "policyWarningMessage": "Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek...",
  "gracePeriodDays": 0,
  "autoBanEnabled": false,
  "banDurationDays": 30
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "minCancellationHours": 4,
    "maxMonthlyCancellations": 3,
    "maxMonthlyNoShows": 2,
    "enablePolicyEnforcement": true,
    "policyWarningMessage": "Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek...",
    "gracePeriodDays": 0,
    "autoBanEnabled": false,
    "banDurationDays": 30
  },
  "message": "Cancellation policies updated successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid policy settings"
}
```

---

## 3. Get Customer Policy Status

**Endpoint:** `GET /businesses/my-business/customer-policy-status/{customerId}`

**Description:** Check a customer's current policy status and violations for the business.

**Request:**
```http
GET /api/v1/businesses/my-business/customer-policy-status/cust_123456789
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "customerId": "cust_123456789",
    "businessId": "bus_123456789",
    "currentCancellations": 1,
    "currentNoShows": 0,
    "isBanned": false,
    "bannedUntil": null,
    "banReason": null,
    "gracePeriodActive": false,
    "gracePeriodEndsAt": null,
    "policySettings": {
      "minCancellationHours": 4,
      "maxMonthlyCancellations": 3,
      "maxMonthlyNoShows": 2,
      "enablePolicyEnforcement": true,
      "policyWarningMessage": "Bu kuralları aşan müşteriler...",
      "gracePeriodDays": 0,
      "autoBanEnabled": false,
      "banDurationDays": 30
    },
    "violations": []
  },
  "message": "Customer policy status retrieved successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Customer ID is required"
}
```

---

## Frontend Integration Guide

### 1. Settings Page Implementation

Create a settings section for cancellation policies with the following UI components:

#### Policy Configuration Form
```typescript
interface CancellationPolicyForm {
  minCancellationHours: number;
  maxMonthlyCancellations: number;
  maxMonthlyNoShows: number;
  enablePolicyEnforcement: boolean;
  policyWarningMessage?: string;
  gracePeriodDays: number;
  autoBanEnabled: boolean;
  banDurationDays?: number;
}
```

#### Form Validation Rules
- `minCancellationHours`: 1-168 (1 hour to 7 days)
- `maxMonthlyCancellations`: 0-50
- `maxMonthlyNoShows`: 0-20
- `policyWarningMessage`: Max 500 characters
- `gracePeriodDays`: 0-30
- `banDurationDays`: 1-365 (required if autoBanEnabled is true)

#### UI Components Needed
1. **Number inputs** for policy limits with proper validation
2. **Toggle switches** for enablePolicyEnforcement and autoBanEnabled
3. **Text area** for custom warning message
4. **Warning display** showing the policy warning message
5. **Save/Cancel buttons** for form submission

### 2. Customer Management Integration

#### Customer Status Display
Show customer policy status in customer management views:

```typescript
interface CustomerPolicyStatus {
  currentCancellations: number;
  currentNoShows: number;
  isBanned: boolean;
  bannedUntil?: Date;
  gracePeriodActive: boolean;
  violations: PolicyViolation[];
}
```

#### Status Indicators
- **Green**: Within policy limits
- **Yellow**: Approaching limits (show warnings)
- **Red**: Exceeded limits or banned
- **Blue**: In grace period

### 3. Appointment Actions Integration

#### Before Appointment Booking
Check customer policy status before allowing booking:

```typescript
// Example API call before booking
const checkBookingEligibility = async (customerId: string, businessId: string) => {
  const response = await fetch(`/api/v1/businesses/my-business/customer-policy-status/${customerId}`);
  const data = await response.json();
  
  if (data.data.isBanned) {
    showError("Bu müşteri sistemden engellenmiştir");
    return false;
  }
  
  if (data.data.currentNoShows >= data.data.policySettings.maxMonthlyNoShows) {
    showError("Müşteri aylık maksimum gelmeme sayısına ulaştı");
    return false;
  }
  
  return true;
};
```

#### Before Appointment Cancellation
Check cancellation policies before allowing cancellation:

```typescript
// Example API call before cancellation
const checkCancellationEligibility = async (appointmentId: string) => {
  // Get appointment details first
  const appointment = await getAppointment(appointmentId);
  
  // Check if cancellation is within allowed time
  const hoursUntilAppointment = calculateHoursUntil(appointment.startTime);
  const minHours = appointment.business.settings.cancellationPolicies.minCancellationHours;
  
  if (hoursUntilAppointment < minHours) {
    showError(`Randevu iptali için en az ${minHours} saat önceden iptal etmeniz gerekmektedir`);
    return false;
  }
  
  return true;
};
```

### 4. Error Handling

#### Common Error Messages
- **Policy Violation**: "Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek..."
- **Late Cancellation**: "Randevu iptali için en az X saat önceden iptal etmeniz gerekmektedir"
- **Monthly Limit Exceeded**: "Aylık maksimum iptal/gelmeme sayısına ulaştınız"
- **Customer Banned**: "Bu müşteri sistemden engellenmiştir"

#### Error Response Handling
```typescript
const handlePolicyError = (error: any) => {
  if (error.message.includes('Cannot book appointment:')) {
    showError(error.message.replace('Cannot book appointment: ', ''));
  } else if (error.message.includes('Cannot cancel appointment:')) {
    showError(error.message.replace('Cannot cancel appointment: ', ''));
  } else {
    showError('Politika ihlali nedeniyle işlem gerçekleştirilemedi');
  }
};
```

### 5. Real-time Updates

#### Policy Status Monitoring
Implement real-time monitoring of customer policy status:

```typescript
// Example: Check customer status when viewing customer details
useEffect(() => {
  if (customerId) {
    fetchCustomerPolicyStatus(customerId)
      .then(setPolicyStatus)
      .catch(handleError);
  }
}, [customerId]);
```

#### Status Change Notifications
Show notifications when policy status changes:

```typescript
const showPolicyStatusChange = (status: CustomerPolicyStatus) => {
  if (status.isBanned) {
    showWarning(`Müşteri ${status.banReason} nedeniyle engellenmiştir`);
  } else if (status.currentCancellations >= status.policySettings.maxMonthlyCancellations) {
    showWarning('Müşteri aylık iptal limitine ulaştı');
  }
};
```

---

## Default Policy Values

If no policies are configured, the system uses these defaults:

```json
{
  "minCancellationHours": 4,
  "maxMonthlyCancellations": 3,
  "maxMonthlyNoShows": 2,
  "enablePolicyEnforcement": true,
  "policyWarningMessage": "Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek ve bir daha işletmenizden randevu alamayacaktır. Bu politikalar müşteri deneyimini korumak ve adil bir rezervasyon sistemi sağlamak için uygulanır.",
  "gracePeriodDays": 0,
  "autoBanEnabled": false,
  "banDurationDays": 30
}
```

---

## Testing

### Test Scenarios

1. **Policy Configuration**
   - Test setting different policy values
   - Test validation of policy limits
   - Test saving and retrieving policies

2. **Customer Status Checking**
   - Test checking customer status for different scenarios
   - Test grace period functionality
   - Test banned customer handling

3. **Appointment Actions**
   - Test booking with policy violations
   - Test cancellation with time restrictions
   - Test no-show marking with limits

4. **Error Handling**
   - Test various error scenarios
   - Test error message display
   - Test fallback behaviors

### Sample Test Data

```typescript
// Test customer with policy violations
const testCustomer = {
  customerId: "test_customer_1",
  currentCancellations: 2,
  currentNoShows: 1,
  isBanned: false,
  gracePeriodActive: false
};

// Test policy settings
const testPolicies = {
  minCancellationHours: 4,
  maxMonthlyCancellations: 3,
  maxMonthlyNoShows: 2,
  enablePolicyEnforcement: true
};
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Business owners/managers can only access their own business policies
3. **Input Validation**: All inputs are validated on the server side
4. **Rate Limiting**: Consider implementing rate limiting for policy checks
5. **Audit Logging**: All policy changes are logged for audit purposes

---

## Support

For technical support or questions about the cancellation policies API, please contact the development team or refer to the main API documentation.
