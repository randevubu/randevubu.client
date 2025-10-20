'use client';

import { useState } from 'react';
import { Plus, Check, Clock, CreditCard, Sparkles } from 'lucide-react';
import { ServiceSuggestion } from '../../lib/utils/serviceSuggestions';
import { CreateServiceData } from '../../types/service';

interface SuggestedServicesProps {
  suggestions: ServiceSuggestion[];
  onAddService: (serviceData: CreateServiceData) => void;
  isAdding: boolean;
  businessTypeName?: string;
}

export default function SuggestedServices({ 
  suggestions, 
  onAddService, 
  isAdding, 
  businessTypeName 
}: SuggestedServicesProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);

  const handleServiceSelect = (serviceName: string) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceName)) {
        newSet.delete(serviceName);
      } else {
        newSet.add(serviceName);
      }
      return newSet;
    });
  };

  const handleAddSingleService = async (suggestion: ServiceSuggestion) => {
    const serviceData: CreateServiceData = {
      name: suggestion.name,
      description: suggestion.description,
      duration: suggestion.duration,
      price: suggestion.price,
      currency: suggestion.currency
    };
    
    await onAddService(serviceData);
  };

  const handleAddSelectedServices = async () => {
    if (selectedServices.size === 0) return;
    
    setIsAddingMultiple(true);
    
    try {
      for (const serviceName of selectedServices) {
        const suggestion = suggestions.find(s => s.name === serviceName);
        if (suggestion) {
          const serviceData: CreateServiceData = {
            name: suggestion.name,
            description: suggestion.description,
            duration: suggestion.duration,
            price: suggestion.price,
            currency: suggestion.currency
          };
          
          await onAddService(serviceData);
        }
      }
      
      setSelectedServices(new Set());
    } finally {
      setIsAddingMultiple(false);
    }
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}s ${minutes}dk`;
    } else if (hours > 0) {
      return `${hours} saat`;
    } else {
      return `${minutes} dakika`;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY'
    }).format(price);
  };

  return (
    <div className="bg-gradient-to-br from-[var(--theme-primary)]/5 to-[var(--theme-primary)]/10 rounded-lg border border-[var(--theme-primary)]/20 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[var(--theme-primary)]/20 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[var(--theme-primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">
            Önerilen Hizmetler
          </h3>
          <p className="text-sm text-[var(--theme-foregroundSecondary)]">
            {businessTypeName && `${businessTypeName} işletmeniz için önerilen hizmetler`}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`bg-[var(--theme-card)] rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedServices.has(suggestion.name)
                ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5'
                : 'border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50'
            }`}
            onClick={() => handleServiceSelect(suggestion.name)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--theme-foreground)] mb-1">
                    {suggestion.name}
                  </h4>
                  <p className="text-sm text-[var(--theme-foregroundSecondary)] line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                {selectedServices.has(suggestion.name) && (
                  <div className="w-6 h-6 bg-[var(--theme-primary)] rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-[var(--theme-foregroundSecondary)]">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(suggestion.duration)}
                </div>
                <div className="flex items-center font-medium text-[var(--theme-foreground)]">
                  <CreditCard className="w-4 h-4 mr-1" />
                  {formatPrice(suggestion.price, suggestion.currency)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {selectedServices.size > 0 && (
          <button
            onClick={handleAddSelectedServices}
            disabled={isAdding || isAddingMultiple}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-[var(--theme-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--theme-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAddingMultiple ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Ekleniyor...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Seçilenleri Ekle ({selectedServices.size})
              </>
            )}
          </button>
        )}
        
        <button
          onClick={() => {
            // Add all services
            setSelectedServices(new Set(suggestions.map(s => s.name)));
            handleAddSelectedServices();
          }}
          disabled={isAdding || isAddingMultiple}
          className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-[var(--theme-card)] text-[var(--theme-foreground)] text-sm font-medium rounded-lg border border-[var(--theme-border)] hover:bg-[var(--theme-backgroundSecondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Tümünü Ekle
        </button>
      </div>

      {/* Individual Add Buttons */}
      <div className="mt-4 pt-4 border-t border-[var(--theme-border)]">
        <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-3">
          Veya tek tek ekleyin:
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleAddSingleService(suggestion)}
              disabled={isAdding}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 rounded-md hover:bg-[var(--theme-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3 h-3 mr-1" />
              {suggestion.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
