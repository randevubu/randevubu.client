# Backend API Integration Supplement - Audit Report

**Date:** 2025-10-30
**Status:** 🔴 **CRITICAL ISSUES FOUND**
**Priority:** IMMEDIATE ACTION REQUIRED

---

## Executive Summary

Comprehensive audit of supplemental API endpoints (Sections 10-17) reveals **3 CRITICAL breaking issues**, **2 missing essential features**, and **multiple type mismatches** that require immediate attention.

### Severity Breakdown
- 🔴 **CRITICAL (Breaking):** 3 issues
- 🟡 **HIGH (Feature Missing):** 2 issues
- 🟢 **MEDIUM (Enhancement):** 9 issues
- **Total Issues:** 14 major findings

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. Discount Code Type Mismatch (BREAKING)
**Severity:** 🔴 CRITICAL - Runtime Error
**File:** `src/lib/services/discountCode.ts:6`

**Problem:**
```typescript
// Frontend sends:
discountType: 'PERCENTAGE' | 'FIXED'  // ❌ WRONG

// Backend expects:
type: 'PERCENTAGE' | 'FIXED_AMOUNT'  // ✅ CORRECT
```

**Impact:** API calls will fail when using fixed amount discounts

**Fix Required:**
```typescript
// discountCode.ts:3-18
export interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';  // ✅ Fixed
  value: number;  // Changed from discountValue
  maxUses: number | null;  // Changed from usageLimit
  timesUsed: number;  // Changed from usedCount
  expiresAt: string | null;  // Changed from validUntil
  isActive: boolean;
  applicablePlans: string[];  // ✅ Added
  minPurchaseAmount: number | null;  // ✅ Added
  maxDiscountAmount: number | null;  // ✅ Added
  createdAt: string;
  updatedAt: string;
}
```

---

### 2. Daily Notebook Wrong Endpoint Pattern
**Severity:** 🔴 CRITICAL - Wrong API
**File:** `src/lib/services/dailyNotebook.ts`

**Problem:**
- **Documentation says:** `/api/v1/daily-notebook/businesses/:businessId/entries`
- **Frontend uses:** `/api/v1/businesses/:businessId/daily-notebook/:year/:month`

**Impact:** May be calling non-existent endpoints or using wrong data structure

**Action Required:**
1. Verify with backend team which pattern is correct
2. Update frontend OR documentation to match

---

### 3. Missing Public Available Slots Endpoint
**Severity:** 🔴 CRITICAL - Essential Feature
**File:** NOT IMPLEMENTED

**Problem:** The booking flow requires customers to see available time slots, but this endpoint is completely missing from frontend.

**Documentation:** `GET /api/v1/public/businesses/:businessId/available-slots`

**Required Implementation:**
```typescript
// Add to business.ts or create bookings.ts
getAvailableSlots: async (businessId: string, params: {
  date: string;  // YYYY-MM-DD
  serviceId: string;
  staffId?: string;
}) => {
  const queryParams = new URLSearchParams({
    date: params.date,
    serviceId: params.serviceId,
    ...(params.staffId && { staffId: params.staffId })
  });

  const response = await apiClient.get(
    `/api/v1/public/businesses/${businessId}/available-slots?${queryParams}`
  );
  return response.data;
}
```

**Impact:** **Customers cannot book appointments** - blocking feature!

---

## 🟡 HIGH PRIORITY ISSUES

### 4. Payment Methods Not Implemented
**Severity:** 🟡 HIGH - Missing Feature
**Files:** NOT IMPLEMENTED

**Missing Endpoints:**
- `POST /api/v1/payment-methods/businesses/:businessId` - Add card
- `GET /api/v1/payment-methods/businesses/:businessId` - List cards
- `PATCH /api/v1/payment-methods/:id/set-default` - Set default card
- `DELETE /api/v1/payment-methods/:id` - Remove card

