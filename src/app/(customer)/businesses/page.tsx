'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, MapPin, Clock, ChevronDown, ChevronRight, CheckCircle, Calendar } from 'lucide-react';
import { businessService, PublicBusiness } from '@/src/lib/services/business';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<PublicBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await businessService.getBusinesses({ limit: 50 });
      if (response.success && response.data) {
        setBusinesses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = !selectedCategory || business.businessType.category === selectedCategory;
    return matchesSearch && matchesCategory && !business.isClosed;
  });

  const categories = [...new Set(businesses.map(b => b.businessType.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-12 bg-[var(--theme-secondary)] rounded-2xl w-96 mx-auto mb-4"></div>
            <div className="h-6 bg-[var(--theme-secondary)] rounded-xl w-64 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[var(--theme-card)] rounded-2xl overflow-hidden shadow-xl">
                  <div className="h-48 bg-[var(--theme-secondary)]"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-[var(--theme-secondary)] rounded-lg"></div>
                    <div className="h-4 bg-[var(--theme-secondary)] rounded w-3/4"></div>
                    <div className="h-4 bg-[var(--theme-secondary)] rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
        {/* Search and Filter Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-[var(--theme-foregroundMuted)]" />
                </div>
                <input
                  type="text"
                  placeholder="İşletme ara... (örn: kuaför, berber, güzellik salonu)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base bg-white/90 backdrop-blur-sm border border-[var(--theme-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 focus:border-[var(--theme-primary)] text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundMuted)] shadow-lg transition-all duration-300"
                />
              </div>
            </div>

            {/* Category Filter - Slideable */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max px-4">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    !selectedCategory 
                      ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-lg' 
                      : 'bg-[var(--theme-card)] text-[var(--theme-cardForeground)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)]'
                  }`}
                >
                  Tümü
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-lg'
                        : 'bg-[var(--theme-card)] text-[var(--theme-cardForeground)] border border-[var(--theme-border)] hover:border-[var(--theme-primary)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="px-4 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-[var(--theme-foreground)]">
                İşletmeler
              </h2>
              <span className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-3 py-1 rounded-full text-sm font-semibold">
                {filteredBusinesses.length}
              </span>
            </div>
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] text-sm font-medium transition-colors"
              >
                Aramayı Temizle ✕
              </button>
            )}
          </div>

          {/* Businesses Grid */}
          {filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredBusinesses.map((business) => (
                <Link 
                  key={business.id} 
                  href={`/businesses/${business.slug}`}
                  className="group block"
                >
                  <div className="bg-[var(--theme-card)] rounded-xl overflow-hidden shadow-lg border border-[var(--theme-border)] transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 group-hover:scale-[1.02] flex flex-col h-full">
                    {/* Business Image */}
                    <div className="relative h-32 overflow-hidden">
                      {business.coverImageUrl || business.logoUrl ? (
                        <img 
                          src={business.coverImageUrl || business.logoUrl} 
                          alt={business.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-accent)]/20 flex items-center justify-center">
                          <div className="text-3xl opacity-60">{business.businessType.icon}</div>
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="inline-flex items-center bg-white/95 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-md">
                          <span className="mr-1 text-xs">{business.businessType.icon}</span>
                          <span className="truncate max-w-16">{business.businessType.displayName}</span>
                        </span>
                      </div>
                      
                      {business.isVerified && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Business Info */}
                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-sm font-bold text-[var(--theme-cardForeground)] mb-1 group-hover:text-[var(--theme-primary)] transition-colors duration-300 line-clamp-1">
                        {business.name}
                      </h3>
                      
                      {business.description && (
                        <p className="text-[var(--theme-foregroundSecondary)] mb-2 line-clamp-1 text-xs leading-relaxed">
                          {business.description}
                        </p>
                      )}

                      {/* Location */}
                      <div className="flex items-center text-xs text-[var(--theme-foregroundSecondary)] mb-2">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1 text-xs">{business.city}, {business.state}</span>
                      </div>

                      {/* Spacer to push button to bottom */}
                      <div className="flex-grow"></div>

                      {/* CTA Button */}
                      <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] py-2 px-3 rounded-lg text-center font-medium group-hover:from-[var(--theme-primaryHover)] group-hover:to-[var(--theme-accentHover)] transition-all duration-300 transform group-hover:scale-105 shadow-md">
                        <div className="flex items-center justify-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">Randevu Al</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-[var(--theme-secondary)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-[var(--theme-foregroundMuted)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--theme-foreground)] mb-3">İşletme Bulunamadı</h3>
              <p className="text-[var(--theme-foregroundSecondary)] mb-6 max-w-md mx-auto">
                Arama kriterlerinize uygun işletme bulunmuyor. Farklı anahtar kelimeler deneyin.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-6 py-3 rounded-xl font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
              >
                Tüm İşletmeleri Göster
              </button>
            </div>
            )}
          </div>
        </section>
      </div>
  );
}