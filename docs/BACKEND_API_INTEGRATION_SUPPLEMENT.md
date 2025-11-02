# Backend API Integration - Missing Endpoints Supplement

> **ADD THIS TO THE MAIN INTEGRATION GUIDE** - These are critical endpoints that were missing from the initial documentation.

---

## Additional Endpoints Documentation

### 10. Business Types

**Endpoint Prefix**: `/api/v1/business-types`

#### 10.1 Get All Active Business Types (Public)

**Endpoint**: `GET /api/v1/business-types`

**Headers**: No authentication required

**Query Parameters**:
- `includeInactive?: boolean` (default: false, admin only)

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: Array<{
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    icon: string | null;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

#### 10.2 Get Business Types Grouped by Category

**Endpoint**: `GET /api/v1/business-types/grouped`

**Headers**: No authentication required

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: {
    [category: string]: Array<BusinessTypeData>;
  };
}
```

**Example**:
```json
{
  "success": true,
  "data": {
    "beauty": [
      {
        "id": "btype_1234567890",
        "name": "hair_salon",
        "displayName": "Kuaför",
        "description": "Profesyonel saç kesim, şekillendirme ve boyama hizmetleri",
        "icon": "scissors",
        "category": "beauty",
        "isActive": true
      }
    ],
    "healthcare": [
      {
        "id": "btype_1234567892",
        "name": "dental_clinic",
        "displayName": "Dental Clinic",
        "description": "Dental care and oral health services",
        "icon": "tooth",
        "category": "healthcare",
        "isActive": true
      }
    ]
  }
}
```

---

#### 10.3 Get Business Categories

**Endpoint**: `GET /api/v1/business-types/categories`

**Headers**: No authentication required

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: Array<{
    category: string;
    count: number; // Number of business types in this category
  }>;
}
```

---

#### 10.4 Get Business Types with Count

**Endpoint**: `GET /api/v1/business-types/with-count`

**Headers**: No authentication required

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: Array<BusinessTypeData & {
    businessCount: number; // Number of businesses using this type
  }>;
}
```

---

#### 10.5 Get Business Types by Category

**Endpoint**: `GET /api/v1/business-types/category/:category`

**Headers**: No authentication required

**URL Parameters**:
- `category: string` (e.g., "beauty", "healthcare")

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: BusinessTypeData[];
}
```

---

#### 10.6 Get Business Type by ID

**Endpoint**: `GET /api/v1/business-types/:id`

**Headers**: No authentication required

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: BusinessTypeData;
}
```

---

### 11. Business Closures

**Endpoint Prefix**: `/api/v1/closures`

#### 11.1 Check if Business is Closed (Public)

**Endpoint**: `GET /api/v1/closures/business/:businessId/check`

**Headers**: No authentication required

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    isClosed: boolean;
    closure?: {
      id: string;
      startDate: string;
      endDate: string | null;
      reason: string;
      type: "VACATION" | "MAINTENANCE" | "EMERGENCY" | "HOLIDAY" | "STAFF_SHORTAGE" | "OTHER";
    };
  };
}
```

**Cache**: Real-time cache (15 seconds)

---

#### 11.2 Create Business Closure

**Endpoint**: `POST /api/v1/closures/business/:businessId`

**Headers**: Requires Authentication + Business Management Permission

**Request Body**:
```typescript
{
  startDate: string; // YYYY-MM-DD or ISO 8601
  endDate?: string; // YYYY-MM-DD or ISO 8601
  reason: string; // Min 5, max 200 characters
  type: "VACATION" | "MAINTENANCE" | "EMERGENCY" | "HOLIDAY" | "STAFF_SHORTAGE" | "OTHER";
}
```

**Response** (201 Created):
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    businessId: string;
    startDate: string;
    endDate: string | null;
    reason: string;
    type: ClosureType;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

#### 11.3 Get My Business Closures

**Endpoint**: `GET /api/v1/closures/my`

**Headers**: Requires Authentication + Business Role

**Query Parameters**:
- `active?: "true" | "false" | "upcoming"`

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: BusinessClosureData[];
}
```

---

#### 11.4 Create Emergency Closure

**Endpoint**: `POST /api/v1/closures/my/emergency`

**Headers**: Requires Authentication + Business Management Permission

**Request Body**:
```typescript
{
  reason: string;
  endDate?: string; // Optional end date
}
```

**Response** (201 Created): Same as Create Closure

---

#### 11.5 Create Maintenance Closure

**Endpoint**: `POST /api/v1/closures/my/maintenance`

**Headers**: Requires Authentication + Business Management Permission

**Request Body**:
```typescript
{
  startDate: string;
  endDate: string;
  reason: string;
}
```

**Response** (201 Created): Same as Create Closure

---

#### 11.6 Get Closure Impact Preview

**Endpoint**: `POST /api/v1/closures/impact-preview`

**Headers**: Requires Authentication + Business Management Permission

**Request Body**:
```typescript
{
  businessId: string;
  startDate: string;
  endDate?: string;
  services?: string[]; // Optional array of service IDs
}
```

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    affectedAppointments: number;
    affectedCustomers: number;
    estimatedRevenueLoss: number;
    appointmentsByStatus: {
      CONFIRMED: number;
      PENDING: number;
    };
  };
}
```

