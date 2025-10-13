'use client';

import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Location, CityOption } from '../../types/subscription';

interface CitySelectorProps {
  onCityChange: (city: string) => void;
  currentCity: string;
  detectedLocation?: Location;
  className?: string;
}

const CITY_OPTIONS: CityOption[] = [
  // All 81 Turkish cities from backend, sorted alphabetically
  { value: 'adiyaman', label: 'Adıyaman', tier: 'Tier 3' },
  { value: 'afyon', label: 'Afyon', tier: 'Tier 3' },
  { value: 'agri', label: 'Ağrı', tier: 'Tier 3' },
  { value: 'aksaray', label: 'Aksaray', tier: 'Tier 3' },
  { value: 'amasya', label: 'Amasya', tier: 'Tier 3' },
  { value: 'ankara', label: 'Ankara', tier: 'Tier 1' },
  { value: 'antalya', label: 'Antalya', tier: 'Tier 2' },
  { value: 'ardahan', label: 'Ardahan', tier: 'Tier 3' },
  { value: 'artvin', label: 'Artvin', tier: 'Tier 3' },
  { value: 'aydin', label: 'Aydın', tier: 'Tier 3' },
  { value: 'balikesir', label: 'Balıkesir', tier: 'Tier 2' },
  { value: 'bartin', label: 'Bartın', tier: 'Tier 3' },
  { value: 'batman', label: 'Batman', tier: 'Tier 2' },
  { value: 'bayburt', label: 'Bayburt', tier: 'Tier 3' },
  { value: 'bilecik', label: 'Bilecik', tier: 'Tier 3' },
  { value: 'bitlis', label: 'Bitlis', tier: 'Tier 3' },
  { value: 'bolu', label: 'Bolu', tier: 'Tier 3' },
  { value: 'bursa', label: 'Bursa', tier: 'Tier 2' },
  { value: 'cankiri', label: 'Çankırı', tier: 'Tier 3' },
  { value: 'corum', label: 'Çorum', tier: 'Tier 3' },
  { value: 'denizli', label: 'Denizli', tier: 'Tier 2' },
  { value: 'diyarbakir', label: 'Diyarbakır', tier: 'Tier 2' },
  { value: 'duzce', label: 'Düzce', tier: 'Tier 3' },
  { value: 'edirne', label: 'Edirne', tier: 'Tier 3' },
  { value: 'elazig', label: 'Elazığ', tier: 'Tier 3' },
  { value: 'erzincan', label: 'Erzincan', tier: 'Tier 3' },
  { value: 'erzurum', label: 'Erzurum', tier: 'Tier 2' },
  { value: 'eskisehir', label: 'Eskişehir', tier: 'Tier 2' },
  { value: 'gaziantep', label: 'Gaziantep', tier: 'Tier 2' },
  { value: 'giresun', label: 'Giresun', tier: 'Tier 3' },
  { value: 'gumushane', label: 'Gümüşhane', tier: 'Tier 3' },
  { value: 'hakkari', label: 'Hakkari', tier: 'Tier 3' },
  { value: 'hatay', label: 'Hatay', tier: 'Tier 3' },
  { value: 'igdir', label: 'Iğdır', tier: 'Tier 3' },
  { value: 'istanbul', label: 'İstanbul', tier: 'Tier 1' },
  { value: 'izmir', label: 'İzmir', tier: 'Tier 2' },
  { value: 'izmit', label: 'İzmit', tier: 'Tier 3' },
  { value: 'kahramanmaras', label: 'Kahramanmaraş', tier: 'Tier 2' },
  { value: 'karabuk', label: 'Karabük', tier: 'Tier 3' },
  { value: 'karaman', label: 'Karaman', tier: 'Tier 3' },
  { value: 'kars', label: 'Kars', tier: 'Tier 3' },
  { value: 'kastamonu', label: 'Kastamonu', tier: 'Tier 3' },
  { value: 'kayseri', label: 'Kayseri', tier: 'Tier 2' },
  { value: 'kilis', label: 'Kilis', tier: 'Tier 3' },
  { value: 'kirklareli', label: 'Kırklareli', tier: 'Tier 3' },
  { value: 'kirsehir', label: 'Kırşehir', tier: 'Tier 3' },
  { value: 'konya', label: 'Konya', tier: 'Tier 2' },
  { value: 'kutahya', label: 'Kütahya', tier: 'Tier 3' },
  { value: 'malatya', label: 'Malatya', tier: 'Tier 3' },
  { value: 'manisa', label: 'Manisa', tier: 'Tier 2' },
  { value: 'mardin', label: 'Mardin', tier: 'Tier 3' },
  { value: 'mersin', label: 'Mersin', tier: 'Tier 2' },
  { value: 'mugla', label: 'Muğla', tier: 'Tier 3' },
  { value: 'mus', label: 'Muş', tier: 'Tier 3' },
  { value: 'nevsehir', label: 'Nevşehir', tier: 'Tier 3' },
  { value: 'nigde', label: 'Niğde', tier: 'Tier 3' },
  { value: 'ordu', label: 'Ordu', tier: 'Tier 3' },
  { value: 'osmaniye', label: 'Osmaniye', tier: 'Tier 3' },
  { value: 'rize', label: 'Rize', tier: 'Tier 3' },
  { value: 'sakarya', label: 'Sakarya', tier: 'Tier 3' },
  { value: 'samsun', label: 'Samsun', tier: 'Tier 2' },
  { value: 'sanliurfa', label: 'Şanlıurfa', tier: 'Tier 3' },
  { value: 'siirt', label: 'Siirt', tier: 'Tier 3' },
  { value: 'sinop', label: 'Sinop', tier: 'Tier 3' },
  { value: 'sirnak', label: 'Şırnak', tier: 'Tier 3' },
  { value: 'sivas', label: 'Sivas', tier: 'Tier 2' },
  { value: 'tekirdag', label: 'Tekirdağ', tier: 'Tier 3' },
  { value: 'tokat', label: 'Tokat', tier: 'Tier 3' },
  { value: 'trabzon', label: 'Trabzon', tier: 'Tier 2' },
  { value: 'van', label: 'Van', tier: 'Tier 2' },
  { value: 'yalova', label: 'Yalova', tier: 'Tier 3' },
  { value: 'yozgat', label: 'Yozgat', tier: 'Tier 3' },
  { value: 'zonguldak', label: 'Zonguldak', tier: 'Tier 3' },
];


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
