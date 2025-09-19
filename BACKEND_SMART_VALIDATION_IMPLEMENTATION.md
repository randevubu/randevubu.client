# Backend Smart Validation Implementation Guide

## Problem Summary

The current backend validation for business notification settings requires complete state objects, preventing the frontend from sending partial updates like `{pushEnabled: false}`. This causes validation errors when users try to disable a single channel while keeping others enabled.

**Current Error:**
```json
{
  "success": false,
  "error": {
    "message": "Body validation failed: All selected reminder channels must be enabled",
    "code": "VALIDATION_ERROR",
    "requestId": "51p7uo",
    "details": {
      "field": "reminderChannels",
      "suggestions": ["Please check your input and try again"]
    }
  }
}
```

**User Action:** Trying to disable Push notifications while keeping SMS enabled
**Payload:** `{pushEnabled: false}`
**Expected Behavior:** Push should be disabled and removed from `reminderChannels`, SMS should remain active

## Solution: Smart Validation with Auto-Sync

Implement smart validation middleware that:
1. Accepts partial updates from frontend
2. Fetches current settings from database
3. Merges partial updates with existing settings
4. Auto-syncs `reminderChannels` with enabled channel toggles
5. Validates the final merged state

## Required Backend Changes

### 1. Create Smart Validation Middleware

**File:** `src/middleware/notificationValidation.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma'; // Adjust import path as needed

export interface NotificationSettingsRequest extends Request {
  body: {
    enableAppointmentReminders?: boolean;
    reminderChannels?: string[];
    reminderTiming?: number[];
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    quietHours?: {
      start: string;
      end: string;
    } | null;
    timezone?: string;
  };
}

/**
 * Smart validation middleware for business notification settings
 */
export const smartNotificationValidation = async (
  req: NotificationSettingsRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract business ID from request (adjust based on your auth middleware)
    const businessId = req.user?.businessId || req.businessId;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Business ID is required',
          code: 'MISSING_BUSINESS_ID',
          details: {
            field: 'businessId',
            suggestions: ['Ensure user is authenticated and has a business']
          }
        }
      });
    }

    // Fetch current settings for smart validation
    const currentSettings = await prisma.businessNotificationSettings.findUnique({
      where: { businessId },
      select: {
        enableAppointmentReminders: true,
        reminderChannels: true,
        reminderTiming: true,
        smsEnabled: true,
        pushEnabled: true,
        emailEnabled: true,
        quietHours: true,
        timezone: true
      }
    });

    // If no settings exist, create default settings first
    if (!currentSettings) {
      const defaultSettings = {
        businessId,
        enableAppointmentReminders: true,
        reminderChannels: ['PUSH'],
        reminderTiming: [60], // 1 hour before
        smsEnabled: false,
        pushEnabled: true,
        emailEnabled: false,
        quietHours: null,
        timezone: 'Europe/Istanbul'
      };

      await prisma.businessNotificationSettings.create({
        data: defaultSettings
      });

      // Use default settings for merging
      Object.assign(currentSettings, defaultSettings);
    }

    // Merge current settings with incoming updates
    const mergedSettings = {
      ...currentSettings,
      ...req.body
    };

    // Smart validation: Auto-sync reminder channels with enabled channels
    const enabledChannels: string[] = [];

    if (mergedSettings.smsEnabled) {
      enabledChannels.push('SMS');
    }
    if (mergedSettings.pushEnabled) {
      enabledChannels.push('PUSH');
    }
    if (mergedSettings.emailEnabled) {
      enabledChannels.push('EMAIL');
    }

    // Auto-sync: ensure all enabled channels are in reminderChannels
    const currentReminderChannels = mergedSettings.reminderChannels || [];
    const syncedReminderChannels = [...new Set([
      ...currentReminderChannels,
      ...enabledChannels
    ])];

    // Remove disabled channels from reminderChannels
    const finalReminderChannels = syncedReminderChannels.filter(channel => {
      switch (channel) {
        case 'SMS':
          return mergedSettings.smsEnabled;
        case 'PUSH':
          return mergedSettings.pushEnabled;
        case 'EMAIL':
          return mergedSettings.emailEnabled;
        default:
          return true; // Keep unknown channels (future-proofing)
      }
    });

    // Business rule validation
    if (mergedSettings.enableAppointmentReminders && finalReminderChannels.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least one notification channel must be enabled when appointment reminders are active',
          code: 'VALIDATION_ERROR',
          details: {
            field: 'reminderChannels',
            suggestions: [
              'Enable at least one channel (SMS, PUSH, or EMAIL)',
              'Or disable appointment reminders first'
            ]
          }
        }
      });
    }

    // Update request body with validated and synced data
    req.body = {
      ...req.body,
      reminderChannels: finalReminderChannels
    };

    // Store merged settings for use in route handler
    req.mergedSettings = mergedSettings;
    req.syncedReminderChannels = finalReminderChannels;

    next();
  } catch (error) {
    console.error('Smart notification validation error:', error);

    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during validation',
        code: 'INTERNAL_ERROR',
        details: {
          suggestions: ['Please try again later or contact support']
        }
      }
    });
  }
};

// Extend Request interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      mergedSettings?: any;
      syncedReminderChannels?: string[];
      businessId?: string;
      user?: {
        businessId?: string;
        [key: string]: any;
      };
    }
  }
}
```

