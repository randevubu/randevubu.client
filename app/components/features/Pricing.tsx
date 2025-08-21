export default function Pricing() {
  const plans = [
    {
      name: "Başlangıç",
      price: 750,
      period: "ay",
      description: "Küçük salonlar ve berber dükkanları için",
      color: "indigo",
      popular: false,
      features: [
        "250 aya kadar randevu",
        "1,000 SMS kredisi/ay",
        "Temel takvim sistemi",
        "SMS hatırlatıcıları",
        "Müşteri veritabanı",
        "Temel raporlama",
        "7/24 email desteği"
      ]
    },
    {
      name: "Profesyonel",
      price: 1250,
      period: "ay", 
      description: "Orta ölçekli salonlar için ideal",
      color: "purple",
      popular: true,
      features: [
        "750 aya kadar randevu",
        "2,500 SMS kredisi/ay",
        "Gelişmiş takvim sistemi",
        "SMS + Email hatırlatıcıları",
        "Çoklu personel yönetimi",
        "Detaylı analitik raporları",
        "Online ödeme entegrasyonu",
        "Özel branding",
        "Öncelikli telefon desteği"
      ]
    },
    {
      name: "Kurumsal",
      price: 2000,
      period: "ay",
      description: "Büyük salonlar ve salon zincirleri için",
      color: "emerald",
      popular: false,
      features: [
        "Sınırsız randevu",
        "5,000 SMS kredisi/ay",
        "Çoklu lokasyon yönetimi",
        "Gelişmiş raporlama & analizler",
        "API entegrasyonu",
        "Özel mobil uygulama",
        "Kişisel hesap yöneticisi",
        "Özel eğitim ve kurulum",
        "7/24 telefon desteği",
        "Veri yedekleme servisi"
      ]
    }
  ];

  const colorClasses = {
    indigo: {
      gradient: "from-indigo-500 to-indigo-600",
      ring: "ring-indigo-500",
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200"
    },
    purple: {
      gradient: "from-purple-500 to-purple-600", 
      ring: "ring-purple-500",
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200"
    },
    emerald: {
      gradient: "from-emerald-500 to-emerald-600",
      ring: "ring-emerald-500", 
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200"
    }
  } as const;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            💳 Abonelik Planları
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
            Size Uygun
            <br />
            <span className="text-indigo-600">Abonelik Seçin</span>
          </h2>
          
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            İşletmenizin boyutuna göre tasarlanmış esnek fiyatlandırma planları. İstediğiniz zaman değiştirebilirsiniz.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular 
                  ? `${colorClasses[plan.color as keyof typeof colorClasses].border} ring-2 ${colorClasses[plan.color as keyof typeof colorClasses].ring}` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`bg-gradient-to-r ${colorClasses[plan.color as keyof typeof colorClasses].gradient} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                    ⭐ En Popüler
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-black text-gray-900">₺{plan.price.toLocaleString('tr-TR')}</span>
                      <span className="text-xl text-gray-500 ml-2">/{plan.period}</span>
                    </div>
                  </div>

                  <button 
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                      plan.popular
                        ? `bg-gradient-to-r ${colorClasses[plan.color as keyof typeof colorClasses].gradient} text-white hover:shadow-2xl`
                        : `bg-gray-900 text-white hover:bg-gray-800`
                    }`}
                  >
                    {plan.popular ? 'Hemen Başla' : 'Plan Seç'}
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colorClasses[plan.color as keyof typeof colorClasses].gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tüm Planlar İçin Özel Avantajlar
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">15 gün ücretsiz deneme</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">İstediğiniz zaman iptal</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Türkçe müşteri desteği</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Tüm fiyatlar KDV dahildir. Ödeme güvenliği SSL sertifikası ile korunmaktadır.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Soruların mı var? Bizi Ara
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-2xl font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all">
                Karşılaştırma Tablosu
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}