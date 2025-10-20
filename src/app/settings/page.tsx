'use client';

import { AlertTriangle, Bell, Building, ChevronRight, Download, Settings, Shield, Trash2, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Footer, Navbar } from '../../components';
import ThemeSelector from '../../components/ui/ThemeSelector';
import { useAuth } from '../../context/AuthContext';
import { useErrorTranslation } from '../../lib/hooks/useErrorTranslation';
import { userService } from '../../lib/services/user';
import { UpdateUserData } from '../../types/auth';

function SettingsContent() {
  const { user, isAuthenticated, hasInitialized, logout, refreshUser } = useAuth();
  const { translateValidationError } = useErrorTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: true,
      push: false,
    },
    privacy: {
      showPhone: false,
      showEmail: false,
      allowReviews: true,
    },
    business: {
      autoConfirm: false,
      workingHours: {
        monday: { start: '09:00', end: '18:00', closed: false },
        tuesday: { start: '09:00', end: '18:00', closed: false },
        wednesday: { start: '09:00', end: '18:00', closed: false },
        thursday: { start: '09:00', end: '18:00', closed: false },
        friday: { start: '09:00', end: '18:00', closed: false },
        saturday: { start: '10:00', end: '16:00', closed: false },
        sunday: { start: '10:00', end: '16:00', closed: true },
      },
    },
  });

  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState<UpdateUserData>({
    firstName: '',
    lastName: '',
    timezone: 'Europe/Istanbul',
    language: 'tr'
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hasInitialized && !isAuthenticated) {
      router.push('/auth');
    }
  }, [hasInitialized, isAuthenticated, router]);

  // Handle URL params for tab and redirect
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        timezone: user.timezone || 'Europe/Istanbul',
        language: user.language || 'tr'
      });
    }
  }, [user]);

  if (!hasInitialized) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] transition-colors duration-300">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--theme-primary)]"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key],
      },
    }));
  };

  const handleBusinessChange = (key: keyof typeof settings.business) => {
    if (key !== 'workingHours') {
      setSettings(prev => ({
        ...prev,
        business: {
          ...prev.business,
          [key]: !prev.business[key],
        },
      }));
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        workingHours: {
          ...prev.business.workingHours,
          [day]: {
            ...prev.business.workingHours[day as keyof typeof prev.business.workingHours],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    setShowDeleteModal(false);
    await logout();
    router.push('/');
  };

  const validateProfileData = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!profileData.firstName?.trim()) {
      errors.firstName = 'Ad gereklidir';
    } else if (profileData.firstName.trim().length < 2) {
      errors.firstName = 'Ad en az 2 karakter olmalıdır';
    }

    if (!profileData.lastName?.trim()) {
      errors.lastName = 'Soyad gereklidir';
    } else if (profileData.lastName.trim().length < 2) {
      errors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }

    return errors;
  };

  const handleProfileSave = async () => {
    const errors = validateProfileData();
    setProfileErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Lütfen form hatalarını düzeltin');
      return;
    }

    setProfileLoading(true);
    try {
      // Trim whitespace from string fields before sending
      const cleanedData = {
        ...profileData,
        firstName: profileData.firstName?.trim() || '',
        lastName: profileData.lastName?.trim() || '',
      };

      // Additional validation: ensure no empty strings after trimming
      if (!cleanedData.firstName) {
        setProfileErrors({ firstName: 'Ad gereklidir ve boş olamaz' });
        toast.error('Ad gereklidir ve boş olamaz');
        return;
      }
      if (!cleanedData.lastName) {
        setProfileErrors({ lastName: 'Soyad gereklidir ve boş olamaz' });
        toast.error('Soyad gereklidir ve boş olamaz');
        return;
      }

      const response = await userService.updateProfile(cleanedData);

      if (response.success) {
        await refreshUser(); // Refresh user context

        // Check if we need to redirect back to onboarding
        const redirect = searchParams.get('redirect');
        if (redirect === 'onboarding') {
          router.push('/onboarding');
        } else {
          // Show success toast
          toast.success('Profil başarıyla güncellendi!');
        }
      } else {
        // Handle API response with success: false
        toast.error('Profil güncellenirken bir hata oluştu');

        if (response.error?.code === 'VALIDATION_ERROR' && response.error?.details?.field) {
          // Handle field-specific validation errors with translation
          const translatedError = translateValidationError(response.error);

          if (translatedError) {
            setProfileErrors({ [translatedError.field]: translatedError.message });
          } else {
            const field = response.error.details.field;
            const message = response.error.message || 'Geçersiz değer';
            setProfileErrors({ [field]: message });
          }
        } else {
          const message = response.error?.message || response.message || 'Profil güncellenemiyor';
          setProfileErrors({ general: message });
        }
      }
    } catch (error: any) {
      // Clear previous errors
      setProfileErrors({});

      const errorData = error?.response?.data;

      if (errorData?.error?.code === 'VALIDATION_ERROR' && errorData?.error?.details?.field) {
        // Handle field-specific validation errors with translation
        const translatedError = translateValidationError(errorData.error);

        if (translatedError) {
          setProfileErrors({ [translatedError.field]: translatedError.message });
        } else {
          const field = errorData.error.details.field;
          const message = errorData.error.message || 'Geçersiz değer';
          setProfileErrors({ [field]: message });
        }
      } else if (errorData?.success === false && errorData?.error?.message) {
        // Handle API response errors
        setProfileErrors({ general: errorData.error.message });
      } else {
        // Handle general errors
        const message = errorData?.message || error?.message || 'Profil güncellenemiyor';
        setProfileErrors({ general: message });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileInputChange = (field: keyof UpdateUserData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const saveSettings = async () => {
    try {
      // TODO: Implement save settings API call
      // For now, we'll show a success message
      toast.success('Ayarlar başarıyla kaydedildi!');
      console.log('Saving settings:', settings);
    } catch (error) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu');
      console.error('Error saving settings:', error);
    }
  };

  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' },
  ];

  const tabs = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'general', label: 'Genel', icon: Settings },
    { key: 'theme', label: 'Tema', icon: Settings },
    { key: 'notifications', label: 'Bildirimler', icon: Bell },
    { key: 'privacy', label: 'Gizlilik', icon: Shield },
    { key: 'business', label: 'İşletme', icon: Building },
    { key: 'account', label: 'Hesap', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-background)] transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto py-6 sm:py-12 px-3 sm:px-4 lg:px-8 xl:max-w-5xl 2xl:max-w-6xl">
        <div className="bg-[var(--theme-card)]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden transition-colors duration-300 w-full">
          {/* Mobile Header */}
          <div className="sm:hidden bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Ayarlar</h1>
                <p className="text-xs text-white/80">Hesap ve uygulama ayarları</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-w-0">
            {/* Sidebar - Mobile Horizontal Tabs */}
            <div className="w-full lg:w-56 xl:w-64 2xl:w-72 bg-[var(--theme-backgroundSecondary)] lg:border-r border-b lg:border-b-0 border-[var(--theme-border)] transition-colors duration-300">
              <div className="p-3 sm:p-6">
                <h2 className="hidden sm:block text-lg font-semibold text-[var(--theme-foreground)] mb-4">Ayarlar</h2>
                <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto lg:overflow-x-visible">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-shrink-0 lg:w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-lg transition-colors ${activeTab === tab.key
                          ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] lg:border-r-2 border-[var(--theme-primary)]'
                          : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundTertiary)]'
                        }`}
                    >
                      <tab.icon className="w-4 h-4 lg:w-5 lg:h-5 lg:mr-3" />
                      <span className="hidden lg:inline ml-2 lg:ml-0">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6">Profil Bilgileri</h3>

                  {/* Completion notice if coming from onboarding */}
                  {searchParams.get('redirect') === 'onboarding' && (
                    <div className="bg-[var(--theme-warning)]/10 border-l-4 border-[var(--theme-warning)] p-4 mb-6">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-[var(--theme-warning)] mr-3" />
                        <div>
                          <p className="text-[var(--theme-foreground)] font-medium">Profil Tamamlama Gerekli</p>
                          <p className="text-[var(--theme-foregroundSecondary)] text-sm">İşletme oluşturmak için lütfen adınızı ve soyadınızı girin.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Error */}
                  {profileErrors.general && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                      <p className="text-red-700">{profileErrors.general}</p>
                    </div>
                  )}

                  <div className="space-y-4 sm:space-y-6 max-w-3xl">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-4">Kişisel Bilgiler</h4>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Ad *</label>
                          <input
                            type="text"
                            value={profileData.firstName || ''}
                            onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 ${profileErrors.firstName ? 'border-red-500' : 'border-[var(--theme-border)]'
                              }`}
                            placeholder="Adınızı girin"
                          />
                          {profileErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{profileErrors.firstName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Soyad *</label>
                          <input
                            type="text"
                            value={profileData.lastName || ''}
                            onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 ${profileErrors.lastName ? 'border-red-500' : 'border-[var(--theme-border)]'
                              }`}
                            placeholder="Soyadınızı girin"
                          />
                          {profileErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{profileErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Telefon</label>
                          <input
                            type="tel"
                            value={user?.phoneNumber || ''}
                            disabled
                            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)] cursor-not-allowed"
                            placeholder="+90 555 123 4567"
                          />
                          <p className="text-xs text-[var(--theme-foregroundMuted)] mt-1">Telefon numarası değiştirilemez</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Dil</label>
                          <select
                            value={profileData.language || 'tr'}
                            onChange={(e) => handleProfileInputChange('language', e.target.value)}
                            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
                          >
                            <option value="tr">Türkçe</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Zaman Dilimi</label>
                        <select
                          value={profileData.timezone || 'Europe/Istanbul'}
                          onChange={(e) => handleProfileInputChange('timezone', e.target.value)}
                          className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
                        >
                          <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                          <option value="Europe/London">London (GMT+0)</option>
                          <option value="America/New_York">New York (GMT-5)</option>
                        </select>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={handleProfileSave}
                          disabled={profileLoading}
                          className="px-6 py-3 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          {profileLoading ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Kaydediliyor...
                            </div>
                          ) : (
                            'Profil Bilgilerini Kaydet'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'general' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6">Genel Ayarlar</h3>
                  <div className="space-y-4 sm:space-y-6 max-w-3xl">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4">Dil ve Zaman</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Dil</label>
                          <select className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 text-sm sm:text-base">
                            <option value="tr">Türkçe</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Zaman Dilimi</label>
                          <select className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 text-sm sm:text-base">
                            <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6">Tema Ayarları</h3>
                  <div className="space-y-4 sm:space-y-6 max-w-3xl">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4">Tema Seçici</h4>
                      <p className="text-[var(--theme-foregroundSecondary)] text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                        Görünümü tercihinize göre özelleştirin. Renk teması ve karanlık/aydınlık mod seçeneklerini ayarlayın.
                      </p>

                      <div className="flex justify-center">
                        <ThemeSelector />
                      </div>

                      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-[var(--theme-backgroundSecondary)] rounded-lg border border-[var(--theme-border)]">
                        <h5 className="text-sm font-medium text-[var(--theme-foreground)] mb-2">Önizleme</h5>
                        <p className="text-xs text-[var(--theme-foregroundMuted)] mb-3 sm:mb-4 leading-relaxed">
                          Seçtiğiniz tema ayarları tüm sayfalarda uygulanır ve tarayıcınızda kaydedilir.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
                            <span className="text-xs text-[var(--theme-foregroundSecondary)]">Primary</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: 'var(--theme-accent)' }}></div>
                            <span className="text-xs text-[var(--theme-foregroundSecondary)]">Accent</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: 'var(--theme-success)' }}></div>
                            <span className="text-xs text-[var(--theme-foregroundSecondary)]">Success</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6 transition-colors duration-300">Bildirim Ayarları</h3>
                  <div className="space-y-4 sm:space-y-6 max-w-3xl">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Bildirim Türleri</h4>
                      <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-start lg:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">E-posta Bildirimleri</h5>
                            <p className="text-xs lg:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Yeni randevular ve güncellemeler için e-posta alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('email')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${settings.notifications.email ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-start lg:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">SMS Bildirimleri</h5>
                            <p className="text-xs lg:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Randevu hatırlatmaları için SMS alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('sms')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${settings.notifications.sms ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-start lg:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Push Bildirimleri</h5>
                            <p className="text-xs lg:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Tarayıcı bildirimleri alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('push')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${settings.notifications.push ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6 transition-colors duration-300">Gizlilik Ayarları</h3>
                  <div className="space-y-4 sm:space-y-6 max-w-3xl">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Profil Görünürlüğü</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Telefon Numarası Görünür</h5>
                            <p className="text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Müşteriler telefon numaranızı görebilsin</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('showPhone')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${settings.privacy.showPhone ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy.showPhone ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">E-posta Görünür</h5>
                            <p className="text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Müşteriler e-posta adresinizi görebilsin</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('showEmail')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${settings.privacy.showEmail ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Değerlendirmelere İzin Ver</h5>
                            <p className="text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Müşteriler işletmenizi değerlendirebilsin</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('allowReviews')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${settings.privacy.allowReviews ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacy.allowReviews ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6 transition-colors duration-300">İşletme Ayarları</h3>
                  <div className="space-y-4 sm:space-y-6 max-w-3xl">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Çalışma Saatleri</h4>
                      <div className="space-y-3 sm:space-y-4">
                        {days.map((day) => {
                          const daySettings = settings.business.workingHours[day.key as keyof typeof settings.business.workingHours];
                          return (
                            <div key={day.key} className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4 min-w-0">
                              <div className="w-full lg:w-20 flex-shrink-0">
                                <span className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">{day.label}</span>
                              </div>
                              <div className="flex items-center space-x-2 lg:space-x-2 min-w-0 flex-1 lg:flex-none">
                                <button
                                  onClick={() => handleWorkingHoursChange(day.key, 'closed', !daySettings.closed)}
                                  className={`px-2 lg:px-3 py-1 rounded text-xs font-medium transition-colors duration-300 flex-shrink-0 ${daySettings.closed ? 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]' : 'bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)]'
                                    }`}
                                >
                                  {daySettings.closed ? 'Kapalı' : 'Açık'}
                                </button>
                                {!daySettings.closed && (
                                  <>
                                    <input
                                      type="time"
                                      value={daySettings.start}
                                      onChange={(e) => handleWorkingHoursChange(day.key, 'start', e.target.value)}
                                      className="px-2 py-1 border border-[var(--theme-border)] bg-[var(--theme-background)] text-[var(--theme-foreground)] rounded text-xs focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-colors duration-300 w-20"
                                    />
                                    <span className="text-[var(--theme-foregroundMuted)] transition-colors duration-300 text-xs">-</span>
                                    <input
                                      type="time"
                                      value={daySettings.end}
                                      onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                                      className="px-2 py-1 border border-[var(--theme-border)] bg-[var(--theme-background)] text-[var(--theme-foreground)] rounded text-xs focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-colors duration-300 w-20"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Randevu Ayarları</h4>
                      <div className="flex items-start lg:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Otomatik Onay</h5>
                          <p className="text-xs lg:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Gelen randevuları otomatik olarak onayla</p>
                        </div>
                        <button
                          onClick={() => handleBusinessChange('autoConfirm')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${settings.business.autoConfirm ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.business.autoConfirm ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6 transition-colors duration-300">Hesap Ayarları</h3>
                  <div className="space-y-4 sm:space-y-6 max-w-3xl">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Hesap İşlemleri</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <button
                          onClick={() => {/* TODO: Export data */ }}
                          className="w-full flex items-center justify-between p-3 lg:p-4 bg-[var(--theme-info)]/10 border border-[var(--theme-info)]/30 rounded-lg hover:bg-[var(--theme-info)]/20 transition-colors duration-300"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <Download className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--theme-info)] mr-2 lg:mr-3 transition-colors duration-300 flex-shrink-0" />
                            <div className="text-left min-w-0">
                              <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Verilerimi İndir</h5>
                              <p className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Tüm verilerinizi JSON formatında indirin</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
                        </button>

                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full flex items-center justify-between p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <Trash2 className="w-4 h-4 lg:w-5 lg:h-5 text-red-600 mr-2 lg:mr-3 flex-shrink-0" />
                            <div className="text-left min-w-0">
                              <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Hesabımı Sil</h5>
                              <p className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Bu işlem geri alınamaz</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-[var(--theme-foregroundMuted)] transition-colors duration-300 flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button - Only show for non-profile tabs */}
              {activeTab !== 'profile' && (
                <div className="mt-6 lg:mt-8 flex justify-center lg:justify-end">
                  <button
                    onClick={saveSettings}
                    className="w-full lg:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl lg:transform lg:hover:-translate-y-0.5 text-sm lg:text-base"
                  >
                    Ayarları Kaydet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal - Mobile Responsive */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--theme-card)] rounded-lg p-4 lg:p-6 max-w-md w-full border border-[var(--theme-border)] transition-colors duration-300">
            <h3 className="text-base lg:text-lg font-semibold text-[var(--theme-foreground)] mb-3 lg:mb-4">Hesabımı Sil</h3>
            <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-4 lg:mb-6 leading-relaxed">
              Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
            </p>
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 lg:py-2 border border-[var(--theme-border)] text-[var(--theme-foregroundSecondary)] rounded-lg font-semibold hover:bg-[var(--theme-backgroundSecondary)] transition-colors text-sm lg:text-base"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 lg:py-2 bg-[var(--theme-error)] text-white rounded-lg font-semibold hover:bg-[var(--theme-error)]/80 transition-colors text-sm lg:text-base"
              >
                Hesabımı Sil
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--theme-background)] transition-colors duration-300">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--theme-primary)]"></div>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}