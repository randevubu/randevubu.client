import { Navbar, Features, Footer } from '../../components';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            ⚡ Tüm Özellikler
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
            RandevuBu'nun
            <br />
            <span className="text-indigo-600">Güçlü Özellikleri</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Salon işletmenizi dijital çağa taşıyan, müşteri memnuniyetini artıran ve gelirinizi optimize eden 
            kapsamlı özellik setimizi keşfedin.
          </p>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">2,500+</div>
              <div className="text-sm text-gray-600">Aktif Salon</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-sm text-gray-600">Rezervasyon</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-emerald-600 mb-2">%75</div>
              <div className="text-sm text-gray-600">Daha Az No-Show</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Otomatik Sistem</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Component */}
      <Features />

      {/* Additional Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Daha Fazla
              <span className="text-indigo-600"> Avantaj</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Rekabette öne çıkmanızı sağlayan ek özelliklerimiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Veri Güvenliği</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Müşteri bilgileriniz SSL şifrelemesi ve KVKK uyumluluğu ile korunur. 
                Düzenli yedekleme sistemi ile verileriniz güvende.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4"/>
                    </svg>
                  </div>
                  256-bit SSL şifrelemesi
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4"/>
                    </svg>
                  </div>
                  KVKK uyumlu sistem
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4"/>
                    </svg>
                  </div>
                  Günlük otomatik yedekleme
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hızlı Performans</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Bulut tabanlı altyapı ile yüksek hızlı performans. 
                Mobil uyumlu arayüz ile her cihazda sorunsuz çalışır.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4"/>
                    </svg>
                  </div>
                  %99.9 uptime garantisi
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4"/>
                    </svg>
                  </div>
                  Hızlı sayfa yükleme
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4"/>
                    </svg>
                  </div>
                  Mobil responsive tasarım
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}