'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Gizlilik Politikası
          </h1>
          
          <div className="prose prose-sm sm:prose max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Bu Gizlilik Politikası, <strong>RandevuBu</strong> platformu tarafından işlenen kişisel verilerin 
                nasıl toplandığı, kullanıldığı, saklandığı ve korunduğuna ilişkin açıklamaları içermektedir.
              </p>
              <p className="text-sm text-gray-600 italic">
                Veri Sorumlusu: RandevuBu | İletişim: info@randevubu.com
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Giriş ve Temel İlkeler</h2>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                RandevuBu platformu olarak, tüm kullanıcılarımızın ve işletmelerin kişisel verilerine ilişkin gizliliği 
                en üst düzeyde korumaktayız. Veri işleme faaliyetlerimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu 
                ("KVKK") başta olmak üzere yürürlükteki tüm yasal mevzuata tam uyumlu şekilde yürütülmektedir.
              </p>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <h3 className="font-bold text-indigo-900 mb-3">Temel İlkelerimiz</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">✓</span>
                    <p className="text-gray-700">Hukuka ve şeffaflığa uygunluk</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">✓</span>
                    <p className="text-gray-700">Amaçla sınırlılık ve veri minimalliği</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">✓</span>
                    <p className="text-gray-700">Doğruluk ve güncellik</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">✓</span>
                    <p className="text-gray-700">Güvenli saklama ve yetkisiz erişimi önleme</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">✓</span>
                    <p className="text-gray-700">Veri sahibinin haklarına saygı</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Kişisel Verilerin İşlenmesi ve Rollerimiz</h2>
              
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 mb-6">
                <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center">
                  <span className="mr-2">🏢</span>
                  İşletme (B2B) Kullanıcı Verileri
                </h3>
                <p className="text-gray-700 mb-4 text-sm">
                  RandevuBu platformu, işletme hesapları ve platform hizmetleri kapsamında kendi kullanıcılarına 
                  (işletmelere) ait kişisel verilerde <strong>veri sorumlusu</strong> konumundadır.
                </p>
                
                <h4 className="font-semibold text-emerald-800 mb-2">Toplanan Veri Kategorileri:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, unvan, işletme unvanı</li>
                  <li><strong>İletişim Bilgileri:</strong> E-posta, telefon numarası, adres</li>
                  <li><strong>İşletme Bilgileri:</strong> Vergi numarası, ticari sicil, Mersis numarası</li>
                  <li><strong>Platform Kullanım Verileri:</strong> Giriş logları, işlem geçmişi, kullanım istatistikleri</li>
                  <li><strong>Teknik Veriler:</strong> IP adresi, cihaz bilgileri, tarayıcı türü</li>
                </ul>
              </div>

              <div className="bg-cyan-50 border border-cyan-300 rounded-lg p-5">
                <h3 className="text-lg font-bold text-cyan-900 mb-3 flex items-center">
                  <span className="mr-2">👥</span>
                  Müşteri (B2C) Verileri
                </h3>
                <p className="text-gray-700 mb-4 text-sm">
                  Platform üzerinden randevu alan müşterilere ait veriler, hem işletmeler hem de RandevuBu bakımından 
                  <strong> veri sorumlusu</strong> konumunda işlenmektedir. İşletmeler müşteri verilerinin işlenme amaçlarını 
                  belirlerken, RandevuBu bu verilerin güvenli saklanması ve yasal uyumluluk konusunda sorumludur.
                </p>
                
                <h4 className="font-semibold text-cyan-800 mb-2">İşlenen Veri Kategorileri:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
                  <li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi</li>
                  <li><strong>Randevu Bilgileri:</strong> Randevu tarihi, saat, hizmet türü</li>
                  <li><strong>Tercih Kayıtları:</strong> Bildirim tercihleri, ileti izin durumları</li>
                  <li><strong>Teknik Veriler:</strong> IP adresi, oturum bilgileri (anonimleştirilmiş)</li>
                </ul>
                
                <div className="mt-4 p-3 bg-cyan-100 rounded-lg">
                  <p className="text-sm text-cyan-900">
                    <strong>Önemli:</strong> RandevuBu, müşteri verilerinin içeriğine erişim sağlamamakla birlikte, 
                    bu verilerin güvenli saklanması, şifrelenmesi ve yasal uyumluluk konusundaki teknik altyapıyı sağlamaktadır.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Veri İşleme Amacı ve Hukuki Dayanaklar</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Veri Türü</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kullanım Amacı</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hukuki Dayanak</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Ad, Soyad</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Hesap oluşturma, hizmet sunumu</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Sözleşmenin ifası</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">E-posta, Telefon</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Doğrulama, bildirim, destek</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Sözleşmenin ifası</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">İşletme Bilgileri</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Fatura, vergi işlemleri</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Kanuni zorunluluk</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">IP, Cihaz Bilgisi</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Güvenlik, analiz, önleme</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Meşru menfaat</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Veri Güvenliği ve Paylaşım Politikamız</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-green-200 bg-green-50 rounded-lg p-5">
                  <h3 className="font-bold text-green-900 mb-3 flex items-center">
                    <span className="mr-2">✓</span>
                    İzin Verilen Paylaşımlar
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Ödeme sağlayıcıları (iyzico, PayTR)</li>
                    <li>• SMS/E-posta altyapı sağlayıcıları</li>
                    <li>• İYS entegrasyonu</li>
                    <li>• Yetkili kamu kurumları (yasal zorunluluk)</li>
                  </ul>
                </div>

                <div className="border border-red-200 bg-red-50 rounded-lg p-5">
                  <h3 className="font-bold text-red-900 mb-3 flex items-center">
                    <span className="mr-2">✗</span>
                    Kesinlikle Yapılmaz
                  </h3>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>• Üçüncü taraf reklam şirketleri</li>
                    <li>• Veri satışı veya ticari kullanım</li>
                    <li>• Yetkisiz erişim veya paylaşım</li>
                    <li>• Amaç dışı kullanım</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-blue-900 mb-3">🔒 Veri Güvenliği Önlemleri</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold mb-2">Teknik Önlemler:</p>
                    <ul className="space-y-1">
                      <li>• 256-bit SSL şifreleme</li>
                      <li>• DDoS korumalı altyapı</li>
                      <li>• Şifreleme teknolojileri</li>
                      <li>• Güvenli bulut altyapısı</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">İdari Önlemler:</p>
                    <ul className="space-y-1">
                      <li>• KVKK eğitim programları</li>
                      <li>• Erişim yetkilendirmesi</li>
                      <li>• Güvenlik denetimleri</li>
                      <li>• Sözleşmeli güvence</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Veri Saklama Süreleri</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Veri Kategorisi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Saklama Süresi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Fatura ve Ödeme Kayıtları</td>
                      <td className="px-4 py-3 text-sm text-gray-700">10 yıl (VUK yasal yükümlülüğü)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">İleti İzin/Ret Kayıtları</td>
                      <td className="px-4 py-3 text-sm text-gray-700">En az 1 yıl (6563 sayılı ETK)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Hesap ve Kullanım Verileri</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Hizmet süresince + zamanaşımı süresi</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Log ve Güvenlik Kayıtları</td>
                      <td className="px-4 py-3 text-sm text-gray-700">12 ay (anonimleştirilmiş)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Not:</strong> Hizmet ilişkisi sona erdiğinde, yasal saklama yükümlülükleri dışındaki veriler 
                  anonimleştirilir veya güvenli şekilde silinir.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Kullanıcı Hakları (KVKK md.11)</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-bold text-blue-900 mb-3">Bilgi Alma Hakları</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Verilerinizin işlenip işlenmediğini öğrenme</li>
                    <li>✓ İşleniyorsa bilgi talep etme</li>
                    <li>✓ Amacına uygun işlenip işlenmediğini sorgulama</li>
                    <li>✓ Aktarıldığı üçüncü kişileri öğrenme</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <h3 className="font-bold text-green-900 mb-3">Müdahale Hakları</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Düzeltilmesini isteme</li>
                    <li>✓ Silinmesini talep etme</li>
                    <li>✓ İtiraz etme hakkı</li>
                    <li>✓ Rızayı geri çekme</li>
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="font-bold text-indigo-900 mb-3">📧 Haklarınızı Kullanma</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Hak taleplerinizi <strong>info@randevubu.com</strong> adresine yazılı olarak iletebilirsiniz.
                </p>
                <p className="text-sm text-gray-700">
                  Talebinize en geç <strong>30 gün</strong> içinde detaylı yanıt verilecektir.
                </p>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Önemli:</strong> Bir işletme aracılığıyla hizmet alıyorsanız, öncelikle o işletmeye başvurun. 
                  Talebiniz ilgili işletmeye iletilecek ve gerektiğinde RandevuBu teknik destek sağlayacaktır.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. İşletmelerin Yükümlülükleri</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 mb-3">
                  Platformu kullanan işletmeler, kendi müşteri verilerinin işlenmesinden tam olarak sorumludur.
                </p>
                
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Müşteri onaylarını almak ve yönetmek</li>
                  <li>• İleti içeriklerini oluşturmak ve yasal uyumlu hale getirmek</li>
                  <li>• KVKK'ya uygun veri işleme süreçlerini sağlamak</li>
                  <li>• Müşteri hak taleplerini değerlendirmek</li>
                  <li>• İYS kayıtlarını doğru tutmak</li>
                </ul>
                
                <p className="text-sm text-gray-700 mt-3">
                  RandevuBu, müşteri verilerinin güvenli saklanması, şifrelenmesi, teknik güvenlik önlemlerinin alınması 
                  ve KVKK yükümlülüklerinin yerine getirilmesi konusunda sorumludur.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Güncellemeler ve Değişiklikler</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Bu Gizlilik Politikası, yasal düzenlemeler veya hizmet süreçlerindeki değişiklikler nedeniyle 
                  güncellenebilir. Güncellemeler platform üzerinden yayınlanır ve yürürlük tarihinden itibaren geçerli olur.
                </p>
                <p className="text-sm text-gray-600 mt-3 italic">
                  Son güncellenme: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. İletişim Bilgileri</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Veri Sorumlusu:</h3>
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

