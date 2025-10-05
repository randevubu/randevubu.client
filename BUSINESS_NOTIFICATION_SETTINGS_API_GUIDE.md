# Business Notification Settings API Guide

## 📋 Overview

This guide provides comprehensive documentation for the Business Notification Settings API endpoints. Business owners can use these endpoints to configure how they receive notifications when customers book appointments.

## 🔧 Available Settings

- **Push Notifications** - Browser/mobile push notifications
- **SMS Notifications** - Text messages to business owner's phone
- **Email Notifications** - Email notifications (future feature)
- **Quiet Hours** - Time periods when notifications should not be sent
- **Timezone** - Business timezone for scheduling

---

## 📡 API Endpoints

### 1. Get Notification Settings

**Endpoint:** `GET /api/v1/businesses/my-business/notification-settings`

**Description:** Retrieve current notification settings for the authenticated business owner.

**Headers:**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "bns_1759499587171_abc123",
    "businessId": "biz_1758898903633_opae2k3d",
    "enableAppointmentReminders": true,
    "reminderChannels": ["PUSH", "SMS"],
    "reminderTiming": [60, 1440],
    "smsEnabled": true,
    "pushEnabled": true,
    "emailEnabled": false,
    "quietHours": {
      "start": "22:00",
      "end": "08:00"
    },
    "timezone": "Europe/Istanbul",
    "createdAt": "2025-10-03T13:53:07.173Z",
    "updatedAt": "2025-10-03T13:53:07.173Z"
  }
}
```

**Error Responses:**
```json
// 403 - Access Denied
{
  "success": false,
  "error": "Access denied - business role required"
}

// 500 - Server Error
{
  "success": false,
  "error": "Internal server error"
}
```

---

### 2. Update Notification Settings

**Endpoint:** `PUT /api/v1/businesses/my-business/notification-settings`

**Description:** Update notification settings for the authenticated business owner. Supports partial updates.

**Headers:**
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body Structure:**
```typescript
interface UpdateNotificationSettingsRequest {
  enableAppointmentReminders?: boolean;  // Enable appointment reminder notifications
  smsEnabled?: boolean;                  // Enable SMS notifications
  pushEnabled?: boolean;                 // Enable push notifications
  emailEnabled?: boolean;                // Enable email notifications
  reminderChannels?: ('SMS' | 'PUSH' | 'EMAIL')[];  // Active reminder channels
  reminderTiming?: number[];             // Reminder timing in minutes
  quietHours?: {                        // Quiet hours configuration
    start: string;                      // HH:MM format (e.g., "22:00")
    end: string;                        // HH:MM format (e.g., "08:00")
  };
  timezone?: string;                    // Business timezone
}
```

**Example Requests:**

#### Enable Both Push and SMS:
```json
{
  "pushEnabled": true,
  "smsEnabled": true,
  "emailEnabled": false
}
```

#### Push Only:
```json
{
  "pushEnabled": true,
  "smsEnabled": false,
  "emailEnabled": false
}
```

#### SMS Only:
```json
{
  "pushEnabled": false,
  "smsEnabled": true,
  "emailEnabled": false
}
```

#### Disable All Notifications:
```json
{
  "pushEnabled": false,
  "smsEnabled": false,
  "emailEnabled": false
}
```

#### Set Quiet Hours:
```json
{
  "pushEnabled": true,
  "smsEnabled": true,
  "quietHours": {
    "start": "22:00",
    "end": "08:00"
  }
}
```

#### Complete Configuration:
```json
{
  "enableAppointmentReminders": true,
  "pushEnabled": true,
  "smsEnabled": true,
  "emailEnabled": false,
  "reminderChannels": ["PUSH", "SMS"],
  "reminderTiming": [60, 1440],
  "quietHours": {
    "start": "22:00",
    "end": "08:00"
  },
  "timezone": "Europe/Istanbul"
}
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": "bns_1759499587171_abc123",
    "businessId": "biz_1758898903633_opae2k3d",
    "enableAppointmentReminders": true,
    "reminderChannels": ["PUSH", "SMS"],
    "reminderTiming": [60, 1440],
    "smsEnabled": true,
    "pushEnabled": true,
    "emailEnabled": false,
    "quietHours": {
      "start": "22:00",
      "end": "08:00"
    },
    "timezone": "Europe/Istanbul",
    "createdAt": "2025-10-03T13:53:07.173Z",
    "updatedAt": "2025-10-03T16:30:15.123Z"
  },
  "message": "Notification settings updated successfully"
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "success": false,
  "error": "Invalid request data",
  "details": {
    "field": "quietHours.start",
    "message": "Start time must be in HH:MM format (24-hour)"
  }
}

