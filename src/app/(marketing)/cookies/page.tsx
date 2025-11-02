'use client';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Çerez Politikası
          </h1>
          
          <div className="prose prose-sm sm:prose max-w-none">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-6 mb-8 rounded-r-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                Bu Çerez Politikası, <strong>RandevuBu</strong> platformu tarafından kullanılan çerezler hakkında bilgi verir. 
                Web sitemizi ziyaret ettiğinizde, aşağıda açıklanan şekilde çerezler kullanarak sizinle daha kişiselleştirilmiş 
                bir deneyim sunmayı amaçlıyoruz.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Çerezler Nedir?</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Çerezler (cookies), bir web sitesini ziyaret ettiğinizde bilgisayarınıza veya mobil cihazınıza yerleştirilen 
                  küçük metin dosyalarıdır. Bu dosyalar, web sitesinin siz ve tercihlerinize göre daha verimli bir şekilde 
                  çalışmasına yardımcı olur.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Çerezler sayesinde, ziyaret ettiğiniz sayfalar, tıkladığınız öğeler ve diğer etkileşimler gibi bilgileri 
                  "hatırlayarak" sizin için daha kişiselleştirilmiş bir deneyim sunar.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Çerez Türleri</h2>
              
              <p className="text-gray-700 mb-6">
                Çerezler, kullanım amacına göre farklı kategorilere ayrılır. Platformumuzda aşağıdaki çerez türlerini kullanıyoruz:
              </p>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-red-900 flex items-center">
                      <span className="mr-2">⚡</span>
                      2.1. Kesinlikle Gerekli Çerezler
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      Web sitesinin temel işlevlerini yerine getirmesi için gereklidir. Örneğin oturum açma, güvenlik kontrolleri, 
                      dil tercihleriniz gibi işlemleri yönetir.
                    </p>
                    <p className="text-xs text-red-700 mt-2 italic">
                      Bu çerezler olmadan web sitemiz düzgün çalışmaz.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-blue-900 flex items-center">
                      <span className="mr-2">📊</span>
                      2.2. Performans Çerezleri
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      Web sitemizi nasıl kullandığınızı ve kullanıcı etkileşiminizi izlemek amacıyla kullanılır. 
                      Bu çerezler, anonim veriler toplar ve sitenin nasıl geliştirilebileceğine dair bilgi sağlar.
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      Kişisel bilgi içermez, sadece istatistiksel veri toplar.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-green-900 flex items-center">
                      <span className="mr-2">⚙️</span>
                      2.3. Fonksiyonel Çerezler
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      Web sitemizi daha kişisel hale getirmemize yardımcı olur. Tercihlerinizi, dil seçimlerinizi 
                      ve kullanıcı ayarlarınızı hatırlayarak deneyiminizi iyileştirir.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-purple-900 flex items-center">
                      <span className="mr-2">📢</span>
                      2.4. Reklam ve Pazarlama Çerezleri
                    </h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700 mb-3">
                      Size ilgi alanlarınıza dayalı reklamlar sunmak için kullanılır. 
                      Çevrimiçi pazarlama ve reklamcılık faaliyetlerini yönetmek amacıyla kullanılır.
                    </p>
                    <div className="bg-purple-100 rounded-lg p-3 mt-2">
                      <p className="text-xs text-purple-900">
                        <strong>Önemli:</strong> Reklam ve pazarlama çerezleri, üçüncü taraf reklam hizmet sağlayıcılarıyla paylaşılabilir. 
                        Ancak platformumuz verilerinizi üçüncü şahıslara satmaz veya paylaşmaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Çerez Kontrolü</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-4">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Web sitemizi kullanarak çerezlerin kullanılmasını kabul ediyorsunuz. Ancak, tarayıcı ayarlarınızı değiştirerek 
                  çerezleri kontrol edebilir veya reddedebilirsiniz.
                </p>
                <p className="text-sm text-amber-900 italic">
                  Çerezleri devre dışı bırakmak, web sitemizin bazı özelliklerinin düzgün çalışmamasına yol açabilir.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-gray-900 mb-3">Tarayıcılarda Çerez Yönetimi</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">🌐</span>
                    <div>
                      <p className="font-semibold text-gray-900">Google Chrome</p>
                      <p className="text-gray-600">Ayarlar &gt; Gizlilik &gt; Çerezler</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-orange-600">🔥</span>
                    <div>
                      <p className="font-semibold text-gray-900">Mozilla Firefox</p>
                      <p className="text-gray-600">Seçenekler &gt; Gizlilik &gt; Çerezler</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">🦁</span>
                    <div>
                      <p className="font-semibold text-gray-900">Safari</p>
                      <p className="text-gray-600">Tercihler &gt; Gizlilik &gt; Çerezler</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400">🌊</span>
                    <div>
                      <p className="font-semibold text-gray-900">Microsoft Edge</p>
                      <p className="text-gray-600">Ayarlar &gt; Gizlilik &gt; Çerezler</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Çerezleri Nasıl Silersiniz?</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <p className="text-gray-700 mb-4">
                  Çerezleri tarayıcı ayarlarınızdan manuel olarak silebilirsiniz. Ancak çerezlerinizi silmek, 
                  web sitemizin bazı özelliklerinin düzgün çalışmamasına neden olabilir.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Oturum bilgileriniz kaybolabilir</li>
                  <li>• Tercihleriniz sıfırlanabilir</li>
                  <li>• Bazı sayfa özellikleri çalışmayabilir</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Çerez Politikası Değişiklikleri</h2>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed">
                  Çerez politikamızı zaman zaman güncelleyebiliriz. Bu tür değişiklikler, yeni bir sürüm yayınlandığında 
                  ve geçerli tarihlerde duyurulacaktır. Bu nedenle, çerez politikamızı düzenli olarak gözden geçirmeniz önemlidir.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. KVKK ve Açık Rıza</h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-3">Kişisel Verilerin Korunması</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Çerezler, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında kişisel veri işleme faaliyetidir. 
                  Platformumuzun çerez kullanımına ilişkin detaylı bilgi için 
                  <a href="/kvkk" className="text-blue-600 hover:underline font-semibold"> KVKK Aydınlatma Metni</a> ve 
                  <a href="/privacy" className="text-blue-600 hover:underline font-semibold"> Gizlilik Politikası</a> sayfalarımızı inceleyebilirsiniz.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. İletişim Bilgileri</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">RandevuBu</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Adres:</strong> ÇALCA OSB 1 CAD. TASARIM TEKNOKENT A.Ş. NO: 1/3 İÇ KAPI NO: 204 Demiray Technology - MERKEZ/KÜTAHYA</p>
                  <p><strong>Vergi Dairesi:</strong> Çinili V.D.</p>
                  <p><strong>Vergi K.No:</strong> 4820868313</p>
                  <p><strong>Ticari Sicil:</strong> 13985</p>
                  <p><strong>Mersis No:</strong> 5875314481600001</p>
                  <p><strong>Telefon:</strong> 0545 449 60 42</p>
                  <p><strong>E-posta:</strong> info@randevubu.com</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 mt-6">
                <p className="text-sm text-gray-700 italic">
                  Bu Çerez Politikası hakkında daha fazla bilgi edinmek isterseniz, bizimle iletişime geçebilirsiniz.
                </p>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Versiyon: 1.0 | Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

