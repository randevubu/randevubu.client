'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { businessService } from '../../../lib/services/business';
import { FormField } from '../../../components/ui/FormField';
import { handleApiError, showSuccessToast } from '../../../lib/utils/toast';
import ThemeSelector from '../../../components/ui/ThemeSelector';
import BusinessHoursSettings from '../../../components/ui/BusinessHoursSettings';
import { BusinessImageManager } from '../../../components/features/BusinessImageManager';
import { StaffPrivacySettings } from '../../../components/features/StaffPrivacySettings';
import BusinessNotificationSettings from '../../../components/features/BusinessNotificationSettings';
import { Business, UpdateBusinessData, BusinessType } from '../../../types/business';
import { canAccessSettingsPage, canAccessSettingsSection } from '../../../lib/utils/permissions';

interface SettingsFormData {
  // Appearance Settings (theme now handled by ThemeSelector)
  language: string;
  timeFormat: string;
  
  // Notification Settings
  smsNotifications: string;
  pushNotifications: string;
  appointmentReminders: string;
  reminderTiming: string;
  soundNotifications: string;
  
  // Appointment Settings
  reminderMinutes: string;
  activeCustomerMonths: string;
  autoApproveOnlineAppointments: string;
  onlineAppointmentAccess: string;
  maxCancellations: string;
  maxNoShows: string;
  
  // Account Settings
  autoLogout: string;
  twoFactorAuth: string;
  loginNotifications: string;
}

// Theme options are now handled by ThemeSelector component

const languageOptions = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' },
];



const timeFormatOptions = [
  { value: '24h', label: '24 Saat (14:30)' },
  { value: '12h', label: '12 Saat (2:30 PM)' },
];

const reminderTimingOptions = [
  { value: '15', label: '15 dakika önce' },
  { value: '30', label: '30 dakika önce' },
  { value: '60', label: '1 saat önce' },
  { value: '120', label: '2 saat önce' },
  { value: '1440', label: '1 gün önce' },
];