---

#### 11.7 Create Enhanced Closure with Notifications

**Endpoint**: `POST /api/v1/closures/business/:businessId/enhanced`

**Headers**: Requires Authentication + Business Management Permission

**Request Body**:
```typescript
{
  startDate: string;
  endDate?: string;
  reason: string;
  type: ClosureType;
  notifyCustomers: boolean;
  notificationMessage?: string;
  notificationChannels: ("EMAIL" | "SMS" | "PUSH")[];
  affectedServices?: string[];
  isRecurring: boolean;
  recurringPattern?: {
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY";
    interval: number;
    endDate?: string;
  };
}
```

**Response** (201 Created):
```typescript
{
  success: boolean;
  message: string;
  data: {
    closure: BusinessClosureData;
    notificationsSent: number;
    affectedAppointments: number;
  };
}
```

---

#### 11.8 Get Closure Analytics

**Endpoint**: `GET /api/v1/closures/business/:businessId/analytics`

**Headers**: Requires Authentication + Analytics Permission

**Query Parameters**:
- `startDate: string` (YYYY-MM-DD, required)
- `endDate: string` (YYYY-MM-DD, required)

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    totalClosures: number;
    closuresByType: Record<ClosureType, number>;
    averageClosureDuration: number;
    totalClosureHours: number;
    affectedAppointments: number;
    estimatedRevenueLoss: number;
    customerImpact: {
      totalAffectedCustomers: number;
      notificationsSent: number;
      rescheduledAppointments: number;
      canceledAppointments: number;
    };
    monthlyTrend: Array<{
      month: string;
      year: number;
      closures: number;
      hours: number;
      revenue: number;
    }>;
  };
}
```

---

### 12. Discount Codes

**Endpoint Prefix**: `/api/v1/discount-codes`

#### 12.1 Validate Discount Code (Public)

**Endpoint**: `POST /api/v1/discount-codes/validate`

**Headers**: Requires Authentication

**Request Body**:
```typescript
{
  code: string;
  planId?: string;
  amount?: number;
}
```

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
    discountCode?: {
      id: string;
      code: string;
      type: "PERCENTAGE" | "FIXED_AMOUNT";
      value: number;
      maxUses: number | null;
      timesUsed: number;
      expiresAt: string | null;
      isActive: boolean;
      applicablePlans: string[];
      minPurchaseAmount: number | null;
      maxDiscountAmount: number | null;
    };
    discountAmount?: number;
    finalAmount?: number;
  };
}
```

---

#### 12.2 Create Discount Code (Admin)

**Endpoint**: `POST /api/v1/discount-codes`

**Headers**: Requires Authentication + Admin Role

**Request Body**:
```typescript
{
  code: string; // 3-20 characters, uppercase letters and numbers
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  maxUses?: number | null;
  expiresAt?: string | null; // ISO 8601
  isActive?: boolean;
  applicablePlans?: string[];
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
}
```

**Response** (201 Created):
```typescript
{
  success: boolean;
  message: string;
  data: DiscountCodeData;
}
```

---

#### 12.3 Get All Discount Codes (Admin)

**Endpoint**: `GET /api/v1/discount-codes`

**Headers**: Requires Authentication + Admin Role

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: DiscountCodeData[];
}
```

**Cache**: Static cache

---

#### 12.4 Get Discount Code Statistics (Admin)

**Endpoint**: `GET /api/v1/discount-codes/statistics`

**Headers**: Requires Authentication + Admin Role

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    totalCodes: number;
    activeCodes: number;
    expiredCodes: number;
    totalUses: number;
    totalDiscountAmount: number;
    codesByType: {
      PERCENTAGE: number;
      FIXED_AMOUNT: number;
    };
  };
}
```

**Cache**: Dynamic cache

---

#### 12.5 Generate Bulk Discount Codes (Admin)

**Endpoint**: `POST /api/v1/discount-codes/bulk`

**Headers**: Requires Authentication + Admin Role

**Request Body**:
```typescript
{
  prefix: string; // Code prefix
  count: number; // Number of codes to generate
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  applicablePlans?: string[];
}
```

**Response** (201 Created):
```typescript
{
  success: boolean;
  message: string;
  data: {
    codesGenerated: number;
    codes: string[];
  };
}
```