**Missing Type:**
```typescript
// Add to src/types/payment.ts
export interface StoredPaymentMethod {
  id: string;
  businessId: string;
  cardHolderName: string;
  lastFourDigits: string;
  cardBrand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Impact:**
- Users cannot save cards for future use
- Auto-renewal subscriptions may not work properly
- Poor user experience (re-entering card details)

---

### 5. Missing Public Business Details Endpoint
**Severity:** 🟡 HIGH - Wrong Data Structure
**File:** `src/lib/services/business.ts`

**Problem:** Using authenticated endpoint for public business pages

**Required:** `GET /api/v1/public/businesses/:businessId`

**Impact:** Public business profile pages may not work for non-authenticated users

---

## 🟢 MEDIUM PRIORITY ISSUES

### 6. Contact Form Field Name Mismatch
**File:** `src/lib/services/contact.ts:5`

**Problem:**
```typescript
// Frontend:
phone: string;  // Required

// Backend expects:
phoneNumber?: string;  // Optional
```

**Fix:**
```typescript
export interface ContactFormData {
  name: string;
  email: string;
  phoneNumber?: string;  // ✅ Fixed
  subject: string;
  message: string;
}
```

---

### 7. Business Types Missing Features
**File:** `src/lib/services/business.ts:263-266`

**Missing Endpoints:**
- `/api/v1/business-types/grouped` - Get types grouped by category
- `/api/v1/business-types/categories` - List all categories
- `/api/v1/business-types/with-count` - Get types with business counts
- `/api/v1/business-types/category/:category` - Filter by category
- `/api/v1/business-types/:id` - Get single type

**Missing Query Parameter:**
- `includeInactive?: boolean` for admin use

---

### 8. Business Types Date Type Mismatch
**File:** `src/types/business.ts:3-13`

**Problem:**
```typescript
// Frontend uses:
createdAt: Date;
updatedAt: Date;

// Backend sends:
createdAt: string;  // ISO 8601
updatedAt: string;  // ISO 8601
```

**Fix:** Change to `string` or document conversion strategy

---

### 9. Business Closures Missing Enum Values
**File:** `src/lib/services/business.ts:296`

**Problem:**
```typescript
// Hardcoded union (line 296):
type?: 'VACATION' | 'MAINTENANCE' | 'EMERGENCY' | 'OTHER';
// Missing: 'HOLIDAY' | 'STAFF_SHORTAGE'

