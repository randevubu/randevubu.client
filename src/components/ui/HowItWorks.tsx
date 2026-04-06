import Image from 'next/image';

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
    indigo: "from-[var(--theme-primary)] to-[var(--theme-primaryHover)]",
    emerald: "from-[var(--theme-success)] to-[var(--theme-success)]", 
    orange: "from-[var(--theme-warning)] to-[var(--theme-warning)]",
    purple: "from-[var(--theme-accent)] to-[var(--theme-accentHover)]"
  } as const;

  return (
    <section className="py-16 bg-gradient-to-b from-[var(--theme-backgroundSecondary)] to-[var(--theme-background)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-[var(--theme-primary)]/10 rounded-full text-[var(--theme-primary)] font-medium text-xs mb-4 transition-colors duration-300">
            🚀 Nasıl Çalışır
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black text-[var(--theme-foreground)] mb-4 leading-tight transition-colors duration-300">
            <span className="text-[var(--theme-primary)] transition-colors duration-300">4 Basit Adımda</span>
            <br />
            Randevu Sistemi
          </h2>
          
          <p className="text-base lg:text-lg text-[var(--theme-foregroundSecondary)] max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Müşterilerinizin randevu almasından hizmetin tamamlanmasına kadar tüm süreci otomatikleştirin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[var(--theme-border)] to-[var(--theme-borderSecondary)] z-0 transition-colors duration-300">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[var(--theme-borderSecondary)] rounded-full transition-colors duration-300"></div>
                </div>
              )}
              
              <div className="relative bg-[var(--theme-card)] p-6 rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-borderSecondary)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 z-10">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[var(--theme-card)] rounded-full border-4 border-[var(--theme-border)] flex items-center justify-center transition-colors duration-300">
                  <span className="text-sm font-bold text-[var(--theme-foregroundSecondary)] transition-colors duration-300">{step.step}</span>
                </div>
                
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[step.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-[var(--theme-cardForeground)] mb-3 transition-colors duration-300">{step.title}</h3>
                <p className="text-sm text-[var(--theme-foregroundSecondary)] leading-relaxed transition-colors duration-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-[var(--theme-primary)]/10 to-[var(--theme-accent)]/10 rounded-3xl p-8 transition-colors duration-300">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] bg-clip-text text-transparent mb-2 transition-colors duration-300">
                %75
              </div>
              <div className="text-[var(--theme-foregroundSecondary)] font-medium text-sm transition-colors duration-300">Daha Az Randevu Kaybı</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] bg-clip-text text-transparent mb-2 transition-colors duration-300">
                %30
              </div>
              <div className="text-[var(--theme-foregroundSecondary)] font-medium text-sm transition-colors duration-300">Gelir Artışı</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] bg-clip-text text-transparent mb-2 transition-colors duration-300">
                24/7
              </div>
              <div className="text-[var(--theme-foregroundSecondary)] font-medium text-sm transition-colors duration-300">Otomatik Rezervasyon</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0">
              <Image
                src="/backgroundthema1.png"
                alt=""
                fill
                className="object-cover object-left lg:object-center"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-black/5" />
            </div>
            <div className="relative p-8 lg:p-10 text-white">
              <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">
                Hemen Başlamak İster Misiniz?
              </h3>
              <p className="text-base lg:text-lg text-white mb-6 max-w-2xl mx-auto">
                Kurulum sadece 5 dakika! Size özel demo ile sistemi keşfedin.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-[var(--theme-primary)] px-8 py-3 rounded-2xl font-bold hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  Ücretsiz Demo Al
                </button>
                <button className="border-2 border-white/80 text-white px-8 py-3 rounded-2xl font-bold hover:border-white hover:bg-white/20 transition-all duration-300">
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