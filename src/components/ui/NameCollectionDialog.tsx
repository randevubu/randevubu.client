'use client';

import { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { userService } from '@/src/lib/services/user';
import { showSuccessToast, handleApiError } from '@/src/lib/utils/toast';

interface NameCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function NameCollectionDialog({
  isOpen,
  onClose,
  onSuccess,
  title = "Ad ve Soyad Bilgilerinizi Girin",
  description = "Randevu oluşturabilmek için ad ve soyad bilgilerinizi girmeniz gerekiyor."
}: NameCollectionDialogProps) {
  const { user, refreshTokenAndUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; general?: string }>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { firstName?: string; lastName?: string; general?: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'Ad en az 2 karakter olmalıdır';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const response = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });

      if (response.success) {
        // Refresh user context to get updated information
        await refreshTokenAndUser();
        
        showSuccessToast('Profil bilgileriniz güncellendi');
        onSuccess();
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
      setErrors({ general: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: 'firstName' | 'lastName', value: string) => {
    if (field === 'firstName') {
      setFirstName(value);
    } else {
      setLastName(value);
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--theme-foreground)]">{title}</h3>
              <p className="text-sm text-[var(--theme-foregroundSecondary)]">{description}</p>
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-[var(--theme-foreground)] mb-2">
                Ad *
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full p-3 bg-[var(--theme-backgroundSecondary)] border rounded-lg text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundSecondary)] focus:outline-none focus:border-[var(--theme-primary)] transition-colors duration-200 ${
                  errors.firstName ? 'border-red-500' : 'border-[var(--theme-border)]'
                }`}
                placeholder="Adınızı girin"
                disabled={isSubmitting}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-[var(--theme-foreground)] mb-2">
                Soyad *
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full p-3 bg-[var(--theme-backgroundSecondary)] border rounded-lg text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundSecondary)] focus:outline-none focus:border-[var(--theme-primary)] transition-colors duration-200 ${
                  errors.lastName ? 'border-red-500' : 'border-[var(--theme-border)]'
                }`}
                placeholder="Soyadınızı girin"
                disabled={isSubmitting}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] rounded-lg font-semibold hover:bg-[var(--theme-border)] transition-colors duration-200 disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Kaydediliyor...
                  </div>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}