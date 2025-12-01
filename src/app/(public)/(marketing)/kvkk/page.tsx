'use client';

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Kişisel Verilerin Korunmasına İlişkin Aydınlatma Metni
          </h1>
          
          <div className="prose prose-sm sm:prose max-w-none">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-600 p-6 mb-8 rounded-r-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, <strong>RandevuBu</strong> 
                platformu ve bu platform üzerinden hizmet sunan işletmelerin kişisel veri işleme faaliyetlerine 
                ilişkin aydınlatma yükümlülüklerini yerine getirmek amacıyla aşağıdaki bilgiler sunulmaktadır.
              </p>
              <p className="text-sm text-gray-600 mt-3 italic">
                Bu metin, platformu kullanan işletmeler (B2B) ile son tüketiciler/müşteriler (B2C) arasındaki 
                veri akışı ve sorumlulukların açıklanması amacıyla hazırlanmıştır.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Veri Sorumluluğu ve Rollerimiz</h2>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                RandevuBu platformu, 6698 sayılı KVKK uyarınca hem kendi kullanıcı verileri (işletmeler) 
                hem de platform üzerinden işlenen müşteri verileri bakımından veri sorumlusu konumundadır. 
                Aşağıda bu rollerin detayları ve sorumlulukların dağılımı belirtilmiştir.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">RandevuBu'nun Veri Sorumlusu Sorumlulukları</h3>
              
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 mb-6 shadow-sm">
                <h4 className="font-bold text-emerald-900 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  İşletme Kayıt ve Hesap Verileri
                </h4>
                <p className="text-gray-700 mb-3">RandevuBu platformunu kullanan işletmelerin kayıt ve hesap verileri:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>İşletme yetkililerinin kimlik ve iletişim bilgileri</li>
                  <li>İşletme unvanı, vergi numarası ve ticari sicil bilgileri</li>
                  <li>Yetkili personel ve kullanıcı hesap bilgileri</li>
                  <li>Platform kullanım ve erişim kayıtları (IP adresi, cihaz bilgileri, oturum verileri)</li>
                  <li>Abonelik ve faturalama kayıtları</li>
                  <li>Destek talep ve müşteri hizmetleri kayıtları</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">Platform Üzerinden İşlenen Müşteri Verileri ve Sorumluluk Dağılımı</h3>
              
              <div className="bg-cyan-50 border border-cyan-300 rounded-xl p-6 shadow-sm mb-6">
                <h4 className="font-bold text-cyan-900 mb-4 flex items-center">
                  <span className="mr-2">👥</span>
                  Müşteri Verileri (B2C)
                </h4>
                <p className="text-gray-700 mb-3">Platform üzerinden işlenen ve yönetilen müşteri verileri:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>Randevu ve rezervasyon kayıtları</li>
                  <li>SMS ve e-posta bildirimleri</li>
                  <li>Müşteri iletişim ve tercih kayıtları</li>
                  <li>İYS (İleti Yönetim Sistemi) entegrasyonu</li>
                  <li>İşlem geçmişi ve istatistik verileri</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-amber-900 mb-4 flex items-center">
                  <span className="mr-2">⚖️</span>
                  Sorumluluk Dağılımı
                </h4>
                <div className="space-y-3 text-gray-700">
                  <p className="text-sm">
                    <strong className="text-amber-900">İşletmelerin Sorumluluğu:</strong> Müşteri verilerinin işlenme amaçlarını belirleme, 
                    ileti içeriklerini oluşturma ve müşteri onaylarını toplama.
                  </p>
                  <p className="text-sm">
                    <strong className="text-amber-900">RandevuBu'nun Sorumluluğu:</strong> Kişisel verilerin güvenli saklanması, 
                    işlenmesi, platformun teknik güvenliği, yasal uyumluluk ve KVKK yükümlülüklerinin yerine getirilmesi.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Kişisel Verilerin İşlenme Amaçları</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <span className="mr-2">🏢</span>
                    İşletme Verileri
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">İşletme hesaplarınız için topladığımız ve işlediğimiz veriler:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 text-sm ml-2">
                    <li>Hesap yönetimi ve güvenlik</li>
                    <li>Abonelik işlemleri ve ödeme takibi</li>
                    <li>Sistem performansı ve güvenlik analizi</li>
                    <li>Müşteri destek hizmetleri</li>
                    <li>Yasal ve vergi yükümlülükleri</li>
                    <li>Ürün ve hizmet iyileştirmeleri</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                    <span className="mr-2">👥</span>
                    Müşteri Verileri
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">İşletmelerinizin adına işlediğimiz veriler:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 text-sm ml-2">
                    <li>Randevu ve rezervasyon işlemleri</li>
                    <li>Bildirim ve hatırlatma mesajları</li>
                    <li>Müşteri tercih yönetimi</li>
                    <li>Hizmet kalitesi analizi</li>
                    <li>Raporlama ve istatistiksel analiz</li>
                    <li>Yasal uyumluluk süreçleri</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  Not: Müşteri verilerinin işlenme amaçlarını işletmeler belirlerken, bu verilerin güvenli saklanması, 
                  işlenmesi ve yasal uyumluluk konusundaki yükümlülükler hem işletmeler hem de RandevuBu tarafından yerine getirilir.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. İşlenen Kişisel Veri Kategorileri</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-indigo-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-indigo-900">Kimlik ve İletişim Bilgileri</h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      İşletme yetkililerinin adı, soyadı, unvanı; telefon numarası, e-posta adresi ve işletme iletişim bilgileri
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-blue-900">İşletme ve Finansal Bilgiler</h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      İşletme unvanı, vergi numarası, ticari sicil bilgileri, ödeme geçmişi, fatura bilgileri
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-green-900">Sistem ve Teknik Veriler</h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      IP adresi, cihaz bilgileri, tarayıcı türü, işlem zamanları, platform kullanım logları, güvenlik kayıtları
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-purple-900">Müşteri İşlem Verileri (Teknik İşleme)</h3>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      Randevu detayları, müşteri tercihleri, ileti izin durumları, işlem geçmişi kayıtları
                    </p>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      * Bu verilerin işlenme amaçlarını işletmeleriniz belirlerken, güvenli saklanması ve yasal uyumluluk konusundaki yükümlülükler RandevuBu'ya aittir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Hukuki Sebepler</h2>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 mb-6">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3">Platform'un Veri İşleme Hukuki Dayanakları</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">📝</span>
                    <div>
                      <p className="font-semibold text-gray-900">Sözleşmenin İfası</p>
                      <p className="text-gray-600">Hizmet sunumu ve kullanıcı desteği sağlanması</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">⚖️</span>
                    <div>
                      <p className="font-semibold text-gray-900">Kanuni Zorunluluk</p>
                      <p className="text-gray-600">Vergi ve ticaret mevzuatı uyumu</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">🔒</span>
                    <div>
                      <p className="font-semibold text-gray-900">Meşru Menfaat</p>
                      <p className="text-gray-600">Sistem güvenliği ve kötüye kullanım önleme</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Açık Rıza</p>
                      <p className="text-gray-600">Pazarlama ve tanıtım faaliyetleri</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">İşletmelerin Müşteri Verileri İçin Hukuki Dayanaklar</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <strong className="text-purple-900">Randevu ve Hizmet İşlemleri:</strong> Sözleşmenin ifası kapsamında müşterilerle hizmet ilişkisinin kurulması ve sürdürülmesi.
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-purple-900">Bildirim ve İletişim:</strong> Müşteri talebi ve açık rıza kapsamında randevu hatırlatmaları ve bilgilendirme mesajları.
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-purple-900">Yasal Uyum:</strong> Elektronik Ticaret Kanunu ve İYS yükümlülüklerinin yerine getirilmesi.
                  </p>
                  <p className="text-gray-700">
                    <strong className="text-purple-900">Hizmet İyileştirme:</strong> Meşru menfaat kapsamında işlem analizi ve hizmet kalitesi değerlendirmesi.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Bildirim ve Ticari İleti Sorumlulukları</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-yellow-900 mb-3">⚠️ Önemli Sorumluluk Uyarısı</h3>
                <p className="text-gray-700 mb-3">
                  RandevuBu platformu, SMS ve e-posta gönderimleri için teknik altyapı sağlamaktadır. Ancak, 
                  bu iletilerin içeriği, gönderim amacı, zamanlaması ve alıcı onayları konusunda tüm yasal sorumluluk işletmelere aittir.
                </p>
              </div>

              <div className="space-y-3 text-gray-700">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p><strong className="text-blue-700">Teknik Altyapı:</strong> RandevuBu, ileti gönderimleri için güvenli ve kesintisiz teknik altyapı sunar. 
                  İYS (İleti Yönetim Sistemi) ile entegrasyon sağlanır ve izin/ret kayıtları otomatik olarak yönetilir.</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <p><strong className="text-purple-700">İçerik Sorumluluğu:</strong> Gönderilen mesajların içeriği, kampanya metinleri ve tanıtım materyalleri 
                  tamamen işletmelere aittir. RandevuBu bu içerikleri denetlemez veya kontrol etmez.</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <p><strong className="text-orange-700">Yasal Uyum:</strong> 6563 sayılı Elektronik Ticaret Kanunu ve İlgili Mevzuat gereği, 
                  ticari elektronik ileti gönderimine ilişkin tüm yükümlülükler işletmelere aittir.</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-red-900"><strong>Dikkat:</strong> Müşterilerin İYS üzerinden yaptığı ret işlemleri tüm ileti gönderimlerini 
                  etkileyebilir. Bu durum sistem gereği tüm platformu kullanan işletmeleri kapsar.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Veri Paylaşımı ve Güvenlik</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-5">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2 text-green-600">✓</span>
                    İzin Verilen Paylaşımlar
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Ödeme işlemleri için: iyzico, PayTR</li>
                    <li>• SMS/E-posta gönderim için teknik altyapı sağlayıcıları</li>
                    <li>• Yetkili devlet kurumları (resmi talepler üzerine)</li>
                    <li>• İYS entegrasyonu için gerekli kurumlar</li>
                  </ul>
                </div>

                <div className="border border-red-200 bg-red-50 rounded-lg p-5">
                  <h3 className="font-bold text-red-900 mb-3 flex items-center">
                    <span className="mr-2">✗</span>
                    Kesinlikle Yapılmayanlar
                  </h3>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>• Üçüncü taraf reklam şirketleri ile paylaşım</li>
                    <li>• Veri satışı veya ticari kullanım</li>
                    <li>• Müşteri verilerinin yetkisiz erişimi</li>
                    <li>• İzin verilen amaç dışında kullanım</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 font-semibold">
                  🔒 Verileriniz en yüksek düzeyde güvenlik standartları ile korunur ve yalnızca belirtilen amaçlar doğrultusunda paylaşılır.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Veri Saklama Süreleri</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Veri Türü</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Saklama Süresi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Fatura, ödeme ve işlem kayıtları</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        10 yıl (Vergi Usul Kanunu ve ilgili mevzuat uyarınca, yasal saklama yükümlülüğü kapsamında)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Ticari ileti izin/ret geçmişi</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        En az 1 yıl (6563 sayılı ETK gereği); Platform (RandevuBu), delil niteliği taşıyan kayıtları daha uzun süre saklayabilir
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Diğer işlem verileri</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Hizmet sonrası makul süre kadar (zamanaşımı ve meşru menfaat kapsamında)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. KVKK Kapsamında Sahip Olduğunuz Haklar</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-bold text-blue-900 mb-3">Bilgi Alma Hakları</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ İşlenip işlenmediğini öğrenme</li>
                    <li>✓ İşleniyorsa bilgi talep etme</li>
                    <li>✓ Amacına uygun işlenip işlenmediğini sorgulama</li>
                    <li>✓ Aktarıldığı üçüncü kişileri öğrenme</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <h3 className="font-bold text-green-900 mb-3">Müdahale Hakları</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Hatalı/eksik verilerin düzeltilmesini isteme</li>
                    <li>✓ Kişisel verilerin silinmesini talep etme</li>
                    <li>✓ İşleme itiraz etme hakkı</li>
                    <li>✓ İzlenecek kuraları belirleme ve uygulanmasını isteme</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="text-gray-900 font-semibold mb-2">Haklarınızı Kullanma</p>
                    <p className="text-sm text-gray-700">
                      Hak taleplerinizi <strong className="text-indigo-900">info@randevubu.com</strong> adresine yazılı olarak iletebilirsiniz. 
                      Talebinize en geç <strong>30 gün</strong> içinde detaylı yanıt verilecektir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. İletişim Bilgileri</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Veri Sorumlusu (Platform Hizmetleri Kapsamında):</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>RandevuBu</strong></p>
                  <p>Adres: ÇALCA OSB 1 CAD. TASARIM TEKNOKENT A.Ş. NO: 1/3 İÇ KAPI NO: 204 Demiray Technology - MERKEZ/KÜTAHYA</p>
                  <p>Vergi Dairesi: Çinili V.D.</p>
                  <p>Vergi K.No: 4820868313</p>
                  <p>Ticari Sicil Numarası: 13985</p>
                  <p>Mersis Numarası: 5875314481600001</p>
                  <p>Telefon: 0545 449 60 42</p>
                  <p>E-posta: info@randevubu.com</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-900 font-semibold mb-2">📌 Önemli Açıklama:</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  RandevuBu platformu, işletme hesaplarının yönetimi ve platform altyapısı bakımından <strong>veri sorumlusu</strong> konumundadır. 
                  Platform üzerinden yürütülen hizmetler kapsamında hem RandevuBu hem de hizmet veren işletmeler 
                  ilgili kişisel verilerin işlenmesinden sorumludur. İşletmeler kendi müşteri verilerinin işlenme amaçlarını belirlerken, 
                  RandevuBu bu verilerin güvenli saklanması ve işlenmesi için gerekli teknik altyapı ve güvenlik önlemlerini sağlar.
                </p>
              </div>
              <p className="text-gray-500 text-sm mt-4 text-center">
                Versiyon: 2.1 | Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

