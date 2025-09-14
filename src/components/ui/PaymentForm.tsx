'use client';

import { useState } from 'react';
import { IyzicoCardData, IyzicoBuyerData, CreatePaymentRequest } from '../../types/payment';
import { SubscriptionPlan } from '../../types/subscription';

interface PaymentFormProps {
  selectedPlan: SubscriptionPlan;
  onSubmit: (paymentData: CreatePaymentRequest) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function PaymentForm({ selectedPlan, onSubmit, onBack, loading = false }: PaymentFormProps) {
  const [cardData, setCardData] = useState<IyzicoCardData>({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });

  const [buyerData, setBuyerData] = useState<IyzicoBuyerData>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Turkey',
    zipCode: ''
  });

  const [installment, setInstallment] = useState('1');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCard = (card: IyzicoCardData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!card.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Kart sahibinin adı gereklidir';
    }

    const cardNumber = card.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Kart numarası gereklidir';
    } else if (cardNumber.length < 15 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Geçersiz kart numarası';
    }

    if (!card.expireMonth) {
      newErrors.expireMonth = 'Son kullanma ayı gereklidir';
    } else if (parseInt(card.expireMonth) < 1 || parseInt(card.expireMonth) > 12) {
      newErrors.expireMonth = 'Geçersiz ay';
    }

    if (!card.expireYear) {
      newErrors.expireYear = 'Son kullanma yılı gereklidir';
    } else if (parseInt(card.expireYear) < new Date().getFullYear()) {
      newErrors.expireYear = 'Kart süresi dolmuş';
    }

    if (!card.cvc) {
      newErrors.cvc = 'CVC gereklidir';
    } else if (card.cvc.length < 3 || card.cvc.length > 4) {
      newErrors.cvc = 'Geçersiz CVC';
    }

    return newErrors;
  };

  const validateBuyer = (buyer: IyzicoBuyerData): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!buyer.name.trim()) newErrors.name = 'Ad gereklidir';
    if (!buyer.surname.trim()) newErrors.surname = 'Soyad gereklidir';
    if (!buyer.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(buyer.email)) {
      newErrors.email = 'Geçersiz e-posta formatı';
    }
    if (!buyer.phone.trim()) newErrors.phone = 'Telefon gereklidir';
    if (!buyer.address.trim()) newErrors.address = 'Adres gereklidir';
    if (!buyer.city.trim()) newErrors.city = 'Şehir gereklidir';
    if (!buyer.zipCode.trim()) newErrors.zipCode = 'Posta kodu gereklidir';

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardErrors = validateCard(cardData);
    const buyerErrors = validateBuyer(buyerData);
    const allErrors = { ...cardErrors, ...buyerErrors };

    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      // Use the plan ID directly without mapping
      const paymentData: CreatePaymentRequest = {
        planId: selectedPlan.id,
        card: {
          ...cardData,
          cardNumber: cardData.cardNumber.replace(/\s/g, '')
        },
        buyer: buyerData,
        installment,

      };
      onSubmit(paymentData);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData({ ...cardData, cardNumber: formatted });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">💳 Kart Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-2">Kart Sahibinin Adı</label>
              <input
                type="text"
                value={cardData.cardHolderName}
                onChange={(e) => setCardData({ ...cardData, cardHolderName: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  errors.cardHolderName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Ahmet Yılmaz"
                disabled={loading}
              />
              {errors.cardHolderName && <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-2">Kart Numarası</label>
              <input
                type="text"
                value={cardData.cardNumber}
                onChange={handleCardNumberChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                  errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength={23}
                disabled={loading}
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Ayı</label>
              <select
                value={cardData.expireMonth}
                onChange={(e) => setCardData({ ...cardData, expireMonth: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.expireMonth ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Ay</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
              {errors.expireMonth && <p className="text-red-500 text-sm mt-1">{errors.expireMonth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Son Kullanma Yılı</label>
              <select
                value={cardData.expireYear}
                onChange={(e) => setCardData({ ...cardData, expireYear: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.expireYear ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Yıl</option>
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
              {errors.expireYear && <p className="text-red-500 text-sm mt-1">{errors.expireYear}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input
                type="text"
                value={cardData.cvc}
                onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123"
                maxLength={4}
                disabled={loading}
              />
              {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taksit</label>
              <select
                value={installment}
                onChange={(e) => setInstallment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="1">1 (Taksitsiz)</option>
                <option value="2">2 taksit</option>
                <option value="3">3 taksit</option>
                <option value="6">6 taksit</option>
                <option value="9">9 taksit</option>
                <option value="12">12 taksit</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">📍 Fatura Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input
                type="text"
                value={buyerData.name}
                onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input
                type="text"
                value={buyerData.surname}
                onChange={(e) => setBuyerData({ ...buyerData, surname: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.surname ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                value={buyerData.email}
                onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ornek@email.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={buyerData.phone}
                onChange={(e) => setBuyerData({ ...buyerData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+905350000000"
                disabled={loading}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input
                type="text"
                value={buyerData.address}
                onChange={(e) => setBuyerData({ ...buyerData, address: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input
                type="text"
                value={buyerData.city}
                onChange={(e) => setBuyerData({ ...buyerData, city: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
              <input
                type="text"
                value={buyerData.zipCode}
                onChange={(e) => setBuyerData({ ...buyerData, zipCode: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        </div>


        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                İşlem Yapılıyor...
              </div>
            ) : (
              <>
                <span className="mr-2">Ödemeyi Tamamla</span>
                <span>
                  {selectedPlan.currency === 'TRY' ? '₺' : '$'}
                  {selectedPlan.price}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
  );
}