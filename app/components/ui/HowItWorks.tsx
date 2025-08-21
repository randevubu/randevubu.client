export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Müşteri Randevu Alır",
      description: "Müşterileriniz web sitenizden veya mobil uygulamanızdan 7/24 kolayca randevu alabilir.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      color: "indigo"
    },
    {
      step: 2,
      title: "Otomatik Onay Gönderilir",
      description: "Sistem otomatik olarak randevuyu onaylar ve hem size hem müşteriye bildirim gönderir.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "emerald"
    },
    {
      step: 3,
      title: "Hatırlatıcı Mesajları",
      description: "Randevu tarihinden önce otomatik SMS ve e-posta hatırlatıcıları gönderilir.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V12a7 7 0 0 1 7-7v3m-7 7V8a5 5 0 0 1 5-5v5h5l-5 5-5-5h5z" />
        </svg>
      ),
      color: "orange"
    },
    {
      step: 4,
      title: "Başarılı Randevu Tamamlanır",
      description: "Müşteri randevusuna gelir, hizmet tamamlanır ve salon sahibi mutlu müşteri ile daha fazla gelir elde eder.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "purple"
    }
  ];

  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600", 
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600"
  } as const;

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            🚀 Nasıl Çalışır
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
            <span className="text-indigo-600">4 Basit Adımda</span>
            <br />
            Randevu Sistemi
          </h2>
          
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Müşterilerinizin randevu almasından hizmetin tamamlanmasına kadar tüm süreci otomatikleştirin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              )}
              
              <div className="relative bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 z-10">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full border-4 border-gray-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">{step.step}</span>
                </div>
                
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                %75
              </div>
              <div className="text-gray-600 font-medium text-sm">Daha Az Gelmeyen Müşteri</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                %30
              </div>
              <div className="text-gray-600 font-medium text-sm">Gelir Artışı</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-gray-600 font-medium text-sm">Otomatik Rezervasyon</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full"></div>
              <div className="absolute top-16 right-12 w-8 h-8 bg-white rounded-full"></div>
              <div className="absolute bottom-12 left-16 w-6 h-6 bg-white rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full"></div>
            </div>
            
            <div className="relative">
              <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">
                Hemen Başlamak İster Misiniz?
              </h3>
              <p className="text-base lg:text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
                Kurulum sadece 5 dakika! Size özel demo ile sistemi keşfedin.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  Ücretsiz Demo Al
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-3 rounded-2xl font-bold hover:border-white hover:bg-white/10 transition-all">
                  Hemen Başla
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}