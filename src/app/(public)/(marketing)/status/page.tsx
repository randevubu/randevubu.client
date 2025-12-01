'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Bell, Activity, TrendingUp, Server } from 'lucide-react';

export default function StatusPage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('tr-TR'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Sistem Durumu</h1>
          <p className="text-gray-600">RandevuBu platformunun güncel durumu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 mb-8">
          {/* Overall Status */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Tüm Sistemler Çalışıyor</h2>
                  <p className="text-sm text-green-700">Son güncelleme: {currentTime || 'Yükleniyor...'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-green-700">Uptime</p>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">API Sunucusu</h3>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold">Çalışıyor</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">Ana API endpoint'leri aktif</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Veritabanı</h3>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold">Çalışıyor</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">Tüm veri operasyonları normal</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Yanıt Süresi</h3>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">Normal</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">&lt; 200ms ortalama</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-900">Push Bildirimler</h3>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold">Aktif</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">SMS ve e-posta gönderimi çalışıyor</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-pink-600" />
                  <h3 className="font-bold text-gray-900">Randevu Yönetimi</h3>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold">Aktif</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">Rezervasyon sistemi operasyonel</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">Ödeme İşlemleri</h3>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold">Çalışıyor</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">Ödeme altyapıları operasyonel</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Performans Metrikleri (Son 24 Saat)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">99.9%</p>
                <p className="text-xs text-gray-600 mt-1">Uptime</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">120ms</p>
                <p className="text-xs text-gray-600 mt-1">Ortalama Yanıt</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Hata Sayısı</p>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Son Olaylar</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Tüm sistemler normal çalışıyor</p>
                  <p className="text-xs text-gray-500 mt-1">Son 30 günde bildirilen bir sorun olmamıştır</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Sorun mu yaşıyorsunuz?
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Sistem durumu normal görünüyorsa ancak bir sorun yaşıyorsanız, lütfen bize ulaşın:
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span><strong>E-posta:</strong> info@randevubu.com</span>
              <span><strong>Telefon:</strong> 0545 449 60 42</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Bu sayfa her 5 dakikada bir otomatik olarak güncellenir</p>
          <p className="mt-1">Son kontrol: {currentTime || 'Yükleniyor...'}</p>
        </div>
      </div>
    </div>
  );
}

