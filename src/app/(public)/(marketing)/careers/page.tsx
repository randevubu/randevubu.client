'use client';

import { 
  MapPin, Clock, Briefcase, Heart, TrendingUp, Users, 
  Zap, Shield, Globe, AlertCircle
} from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            💼 Kariyer
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Hayalinizdeki İşe Başlayın
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            RandevuBu ailesine katılın ve teknoloji dünyasında kariyerinizi geliştirin. 
            Yetenekli ve tutkulu kişileri arıyoruz!
          </p>
        </div>

        {/* Why Work With Us */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">İş-Tatil Dengesi</h3>
            <p className="text-sm text-gray-600">
              Esnek çalışma saatleri ve uzaktan çalışma imkanları ile ideal iş-yaşam dengesini sağlıyoruz.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Kariyer Gelişimi</h3>
            <p className="text-sm text-gray-600">
              Eğitim, sertifika ve mentor desteği ile sürekli gelişim fırsatları sunuyoruz.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Ekip Kültürü</h3>
            <p className="text-sm text-gray-600">
              Güçlü ekip bağları, açık iletişim ve karşılıklı saygıya dayalı bir çalışma ortamı.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Neden Biz?</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Performans Primleri</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Sağlık Sigortası</span>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Uzaktan Çalışma</span>
            </div>
            <div className="flex items-center space-x-3">
              <Briefcase className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Esnek İmkanlar</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Modern Ofis</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Esnek Saatler</span>
            </div>
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Ekip Etkinlikleri</span>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Eğitim Desteği</span>
            </div>
          </div>
        </div>

        {/* No Open Positions */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Şu An Açık Pozisyon Yok
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Şu anda aktif olarak pozisyon açık değildir. Ancak gelecekte açılacak pozisyonlar 
              için bizi takipte kalın! Yetenekli ve tutkulu kişileri her zaman arıyoruz.
            </p>
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-6 inline-block">
                <h3 className="font-bold text-gray-900 mb-3">Bize Katılmak İster misiniz?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Açık pozisyonlar olduğunda haberdar olmak isterseniz, CV'nizi gönderebilirsiniz.
                </p>
                <a
                  href="mailto:info.randevubu@gmail.com?subject=RandevuBu%20Kariyer%20-%20CV%20Ba%C5%9Fvurusu&body=Merhaba%2C%0A%0A%5BAd%20Soyad%2C%20pozisyon%20ilgisi%20ve%20CV%27nizi%20bu%20e-postaya%20ek%20olarak%20ekleyebilirsiniz.%5D%0A%0ASayg%C4%B1lar%C4%B1m%C4%B1zla"
                  className="inline-flex items-center space-x-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <span>CV Gönder</span>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Bizi Takip Edin</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Yeni pozisyonlar açıldığında ilk haberdar olanlardan olmak için iletişimde kalın.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  📧
                </div>
                <div>
                  <div className="text-sm text-indigo-100">E-posta</div>
                  <a
                    href="mailto:info.randevubu@gmail.com"
                    className="font-semibold hover:underline"
                  >
                    info.randevubu@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  📞
                </div>
                <div>
                  <div className="text-sm text-indigo-100">Telefon</div>
                  <div className="font-semibold">0555 175 65 98 / 0546 660 43 36</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
