# Staff Privacy Feature - Frontend Implementation Guide

## Overview

The Staff Privacy feature allows business owners to hide individual staff member names from customers during appointment booking. Instead of showing real names like "Hasan Yılmaz", customers will see generic labels like "Owner" or "Staff".

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Frontend Implementation](#frontend-implementation)
3. [Display Modes](#display-modes)
4. [Code Examples](#code-examples)
5. [UI/UX Considerations](#uiux-considerations)
6. [Testing](#testing)

## API Endpoints

### 1. Get Staff Privacy Settings
```http
GET /api/v1/businesses/my-business/staff-privacy-settings
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hideStaffNames": false,
    "staffDisplayMode": "NAMES",
    "customStaffLabels": {
      "owner": "Owner",
      "manager": "Manager",
      "staff": "Staff",
      "receptionist": "Receptionist"
    }
  },
  "message": "Staff privacy settings retrieved successfully"
}
```

### 2. Update Staff Privacy Settings
```http
PUT /api/v1/businesses/my-business/staff-privacy-settings
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hideStaffNames": true,
  "staffDisplayMode": "GENERIC",
  "customStaffLabels": {
    "owner": "Hasan",
    "manager": "Manager",
    "staff": "Staff",
    "receptionist": "Receptionist"
  }
}
```

### 3. Get Public Staff List (Customer View)
```http
GET /api/v1/public/businesses/{businessId}/staff
```

**Response (with privacy enabled):**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "staff_1",
        "role": "OWNER",
        "user": {
          "id": "user_1",
          "firstName": null,
          "lastName": null,
          "avatar": null
        },
        "displayName": "Hasan"
      },
      {
        "id": "staff_2",
        "role": "STAFF",
        "user": {
          "id": "user_2",
          "firstName": null,
          "lastName": null,
          "avatar": null
        },
        "displayName": "Staff"
      }
    ]
  }
}
```

## Frontend Implementation

### 1. Business Owner Settings Page

Create a settings page where business owners can configure staff privacy:

```typescript
// types/staffPrivacy.ts
export interface StaffPrivacySettings {
  hideStaffNames: boolean;
  staffDisplayMode: 'NAMES' | 'ROLES' | 'GENERIC';
  customStaffLabels: {
    owner: string;
    manager: string;
    staff: string;
    receptionist: string;
  };
}

export interface StaffPrivacySettingsRequest {
  hideStaffNames?: boolean;
  staffDisplayMode?: 'NAMES' | 'ROLES' | 'GENERIC';
  customStaffLabels?: {
    owner?: string;
    manager?: string;
    staff?: string;
    receptionist?: string;
  };
}
```

```typescript
// services/staffPrivacyService.ts
import { apiClient } from './apiClient';

export class StaffPrivacyService {
  static async getStaffPrivacySettings(): Promise<StaffPrivacySettings> {
    const response = await apiClient.get('/businesses/my-business/staff-privacy-settings');
    return response.data.data;
  }

  static async updateStaffPrivacySettings(
    settings: StaffPrivacySettingsRequest
  ): Promise<StaffPrivacySettings> {
    const response = await apiClient.put('/businesses/my-business/staff-privacy-settings', settings);
    return response.data.data;
  }
}
```

### 2. Settings UI Component

```tsx
// components/StaffPrivacySettings.tsx
import React, { useState, useEffect } from 'react';
import { StaffPrivacyService } from '../services/staffPrivacyService';
import { StaffPrivacySettings } from '../types/staffPrivacy';

export const StaffPrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<StaffPrivacySettings>({
    hideStaffNames: false,
    staffDisplayMode: 'NAMES',
    customStaffLabels: {
      owner: 'Owner',
      manager: 'Manager',
      staff: 'Staff',
      receptionist: 'Receptionist'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await StaffPrivacyService.getStaffPrivacySettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await StaffPrivacyService.updateStaffPrivacySettings(settings);
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHideNames = (hide: boolean) => {
    setSettings(prev => ({
      ...prev,
      hideStaffNames: hide
    }));
  };

  const handleDisplayModeChange = (mode: 'NAMES' | 'ROLES' | 'GENERIC') => {
    setSettings(prev => ({
      ...prev,
      staffDisplayMode: mode
    }));
  };

  const handleLabelChange = (role: keyof StaffPrivacySettings['customStaffLabels'], value: string) => {
    setSettings(prev => ({
      ...prev,
      customStaffLabels: {
        ...prev.customStaffLabels,
        [role]: value
      }
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="staff-privacy-settings">
      <h2>Staff Privacy Settings</h2>
      <p>Configure how staff members are displayed to customers during appointment booking.</p>

      {/* Hide Names Toggle */}
      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.hideStaffNames}
            onChange={(e) => handleToggleHideNames(e.target.checked)}
          />
          Hide individual staff member names from customers
        </label>
        <p className="setting-description">
          When enabled, customers will see generic labels instead of real names.
        </p>
      </div>

      {/* Display Mode Selection */}
      {settings.hideStaffNames && (
        <div className="setting-group">
          <label>Display Mode:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="displayMode"
                value="ROLES"
                checked={settings.staffDisplayMode === 'ROLES'}
                onChange={() => handleDisplayModeChange('ROLES')}
              />
              Show Role Titles (Owner, Manager, Staff Member)
            </label>
            <label>
              <input
                type="radio"
                name="displayMode"
                value="GENERIC"
                checked={settings.staffDisplayMode === 'GENERIC'}
                onChange={() => handleDisplayModeChange('GENERIC')}
              />
              Show Custom Labels
            </label>
          </div>
        </div>
      )}

      {/* Custom Labels */}
      {settings.hideStaffNames && settings.staffDisplayMode === 'GENERIC' && (
        <div className="setting-group">
          <label>Custom Labels:</label>
          <div className="label-inputs">
            <div className="label-input">
              <label>Owner:</label>
              <input
                type="text"
                value={settings.customStaffLabels.owner}
                onChange={(e) => handleLabelChange('owner', e.target.value)}
                maxLength={50}
                placeholder="e.g., Hasan"
              />
            </div>
            <div className="label-input">
              <label>Manager:</label>
              <input
                type="text"
                value={settings.customStaffLabels.manager}
                onChange={(e) => handleLabelChange('manager', e.target.value)}
                maxLength={50}
                placeholder="e.g., Manager"
              />
            </div>
            <div className="label-input">
              <label>Staff:</label>
              <input
                type="text"
                value={settings.customStaffLabels.staff}
                onChange={(e) => handleLabelChange('staff', e.target.value)}
                maxLength={50}
                placeholder="e.g., Staff"
              />
            </div>
            <div className="label-input">
              <label>Receptionist:</label>
              <input
                type="text"
                value={settings.customStaffLabels.receptionist}
                onChange={(e) => handleLabelChange('receptionist', e.target.value)}
                maxLength={50}
                placeholder="e.g., Receptionist"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {settings.hideStaffNames && (
        <div className="setting-group">
          <label>Preview:</label>
          <div className="preview">
            <p>Customers will see:</p>
            <ul>
              <li>• {getDisplayName('OWNER', settings)} (Owner)</li>
              <li>• {getDisplayName('MANAGER', settings)} (Manager)</li>
              <li>• {getDisplayName('STAFF', settings)} (Staff)</li>
              <li>• {getDisplayName('RECEPTIONIST', settings)} (Receptionist)</li>
            </ul>
          </div>
        </div>
      )}

      <button 
        onClick={handleSave} 
        disabled={saving}
        className="save-button"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

// Helper function to get display name
function getDisplayName(role: string, settings: StaffPrivacySettings): string {
  if (settings.staffDisplayMode === 'ROLES') {
    const roleNames = {
      'OWNER': 'Owner',
      'MANAGER': 'Manager',
      'STAFF': 'Staff Member',
      'RECEPTIONIST': 'Receptionist',
    };
    return roleNames[role as keyof typeof roleNames] || 'Staff';
  }

  if (settings.staffDisplayMode === 'GENERIC') {
    return settings.customStaffLabels[role.toLowerCase() as keyof typeof settings.customStaffLabels] || 'Staff';
  }

  return 'Staff';
}
```

### 3. Customer Staff Selection Component

```tsx
// components/StaffSelector.tsx
import React, { useState, useEffect } from 'react';

interface StaffMember {
  id: string;
  role: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  displayName?: string;
}

interface StaffSelectorProps {
  businessId: string;
  onStaffSelect: (staffId: string) => void;
  selectedStaffId?: string;
}

export const StaffSelector: React.FC<StaffSelectorProps> = ({
  businessId,
  onStaffSelect,
  selectedStaffId
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, [businessId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/public/businesses/${businessId}/staff`);
      const data = await response.json();
      setStaff(data.data.staff);
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStaffDisplayName = (member: StaffMember): string => {
    // If displayName is provided (privacy enabled), use it
    if (member.displayName) {
      return member.displayName;
    }
    
    // Otherwise, use the actual name
    if (member.user.firstName && member.user.lastName) {
      return `${member.user.firstName} ${member.user.lastName}`;
    }
    
    return member.user.firstName || 'Staff Member';
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames = {
      'OWNER': 'Owner',
      'MANAGER': 'Manager',
      'STAFF': 'Staff Member',
      'RECEPTIONIST': 'Receptionist',
    };
    return roleNames[role as keyof typeof roleNames] || 'Staff';
  };

  if (loading) return <div>Loading staff...</div>;

  return (
    <div className="staff-selector">
      <h3>Select Staff Member</h3>
      <div className="staff-grid">
        {staff.map((member) => (
          <div
            key={member.id}
            className={`staff-card ${selectedStaffId === member.id ? 'selected' : ''}`}
            onClick={() => onStaffSelect(member.id)}
          >
            <div className="staff-avatar">
              {member.user.avatar ? (
                <img src={member.user.avatar} alt={getStaffDisplayName(member)} />
              ) : (
                <div className="avatar-placeholder">
                  {getStaffDisplayName(member).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="staff-info">
              <h4>{getStaffDisplayName(member)}</h4>
              <p className="staff-role">{getRoleDisplayName(member.role)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. Appointment Booking Component

```tsx
// components/AppointmentBooking.tsx
import React, { useState } from 'react';
import { StaffSelector } from './StaffSelector';

export const AppointmentBooking: React.FC = () => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [businessId] = useState('your-business-id'); // Get from context/props

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
  };

  return (
    <div className="appointment-booking">
      <h2>Book Appointment</h2>
      
      {/* Staff Selection */}
      <StaffSelector
        businessId={businessId}
        onStaffSelect={handleStaffSelect}
        selectedStaffId={selectedStaffId}
      />
      
      {/* Other booking form fields */}
      {/* ... */}
    </div>
  );
};
```

## Display Modes

### 1. NAMES Mode (Default)
- Shows actual staff names: "Hasan Yılmaz"
- Used when `hideStaffNames: false`

### 2. ROLES Mode
- Shows role titles: "Owner", "Manager", "Staff Member"
- Used when `hideStaffNames: true` and `staffDisplayMode: "ROLES"`

### 3. GENERIC Mode
- Shows custom labels: "Hasan", "Manager", "Staff"
- Used when `hideStaffNames: true` and `staffDisplayMode: "GENERIC"`

## Code Examples

### CSS Styling

```css
/* Staff Privacy Settings */
.staff-privacy-settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.setting-group {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.setting-description {
  margin: 8px 0 0 24px;
  color: #666;
  font-size: 14px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}

.label-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-input input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.preview ul {
  margin: 8px 0 0 0;
  padding-left: 16px;
}

.save-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.save-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Staff Selector */
.staff-selector {
  margin: 20px 0;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.staff-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.staff-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.staff-card.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.staff-avatar {
  width: 60px;
  height: 60px;
  margin: 0 auto 12px;
  border-radius: 50%;
  overflow: hidden;
}

.staff-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.staff-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.staff-role {
  margin: 0;
  color: #666;
  font-size: 14px;
}
```

## UI/UX Considerations

### 1. Settings Page
- **Clear Toggle**: Use a prominent checkbox for the main privacy setting
- **Progressive Disclosure**: Show additional options only when privacy is enabled
- **Live Preview**: Show how staff will appear to customers
- **Validation**: Ensure custom labels are not empty and within character limits

### 2. Customer Experience
- **Consistent Display**: Use the same display logic across all customer-facing components
- **Fallback Handling**: Handle cases where displayName might be null
- **Accessibility**: Ensure screen readers can understand the staff selection

### 3. Business Owner Experience
- **Intuitive Controls**: Make it easy to understand the impact of each setting
- **Immediate Feedback**: Show preview of how changes will look
- **Help Text**: Provide clear explanations of each option

## Testing

### 1. Unit Tests

```typescript
// tests/staffPrivacy.test.ts
import { StaffPrivacyService } from '../services/staffPrivacyService';

describe('StaffPrivacyService', () => {
  test('should get staff privacy settings', async () => {
    const mockSettings = {
      hideStaffNames: false,
      staffDisplayMode: 'NAMES',
      customStaffLabels: {
        owner: 'Owner',
        manager: 'Manager',
        staff: 'Staff',
        receptionist: 'Receptionist'
      }
    };

    // Mock API response
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: mockSettings
      })
    });

    const result = await StaffPrivacyService.getStaffPrivacySettings();
    expect(result).toEqual(mockSettings);
  });

  test('should update staff privacy settings', async () => {
    const updateData = {
      hideStaffNames: true,
      staffDisplayMode: 'GENERIC' as const,
      customStaffLabels: {
        owner: 'Hasan',
        manager: 'Manager',
        staff: 'Staff',
        receptionist: 'Receptionist'
      }
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: updateData
      })
    });

    const result = await StaffPrivacyService.updateStaffPrivacySettings(updateData);
    expect(result).toEqual(updateData);
  });
});
```

### 2. Integration Tests

```typescript
// tests/components/StaffSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StaffSelector } from '../../components/StaffSelector';

const mockStaff = [
  {
    id: 'staff_1',
    role: 'OWNER',
    user: {
      id: 'user_1',
      firstName: null,
      lastName: null,
      avatar: null
    },
    displayName: 'Hasan'
  },
  {
    id: 'staff_2',
    role: 'STAFF',
    user: {
      id: 'user_2',
      firstName: 'Ayşe',
      lastName: 'Demir',
      avatar: null
    }
  }
];

describe('StaffSelector', () => {
  test('should display staff with privacy settings applied', () => {
    render(
      <StaffSelector
        businessId="business_1"
        onStaffSelect={jest.fn()}
      />
    );

    // Mock the API response
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: { staff: mockStaff }
      })
    });

    // Check that privacy-enabled staff shows displayName
    expect(screen.getByText('Hasan')).toBeInTheDocument();
    
    // Check that non-privacy staff shows actual name
    expect(screen.getByText('Ayşe Demir')).toBeInTheDocument();
  });
});
```

## Migration Guide

### For Existing Applications

1. **Add New API Calls**: Implement the staff privacy service methods
2. **Update Staff Display Logic**: Modify existing staff selection components
3. **Add Settings UI**: Create the privacy settings page for business owners
4. **Test Thoroughly**: Ensure all customer-facing staff displays work correctly

### Backward Compatibility

- Existing businesses will continue to show staff names by default
- No breaking changes to existing API responses
- New `displayName` field is optional and only present when privacy is enabled

## Conclusion

The Staff Privacy feature provides a flexible way for business owners to protect their staff's privacy while maintaining a good customer experience. The implementation is straightforward and can be easily integrated into existing appointment booking systems.

For any questions or issues, please refer to the API documentation or contact the development team.
