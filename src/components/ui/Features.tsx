import React from 'react';
import { Calendar, Smartphone, Bell, Users, BarChart3, Shield } from 'lucide-react';

type ColorKey = 'indigo' | 'purple' | 'pink' | 'emerald' | 'orange' | 'blue';

export default function Features() {
  const features: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: ColorKey;
  }> = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Akıllı Planlama",
      description: "Çifte rezervasyonları önleyen ve programınızı maksimum verimlilik için optimize eden AI destekli rezervasyon sistemi.",
      color: "indigo" as ColorKey
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobil Öncelikli",
      description: "Müşterileriniz her zaman, her yerden randevu alabilir. Rezervasyonların %90'ı mobil cihazlarda gerçekleşir.",
      color: "purple" as ColorKey
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Otomatik Hatırlatıcılar",
      description: "Müşterilerinize otomatik olarak gönderilen SMS ve e-posta hatırlatıcıları ile gelmeyen müşteri oranını %75 azaltın.",
      color: "pink" as ColorKey
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "İş Analitiği",
      description: "Gelir, popüler hizmetler ve müşteri trendlerini detaylı raporlar ve içgörülerle takip edin.",
      color: "emerald" as ColorKey
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Güvenli Ödemeler",
      description: "Endüstri lideri güvenlik ile online ödeme kabul edin. Kart, dijital cüzdan ve daha fazlası için destek.",
      color: "orange" as ColorKey
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Ekip Yönetimi",
      description: "Birden fazla stilist yönetin, bireysel performansı takip edin ve programları zahmetsizce koordine edin.",
      color: "blue" as ColorKey
    }
  ];

  const colorClasses: Record<ColorKey, string> = {
    indigo: "from-[var(--theme-primary)] to-[var(--theme-primaryHover)] group-hover:shadow-[var(--theme-primary)]/25",
    purple: "from-[var(--theme-accent)] to-[var(--theme-accentHover)] group-hover:shadow-[var(--theme-accent)]/25", 
    pink: "from-[var(--theme-secondary)] to-[var(--theme-secondaryHover)] group-hover:shadow-[var(--theme-secondary)]/25",
    emerald: "from-[var(--theme-success)] to-[var(--theme-success)] group-hover:shadow-[var(--theme-success)]/25",
    orange: "from-[var(--theme-warning)] to-[var(--theme-warning)] group-hover:shadow-[var(--theme-warning)]/25",
    blue: "from-[var(--theme-info)] to-[var(--theme-info)] group-hover:shadow-[var(--theme-info)]/25"
  };

  return (
    <>
      {/* Mobile Features - Card Stack Design */}
      <section className="block lg:hidden py-16 bg-[var(--theme-backgroundSecondary)] transition-colors duration-300">
        <div className="px-4">
          {/* Mobile Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 bg-[var(--theme-primary)]/10 rounded-full text-[var(--theme-primary)] font-medium text-xs mb-4">
              ✨ Özellikler
            </div>
            
            <h2 className="text-3xl font-black text-[var(--theme-foreground)] mb-4 leading-tight">
              Salonun için
              <br />
              <span className="text-[var(--theme-primary)]">her şey hazır</span>
            </h2>
            
            <p className="text-base text-[var(--theme-foregroundSecondary)] leading-relaxed px-4">
              Tek tıkla randevu, otomatik hatırlatma, gelir takibi ve daha fazlası
            </p>
          </div>

          {/* Mobile Feature Cards - Scrollable */}
          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 w-72 bg-[var(--theme-card)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-xl snap-center"
                >
                  {/* Feature Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[feature.color]} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  
                  {/* Feature Content */}
                  <h3 className="text-xl font-bold text-[var(--theme-cardForeground)] mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--theme-foregroundSecondary)] leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Quick Action */}
                  <button className="w-full bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] py-3 rounded-xl font-semibold hover:bg-[var(--theme-primary)] hover:text-white transition-all text-sm">
                    Keşfet →
                  </button>
                </div>
              ))}
            </div>
            
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {features.map((_, index) => (
                <div key={index} className="w-2 h-2 bg-[var(--theme-border)] rounded-full"></div>
              ))}
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 text-center">
            <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
              <div className="text-2xl font-black text-[var(--theme-primary)] mb-1">2.5K+</div>
              <div className="text-xs text-[var(--theme-foregroundSecondary)]">Aktif Salon</div>
            </div>
            <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
              <div className="text-2xl font-black text-[var(--theme-accent)] mb-1">50K+</div>
              <div className="text-xs text-[var(--theme-foregroundSecondary)]">Randevu/Ay</div>
            </div>
            <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
              <div className="text-2xl font-black text-[var(--theme-success)] mb-1">98%</div>
              <div className="text-xs text-[var(--theme-foregroundSecondary)]">Memnuniyet</div>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="mt-12">
            <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-3xl p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <h3 className="text-xl font-black mb-2">
                  Hemen Dene!
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  30 saniyede kurulum, ücretsiz deneme
                </p>
                <button className="bg-white text-[var(--theme-primary)] px-8 py-4 rounded-2xl font-bold text-base shadow-xl">
                  Başla →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Features - Original Design */}
      <section className="hidden lg:block py-16 bg-gradient-to-b from-[var(--theme-background)] to-[var(--theme-backgroundSecondary)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 bg-[var(--theme-primary)]/10 rounded-full text-[var(--theme-primary)] font-medium text-xs mb-4 transition-colors duration-300">
              ⚡ Güçlü Özellikler
            </div>
            
            <h2 className="text-4xl font-black text-[var(--theme-foreground)] mb-4 leading-tight transition-colors duration-300">
              Salonunuzu yönetmek için
              <br />
              <span className="text-[var(--theme-primary)] transition-colors duration-300">ihtiyacınız olan her şey</span>
            </h2>
            
            <p className="text-lg text-[var(--theme-foregroundSecondary)] max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              Randevu rezervasyonundan ödeme işlemine kadar, işinizin her yönünü modern, sezgisel araçlarla kapsadık.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-[var(--theme-card)] p-6 sm:p-6 rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-borderSecondary)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`w-14 h-14 sm:w-12 sm:h-12 bg-gradient-to-br ${colorClasses[feature.color]} rounded-xl flex items-center justify-center text-white mb-5 sm:mb-4 shadow-lg transition-all duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl sm:text-lg font-bold text-[var(--theme-cardForeground)] mb-4 sm:mb-3 transition-colors duration-300 leading-tight">{feature.title}</h3>
                <p className="text-base sm:text-sm text-[var(--theme-foregroundSecondary)] leading-relaxed transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-3xl blur-2xl opacity-10 transition-colors duration-300"></div>
            <div className="relative bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-3xl p-8 sm:p-8 lg:p-12 text-white text-center overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full"></div>
                <div className="absolute top-16 right-12 w-8 h-8 bg-white rounded-full"></div>
                <div className="absolute bottom-12 left-16 w-6 h-6 bg-white rounded-full"></div>
                <div className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full"></div>
              </div>
              
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl lg:text-3xl font-black mb-6 sm:mb-4">
                  Salonunuzu dönüştürmeye hazır mısınız?
                </h3>
                <p className="text-lg sm:text-base lg:text-lg text-[var(--theme-primaryForeground)]/80 mb-8 max-w-2xl mx-auto transition-colors duration-300">
                  Daha akıllı rezervasyona geçen binlerce salon sahibine katılın.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-[var(--theme-primary)] px-8 py-4 sm:py-3 rounded-2xl font-bold hover:bg-[var(--theme-backgroundSecondary)] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-base min-h-[56px] sm:min-h-[auto] flex items-center justify-center">
                    Ücretsiz Deneme Başlat
                  </button>
                  <button className="border-2 border-white/30 text-white px-8 py-4 sm:py-3 rounded-2xl font-bold hover:border-white hover:bg-white/10 transition-all duration-300 text-base min-h-[56px] sm:min-h-[auto] flex items-center justify-center">
                    Demo Planla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}