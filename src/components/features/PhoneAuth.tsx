'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useApiError } from '../../lib/hooks/useApiError';
import { authService } from '../../lib/services/auth';
import { formatPhoneForAPI, formatPhoneForDisplay } from '../../lib/utils/phone';
import { VerificationPurpose } from '../../types/enums';

type AuthStep = 'phone' | 'otp' | 'register';

export default function PhoneAuth() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const { login, isAuthenticated, hasInitialized } = useAuth();
  const { handleError } = useApiError();
  // const commonT = useCommonTranslations();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Handle redirect in useEffect to avoid setState during render
  useEffect(() => {
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      setShouldRedirect(true);
      toast.success('Zaten giriş yapmışsınız, yönlendiriliyorsunuz...', { duration: 2000 });
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  // Show loading while checking authentication
  if (!hasInitialized) {
    return (
      <div className="bg-[var(--theme-card)] rounded-3xl shadow-2xl p-8 border border-[var(--theme-border)] transition-colors duration-300">
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">Kimlik doğrulanıyor...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen if redirecting
  if (shouldRedirect) {
    return (
      <div className="bg-[var(--theme-card)] rounded-3xl shadow-2xl p-8 border border-[var(--theme-border)] transition-colors duration-300">
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">Yönlendiriliyor...</span>
          </div>
        </div>
      </div>
    );
  }

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
        toast.success('Doğrulama kodu gönderildi');
      } else {
        // This case might not be an AxiosError, so we need to handle it differently
        handleError(new Error('API returned unsuccessful response') as any);
      }
    } catch (error) {
      handleError(error as any);
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
      toast.success('Giriş başarılı!');
      // TEMPORARILY DISABLED: Login successful - redirect to home page
      // window.location.href = '/';
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
      
      toast.success('Kayıt başarılı! Dashboard\'a yönlendiriliyorsunuz...');
      window.location.href = '/dashboard';
    } catch (error) {
      handleError(error as any);
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
              <div className="flex rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-background)] focus-within:ring-2 focus-within:ring-[var(--theme-primary)] focus-within:border-[var(--theme-primary)] transition-all duration-300">
                <div 
                  className="flex items-center px-4 py-4 border-r border-[var(--theme-border)] bg-[var(--theme-muted)] rounded-l-2xl cursor-pointer hover:bg-[var(--theme-mutedHover)] transition-colors duration-200"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                >
                  <span className="text-xl mr-2">🇹🇷</span>
                  <span className="text-[var(--theme-foreground)] text-xl">+90</span>
                  <svg 
                    className={`w-4 h-4 ml-2 text-[var(--theme-foregroundMuted)] transition-transform duration-200 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="flex-1 px-4 py-4 text-lg placeholder-[var(--theme-foregroundMuted)] focus:outline-none bg-transparent text-[var(--theme-foreground)] transition-colors duration-300 rounded-r-2xl"
                  placeholder="0555 123 45 67"
                />
              </div>
              
              {/* Dropdown */}
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-2xl shadow-lg z-10 overflow-hidden">
                  <div 
                    className="flex items-center px-4 py-4 hover:bg-[var(--theme-muted)] cursor-pointer transition-colors duration-200"
                    onClick={() => setIsCountryDropdownOpen(false)}
                  >
                    <span className="text-lg mr-3">🇹🇷</span>
                    <div className="flex-1">
                      <div className="text-[var(--theme-foreground)] font-medium">Turkey</div>
                      <div className="text-sm text-[var(--theme-foregroundMuted)]">+90</div>
                    </div>
                    <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
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