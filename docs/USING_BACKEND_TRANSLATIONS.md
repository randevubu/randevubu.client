# Using Backend Translations - Quick Guide

## Overview

The backend now automatically translates ALL messages (both success and error) based on the `Accept-Language` header. The frontend simply displays these translated messages directly.

**No frontend translation is needed for API messages!**

## How It Works

1. **Frontend sends request** with `Accept-Language` header (automatically set)
2. **Backend processes** and returns translated message
3. **Frontend displays** the message directly in toast notifications

## API Response Structure

### Success Response
```typescript
{
  success: true,
  statusCode: 201,
  key: "success.appointment.created", // Translation key (for reference)
  message: "Randevu başarıyla oluşturuldu", // ✅ Use this directly
  data: { ... }
}
```

### Error Response
```typescript
{
  success: false,
  statusCode: 400,
  error: {
    code: "VALIDATION_ERROR",
    key: "errors.validation.invalid", // Translation key (for reference)
    message: "Geçersiz veri girişi", // ✅ Use this directly
    requestId: "req-123"
  }
}
```

## Usage Examples

### Example 1: Create Appointment (with success message)

```typescript
import { apiClient } from '@/src/lib/api';
import { handleApiSuccess, handleApiError } from '@/src/lib/utils/toast';
import type { ApiResponse } from '@/src/types/api';

interface Appointment {
  id: string;
  date: string;
  time: string;
}

const createAppointment = async (appointmentData: object) => {
  try {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      '/api/v1/appointments',
      appointmentData
    );

    // Backend returns: { success: true, message: "Randevu başarıyla oluşturuldu", data: {...} }
    // This shows a toast with the translated message and returns the data
    const appointment = handleApiSuccess(response.data);

    return appointment;
  } catch (error) {
    // Backend returns: { success: false, error: { message: "Randevu oluşturulamadı" } }
    // This shows a toast with the translated error message
    handleApiError(error);
    throw error;
  }
};
```

### Example 2: Update Business Settings (silent success)

```typescript
const updateBusinessSettings = async (settings: object) => {
  try {
    const response = await apiClient.patch<ApiResponse<Business>>(
      '/api/v1/businesses/settings',
      settings
    );

    // Don't show toast, just return data
    const business = handleApiSuccess(response.data, {
      showToast: false
    });

    return business;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
```

### Example 3: Custom Success Message Override

```typescript
const deleteStaff = async (staffId: string) => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/v1/staff/${staffId}`
    );

    // Override backend message with custom message
    handleApiSuccess(response.data, {
      customMessage: 'Personel silindi ve tüm randevular iptal edildi'
    });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
```

### Example 4: React Query Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/src/lib/services/appointments';
import { handleApiSuccess, handleApiError } from '@/src/lib/utils/toast';

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      const response = await appointmentService.createAppointment(data);
      return response;
    },
    onSuccess: (response) => {
      // Show backend's translated success message
      handleApiSuccess(response);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      // Show backend's translated error message
      handleApiError(error);
    },
  });
}

// Usage in component
function AppointmentForm() {
  const createMutation = useCreateAppointment();

  const handleSubmit = async (data: CreateAppointmentData) => {
    createMutation.mutate(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example 5: Manual Toast Control

```typescript
import { showSuccessToast, showErrorToast } from '@/src/lib/utils/toast';

