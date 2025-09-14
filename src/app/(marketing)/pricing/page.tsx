import { Pricing } from '../../../components';

export default function PricingPage() {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            💳 Fiyatlandırma
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Salonunuza Uygun
            <br />
            <span className="text-indigo-600">Fiyat Planı Seçin</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            İşletmenizin boyutuna ve ihtiyaçlarına göre tasarlanmış esnek fiyatlandırma seçenekleri.
            Tüm planlar 15 gün ücretsiz deneme ile başlar.
          </p>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 font-semibold">15 Gün Ücretsiz Deneme</span>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 font-semibold">İstediğiniz Zaman İptal</span>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <span className="text-gray-700 font-semibold">7/24 Türkçe Destek</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Component */}
      <Pricing />

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
              Sıkça Sorulan
              <span className="text-indigo-600"> Sorular</span>
            </h2>
            <p className="text-lg text-gray-600">
              Fiyatlandırma ile ilgili merak ettikleriniz
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Ücretsiz deneme süresi boyunca kredi kartı bilgisi istenyor mu?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hayır, 15 gün ücretsiz deneme için herhangi bir ödeme bilgisi istenmez.
                Deneme süresi bitiminde devam etmek isterseniz ödeme bilgilerinizi girebilirsiniz.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Plan değiştirme işlemi nasıl yapılır?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hesap ayarlarından istediğiniz zaman plan değiştirebilirsiniz.
                Yüksek plana geçişlerde fark ücreti otomatik olarak hesaplanır.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                SMS kredilerimi başka aya aktarabilir miyim?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                SMS kredileri kullanılmadığı takdirde bir sonraki aya aktarılır.
                Maksimum 3 aylık birikimi destekliyoruz.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                İptal işlemi nasıl yapılır?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Hesap ayarlarından "Aboneliği İptal Et" seçeneği ile veya müşteri hizmetlerimizi arayarak
                iptal işlemini gerçekleştirebilirsiniz. Verileriniz 30 gün boyunca saklanır.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Kurumsal paketlerde özel indirimlerin var mı?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                5+ salon zinciri olan müşterilerimiz için özel fiyatlandırma yapıyoruz.
                Satış ekibimizle iletişime geçerek teklif alabilirsiniz.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Başka sorunuz mu var?
              </h3>
              <p className="text-gray-600 mb-6">
                Müşteri hizmetleri ekibimiz size yardımcı olmaktan mutluluk duyar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Bizi Arayın
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-2xl font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all">
                  Canlı Destek
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}