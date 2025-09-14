'use client';

import { useState, useEffect } from 'react';
import { Business } from '../../types/business';

interface PriceSettingsFormProps {
  business: Business | null;
  onSave: (settings: {
    hideAllServicePrices: boolean;
    showPriceOnBooking: boolean;
  }) => void;
  isSaving?: boolean;
}

export function PriceSettingsForm({ business, onSave, isSaving = false }: PriceSettingsFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hideAllServicePrices, setHideAllServicePrices] = useState(
    business?.priceSettings?.hideAllServicePrices || false
  );
  const [showPriceOnBooking, setShowPriceOnBooking] = useState(
    business?.priceSettings?.showPriceOnBooking || true
  );

  // Update local state when business prop changes
  useEffect(() => {
    console.log('🔄 PriceSettingsForm: Business prop changed:', {
      businessId: business?.id,
      priceSettings: business?.priceSettings,
      hasSettings: !!business?.priceSettings
    });
    setHideAllServicePrices(business?.priceSettings?.hideAllServicePrices || false);
    setShowPriceOnBooking(business?.priceSettings?.showPriceOnBooking || true);
  }, [business?.priceSettings]);

  const handleSettingsChange = (newSettings: Partial<{ hideAllServicePrices: boolean; showPriceOnBooking: boolean }>) => {
    const updatedSettings = {
      hideAllServicePrices,
      showPriceOnBooking,
      ...newSettings
    };
    
    // Update local state
    if ('hideAllServicePrices' in newSettings) {
      setHideAllServicePrices(newSettings.hideAllServicePrices!);
    }
    if ('showPriceOnBooking' in newSettings) {
      setShowPriceOnBooking(newSettings.showPriceOnBooking!);
    }
    
    // Auto-save
    onSave(updatedSettings);
  };

  return (
    <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] transition-colors duration-300">
      {/* Collapsible Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--theme-backgroundSecondary)] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-[var(--theme-foreground)] flex items-center">
          <svg className="w-5 h-5 mr-2 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Fiyat Görünürlük Ayarları
        </h3>
        <svg 
          className={`w-5 h-5 text-[var(--theme-foregroundMuted)] transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-[var(--theme-border)]">
          <div className="pt-4 space-y-6">
        {/* Hide All Service Prices */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="hideAllServicePrices"
              type="checkbox"
              checked={hideAllServicePrices}
              onChange={(e) => handleSettingsChange({ hideAllServicePrices: e.target.checked })}
              disabled={isSaving}
              className="w-4 h-4 text-[var(--theme-primary)] bg-[var(--theme-background)] border-[var(--theme-border)] rounded focus:ring-[var(--theme-primary)] focus:ring-2 disabled:opacity-50"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="hideAllServicePrices" className="text-sm font-medium text-[var(--theme-foreground)]">
              Tüm hizmet fiyatlarını gizle
            </label>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Hizmet listelerinde fiyatlar gösterilmeyecek. Müşteriler rezervasyon yaparken fiyatları görebilir.
            </p>
          </div>
        </div>

        {/* Show Price on Booking */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="showPriceOnBooking"
              type="checkbox"
              checked={showPriceOnBooking}
              onChange={(e) => handleSettingsChange({ showPriceOnBooking: e.target.checked })}
              disabled={isSaving}
              className="w-4 h-4 text-[var(--theme-primary)] bg-[var(--theme-background)] border-[var(--theme-border)] rounded focus:ring-[var(--theme-primary)] focus:ring-2 disabled:opacity-50"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="showPriceOnBooking" className="text-sm font-medium text-[var(--theme-foreground)]">
              Rezervasyon sırasında fiyat göster
            </label>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Müşteriler rezervasyon yaparken seçtikleri hizmetin fiyatını görebilir.
            </p>
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="flex items-center justify-center pt-4 text-sm text-[var(--theme-foregroundSecondary)]">
            <div className="w-4 h-4 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mr-2"></div>
            Kaydediliyor...
          </div>
        )}
        </div>
        </div>
      )}
    </div>
  );
}