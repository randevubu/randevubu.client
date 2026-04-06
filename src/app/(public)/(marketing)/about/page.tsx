'use client';

import Image from 'next/image';
import { Users, Target, Zap, Shield, Heart, TrendingUp, Award, Globe, Rocket, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { number: '100+', label: 'Aktif İşletme' },
  { number: '100K+', label: 'Aylık Randevu' },
  { number: '81', label: 'İlde Hizmet' },
  { number: '99.9%', label: 'Uptime' }
];

const values = [
  {
    icon: Heart,
    title: 'Müşteri Odaklılık',
    description: 'Müşteri deneyimini her şeyin üzerinde tutuyor, ihtiyaçlarını anlıyor ve çözümler sunuyoruz.'
  },
  {
    icon: Shield,
    title: 'Güvenlik ve Gizlilik',
    description: 'KVKK uyumlu, güvenli platform. Verileriniz şifrelenir ve güvende tutulur.'
  },
  {
    icon: Rocket,
    title: 'Sürekli İnovasyon',
    description: 'Teknolojideki gelişmeleri takip ediyor, platformumuzu sürekli yeniliyoruz.'
  },
  {
    icon: CheckCircle,
    title: 'Kalite',
    description: 'En yüksek standartlarda hizmet sunmak için sürekli gelişim ve iyileştirme yapıyoruz.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white py-20">
        <div className="absolute inset-0">
          <Image
            src="/herobackground2.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-white font-medium text-xs mb-6">
              🚀 RandevuBu
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Randevu Yönetiminde Dijital Çözümler
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed mb-8">
              2025&apos;ten bu yana randevu yoğunluğu olan işletmelerin takvimini sadeleştirmek, ekibin günlük iş
              yükünü hafifletmek ve müşteriye daha net bir rezervasyon deneyimi sunmak için ürün geliştiriyoruz.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-xl text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Misyonumuz
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Randevu yönetimini basitleştirerek, işletmelerin büyümesine ve 
              müşteri memnuniyetinin artmasına katkı sağlamak.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Teknolojik çözümlerimizle, her işletmenin dijital dönüşüm yolculuğuna 
              eşlik etmek ve başarılarını desteklemek.
            </p>
            <ul className="space-y-3 mt-6">
              <li className="flex items-start text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>Erişilebilir ve kullanımı kolay platformlar</span>
              </li>
              <li className="flex items-start text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>KVKK uyumlu ve güvenli sistemler</span>
              </li>
              <li className="flex items-start text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>7/24 müşteri desteği</span>
              </li>
              <li className="flex items-start text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span>Sürekli inovasyon ve geliştirme</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Vizyonumuz
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Türkiye'nin en güvenilir ve en yaygın kullanılan randevu yönetim 
              platformu olmak.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              İşletmelerin dijital dönüşümünde lider olmak, yapay zeka ve 
              otomasyon teknolojileri ile sektörde yeni standartlar belirlemek.
            </p>
            <div className="mt-6 bg-white/50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">2026 Hedefleri</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">5K+</div>
                  <div className="text-sm text-gray-600">İşletme</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">2M+</div>
                  <div className="text-sm text-gray-600">Aylık Randevu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Değerlerimiz</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Her kararımızı ve geliştirmemizi bu değerler yönlendirir
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Hikayemiz</h2>
              <p className="text-lg text-indigo-100 leading-relaxed mb-6">
                2025 yılında, işletmelerin randevu yönetimi konusunda yaşadığı zorlukları gözlemledik. 
                Telefon bazlı rezervasyonlar, unutulan randevular ve manuel takip sistemi nedeniyle 
                oluşan kayıplar, işletmeleri zaman ve gelir kaybına uğratıyordu.
              </p>
              <p className="text-lg text-indigo-100 leading-relaxed">
                Bu sorunları çözmek için yola çıktık ve bugün, onlarca işletmeye güvenilir, 
                kolay kullanılabilir ve ölçeklenebilir bir çözüm sunuyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bizimle Yolculuğa Başlayın
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              RandevuBu ailesine katılan onlarca işletme gibi, dijital dönüşüm yolculuğunuzu başlatın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/onboarding"
                className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Ücretsiz Başlayın
              </Link>
              <Link
                href="/contact"
                className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                İletişime Geçin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
