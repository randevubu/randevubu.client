'use client';

import { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Search, BookOpen, MessageSquare, 
  Video, FileText, HelpCircle, ExternalLink, CheckCircle, 
  Phone, Mail, MapPin, Activity
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: 'Genel',
    question: 'RandevuBu nedir?',
    answer: 'RandevuBu, işletmelerin randevu yönetimini dijitalleştiren kapsamlı bir platformdur. Rezervasyon, müşteri yönetimi, personel yönetimi ve raporlama özellikleri sunar.'
  },
  {
    category: 'Genel',
    question: 'Hangi işletmeler RandevuBu kullanabilir?',
    answer: 'Berber, kuaför, güzellik salonları, spa, masaj salonları, diş hekimleri, estetik klinikleri, fitness merkezleri ve randevu sistemi kullanan tüm işletmeler kullanabilir.'
  },
  {
    category: 'Kurulum',
    question: 'Nasıl başlarım?',
    answer: 'Web sitesinde "Hemen Başla" butonuna tıklayarak hesap oluşturun. İşletme bilgilerinizi girin ve abonelik planınızı seçin. Platform kullanıma hazır olacaktır.'
  },
  {
    category: 'Kurulum',
    question: 'Ne kadar sürede entegre edebilirim?',
    answer: 'Platform kullanıma hazır olarak sunulur. Temel kurulum 10 dakikadan az sürer. İşletme bilgilerinizi girmeniz ve ilk randevunuzu oluşturmanız yeterlidir.'
  },
  {
    category: 'Özellikler',
    question: 'SMS bildirimi gönderebilir miyim?',
    answer: 'Evet, RandevuBu SMS ve e-posta hatırlatma bildirimleri gönderir. Abonelik planınıza göre aylık SMS kotanız bulunur.'
  },
  {
    category: 'Özellikler',
    question: 'Müşteriler online randevu alabilir mi?',
    answer: 'Evet! Müşteriler web siteniz ve sosyal medya hesaplarınız üzerinden kendi randevularını alabilirler. Gerçek zamanlı müsaitlik görüntüsü mevcuttur.'
  },
  {
    category: 'Abonelik',
    question: 'Ücretsiz deneme var mı?',
    answer: 'Evet! Tüm yeni kullanıcılara 14 günlük ücretsiz deneme hakkı sunuyoruz. Deneme süresi boyunca tüm özellikleri kullanabilirsiniz.'
  },
  {
    category: 'Abonelik',
    question: 'Planımı değiştirebilir miyim?',
    answer: 'Evet, istediğiniz zaman yükseltme veya düşürme yapabilirsiniz. Yükseltmeler anında yürürlüğe girer. Düşürmeler ise mevcut faturalandırma döneminin sonunda başlar.'
  },
  {
    category: 'Abonelik',
    question: 'İptal edersem verilerim ne olur?',
    answer: 'Verileriniz 30 gün boyunca yedekte saklanır. Bu süre içinde yeniden abone olursanız tüm verileriniz geri yüklenir.'
  },
  {
    category: 'Ödeme',
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı, banka kartı ve taksit seçenekleri sunuyoruz. iyzico ve PayTR entegrasyonu ile güvenli ödeme sağlıyoruz.'
  },
  {
    category: 'Ödeme',
    question: 'Fatura alabilir miyim?',
    answer: 'Evet, tüm ödemeler için e-fatura oluşturulur. Faturalar e-posta adresinize otomatik olarak gönderilir.'
  },
  {
    category: 'Teknik Destek',
    question: 'Yardıma ihtiyacım var. Nereye başvurabilirim?',
    answer: 'info@randevubu.com adresinden bizimle iletişime geçebilir veya 0545 449 60 42 numaralı telefondan arayabilirsiniz. Destek taleplerinize 24 saat içinde yanıt veriyoruz.'
  },
  {
    category: 'Güvenlik',
    question: 'Verilerim güvende mi?',
    answer: 'Kesinlikle! Tüm verileriniz şifrelenerek saklanır, ISO 27001 standartlarında güvenlik uygulamaları kullanılır ve KVKK\'ya tam uyumludur.'
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const categories = ['Tümü', ...new Set(faqs.map(faq => faq.category))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Tümü' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            ❓ Yardım Merkezi
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Yardıma mı İhtiyacınız Var?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SSS bölümümüzde aradığınız cevabı bulamadıysanız, bizimle iletişime geçin
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Sorunuzu yazın... (örn: ödeme, randevu, kurulum)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 flex items-start justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
                      {faq.category}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {openFAQ === index && (
                <div className="px-6 pb-6 pt-0">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hızlı Erişim</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a href="/contact" className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">İletişime Geçin</h3>
                <p className="text-sm text-gray-600">Sorularınız için bizimle iletişime geçin</p>
              </div>
            </a>

            <a href="/kvkk" className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">KVKK & Gizlilik</h3>
                <p className="text-sm text-gray-600">Veri koruma bilgileri</p>
              </div>
            </a>

            <a href="/status" className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Sistem Durumu</h3>
                <p className="text-sm text-gray-600">Platform sağlık durumu</p>
              </div>
            </a>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-indigo-200">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hala Sorununuz Var mı?</h2>
              <p className="text-gray-700 mb-6">
                SSS bölümünde aradığınız cevabı bulamadıysanız, uzman ekibimiz size yardımcı olmaya hazır!
              </p>
              <div className="space-y-4">
                <a href="/contact" className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 transition-colors">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">0545 449 60 42</span>
                </a>
                <a href="/contact" className="flex items-center space-x-3 text-gray-700 hover:text-indigo-600 transition-colors">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">info@randevubu.com</span>
                </a>
                <div className="flex items-center space-x-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm">MERKEZ/KÜTAHYA</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <a
                href="/contact"
                className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 transition-colors text-center shadow-lg"
              >
                İletişim Formunu Doldurun
              </a>
              <a
                href="/requirements"
                className="w-full bg-white text-indigo-600 font-bold py-4 px-6 rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-colors text-center"
              >
                Sistem Gereksinimlerini Kontrol Edin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