const complexOperation = async () => {
  try {
    const response1 = await apiClient.post('/api/v1/step1', data1);
    // Don't show toast yet
    handleApiSuccess(response1.data, { showToast: false });

    const response2 = await apiClient.post('/api/v1/step2', data2);
    // Don't show toast yet
    handleApiSuccess(response2.data, { showToast: false });

    // Show custom success message after all steps complete
    showSuccessToast('Tüm işlemler başarıyla tamamlandı');
  } catch (error) {
    // This will show the backend's error message
    handleApiError(error);
  }
};
```

## Best Practices

### ✅ DO

1. **Always use `handleApiSuccess()` for success responses**
   ```typescript
   const data = handleApiSuccess(response.data);
   ```

2. **Always use `handleApiError()` for error handling**
   ```typescript
   catch (error) {
     handleApiError(error);
   }
   ```

3. **Use proper TypeScript types**
   ```typescript
   const response = await apiClient.post<ApiResponse<User>>('/api/v1/users', data);
   ```

4. **Handle errors appropriately**
   ```typescript
   catch (error) {
     handleApiError(error);
     throw error; // Re-throw if needed by caller
   }
   ```

### ❌ DON'T

1. **Don't use frontend translation for API messages**
   ```typescript
   // ❌ BAD - Don't do this
   const message = t('appointment.created');

   // ✅ GOOD - Use backend message
   const message = response.data.message;
   ```

2. **Don't hardcode messages**
   ```typescript
   // ❌ BAD
   toast.success('Appointment created');

   // ✅ GOOD
   handleApiSuccess(response.data);
   ```

3. **Don't use `any` type**
   ```typescript
   // ❌ BAD
   const response: any = await apiClient.post(...);

   // ✅ GOOD
   const response = await apiClient.post<ApiResponse<Appointment>>(...);
   ```

4. **Don't ignore errors**
   ```typescript
   // ❌ BAD
   try {
     await apiClient.post(...);
   } catch (error) {
     // Silently ignored
   }

   // ✅ GOOD
   try {
     await apiClient.post(...);
   } catch (error) {
     handleApiError(error);
     throw error;
   }
   ```

## Language Synchronization

The `Accept-Language` header is automatically set based on the user's selected language in the app. No manual configuration needed!

**How it works:**
1. User changes language in the app (Turkish ↔ English)
2. `LocaleContext` updates the locale
3. API client automatically sets `Accept-Language: tr-TR,tr;q=0.9,en;q=0.8` (for Turkish)
4. Backend responds with messages in Turkish
5. Frontend displays messages directly

## Common Patterns

### Pattern 1: Form Submission
```typescript
const onSubmit = async (data: FormData) => {
  try {
    const response = await apiClient.post<ApiResponse<Result>>('/api/v1/resource', data);
    const result = handleApiSuccess(response.data);
    router.push('/success-page');
  } catch (error) {
    handleApiError(error);
  }
};
```

### Pattern 2: Delete Confirmation
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Silmek istediğinizden emin misiniz?')) return;

  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/v1/resource/${id}`);
    handleApiSuccess(response.data);
    refetch(); // Refresh data
  } catch (error) {
    handleApiError(error);
  }
};
```

### Pattern 3: Service Layer
```typescript
// src/lib/services/myService.ts
export const myService = {
  create: async (data: CreateData): Promise<ApiResponse<Result>> => {
    const response = await apiClient.post<ApiResponse<Result>>('/api/v1/resource', data);
    return response.data;
  },

  update: async (id: string, data: UpdateData): Promise<ApiResponse<Result>> => {
    const response = await apiClient.patch<ApiResponse<Result>>(`/api/v1/resource/${id}`, data);
    return response.data;
  },
};

// In component
const handleCreate = async (data: CreateData) => {
  try {
    const response = await myService.create(data);
    handleApiSuccess(response); // ✅ Show backend message
  } catch (error) {
    handleApiError(error); // ✅ Show backend error
  }
};
```

## Migration from Old Code

### Before (with frontend translation)
```typescript
// ❌ OLD WAY
try {
  await apiClient.post('/api/v1/appointments', data);
  toast.success(t('appointment.created')); // Frontend translation
} catch (error) {
  toast.error(t('errors.appointmentFailed')); // Frontend translation
}
```

### After (with backend translation)
```typescript
// ✅ NEW WAY
try {
  const response = await apiClient.post<ApiResponse<Appointment>>('/api/v1/appointments', data);
  handleApiSuccess(response.data); // Backend already translated
} catch (error) {
  handleApiError(error); // Backend already translated
}
```

## Summary

1. Backend translates all messages based on `Accept-Language` header
2. Use `handleApiSuccess()` for success messages
3. Use `handleApiError()` for error messages
4. No frontend translation needed for API messages
5. Always use proper TypeScript types
6. Language changes are handled automatically

---

**Questions?** Check `docs/FRONTEND_SUCCESS_MESSAGE_TRANSLATION.md` for detailed documentation.
