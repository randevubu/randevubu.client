'use client';

import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Location, CityOption } from '../../types/subscription';
import { TURKISH_CITIES } from '@/src/data/turkishCities';

interface CitySelectorProps {
  onCityChange: (city: string) => void;
  currentCity: string;
  detectedLocation?: Location;
  className?: string;
}

const CITY_OPTIONS: CityOption[] = TURKISH_CITIES;


export default function CitySelector({ 
  onCityChange, 
  currentCity, 
  detectedLocation,
  className = ''
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCitySelect = (city: string) => {
    onCityChange(city);
    setIsOpen(false);
  };

  const currentCityOption = CITY_OPTIONS.find(city => city.value === currentCity);
  const isAutoDetected = detectedLocation?.detected && currentCity === detectedLocation.city;

  return (
    <div className={`city-selector ${className}`}>
      <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2 transition-colors duration-300">
        <MapPin className="w-4 h-4 inline mr-1" />
        Şehrinizi seçin (doğru fiyatlandırma için)
      </label>
      
      <div className="relative">
        <button 
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-cardForeground)] hover:border-[var(--theme-borderSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium">{currentCityOption?.label || currentCity}</span>
            {isAutoDetected && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                📍 Otomatik
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {CITY_OPTIONS.map(city => (
              <div
                key={city.value}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--theme-backgroundSecondary)] cursor-pointer border-b border-[var(--theme-border)] last:border-b-0 transition-colors duration-150"
                onClick={() => handleCitySelect(city.value)}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-[var(--theme-cardForeground)]">{city.label}</span>
                  {detectedLocation?.detected && city.value === detectedLocation.city && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                      📍 Tespit edildi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {detectedLocation?.detected && (
        <p className="mt-2 text-sm text-[var(--theme-foregroundMuted)] transition-colors duration-300">
          Konumunuz otomatik olarak tespit edildi. 
          Farklı bir şehir seçmek isterseniz yukarıdaki menüyü kullanabilirsiniz.
        </p>
      )}
    </div>
  );
}
