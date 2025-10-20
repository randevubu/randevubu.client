'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscription';
import { SubscriptionPlan, PricingTier, PRICING_TIERS } from '../../types/subscription';

export interface UseSubscriptionPlansResult {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseSubscriptionPlansByTierResult {
  plans: SubscriptionPlan[];
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseSubscriptionPlansByCityResult {
  plans: SubscriptionPlan[];
  city: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch all subscription plans
 */
export function useSubscriptionPlans(city?: string): UseSubscriptionPlansResult {
  const queryResult: UseQueryResult<SubscriptionPlan[], Error> = useQuery({
    queryKey: ['subscription-plans', city],
    queryFn: () => subscriptionService.getSubscriptionPlans(city),
    staleTime: 10 * 60 * 1000, // 10 minutes - plans don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    plans: data || [],
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * Hook to fetch subscription plans by tier
 */
export function useSubscriptionPlansByTier(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): UseSubscriptionPlansByTierResult {
  const queryResult: UseQueryResult<SubscriptionPlan[], Error> = useQuery({
    queryKey: ['subscription-plans-by-tier', tier],
    queryFn: () => subscriptionService.getSubscriptionPlansByTier(tier),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    plans: data || [],
    tier,
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * Hook to fetch subscription plans by city (automatically determines tier)
 */
export function useSubscriptionPlansByCity(city: string): UseSubscriptionPlansByCityResult {
  const queryResult: UseQueryResult<SubscriptionPlan[], Error> = useQuery({
    queryKey: ['subscription-plans-by-city', city],
    queryFn: () => subscriptionService.getSubscriptionPlansByCity(city),
    enabled: !!city, // Only run if city is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  // Determine tier based on city
  const getTierForCity = (cityName: string): 'TIER_1' | 'TIER_2' | 'TIER_3' => {
    const tier1Cities = PRICING_TIERS.find(t => t.id === 'TIER_1')?.cities || [];
    const tier2Cities = PRICING_TIERS.find(t => t.id === 'TIER_2')?.cities || [];
    
    if (tier1Cities.some(city => city.toLowerCase() === cityName.toLowerCase())) {
      return 'TIER_1';
    }
    if (tier2Cities.some(city => city.toLowerCase() === cityName.toLowerCase())) {
      return 'TIER_2';
    }
    return 'TIER_3';
  };

  return {
    plans: data || [],
    city,
    tier: getTierForCity(city),
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * Hook to get pricing tier information
 */
export function usePricingTiers(): { tiers: PricingTier[] } {
  return {
    tiers: PRICING_TIERS,
  };
}

/**
 * Utility function to group plans by tier
 */
export function groupPlansByTier(plans: SubscriptionPlan[]): Record<string, SubscriptionPlan[]> {
  return plans.reduce((acc, plan) => {
    const tier = plan.features.pricingTier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(plan);
    return acc;
  }, {} as Record<string, SubscriptionPlan[]>);
}

/**
 * Utility function to get tier display name
 */
export function getTierDisplayName(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): string {
  const tierInfo = PRICING_TIERS.find(t => t.id === tier);
  return tierInfo?.displayName || tier;
}

/**
 * Utility function to get tier description
 */
export function getTierDescription(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): string {
  const tierInfo = PRICING_TIERS.find(t => t.id === tier);
  return tierInfo?.description || '';
}

/**
 * Utility function to get cities for a tier
 */
export function getTierCities(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): string[] {
  const tierInfo = PRICING_TIERS.find(t => t.id === tier);
  return tierInfo?.cities || [];
}
