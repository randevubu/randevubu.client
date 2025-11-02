'use client';

import React from 'react';
import { CheckCircle, ExternalLink, Zap, Shield, Bell, Mail, Calendar, CreditCard } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Ödeme' | 'İletişim' | 'Takvim' | 'CRM' | 'Raporlama';
  status: 'Aktif' | 'Yakında';
}

const integrations: Integration[] = [
  {
    id: '1',
    name: 'iyzico',
    description: 'Güvenli online ödeme alın. Tüm kredi kartları ve banka kartları desteklenir.',
    icon: '💳',
    category: 'Ödeme',
    status: 'Aktif'
  },
  {
    id: '2',
    name: 'PayTR',
    description: 'Alternatif ödeme altyapısı ile daha fazla ödeme seçeneği.',
    icon: '💳',
    category: 'Ödeme',
    status: 'Aktif'
  },
  {
    id: '3',
    name: 'SMS Gateway',
    description: 'Müşterilere SMS bildirimleri gönderin. Hatırlatma ve bilgilendirme mesajları.',
    icon: '📱',
    category: 'İletişim',
    status: 'Aktif'
  },
  {
    id: '4',
    name: 'E-posta Servisi',
    description: 'Otomatik e-posta bildirimleri. Randevu onayları ve hatırlatmaları.',
    icon: '📧',
    category: 'İletişim',
    status: 'Aktif'
  },
  {
    id: '5',
    name: 'WhatsApp Business API',
    description: 'WhatsApp üzerinden randevu bildirimi ve müşteri iletişimi.',
    icon: '💬',
    category: 'İletişim',
    status: 'Yakında'
  },
  {
    id: '6',
    name: 'Google Calendar',
    description: 'Randevularınızı Google Calendar ile senkronize edin.',
    icon: '📅',
    category: 'Takvim',
    status: 'Yakında'
  },
  {
    id: '7',
    name: 'Outlook Calendar',
    description: 'Outlook takvimi ile otomatik senkronizasyon.',
    icon: '📅',
    category: 'Takvim',
    status: 'Yakında'
  },
  {
    id: '8',
    name: 'Zapier',
    description: 'Bindlerce uygulama ile entegre olun. Otomatik iş akışları oluşturun.',
    icon: '🔗',
    category: 'CRM',
    status: 'Aktif'
  }
];

const categories = ['Tümü', ...new Set(integrations.map(integration => integration.category))];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('Tümü');

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === 'Tümü' || integration.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            🔗 Entegrasyonlar
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Popüler Entegrasyonlar
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            RandevuBu, binlerce uygulama ve servisle entegre olarak iş akışlarınızı 
            otomatikleştirir ve verimliliğinizi artırır.
          </p>
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

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 transition-all shadow-lg hover:shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{integration.name}</h3>
                      <span className="text-xs text-gray-500">{integration.category}</span>
                    </div>
                  </div>
                  {integration.status === 'Aktif' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      Yakında
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {integration.description}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    disabled={integration.status !== 'Aktif'}
                    className={`font-medium text-sm ${
                      integration.status === 'Aktif'
                        ? 'text-indigo-600 hover:text-indigo-700'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {integration.status === 'Aktif' ? 'Entegre Et →' : 'Yakında'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* API Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-12 text-white mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Kendi Entegrasyonunuzu Oluşturun</h2>
            <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
              RESTful API'mizi kullanarak kendi entegrasyonlarınızı geliştirebilirsiniz. 
              Detaylı dokümantasyon ve örnek kodlar ile hızlıca başlayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/api-docs"
                className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
              >
                API Dokümantasyonu
              </a>
              <a
                href="/contact"
                className="bg-white/10 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition-colors border-2 border-white"
              >
                Entegrasyon Desteği
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Otomatik İş Akışları</h3>
            <p className="text-sm text-gray-600">
              Entegrasyonlar ile tekrarlanan görevleri otomatikleştirin ve zaman kazanın.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Güvenli Bağlantılar</h3>
            <p className="text-sm text-gray-600">
              Tüm entegrasyonlar SSL şifreleme ve OAuth 2.0 ile korunur.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Gerçek Zamanlı Bildirimler</h3>
            <p className="text-sm text-gray-600">
              Webhook desteği ile anında veri senkronizasyonu sağlayın.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Farklı Bir Entegrasyon mu İstiyorsunuz?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Henüz listelenmemiş bir entegrasyon eklememizi istiyorsanız, bizimle iletişime geçin. 
            Ekibimiz sizin ihtiyaçlarınıza göre özel entegrasyonlar geliştirebilir.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            İletişime Geçin
          </a>
        </div>
      </div>
    </div>
  );
}

