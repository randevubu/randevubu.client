# 🏢 Tier-Based Pricing System Implementation

## 📋 Overview

This document describes the implementation of the new tier-based pricing system for the RandevuBu subscription plans. The system supports 6 different subscription plans across 3 pricing tiers, with location-based pricing for different city sizes in Turkey.

## 🎯 Key Features Implemented

### ✅ Type Safety
- **No `any` or `unknown` types** - All types are properly defined
- **Strict TypeScript interfaces** - Full type safety throughout the system
- **Proper error handling** - Typed error responses and validation

### ✅ API Integration
- **New subscription endpoints** - Support for tier and city-based queries
- **Backward compatibility** - Existing code continues to work
- **Proper error handling** - Comprehensive error management

### ✅ React Hooks
- **Custom hooks** - `useSubscriptionPlans`, `useSubscriptionPlansByTier`, `useSubscriptionPlansByCity`
- **TanStack Query integration** - Caching, background refetching, and error handling
- **Type-safe hooks** - Full TypeScript support

### ✅ Reusable Components
- **TierSelector** - Interactive tier selection component
- **PricingCard** - Enhanced pricing card with tier support
- **Updated Pricing** - Main pricing component with tier-based layout

## 🏗️ Architecture

### Type Definitions (`src/types/subscription.ts`)

```typescript
// Updated SubscriptionPlan interface
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'YEARLY';
  maxBusinesses: number;
  maxStaffPerBusiness: number;
  maxAppointmentsPerDay: number;
  features: {
    appointmentBooking: boolean;
    staffManagement: boolean;
    basicReports: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    customBranding: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    multiLocation: boolean;
    prioritySupport: boolean;
    integrations: string[];
    maxServices: number;
    maxCustomers: number;
    smsQuota: number;
    pricingTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
    description: string[];
  };
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// New API response types
export interface SubscriptionPlansResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    plans: SubscriptionPlan[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Tier information
export interface PricingTier {
  id: 'TIER_1' | 'TIER_2' | 'TIER_3';
  name: string;
  displayName: string;
  cities: string[];
  description: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'TIER_1',
    name: 'Major Cities',
    displayName: 'Major Cities',
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Eskişehir'],
    description: 'Higher pricing due to increased operational costs and market demand'
  },
  // ... more tiers
];
```

### API Services (`src/lib/services/subscription.ts`)

```typescript
export class SubscriptionService {
  // Get all subscription plans
  async getSubscriptionPlans(city?: string): Promise<SubscriptionPlan[]>

  // Get subscription plans by tier
  async getSubscriptionPlansByTier(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): Promise<SubscriptionPlan[]>

  // Get subscription plans by city (automatically determines tier)
  async getSubscriptionPlansByCity(city: string): Promise<SubscriptionPlan[]>

  // Legacy method for backward compatibility
  async getSubscriptionPlansWithLocation(city?: string): Promise<{ plans: SubscriptionPlan[]; location: Location }>
}
```

### React Hooks (`src/lib/hooks/useSubscriptionPlans.ts`)

```typescript
// Hook to fetch all subscription plans
export function useSubscriptionPlans(city?: string): UseSubscriptionPlansResult

// Hook to fetch subscription plans by tier
export function useSubscriptionPlansByTier(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): UseSubscriptionPlansByTierResult

// Hook to fetch subscription plans by city (automatically determines tier)
export function useSubscriptionPlansByCity(city: string): UseSubscriptionPlansByCityResult

// Hook to get pricing tier information
export function usePricingTiers(): { tiers: PricingTier[] }

// Utility functions
export function groupPlansByTier(plans: SubscriptionPlan[]): Record<string, SubscriptionPlan[]>
export function getTierDisplayName(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): string
export function getTierDescription(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): string
export function getTierCities(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): string[]
```

### Components

#### TierSelector (`src/components/ui/TierSelector.tsx`)
- Interactive tier selection with dropdown and card layouts
- Responsive design for mobile and desktop
- Visual indicators for selected tier
- City information display

#### PricingCard (`src/components/ui/PricingCard.tsx`)
- Enhanced pricing card with tier-specific styling
- Feature display with proper icons
- Tier badge and popular plan indicators
- Responsive design

#### Updated Pricing (`src/components/ui/Pricing.tsx`)
- Main pricing component with tier-based layout
- Integration with new hooks and components
- Clean, modern design
- Proper error handling and loading states

