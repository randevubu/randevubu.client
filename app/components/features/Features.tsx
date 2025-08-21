type ColorKey = 'indigo' | 'purple' | 'pink' | 'emerald' | 'orange' | 'blue';

export default function Features() {
  const features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: ColorKey;
  }> = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Akıllı Planlama",
      description: "Çifte rezervasyonları önleyen ve programınızı maksimum verimlilik için optimize eden AI destekli rezervasyon sistemi.",
      color: "indigo" as ColorKey
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Mobil Öncelikli",
      description: "Müşterileriniz her zaman, her yerden randevu alabilir. Rezervasyonların %90'ı mobil cihazlarda gerçekleşir.",
      color: "purple" as ColorKey
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V12a7 7 0 0 1 7-7v3m-7 7V8a5 5 0 0 1 5-5v5h5l-5 5-5-5h5z" />
        </svg>
      ),
      title: "Otomatik Hatırlatıcılar",
      description: "Müşterilerinize otomatik olarak gönderilen SMS ve e-posta hatırlatıcıları ile gelmeyen müşteri oranını %75 azaltın.",
      color: "pink" as ColorKey
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "İş Analitiği",
      description: "Gelir, popüler hizmetler ve müşteri trendlerini detaylı raporlar ve içgörülerle takip edin.",
      color: "emerald" as ColorKey
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Güvenli Ödemeler",
      description: "Endüstri lideri güvenlik ile online ödeme kabul edin. Kart, dijital cüzdan ve daha fazlası için destek.",
      color: "orange" as ColorKey
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      title: "Ekip Yönetimi",
      description: "Birden fazla stilist yönetin, bireysel performansı takip edin ve programları zahmetsizce koordine edin.",
      color: "blue" as ColorKey
    }
  ];

  const colorClasses: Record<ColorKey, string> = {
    indigo: "from-indigo-500 to-indigo-600 group-hover:shadow-indigo-500/25",
    purple: "from-purple-500 to-purple-600 group-hover:shadow-purple-500/25", 
    pink: "from-pink-500 to-pink-600 group-hover:shadow-pink-500/25",
    emerald: "from-emerald-500 to-emerald-600 group-hover:shadow-emerald-500/25",
    orange: "from-orange-500 to-orange-600 group-hover:shadow-orange-500/25",
    blue: "from-blue-500 to-blue-600 group-hover:shadow-blue-500/25"
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            ⚡ Güçlü Özellikler
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
            Salonunuzu yönetmek için
            <br />
            <span className="text-indigo-600">ihtiyacınız olan her şey</span>
          </h2>
          
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Randevu rezervasyonundan ödeme işlemine kadar, işinizin her yönünü modern, sezgisel araçlarla kapsadık.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[feature.color]} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg transition-all duration-300 group-hover:scale-110`}>
                {feature.icon}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-10"></div>
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full"></div>
              <div className="absolute top-16 right-12 w-8 h-8 bg-white rounded-full"></div>
              <div className="absolute bottom-12 left-16 w-6 h-6 bg-white rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full"></div>
            </div>
            
            <div className="relative">
              <h3 className="text-2xl lg:text-3xl font-black mb-4">
                Salonunuzu dönüştürmeye hazır mısınız?
              </h3>
              <p className="text-base lg:text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
                Daha akıllı rezervasyona geçen binlerce salon sahibine katılın.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  Ücretsiz Deneme Başlat
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-3 rounded-2xl font-bold hover:border-white hover:bg-white/10 transition-all">
                  Demo Planla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}