'use client';

import { Check, X, Bell, Calendar, Users, CheckCircle } from 'lucide-react';

export default function RequirementsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Sistem Gereksinimleri
          </h1>
          
          <div className="prose prose-sm sm:prose max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>RandevuBu</strong> platformunu en iyi şekilde kullanabilmek için gereken minimum sistem gereksinimleri 
                ve önerilen cihaz özellikleri aşağıda belirtilmiştir.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💻 Web Tarayıcı Gereksinimleri</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center">
                    <span className="mr-2">✅</span>
                    Desteklenen Tarayıcılar
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Google Chrome (son 2 sürüm)
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Mozilla Firefox (son 2 sürüm)
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Microsoft Edge (son 2 sürüm)
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Safari (14.0+)
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                  <h3 className="font-bold text-red-900 mb-3 flex items-center">
                    <span className="mr-2">❌</span>
                    Desteklenmeyen Tarayıcılar
                  </h3>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-center">
                      <X className="w-4 h-4 text-red-600 mr-2" />
                      Internet Explorer (tüm sürümler)
                    </li>
                    <li className="flex items-center">
                      <X className="w-4 h-4 text-red-600 mr-2" />
                      Opera Mini
                    </li>
                    <li className="flex items-center">
                      <X className="w-4 h-4 text-red-600 mr-2" />
                      Eski tarayıcı sürümleri
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-3">Önemli Notlar</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• JavaScript aktif olmalıdır</li>
                  <li>• Çerezler aktif olmalıdır</li>
                  <li>• Pop-up engelleyici devre dışı olmalıdır (bildirimler için)</li>
                  <li>• Tarayıcı güncel tutulmalıdır</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📱 Cihaz Gereksinimleri</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                  <h3 className="font-bold text-indigo-900 mb-3 flex items-center">
                    <span className="mr-2">💻</span>
                    Desktop/Laptop
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li>• Minimum: 1366x768</li>
                    <li>• Önerilen: 1920x1080+</li>
                    <li>• İşletim Sistemi: Windows 10+, macOS 11+, Linux</li>
                    <li>• RAM: 4GB+</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                  <h3 className="font-bold text-purple-900 mb-3 flex items-center">
                    <span className="mr-2">📱</span>
                    Tablet
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li>• Minimum: 768x1024</li>
                    <li>• Önerilen: 1024x1366+</li>
                    <li>• iOS 13+, Android 8+</li>
                    <li>• Modern web tarayıcı</li>
                  </ul>
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-5">
                  <h3 className="font-bold text-pink-900 mb-3 flex items-center">
                    <span className="mr-2">📱</span>
                    Mobil
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li>• Minimum: 360x640</li>
                    <li>• Önerilen: 375x667+</li>
                    <li>• iOS 13+, Android 8+</li>
                    <li>• Touch özellikli ekran</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🌐 İnternet Gereksinimleri</h2>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2">Minimum Hız</h3>
                    <p className="text-sm text-gray-700 mb-1">512 Kbps (640 KB/s)</p>
                    <p className="text-xs text-gray-600">Temel fonksiyonlar için yeterli</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2">Önerilen Hız</h3>
                    <p className="text-sm text-gray-700 mb-1">5 Mbps (625 KB/s)+</p>
                    <p className="text-xs text-gray-600">En iyi deneyim için</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-300">
                  <p className="text-sm text-gray-700">
                    <strong>Not:</strong> Daha hızlı bağlantı, dosya yükleme, görsel işleme ve gerçek zamanlı 
                    özellikler için önemlidir.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔔 Özellik Gereksinimleri</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-indigo-900 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Push Bildirimleri
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700 mb-2">
                      Push bildirimlerini almak için:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• HTTPS bağlantısı (otomatik)</li>
                      <li>• Bildirim izni verilmeli</li>
                      <li>• Modern tarayıcı</li>
                    </ul>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-green-900 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Randevu Yönetimi
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700 mb-2">
                      Çalışma saatleri ve kapasite yönetimi için:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Tarayıcı saat dilimi desteği</li>
                      <li>• Otomatik yenileme</li>
                      <li>• Takvim görünümü</li>
                    </ul>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-purple-900 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Müşteri Yönetimi
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700 mb-2">
                      Müşteri bilgileri ve geçmiş için:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Form desteği</li>
                      <li>• Arama ve filtreleme</li>
                      <li>• Veri aktarma/export</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Önerilen Ayarlar</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-bold text-amber-900 mb-4">En İyi Deneyim İçin</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Tarayıcı Ayarları:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✓ Çerezler aktif</li>
                      <li>✓ JavaScript aktif</li>
                      <li>✓ Donanım hızlandırma açık</li>
                      <li>✓ Cache temizliği periyodik yapılmalı</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Ekran Ayarları:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✓ DPI/zoom %100-125 arası</li>
                      <li>✓ Gün ışığı modu açık</li>
                      <li>✓ Minimum font boyutu 12px</li>
                      <li>✓ Responsive tasarım desteği</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🆘 Yardım ve Destek</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Herhangi bir teknik sorun yaşıyorsanız veya yardıma ihtiyacınız varsa:
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong className="text-blue-900">E-posta:</strong>{' '}
                    <a href="mailto:info.randevubu@gmail.com" className="text-blue-700 hover:underline">
                      info.randevubu@gmail.com
                    </a>
                  </p>
                  <p><strong className="text-blue-900">Telefon:</strong> 0555 175 65 98 / 0546 660 4336</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-bold text-green-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Güncelleme Notları
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Bu gereksinimler platform sürümüne göre güncellenebilir. En güncel bilgiler için 
                  bu sayfayı düzenli olarak kontrol etmeniz önerilir. Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