### 2. Update Validation Schemas

**File:** `src/schemas/business.schemas.ts`

Add a new partial update schema alongside your existing complete schema:

```typescript
import { z } from 'zod';

// Keep your existing complete schema
export const businessNotificationSettingsSchema = z.object({
  enableAppointmentReminders: z.boolean().default(true),
  reminderChannels: z.array(z.enum(['SMS', 'PUSH', 'EMAIL']))
    .min(1, 'At least one reminder channel must be selected')
    .max(3, 'Maximum 3 reminder channels allowed')
    .optional()
    .default(['PUSH']),
  reminderTiming: z.array(z.number().positive())
    .min(1, 'At least one reminder timing must be selected')
    .optional()
    .default([60]),
  smsEnabled: z.boolean().optional().default(false),
  pushEnabled: z.boolean().optional().default(true),
  emailEnabled: z.boolean().optional().default(false),
  quietHours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }).nullable().optional(),
  timezone: z.string().optional().default('Europe/Istanbul')
});

// NEW: Add partial update schema (all fields optional)
export const updateBusinessNotificationSettingsSchema = z.object({
  enableAppointmentReminders: z.boolean().optional(),
  reminderChannels: z.array(z.enum(['SMS', 'PUSH', 'EMAIL']))
    .max(3, 'Maximum 3 reminder channels allowed')
    .optional(),
  reminderTiming: z.array(z.number().positive())
    .max(6, 'Maximum 6 reminder timings allowed')
    .optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  quietHours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
  }).nullable().optional(),
  timezone: z.string().optional()
}).strict(); // Prevent unknown fields

export type UpdateBusinessNotificationSettings = z.infer<typeof updateBusinessNotificationSettingsSchema>;
```

### 3. Update API Routes

**File:** `src/routes/v1/businesses.ts` (or wherever your notification settings route is)

```typescript
import { smartNotificationValidation } from '../middleware/notificationValidation';
import {
  updateBusinessNotificationSettingsSchema,
  validateBody
} from '../schemas/business.schemas';

// Update your PUT endpoint to use the new schema and middleware
router.put('/my-business/notification-settings',
  requireBusinessAccess, // Your existing auth middleware
  validateBody(updateBusinessNotificationSettingsSchema), // Use partial update schema
  smartNotificationValidation, // Add smart validation middleware
  businessController.updateNotificationSettings.bind(businessController)
);
```

### 4. Update Business Service/Controller

**File:** `src/services/businessService.ts` (or controller file)

Update your notification settings update method:

