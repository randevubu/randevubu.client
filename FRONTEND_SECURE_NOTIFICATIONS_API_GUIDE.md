# Frontend Secure Notifications API Integration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)
6. [Frontend Integration Examples](#frontend-integration-examples)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

## 🎯 Overview

This guide covers the new secure notification endpoints that provide enterprise-grade security for sending push notifications. These endpoints include customer validation, rate limiting, audit logging, and comprehensive error handling.

### Base URL
```
https://your-api-domain.com/api/v1/secure-notifications
```

### Key Features
- ✅ **Customer Validation** - Only send to legitimate customers
- ✅ **Rate Limiting** - Built-in abuse prevention
- ✅ **Audit Logging** - Complete activity tracking
- ✅ **Permission Checks** - Business ownership validation
- ✅ **Error Handling** - Comprehensive error responses

## 🔐 Authentication

All endpoints require authentication via Bearer token:

```javascript
const headers = {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
};
```

## 🚀 API Endpoints

### 1. Send Secure Notification

**Endpoint:** `POST /api/v1/secure-notifications/send`

**Purpose:** Send notifications to specific customers with full validation and security

**Request Body:**
```typescript
interface SecureNotificationRequest {
  businessId: string;                    // Required: Business ID
  recipientIds: string[];               // Required: Array of customer IDs
  title: string;                        // Required: Notification title (max 100 chars)
  body: string;                         // Required: Notification body (max 500 chars)
  notificationType: 'CLOSURE' | 'HOLIDAY' | 'PROMOTION' | 'REMINDER' | 'BROADCAST';
  channels: ('PUSH' | 'SMS' | 'EMAIL')[]; // Required: Notification channels
  data?: Record<string, any>;           // Optional: Additional data
}
```

**Response:**
```typescript
interface SecureNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;                  // Number of successful sends
    failedCount: number;                // Number of failed sends
    totalRecipients: number;            // Total recipients attempted
    validRecipients: number;            // Number of valid customers
    invalidRecipients: number;          // Number of invalid customers
    rateLimitInfo?: {                   // Rate limit information
      allowed: boolean;
      remaining: number;
      resetTime: string;
    };
    errors: Array<{                     // Detailed error information
      recipientId: string;
      error: string;
      errorCode: string;
    }>;
  };
  message: string;
}
```

### 2. Send Broadcast Notification

**Endpoint:** `POST /api/v1/secure-notifications/broadcast`

**Purpose:** Send notifications to all business customers with filtering options

**Request Body:**
```typescript
interface BroadcastNotificationRequest {
  businessId: string;                   // Required: Business ID
  title: string;                        // Required: Notification title
  body: string;                         // Required: Notification body
  notificationType: 'HOLIDAY' | 'PROMOTION' | 'BROADCAST';
  channels: ('PUSH' | 'SMS' | 'EMAIL')[]; // Required: Notification channels
  data?: Record<string, any>;           // Optional: Additional data
  filters?: {                           // Optional: Customer filtering
    relationshipType?: 'ACTIVE_CUSTOMER' | 'PAST_CUSTOMER' | 'ALL';
    minAppointments?: number;           // Minimum appointments required
    lastAppointmentAfter?: string;      // ISO date string
  };
}
```

**Response:**
```typescript
interface BroadcastNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    validRecipients: number;
    invalidRecipients: number;
    errors: Array<{
      recipientId: string;
      error: string;
      errorCode: string;
    }>;
  };
  message: string;
}
```

### 3. Send Closure Notification

**Endpoint:** `POST /api/v1/secure-notifications/closure/{businessId}/{closureId}`

**Purpose:** Send closure notifications to affected customers only

**Path Parameters:**
- `businessId`: Business ID
- `closureId`: Closure ID

**Request Body:**
```typescript
interface ClosureNotificationRequest {
  message: string;                      // Required: Closure message
  channels: ('PUSH' | 'SMS' | 'EMAIL')[]; // Required: Notification channels
}
```

**Response:**
```typescript
interface ClosureNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    validRecipients: number;
    invalidRecipients: number;
    errors: Array<{
      recipientId: string;
      error: string;
      errorCode: string;
    }>;
  };
  message: string;
}
```

### 4. Get Notification Statistics

**Endpoint:** `GET /api/v1/secure-notifications/stats/{businessId}`

**Purpose:** Get comprehensive notification statistics for monitoring

**Path Parameters:**
- `businessId`: Business ID

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```typescript
interface NotificationStatsResponse {
  success: boolean;
  data: {
    totalSent: number;                  // Total notifications sent
    successRate: number;                // Success rate percentage
    failureRate: number;                // Failure rate percentage
    rateLimitStatus: {
      current: {
        hourly: number;
        daily: number;
        weekly: number;
        lastNotification?: string;
      };
      limits: {
        maxNotificationsPerHour: number;
        maxNotificationsPerDay: number;
        maxNotificationsPerWeek: number;
      };
      status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'BLOCKED';
      recommendations: string[];
    };
    customerStats: {
      totalCustomers: number;
      activeCustomers: number;
      optedOutCustomers: number;
      blockedCustomers: number;
      last30DaysCustomers: number;
    };
    recentActivity: Array<{
      id: string;
      eventType: string;
      action: string;
      success: boolean;
      createdAt: string;
    }>;
  };
}
```

### 5. Get Security Alerts

**Endpoint:** `GET /api/v1/secure-notifications/alerts/{businessId}`

**Purpose:** Get security alerts and monitoring information

**Path Parameters:**
- `businessId`: Business ID

**Query Parameters:**
- `hours` (optional): Number of hours to look back (1-168, default: 24)

**Response:**
```typescript
interface SecurityAlertsResponse {
  success: boolean;
  data: {
    alerts: Array<{
      type: 'RATE_LIMIT_ABUSE' | 'PERMISSION_VIOLATION' | 'SUSPICIOUS_ACTIVITY';
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      count: number;
      description: string;
      firstOccurrence: string;
      lastOccurrence: string;
    }>;
    period: string;                     // e.g., "24 hours"
    totalAlerts: number;
  };
}
```

### 6. Send Test Notification

**Endpoint:** `POST /api/v1/secure-notifications/test`

**Purpose:** Send a test notification to yourself (for development/testing)

**Request Body:**
```typescript
interface TestNotificationRequest {
  businessId: string;                   // Required: Business ID
  title: string;                        // Required: Test title
  body: string;                         // Required: Test body
  channels?: ('PUSH' | 'SMS' | 'EMAIL')[]; // Optional: Defaults to PUSH
}
```

**Response:**
```typescript
interface TestNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;
    failedCount: number;
    errors: Array<{
      recipientId: string;
      error: string;
      errorCode: string;
    }>;
  };
  message: string;
}
```

## 📝 Request/Response Examples

### Example 1: Send Holiday Message to All Customers

```javascript
// Request
const holidayMessage = {
  businessId: "business-123",
  title: "Holiday Closure Notice",
  body: "We'll be closed from Dec 24-26 for the holidays. Happy holidays!",
  notificationType: "HOLIDAY",
  channels: ["PUSH", "SMS"],
  data: {
    holidayDates: "2024-12-24 to 2024-12-26",
    reopenDate: "2024-12-27"
  },
  filters: {
    relationshipType: "ACTIVE_CUSTOMER",
    minAppointments: 1
  }
};

const response = await fetch('/api/v1/secure-notifications/broadcast', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(holidayMessage)
});

// Response
{
  "success": true,
  "data": {
    "sentCount": 45,
    "failedCount": 2,
    "totalRecipients": 47,
    "validRecipients": 45,
    "invalidRecipients": 2,
    "errors": [
      {
        "recipientId": "customer-123",
        "error": "Customer has opted out of notifications",
        "errorCode": "CUSTOMER_OPTED_OUT"
      },
      {
        "recipientId": "customer-456",
        "error": "No push subscriptions found",
        "errorCode": "NO_SUBSCRIPTION"
      }
    ]
  },
  "message": "Broadcast sent successfully to 45 customers"
}
```

### Example 2: Send Closure Notification

```javascript
// Request
const closureNotification = {
  message: "We're closed today due to maintenance. Your appointment will be rescheduled.",
  channels: ["PUSH", "SMS"]
};

const response = await fetch('/api/v1/secure-notifications/closure/business-123/closure-456', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(closureNotification)
});

// Response
{
  "success": true,
  "data": {
    "sentCount": 8,
    "failedCount": 0,
    "totalRecipients": 8,
    "validRecipients": 8,
    "invalidRecipients": 0,
    "errors": []
  },
  "message": "Closure notification sent to 8 affected customers"
}
```

### Example 3: Get Notification Statistics

```javascript
// Request
const response = await fetch('/api/v1/secure-notifications/stats/business-123?startDate=2024-01-01&endDate=2024-01-31', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

// Response
{
  "success": true,
  "data": {
    "totalSent": 1250,
    "successRate": 94.5,
    "failureRate": 5.5,
    "rateLimitStatus": {
      "current": {
        "hourly": 15,
        "daily": 150,
        "weekly": 800
      },
      "limits": {
        "maxNotificationsPerHour": 100,
        "maxNotificationsPerDay": 1000,
        "maxNotificationsPerWeek": 5000
      },
      "status": "HEALTHY",
      "recommendations": []
    },
    "customerStats": {
      "totalCustomers": 500,
      "activeCustomers": 350,
      "optedOutCustomers": 25,
      "blockedCustomers": 5,
      "last30DaysCustomers": 200
    },
    "recentActivity": [
      {
        "id": "audit-123",
        "eventType": "NOTIFICATION_SENT",
        "action": "Sent HOLIDAY notification",
        "success": true,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## ⚠️ Error Handling

### Common Error Codes

| Error Code | Description | Action |
|------------|-------------|---------|
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | Wait and retry later |
| `PERMISSION_DENIED` | Unauthorized access | Check business ownership |
| `CUSTOMER_OPTED_OUT` | Customer opted out | Respect customer preference |
| `NO_SUBSCRIPTION` | No push subscription | Customer needs to subscribe |
| `BUSINESS_NOT_FOUND` | Business not found | Check business ID |
| `INVALID_NOTIFICATION_TYPE` | Invalid notification type | Use valid type |
| `VALIDATION_ERROR` | Input validation failed | Check request format |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: string;                        // Human-readable error message
  errorCode?: string;                   // Machine-readable error code
  details?: Record<string, any>;        // Additional error details
}
```

### Example Error Handling

```javascript
async function sendNotification(notificationData) {
  try {
    const response = await fetch('/api/v1/secure-notifications/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }

    if (!result.success) {
      // Handle partial success
      console.warn('Notification partially failed:', result.data.errors);
    }

    return result;

  } catch (error) {
    console.error('Notification error:', error.message);
    
    // Handle specific error types
    if (error.message.includes('Rate limit')) {
      // Show rate limit message to user
      showRateLimitMessage();
    } else if (error.message.includes('Permission denied')) {
      // Show unauthorized message
      showUnauthorizedMessage();
    } else {
      // Show generic error message
      showErrorMessage('Failed to send notification');
    }
    
    throw error;
  }
}
```

## 🎨 Frontend Integration Examples

### 1. React Hook for Notifications

```javascript
import { useState, useCallback } from 'react';

export const useSecureNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendNotification = useCallback(async (notificationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/secure-notifications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendBroadcast = useCallback(async (broadcastData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/secure-notifications/broadcast', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(broadcastData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendClosureNotification = useCallback(async (businessId, closureId, message, channels) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/secure-notifications/closure/${businessId}/${closureId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, channels })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendNotification,
    sendBroadcast,
    sendClosureNotification,
    loading,
    error
  };
};
```

### 2. Vue.js Composable

```javascript
import { ref, computed } from 'vue';

export const useSecureNotifications = () => {
  const loading = ref(false);
  const error = ref(null);

  const sendNotification = async (notificationData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/v1/secure-notifications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const sendBroadcast = async (broadcastData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/v1/secure-notifications/broadcast', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(broadcastData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      return result;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    sendNotification,
    sendBroadcast,
    loading: computed(() => loading.value),
    error: computed(() => error.value)
  };
};
```

### 3. Angular Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecureNotificationService {
  private baseUrl = '/api/v1/secure-notifications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getUserToken()}`,
      'Content-Type': 'application/json'
    });
  }

  private getUserToken(): string {
    // Get token from your auth service
    return localStorage.getItem('userToken') || '';
  }

  sendNotification(notificationData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/send`, notificationData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Notification error:', error);
        return throwError(error);
      })
    );
  }

  sendBroadcast(broadcastData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/broadcast`, broadcastData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Broadcast error:', error);
        return throwError(error);
      })
    );
  }

  sendClosureNotification(businessId: string, closureId: string, message: string, channels: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/closure/${businessId}/${closureId}`, {
      message,
      channels
    }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Closure notification error:', error);
        return throwError(error);
      })
    );
  }

  getStats(businessId: string, startDate?: string, endDate?: string): Observable<any> {
    let url = `${this.baseUrl}/stats/${businessId}`;
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += `?${params.toString()}`;
    }

    return this.http.get(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Stats error:', error);
        return throwError(error);
      })
    );
  }
}
```

### 4. Notification UI Component (React)

```jsx
import React, { useState } from 'react';
import { useSecureNotifications } from './hooks/useSecureNotifications';

const NotificationSender = ({ businessId }) => {
  const { sendNotification, sendBroadcast, loading, error } = useSecureNotifications();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    notificationType: 'BROADCAST',
    channels: ['PUSH']
  });

  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    try {
      const result = await sendBroadcast({
        businessId,
        ...formData
      });

      if (result.success) {
        alert(`Notification sent to ${result.data.sentCount} customers`);
      } else {
        alert('Failed to send notification');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="notification-sender">
      <h3>Send Notification</h3>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSendNotification}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label>Message:</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({...formData, body: e.target.value})}
            maxLength={500}
            required
          />
        </div>

        <div className="form-group">
          <label>Type:</label>
          <select
            value={formData.notificationType}
            onChange={(e) => setFormData({...formData, notificationType: e.target.value})}
          >
            <option value="HOLIDAY">Holiday Message</option>
            <option value="PROMOTION">Promotion</option>
            <option value="BROADCAST">General Broadcast</option>
          </select>
        </div>

        <div className="form-group">
          <label>Channels:</label>
          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.channels.includes('PUSH')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({...formData, channels: [...formData.channels, 'PUSH']});
                  } else {
                    setFormData({...formData, channels: formData.channels.filter(c => c !== 'PUSH')});
                  }
                }}
              />
              Push Notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.channels.includes('SMS')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({...formData, channels: [...formData.channels, 'SMS']});
                  } else {
                    setFormData({...formData, channels: formData.channels.filter(c => c !== 'SMS')});
                  }
                }}
              />
              SMS
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
};

export default NotificationSender;
```

## 🧪 Testing

### 1. Test Notification

```javascript
// Send a test notification to yourself
const testNotification = {
  businessId: "your-business-id",
  title: "Test Notification",
  body: "This is a test notification",
  channels: ["PUSH"]
};

const response = await fetch('/api/v1/secure-notifications/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testNotification)
});

const result = await response.json();
console.log('Test result:', result);
```

### 2. Check Statistics

```javascript
// Get notification statistics
const response = await fetch('/api/v1/secure-notifications/stats/your-business-id', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const stats = await response.json();
console.log('Statistics:', stats.data);
```

### 3. Check Security Alerts

```javascript
// Get security alerts
const response = await fetch('/api/v1/secure-notifications/alerts/your-business-id?hours=24', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const alerts = await response.json();
console.log('Security alerts:', alerts.data);
```

## 📋 Best Practices

### 1. Error Handling

```javascript
// Always handle errors gracefully
try {
  const result = await sendNotification(data);
  
  if (result.data.errors.length > 0) {
    console.warn('Some notifications failed:', result.data.errors);
  }
  
  if (result.data.rateLimitInfo && !result.data.rateLimitInfo.allowed) {
    console.warn('Rate limit exceeded. Retry after:', result.data.rateLimitInfo.resetTime);
  }
  
} catch (error) {
  console.error('Notification failed:', error.message);
  // Show user-friendly error message
}
```

### 2. Rate Limit Handling

```javascript
// Check rate limit status before sending
const checkRateLimit = async (businessId) => {
  const response = await fetch(`/api/v1/secure-notifications/stats/${businessId}`);
  const stats = await response.json();
  
  const rateLimitStatus = stats.data.rateLimitStatus;
  
  if (rateLimitStatus.status === 'BLOCKED') {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  if (rateLimitStatus.status === 'WARNING') {
    console.warn('Approaching rate limit. Consider reducing frequency.');
  }
  
  return rateLimitStatus;
};
```

### 3. User Feedback

```javascript
// Provide clear feedback to users
const showNotificationResult = (result) => {
  if (result.success) {
    if (result.data.failedCount > 0) {
      showMessage(`Notification sent to ${result.data.sentCount} customers. ${result.data.failedCount} failed.`);
    } else {
      showMessage(`Notification sent successfully to ${result.data.sentCount} customers.`);
    }
  } else {
    showMessage('Failed to send notification. Please try again.');
  }
};
```

### 4. Input Validation

```javascript
// Validate input before sending
const validateNotificationData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length > 100) {
    errors.push('Title is required and must be 100 characters or less');
  }
  
  if (!data.body || data.body.length > 500) {
    errors.push('Body is required and must be 500 characters or less');
  }
  
  if (!data.channels || data.channels.length === 0) {
    errors.push('At least one channel must be selected');
  }
  
  if (data.recipientIds && data.recipientIds.length > 10000) {
    errors.push('Maximum 10,000 recipients allowed');
  }
  
  return errors;
};
```

### 5. Loading States

```javascript
// Show loading states during API calls
const [loading, setLoading] = useState(false);

const handleSend = async () => {
  setLoading(true);
  try {
    const result = await sendNotification(data);
    // Handle result
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};

return (
  <button onClick={handleSend} disabled={loading}>
    {loading ? 'Sending...' : 'Send Notification'}
  </button>
);
```

## 🔧 Configuration

### Environment Variables

```javascript
// API configuration
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || 'https://your-api-domain.com',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};
```

### Request Interceptors

```javascript
// Add request interceptors for common headers
const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout
});

apiClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getUserToken()}`;
  config.headers['Content-Type'] = 'application/json';
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Handle rate limit errors
      showRateLimitMessage();
    }
    return Promise.reject(error);
  }
);
```

This comprehensive guide provides everything you need to integrate the new secure notification endpoints into your frontend application with proper error handling, user feedback, and best practices! 🚀
