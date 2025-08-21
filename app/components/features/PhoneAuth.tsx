'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../lib/services/auth';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api';
import { formatPhoneForDisplay, formatPhoneForAPI } from '../../lib/utils/phone';

type AuthStep = 'phone' | 'otp' | 'register';

export default function PhoneAuth() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setErrorMessage('');
    setIsLoading(true);
    
    // Format phone number to international format (+90...)
    const formattedPhoneNumber = formatPhoneForAPI(phoneNumber);
    
    try {
      const response = await authService.sendVerification({
        phoneNumber: formattedPhoneNumber,
        purpose: 'REGISTRATION'
      });
      
      if (response.success) {
        setStep('otp');
      } else {
        setErrorMessage(response.message || 'Kod gönderilirken bir hata oluştu.');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      setErrorMessage(
        axiosError.response?.data?.message || 
        'Kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;
    
    setErrorMessage('');
    setIsLoading(true);
    
    // Format phone number to international format (+90...)
    const formattedPhoneNumber = formatPhoneForAPI(phoneNumber);
    
    try {
      const result = await login(formattedPhoneNumber, otp);
      
      if (result.success) {
        // Login successful - redirect to home page
        window.location.href = '/';
      } else {
        setErrorMessage(result.error || 'Doğrulama kodu geçersiz. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      setErrorMessage('Doğrulama kodu geçersiz. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName) return;
    
    setErrorMessage('');
    setIsLoading(true);
    
    // For now, simulate successful registration
    // In the future, this should call a registration API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Kayıt başarılı! Dashboard\'a yönlendiriliyorsunuz...');
      window.location.href = '/dashboard';
    } catch (error) {
      setErrorMessage('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneForDisplay(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-2xl font-black text-gray-900">RandevuBu</span>
        </Link>
        
        {step === 'phone' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h1>
            <p className="text-gray-600">Telefon numaranızla giriş yapın</p>
          </>
        )}
        
        {step === 'otp' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Doğrulama Kodu</h1>
            <p className="text-gray-600">
              <span className="font-medium">{phoneNumber}</span> numarasına gönderilen 6 haneli kodu girin
            </p>
          </>
        )}
        
        {step === 'register' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz!</h1>
            <p className="text-gray-600">Salon bilgilerinizi tamamlayın</p>
          </>
        )}
        
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Phone Step */}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon Numarası
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">🇹🇷 +90</span>
              </div>
              <input
                id="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="block w-full pl-16 pr-4 py-4 border border-gray-300 rounded-2xl text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0555 123 45 67"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phoneNumber}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Kod Gönderiliyor...</span>
              </div>
            ) : (
              'Doğrulama Kodu Gönder'
            )}
          </button>
        </form>
      )}

      {/* OTP Step */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Doğrulama Kodu
            </label>
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="block w-full px-4 py-4 border border-gray-300 rounded-2xl text-xl text-center font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tracking-widest"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Doğrulanıyor...</span>
              </div>
            ) : (
              'Doğrula ve Devam Et'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setErrorMessage('');
                setOtp('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Telefon numarasını değiştir
            </button>
          </div>
        </form>
      )}

      {/* Register Step */}
      {step === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              İşletme Adı
            </label>
            <input
              id="businessName"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="block w-full px-4 py-4 border border-gray-300 rounded-2xl text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Salon Güzellik Merkezi"
            />
          </div>

          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
              Sahip Adı
            </label>
            <input
              id="ownerName"
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="block w-full px-4 py-4 border border-gray-300 rounded-2xl text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !businessName || !ownerName}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Kayıt Oluşturuluyor...</span>
              </div>
            ) : (
              'Hesabı Oluştur'
            )}
          </button>
        </form>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Devam ederek{' '}
          <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Kullanım Şartları
          </Link>{' '}
          ve{' '}
          <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Gizlilik Politikası
          </Link>
          'nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}