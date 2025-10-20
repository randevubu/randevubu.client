'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Building, Home, ChevronDown, Check } from 'lucide-react';
import { usePricingTiers, getTierDisplayName, getTierDescription, getTierCities } from '../../lib/hooks/useSubscriptionPlans';

interface TierSelectorProps {
  selectedTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  onTierChange: (tier: 'TIER_1' | 'TIER_2' | 'TIER_3') => void;
  className?: string;
}

export default function TierSelector({ selectedTier, onTierChange, className = '' }: TierSelectorProps) {
  const t = useTranslations('pricing');
  const { tiers } = usePricingTiers();
  const [isOpen, setIsOpen] = useState(false);

  const getTierIcon = (tierId: 'TIER_1' | 'TIER_2' | 'TIER_3') => {
    switch (tierId) {
      case 'TIER_1':
        return <Building className="w-5 h-5" />;
      case 'TIER_2':
        return <MapPin className="w-5 h-5" />;
      case 'TIER_3':
        return <Home className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTierColor = (tierId: 'TIER_1' | 'TIER_2' | 'TIER_3') => {
    switch (tierId) {
      case 'TIER_1':
        return {
          bg: 'bg-gradient-to-r from-indigo-500 to-purple-600',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
          hover: 'hover:border-indigo-300',
          selected: 'bg-indigo-50 border-indigo-300'
        };
      case 'TIER_2':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          hover: 'hover:border-emerald-300',
          selected: 'bg-emerald-50 border-emerald-300'
        };
      case 'TIER_3':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-amber-600',
          text: 'text-orange-600',
          border: 'border-orange-200',
          hover: 'hover:border-orange-300',
          selected: 'bg-orange-50 border-orange-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-600',
          border: 'border-gray-200',
          hover: 'hover:border-gray-300',
          selected: 'bg-gray-50 border-gray-300'
        };
    }
  };

  const selectedTierInfo = tiers.find(tier => tier.id === selectedTier);

  return (
    <div className={`relative ${className}`}>
      {/* Mobile/Desktop Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${
            getTierColor(selectedTier).border
          } ${getTierColor(selectedTier).selected} ${getTierColor(selectedTier).hover}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTierColor(selectedTier).bg} text-white`}>
              {getTierIcon(selectedTier)}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">
                {getTierDisplayName(selectedTier)}
              </h3>
              <p className="text-sm text-gray-600">
                {getTierDescription(selectedTier)}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {tiers.map((tier) => {
              const colors = getTierColor(tier.id);
              const isSelected = tier.id === selectedTier;
              
              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    onTierChange(tier.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 transition-all duration-200 ${
                    isSelected ? colors.selected : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colors.bg} text-white`}>
                      {getTierIcon(tier.id)}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">
                        {tier.displayName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {tier.description}
                      </p>
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          {getTierCities(tier.id).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tier Cards for Desktop (Alternative Layout) */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4 mt-6">
        {tiers.map((tier) => {
          const colors = getTierColor(tier.id);
          const isSelected = tier.id === selectedTier;
          
          return (
            <button
              key={tier.id}
              onClick={() => onTierChange(tier.id)}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                isSelected 
                  ? `${colors.selected} ring-2 ring-offset-2 ${colors.text.replace('text-', 'ring-')}` 
                  : `${colors.border} hover:${colors.hover} hover:shadow-lg`
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${colors.bg} text-white`}>
                  {getTierIcon(tier.id)}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {tier.displayName}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {tier.description}
              </p>
              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">Cities included:</p>
                <p className="leading-relaxed">
                  {getTierCities(tier.id).join(', ')}
                </p>
              </div>
              {isSelected && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
