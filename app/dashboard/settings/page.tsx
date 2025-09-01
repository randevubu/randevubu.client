'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import { FormField } from '../../../src/components/ui/FormField';
import { handleApiError, showSuccessToast } from '../../../src/lib/utils/toast';
import ThemeSelector from '../../../src/components/ui/ThemeSelector';

interface SettingsFormData {
  // Appearance Settings (theme now handled by ThemeSelector)
  language: string;
  timeFormat: string;
  
  // Notification Settings
  emailNotifications: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [formData, setFormData] = useState<SettingsFormData>({
    // Appearance Settings (theme now handled by ThemeSelector)
    language: 'tr',
    timeFormat: '24h',
    
    // Notification Settings
    emailNotifications: 'true',
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
    workingHours: true, // Start with working hours expanded
    appointmentConfig: false
  });

  const tabs = [
    { id: 'appearance', name: 'Görünüm', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z' },
    { id: 'notifications', name: 'Bildirimler', icon: 'M15 17h5l-5 5v-5zM4.021 8.583a11.003 11.003 0 0114.99 0A7.5 7.5 0 0012 3c-2.31 0-4.438 1.04-5.832 2.712A7.48 7.48 0 014.02 8.583z' },
    { id: 'announcements', name: 'Duyuru Ayarları', icon: 'M11 5.088a19.2 19.2 0 012.356-1.618c.224-.128.336-.192.448-.192.112 0 .224.064.448.192.82.468 1.527.885 2.356 1.618A20.932 20.932 0 0121 12c0 4.991-1.343 9.207-3.962 12.51a19.2 19.2 0 01-2.356 1.618c-.224.128-.336.192-.448.192-.112 0-.224-.064-.448-.192a19.2 19.2 0 01-2.356-1.618A20.932 20.932 0 013 12c0-4.991 1.343-9.207 3.962-12.51z' },
    { id: 'account', name: 'Hesap', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'appointments', name: 'Randevu Ayarları', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'staff', name: 'Personel Ayarları', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ];

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

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
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Saat Formatı</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Saat Formatı</label>
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
      <div className="space-y-5">
        {/* Communication Notifications */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">İletişim Bildirimleri</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">E-posta Bildirimleri</label>
              <FormField
                label=""
                name="emailNotifications"
                type="select"
                value={formData.emailNotifications}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={formData.emailNotifications === 'true' ? 'Aktif' : 'Pasif'}
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">SMS Bildirimleri</label>
              <FormField
                label=""
                name="smsNotifications"
                type="select"
                value={formData.smsNotifications}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={formData.smsNotifications === 'true' ? 'Aktif' : 'Pasif'}
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Push Bildirimleri</label>
              <FormField
                label=""
                name="pushNotifications"
                type="select"
                value={formData.pushNotifications}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={formData.pushNotifications === 'true' ? 'Aktif' : 'Pasif'}
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </FormField>
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Hatırlatma Ayarları</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Randevu Hatırlatmaları</label>
              <FormField
                label=""
                name="appointmentReminders"
                type="select"
                value={formData.appointmentReminders}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={formData.appointmentReminders === 'true' ? 'Aktif' : 'Pasif'}
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Hatırlatma Zamanı</label>
              <FormField
                label=""
                name="reminderTiming"
                type="select"
                value={formData.reminderTiming}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={reminderTimingOptions.find(opt => opt.value === formData.reminderTiming)?.label}
              >
                {reminderTimingOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </FormField>
            </div>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 15h3l3 3V6L8 9H5v6z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Ses Ayarları</h3>
          </div>
          <FormField
            label=""
            name="soundNotifications"
            type="select"
            value={formData.soundNotifications}
            onChange={handleInputChange}
            isEditing={true}
            displayValue={formData.soundNotifications === 'true' ? 'Aktif' : 'Pasif'}
          >
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </FormField>
        </div>
      </div>
    </div>
  );

  const renderAnnouncementSettings = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Announcement Configuration */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.088a19.2 19.2 0 012.356-1.618c.224-.128.336-.192.448-.192.112 0 .224.064.448.192.82.468 1.527.885 2.356 1.618A20.932 20.932 0 0121 12c0 4.991-1.343 9.207-3.962 12.51a19.2 19.2 0 01-2.356 1.618c-.224.128-.336.192-.448.192-.112 0-.224-.064-.448-.192a19.2 19.2 0 01-2.356-1.618A20.932 20.932 0 013 12c0-4.991 1.343-9.207 3.962-12.51z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Duyuru Konfigürasyonu</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Duyuru Gösterim Süresi</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-2">Duyuru Önceliği</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-2">Otomatik Duyuru Temizleme</label>
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

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Security Settings */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Güvenlik Ayarları</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">İki Faktörlü Doğrulama</label>
              <FormField
                label=""
                name="twoFactorAuth"
                type="select"
                value={formData.twoFactorAuth}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={formData.twoFactorAuth === 'true' ? 'Aktif' : 'Pasif'}
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Otomatik Çıkış</label>
              <FormField
                label=""
                name="autoLogout"
                type="select"
                value={formData.autoLogout}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={autoLogoutOptions.find(opt => opt.value === formData.autoLogout)?.label}
              >
                {autoLogoutOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Giriş Bildirimleri</label>
              <FormField
                label=""
                name="loginNotifications"
                type="select"
                value={formData.loginNotifications}
                onChange={handleInputChange}
                isEditing={true}
                displayValue={formData.loginNotifications === 'true' ? 'Aktif' : 'Pasif'}
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

    const renderAppointmentSettings = () => {
    const toggleSection = (section: keyof typeof expandedSections) => {
      setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
      <div className="space-y-6">
        {/* Working Hours Configuration - Collapsible - NOW AT TOP */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Çalışma Saatleri</h3>
            </div>
            <button 
              onClick={() => toggleSection('workingHours')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors"
            >
              <span className="hidden sm:inline">{expandedSections.workingHours ? 'Gizle' : 'Göster'}</span>
              <svg className={`w-4 h-4 transition-transform ${expandedSections.workingHours ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {expandedSections.workingHours && (
            <div className="space-y-2">
              {[
                { day: 'Pazartesi', name: 'monday', start: '09:00', end: '21:00', enabled: true },
                { day: 'Salı', name: 'tuesday', start: '09:00', end: '21:00', enabled: true },
                { day: 'Çarşamba', name: 'wednesday', start: '09:00', end: '21:00', enabled: true },
                { day: 'Perşembe', name: 'thursday', start: '09:00', end: '21:00', enabled: true },
                { day: 'Cuma', name: 'friday', start: '09:00', end: '21:00', enabled: true },
                { day: 'Cumartesi', name: 'saturday', start: '09:00', end: '21:00', enabled: true },
                { day: 'Pazar', name: 'sunday', start: '09:00', end: '21:00', enabled: true }
              ].map((schedule) => (
                <div key={schedule.name} className="bg-white rounded-lg border border-gray-200 p-3 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                  {/* Mobile Layout - Stacked */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{schedule.day}</span>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 data-[checked]:bg-indigo-600">
                        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 data-[checked]:translate-x-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <input
                        type="time"
                        defaultValue={schedule.start}
                        className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <span className="text-gray-400 font-medium">—</span>
                      <input
                        type="time"
                        defaultValue={schedule.end}
                        className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  {/* Desktop Layout - Single Row */}
                  <div className="hidden sm:flex sm:items-center sm:space-x-4 sm:flex-1">
                    <span className="text-sm font-medium text-gray-900 min-w-[80px]">{schedule.day}</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        defaultValue={schedule.start}
                        className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="time"
                        defaultValue={schedule.end}
                        className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 data-[checked]:bg-indigo-600">
                      <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 data-[checked]:translate-x-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Reminder Settings */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Randevu Hatırlatma Ayarları</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Randevu hatırlatma mesajları, randevuya kaç dakika kala müşteriye gönderilsin? (Varsayılan: 60)
            </label>
            <FormField
              label=""
              name="reminderMinutes"
              type="text"
              value="60"
              onChange={handleInputChange}
              isEditing={true}
              displayValue="60"
            />
          </div>
        </div>

        {/* Active Customer Definition */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Aktif Müşteri Tanımı</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Bir müşteri kaç ay içerisinde en az bir kez bile randevuya gelmiş olsa aktif müşteri kategorisinde yer alsın? (Varsayılan: 3)
            </label>
            <FormField
              label=""
              name="activeCustomerMonths"
              type="text"
              value="2"
              onChange={handleInputChange}
              isEditing={true}
              displayValue="2"
            />
          </div>
        </div>

        {/* Online Appointment Settings */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Online Randevu Ayarları</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Online randevular onayımdan sonra takvime eklensin? (Varsayılan: Kapalı)
              </label>
              <FormField
                label=""
                name="autoApproveOnlineAppointments"
                type="select"
                value="false"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="Kapalı"
              >
                <option value="true">Açık</option>
                <option value="false">Kapalı</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Kimler online randevu alabilsin? (Varsayılan: Hiç kimse)
              </label>
              <FormField
                label=""
                name="onlineAppointmentAccess"
                type="select"
                value="none"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="Hiç kimse"
              >
                <option value="registered">Sadece Kayıtlı Müşteriler</option>
                <option value="active">Sadece Aktif Müşteriler</option>
                <option value="everyone">Herkes</option>
                <option value="none">Hiç kimse</option>
              </FormField>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Müşterileriniz, online sayfanız üzerinden kaç adet randevusunu iptal ederse online randevu alımı engellensin? (Varsayılan: 5)
              </label>
              <FormField
                label=""
                name="maxCancellations"
                type="text"
                value="10"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Müşterileriniz kaç adet randevusuna gelmezse online randevu alımı engellensin? (Varsayılan: 2)
              </label>
              <FormField
                label=""
                name="maxNoShows"
                type="text"
                value="10"
                onChange={handleInputChange}
                isEditing={true}
                displayValue="10"
              />
            </div>
          </div>
        </div>

        {/* Appointment Configuration */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Randevu Ayarları</h3>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Varsayılan Randevu Süresi</label>
            <FormField
              label=""
              name="defaultAppointmentDuration"
              type="select"
              value="30"
              onChange={handleInputChange}
              isEditing={true}
              displayValue="30 dakika"
            >
              <option value="15">15 dakika</option>
              <option value="30">30 dakika</option>
              <option value="45">45 dakika</option>
              <option value="60">1 saat</option>
            </FormField>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffSettings = () => (
    <div className="space-y-6">
      <div className="space-y-5">
        {/* Staff Management */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Personel Yönetimi</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Personel Erişim Seviyesi</label>
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
              <label className="block text-xs font-medium text-gray-700 mb-2">Personel Bildirimleri</label>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'announcements':
        return renderAnnouncementSettings();
      case 'account':
        return renderAccountSettings();
      case 'appointments':
        return renderAppointmentSettings();
      case 'staff':
        return renderStaffSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 sm:bg-transparent sm:min-h-0">
      <div className="sm:space-y-6 sm:p-4">


        {/* Modern Mobile Tab Cards */}
        <div className="sm:hidden bg-white">
          <div className="grid grid-cols-3 gap-2 p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    activeTab === tab.id
                      ? 'bg-indigo-100'
                      : 'bg-gray-100'
                  }`}>
                    <svg className={`w-3 h-3 ${
                      activeTab === tab.id ? 'text-indigo-600' : 'text-gray-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${
                    activeTab === tab.id ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                    {tab.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        <div className="sm:hidden bg-white  mb-4 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}