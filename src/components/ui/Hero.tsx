import React from 'react';

export default function Hero() {
  return (
    <>
      {/* Mobile Hero - Completely Different Design */}
      <section className="block lg:hidden relative bg-[var(--theme-background)] overflow-hidden min-h-screen">
        {/* Mobile Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-primary)]/10 via-transparent to-[var(--theme-accent)]/10"></div>
        <div className="absolute top-20 right-4 w-32 h-32 bg-[var(--theme-primary)]/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-4 w-24 h-24 bg-[var(--theme-accent)]/5 rounded-full blur-xl"></div>
        
        {/* Mobile Content */}
        <div className="relative px-4 pt-20 pb-32">
          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-full px-4 py-2 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-[var(--theme-foreground)]">2,500+ aktif salon</span>
              </div>
            </div>
          </div>

          {/* Main Title - Mobile Optimized */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-[var(--theme-foreground)] leading-[1.1] mb-4">
              Randevu Al
              <br/>
              <span className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] bg-clip-text text-transparent">
                30 Saniyede
              </span>
            </h1>
            <p className="text-lg text-[var(--theme-foregroundSecondary)] leading-relaxed px-2">
              Modern salon rezervasyon deneyimi. Hızlı, kolay, güvenilir.
            </p>
          </div>

          {/* Mobile Preview Card - Interactive */}
          <div className="relative mb-8">
            <div className="bg-[var(--theme-card)] rounded-3xl p-6 border border-[var(--theme-border)] shadow-2xl transform">
              {/* Phone Frame Effect */}
              <div className="relative bg-gray-900 rounded-2xl p-1">
                <div className="bg-[var(--theme-background)] rounded-2xl overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 py-2 text-xs text-[var(--theme-foregroundSecondary)]">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-[var(--theme-success)] rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[var(--theme-foreground)] text-sm">Bugün</h3>
                      <span className="text-xs text-[var(--theme-primary)] font-semibold">3 randevu</span>
                    </div>
                    
                    {/* Appointment Cards */}
                    <div className="space-y-2">
                      <div className="bg-[var(--theme-primary)]/10 rounded-xl p-3 border-l-4 border-[var(--theme-primary)]">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-xs text-[var(--theme-foreground)]">Ali Veli</p>
                            <p className="text-xs text-[var(--theme-foregroundSecondary)]">Saç Kesimi</p>
                          </div>
                          <span className="text-xs font-bold text-[var(--theme-primary)]">14:00</span>
                        </div>
                      </div>
                      
                      <div className="bg-[var(--theme-accent)]/10 rounded-xl p-3 border-l-4 border-[var(--theme-accent)]">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-xs text-[var(--theme-foreground)]">Ayşe Yıl</p>
                            <p className="text-xs text-[var(--theme-foregroundSecondary)]">Boyama</p>
                          </div>
                          <span className="text-xs font-bold text-[var(--theme-accent)]">15:30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile CTA - App-like */}
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-white py-5 rounded-2xl font-bold text-lg shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              <span className="relative">Ücretsiz Başla ✨</span>
            </button>
            
            <button className="w-full border-2 border-[var(--theme-border)] text-[var(--theme-foreground)] py-4 rounded-2xl font-semibold bg-[var(--theme-card)] hover:bg-[var(--theme-backgroundSecondary)] transition-colors">
              Demo İzle (2 dk)
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center space-x-4 text-xs text-[var(--theme-foregroundSecondary)]">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Ücretsiz</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Hızlı Kurulum</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>7/24 Destek</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Hero - Original Design */}
      <section className="hidden lg:flex relative bg-[var(--theme-background)] overflow-hidden min-h-[80vh] items-center transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)]/5 via-[var(--theme-background)] to-[var(--theme-accent)]/5"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center px-3 py-1 bg-[var(--theme-primary)]/10 rounded-full text-[var(--theme-primary)] font-medium text-xs mb-4">
                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Salon sahipleri için #1 platform
              </div>
              
              <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-[var(--theme-foreground)] leading-tight mb-6">
                Randevu Almak
                <br />
                <span className="text-[var(--theme-primary)]">Hiç Bu Kadar Kolay Olmamıştı</span>
              </h1>
              
              <p className="text-lg sm:text-base lg:text-lg text-[var(--theme-foregroundSecondary)] leading-relaxed mb-8 max-w-lg">
                Modern randevu sistemi ile müşterilerinizi zahmetsizce yönetin. 
                Online rezervasyon, otomatik hatırlatıcılar ve gelir takibi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-8 py-4 rounded-2xl font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base min-h-[56px] flex items-center justify-center">
                  Ücretsiz Deneme Başlat
                </button>
                <button className="flex items-center justify-center px-8 py-4 text-[var(--theme-foregroundSecondary)] font-semibold hover:text-[var(--theme-primary)] transition-all rounded-2xl hover:bg-[var(--theme-backgroundSecondary)] text-base min-h-[56px]">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Demo İzle
                </button>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-[var(--theme-primary)] rounded-full border-2 border-[var(--theme-background)]"></div>
                    <div className="w-8 h-8 bg-[var(--theme-accent)] rounded-full border-2 border-[var(--theme-background)]"></div>
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full border-2 border-[var(--theme-background)]"></div>
                  </div>
                  <div>
                    <div className="text-[var(--theme-foreground)] font-semibold text-sm transition-colors duration-300">2,500+ işletme</div>
                    <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">RandevuBu'ya güveniyor</div>
                  </div>
                </div>
              </div>
            </div>
          
            
            <div className="order-1 lg:order-2 relative">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-2xl blur-xl opacity-20"></div>
                <div className="relative bg-[var(--theme-card)] rounded-2xl shadow-xl p-4 lg:p-6 border border-[var(--theme-border)] transition-colors duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border)]">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--theme-foreground)] transition-colors duration-300">Bugünün Programı</h3>
                        <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1 transition-colors duration-300">8 randevu rezerve edildi</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[var(--theme-primary)] transition-colors duration-300">85%</div>
                        <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Kapasite</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-[var(--theme-primary)]/10 rounded-xl border border-[var(--theme-primary)]/20 transition-colors duration-300">
                        <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-xl flex items-center justify-center text-[var(--theme-primaryForeground)] font-bold text-sm">
                          AY
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--theme-foreground)] text-sm transition-colors duration-300">Ahmet Yılmaz</p>
                          <p className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Saç Kesimi & Sakal Tıraşı</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[var(--theme-primary)] font-bold text-sm transition-colors duration-300">14:00</div>
                          <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">45 dk</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-[var(--theme-accent)]/10 rounded-xl border border-[var(--theme-accent)]/20 transition-colors duration-300">
                        <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-primary)] rounded-xl flex items-center justify-center text-[var(--theme-accentForeground)] font-bold text-sm">
                          AD
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--theme-foreground)] text-sm transition-colors duration-300">Ayşe Demir</p>
                          <p className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Boyama & Kesim</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[var(--theme-accent)] font-bold text-sm transition-colors duration-300">15:30</div>
                          <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">90 dk</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-[var(--theme-secondary)] rounded-xl border border-[var(--theme-border)] transition-colors duration-300">
                        <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-xl flex items-center justify-center text-[var(--theme-primaryForeground)] font-bold text-sm">
                          MK
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--theme-foreground)] text-sm transition-colors duration-300">Mehmet Kaya</p>
                          <p className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Klasik Kesim</p>
                        </div>
                        <div className="text-right">
                          <div className="text-[var(--theme-primary)] font-bold text-sm transition-colors duration-300">17:00</div>
                          <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">30 dk</div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] py-3 rounded-xl font-semibold hover:from-[var(--theme-primaryHover)] hover:to-[var(--theme-accentHover)] transition-all shadow-lg text-sm">
                      + Yeni Randevu
                    </button>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-[var(--theme-success)] to-emerald-600 text-[var(--theme-primaryForeground)] px-4 py-2 rounded-xl font-semibold shadow-lg transform rotate-3 text-sm">
                  ↗ +%30 Gelir
                </div>
                
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[var(--theme-warning)] to-orange-500 text-[var(--theme-primaryForeground)] px-3 py-1 rounded-lg font-semibold shadow-lg transform -rotate-6 text-xs">
                  ⚡ Anlık
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}