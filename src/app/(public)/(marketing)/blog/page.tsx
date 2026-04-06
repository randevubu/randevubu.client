'use client';

import React, { useState } from 'react';
import { ArrowRight, Calendar, Clock, Search, User } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Randevu Yönetiminde Dijital Dönüşüm: İşletmelere 5 Fayda',
    excerpt: 'Dijital dönüşüm, işletmelerin randevu yönetim sistemlerini nasıl dönüştürdüğünü ve bu teknolojiyle birlikte gelen temel avantajları keşfedin.',
    author: 'RandevuBu Ekibi',
    date: '15 Mart 2024',
    readTime: '5 dk',
    category: 'İş Dünyası',
    image: '/api/placeholder/800/400',
    slug: 'randevu-yonetiminde-dijital-donusum',
    tags: ['Dijital Dönüşüm', 'İş Yönetimi', 'Teknoloji']
  },
  {
    id: '2',
    title: 'Müşteri Memnuniyetini Artıran 7 Randevu Yönetim İpucu',
    excerpt: 'Müşteri memnuniyetini artırmak için randevu yönetiminde dikkat edilmesi gereken püf noktalar ve uygulama önerileri.',
    author: 'RandevuBu Ekibi',
    date: '10 Mart 2024',
    readTime: '7 dk',
    category: 'Müşteri Deneyimi',
    image: '/api/placeholder/800/400',
    slug: 'musteri-memnuniyetini-artiran-ipuclari',
    tags: ['Müşteri Deneyimi', 'İş Yönetimi', 'İpuçları']
  }
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');


  const categories = ['Tümü', ...new Set(blogPosts.map(post => post.category))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Tümü' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            📝 Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            RandevuBu Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Randevu yönetimi, iş dünyası, müşteri deneyimi ve teknoloji hakkında 
            güncel içerikler, ipuçları ve rehberler
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Blog yazılarında ara..."
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

        {/* Blog Posts */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group"
              >
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {post.date}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform">
                      <span className="text-sm">Devamını Oku</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-600">
              Aradığınız kriterlere uygun blog yazısı bulunamadı. Lütfen farklı bir arama yapın.
            </p>
          </div>
        )}


        {/* Newsletter CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-4">Güncellemelerden Haberdar Olun</h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Yeni blog yazılarımızdan ve RandevuBu güncellemelerinden
            haberdar olmak için bültenimize abone olun
          </p>

          <div className="max-w-md mx-auto text-left">
            <NewsletterInlineForm />
          </div>
        </div>

      </div>
    </div>
  );
}

function NewsletterInlineForm() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [kvkkAccepted, setKvkkAccepted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!kvkkAccepted) {
      setError('Lütfen KVKK ve Aydınlatma Metni\'ni onaylayın.');
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { apiClient } = await import('@/src/lib/api');
      const response = await apiClient.post('/api/v1/newsletter', { email: trimmed });

      if (response.data?.success) {
        setSuccess(true);
        setEmail('');
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const message =
          (response.data && (response.data.message || response.data.error?.message)) ||
          'Abonelik sırasında bir hata oluştu. Lütfen tekrar deneyin.';
        setError(message);
      }
    } catch (err: any) {
      // Daha anlaşılır hata mesajları
      const maybeAxios = err as { response?: { status?: number; data?: any } };

      if (maybeAxios.response?.status === 429) {
        setError('Çok fazla abonelik isteği gönderdiniz. Lütfen bir saat sonra tekrar deneyin.');
      } else {
        const message =
          maybeAxios.response?.data?.message ||
          maybeAxios.response?.data?.error?.message ||
          err?.message ||
          'Abonelik sırasında bir hata oluştu. Lütfen tekrar deneyin.';
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-300 text-emerald-50 px-3 py-2 rounded-lg text-sm">
          Bülten aboneliğiniz alındı. Teşekkür ederiz!
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-300 text-red-50 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-row gap-2 items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@example.com"
          className="w-full px-3 py-2 rounded-lg text-sm text-gray-900 placeholder:text-indigo-200 border border-indigo-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-indigo-600 focus:ring-white bg-white/95"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="shrink-0 bg-white text-indigo-600 font-medium text-sm py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-indigo-200"
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Abone Ol'}
        </button>
      </div>
      <label className="flex items-start gap-2 text-[10px] text-indigo-100 leading-snug cursor-pointer select-none">
        <input
          type="checkbox"
          className="mt-[2px] h-3 w-3 rounded border-indigo-300 text-indigo-600 focus:ring-0"
          checked={kvkkAccepted}
          onChange={(e) => setKvkkAccepted(e.target.checked)}
          disabled={isSubmitting}
        />
        <span>
          Kişisel verilerimin KVKK kapsamında işlenmesine ilişkin{' '}
          <span className="underline underline-offset-2">
            Aydınlatma Metni ve Açık Rıza Metni
          </span>
          'ni okudum, kabul ediyorum.
        </span>
      </label>
    </form>
  );
}

