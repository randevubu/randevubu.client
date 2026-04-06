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
                Bu metinde, RandevuBu'da hangi çerezleri neden kullandığımızı ve bunları nasıl yönetebileceğinizi açıkca
                anlatıyoruz. Amacımız; oturumunuzu güvenli tutmak, tercihlerinizi hatırlamak ve size daha akici bir deneyim
                sunmak.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Çerezler Nedir?</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed mb-3">
                  Çerezler (cookies), RandevuBu'yu kullandığınızda tarayıcınıza veya cihazınıza kaydedilen küçük veri
                  dosyalarıdır. Bu dosyalar kim olduğunuzu doğrudan göstermek için değil, oturumunuzu tanıyıp hizmeti
                  düzenli çalıştırmak için kullanılır.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Kısaca; tekrar giriş yapma ihtiyacını azaltmak, güvenlik kontrollerini yürütmek ve temel tercihlerinizi
                  hatırlamak için çerezlerden yararlanıyoruz.
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
                      Platformun temel fonksiyonlarını çalıştıran zorunlu çerezlerdir. Oturumun açık kalması, güvenlik
                      doğrulamaları ve dil/arayüz tercihlerinizin korunması bu grupta yürütülür.
                    </p>
                    <p className="text-xs text-red-700 mt-2 italic">
                      Bu çerezler devre dışı kalırsa hizmetin bazı bölümleri beklenen şekilde çalışmayabilir.
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
                      Performans çerezleri, ziyaret akışını ve sayfa etkileşimlerini ölçmemize yardımcı olur. Bu
                      veriler sayesinde hangi alanların iyileştirilmesi gerektiğini analiz ederiz.
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      Kimliğinizi doğrudan tanımlayan veri üretmez; toplu ve istatistiksel ölçüm için kullanılır.
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
                      Fonksiyonel çerezler, yaptığınız seçimleri hatırlayarak kullanım deneyimini daha akıcı hale getirir.
                      Dil tercihi ve arayüz ayarları gibi kişiselleştirme seçenekleri bu çerezlerle korunur.
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
                      Reklam ve pazarlama çerezleri, ilginizi çekebilecek kampanya ve içerikleri daha ilgili şekilde
                      sunmamıza yardımcı olur. Aynı zamanda dijital reklam çalışmalarının performansını ölçmek için
                      kullanılır.
                    </p>
                    <div className="bg-purple-100 rounded-lg p-3 mt-2">
                      <p className="text-xs text-purple-900">
                        <strong>Önemli:</strong> Bu çerezlere ilişkin bazı teknik veriler, reklam altyapısı sunan üçüncü taraf
                        hizmet sağlayıcılarla sınırlı ölçüde işlenebilir. Verilerinizi üçüncü kişilere satmayız.
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

                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Çerezleri Nasıl Silersiniz?</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <p className="text-gray-700 mb-4">
                  Çerezleri tarayıcı ayarlarından dilediğiniz zaman temizleyebilirsiniz. Ancak bu işlemden sonra
                  bazı işlevleri yeniden kurmamız gerekebilir ve deneyiminiz kısa süreli etkilenebilir.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Hesap oturumunuzu yeniden açmanız gerekebilir</li>
                  <li>• Kaydettiğiniz tercihleri tekrar seçmeniz istenebilir</li>
                  <li>• Bazı sayfalar ilk açılışta beklenenden farklı davranabilir</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Çerez Politikası Değişiklikleri</h2>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed">
                  Çerez politikamızı, hizmetteki gelişmeler ve yasal gerekliliklere göre zaman zaman yenileriz. Güncel
                  sürümü bu sayfada yayınlarız ve yürürlük tarihini açıkça belirtiriz. Bu yüzden politikayı belirli
                  aralıklarla kontrol etmenizi öneririz.
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
                  <p>
                    <strong>Adres:</strong> Kemalpaşa Mah. Bahçıvan Sk. No: 1/7B
                    <br />
                    İnegöl/BURSA
                  </p>
                  <p><strong>Vergi Dairesi:</strong> İnegöl Vergi Dairesi</p>
                  <p><strong>Vergi K.No:</strong> 8681220052</p>
                  <p><strong>Telefon:</strong> 0555 175 65 98 / 0546 660 4336</p>
                  <p><strong>E-posta:</strong> info.randevubu@gmail.com</p>
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