---

#### 12.6 Deactivate Discount Code (Admin)

**Endpoint**: `PATCH /api/v1/discount-codes/:id/deactivate`

**Headers**: Requires Authentication + Admin Role

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: DiscountCodeData;
}
```

---

#### 12.7 Get Discount Code Usage History (Admin)

**Endpoint**: `GET /api/v1/discount-codes/:id/usage`

**Headers**: Requires Authentication + Admin Role

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: Array<{
    id: string;
    discountCodeId: string;
    userId: string;
    subscriptionId: string | null;
    paymentId: string | null;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
    usedAt: string;
  }>;
}
```

**Cache**: Dynamic cache

---

### 13. Ratings & Reviews

**Endpoint Prefix**: `/api/v1`

#### 13.1 Submit Rating

**Endpoint**: `POST /api/v1/businesses/:businessId/ratings`

**Headers**: Requires Authentication

**Request Body**:
```typescript
{
  appointmentId: string;
  rating: number; // 1-5
  comment?: string;
  isAnonymous?: boolean; // Default: false
}
```

**Response** (201 Created):
```typescript
{
  success: boolean;
  message: string;
  data: {
    id: string;
    customerId: string;
    businessId: string;
    appointmentId: string;
    rating: number;
    comment: string | null;
    isAnonymous: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

#### 13.2 Get Business Ratings (Public)

**Endpoint**: `GET /api/v1/businesses/:businessId/ratings`

**Headers**: No authentication required

**Query Parameters**:
- `page?: number` (default: 1)
- `limit?: number` (default: 10, max: 100)

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    ratings: Array<{
      id: string;
      rating: number;
      comment: string | null;
      isAnonymous: boolean;
      createdAt: string;
      customer?: {
        id: string;
        firstName: string;
        lastName: string;
      };
    }>;
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  meta: {
    page: number;
    totalPages: number;
    total: number;
  };
}
```

---

#### 13.3 Check if User Can Rate

**Endpoint**: `GET /api/v1/businesses/:businessId/appointments/:appointmentId/can-rate`

**Headers**: Requires Authentication

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    canRate: boolean;
    reason?: string; // If cannot rate, explanation why
    existingRating?: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
    };
  };
}
```

---

#### 13.4 Get User's Rating for Appointment

**Endpoint**: `GET /api/v1/appointments/:appointmentId/rating`

**Headers**: Requires Authentication

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    id: string;
    rating: number;
    comment: string | null;
    isAnonymous: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
}
```

---

#### 13.5 Refresh Rating Cache

**Endpoint**: `POST /api/v1/businesses/:businessId/ratings/refresh-cache`

**Headers**: No authentication required (Internal/Admin)

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 14. Daily Notebook

**Endpoint Prefix**: `/api/v1/daily-notebook` (Based on imports in index.ts)

#### 14.1 Create Daily Notebook Entry

**Endpoint**: `POST /api/v1/daily-notebook/businesses/:businessId/entries`

**Headers**: Requires Authentication + Business Access

**Request Body**:
```typescript
{
  date: string; // YYYY-MM-DD
  notes: string;
  mood?: string;
  customData?: Record<string, any>;
}
```

**Response** (201 Created):
```typescript
{
  success: boolean;
  message: string;
  data: DailyNotebookEntryData;
}
```

---

#### 14.2 Get Daily Notebook Entries

**Endpoint**: `GET /api/v1/daily-notebook/businesses/:businessId/entries`

**Headers**: Requires Authentication + Business Access

**Query Parameters**:
- `startDate?: string` (YYYY-MM-DD)
- `endDate?: string` (YYYY-MM-DD)
- `page?: number`
- `limit?: number`

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: DailyNotebookEntryData[];
  meta: PaginationMeta;
}
```

---

### 15. Contact Form

**Endpoint Prefix**: `/api/v1/contact`

#### 15.1 Submit Contact Form

**Endpoint**: `POST /api/v1/contact`

**Headers**: No authentication required (Public)

**Request Body**:
```typescript
{
  name: string;
  email: string;
  subject: string;
  message: string;
  phoneNumber?: string;
}
```

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string; // "Contact form submitted successfully"
}
```

---

### 16. Payment Methods

**Endpoint Prefix**: `/api/v1/payment-methods`

#### 16.1 Add Payment Method

**Endpoint**: `POST /api/v1/payment-methods/businesses/:businessId`

**Headers**: Requires Authentication + Business Ownership

**Request Body**:
```typescript
{
  cardHolderName: string;
  cardNumber: string; // Will be tokenized
  expireMonth: string; // "01"-"12"
  expireYear: string; // "YYYY"
  cvc: string; // 3-4 digits
  isDefault?: boolean;
}
```