// Should use enum from enums.ts:
type?: ClosureType;  // ✅ Has all 6 values
```

---

### 10. Business Closures Missing Specialized Endpoints
**File:** `src/lib/services/business.ts`

**Missing:**
- `GET /api/v1/closures/business/:businessId/check` - Public closure check
- `POST /api/v1/closures/my/emergency` - Quick emergency closure
- `POST /api/v1/closures/my/maintenance` - Quick maintenance closure
- `GET /api/v1/closures/business/:businessId/analytics` - Closure analytics

---

### 11. Ratings Response Structure Mismatch
**File:** Type definitions for ratings

**Issues:**
- Missing `ratingDistribution` field in response type
- Uses `pagination` object instead of `meta` as per docs
- Has extra `message` field not in docs

**Backend:**
```typescript
{
  data: {
    ratings: [...],
    averageRating: number,
    totalRatings: number,
    ratingDistribution: { 1: n, 2: n, 3: n, 4: n, 5: n }  // ❌ Missing
  },
  meta: { page, totalPages, total }  // ⚠️ Called 'pagination' in frontend
}
```

---

### 12. Missing Discount Code Admin Endpoints
**File:** `src/lib/services/discountCode.ts`

**Missing (Admin Only):**
- `POST /api/v1/discount-codes` - Create code
- `GET /api/v1/discount-codes` - List all codes
- `GET /api/v1/discount-codes/statistics` - Get stats
- `POST /api/v1/discount-codes/bulk` - Generate bulk codes
- `PATCH /api/v1/discount-codes/:id/deactivate` - Deactivate
- `GET /api/v1/discount-codes/:id/usage` - Usage history

**Impact:** Admin panel cannot manage discount codes

---

### 13. Ratings Missing Cache Refresh
**File:** `src/lib/services/ratings.ts`

**Missing:** `POST /api/v1/businesses/:businessId/ratings/refresh-cache`

**Impact:** Minor - rating aggregates may be stale

---

### 14. Discount Code Extra Frontend Fields
**File:** `src/lib/services/discountCode.ts:3-18`

**Problem:** Frontend has fields that don't exist in backend:
- `isRecurring`
- `maxRecurringUses`
- `validFrom`
- `metadata`

**Impact:** These fields will be undefined when receiving backend data

---

## Implementation Priority

### Phase 1: CRITICAL (Do First - This Week)
1. ✅ Fix discount code type mismatch
2. ✅ Implement public available slots endpoint
3. ✅ Verify daily notebook endpoint pattern
4. ✅ Fix contact form field name

**Estimated Time:** 4-6 hours

### Phase 2: HIGH (Next Sprint)
5. ✅ Implement payment methods management
6. ✅ Implement public business details endpoint
7. ✅ Fix business closures enum usage

**Estimated Time:** 1-2 days

### Phase 3: MEDIUM (Future Enhancement)
8. ✅ Add business types advanced endpoints
9. ✅ Add business closures specialized endpoints
10. ✅ Fix all type mismatches (Date vs string)
11. ✅ Add missing ratings fields
12. ✅ Implement discount code admin endpoints

**Estimated Time:** 2-3 days

---

## Testing Checklist

### Critical Flow Tests
- [ ] Discount code validation with fixed amount
- [ ] Customer booking with available slots
- [ ] Daily notebook CRUD operations
- [ ] Contact form submission

### High Priority Tests
- [ ] Add/remove payment methods
- [ ] Set default payment method
- [ ] View public business page (not logged in)
- [ ] Subscription auto-renewal with saved card

### Integration Tests
- [ ] Business types dropdown population
- [ ] Closure creation with all types
- [ ] Rating submission and display
- [ ] Admin discount code management

---

## Files Requiring Changes

### Immediate Changes (Critical):
1. `src/lib/services/discountCode.ts` - Lines 3-18, 64-78
2. `src/lib/services/business.ts` - Add available slots endpoint
3. `src/lib/services/dailyNotebook.ts` - Verify endpoints
4. `src/lib/services/contact.ts` - Line 5

### High Priority:
5. `src/lib/services/payments.ts` - Add payment methods
6. `src/types/payment.ts` - Add StoredPaymentMethod type
7. `src/lib/services/business.ts` - Add public business endpoint

### Medium Priority:
8. `src/types/business.ts` - Fix Date types
9. `src/types/rating.ts` - Add ratingDistribution
10. `src/lib/services/business.ts` - Line 296 enum fix

---

## Backend Verification Needed

Please confirm with backend team:

1. **Daily Notebook Endpoints**
   - Which pattern is correct?
   - `/api/v1/daily-notebook/businesses/:businessId/entries` (docs)
   - `/api/v1/businesses/:businessId/daily-notebook/:year/:month` (current)

2. **Discount Code Fields**
   - Are `isRecurring`, `maxRecurringUses`, `validFrom`, `metadata` supported?
   - Or should frontend remove these fields?

3. **Payment Methods**
   - Are these endpoints fully implemented on backend?
   - Any additional validation requirements?

---

## Success Metrics

**Before Fixes:**
- 🔴 3 Breaking Issues
- 🟡 2 Missing Critical Features
- 🟢 9 Enhancement Gaps
- ❌ 0% Critical API Coverage

**After Phase 1 (Critical):**
- ✅ 0 Breaking Issues
- ✅ Core booking flow works
- ✅ Discount codes functional
- ✅ 60% Critical API Coverage

**After Phase 2 (High Priority):**
- ✅ Payment management complete
- ✅ Public pages functional
- ✅ 85% Critical API Coverage

**After Phase 3 (Full Implementation):**
- ✅ All documented endpoints implemented
- ✅ Full type safety
- ✅ 100% API Coverage

---

## Risk Assessment

### Without Fixes:
- **High:** Booking flow broken (no available slots)
- **High:** Discount codes failing (type mismatch)
- **High:** Subscription auto-renewal issues (no payment methods)
- **Medium:** Public pages may not work for anonymous users
- **Low:** Admin features incomplete

### With Phase 1 Fixes:
- **Low:** Core functionality stable
- **Medium:** Missing some user convenience features
- **Low:** Admin panel incomplete

---

**Report Status:** ✅ COMPLETE
**Next Action:** Review with team and prioritize fixes
**Related Document:** `FRONTEND_FIXES_SUMMARY.md` (previous fixes completed)