// 403 - Access Denied
{
  "success": false,
  "error": "Access denied - business role required"
}

// 500 - Server Error
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 🔍 Field Descriptions

### Core Settings

| Field | Type | Description | Default | Required |
|-------|------|-------------|---------|----------|
| `enableAppointmentReminders` | boolean | Enable appointment reminder notifications | `true` | No |
| `pushEnabled` | boolean | Enable push notifications | `true` | No |
| `smsEnabled` | boolean | Enable SMS notifications | `false` | No |
| `emailEnabled` | boolean | Enable email notifications | `false` | No |

### Advanced Settings

| Field | Type | Description | Default | Required |
|-------|------|-------------|---------|----------|
| `reminderChannels` | string[] | Active reminder channels | `["PUSH"]` | No |
| `reminderTiming` | number[] | Minutes before appointment (e.g., [60, 1440] for 1 hour and 24 hours) | `[60, 1440]` | No |
| `quietHours` | object | Quiet hours configuration | `null` | No |
| `timezone` | string | Business timezone | `"Europe/Istanbul"` | No |

### Quiet Hours Object

| Field | Type | Format | Description | Example |
|-------|------|--------|-------------|---------|
| `start` | string | HH:MM (24-hour) | Start of quiet period | `"22:00"` |
| `end` | string | HH:MM (24-hour) | End of quiet period | `"08:00"` |

---

## 🎯 Frontend Implementation Examples

### React/TypeScript Example

```typescript
interface NotificationSettings {
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  quietHours?: {
    start: string;
    end: string;
  };
  timezone: string;
}

// Get current settings
const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await fetch('/api/v1/businesses/my-business/notification-settings', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data.data;
};

// Update settings
const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<void> => {
  const response = await fetch('/api/v1/businesses/my-business/notification-settings', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  });
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
};
```

### Vue.js Example

```javascript
// Vue 3 Composition API
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const settings = ref({
      pushEnabled: true,
      smsEnabled: false,
      emailEnabled: false,
      quietHours: {
        start: '22:00',
        end: '08:00'
      },
      timezone: 'Europe/Istanbul'
    });

    const loading = ref(false);
    const error = ref(null);

    const fetchSettings = async () => {
      try {
        loading.value = true;
        const response = await fetch('/api/v1/businesses/my-business/notification-settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          settings.value = data.data;
        } else {
          error.value = data.error;
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const updateSettings = async () => {
      try {
        loading.value = true;
        const response = await fetch('/api/v1/businesses/my-business/notification-settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings.value)
        });
        
        const data = await response.json();
        if (!data.success) {
          error.value = data.error;
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchSettings);

    return {
      settings,
      loading,
      error,
      updateSettings
    };
  }
};
```

---

## 🎨 UI Component Examples

### Settings Toggle Component

```jsx
// React Toggle Component
const NotificationToggle = ({ 
  label, 
  enabled, 
  onChange, 
  description 
}) => (
  <div className="notification-setting">
    <div className="setting-header">
      <label className="setting-label">{label}</label>
      <div className="toggle-switch">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-input"
        />
        <span className="toggle-slider"></span>
      </div>
    </div>
    <p className="setting-description">{description}</p>
  </div>
);

// Usage
<NotificationToggle
  label="Push Notifications"
  enabled={settings.pushEnabled}
  onChange={(enabled) => setSettings({...settings, pushEnabled: enabled})}
  description="Receive push notifications when customers book appointments"
/>
```

### Quiet Hours Picker