**Response** (201 Created):
```typescript
{
  success: boolean;
  message: string;
  data: {
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
  };
}
```

---

#### 16.2 Get Payment Methods

**Endpoint**: `GET /api/v1/payment-methods/businesses/:businessId`

**Headers**: Requires Authentication + Business Ownership

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: StoredPaymentMethodData[];
}
```

---

#### 16.3 Set Default Payment Method

**Endpoint**: `PATCH /api/v1/payment-methods/:id/set-default`

**Headers**: Requires Authentication + Business Ownership

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
  data: StoredPaymentMethodData;
}
```

---

#### 16.4 Delete Payment Method

**Endpoint**: `DELETE /api/v1/payment-methods/:id`

**Headers**: Requires Authentication + Business Ownership

**Response** (200 OK):
```typescript
{
  success: boolean;
  message: string;
}
```

---

### 17. Public Routes

**Endpoint Prefix**: `/api/v1/public`

#### 17.1 Get Public Business Details

**Endpoint**: `GET /api/v1/public/businesses/:businessId`

**Headers**: No authentication required

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    businessHours: BusinessHours | null;
    timezone: string;
    logoUrl: string | null;
    coverImageUrl: string | null;
    isVerified: boolean;
    isClosed: boolean;
    businessType: {
      id: string;
      name: string;
      displayName: string;
      icon: string | null;
      category: string;
    };
    services: PublicServiceData[];
    ratings: {
      averageRating: number;
      totalRatings: number;
    };
  };
}
```

---

#### 17.2 Get Available Time Slots (Public)

**Endpoint**: `GET /api/v1/public/businesses/:businessId/available-slots`

**Headers**: No authentication required

**Query Parameters**:
- `date: string` (YYYY-MM-DD, required)
- `serviceId: string` (required)
- `staffId?: string` (optional)

**Response** (200 OK):
```typescript
{
  success: boolean;
  data: {
    date: string;
    availableSlots: Array<{
      startTime: string; // "HH:MM"
      endTime: string; // "HH:MM"
      staffId: string;
      staffName?: string;
    }>;
    businessHours: {
      openTime: string;
      closeTime: string;
      breaks?: BreakPeriod[];
    };
  };
}
```

---

## Type Definitions for New Endpoints

### Additional Enums

```typescript
enum ClosureType {
  VACATION = "VACATION",
  MAINTENANCE = "MAINTENANCE",
  EMERGENCY = "EMERGENCY",
  HOLIDAY = "HOLIDAY",
  STAFF_SHORTAGE = "STAFF_SHORTAGE",
  OTHER = "OTHER"
}

enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT"
}
```

### Additional Types

```typescript
type BusinessClosureData = {
  id: string;
  businessId: string;
  startDate: string; // ISO 8601
  endDate: string | null; // ISO 8601
  reason: string;
  type: ClosureType;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type DiscountCodeData = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  maxUses: number | null;
  timesUsed: number;
  expiresAt: string | null;
  isActive: boolean;
  applicablePlans: string[];
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  createdAt: string;
  updatedAt: string;
};

type StoredPaymentMethodData = {
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
};

type PublicServiceData = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null; // Can be null if hideAllServicePrices is true
  currency: string;
  isActive: boolean;
  priceDisplayMessage?: string; // Custom message when price is hidden
};
```

---

## Important Notes

### Business Closures System
- Closures support **recurring patterns** (weekly, monthly, yearly)
- Enhanced closures automatically notify affected customers
- Impact preview shows estimated revenue loss and affected appointments
- Auto-reschedule feature can automatically move affected appointments

### Discount Codes
- Codes are **case-insensitive** during validation
- Can be **bulk-generated** for campaigns
- Support **percentage** or **fixed amount** discounts
- Can be restricted to specific subscription plans
- Admin-only endpoints except for validation

### Ratings System
- Users can only rate **completed appointments**
- One rating per appointment (no duplicates)
- Ratings can be **anonymous**
- Average rating automatically calculated and cached
- Public endpoint for viewing ratings (no auth required)

### Payment Methods
- Card details are **tokenized** (never stored raw)
- Support for **default payment method**
- Soft delete (isActive flag) for removed cards
- Used for auto-renewal of subscriptions

---

**CRITICAL**: All these endpoints should be tested for frontend integration. Priority endpoints that are likely used by frontend:

1. ✅ **Business Types** - For signup/business creation flow
2. ✅ **Public Business Details** - For customer-facing business pages
3. ✅ **Available Time Slots** - For booking widget
4. ✅ **Discount Code Validation** - For checkout flow
5. ✅ **Ratings** - For business profile pages
6. ✅ **Business Closures Check** - For booking availability
7. ✅ **Payment Methods** - For subscription management

---

**Document Version**: 1.1 (Supplement)
**Generated**: 2025-10-30
