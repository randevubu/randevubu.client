'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Footer, Navbar } from '../components';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, hasInitialized, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    timezone: '',
    language: '',
  });

  useEffect(() => {
    if (hasInitialized && !isAuthenticated) {
      router.push('/auth');
    }
  }, [hasInitialized, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'tr',
      });
    }
  }, [user]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    // TODO: Implement save functionality when user service supports profile updates
    setIsEditing(false);
    // await updateProfile(formData);
    // await refreshUser();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Kullanıcı' : 'Kullanıcı'}
                </h1>
                <p className="text-indigo-100 text-sm">
                  {user?.phoneNumber}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Profil Bilgileri</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {isEditing ? 'İptal Et' : 'Düzenle'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Adınız
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Adınız"
                    />
                  ) : (
                    <div className="px-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-900">
                      {user?.firstName || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Soyadı
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Soyadınız"
                    />
                  ) : (
                    <div className="px-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-900">
                      {user?.lastName || 'Belirtilmemiş'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Telefon Numarası
                  </label>
                  <div className="px-3 py-2 text-sm bg-gray-100 rounded-lg text-gray-600">
                    {user?.phoneNumber}
                    <span className="text-xs text-gray-500 ml-2">(Değiştirilemez)</span>
                  </div>
                </div>
              </div>

              {/* User Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Zaman Dilimi
                  </label>
                  {isEditing ? (
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                      <option value="Europe/London">Londra (GMT+0)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-900">
                      {user?.timezone || 'UTC'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dil
                  </label>
                  {isEditing ? (
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-900">
                      {user?.language === 'tr' ? 'Türkçe' : 'English'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hesap Durumu
                  </label>
                  <div className="px-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-900">
                    {user?.isActive ? (
                      <span className="text-green-600 font-semibold">Aktif</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Pasif</span>
                    )}
                    {user?.isVerified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Doğrulanmış
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                >
                  Kaydet
                </button>
              </div>
            )}
          </div>

          {/* Statistics Section */}
          <div className="bg-gray-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">İstatistikler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">0</div>
                <div className="text-xs text-gray-600">Toplam Randevu</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">0</div>
                <div className="text-xs text-gray-600">Aktif Müşteri</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">0</div>
                <div className="text-xs text-gray-600">Bu Ay</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">₺0</div>
                <div className="text-xs text-gray-600">Gelir</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}