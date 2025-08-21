export default function Hero() {
  return (
    <section className="relative bg-white overflow-hidden min-h-[80vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
              <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Salon sahipleri için #1 platform
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
              Randevu Almak
              <br />
              <span className="text-indigo-600">Hiç Bu Kadar Kolay Olmamıştı</span>
            </h1>
            
            <p className="text-base lg:text-lg text-gray-600 leading-relaxed mb-6 max-w-lg">
              Modern randevu sistemi ile müşterilerinizi zahmetsizce yönetin. 
              Online rezervasyon, otomatik hatırlatıcılar ve gelir takibi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Ücretsiz Deneme Başlat
              </button>
              <button className="flex items-center justify-center px-6 py-3 text-gray-700 font-semibold hover:text-indigo-600 transition-all">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Demo İzle
              </button>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-gray-900 font-semibold text-sm">2,500+ işletme</div>
                  <div className="text-xs text-gray-500">RandevuBu'ya güveniyor</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Bugünün Programı</h3>
                      <p className="text-xs text-gray-500 mt-1">8 randevu rezerve edildi</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-indigo-600">85%</div>
                      <div className="text-xs text-gray-500">Kapasite</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        AY
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Ahmet Yılmaz</p>
                        <p className="text-xs text-gray-600">Saç Kesimi & Sakal Tıraşı</p>
                      </div>
                      <div className="text-right">
                        <div className="text-indigo-600 font-bold text-sm">14:00</div>
                        <div className="text-xs text-gray-500">45 dk</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        AD
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Ayşe Demir</p>
                        <p className="text-xs text-gray-600">Boyama & Kesim</p>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-600 font-bold text-sm">15:30</div>
                        <div className="text-xs text-gray-500">90 dk</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        MK
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Mehmet Kaya</p>
                        <p className="text-xs text-gray-600">Klasik Kesim</p>
                      </div>
                      <div className="text-right">
                        <div className="text-pink-600 font-bold text-sm">17:00</div>
                        <div className="text-xs text-gray-500">30 dk</div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg text-sm">
                    + Yeni Randevu
                  </button>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transform rotate-3 text-sm">
                ↗ +%30 Gelir
              </div>
              
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-lg font-semibold shadow-lg transform -rotate-6 text-xs">
                ⚡ Anlık
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}