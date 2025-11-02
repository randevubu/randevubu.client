'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Kullanım Koşulları / Hizmet Şartları
          </h1>
          
          <div className="prose prose-sm sm:prose max-w-none">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-600 p-6 mb-8 rounded-r-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                Bu sözleşme, <strong>RandevuBu</strong> platformunu kullanan işletmeler (B2B) ve bireysel kullanıcılar (B2C) 
                arasında uygulanan kullanım koşulları ve yasal yükümlülükleri belirtmektedir.
              </p>
              <p className="text-sm text-amber-800 font-semibold mt-3">
                Platform'u kullanarak bu şartları kabul etmiş sayılırsınız.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Taraflar</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                <h3 className="font-bold text-blue-900 mb-3">Hizmet Sağlayıcı</h3>
                <p className="text-sm text-gray-700 mb-2"><strong>RandevuBu</strong></p>
                <p className="text-sm text-gray-700 mb-2">Demiray Technology - MERKEZ/KÜTAHYA</p>
                <p className="text-sm text-gray-700 mb-2">Ticari Sicil: 13985 (KÜTAHYA)</p>
                <p className="text-sm text-gray-700 mb-2">Vergi No: 4820868313</p>
                <p className="text-sm text-gray-700">Mersis: 5875314481600001</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-2">B2B Kullanıcılar</h3>
                  <p className="text-sm text-gray-700">
                    İşletme hesabı açan gerçek/tüzel kişiler (TTK md.124 kapsamında tacir)
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-bold text-purple-900 mb-2">B2C Kullanıcılar</h3>
                  <p className="text-sm text-gray-700">
                    Bireysel randevu alan gerçek kişiler (Tüketici Kanunu md.3 kapsamında korunur)
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Hizmet Tanımı</h2>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed mb-4">
                  RandevuBu, işletmelerin müşteri ilişkileri, randevu yönetimi ve operasyonel süreçlerini dijitalleştiren 
                  kapsamlı bir iş yönetim platformudur. Kullanıcılarımız platformun tüm modüllerini kendi iş akışlarına 
                  entegre edebilirler.
                </p>
                <p className="text-sm text-gray-600">
                  Bu hizmet tanımı, 6102 sayılı Türk Ticaret Kanunu md.55'te belirtilen 'hizmet sağlayıcı' tanımına uygun olarak düzenlenmiştir.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Fikri Mülkiyet Koruması</h2>
              
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h3 className="font-bold text-red-900 mb-4">Yasaklanan İşlemler</h3>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li>✗ Tersine mühendislik yapılması</li>
                  <li>✗ Kopyalama ve çoğaltma</li>
                  <li>✗ Lisanssız kullanım</li>
                  <li>✗ Türev çalışma oluşturma</li>
                  <li>✗ Kodların kaynak alınması</li>
                </ul>

                <div className="border-t border-red-300 pt-4">
                  <p className="font-bold text-red-900 mb-2">Hukuki Dayanaklar:</p>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>• FSEK md.71: İzinsiz çoğaltma → 2 yıla kadar hapis</li>
                    <li>• FSEK md.73: Tazminat talebi</li>
                    <li>• TTK md.548: Haksız rekabet tazminatı</li>
                    <li>• 5651 SK. md.9: İçerik kaldırma yükümlülüğü</li>
                  </ul>

                  <div className="mt-4 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm font-bold text-red-900">
                      Yaptırımlar: 1.000.000 TL cezai şart + Hukuki takip + Hesap kapatılması
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Abonelik ve Ödeme Politikası</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 mb-3">
                  Abonelik işlemleri ticari nitelikte olduğundan, Mesafeli Sözleşmeler Yönetmeliği md.15/2 uyarınca 
                  <strong className="text-amber-900"> cayma hakkı bulunmamaktadır</strong>.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• İptal durumunda ödenmiş ücretler iade edilmez</li>
                  <li>• Kullanıcı, abonelik süresi sonuna kadar hizmetten yararlanabilir</li>
                  <li>• Otomatik yenileme sözleşmesi yürürlükte kalır</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Ticari Elektronik İletişim ve Veri Sorumlulukları</h2>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  RandevuBu platformu, 6563 sayılı Elektronik Ticaret Kanunu kapsamında işletmelerin (B2B) müşterilerine 
                  (B2C) ticari elektronik ileti gönderimi için altyapı sağlar.
                </p>
                <p className="text-sm text-purple-900 font-semibold mt-3">
                  Platform veri sorumlusu sıfatıyla hareket eder ve tüm güvenlik yükümlülüklerini yerine getirir.
                </p>
              </div>

              <div className="space-y-3 text-gray-700">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p><strong className="text-blue-700">E-posta ve SMS İçerikleri:</strong> Platform üzerinden oluşturulabilir ve gönderilebilir.</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p><strong className="text-green-700">Gönderim Altyapısı:</strong> Tamamen RandevuBu tarafından sağlanır.</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <p><strong className="text-purple-700">Rıza Yönetimi:</strong> KVKK ve ETK kapsamında platform tarafından yürütülür.</p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <p><strong className="text-orange-700">İçerik Sorumluluğu:</strong> Gönderilen mesaj içeriklerinden işletmeler sorumludur.</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Veri Güvenliği</h2>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 mb-4">
                <p className="text-sm text-gray-700 mb-4">
                  RandevuBu, KVKK md.12'de belirtilen tüm teknik ve idari tedbirleri eksiksiz olarak almıştır.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-emerald-300">
                    <h4 className="font-bold text-emerald-900 mb-2">Ağ Güvenliği</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• DDoS korumalı altyapı</li>
                      <li>• Gelişmiş firewall</li>
                      <li>• 7/24 izleme</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-emerald-300">
                    <h4 className="font-bold text-emerald-900 mb-2">Veri Şifreleme</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• 256-bit SSL</li>
                      <li>• Uçtan uca şifreleme</li>
                      <li>• DB şifreleme</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-emerald-300">
                    <h4 className="font-bold text-emerald-900 mb-2">Fiziksel Güvenlik</h4>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• ISO 27001</li>
                      <li>• Sertifikalı merkezler</li>
                      <li>• Erişim kontrolü</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Veri Saklama:</strong> Hizmet süresince ve yasal zorunluluklar (CMK md.134) nedeniyle saklanır. 
                  Diğer veriler 6 ay içinde otomatik silinir veya anonimleştirilir.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Sorumluluk Dağılımı</h2>
              
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Yükümlülük</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">İşletmeler (B2B)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">RandevuBu (Platform)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Aydınlatma Metni</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Platform metnini kullanır</td>
                      <td className="px-4 py-3 text-sm text-gray-700">KVKK md.10 kapsamında sağlar ve saklar</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Veri Güvenliği</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Kendi sisteminde işlemez</td>
                      <td className="px-4 py-3 text-sm text-gray-700">ISO 27001, şifreleme, log sağlar</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Rıza Yönetimi</td>
                      <td className="px-4 py-3 text-sm text-gray-700">KVKK md.5 rızalarını alır</td>
                      <td className="px-4 py-3 text-sm text-gray-700">KVKK & ETK kapsamında toplar ve İYS yönetir</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Mesaj İçeriği</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Sorumludur (Veri Sorumlusu)</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Teknik altyapı sağlar</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Önemli:</strong> İşletmeler müşteri verilerinin işlenme amaçlarını belirlerken, 
                  RandevuBu bu verilerin güvenli saklanması, şifrelenmesi ve yasal uyumluluk konusunda sorumludur.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Sözleşme Değişikliği</h2>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  6098 sayılı Türk Borçlar Kanunu md.19 çerçevesinde, RandevuBu en az 30 gün önceden uygulama içi 
                  bildirim ile sözleşme şartlarını tek taraflı olarak değiştirme hakkını saklı tutar.
                </p>
                <p className="text-sm text-gray-700">
                  Değişiklikler yürürlük tarihinden itibaren geçerli olur ve platformu kullanmaya devam etmeniz 
                  halinde kabul edilmiş sayılır.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Uyuşmazlık Çözümü</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-red-900 mb-2">Zorunlu Arabuluculuk:</p>
                    <p className="text-sm text-gray-700">
                      7155 sayılı Kanun md.5 gereği KÜTAHYA Ticaret Odası'na başvurulacaktır.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-red-900 mb-2">Yetkili Mahkeme:</p>
                    <p className="text-sm text-gray-700">
                      Hukuk Muhakemeleri Kanunu md.6 uyarınca KÜTAHYA Mahkemeleri yetkilidir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Yasal Dayanaklar</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-bold text-blue-900 mb-3">Kişisel Verilerin Korunması</h3>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>• KVKK md.3 (Tanımlar)</li>
                    <li>• KVKK md.5 (İşleme Şartları)</li>
                    <li>• KVKK md.10 (Aydınlatma)</li>
                    <li>• KVKK md.12 (Güvenlik)</li>
                    <li>• KVKK md.13 (Haklar)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                  <h3 className="font-bold text-green-900 mb-3">Ticari Hukuk</h3>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>• 6563 sayılı ETK md.6</li>
                    <li>• 6102 sayılı TTK md.55</li>
                    <li>• 6098 sayılı TBK md.5</li>
                    <li>• TBK md.19 (Değişiklik)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. İletişim Bilgileri</h2>
              
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

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-5 mt-4">
                <p className="text-sm text-gray-700 italic">
                  Bu sözleşme ve ekleri {new Date().toLocaleDateString('tr-TR')} tarihinde yürürlüğe girmiştir. 
                  Platform'a erişiminiz tüm şartları kabul ettiğiniz anlamına gelir.
                </p>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Versiyon: 2.0 | Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

