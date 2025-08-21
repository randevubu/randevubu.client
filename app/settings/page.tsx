'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar, Footer } from '../components';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, isAuthenticated, hasInitialized, logout } = useAuth();
  const router = useRouter();
  
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

  useEffect(() => {
    if (hasInitialized && !isAuthenticated) {
      router.push('/auth');
    }
  }, [hasInitialized, isAuthenticated, router]);

  if (!hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
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
    { key: 'general', label: 'Genel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { key: 'notifications', label: 'Bildirimler', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { key: 'privacy', label: 'Gizlilik', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { key: 'business', label: 'İşletme', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { key: 'account', label: 'Hesap', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ayarlar</h2>
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.key
                          ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8">
              {activeTab === 'general' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Genel Ayarlar</h3>
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Dil ve Zaman</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="tr">Türkçe</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Zaman Dilimi</label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Bildirim Ayarları</h3>
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Türleri</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">E-posta Bildirimleri</h5>
                            <p className="text-sm text-gray-500">Yeni randevular ve güncellemeler için e-posta alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('email')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.notifications.email ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">SMS Bildirimleri</h5>
                            <p className="text-sm text-gray-500">Randevu hatırlatmaları için SMS alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('sms')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.notifications.sms ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Push Bildirimleri</h5>
                            <p className="text-sm text-gray-500">Tarayıcı bildirimleri alın</p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange('push')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.notifications.push ? 'bg-indigo-600' : 'bg-gray-200'
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Gizlilik Ayarları</h3>
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Profil Görünürlüğü</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">Telefon Numarası Görünür</h5>
                            <p className="text-sm text-gray-500">Müşteriler telefon numaranızı görebilsin</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('showPhone')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.privacy.showPhone ? 'bg-indigo-600' : 'bg-gray-200'
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
                            <h5 className="text-sm font-medium text-gray-900">E-posta Görünür</h5>
                            <p className="text-sm text-gray-500">Müşteriler e-posta adresinizi görebilsin</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('showEmail')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.privacy.showEmail ? 'bg-indigo-600' : 'bg-gray-200'
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
                            <h5 className="text-sm font-medium text-gray-900">Değerlendirmelere İzin Ver</h5>
                            <p className="text-sm text-gray-500">Müşteriler işletmenizi değerlendirebilsin</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('allowReviews')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.privacy.allowReviews ? 'bg-indigo-600' : 'bg-gray-200'
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">İşletme Ayarları</h3>
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Çalışma Saatleri</h4>
                      <div className="space-y-4">
                        {days.map((day) => {
                          const daySettings = settings.business.workingHours[day.key as keyof typeof settings.business.workingHours];
                          return (
                            <div key={day.key} className="flex items-center justify-between">
                              <div className="w-24">
                                <span className="text-sm font-medium text-gray-900">{day.label}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => handleWorkingHoursChange(day.key, 'closed', !daySettings.closed)}
                                  className={`px-3 py-1 rounded text-xs font-medium ${
                                    daySettings.closed ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
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
                                      className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                      type="time"
                                      value={daySettings.end}
                                      onChange={(e) => handleWorkingHoursChange(day.key, 'end', e.target.value)}
                                      className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Randevu Ayarları</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Otomatik Onay</h5>
                          <p className="text-sm text-gray-500">Gelen randevuları otomatik olarak onayla</p>
                        </div>
                        <button
                          onClick={() => handleBusinessChange('autoConfirm')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.business.autoConfirm ? 'bg-indigo-600' : 'bg-gray-200'
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Hesap Ayarları</h3>
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Hesap İşlemleri</h4>
                      <div className="space-y-4">
                        <button
                          onClick={() => {/* TODO: Export data */}}
                          className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="text-left">
                              <h5 className="text-sm font-medium text-gray-900">Verilerimi İndir</h5>
                              <p className="text-xs text-gray-500">Tüm verilerinizi JSON formatında indirin</p>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="w-full flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <div className="text-left">
                              <h5 className="text-sm font-medium text-gray-900">Hesabımı Sil</h5>
                              <p className="text-xs text-gray-500">Bu işlem geri alınamaz</p>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveSettings}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ayarları Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesabımı Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
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