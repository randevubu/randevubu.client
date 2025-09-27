'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar, Footer } from '../../components';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeSelector from '../../components/ui/ThemeSelector';
import { userService } from '../../lib/services/user';
import { UpdateUserData } from '../../types/auth';
import { useErrorTranslation } from '../../lib/hooks/useErrorTranslation';
import toast from 'react-hot-toast';

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

  const saveSettings = () => {
    // TODO: Implement save settings API call
    console.log('Saving settings:', settings);
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
    { key: 'profile', label: 'Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key: 'general', label: 'Genel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { key: 'theme', label: 'Tema', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5v4h2V3zM3 9h4v6H3V9z M15 5v4h2V5h-2zM15 11v4h2v-4h-2zM17 3h2a2 2 0 012 2v12a4 4 0 01-4 4h-4a2 2 0 01-2-2V5a2 2 0 012-2h4z' },
    { key: 'notifications', label: 'Bildirimler', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { key: 'privacy', label: 'Gizlilik', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { key: 'business', label: 'İşletme', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { key: 'account', label: 'Hesap', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-background)] transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
        <div className="bg-[var(--theme-card)]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
          {/* Mobile Header */}
          <div className="sm:hidden bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Ayarlar</h1>
                <p className="text-xs text-white/80">Hesap ve uygulama ayarları</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row">
            {/* Sidebar - Mobile Horizontal Tabs */}
            <div className="w-full sm:w-64 bg-[var(--theme-backgroundSecondary)] sm:border-r border-b sm:border-b-0 border-[var(--theme-border)] transition-colors duration-300">
              <div className="p-3 sm:p-6">
                <h2 className="hidden sm:block text-lg font-semibold text-[var(--theme-foreground)] mb-4">Ayarlar</h2>
                <nav className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-1 overflow-x-auto sm:overflow-x-visible">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-shrink-0 sm:w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.key
                          ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] sm:border-r-2 border-[var(--theme-primary)]'
                          : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundTertiary)]'
                      }`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span className="hidden sm:inline ml-2 sm:ml-0">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-foreground)] mb-4 sm:mb-6">Profil Bilgileri</h3>
                  
                  {/* Completion notice if coming from onboarding */}
                  {searchParams.get('redirect') === 'onboarding' && (
                    <div className="bg-[var(--theme-warning)]/10 border-l-4 border-[var(--theme-warning)] p-4 mb-6">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-[var(--theme-warning)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
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

                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-4">Kişisel Bilgiler</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">Ad *</label>
                          <input
                            type="text"
                            value={profileData.firstName || ''}
                            onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 ${
                              profileErrors.firstName ? 'border-red-500' : 'border-[var(--theme-border)]'
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 ${
                              profileErrors.lastName ? 'border-red-500' : 'border-[var(--theme-border)]'
                            }`}
                            placeholder="Soyadınızı girin"
                          />
                          {profileErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{profileErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
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
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4">Dil ve Zaman</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                  <div className="space-y-4 sm:space-y-6">
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
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Bildirim Türleri</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">E-posta Bildirimleri</h5>
                            <p className="text-xs sm:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Yeni randevular ve güncellemeler için e-posta alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('email')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${
                              settings.notifications.email ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">SMS Bildirimleri</h5>
                            <p className="text-xs sm:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Randevu hatırlatmaları için SMS alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('sms')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${
                              settings.notifications.sms ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Push Bildirimleri</h5>
                            <p className="text-xs sm:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Tarayıcı bildirimleri alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('push')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${
                              settings.notifications.push ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
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
                  <div className="space-y-4 sm:space-y-6">
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                              settings.privacy.showPhone ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.privacy.showPhone ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                              settings.privacy.showEmail ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.privacy.showEmail ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                              settings.privacy.allowReviews ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.privacy.allowReviews ? 'translate-x-6' : 'translate-x-1'
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
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Çalışma Saatleri</h4>
                      <div className="space-y-3 sm:space-y-4">
                        {days.map((day) => {
                          const daySettings = settings.business.workingHours[day.key as keyof typeof settings.business.workingHours];
                          return (
                            <div key={day.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                              <div className="w-full sm:w-24">
                                <span className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">{day.label}</span>
                              </div>
                              <div className="flex items-center space-x-2 sm:space-x-4">
                                <button
                                  onClick={() => handleWorkingHoursChange(day.key, 'closed', !daySettings.closed)}
                                  className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-colors duration-300 flex-shrink-0 ${
                                    daySettings.closed ? 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]' : 'bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)]'
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
                                      className="px-2 sm:px-3 py-1 sm:py-2 border border-[var(--theme-border)] bg-[var(--theme-background)] text-[var(--theme-foreground)] rounded text-xs sm:text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-colors duration-300"
                                    />
                                    <span className="text-[var(--theme-foregroundMuted)] transition-colors duration-300 text-xs sm:text-sm">-</span>
                                    <input
                                      type="time"
                                      value={daySettings.end}
                                      onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                                      className="px-2 sm:px-3 py-1 sm:py-2 border border-[var(--theme-border)] bg-[var(--theme-background)] text-[var(--theme-foreground)] rounded text-xs sm:text-sm focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-colors duration-300"
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
                      <div className="flex items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Otomatik Onay</h5>
                          <p className="text-xs sm:text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Gelen randevuları otomatik olarak onayla</p>
                        </div>
                        <button
                          onClick={() => handleBusinessChange('autoConfirm')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 flex-shrink-0 ${
                            settings.business.autoConfirm ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-backgroundSecondary)]'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.business.autoConfirm ? 'translate-x-6' : 'translate-x-1'
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
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4 transition-colors duration-300">Hesap İşlemleri</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <button
                          onClick={() => {/* TODO: Export data */}}
                          className="w-full flex items-center justify-between p-3 sm:p-4 bg-[var(--theme-info)]/10 border border-[var(--theme-info)]/30 rounded-lg hover:bg-[var(--theme-info)]/20 transition-colors duration-300"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--theme-info)] mr-2 sm:mr-3 transition-colors duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="text-left min-w-0">
                              <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Verilerimi İndir</h5>
                              <p className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Tüm verilerinizi JSON formatında indirin</p>
                            </div>
                          </div>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full flex items-center justify-between p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <div className="text-left min-w-0">
                              <h5 className="text-sm font-medium text-[var(--theme-foreground)] transition-colors duration-300">Hesabımı Sil</h5>
                              <p className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300 leading-relaxed">Bu işlem geri alınamaz</p>
                            </div>
                          </div>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--theme-foregroundMuted)] transition-colors duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end">
                <button
                  onClick={saveSettings}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl sm:transform sm:hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  Ayarları Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal - Mobile Responsive */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--theme-card)] rounded-lg p-4 sm:p-6 max-w-md w-full border border-[var(--theme-border)] transition-colors duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-3 sm:mb-4">Hesabımı Sil</h3>
            <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-4 sm:mb-6 leading-relaxed">
              Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 sm:py-2 border border-[var(--theme-border)] text-[var(--theme-foregroundSecondary)] rounded-lg font-semibold hover:bg-[var(--theme-backgroundSecondary)] transition-colors text-sm sm:text-base"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 sm:py-2 bg-[var(--theme-error)] text-white rounded-lg font-semibold hover:bg-[var(--theme-error)]/80 transition-colors text-sm sm:text-base"
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