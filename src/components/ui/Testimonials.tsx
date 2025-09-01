export default function Testimonials() {
  const testimonials = [
    {
      name: "Fatma Yılmaz",
      role: "Sahip, Güzel Saç Stüdyosu",
      content: "RandevuBu randevuları nasıl ele aldığımızı tamamen değiştirdi. Gelmeyen müşteri oranımız %80 düştü ve %40 daha fazla müşteri rezervasyon yapıyor. Otomatik hatırlatıcılar gerçekten oyun değiştirici!",
      rating: 5,
      image: "FY"
    },
    {
      name: "Mehmet Kaya",
      role: "Berber, Keskin Kesim Co.",
      content: "Tek başına berber olarak basit ama güçlü bir şeye ihtiyacım vardı. Bu platform her şeyi hallediyor - rezervasyonlar, ödemeler, hatırlatıcılar. Program yönetmek yerine saç kesmeye odaklanabiliyorum.",
      rating: 5,
      image: "MK"
    },
    {
      name: "Ayşe Demir",
      role: "Müdür, Elite Salon Grubu",
      content: "5 lokasyonu yönetmek RandevuBu'dan önce kabustu. Şimdi her şeyi tek bir panelden görebiliyorum. Analitikler her gün daha iyi iş kararları almamıza yardımcı oluyor.",
      rating: 5,
      image: "AD"
    }
  ];

  const stats = [
    { number: "2,500+", label: "Aktif Salon" },
    { number: "%95", label: "Müşteri Memnuniyeti" },
    { number: "1M+", label: "Rezervasyon Yapıldı" },
    { number: "%30", label: "Ortalama Gelir Artışı" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Salon sahipleri tarafından{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              her yerde
            </span>{' '}
            sevilen
          </h2>
          <p className="text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Sadece bizim sözümüze güvenmeyin. İşte salon sahiplerinin RandevuBu deneyimleri hakkında söyledikleri.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-2xl relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed text-sm">"{testimonial.content}"</p>
              
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707A1 1 0 019 9.293V4a1 1 0 112 0v5.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-900 rounded-3xl p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">Topluluğa katılın</h3>
              <p className="text-base lg:text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
                Diğer salon sahipleriyle bağlantı kurun, ipuçlarını paylaşın ve yeni özellikler hakkında özel güncellemeler alın.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 text-sm">
                  Facebook Grubumuza Katılın
                </button>
                <button className="border-2 border-gray-600 text-gray-300 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 hover:text-white transition-all text-sm">
                  Instagram'da Takip Edin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}