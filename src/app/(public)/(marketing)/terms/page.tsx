'use client';

import Link from 'next/link';

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
                Bu metin, <strong>RandevuBu</strong> üzerinde işlem yapan işletmeler (B2B) ile son kullanıcılar (B2C)
                için geçerli hizmet şartlarını ve yükümlülükleri düzenler.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Giriş ve kabul</h2>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-sm text-gray-700 leading-relaxed space-y-4">
                <p>
                  İşbu Kullanım Koşulları; RandevuBu&apos;ya kayıt olmanız, oturum açmanız veya herhangi bir özelliği
                  kullanmanız hâlinde sizinle hizmet sağlayıcı arasında kurulan çevrimiçi sözleşmenin parçasıdır. Kimlik
                  bilgileri ve roller aşağıdaki <strong className="text-stone-900">Taraflar</strong> bölümünde
                  ayrıntılandırılmıştır.
                </p>
                <p className="font-medium text-stone-900">
                  Platformu fiilen kullanmak suretiyle özellikle şunları beyan ve kabul etmiş sayılırsınız:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-1 marker:text-stone-600">
                  <li>Bu sayfada yer alan şartların tamamını gözden geçirdiğinizi,</li>
                  <li>
                    Hizmet Sağlayıcı ile B2B/B2C kullanıcı rollerine ilişkin hak ve vecibeleri anladığınızı ve
                    işlemlerinizi bu çerçevede yürüteceğinizi,
                  </li>
                  <li>
                    Kişisel verilerin işlenmesine dair ilkelerin,{' '}
                    <Link href="/privacy" className="text-amber-800 font-medium underline underline-offset-2 hover:text-amber-900">
                      Gizlilik Politikası
                    </Link>
                    ,{' '}
                    <Link href="/kvkk" className="text-amber-800 font-medium underline underline-offset-2 hover:text-amber-900">
                      KVKK aydınlatma metni
                    </Link>{' '}
                    ve{' '}
                    <Link href="/cookies" className="text-amber-800 font-medium underline underline-offset-2 hover:text-amber-900">
                      Çerez Politikası
                    </Link>{' '}
                    ile birlikte okunması gerektiğini ve bu metinlerle çelişmeyecek şekilde hareket edeceğinizi,
                  </li>
                  <li>
                    İşletme (B2B) hesabı kullanıyorsanız,{' '}
                    <strong className="text-stone-900">4. madde</strong> altındaki veri sorumluluğu taahhüdü ile rol
                    dağılım tablosunu da kabul ettiğinizi,
                  </li>
                  <li>Yürürlükteki sürümdeki hükümlere uygun davranacağınızı.</li>
                </ul>
                <p className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 font-semibold text-sm">
                  Bu koşulları veya bağlantılı metinleri kabul etmiyorsanız RandevuBu&apos;yu kullanmayınız.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Taraflar</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-4">
                <h3 className="font-bold text-blue-900 mb-3">Hizmet Sağlayıcı</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  <strong className="text-blue-950">RandevuBu</strong> markası altında sunulan randevu ve işletme yönetimi
                  yazılım hizmetinin işletmecisi; bu sözleşme kapsamında{' '}
                  <strong className="text-blue-950">6563 sayılı Elektronik Ticaret Kanunu</strong> ve{' '}
                  <strong className="text-blue-950">6102 sayılı Türk Ticaret Kanunu</strong> anlamında{' '}
                  <strong className="text-blue-950">hizmet sağlayıcı</strong> sıfatıyla{' '}
                  <strong className="text-blue-950">Eren Technology</strong> (İnegöl/Bursa) olarak anılır.
                </p>
                <div className="space-y-2 text-sm text-gray-700 border-t border-blue-200 pt-4">
                  <p>
                    <span className="font-semibold text-blue-950">Ticari unvan / çatı:</span> Eren Technology — İnegöl/Bursa
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950">Adres:</span> Kemalpaşa Mah. Bahçıvan Sk. No: 1/7B,{' '}
                    İnegöl/Bursa
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950">Vergi dairesi / Vergi no:</span> İnegöl Vergi Dairesi —{' '}
                    8681220052
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950">Telefon:</span>{' '}
                    <a href="tel:+905551756598" className="text-blue-800 underline underline-offset-2 hover:text-blue-950">
                      0555 175 65 98
                    </a>
                    {' / '}
                    <a href="tel:+905466604336" className="text-blue-800 underline underline-offset-2 hover:text-blue-950">
                      0546 660 4336
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950">E-posta (genel / hukuki yazışma):</span>{' '}
                    <a
                      href="mailto:info.randevubu@gmail.com"
                      className="text-blue-800 underline underline-offset-2 hover:text-blue-950 break-all"
                    >
                      info.randevubu@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-gray-600 pt-2">
                    Tebligat, ihtar ve sözleşmeye konu bildirimlerde yukarıdaki adres ve elektronik posta, yazılı
                    iletişim kanalları olarak esas alınır; kanunda öngörülen haller saklıdır.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-900 mb-2">B2B Kullanıcılar</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    RandevuBu&apos;da işletme veya şube profili oluşturan, abonelik veya ücretli paket kapsamında
                    platformu işletme faaliyeti için kullanan ve gerekirse personel veya yetkili kullanıcı tanımlayan
                    gerçek ve tüzel kişilerdir. Bu tarafın yürüttüğü işlemler,{' '}
                    <strong className="text-green-900">6102 sayılı Türk Ticaret Kanunu&apos;nun 124. maddesi</strong>{' '}
                    anlamında tacir sıfatıyla ilişkilendirilebilecek ticari nitelikte değerlendirilir.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-bold text-purple-900 mb-2">B2C Kullanıcılar</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Platform üzerinden yalnızca kayıtlı bir işletmenin sunduğu hizmete randevu oluşturmak veya buna
                    benzer son kullanıcı işlemlerini yapmak üzere işlem yapan gerçek kişilerdir. Tüketici statüsünün
                    doğup doğmayacağı somut olaya göre tayin olunur; şartların bu bölümünde{' '}
                    <strong className="text-purple-900">
                      6502 sayılı Tüketicinin Korunması Hakkında Kanun&apos;un 3. maddesi
                    </strong>{' '}
                    dikkate alınır.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Hizmet Tanımı</h2>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed">
                  RandevuBu; işletmenizin randevularını planlamanızı, müşterilerinizle iletişimi yürütmenizi ve günlük
                  operasyonunuzu tek yerden yönetmenizi hedefleyen bir bulut hizmetidir. Sunduğumuz özellikler (örneğin
                  takvim, müşteri kayıtları, bildirimler ve raporlama) işletmeden işletmeye farklılık gösterebilir; hangi
                  modüllerin açık olduğu hesap türünüze ve kullandığınız pakete bağlıdır. Hizmeti, kendi iş modelinize
                  uygun şekilde yapılandırarak kullanırsınız.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Fikri Mülkiyet Koruması</h2>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h3 className="font-bold text-red-900 mb-3">Platform içerikleri ve yazılım</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">
                  RandevuBu üzerinden sunulan yazılım, arayüz bileşenleri, veri düzenleri, dokümantasyon ve marka
                  unsurları üzerindeki haklar saklıdır; kullanım yalnızca bu sözleşme ve size tanınan lisans kapsamıyla
                  mümkündür.
                </p>

                <p className="text-sm font-semibold text-red-900 mb-2">
                  Açık yazılı izin olmaksızın aşağıdakiler yapılamaz:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-6">
                  <li>Lisans kapsamı dışında erişim, barındırma veya devretme</li>
                  <li>İzinsiz kopyalama, çoğaltma, paylaşım veya ticari amaçla yeniden kullanım</li>
                  <li>
                    Üzerinde hak bulunmadığınız içerikten türemiş ürün, modül veya entegrasyon üretmek
                  </li>
                  <li>
                    Platformu veya parçalarını çözümleyerek kaynak kod, mimari veya gizli bilgi elde etmeye yönelik
                    girişimler (tersine mühendislik dâhil)
                  </li>
                  <li>
                    Otomatik araçlar, botlar veya betiklerle izinsiz veri toplama, tarama veya hizmete makul olmayan
                    yük bindiren erişim düzenleri kurmak
                  </li>
                </ol>

                <div className="border-t border-red-300 pt-4">
                  <div className="rounded-lg border border-red-200 bg-red-100 p-4">
                    <h4 className="text-sm font-bold text-red-900 mb-2">İhlal halinde başvurulabilecek önlemler</h4>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      RandevuBu, ihlalin niteliğine göre sözleşmede öngörülen parasal yaptırımları talep etme, zararın
                      giderilmesini isteme, yetkili mercilere başvurma ve kullanıcı hesabını veya erişimi derhal veya
                      süreli olarak sonlandırma hakkını saklı tutar. Somut tutarlar ve usul, ek sözleşme veya
                      bildirimlerde ayrıca belirlenebilir.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Ticari Elektronik İletişim ve KVKK Rolleri</h2>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-5 mb-4 space-y-4 text-sm text-gray-700 leading-relaxed">
                <p>
                  6563 sayılı Elektronik Ticaret Kanunu çerçevesinde, RandevuBu kayıtlı işletme kullanıcılarının kendi
                  müşterilerine ticari nitelikte e-posta veya SMS iletmesine imkân veren yazılım ve teknik altyapıyı
                  işletir. Bu hizmetin yürütülmesi için gerekli olan, platformda tutulan iletişim ve izin kayıtlarına
                  ilişkin işlemlerde RandevuBu, <strong className="text-violet-950">KVKK anlamında veri sorumlusu</strong>{' '}
                  sıfatıyla yürürlükteki yükümlülükleri yerine getirir.
                </p>
                <p>
                  İletinin konusu, metni, hedef kitle seçimi ve kampanya kararı işletmeye aittir; bu bağlamda mesaj
                  içeriği ve işletmenin kendi müşteri verisi üzerinden yürütülen işlemlerde işletme{' '}
                  <strong className="text-violet-950">veri sorumlusu</strong>, RandevuBu ise işletmenin talimatları
                  doğrultusunda <strong className="text-violet-950">veri işleyen</strong> konumundadır.
                </p>
                <p>
                  İşletme, müşterilerine yönelik aydınlatma, ticari ileti izni ve içerik uygunluğu konularında birinci
                  derecede yükümlüdür; RandevuBu yalnızca iletimin teknik gerçekleşmesine yardımcı olur.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-3 text-sm text-gray-700">
                <p>
                  <span className="font-semibold text-gray-900">Oluşturma ve gönderim:</span> Şablon ve gönderim
                  adımları uygulama üzerinden yürütülebilir.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Teknik taraf:</span> İletinin iletilmesi için kullanılan
                  sistem bileşenleri RandevuBu tarafından işletilir ve güncellenir.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">İzin ve kayıt:</span> Elektronik ileti izinlerine
                  ilişkin platformda tutulan kayıtlar, mevzuatta öngörülen süre ve usule uygun şekilde muhafaza edilir;
                  ispat ve denetim yükümlülükleri bu çerçevede yürütülür.
                </p>
                <p className="pt-2 border-t border-gray-200 text-gray-800">
                  <strong>Onay:</strong> İşletme hesabı kullanan taraf, yukarıdaki rol ayrımını ve RandevuBu&apos;nun
                  altyapı sağlayıcısı olarak bu sınırlar içinde hareket edeceğini kullanıma başlamakla kabul etmiş
                  sayılır.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Sorumluluk dağılımı</h2>
              <p className="text-sm text-gray-600 mb-6">
                Aşağıdaki düzenleme, kişisel veri ve ticari elektronik ileti süreçlerinde tarafların rollerini özetler
                ve işbu Kullanım Koşullarının <strong className="text-gray-800">ayrılmaz parçasıdır</strong>.
              </p>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 mb-6">
                <h3 className="font-bold text-emerald-950 mb-3 text-sm uppercase tracking-wide">
                  A. İşletme taahhüdü (B2B)
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed mb-3">
                  İşletme (B2B) olarak, kendi müşterilerime ait kişisel verileri işlerken{' '}
                  <strong>6698 sayılı KVKK&apos;nın 4, 10 ve 12. maddelerinde</strong> öngörülen ilkelere uygun
                  davranacağımı; randevu ve müşteri ilişkisi kapsamında işleme amaçlarını benim belirlediğimi; mesaj
                  metinleri, kampanya konusu ve hedefleme kararlarının bana ait olduğunu ve bu alanlardaki hukuki
                  uygunluktan bizzat sorumlu olduğumu beyan ederim.
                </p>
                <p className="text-sm text-gray-800 leading-relaxed mb-3">
                  RandevuBu&apos;nun, müşteri veri seti üzerinde yalnızca talimatım ve işbu sözleşme kapsamında tanımlı
                  teknik hizmetler çerçevesinde hareket ettiğini;{' '}
                  <strong>ticari elektronik ileti altyapısı</strong> kullanımında ise iletim, izin kaydı ve mevzuatın
                  öngördüğü süreçler bakımından platformun ayrıca <strong>KVKK ve 6563 sayılı ETK</strong> hükümleri
                  uyarınca yükümlülük altında olabileceğini anladığımı kabul ederim.
                </p>
                <p className="text-sm font-semibold text-emerald-950 border-t border-emerald-200 pt-3">
                  Yukarıdaki hususları okuduğumu, anladığımı ve yerine getireceğimi{' '}
                  <strong>resmen kabul ve taahhüt ederim</strong>.
                </p>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">
                B. Rol dağılım tablosu
              </h3>
              <p className="text-xs text-gray-500 mb-3">Özet tablo; ayrıntı için üstteki taahhüt ve 3. bölüm geçerlidir.</p>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-[600px] w-full text-xs sm:text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 text-gray-900">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold w-[100px]">Konu</th>
                      <th className="px-2 py-2 text-left font-semibold">İşletme (B2B)</th>
                      <th className="px-2 py-2 text-left font-semibold">RandevuBu</th>
                      <th className="px-2 py-2 text-left font-semibold">B2C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    <tr className="align-top">
                      <td className="px-2 py-2 font-medium text-gray-900">Aydınlatma</td>
                      <td className="px-2 py-2">Özel metin (opsiyonel) veya platform şablonu.</td>
                      <td className="px-2 py-2">Aydınlatma sunumuna destek; kayıt saklama.</td>
                      <td className="px-2 py-2">Okur; onay veya ret.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="px-2 py-2 font-medium text-gray-900">Güvenlik</td>
                      <td className="px-2 py-2">İşlemler çoğunlukla platformda.</td>
                      <td className="px-2 py-2">Teknik ve idari güvenlik tedbirleri; güvenlik bildirimi.</td>
                      <td className="px-2 py-2">Duyuruları alır.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="px-2 py-2 font-medium text-gray-900">Rıza</td>
                      <td className="px-2 py-2">Gerekli açık rızaları alır; kayıt ve ispat.</td>
                      <td className="px-2 py-2">Rıza ve ticari ileti onayları; İYS uyumu; ret/iptal desteği.</td>
                      <td className="px-2 py-2">Günceller; reddeder veya iptal eder.</td>
                    </tr>
                    <tr className="align-top">
                      <td className="px-2 py-2 font-medium text-gray-900">İleti içeriği</td>
                      <td className="px-2 py-2">İçerik ve amaçtan sorumlu.</td>
                      <td className="px-2 py-2">Teknik iletim; yasal yükümlülükler saklı.</td>
                      <td className="px-2 py-2">Alıcı.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-gray-800">
                <p className="font-semibold text-amber-950 mb-1">Son hüküm</p>
                <p>
                  Bu başlık ve tablo, işbu Kullanım Koşullarının ayrılmaz parçasıdır. B2B işletme hesabı kullanan taraf,
                  platformu kullanmaya devam etmekle yukarıdaki taahhüt ve rol dağılımını kabul etmiş sayılır. Güncel
                  sürümün yürürlük tarihi sayfa altında yer alır.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Abonelik ve Ödeme Politikası</h2>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <p className="text-sm text-gray-700 mb-3">
                  Ücretli abonelikler B2B ticari sözleşme niteliğindedir; bu nedenle{' '}
                  <strong className="text-amber-900">cayma hakkı tanınmaz</strong>.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Aboneliği sonlandırsanız bile cari dönem için tahsil edilmiş ücret iade edilmez</li>
                  <li>• Ödenen dönem bitene kadar platform özelliklerinden yararlanmaya devam edersiniz</li>
                  <li>• Otomatik yenilemeyi ayrıca durdurmadığınız sürece yenileme koşulları geçerli olmaya devam eder</li>
                </ul>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Şartların güncellenmesi</h2>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
                <p>
                  Yasal düzenlemeler, ürün geliştirmeleri veya hizmetin sürdürülebilirliği için bu metnin zaman zaman
                  revize edilmesi gerekebilir. RandevuBu, 6098 sayılı Türk Borçlar Kanunu&apos;nun 19. maddesine
                  uygun hareket eder; önem taşıyan değişikliklerde güncel metin yürürlüğe girmeden önce en az otuz (30)
                  gün süreyle, tercihen uygulama içi bildirim ve platformda yayın yoluyla duyurulur. Yürürlük tarihi,
                  ilan edilen sürümde açıkça belirtilir.
                </p>
                <p>
                  Belirtilen tarihten sonra hizmete erişmeye veya kullanmaya devam etmeniz, o tarih itibarıyla
                  yayımlanan koşulları benimsediğiniz şeklinde değerlendirilir. Güncellenmiş şartları kabul etmiyorsanız,
                  yürürlük başlamadan önce aboneliğinizi/hesabınızı sonlandırmanız gerekir.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Uyuşmazlıklar ve başvurulacak merciler</h2>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
                <p>
                  Bu şartlardan veya platform hizmetinden kaynaklanan ihtilaflarda, yürürlükteki usul kurallarına riayet
                  edilir. Kanunun öngördüğü ön şartlar saklı kalmak kaydıyla taraflar çözüm arayışını önce alternatif
                  yollarla sürdürmeyi hedefler.
                </p>
                <div className="rounded-lg bg-white border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900 mb-2">Arabuluculuk önceliği</p>
                  <p>
                    7155 sayılı Kanun&apos;un 5. maddesi çerçevesinde, kanunda sayılan hallerde dava yoluna
                    gidilmeden önce zorunlu arabuluculuk süreci işletilir; bu kapsamda başvuru adresi{' '}
                    <strong className="text-slate-900">Bursa Ticaret Odası</strong> olarak kabul edilmiştir.
                  </p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900 mb-2">Yargı yetkisi</p>
                  <p>
                    Arabuluculuk veya sulh yolu sonuç vermezse veya kanun gereği doğrudan yargı yolu açıksa, bu
                    sözleşmeye ilişkin uyuşmazlıklarda{' '}
                    <strong className="text-slate-900">
                      6100 sayılı Hukuk Muhakemeleri Kanunu&apos;nun 6. maddesi
                    </strong>{' '}
                    uyarınca Bursa ilindeki mahkemeler ve icra
                    müdürlükleri yetkilidir.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. İletişim Bilgileri</h2>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">RandevuBu</h3>
                <div className="space-y-2 text-gray-700">
                  <p>Eren Technology - İnegöl/Bursa</p>
                  <p>
                    <strong>Adres:</strong> Kemalpaşa Mah. Bahçıvan Sk. No: 1/7B
                    <br />
                    İnegöl/Bursa
                  </p>
                  <p><strong>Vergi Dairesi:</strong> İnegöl Vergi Dairesi</p>
                  <p><strong>Vergi No:</strong> 8681220052</p>
                  <p><strong>Telefon:</strong> 0555 175 65 98 / 0546 660 4336</p>
                  <p><strong>E-posta:</strong> info.randevubu@gmail.com</p>
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

