'use client';

import { Calendar, Clock, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function BlogPost() {
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
              İş Dünyası
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Randevu Yönetiminde Dijital Dönüşüm: İşletmelere 5 Fayda
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>RandevuBu Ekibi</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>15 Mart 2024</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>5 dakika okuma</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            {['Dijital Dönüşüm', 'İş Yönetimi', 'Teknoloji'].map((tag) => (
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
            Günümüz iş dünyasında dijital dönüşüm artık bir tercih değil, bir zorunluluk haline gelmiştir. 
            Randevu yönetimi sistemleri de bu dönüşümün önemli bir parçasıdır.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            1. Zaman Tasarrufu ve Verimlilik
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Geleneksel telefon ve e-posta üzerinden randevu yönetimi, hem personel hem de müşteri 
            açısından zaman kaybına neden olur. Dijital randevu sistemleri sayesinde randevu almak, 
            değiştirmek veya iptal etmek sadece birkaç tıklama ile gerçekleşir.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Otomatik hatırlatma sistemleri sayesinde unutulan randevular büyük ölçüde azalır, 
            böylece boşa giden zamanlar en aza indirilir.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            2. Müşteri Deneyiminin İyileştirilmesi
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Modern tüketiciler, hızlı ve kolay erişim bekler. Online randevu sistemleri, 
            müşterilere 7/24 randevu alma imkanı sunarak deneyimlerini önemli ölçüde geliştirir.
          </p>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-6">
            <li>Anında randevu onayı ve rezervasyon</li>
            <li>Zaman yönetimi ve planlamada özgürlük</li>
            <li>Mobil uygulama desteği ile her yerden erişim</li>
            <li>Hatırlatma bildirimleri ile unutma riski minimuma iner</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            3. Finansal Kaynakların Optimize Edilmesi
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Manuel randevu yönetimi, personel maliyetlerini artırır. Otomatik sistemler sayesinde, 
            rezervasyon takibinden sorumlu personel başka alanlara kaydırılabilir.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Ayrıca randevu atlamalarının azalması ile işletmelerin gelir kayıpları minimize edilir. 
            Boş zamanlar otomatik olarak doldurulabilir, bu da işletme verimliliğini artırır.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            4. Veri Tabanlı Karar Verme
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Dijital sistemler, kapsamlı raporlama ve analitik özellikleri sunar. İşletmeler bu verileri kullanarak:
          </p>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-6">
            <li>En yoğun saatleri belirleyebilir</li>
            <li>Personel planlamasını optimize edebilir</li>
            <li>Müşteri tercihlerini analiz edebilir</li>
            <li>Stratejik kararlar alabilir</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            5. Ölçeklenebilirlik ve Büyüme
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Dijital randevu sistemleri, işletmelerin büyümesi ile birlikte ölçeklenebilir yapılar sunar. 
            Şube sayısı artarken, tüm rezervasyonlar merkezi bir sistem üzerinden yönetilebilir.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Çok şubeli işletmeler için cross-booking (şubeler arası randevu) özelliği ile müşteri 
            deneyimi daha da geliştirilebilir.
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 my-8 rounded-r-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sonuç</h3>
            <p className="text-gray-700 leading-relaxed">
              Dijital randevu yönetimi, işletmelere rekabetçi bir avantaj sağlarken aynı zamanda 
              verimliliği artırır ve müşteri memnuniyetini yükseltir. RandevuBu gibi modern çözümlerle 
              işletmeler bu dönüşümü kolayca gerçekleştirebilir.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mt-12">
            <h3 className="text-2xl font-bold mb-4">RandevuBu'yu Deneyin</h3>
            <p className="mb-6 text-indigo-100">
              İşletmeniz için dijital dönüşümü başlatın. 14 gün ücretsiz deneme ile 
              tüm özellikleri keşfedin.
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

