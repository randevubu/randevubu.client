'use client';

import { useState } from 'react';
import { AddPaymentMethodData } from '../../types/subscription';

interface AddPaymentMethodFormProps {
  loading: boolean;
  error: string | null;
  onSubmit: (data: AddPaymentMethodData) => void;
  onCancel: () => void;
}

export default function AddPaymentMethodForm({
  loading,
  error,
  onSubmit,
  onCancel
}: AddPaymentMethodFormProps) {
  const [formData, setFormData] = useState<AddPaymentMethodData>({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });

  const [makeDefault, setMakeDefault] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof AddPaymentMethodData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMakeDefaultChange = (value: boolean) => {
    setMakeDefault(value);
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      handleInputChange('cardNumber', formatted);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.cardHolderName.trim()) {
      errors.cardHolderName = 'Kart sahibi adı gerekli';
    }

    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      errors.cardNumber = 'Kart numarası gerekli';
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      errors.cardNumber = 'Geçersiz kart numarası';
    }

    if (!formData.expireMonth) {
      errors.expireMonth = 'Ay gerekli';
    } else if (parseInt(formData.expireMonth) < 1 || parseInt(formData.expireMonth) > 12) {
      errors.expireMonth = 'Geçersiz ay';
    }

    if (!formData.expireYear) {
      errors.expireYear = 'Yıl gerekli';
    } else {
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.expireYear);
      if (year < currentYear || year > currentYear + 10) {
        errors.expireYear = 'Geçersiz yıl';
      }
    }

    if (!formData.cvc) {
      errors.cvc = 'CVC gerekli';
    } else if (formData.cvc.length < 3 || formData.cvc.length > 4) {
      errors.cvc = 'Geçersiz CVC';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData: AddPaymentMethodData = {
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces for submission
        makeDefault: makeDefault
      };
      onSubmit(submitData);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Card Holder Name */}
      <div>
        <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-2">
          Kart Sahibi Adı
        </label>
        <input
          type="text"
          id="cardHolderName"
          value={formData.cardHolderName}
          onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
          placeholder="John Doe"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            formErrors.cardHolderName ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.cardHolderName && (
          <p className="text-red-600 text-sm mt-1">{formErrors.cardHolderName}</p>
        )}
      </div>

      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Kart Numarası
        </label>
        <input
          type="text"
          id="cardNumber"
          value={formData.cardNumber}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          placeholder="1234 5678 9012 3456"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            formErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.cardNumber && (
          <p className="text-red-600 text-sm mt-1">{formErrors.cardNumber}</p>
        )}
      </div>

      {/* Expiry Date and CVC */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="expireMonth" className="block text-sm font-medium text-gray-700 mb-2">
            Ay
          </label>
          <select
            id="expireMonth"
            value={formData.expireMonth}
            onChange={(e) => handleInputChange('expireMonth', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              formErrors.expireMonth ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Ay</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {formErrors.expireMonth && (
            <p className="text-red-600 text-sm mt-1">{formErrors.expireMonth}</p>
          )}
        </div>

        <div>
          <label htmlFor="expireYear" className="block text-sm font-medium text-gray-700 mb-2">
            Yıl
          </label>
          <select
            id="expireYear"
            value={formData.expireYear}
            onChange={(e) => handleInputChange('expireYear', e.target.value)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              formErrors.expireYear ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Yıl</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {formErrors.expireYear && (
            <p className="text-red-600 text-sm mt-1">{formErrors.expireYear}</p>
          )}
        </div>

        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-2">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            value={formData.cvc}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                handleInputChange('cvc', value);
              }
            }}
            placeholder="123"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              formErrors.cvc ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.cvc && (
            <p className="text-red-600 text-sm mt-1">{formErrors.cvc}</p>
          )}
        </div>
      </div>

      {/* Default Payment Method */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="makeDefault"
          checked={makeDefault}
          onChange={(e) => handleMakeDefaultChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="makeDefault" className="ml-2 text-sm text-gray-700">
          Bu kartı varsayılan ödeme yöntemi yap
        </label>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Güvenli ve Şifreli</div>
            <p>Kart bilgileriniz 256-bit SSL şifreleme ile korunur ve güvenli olarak saklanır. Tam kart numaranız hiçbir zaman saklanmaz.</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transform hover:scale-105 transition-all font-semibold shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Ekleniyor...
            </div>
          ) : (
            'Kart Ekle'
          )}
        </button>
      </div>
    </form>
  );
}