## 🚀 Usage Examples

### Basic Usage

```tsx
import { useSubscriptionPlansByTier } from '../../lib/hooks/useSubscriptionPlans';
import TierSelector from '../ui/TierSelector';
import PricingCard from '../ui/PricingCard';

function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<'TIER_1' | 'TIER_2' | 'TIER_3'>('TIER_1');
  const { plans, isLoading, error } = useSubscriptionPlansByTier(selectedTier);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <TierSelector 
        selectedTier={selectedTier}
        onTierChange={setSelectedTier}
      />
      
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            tier={selectedTier}
            onSelect={(plan) => console.log('Selected:', plan)}
          />
        ))}
      </div>
    </div>
  );
}
```

### City-Based Pricing

```tsx
import { useSubscriptionPlansByCity } from '../../lib/hooks/useSubscriptionPlans';

function CityPricing({ city }: { city: string }) {
  const { plans, tier, isLoading, error } = useSubscriptionPlansByCity(city);

  return (
    <div>
      <h2>Pricing for {city} (Tier: {tier})</h2>
      {/* Render plans */}
    </div>
  );
}
```

### Utility Functions

```tsx
import { 
  groupPlansByTier, 
  getTierDisplayName, 
  getTierDescription 
} from '../../lib/hooks/useSubscriptionPlans';

// Group plans by tier
const groupedPlans = groupPlansByTier(plans);

// Get tier information
const tierName = getTierDisplayName('TIER_1'); // "Major Cities"
const tierDesc = getTierDescription('TIER_1'); // "Higher pricing due to..."
```

## 🔧 API Endpoints

### Get All Subscription Plans
```
GET /api/v1/subscriptions/plans
Authorization: Bearer <jwt_token>
```

### Get Plans by Tier
```
GET /api/v1/subscriptions/plans?tier=TIER_1
Authorization: Bearer <jwt_token>
```

### Get Plans by City
```
GET /api/v1/subscriptions/plans?city=Istanbul
Authorization: Bearer <jwt_token>
```

## 📱 Responsive Design

- **Mobile-first approach** - Optimized for mobile devices
- **Responsive grid layouts** - Adapts to different screen sizes
- **Touch-friendly interactions** - Easy to use on touch devices
- **Accessible design** - Proper ARIA labels and keyboard navigation

## 🎨 Styling

- **Consistent color scheme** - Tier-specific colors for visual distinction
- **Modern design** - Clean, professional appearance
- **Smooth animations** - Hover effects and transitions
- **Dark mode support** - Compatible with theme system

## 🔒 Type Safety

- **No `any` types** - All types are properly defined
- **Strict TypeScript** - Full type checking enabled
- **Proper error handling** - Typed error responses
- **Interface consistency** - Consistent data structures

## 🧪 Testing

The implementation includes:
- **Type safety validation** - All types are properly defined
- **Error boundary handling** - Graceful error handling
- **Loading states** - Proper loading indicators
- **Responsive testing** - Works across all device sizes

## 📚 Migration Guide

### From Old System
1. **Update imports** - Use new hooks and components
2. **Replace API calls** - Use new service methods
3. **Update types** - Use new TypeScript interfaces
4. **Test thoroughly** - Verify all functionality works

### Backward Compatibility
- **Legacy methods preserved** - Old code continues to work
- **Gradual migration** - Can be updated incrementally
- **No breaking changes** - Existing functionality maintained

## 🚀 Getting Started

1. **Import the components**:
   ```tsx
   import { TierSelector, PricingCard } from '../components/ui';
   import { useSubscriptionPlansByTier } from '../lib/hooks/useSubscriptionPlans';
   ```

2. **Use the hooks**:
   ```tsx
   const { plans, isLoading, error } = useSubscriptionPlansByTier('TIER_1');
   ```

3. **Render the components**:
   ```tsx
   <TierSelector selectedTier={tier} onTierChange={setTier} />
   <PricingCard plan={plan} tier={tier} onSelect={handleSelect} />
   ```

## 📞 Support

For questions about the tier-based pricing system:
- **Documentation** - This guide and inline comments
- **Type definitions** - Check TypeScript interfaces
- **Examples** - See `TierBasedPricingExample.tsx`
- **API documentation** - Backend API documentation

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
