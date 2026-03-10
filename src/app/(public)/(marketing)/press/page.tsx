'use client';

import { ExternalLink, TrendingUp, Users, Calendar, Award, Zap } from 'lucide-react';

const stats = [
  { label: 'Aktif İşletme', value: '100+', icon: Users },
  { label: 'Aylık Randevu', value: '100K+', icon: Calendar },
  { label: 'Platform Uptime', value: '99.9%', icon: TrendingUp },
  { label: 'Ortalama Yanıt Süresi', value: '24 sa', icon: Zap }
];

const facts = [
  '2025 yılından bu yana hizmet vermekteyiz',
  'Türkiye\'nin birçok ilinde aktif kullanıcılarımız var',
  'ISO 27001 standartlarında güvenlik uygulamaları',
  'KVKK\'ya tam uyumlu platform',
  '7/24 müşteri desteği sunuyoruz'
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            📰 Basın
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Basın Kit
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            RandevuBu ile ilgili medya ve basın kaynakları, logo dosyaları, istatistikler ve daha fazlası
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hakkımızda</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>RandevuBu</strong>, işletmelerin randevu yönetimini dijitalleştiren kapsamlı bir platformdur. 
              2019 yılında kurulmuş olan şirketimiz, berberden estetik kliniğine, spor salonundan diş hekimine 
              kadar geniş bir yelpazede hizmet veren işletmelere çözüm sunmaktadır.
            </p>
            <p>
              Modern teknoloji altyapısı, kullanıcı dostu arayüzü ve kapsamlı özellikleri ile RandevuBu, 
              işletmelerin müşteri ilişkilerini güçlendirir ve iş akışlarını optimize eder.
            </p>
          </div>

          {/* Key Facts */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {facts.map((fact, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{fact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Basın İletişim</h2>
              <p className="text-indigo-100 mb-6">
                Basın ve medya sorularınız için bizimle iletişime geçebilirsiniz. 
                Logo kullanımı, marka kılavuzları veya basın malzemeleri için destek alabilirsiniz.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-indigo-100">Basın Sorumlusu</div>
                    <div className="font-semibold">Basın ve İletişim Ekibi</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <div className="text-sm text-indigo-100">E-posta</div>
                    <div className="font-semibold">press@randevubu.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    📞
                  </div>
                  <div>
                    <div className="text-sm text-indigo-100">Telefon</div>
                    <div className="font-semibold">0545 449 60 42</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4">Hızlı Linkler</h3>
              <div className="space-y-3">
                <a href="/about" className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">Şirket Hakkında</span>
                </a>
                <a href="/features" className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">Özellikler ve Yenilikler</span>
                </a>
                <a href="/contact" className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">Genel İletişim</span>
                </a>
                <a href="/help" className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">Yardım Merkezi</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