```jsx
// React Time Picker Component
const QuietHoursPicker = ({ quietHours, onChange }) => (
  <div className="quiet-hours-picker">
    <h3>Quiet Hours</h3>
    <p>Notifications will not be sent during these hours</p>
    
    <div className="time-inputs">
      <div className="time-input">
        <label>Start Time</label>
        <input
          type="time"
          value={quietHours?.start || '22:00'}
          onChange={(e) => onChange({
            ...quietHours,
            start: e.target.value
          })}
        />
      </div>
      
      <div className="time-input">
        <label>End Time</label>
        <input
          type="time"
          value={quietHours?.end || '08:00'}
          onChange={(e) => onChange({
            ...quietHours,
            end: e.target.value
          })}
        />
      </div>
    </div>
  </div>
);
```

---

## 🔧 Validation Rules

### Time Format Validation
- **Format:** HH:MM (24-hour format)
- **Examples:** `"22:00"`, `"08:30"`, `"00:00"`
- **Invalid:** `"22:0"`, `"25:00"`, `"8:30"`

### Reminder Timing Validation
- **Type:** Array of integers
- **Range:** 5-10080 minutes (5 minutes to 7 days)
- **Max Items:** 5 reminder times
- **Example:** `[60, 1440]` (1 hour and 24 hours before)

### Channel Validation
- **Valid Values:** `"SMS"`, `"PUSH"`, `"EMAIL"`
- **Array Length:** 1-3 channels
- **Case Sensitive:** Yes

---

## 📱 Notification Behavior

### When Settings Are Applied

| Setting | Behavior |
|---------|----------|
| `pushEnabled: true` | Sends push notification to business owner |
| `pushEnabled: false` | Skips push notification, logs: "Push notifications disabled" |
| `smsEnabled: true` | Sends SMS to business owner's phone |
| `smsEnabled: false` | Skips SMS, logs: "SMS notifications disabled" |
| Both disabled | Skips all notifications, logs: "All notifications disabled" |

### Quiet Hours Behavior
- Notifications are not sent during quiet hours
- Quiet hours are calculated in business timezone
- Crosses midnight: `22:00` to `08:00` means 10 PM to 8 AM

---

## 🚨 Error Handling

### Common Error Scenarios

1. **Invalid Time Format**
   ```json
   {
     "success": false,
     "error": "Start time must be in HH:MM format (24-hour)"
   }
   ```

2. **Invalid Reminder Timing**
   ```json
   {
     "success": false,
     "error": "Reminder timing must be between 5 and 10080 minutes"
   }
   ```

3. **Invalid Channel**
   ```json
   {
     "success": false,
     "error": "Invalid channel: 'INVALID'. Must be one of: SMS, PUSH, EMAIL"
   }
   ```

4. **Access Denied**
   ```json
   {
     "success": false,
     "error": "Access denied - business role required"
   }
   ```

---

## 🧪 Testing

### Test Scenarios

1. **Get Settings** - Verify current settings are returned
2. **Update Push Only** - Enable push, disable SMS
3. **Update SMS Only** - Enable SMS, disable push
4. **Disable All** - Disable all notification types
5. **Set Quiet Hours** - Configure quiet hours
6. **Invalid Data** - Test validation with invalid inputs
7. **Unauthorized** - Test without proper authentication

### Sample Test Data

```json
// Test 1: Push Only
{
  "pushEnabled": true,
  "smsEnabled": false,
  "emailEnabled": false
}

// Test 2: SMS Only
{
  "pushEnabled": false,
  "smsEnabled": true,
  "emailEnabled": false
}

// Test 3: Both Enabled
{
  "pushEnabled": true,
  "smsEnabled": true,
  "emailEnabled": false
}

// Test 4: Quiet Hours
{
  "pushEnabled": true,
  "smsEnabled": true,
  "quietHours": {
    "start": "23:00",
    "end": "07:00"
  }
}
```

---

## 📞 Support

For technical support or questions about the notification settings API:

- **Documentation:** This guide
- **API Base URL:** `https://your-api-domain.com/api/v1`
- **Authentication:** Bearer token required
- **Rate Limits:** Standard business API limits apply

---

*Last updated: October 3, 2025*
