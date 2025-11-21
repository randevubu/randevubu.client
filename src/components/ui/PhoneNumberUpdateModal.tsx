'use client';

import { useState } from 'react';
import { Phone, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Dialog from './Dialog';
import { authService } from '@/src/lib/services/auth';
import { userService } from '@/src/lib/services/user';
import { VerificationPurpose } from '@/src/types/enums';
import { extractErrorMessage, extractApiError } from '@/src/lib/utils/errorExtractor';
import toast from 'react-hot-toast';

interface PhoneNumberUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone: string;
  onSuccess: () => void;
}

type Step = 'phone' | 'otp';

export default function PhoneNumberUpdateModal({
  isOpen,
  onClose,
  currentPhone,
  onSuccess,
}: PhoneNumberUpdateModalProps) {
  const [step, setStep] = useState<Step>('phone');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const resetModal = () => {
    setStep('phone');
    setNewPhoneNumber('');
    setVerificationCode('');
    setError('');
    setCountdown(0);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetModal();
      onClose();
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Construct full phone number
    const fullPhone = `+90${phone}`;

    // Basic phone validation - should be 10 digits for Turkish numbers
    if (phone.length !== 10) {
      setError('Telefon numarası 10 haneli olmalıdır');
      return false;
    }

    // Check if same as current phone
    if (fullPhone === currentPhone) {
      setError('Yeni telefon numarası mevcut numaranızla aynı olamaz');
      return false;
    }

    return true;
  };

  const handleSendVerification = async () => {
    setError('');

    // Validate phone number
    if (!validatePhoneNumber(newPhoneNumber)) {
      return;
    }

    setIsLoading(true);

    try {
      // Send with full phone number including country code
      await authService.sendVerification({
        phoneNumber: `+90${newPhoneNumber}`,
        purpose: VerificationPurpose.PHONE_CHANGE,
      });

      toast.success('Doğrulama kodu gönderildi!');
      setStep('otp');
      setCountdown(600); // 10 minutes countdown

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const apiError = extractApiError(err);

      // Handle rate limiting
      if (apiError?.code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = apiError.details?.retryAfter;
        if (retryAfter) {
          setError(`Çok fazla deneme yaptınız. ${Math.ceil(retryAfter / 60)} dakika sonra tekrar deneyin.`);
        } else {
          setError('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.');
        }
      } else {
        const errorMessage = extractErrorMessage(err, 'Doğrulama kodu gönderilemedi');
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndUpdate = async () => {
    setError('');

    // Validate OTP
    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Doğrulama kodu 6 haneli olmalıdır');
      return;
    }

    setIsLoading(true);

    try {
      // Send with full phone number including country code
      await userService.changePhoneNumber({
        newPhoneNumber: `+90${newPhoneNumber}`,
        verificationCode,
      });

      toast.success('Telefon numaranız başarıyla güncellendi! Yeni numaranızla giriş yapın.');

      // Reset modal and trigger success callback (logout)
      resetModal();
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const apiError = extractApiError(err);

      // Handle specific error codes
      if (apiError?.code === 'UNAUTHORIZED') {
        setError('Geçersiz veya süresi dolmuş doğrulama kodu');
      } else if (apiError?.code === 'PHONE_ALREADY_EXISTS') {
        setError('Bu telefon numarası başka bir kullanıcıya ait');
      } else if (apiError?.code === 'RATE_LIMIT_EXCEEDED') {
        setError('Çok fazla hatalı deneme. Lütfen daha sonra tekrar deneyin.');
      } else {
        const errorMessage = extractErrorMessage(err, 'Telefon numarası güncellenemedi');
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Telefon Numarasını Değiştir" size="md">
      <div className="space-y-6">
        {/* Current Phone Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Mevcut Telefon Numaranız</p>
              <p className="text-base font-semibold text-gray-900">{currentPhone}</p>
            </div>
          </div>
        </div>

        {/* Step 1: Enter New Phone Number */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="newPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                Yeni Telefon Numarası
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-gray-700 font-medium text-base">+90</span>
                </div>
                <input
                  id="newPhone"
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => {
                    // Only allow digits, no spaces
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setNewPhoneNumber(value);
                    setError('');
                  }}
                  placeholder="5551234567"
                  maxLength={10}
                  className="w-full pl-14 pr-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Telefon numaranızı 0 olmadan girin (örn: 5551234567)
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleSendVerification}
              disabled={isLoading || !newPhoneNumber}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <span>Doğrulama Kodu Gönder</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Enter OTP */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Doğrulama kodu gönderildi
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    +90{newPhoneNumber} numarasına gönderilen 6 haneli kodu girin
                  </p>
                  {countdown > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Kod {formatCountdown(countdown)} sonra geçersiz olacak
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                Doğrulama Kodu
              </label>
              <input
                id="otp"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  // Only allow digits and max 6 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleVerifyAndUpdate}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Doğrulanıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Telefon Numarasını Güncelle</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setStep('phone');
                  setVerificationCode('');
                  setError('');
                }}
                disabled={isLoading}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Farklı Numara Dene
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>Önemli:</strong> Telefon numaranız değiştirildikten sonra mevcut oturumunuz sonlandırılacak ve
            yeni telefon numaranız ile giriş yapmanız gerekecektir.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
