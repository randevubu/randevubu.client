'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { businessService } from '../../../lib/services/business';
import { servicesService, MyServicesParams } from '../../../lib/services/services';
import { Business } from '../../../types/business';
import { Service } from '../../../types/service';
import { canViewBusinessStats } from '../../../lib/utils/permissions';
import { handleApiError, showSuccessToast } from '../../../lib/utils/toast';
import { validateServiceForm, validateServiceField, CreateServiceSchema } from '../../../lib/validation/service';
import { useValidationErrors } from '../../../lib/hooks/useValidationErrors';
import { PriceSettingsForm } from '../../../components/ui';

// Create Service Modal Component
interface CreateServiceModalProps {
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    description: string;
    duration: number;
    price: number;
    currency: string;
  }) => void;
  isCreating: boolean;
}

function CreateServiceModal({ onClose, onSubmit, isCreating }: CreateServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    currency: 'TRY'
  });
  const [priceInputValue, setPriceInputValue] = useState('0');
  const [durationInputValue, setDurationInputValue] = useState('60');
  const [errors, setErrors] = useState<Record<string, string>>({});



  const validateForm = () => {
    return validateFormWithData(formData);
  };

  const validateFormWithData = (dataToValidate: typeof formData) => {
    // Debug logging to understand the data types
    console.log('Form data before validation:', dataToValidate);
    console.log('Price type:', typeof dataToValidate.price, 'Value:', dataToValidate.price);
    console.log('Duration type:', typeof dataToValidate.duration, 'Value:', dataToValidate.duration);
    
    // Ensure data types are correct before validation
    const sanitizedData = {
      ...dataToValidate,
      duration: typeof dataToValidate.duration === 'number' ? dataToValidate.duration : parseInt(String(dataToValidate.duration)) || 60,
      price: typeof dataToValidate.price === 'number' ? dataToValidate.price : parseFloat(String(dataToValidate.price)) || 0
    };
    
    console.log('Sanitized data:', sanitizedData);
    
    const validationResult = validateServiceForm(sanitizedData, false);
    setErrors(validationResult.errors as Record<string, string>);
    return validationResult.isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Ensure the submitted data has correct types
      const sanitizedFormData = {
        ...formData,
        duration: typeof formData.duration === 'number' ? formData.duration : parseInt(String(formData.duration)) || 60,
        price: typeof formData.price === 'number' ? formData.price : parseFloat(String(formData.price)) || 0
      };
      onSubmit(sanitizedFormData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceInputValue(value);
    
    // Convert to number for form data, handling Turkish locale decimal separator
    let numericValue = 0;
    if (value !== '') {
      // Replace comma with period for proper number parsing
      const normalizedValue = value.replace(',', '.');
      const parsed = parseFloat(normalizedValue);
      numericValue = isNaN(parsed) ? 0 : parsed;
    }
    
    console.log('Price input change:', { value, numericValue, type: typeof numericValue });
    setFormData(prev => ({ ...prev, price: numericValue }));
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't clear the field, just select all text for easy overwriting
    e.target.select();
  };

  const handlePriceBlur = () => {
    if (priceInputValue === '') {
      setPriceInputValue('0');
      setFormData(prev => ({ ...prev, price: 0 }));
    }
  };

  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDurationInputValue(value);
    
    // Convert to number for form data, ensuring it's always valid
    const numericValue = value === '' ? 60 : Math.max(1, parseInt(value) || 60);
    setFormData(prev => ({ ...prev, duration: numericValue }));
    
    // Clear any existing duration error since we're setting a valid value
    if (errors.duration && numericValue > 0) {
      setErrors(prev => ({ ...prev, duration: '' }));
    }
  };

  const handleDurationFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't clear the field, just select all text for easy overwriting
    e.target.select();
  };

  const handleDurationBlur = () => {
    if (durationInputValue === '') {
      setDurationInputValue('60');
      setFormData(prev => ({ ...prev, duration: 60 }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--theme-card)] rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Yeni Hizmet Ekle</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-foregroundSecondary)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Hizmet Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] ${
                    errors.name ? 'border-red-500' : 'border-[var(--theme-border)]'
                  }`}
                  placeholder="Örn: Saç Kesim ve Şekillendirme"
                />
                {errors.name && <p className="mt-1 text-xs text-[var(--theme-error)]">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  placeholder="Hizmet açıklaması..."
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Süre (dakika) *
                </label>
                <input
                  type="number"
                  value={durationInputValue}
                  onChange={handleDurationInputChange}
                  onFocus={handleDurationFocus}
                  onBlur={handleDurationBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] ${
                    errors.duration ? 'border-red-500' : 'border-[var(--theme-border)]'
                  }`}
                  min="1"
                  step="1"
                  placeholder="60"
                />
                {errors.duration && <p className="mt-1 text-xs text-[var(--theme-error)]">{errors.duration}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Fiyat *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceInputValue}
                    onChange={handlePriceInputChange}
                    onFocus={handlePriceFocus}
                    onBlur={handlePriceBlur}
                    className={`flex-1 min-w-0 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] ${
                      errors.price ? 'border-red-500' : 'border-[var(--theme-border)]'
                    }`}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="flex-shrink-0 w-20 px-2 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-sm"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                {errors.price && <p className="mt-1 text-xs text-[var(--theme-error)]">{errors.price}</p>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[var(--theme-backgroundSecondary)] px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-backgroundSecondary)] transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] border border-transparent rounded-md hover:bg-[var(--theme-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCreating && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isCreating ? 'Oluşturuluyor...' : 'Hizmeti Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Service Modal Component
interface EditServiceModalProps {
  service: Service;
  onClose: () => void;
  onSubmit: (serviceId: string, formData: {
    name: string;
    description: string;
    duration: number;
    price: number;
    currency: string;
  }) => void;
  isUpdating: boolean;
}

function EditServiceModal({ service, onClose, onSubmit, isUpdating }: EditServiceModalProps) {
  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description || '',
    duration: service.duration,
    price: service.price,
    currency: service.currency
  });
  const [priceInputValue, setPriceInputValue] = useState(service.price?.toString() || '');
  const [durationInputValue, setDurationInputValue] = useState(service.duration.toString());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateFormWithData = (dataToValidate: typeof formData) => {
    // Debug logging to understand the data types in edit mode
    console.log('Edit form data before validation:', dataToValidate);
    console.log('Edit Price type:', typeof dataToValidate.price, 'Value:', dataToValidate.price);
    console.log('Edit Duration type:', typeof dataToValidate.duration, 'Value:', dataToValidate.duration);
    
    // Ensure data types are correct before validation
    const sanitizedData = {
      ...dataToValidate,
      duration: typeof dataToValidate.duration === 'number' ? dataToValidate.duration : parseInt(String(dataToValidate.duration)) || 60,
      price: typeof dataToValidate.price === 'number' ? dataToValidate.price : parseFloat(String(dataToValidate.price)) || 0
    };
    
    console.log('Edit Sanitized data:', sanitizedData);
    
    const validationResult = validateServiceForm(sanitizedData, true); // true for update mode
    setErrors(validationResult.errors as Record<string, string>);
    return validationResult.isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFormWithData(formData)) {
      // Ensure the submitted data has correct types
      const sanitizedFormData = {
        ...formData,
        duration: typeof formData.duration === 'number' ? formData.duration : parseInt(String(formData.duration)) || 60,
        price: typeof formData.price === 'number' ? formData.price : parseFloat(String(formData.price)) || 0
      };
      onSubmit(service.id, sanitizedFormData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceInputValue(value);
    
    // Convert to number for form data, handling Turkish locale decimal separator
    let numericValue = 0;
    if (value !== '') {
      // Replace comma with period for proper number parsing
      const normalizedValue = value.replace(',', '.');
      const parsed = parseFloat(normalizedValue);
      numericValue = isNaN(parsed) ? 0 : parsed;
    }
    
    console.log('Edit Price input change:', { value, numericValue, type: typeof numericValue });
    setFormData(prev => ({ ...prev, price: numericValue }));
  };

  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePriceBlur = () => {
    if (priceInputValue === '') {
      setPriceInputValue('0');
      setFormData(prev => ({ ...prev, price: 0 }));
    }
  };

  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDurationInputValue(value);
    
    const numericValue = value === '' ? 60 : Math.max(1, parseInt(value) || 60);
    setFormData(prev => ({ ...prev, duration: numericValue }));
    
    if (errors.duration && numericValue > 0) {
      setErrors(prev => ({ ...prev, duration: '' }));
    }
  };

  const handleDurationFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleDurationBlur = () => {
    if (durationInputValue === '') {
      setDurationInputValue('60');
      setFormData(prev => ({ ...prev, duration: 60 }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--theme-card)] rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Hizmeti Düzenle</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-foregroundSecondary)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Hizmet Adı *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] ${
                    errors.name ? 'border-red-500' : 'border-[var(--theme-border)]'
                  }`}
                  placeholder="Örn: Saç Kesim ve Şekillendirme"
                />
                {errors.name && <p className="mt-1 text-xs text-[var(--theme-error)]">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                  placeholder="Hizmet açıklaması..."
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Süre (dakika) *
                </label>
                <input
                  type="number"
                  value={durationInputValue}
                  onChange={handleDurationInputChange}
                  onFocus={handleDurationFocus}
                  onBlur={handleDurationBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] ${
                    errors.duration ? 'border-red-500' : 'border-[var(--theme-border)]'
                  }`}
                  min="1"
                  step="1"
                  placeholder="60"
                />
                {errors.duration && <p className="mt-1 text-xs text-[var(--theme-error)]">{errors.duration}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Fiyat *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceInputValue}
                    onChange={handlePriceInputChange}
                    onFocus={handlePriceFocus}
                    onBlur={handlePriceBlur}
                    className={`flex-1 min-w-0 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] ${
                      errors.price ? 'border-red-500' : 'border-[var(--theme-border)]'
                    }`}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="flex-shrink-0 w-20 px-2 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] text-sm"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                {errors.price && <p className="mt-1 text-xs text-[var(--theme-error)]">{errors.price}</p>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[var(--theme-backgroundSecondary)] px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-backgroundSecondary)] transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] border border-transparent rounded-md hover:bg-[var(--theme-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isUpdating && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isUpdating ? 'Güncelleniyor...' : 'Hizmeti Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  service: Service;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteConfirmationModal({ service, onConfirm, onCancel, isDeleting }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--theme-card)] rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header with Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] text-center mb-2">
            Hizmeti Sil
          </h3>

          {/* Message */}
          <p className="text-sm text-[var(--theme-foregroundSecondary)] text-center mb-2">
            <span className="font-medium text-[var(--theme-foreground)]">"{service.name}"</span> hizmetini silmek istediğinizden emin misiniz?
          </p>
          <p className="text-xs text-[var(--theme-error)] text-center mb-6">
            Bu işlem geri alınamaz ve tüm ilgili veriler kalıcı olarak silinecektir.
          </p>

          {/* Service Info Card */}
          <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-3 mb-6">
            <div className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[var(--theme-foregroundSecondary)]">Hizmet:</span>
                <span className="font-medium text-[var(--theme-foreground)]">{service.name}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[var(--theme-foregroundSecondary)]">Fiyat:</span>
                <span className="font-medium text-[var(--theme-foreground)]">
                  {service.price ? new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: service.currency || 'TRY'
                  }).format(service.price) : 'Fiyat talep üzerine'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--theme-foregroundSecondary)]">Süre:</span>
                <span className="font-medium text-[var(--theme-foreground)]">
                  {service.duration >= 60 
                    ? `${Math.floor(service.duration / 60)}s ${service.duration % 60}dk`
                    : `${service.duration} dakika`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--theme-backgroundSecondary)] px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-backgroundSecondary)] disabled:opacity-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isDeleting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  
  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceFilters, setServiceFilters] = useState<MyServicesParams>({
    page: 1,
    limit: 50
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [servicesPagination, setServicesPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);

  // Price settings state
  const [isSavingPriceSettings, setIsSavingPriceSettings] = useState(false);

  // View preferences
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user && canViewBusinessStats(user)) {
      loadBusinessData();
    }
  }, [user]);

  useEffect(() => {
    if (business && user && canViewBusinessStats(user)) {
      loadServices();
    }
  }, [business, serviceFilters]);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery]);

  const loadBusinessData = async () => {
    try {
      const response = await businessService.getMyBusiness();
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        
        // Try to load price settings separately if not included in business data
        try {
          const priceSettingsResponse = await businessService.getPriceSettings();
          if (priceSettingsResponse.success && priceSettingsResponse.data) {
            primaryBusiness.priceSettings = priceSettingsResponse.data;
          }
        } catch (priceError) {
          console.warn('Could not load price settings:', priceError);
          // Set defaults if price settings endpoint doesn't exist
          primaryBusiness.priceSettings = {
            hideAllServicePrices: false,
            showPriceOnBooking: true
          };
        }
        
        console.log('🔍 Loaded business data:', {
          businessId: primaryBusiness.id,
          priceSettings: primaryBusiness.priceSettings,
          fullBusiness: primaryBusiness
        });
        setBusiness(primaryBusiness);
      }
    } catch (error) {
      console.error('Business data loading failed:', error);
      handleApiError(error);
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);
      
      const params: MyServicesParams = { page: 1, limit: 1000 }; // Load all services for client-side filtering
      if (business?.id) {
        params.businessId = business.id;
      }
      
      const response = await servicesService.getMyServices(params);
      
      if (!response.success) {
        setServicesError(response.error?.message || 'Hizmetler alınamadı.');
        return;
      }

      if (response.data) {
        setServices(response.data.services);
        setServicesPagination({
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages
        });
      }
      
    } catch (error) {
      console.error('Services loading failed:', error);
      handleApiError(error);
      setServicesError('Hizmetler yüklenirken bir hata oluştu.');
    } finally {
      setServicesLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const newStatus = !service.isActive;
      const response = await servicesService.updateServiceStatus(service.id, newStatus);
      
      if (response.success) {
        // Update the service in the local state
        setServices(prev => prev.map(s => 
          s.id === service.id ? { ...s, isActive: newStatus } : s
        ));
        showSuccessToast(`Hizmet ${newStatus ? 'aktif' : 'pasif'} hale getirildi.`);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Service status update failed:', error);
      handleApiError(error);
    }
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      setIsDeletingService(true);
      const response = await servicesService.deleteService(serviceToDelete.id);
      
      if (response.success) {
        // Remove the service from the local state
        setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
        showSuccessToast('Hizmet başarıyla silindi.');
        setServiceToDelete(null);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Service deletion failed:', error);
      handleApiError(error);
    } finally {
      setIsDeletingService(false);
    }
  };

  const cancelDelete = () => {
    setServiceToDelete(null);
  };

  const handleCreateService = async (formData: {
    name: string;
    description: string;
    duration: number;
    price: number;
    currency: string;
  }) => {
    if (!business?.id) {
      handleApiError({ message: 'İşletme ID bulunamadı' });
      return;
    }

    try {
      setIsCreating(true);
      const response = await servicesService.createServiceForBusiness(business.id, formData);
      
      if (response.success && response.data) {
        setServices(prev => [response.data!, ...prev]);
        setShowCreateModal(false);
        showSuccessToast('Hizmet başarıyla oluşturuldu.');
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Service creation failed:', error);
      handleApiError(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateService = async (serviceId: string, formData: {
    name: string;
    description: string;
    duration: number;
    price: number;
    currency: string;
  }) => {
    try {
      setIsCreating(true); // Reuse the same loading state
      const response = await servicesService.updateService(serviceId, formData);
      
      if (response.success && response.data) {
        // Update the service in the local state
        setServices(prev => prev.map(s => 
          s.id === serviceId ? response.data! : s
        ));
        setEditingService(null);
        showSuccessToast('Hizmet başarıyla güncellendi.');
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Service update failed:', error);
      handleApiError(error);
    } finally {
      setIsCreating(false);
    }
  };

  // Utility functions
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

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return 'Fiyat talep üzerine';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY'
    }).format(price);
  };

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleSavePriceSettings = async (settings: {
    hideAllServicePrices: boolean;
    showPriceOnBooking: boolean;
  }) => {
    try {
      setIsSavingPriceSettings(true);
      console.log('💾 Saving price settings:', settings);
      
      const response = await businessService.updatePriceSettings(settings);
      console.log('💾 Save response:', response);
      
      if (response.success) {
        // Update business data to reflect the new settings
        setBusiness(prev => prev ? {
          ...prev,
          priceSettings: settings
        } : null);
        // Also reload business data to ensure we have the latest from server
        await loadBusinessData();
        showSuccessToast('Fiyat ayarları başarıyla kaydedildi.');
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Price settings update failed:', error);
      handleApiError(error);
    } finally {
      setIsSavingPriceSettings(false);
    }
  };


  return (
    <div className="space-y-4 sm:space-y-6 bg-[var(--theme-background)] min-h-screen transition-colors duration-300">
      {/* Price Settings */}
      <PriceSettingsForm
        business={business}
        onSave={handleSavePriceSettings}
        isSaving={isSavingPriceSettings}
      />

      {/* Header */}
      <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] p-4 sm:p-6 transition-colors duration-300">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-[var(--theme-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--theme-primary)]/90 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Hizmet
          </button>
        </div>

        {/* Search Bar with View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Hizmet ara (isim, açıklama)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-[var(--theme-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-[var(--theme-backgroundSecondary)] rounded-lg p-1">
            <button
              onClick={() => setViewMode('detailed')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-[var(--theme-card)] text-[var(--theme-foreground)] shadow-sm'
                  : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)]'
              }`}
              title="Detaylı Görünüm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'compact'
                  ? 'bg-[var(--theme-card)] text-[var(--theme-foreground)] shadow-sm'
                  : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)]'
              }`}
              title="Kompakt Görünüm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 text-sm text-[var(--theme-foregroundSecondary)] hover:text-gray-800 bg-[var(--theme-backgroundSecondary)] hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
        <div className="px-4 sm:px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)] flex items-center">
              <svg className="w-5 h-5 mr-2 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Hizmetler
            </h3>
            {(searchQuery ? filteredServices.length : servicesPagination.total) > 0 && (
              <span className="text-sm text-[var(--theme-foregroundMuted)]">
                {searchQuery ? `${filteredServices.length} sonuç` : `${servicesPagination.total} hizmet`}
              </span>
            )}
          </div>
        </div>

        {servicesLoading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[var(--theme-foregroundSecondary)]">Hizmetler yükleniyor...</span>
            </div>
          </div>
        ) : servicesError ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-[var(--theme-foreground)]">Hata</h3>
            <p className="mt-2 text-sm text-[var(--theme-foregroundMuted)]">{servicesError}</p>
            <button
              onClick={loadServices}
              className="mt-4 inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--theme-primary)]/90"
            >
              Tekrar Dene
            </button>
          </div>
        ) : (searchQuery ? filteredServices : services).length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-[var(--theme-foreground)]">Hizmet Bulunamadı</h3>
            <p className="mt-2 text-sm text-[var(--theme-foregroundMuted)]">
              {searchQuery
                ? `"${searchQuery}" aramasına uygun hizmet bulunamadı.` 
                : 'Henüz hiç hizmet bulunmuyor.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--theme-primary)]/90"
              >
                İlk Hizmetinizi Ekleyin
              </button>
            )}
          </div>
        ) : viewMode === 'detailed' ? (
          <div className="divide-y divide-gray-200">
            {(searchQuery ? filteredServices : services).map((service) => (
              <div key={service.id} className="p-4 sm:p-6 hover:bg-[var(--theme-backgroundSecondary)] transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base sm:text-lg font-medium text-[var(--theme-foreground)]">{service.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                          : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                      }`}>
                        {service.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    
                    {service.description && (
                      <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-3 line-clamp-2">{service.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center text-[var(--theme-foregroundSecondary)]">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">{formatDuration(service.duration)}</span>
                      </div>
                      
                      <div className="flex items-center text-[var(--theme-foregroundSecondary)]">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="truncate font-medium">{formatPrice(service.price, service.currency)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col items-center justify-end gap-2 lg:ml-4">
                    <button 
                      onClick={() => setEditingService(service)}
                      className="flex-1 lg:flex-none text-[var(--theme-primary)] hover:text-[var(--theme-primary)]/80 text-sm font-medium px-3 py-2 rounded-lg hover:bg-[var(--theme-primary)]/10 transition-colors border border-[var(--theme-primary)]/30 whitespace-nowrap"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteClick(service)}
                      className="flex-1 lg:flex-none text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-[var(--theme-error)] hover:text-[var(--theme-error)]/80 hover:bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/30"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Compact View */
          <div className="divide-y divide-gray-200">
            {(searchQuery ? filteredServices : services).map((service) => {
              const isExpanded = expandedServices.has(service.id);
              return (
                <div key={service.id} className="hover:bg-[var(--theme-backgroundSecondary)] transition-colors">
                  {/* Compact Service Header */}
                  <div 
                    className="p-3 sm:p-4 cursor-pointer"
                    onClick={() => toggleServiceExpansion(service.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-medium text-[var(--theme-foreground)] truncate">
                              {service.name}
                            </h4>
                            <div className="flex items-center gap-4 mt-1 text-xs sm:text-sm text-[var(--theme-foregroundSecondary)]">
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDuration(service.duration)}
                              </span>
                              <span className="flex items-center font-medium">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                {formatPrice(service.price, service.currency)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              service.isActive 
                                ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                                : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                            }`}>
                              {service.isActive ? 'Aktif' : 'Pasif'}
                            </span>
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
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bg-[var(--theme-backgroundSecondary)] border-t border-[var(--theme-border)]">
                      <div className="p-3 sm:p-4">
                        {service.description && (
                          <div className="mb-3">
                            <p className="text-sm text-[var(--theme-foregroundSecondary)]">{service.description}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-row gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingService(service);
                            }}
                            className="flex-1 text-[var(--theme-primary)] hover:text-[var(--theme-primary)]/80 text-sm font-medium px-3 py-2 rounded-lg hover:bg-[var(--theme-primary)]/10 transition-colors border border-[var(--theme-primary)]/30"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(service);
                            }}
                            className="flex-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors text-[var(--theme-error)] hover:text-[var(--theme-error)]/80 hover:bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/30"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Create Service Modal */}
      {showCreateModal && (
        <CreateServiceModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateService}
          isCreating={isCreating}
        />
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <EditServiceModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSubmit={handleUpdateService}
          isUpdating={isCreating}
        />
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <DeleteConfirmationModal
          service={serviceToDelete}
          onConfirm={confirmDeleteService}
          onCancel={cancelDelete}
          isDeleting={isDeletingService}
        />
      )}
    </div>
  );
}