const autoLogoutOptions = [
  { value: 'never', label: 'Hiçbir zaman' },
  { value: '15', label: '15 dakika' },
  { value: '30', label: '30 dakika' },
  { value: '60', label: '1 saat' },
  { value: '240', label: '4 saat' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [business, setBusiness] = useState<Business | null>(null);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessData, setBusinessData] = useState<UpdateBusinessData>({
    name: '',
    description: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'Turkey',
    postalCode: '',
    primaryColor: '#FF6B6B'
  });
  const [formData, setFormData] = useState<SettingsFormData>({
    // Appearance Settings (theme now handled by ThemeSelector)
    language: 'tr',
    timeFormat: '24h',
    
    // Notification Settings
    smsNotifications: 'true',
    pushNotifications: 'true',
    appointmentReminders: 'true',
    reminderTiming: '60',
    soundNotifications: 'true',
    
    // Appointment Settings
    reminderMinutes: '60',
    activeCustomerMonths: '2',
    autoApproveOnlineAppointments: 'false',
    onlineAppointmentAccess: 'none',
    maxCancellations: '10',
    maxNoShows: '10',
    
    // Account Settings
    autoLogout: '60',
    twoFactorAuth: 'false',
    loginNotifications: 'true',
  });

  const [expandedSections, setExpandedSections] = useState({
    workingHours: false, // Start collapsed by default
    appointmentConfig: false
  });

  const allTabs = [
    { id: 'appearance', name: 'Görünüm', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z' },
    { id: 'notifications', name: 'Hatırlatma Ayarları', icon: 'M15 17h5l-5 5v-5zM4.021 8.583a11.003 11.003 0 0114.99 0A7.5 7.5 0 0012 3c-2.31 0-4.438 1.04-5.832 2.712A7.48 7.48 0 014.02 8.583z' },
    { id: 'business', name: 'İşletme Ayarları', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'images', name: 'Görsel Yönetimi', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'appointments', name: 'Randevu Ayarları', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'staff', name: 'Personel Ayarları', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  // Filter tabs based on user permissions
  const tabs = allTabs.filter(tab => canAccessSettingsSection(user, tab.id));

  useEffect(() => {
    if (user && canAccessSettingsPage(user)) {
      loadUserSettings();
      loadBusinessData();
      loadBusinessTypes();
      loadSectionPreferences();
    } else if (user && !canAccessSettingsPage(user)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Set the first available tab as active when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const loadSectionPreferences = () => {
    try {
      const savedPreferences = localStorage.getItem('settingsSectionPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        setExpandedSections(prev => ({ ...prev, ...preferences }));
      }
    } catch (error) {
      console.error('Error loading section preferences:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load user settings from localStorage or API
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setFormData(prev => ({ ...prev, ...parsedSettings }));
      }
      
      // Theme is now handled by ThemeContext
      
    } catch (error) {
      console.error('Settings loading failed:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinessData = async () => {
    try {
      setBusinessLoading(true);
      const response = await businessService.getMyBusiness();
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const businessInfo = response.data.businesses[0];
        setBusiness(businessInfo);
        setBusinessData({
          name: businessInfo.name || '',
          description: businessInfo.description || '',
          phone: businessInfo.phone || '',
          website: businessInfo.website || '',
          address: businessInfo.address || '',
          city: businessInfo.city || '',
          state: businessInfo.state || '',
          country: businessInfo.country || 'Turkey',
          postalCode: businessInfo.postalCode || '',
          primaryColor: businessInfo.primaryColor || '#FF6B6B'
        });
      }
    } catch (error) {
      console.error('Business loading failed:', error);
      handleApiError(error);
    } finally {
      setBusinessLoading(false);
    }
  };

  const loadBusinessTypes = async () => {
    try {
      const response = await businessService.getBusinessTypes();
      if (response.success && response.data) {
        setBusinessTypes(response.data);
      }
    } catch (error) {
      console.error('Business types loading failed:', error);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Theme changes are now handled by ThemeContext

    // Auto-save the change
    try {
      setIsSaving(true);
      
      // Save to localStorage (in a real app, this would be an API call)
      const updatedData = { ...formData, [name]: value };
      localStorage.setItem('userSettings', JSON.stringify(updatedData));
      
      showSuccessToast('Ayar güncellendi');
      
    } catch (error) {
      console.error('Setting save failed:', error);
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBusinessInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
  };

  const handleBusinessSave = async () => {
    if (!business) return;

    try {
      setIsSaving(true);
      
      // Clean the data before sending - remove empty strings that might cause validation errors
      const cleanedData = { ...businessData };
      
      // Remove empty website URL to avoid validation error
      if (!cleanedData.website || cleanedData.website.trim() === '') {
        delete cleanedData.website;
      }
      
      // Remove other empty optional fields that might cause validation issues
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key as keyof UpdateBusinessData] === '' || cleanedData[key as keyof UpdateBusinessData] == null) {
          delete cleanedData[key as keyof UpdateBusinessData];
        }
      });

      const response = await businessService.patchBusiness(business.id, cleanedData);
      if (response.success) {
        showSuccessToast('İşletme bilgileri güncellendi');
        await loadBusinessData();
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Business update failed:', error);
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // No longer needed as all settings are always editable
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Ayarlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Theme Setting */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Tema Seçimi</h3>
          </div>
          <p className="text-[var(--theme-foregroundSecondary)] text-xs mb-4">
            Görünümü tercihinize göre özelleştirin. Renk teması ve karanlık/aydınlık mod seçeneklerini ayarlayın.
          </p>
          
          <div className="block sm:hidden">
            <ThemeSelector mobile />
          </div>
          <div className="hidden sm:flex justify-center">
            <ThemeSelector />
          </div>
        </div>

        {/* Language Setting */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Dil Seçimi</h3>
          </div>
          <FormField
            label=""
            name="language"
            type="select"
            value={formData.language}
            onChange={handleInputChange}
            isEditing={true}
            displayValue={languageOptions.find(opt => opt.value === formData.language)?.label}
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </FormField>
        </div>

        {/* Format Settings */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-info)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Saat Formatı</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Saat Formatı</label>
            <FormField
              label=""
              name="timeFormat"
              type="select"
              value={formData.timeFormat}
              onChange={handleInputChange}
              isEditing={true}
              displayValue={timeFormatOptions.find(opt => opt.value === formData.timeFormat)?.label}
            >
              {timeFormatOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Business Notification Settings */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">İş Bildirimleri</h3>
            <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
              Müşterilerinize gönderilecek randevu hatırlatma ayarlarını yönetin
            </p>
          </div>
        </div>

        <BusinessNotificationSettings />
      </div>
    </div>
  );

  const renderAnnouncementSettings = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Announcement Configuration */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.088a19.2 19.2 0 012.356-1.618c.224-.128.336-.192.448-.192.112 0 .224.064.448.192.82.468 1.527.885 2.356 1.618A20.932 20.932 0 0121 12c0 4.991-1.343 9.207-3.962 12.51a19.2 19.2 0 01-2.356 1.618c-.224.128-.336.192-.448.192-.112 0-.224-.064-.448-.192a19.2 19.2 0 01-2.356-1.618A20.932 20.932 0 013 12c0-4.991 1.343-9.207 3.962-12.51z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Duyuru Konfigürasyonu</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Duyuru Gösterim Süresi</label>
              <FormField
                label=""
                name="announcementDuration"
                type="select"
                value="7"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="7 gün"
              >
                <option value="1">1 gün</option>
                <option value="3">3 gün</option>
                <option value="7">7 gün</option>
                <option value="14">14 gün</option>
                <option value="30">30 gün</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Duyuru Önceliği</label>
              <FormField
                label=""
                name="announcementPriority"
                type="select"
                value="normal"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="Normal"
              >
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Otomatik Duyuru Temizleme</label>
              <FormField
                label=""
                name="autoCleanupAnnouncements"
                type="select"
                value="true"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="Aktif"
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      {businessLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">İşletme bilgileri yükleniyor...</span>
          </div>
        </div>
      ) : business ? (
        <div className="space-y-5">
          {/* Basic Business Information */}
          <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Temel İşletme Bilgileri</h3>
              </div>
              <button
                onClick={handleBusinessSave}
                disabled={isSaving}
                className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-primaryHover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">İşletme Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={businessData.name}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="İşletme adınızı girin"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">İşletme Türü</label>
                <select
                  name="businessTypeId"
                  value={business.businessTypeId || ''}
                  onChange={handleBusinessInputChange}
                  disabled
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)] cursor-not-allowed"
                >
                  <option value={business.businessTypeId}>
                    {businessTypes.find(bt => bt.id === business.businessTypeId)?.displayName || 'Bilinmeyen'}
                  </option>
                </select>
                <p className="text-xs text-[var(--theme-foregroundMuted)] mt-1">İşletme türü değiştirilemez</p>
              </div>


              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">Telefon *</label>
                <input
                  type="tel"
                  name="phone"
                  value={businessData.phone}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="+90 555 123 45 67"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={businessData.website}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="https://www.isletmeniz.com"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">Şehir *</label>
                <input
                  type="text"
                  name="city"
                  value={businessData.city}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="İstanbul"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">İşletme Açıklaması</label>
              <textarea
                name="description"
                value={businessData.description}
                onChange={handleBusinessInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                placeholder="İşletmeniz hakkında kısa bir açıklama yazın..."
              />
            </div>

            {/* Address */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">Adres *</label>
              <textarea
                name="address"
                value={businessData.address}
                onChange={handleBusinessInputChange}
                rows={2}
                className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                placeholder="İşletmenizin tam adresi"
              />
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">İl/Bölge</label>
                <input
                  type="text"
                  name="state"
                  value={businessData.state}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="İstanbul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">Posta Kodu</label>
                <input
                  type="text"
                  name="postalCode"
                  value={businessData.postalCode}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="34710"
                />
              </div>
            </div>

            {/* Brand Color */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">Marka Rengi</label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  name="primaryColor"
                  value={businessData.primaryColor}
                  onChange={handleBusinessInputChange}
                  className="w-16 h-12 border border-[var(--theme-border)] rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={businessData.primaryColor}
                  onChange={handleBusinessInputChange}
                  className="flex-1 px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
            <svg className="h-8 w-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">İşletme Bulunamadı</h3>
          <p className="text-[var(--theme-foregroundSecondary)]">Henüz bir işletmeniz bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );

    const renderAppointmentSettings = () => {
    const toggleSection = (section: keyof typeof expandedSections) => {
      const newState = { ...expandedSections, [section]: !expandedSections[section] };
      setExpandedSections(newState);

      // Save preference to localStorage
      try {
        localStorage.setItem('settingsSectionPreferences', JSON.stringify(newState));
      } catch (error) {
        console.error('Error saving section preferences:', error);
      }
    };

    return (
      <div className="space-y-6">
        {/* Business Hours Configuration - Collapsible */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] transition-colors duration-300 overflow-hidden">
          <button
            onClick={() => toggleSection('workingHours')}
            className="w-full p-6 text-left flex items-center justify-between hover:bg-[var(--theme-background)]/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Çalışma Saatleri</h3>
            </div>
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-foregroundSecondary)] transition-transform duration-300 ${
                expandedSections.workingHours ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.workingHours && (
            <div className="px-6 pb-6">
              {business ? (
                <BusinessHoursSettings
                  businessId={business.id}
                  onHoursUpdated={() => {
                    // Reload business data to reflect changes
                    loadBusinessData();
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--theme-foregroundSecondary)]">İşletme bilgileri yükleniyor...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Rules */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-info)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Rezervasyon Kuralları</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Kaç Gün Öncesinden Randevu Alınabilir</label>
              <FormField
                label=""
                name="maxAdvanceBookingDays"
                type="select"
                value="7"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="1 hafta"
              >
                <option value="1">1 gün</option>
                <option value="3">3 gün</option>
                <option value="7">1 hafta</option>
                <option value="14">2 hafta</option>
                <option value="30">1 ay</option>
                <option value="60">2 ay</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Minimum Randevu Bildirimi Süresi</label>
              <FormField
                label=""
                name="minimumNoticeHours"
                type="select"
                value="2"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="2 saat"
              >
                <option value="0">Anında rezervasyon</option>
                <option value="1">1 saat önce</option>
                <option value="2">2 saat önce</option>
                <option value="4">4 saat önce</option>
                <option value="24">1 gün önce</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Aynı Gün İçin Maksimum Randevu Sayısı</label>
              <FormField
                label=""
                name="maxAppointmentsPerDay"
                type="select"
                value="5"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="5 randevu"
              >
                <option value="1">1 randevu</option>
                <option value="2">2 randevu</option>
                <option value="3">3 randevu</option>
                <option value="4">4 randevu</option>
                <option value="5">5 randevu</option>
                <option value="6">6 randevu</option>
                <option value="7">7 randevu</option>
                <option value="8">8 randevu</option>
                <option value="9">9 randevu</option>
                <option value="10">10 randevu</option>
              </FormField>
            </div>
          </div>
        </div>

        {/* Cancellation & No-Show Policies */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">İptal ve Gelmeme Politikaları</h3>
          </div>

          {/* Danger Warning */}
          <div className="mb-6 p-4 bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <svg className="w-5 h-5 text-[var(--theme-error)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--theme-error)] mb-1">Önemli Uyarı</h4>
                <p className="text-xs text-[var(--theme-error)] leading-relaxed">
                  Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek ve bir daha işletmenizden randevu alamayacaktır.
                  Bu politikalar müşteri deneyimini korumak ve adil bir rezervasyon sistemi sağlamak için uygulanır.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Randevu İptali İçin Minimum Süre</label>
              <FormField
                label=""
                name="cancellationNoticeHours"
                type="select"
                value="4"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="4 saat"
              >
                <option value="1">1 saat önce</option>
                <option value="2">2 saat önce</option>
                <option value="4">4 saat önce</option>
                <option value="12">12 saat önce</option>
                <option value="24">1 gün önce</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Maksimum İptal Sayısı (Aylık)</label>
              <FormField
                label=""
                name="maxCancellationsPerMonth"
                type="select"
                value="3"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="3 iptal"
              >
                <option value="1">1 iptal</option>
                <option value="2">2 iptal</option>
                <option value="3">3 iptal</option>
                <option value="5">5 iptal</option>
                <option value="unlimited">Sınırsız</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Maksimum Gelmeme Sayısı (Aylık)</label>
              <FormField
                label=""
                name="maxNoShowsPerMonth"
                type="select"
                value="2"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="2 gelmeme"
              >
                <option value="1">1 gelmeme</option>
                <option value="2">2 gelmeme</option>
                <option value="3">3 gelmeme</option>
                <option value="5">5 gelmeme</option>
                <option value="unlimited">Sınırsız</option>
              </FormField>
            </div>
          </div>
        </div>


        {/* Customer Management */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Müşteri Yönetimi</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                Aktif Müşteri Tanımı (Son X ay içinde randevu almış)
              </label>
              <FormField
                label=""
                name="activeCustomerMonths"
                type="select"
                value="3"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="3 ay"
              >
                <option value="1">1 ay</option>
                <option value="2">2 ay</option>
                <option value="3">3 ay</option>
                <option value="6">6 ay</option>
                <option value="12">12 ay</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                Müşteri Sadakat Programı Eşiği
              </label>
              <FormField
                label=""
                name="loyaltyProgramThreshold"
                type="select"
                value="5"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="5 randevu"
              >
                <option value="3">3 randevu</option>
                <option value="5">5 randevu</option>
                <option value="10">10 randevu</option>
                <option value="15">15 randevu</option>
                <option value="20">20 randevu</option>
              </FormField>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--theme-foreground)]">Müşteri Notları</p>
                <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                  Personelin müşteriler hakkında not ekleyebilmesini sağla
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={handleInputChange}
                  name="enableCustomerNotes"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-success)]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--theme-foreground)]">Randevu Geçmişi Görüntüleme</p>
                <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                  Müşterilerin kendi randevu geçmişlerini görebilmesini sağla
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={handleInputChange}
                  name="enableCustomerHistory"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-success)]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--theme-foreground)]">Doğum Günü Hatırlatmaları</p>
                <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                  Müşteri doğum günlerinde otomatik hatırlatma gönder
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={handleInputChange}
                  name="enableBirthdayReminders"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-accent)]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--theme-foreground)]">Müşteri Değerlendirmeleri</p>
                <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                  Randevu sonrası müşterilerden değerlendirme iste
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={handleInputChange}
                  name="enableCustomerReviews"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-warning)]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffSettings = () => (
    <div className="space-y-6">
      {/* Staff Privacy Settings */}
      <StaffPrivacySettings 
        onSettingsUpdated={() => {
          // Optionally reload business data or show success message
          console.log('Staff privacy settings updated');
        }}
      />

      <div className="space-y-5">
        {/* Staff Management */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-accent)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Personel Yönetimi</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Personel Erişim Seviyesi</label>
              <FormField
                label=""
                name="staffAccessLevel"
                type="select"
                value="limited"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="Sınırlı Erişim"
              >
                <option value="full">Tam Erişim</option>
                <option value="limited">Sınırlı Erişim</option>
                <option value="view">Sadece Görüntüleme</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Personel Bildirimleri</label>
              <FormField
                label=""
                name="staffNotifications"
                type="select"
                value="true"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="Aktif"
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImagesSettings = () => (
    <div className="space-y-6 p-3">
      {business ? (
        <>
          <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">İşletme Görselleri</h3>
                <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
                  İşletmenizin logo, kapak görseli, profil görseli ve galeri görsellerini yönetin
                </p>
              </div>
            </div>
          </div>
          
          <BusinessImageManager 
            businessId={business.id}
            onImagesUpdated={() => {
              // Reload business data to reflect changes
              loadBusinessData();
            }}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
            <svg className="h-8 w-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">İşletme Bulunamadı</h3>
          <p className="text-[var(--theme-foregroundSecondary)]">Görsel yönetimi için önce bir işletmeniz olmalı.</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    // Additional permission check to ensure user can access the current tab
    if (!canAccessSettingsSection(user, activeTab)) {
      return (
        <div className="text-center py-8">
          <p className="text-[var(--theme-foregroundSecondary)]">
            Bu bölüme erişim yetkiniz bulunmuyor.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'business':
        return renderBusinessSettings();
      case 'images':
        return renderImagesSettings();
      case 'appointments':
        return renderAppointmentSettings();
      case 'staff':
        return renderStaffSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)] sm:bg-transparent sm:min-h-0">
      <div className="sm:space-y-6 sm:p-4">


        {/* Modern Mobile Tab Cards */}
        <div className="sm:hidden bg-[var(--theme-background)]">
          <div className="grid grid-cols-3 gap-2 p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded-lg border-2 transition-all duration-200 min-h-[70px] ${
                  activeTab === tab.id
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-md'
                    : 'border-[var(--theme-border)] bg-[var(--theme-background)] hover:border-[var(--theme-borderSecondary)] hover:bg-[var(--theme-backgroundSecondary)]'
                }`}
              >
                <div className="flex flex-col items-center space-y-1 h-full justify-center">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[var(--theme-primary)]/20'
                      : 'bg-[var(--theme-backgroundSecondary)]'
                  }`}>
                    <svg className={`w-3 h-3 ${
                      activeTab === tab.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foregroundSecondary)]'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight px-1 ${
                    activeTab === tab.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foreground)]'
                  }`} style={{ wordBreak: 'break-word', lineHeight: '1.2', maxWidth: '100%', whiteSpace: 'normal' }}>
                    {tab.name.replace(/\s+/g, '\n')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:block bg-[var(--theme-background)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden">
          <div className="border-b border-[var(--theme-border)]">
            <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]'
                      : 'border-transparent text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:border-[var(--theme-borderSecondary)]'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Mobile Content Card */}
        <div className="sm:hidden bg-[var(--theme-background)] mb-4 rounded-xl shadow-sm border border-[var(--theme-border)] overflow-hidden">
          <div className="">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}