```typescript
async updateBusinessNotificationSettings(userId: string, businessId: string, data: UpdateBusinessNotificationSettings) {
  try {
    // The smart validation middleware has already:
    // 1. Merged current settings with updates
    // 2. Auto-synced reminderChannels
    // 3. Validated the final state

    // Simply update with the validated data
    const updatedSettings = await prisma.businessNotificationSettings.upsert({
      where: { businessId },
      update: data,
      create: {
        businessId,
        enableAppointmentReminders: data.enableAppointmentReminders ?? true,
        reminderChannels: data.reminderChannels ?? ['PUSH'],
        reminderTiming: data.reminderTiming ?? [60],
        smsEnabled: data.smsEnabled ?? false,
        pushEnabled: data.pushEnabled ?? true,
        emailEnabled: data.emailEnabled ?? false,
        quietHours: data.quietHours ?? null,
        timezone: data.timezone ?? 'Europe/Istanbul'
      }
    });

    return {
      success: true,
      data: updatedSettings
    };
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}
```

### 5. Import and Setup

Make sure to import the new middleware and schema in your route files:

```typescript
// In your routes file
import { smartNotificationValidation } from '../middleware/notificationValidation';
import {
  updateBusinessNotificationSettingsSchema,
  validateBody
} from '../schemas/business.schemas';
```

## How It Works

### Example 1: Disable Push Notifications

**Frontend Request:**
```json
PUT /api/v1/businesses/my-business/notification-settings
{
  "pushEnabled": false
}
```

**Backend Process:**
1. Middleware fetches current settings: `{reminderChannels: ["SMS", "PUSH"], pushEnabled: true, smsEnabled: true}`
2. Merges with request: `{reminderChannels: ["SMS", "PUSH"], pushEnabled: false, smsEnabled: true}`
3. Auto-syncs channels: Removes PUSH from reminderChannels since `pushEnabled: false`
4. Final result: `{reminderChannels: ["SMS"], pushEnabled: false, smsEnabled: true}`
5. Updates database with synced data

**Response:**
```json
{
  "success": true,
  "data": {
    "reminderChannels": ["SMS"],
    "pushEnabled": false,
    "smsEnabled": true,
    // ... other fields
  }
}
```

### Example 2: Enable SMS Notifications

**Frontend Request:**
```json
PUT /api/v1/businesses/my-business/notification-settings
{
  "smsEnabled": true
}
```

**Backend Process:**
1. Current: `{reminderChannels: ["PUSH"], smsEnabled: false}`
2. Merged: `{reminderChannels: ["PUSH"], smsEnabled: true}`
3. Auto-sync: Adds SMS to reminderChannels since `smsEnabled: true`
4. Result: `{reminderChannels: ["PUSH", "SMS"], smsEnabled: true}`

## Testing the Implementation

After implementing the backend changes, you can test with:

```bash
# Test disabling push notifications
curl -X PUT http://localhost:3001/api/v1/businesses/my-business/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pushEnabled": false}'

# Test enabling SMS
curl -X PUT http://localhost:3001/api/v1/businesses/my-business/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"smsEnabled": true}'
```

## Frontend Changes (Already Implemented)

The frontend has been updated with a **temporary workaround** that manually syncs `reminderChannels` before sending to the backend. Once you implement the backend changes above, you can remove this workaround from:

**File:** `src/components/features/BusinessNotificationSettings.tsx`
- Lines 66-105: Remove the temporary auto-sync logic
- Keep only: `const response = await businessService.updateBusinessNotificationSettings(updates);`

## Benefits After Implementation

✅ **Frontend can send minimal payloads** (e.g., `{pushEnabled: false}`)
✅ **Automatic data consistency** - no more mismatched states
✅ **Better user experience** - no validation errors for valid actions
✅ **Maintainable code** - business logic centralized in backend
✅ **Future-proof** - handles edge cases and concurrent updates

## Migration Strategy

1. **Deploy backend changes** above
2. **Test with current frontend** (should work with workaround)
3. **Remove frontend workaround** (optional, for cleaner code)
4. **Celebrate** 🎉 - users can finally disable channels properly!