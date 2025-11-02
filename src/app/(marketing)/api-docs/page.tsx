'use client';

import { Clock, Mail, Bell, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            📚 API Dokümantasyonu
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            API Yakında
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            RandevuBu API dokümantasyonu şu anda geliştiriliyor. 
            Yakında RESTful API ile platformumuzu kendi uygulamalarınıza entegre edebileceksiniz.
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-2xl shadow-lg p-12 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Yakında Yayınlanacak
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              API dokümantasyonu ve SDK'lar için çalışmalarımız sürüyor. 
              Haberdar olmak için bültenimize abone olabilir veya bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        </div>

        {/* What to Expect */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">RESTful API</h3>
            <p className="text-sm text-gray-600">
              Modern RESTful API ile tüm platform özelliklerine erişim.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Webhook Desteği</h3>
            <p className="text-sm text-gray-600">
              Gerçek zamanlı bildirimler için webhook entegrasyonları.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Haberdar Olmak İster misiniz?</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            API yayınlandığında size bildirim gönderebilmemiz için iletişim formunu doldurun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors"
            >
              İletişime Geçin
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/20 transition-colors border-2 border-white inline-flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Bültene Abone Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
