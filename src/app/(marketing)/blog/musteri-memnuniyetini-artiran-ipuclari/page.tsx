'use client';

import { Calendar, Clock, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function BlogPost2() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tüm Yazılara Dön
          </Link>

          <div className="mb-6">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
              Müşteri Deneyimi
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Müşteri Memnuniyetini Artıran 7 Randevu Yönetim İpucu
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>RandevuBu Ekibi</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>10 Mart 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>7 dakika okuma</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            {['Müşteri Deneyimi', 'İş Yönetimi', 'İpuçları'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white text-gray-600 rounded-full text-xs font-medium flex items-center"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 font-medium mb-8">
            Müşteri memnuniyeti, herhangi bir işletmenin başarısının temelinde yatan kritik faktördür. 
            Randevu yönetimi süreçlerinde küçük detaylara dikkat etmek, büyük farklar yaratabilir.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            1. Kolay ve Hızlı Randevu Alma Süreçleri
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Müşteriler, karmaşık formlar veya uzun telefon görüşmeleri ile uğraşmak istemezler. 
            Online randevu sistemleri ile müşteriler 7/24 istedikleri zaman randevu alabilir.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Kullanıcı dostu arayüzler, hızlı yükleme süreleri ve minimum form alanı ile 
            müşteri deneyimi optimize edilebilir.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            2. Hatırlatma Bildirimleri
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Randevu gününden bir gün önce ve aynı gün sabahı gönderilen bildirimler, unutulan 
            randevuları önemli ölçüde azaltır.
          </p>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-6">
            <li>SMS veya E-posta hatırlatmaları</li>
            <li>WhatsApp bildirimleri</li>
            <li>Push notification desteği</li>
            <li>Dönem dönem müşterinin tercihine göre ayarlanabilir hatırlatmalar</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            3. Gerçek Zamanlı Müsaitlik Takibi
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Müşteriler, kendileri için en uygun zamanı seçebilmek için gerçek zamanlı 
            müsaitlik görmek ister. Canlı takvim görünümü ile müşteri deneyimi geliştirilir.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Sistemdeki tüm randevular anlık olarak senkronize edilir, böylece çift rezervasyon 
            gibi durumlar oluşmaz.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            4. Kolay Randevu Değiştirme ve İptal
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Müşteriler hayatlarında değişiklikler yaşayabilir. Randevu iptal etme veya 
            değiştirme işlemlerinin kolay olması gerekmektedir.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Online sistemler, müşterilere kendi başlarına randevularını yönetme imkanı sunar. 
            Bu, hem müşteri memnuniyetini artırır hem de işletme personelini rahatlatır.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            5. Kişiselleştirilmiş Deneyim
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Müşteri geçmişi ve tercihlerini kaydederek, her müşteriye özel deneyim sunulabilir:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-6">
            <li>Favori personelin otomatik seçimi</li>
            <li>Önceki hizmetlere dayalı öneriler</li>
            <li>Özel fiyat teklifleri</li>
            <li>Doğum günü ve özel gün hatırlatmaları</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            6. Şeffaf Fiyatlandırma ve Stok Takibi
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Müşteriler, fiyatlar konusunda şeffaflık bekler. Online sistemlerde net fiyatlandırma, 
            indirim kodları ve kampanya bilgileri açıkça gösterilmelidir.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Ayrıca, belirli ürünlerin stok durumu veya müsaitliği anlık olarak gösterilerek 
            müşteri hayal kırıklıkları önlenebilir.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            7. Geri Bildirim ve Değerlendirme Sistemi
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Müşteri geri bildirimlerini toplamak ve memnuniyet seviyesini ölçmek için 
            otomatik anket ve değerlendirme sistemleri kullanılmalıdır.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Bu geri bildirimler, hizmet kalitesinin sürekli iyileştirilmesi için kritik veri sağlar.
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 my-8 rounded-r-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Önemli Not</h3>
            <p className="text-gray-700 leading-relaxed">
              Tüm bu ipuçlarını RandevuBu platformu üzerinden kolayca uygulayabilirsiniz. 
              Modern randevu yönetimi çözümleri ile müşteri memnuniyetini artırırken, 
              işletmenizi de dijitalleştirin.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mt-12">
            <h3 className="text-2xl font-bold mb-4">RandevuBu'yu Deneyin</h3>
            <p className="mb-6 text-indigo-100">
              Müşteri memnuniyetini artırmak için modern randevu yönetim sistemini keşfedin. 
              14 gün ücretsiz deneme ile başlayın.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Bu yazıyı paylaş:</span>
            </div>
            <div className="flex space-x-3">
              {['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp'].map((platform) => (
                <button
                  key={platform}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Back to Blog */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          href="/blog"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tüm Blog Yazılarına Dön
        </Link>
      </div>
    </div>
  );
}

