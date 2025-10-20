'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Bell, Building, Calendar, ChevronDown, Clock, Image, Settings, Users, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import BusinessHoursSettings from '../../../components/ui/BusinessHoursSettings';
import { BusinessImageManager } from '../../../components/ui/BusinessImageManager';
import BusinessNotificationSettings from '../../../components/ui/BusinessNotificationSettings';
import { FormField } from '../../../components/ui/FormField';
import { PushNotificationSettings } from '../../../components/ui/PushNotificationSettings';
import ReservationRulesSettings from '../../../components/ui/ReservationRulesSettings';
import { StaffPrivacySettingsComponent } from '../../../components/ui/StaffPrivacySettings';
import ThemeSelector from '../../../components/ui/ThemeSelector';
import { GoogleIntegrationSettings } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import { useDashboardBusiness, useDashboardRefetch } from '../../../context/DashboardContext';
import { businessService } from '../../../lib/services/business';
import { canAccessSettingsPage, canAccessSettingsSection } from '../../../lib/utils/permissions';
import { handleApiError, showSuccessToast } from '../../../lib/utils/toast';
import { Business, BusinessType, UpdateBusinessData } from '../../../types/business';

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


export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  // Use cached business data from context - no additional API call needed!
  const business = useDashboardBusiness();
  const refetchBusiness = useDashboardRefetch();
  const businessLoading = false; // Business is already loaded by layout

  // Fetch business types with TanStack Query
  const {
    data: businessTypes = [],
    isLoading: businessTypesLoading
  } = useQuery({
    queryKey: ['businessTypes'],
    queryFn: async (): Promise<BusinessType[]> => {
      const response = await businessService.getBusinessTypes();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    staleTime: 30 * 60 * 1000, // Business types rarely change, cache for 30 minutes
    gcTime: 60 * 60 * 1000,
  });

  // Initialize business data from the fetched business
  const [businessData, setBusinessData] = useState<UpdateBusinessData>({
    name: business?.name || '',
    description: business?.description || '',
    phone: business?.phone || '',
    website: business?.website || '',
    address: business?.address || '',
    city: business?.city || '',
    state: business?.state || '',
    country: business?.country || 'Turkey',
    postalCode: business?.postalCode || '',
    primaryColor: business?.primaryColor || '#FF6B6B'
  });

  // Update businessData when business changes
  useEffect(() => {
    if (business) {
      setBusinessData({
        name: business.name || '',
        description: business.description || '',
        phone: business.phone || '',
        website: business.website || '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        country: business.country || 'Turkey',
        postalCode: business.postalCode || '',
        primaryColor: business.primaryColor || '#FF6B6B'
      });
    }
  }, [business]);
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
    { id: 'appearance', name: 'Görünüm', icon: Settings },
    { id: 'notifications', name: 'Hatırlatma Ayarları', icon: Bell },
    { id: 'business', name: 'İşletme Ayarları', icon: Building },
    { id: 'images', name: 'Görsel Yönetimi', icon: Image },
    { id: 'appointments', name: 'Randevu Ayarları', icon: Calendar },
    { id: 'staff', name: 'Personel Ayarları', icon: Users },
    { id: 'ratings', name: 'Değerlendirme Ayarları', icon: AlertTriangle },
  ];

  // Filter tabs based on user permissions
  const tabs = allTabs.filter(tab => canAccessSettingsSection(user, tab.id));

  // Calculate visible and overflow tabs based on screen size
  const tabVisibility = useMemo(() => {
    const tabIds = tabs.map(tab => tab.id);
    
    // For demonstration, let's assume we can fit 4 tabs on desktop
    // In a real implementation, you'd measure the container width
    const maxVisibleTabs = screenWidth < 1024 ? 2 : 4; // 2 for tablet, 4 for desktop
    
    if (tabIds.length <= maxVisibleTabs) {
      return {
        visibleTabs: tabIds,
        overflowTabs: []
      };
    } else {
      return {
        visibleTabs: tabIds.slice(0, maxVisibleTabs - 1), // Leave space for "More" button
        overflowTabs: tabIds.slice(maxVisibleTabs - 1)
      };
    }
  }, [tabs, screenWidth]);

  const { visibleTabs, overflowTabs } = tabVisibility;

  // Track screen width for responsive behavior
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };
    
    // Set initial width
    updateScreenWidth();
    
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-overflow-menu]')) {
        setShowOverflowMenu(false);
      }
    };

    if (showOverflowMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOverflowMenu]);

  useEffect(() => {
    if (user && canAccessSettingsPage(user)) {
      loadUserSettings();
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
    }
  };

  const loadUserSettings = () => {
    try {
      // Load user settings from localStorage
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setFormData(prev => ({ ...prev, ...parsedSettings }));
      }

      // Theme is now handled by ThemeContext
    } catch (error) {
      handleApiError(error);
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
        refetchBusiness();
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // No longer needed as all settings are always editable
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Theme Setting */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
              <Settings className="w-3 h-3 text-[var(--theme-primary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Tema Seçimi</h3>
          </div>
          <p className="text-[var(--theme-foregroundSecondary)] text-xs mb-4">
            Görünümü tercihinize göre özelleştirin. Renk teması ve karanlık/aydınlık mod seçeneklerini ayarlayın.
          </p>
          
          <div className="block sm:hidden">
            <ThemeSelector mobile />
          </div>
          <div className="hidden sm:block">
            <ThemeSelector mobile />
          </div>
        </div>

        {/* Language Setting */}
        {/* <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center">
              <Globe className="w-3 h-3 text-[var(--theme-success)]" />
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
        </div> */}

        {/* Format Settings */}
        {/* <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-info)]/10 rounded-lg flex items-center justify-center">
              <Clock className="w-3 h-3 text-[var(--theme-info)]" />
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
        </div> */}
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Business Notification Settings */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-[var(--theme-primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Randevu Hatırlatma Ayarları</h3>
            <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
              Müşterilere gönderilecek randevu hatırlatma bildirimlerini yapılandırın. Push, SMS ve E-posta kanallarını, hatırlatma zamanlarını ve sessiz saatleri ayarlayın.
          </p>
          </div>
        </div>

        <BusinessNotificationSettings />
      </div>

      {/* Push Notification Settings */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-3 border border-[var(--theme-border)] transition-colors duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-[var(--theme-accent)]/10 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-[var(--theme-accent)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Push Bildirimleri</h3>
            <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
              Tarayıcı push bildirimlerini yönetin
            </p>
          </div>
        </div>

        <PushNotificationSettings />
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
              <AlertTriangle className="w-3 h-3 text-[var(--theme-warning)]" />
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
                  <Building className="w-4 h-4 text-[var(--theme-primary)]" />
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
                  value={business.businessType?.id || ''}
                  onChange={handleBusinessInputChange}
                  disabled
                  className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)] cursor-not-allowed"
                >
                  <option value={business.businessType?.id || ''}>
                    {business.businessType?.displayName || 'Bilinmeyen'}
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
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
            <Building className="h-8 w-8 text-[var(--theme-foregroundMuted)]" />
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
                <Clock className="w-4 h-4 text-[var(--theme-primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Çalışma Saatleri</h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-foregroundSecondary)] transition-transform duration-300 ${
                expandedSections.workingHours ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedSections.workingHours && (
            <div className="px-6 pb-6">
              {business ? (
                <BusinessHoursSettings
                  businessId={business.id}
                  onHoursUpdated={() => {
                    // Reload business data to reflect changes
                    refetchBusiness();
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

        {/* Reservation Rules */}
        <ReservationRulesSettings
          onSettingsUpdated={() => {
            // Optionally show success message or refresh data
            // Success message is already handled by the component
          }}
        />

        {/* Cancellation & No-Show Policies */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-[var(--theme-warning)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">İptal ve Gelmeme Politikaları</h3>
          </div>

          {/* Danger Warning */}
          <div className="mb-6 p-4 bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-[var(--theme-error)]" />
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
              <Users className="w-3 h-3 text-[var(--theme-success)]" />
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
      <StaffPrivacySettingsComponent 
        onSettingsUpdated={() => {
          // Optionally reload business data or show success message
        }}
      />

      <div className="space-y-5">
        {/* Staff Management */}
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-accent)]/10 rounded-lg flex items-center justify-center">
              <Users className="w-3 h-3 text-[var(--theme-accent)]" />
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
                <Image className="w-4 h-4 text-[var(--theme-primary)]" />
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
              refetchBusiness();
            }}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
            <Image className="h-8 w-8 text-[var(--theme-foregroundMuted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">İşletme Bulunamadı</h3>
          <p className="text-[var(--theme-foregroundSecondary)]">Görsel yönetimi için önce bir işletmeniz olmalı.</p>
        </div>
      )}
    </div>
  );

  const renderRatingsSettings = () => (
    <div className="space-y-6 p-3">
      {business ? (
        <>
          <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-[var(--theme-primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Değerlendirme Ayarları</h3>
                <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
                  Google entegrasyonu ve müşteri değerlendirmelerini yönetin
                </p>
              </div>
            </div>
          </div>
          
          <GoogleIntegrationSettings
            businessId={business.id}
            currentSettings={business.googleIntegration}
            onSettingsUpdated={() => {
              // Reload business data to reflect changes
              refetchBusiness();
            }}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
            <AlertTriangle className="h-8 w-8 text-[var(--theme-foregroundMuted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">İşletme Bulunamadı</h3>
          <p className="text-[var(--theme-foregroundSecondary)]">Değerlendirme ayarları için önce bir işletmeniz olmalı.</p>
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
      case 'ratings':
        return renderRatingsSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)] sm:bg-transparent sm:min-h-0">
      <div className="sm:space-y-6 sm:p-4">


        {/* Modern Mobile Tab Cards */}
        <div className="sm:hidden bg-[var(--theme-background)]">
          <div className="grid grid-cols-2 gap-2 p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px] ${
                  activeTab === tab.id
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-md'
                    : 'border-[var(--theme-border)] bg-[var(--theme-background)] hover:border-[var(--theme-borderSecondary)] hover:bg-[var(--theme-backgroundSecondary)]'
                }`}
              >
                <div className="flex flex-col items-center space-y-2 h-full justify-center">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-[var(--theme-primary)]/20'
                      : 'bg-[var(--theme-backgroundSecondary)]'
                  }`}>
                    <tab.icon className={`w-3 h-3 ${
                      activeTab === tab.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foregroundSecondary)]'
                    }`} />
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${
                    activeTab === tab.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foreground)]'
                  }`}>
                    {tab.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:block bg-[var(--theme-background)] rounded-lg shadow-sm border border-[var(--theme-border)]">
          <div className="border-b border-[var(--theme-border)]">
            <nav className="-mb-px flex space-x-0 px-6">
              {/* Visible tabs */}
              {visibleTabs.map((tabId) => {
                const tab = tabs.find(t => t.id === tabId);
                if (!tab) return null;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center transition-colors flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]'
                        : 'border-transparent text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:border-[var(--theme-borderSecondary)]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
              
              {/* Overflow menu */}
              {overflowTabs.length > 0 && (
                <div className="relative" data-overflow-menu>
                  <button
                    onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                    className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center transition-colors flex-shrink-0 ${
                      overflowTabs.includes(activeTab)
                        ? 'border-[var(--theme-primary)] text-[var(--theme-primary)]'
                        : 'border-transparent text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:border-[var(--theme-borderSecondary)]'
                    }`}
                  >
                    <MoreHorizontal className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Daha Fazla</span>
                  </button>
                  
                  {/* Dropdown menu */}
                  {showOverflowMenu && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg shadow-lg z-50">
                      {overflowTabs.map((tabId) => {
                        const tab = tabs.find(t => t.id === tabId);
                        if (!tab) return null;
                        
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id);
                              setShowOverflowMenu(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-[var(--theme-backgroundSecondary)] transition-colors ${
                              activeTab === tab.id ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-[var(--theme-foreground)]'
                            }`}
                          >
                            <tab.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{tab.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Mobile Content Card */}
        <div className="sm:hidden bg-[var(--theme-background)] mb-4 rounded-xl shadow-sm border border-[var(--theme-border)]">
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}