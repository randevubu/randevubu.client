import { Navbar, Footer } from '../../components';

export default function AboutPage() {
  const team = [
    {
      name: "Ahmet Yılmaz",
      role: "Kurucu & CEO",
      image: "AY",
      description: "15+ yıllık teknoloji deneyimi ile salon sektörünü dijitalleştirme misyonunda."
    },
    {
      name: "Ayşe Demir", 
      role: "CTO & Kurucu Ortak",
      image: "AD",
      description: "Yazılım mimarisi ve ürün geliştirme alanında uzman. Eski Google mühendisi."
    },
    {
      name: "Mehmet Kaya",
      role: "Satış Direktörü",
      image: "MK", 
      description: "Salon sektöründe 10+ yıllık deneyim. Müşteri ilişkileri ve iş geliştirme uzmanı."
    }
  ];

  const values = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Müşteri Odaklılık",
      description: "Her kararımızı müşterilerimizin başarısını artıracak şekilde alıyoruz."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "İnovasyon",
      description: "Sektördeki en yeni teknolojileri kullanarak sürekli gelişim gösteriyoruz."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Güvenilirlik",
      description: "Verilerinizi korumak ve kesintisiz hizmet sunmak önceliğimiz."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Takım Çalışması",
      description: "Güçlü ekip ruhu ile müşterilerimize en iyi deneyimi yaşatıyoruz."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            🏢 Hakkımızda
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Salon Sektörünü
            <br />
            <span className="text-indigo-600">Dijitalleştiriyoruz</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            2020 yılından beri salon sahiplerinin işlerini büyütmelerine yardımcı oluyoruz. 
            Modern teknoloji ile geleneksel salon işletmeciliğini buluşturarak sektöre yenilik getiriyoruz.
          </p>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-indigo-600 mb-2">2,500+</div>
              <div className="text-sm text-gray-600">Aktif Salon</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-sm text-gray-600">Rezervasyon</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Şehir</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9</div>
              <div className="text-sm text-gray-600">Müşteri Puanı</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Misyonumuz ve
                <span className="text-indigo-600"> Vizyonumuz</span>
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Misyonumuz</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Türkiye'deki tüm salon işletmelerinin dijital dönüşümünü gerçekleştirerek, 
                    müşteri memnuniyetini artırmak ve salon sahiplerinin gelirlerini optimize etmek.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">🚀 Vizyonumuz</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Salon sektöründe teknoloji lideri olmak ve uluslararası pazarlarda 
                    Türk teknoloji başarısını temsil etmek.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Hikayemiz
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  RandevuBu, pandemi döneminde salon sahiplerinin yaşadığı zorlukları gözlemleyerek doğdu. 
                  Kurucu ekibimiz, teknoloji altyapısı zayıf olan salonların müşteri kaybettiğini fark etti.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  2020 yılında başladığımız yolculukta, ilk 6 ayda 100 salona hizmet verdik. 
                  Bugün ise 50+ şehirde 2,500'den fazla salon bizimle çalışıyor.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Hedefimiz 2025 sonuna kadar 10,000 salon ile Türkiye'nin en büyük 
                  salon teknoloji platformu olmak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Değerlerimiz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              İşimizi yürütürken rehber aldığımız temel prensipler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Liderlik
              <span className="text-indigo-600"> Ekibimiz</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              RandevuBu'yu bugünlere getiren deneyimli ekibimizle tanışın
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Bize Katılmak İster Misiniz?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Hızla büyüyen ekibimizde yer almak ve salon sektörünün geleceğini şekillendirmek için bize katılın.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Açık Pozisyonlar
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:border-white hover:bg-white/10 transition-all">
              Şirket Kültürü
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}