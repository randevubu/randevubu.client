'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../lib/services/auth';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api';
import { formatPhoneForDisplay, formatPhoneForAPI } from '../../lib/utils/phone';
import { handleApiError, showSuccessToast } from '../../lib/utils/toast';
import { VerificationPurpose } from '../../types/enums';

type AuthStep = 'phone' | 'otp' | 'register';

export default function PhoneAuth() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setIsLoading(true);
    
    // Format phone number to international format (+90...)
    const formattedPhoneNumber = formatPhoneForAPI(phoneNumber);
    
    try {
      const response = await authService.sendVerification({
        phoneNumber: formattedPhoneNumber,
        purpose: VerificationPurpose.REGISTRATION
      });
      
      if (response.success) {
        setStep('otp');
        showSuccessToast('Doğrulama kodu gönderildi');
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;
    
    setIsLoading(true);
    
    // Format phone number to international format (+90...)
    const formattedPhoneNumber = formatPhoneForAPI(phoneNumber);
    
    const result = await login(formattedPhoneNumber, otp);
    
    if (result.success) {
      showSuccessToast('Giriş başarılı! Yönlendiriliyorsunuz...');
      // Login successful - redirect to home page
      window.location.href = '/';
    }
    // Note: Error handling is done inside the login function in AuthContext
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName) return;
    
    setIsLoading(true);
    
    // For now, simulate successful registration
    // In the future, this should call a registration API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccessToast('Kayıt başarılı! Dashboard\'a yönlendiriliyorsunuz...');
      window.location.href = '/dashboard';
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneForDisplay(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="bg-[var(--theme-card)] rounded-3xl shadow-2xl p-8 border border-[var(--theme-border)] transition-colors duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-2xl font-black text-[var(--theme-cardForeground)] transition-colors duration-300">RandevuBu</span>
        </Link>
        
        {step === 'phone' && (
          <>
            <h1 className="text-3xl font-bold text-[var(--theme-cardForeground)] mb-2 transition-colors duration-300">Hoş Geldiniz</h1>
            <p className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Telefon numaranızla giriş yapın</p>
          </>
        )}
        
        {step === 'otp' && (
          <>
            <h1 className="text-3xl font-bold text-[var(--theme-cardForeground)] mb-2 transition-colors duration-300">Doğrulama Kodu</h1>
            <p className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300">
              <span className="font-medium">{phoneNumber}</span> numarasına gönderilen 6 haneli kodu girin
            </p>
          </>
        )}
        
        {step === 'register' && (
          <>
            <h1 className="text-3xl font-bold text-[var(--theme-cardForeground)] mb-2 transition-colors duration-300">Hoş Geldiniz!</h1>
            <p className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Salon bilgilerinizi tamamlayın</p>
          </>
        )}
        
      </div>

      {/* Phone Step */}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
              Telefon Numarası
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-[var(--theme-foregroundMuted)] text-sm transition-colors duration-300">🇹🇷 +90</span>
              </div>
              <input
                id="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="block w-full pl-16 pr-4 py-4 border border-[var(--theme-border)] rounded-2xl text-lg placeholder-[var(--theme-foregroundMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
                placeholder="0555 123 45 67"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phoneNumber}
            className="w-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] py-4 px-6 rounded-2xl font-semibold text-lg hover:from-[var(--theme-primaryHover)] hover:to-[var(--theme-accentHover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
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
            <label htmlFor="otp" className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
              Doğrulama Kodu
            </label>
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="block w-full px-4 py-4 border border-[var(--theme-border)] rounded-2xl text-xl text-center font-mono placeholder-[var(--theme-foregroundMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] tracking-widest bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] py-4 px-6 rounded-2xl font-semibold text-lg hover:from-[var(--theme-primaryHover)] hover:to-[var(--theme-accentHover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
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
                            setOtp('');
              }}
              className="text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium transition-colors duration-300"
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
            <label htmlFor="businessName" className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
              İşletme Adı
            </label>
            <input
              id="businessName"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="block w-full px-4 py-4 border border-[var(--theme-border)] rounded-2xl text-lg placeholder-[var(--theme-foregroundMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
              placeholder="Salon Güzellik Merkezi"
            />
          </div>

          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
              Sahip Adı
            </label>
            <input
              id="ownerName"
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="block w-full px-4 py-4 border border-[var(--theme-border)] rounded-2xl text-lg placeholder-[var(--theme-foregroundMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
              placeholder="Ahmet Yılmaz"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !businessName || !ownerName}
            className="w-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] py-4 px-6 rounded-2xl font-semibold text-lg hover:from-[var(--theme-primaryHover)] hover:to-[var(--theme-accentHover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
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
        <p className="text-sm text-[var(--theme-foregroundMuted)] transition-colors duration-300">
          Devam ederek{' '}
          <Link href="#" className="text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium transition-colors duration-300">
            Kullanım Şartları
          </Link>{' '}
          ve{' '}
          <Link href="#" className="text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium transition-colors duration-300">
            Gizlilik Politikası
          </Link>
          'nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}