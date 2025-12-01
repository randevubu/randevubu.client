'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Star, MapPin, ListFilter, ChevronDown, ChevronRight, CheckCircle, Calendar, SlidersHorizontal } from 'lucide-react';
import { businessService, PublicBusiness } from '@/src/lib/services/business';
import { TURKISH_CITIES, getCityLabel } from '@/src/data/turkishCities';
import { Popover, PopoverTrigger, PopoverContent } from '@/src/components/ui/Popover';

const normalizeText = (value: string) => {
  if (!value) return '';
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export default function BusinessesPage() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<PublicBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);

  useEffect(() => {
    // Read search query and category from URL params
    const searchQuery = searchParams?.get('search') || '';
    const categoryParam = searchParams?.get('category') || '';
    const cityParam = searchParams?.get('city') || '';
    
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (cityParam) {
      setSelectedCity(cityParam);
    }
    fetchBusinesses();
  }, [searchParams]);


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

  const selectedCityLabel = useMemo(
    () => getCityLabel(selectedCity),
    [selectedCity]
  );

  const getBusinessCategoryKey = (business: PublicBusiness) =>
    business.businessType?.category ||
    business.businessType?.name ||
    business.businessType?.displayName ||
    '';

  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = normalizeText(searchTerm);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const normalizedCity = normalizeText(selectedCityLabel);

    return businesses.filter((business) => {
      const matchesCategory =
        !selectedCategory || getBusinessCategoryKey(business) === selectedCategory;
      const matchesCity =
        !selectedCity ||
        normalizeText(`${business.city} ${business.state ?? ''}`).includes(normalizedCity);
      
      const rating = business.averageRating ?? business.rating;
      const matchesRating = !minRating || (rating !== undefined && rating >= minRating);

      if (!matchesCategory || !matchesCity || !matchesRating || business.isClosed) {
        return false;
      }

      if (queryTokens.length === 0) {
        return true;
      }

      const searchableValues = [
        business.name,
        business.description,
        business.city,
        business.state,
        business.slug,
        business.businessType?.name,
        business.businessType?.displayName,
        business.businessType?.category,
        ...(business.tags ?? []),
      ]
        .filter(Boolean)
        .map((value) => normalizeText(String(value)));

      if (searchableValues.length === 0) {
        return false;
      }

      return queryTokens.every((token) =>
        searchableValues.some((field) => field.includes(token))
      );
    });
  }, [businesses, searchTerm, selectedCategory, selectedCity, selectedCityLabel, minRating]);

  const categoryOptions = useMemo(() => {
    const optionMap = new Map<string, string>();
    businesses.forEach((business) => {
      const key = getBusinessCategoryKey(business);
      const label =
        business.businessType?.displayName ||
        business.businessType?.name ||
        business.businessType?.category ||
        '';

      if (key && label && !optionMap.has(key)) {
        optionMap.set(key, label);
      }
    });

    return Array.from(optionMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'tr'));
  }, [businesses]);

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategory) return '';
    return (
      categoryOptions.find((option) => option.value === selectedCategory)?.label || ''
    );
  }, [selectedCategory, categoryOptions]);

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
        <section className="py-8 px-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Search Bar */}
            <div className="max-w-5xl mx-auto mb-6">
              <div className="bg-white/95 backdrop-blur border border-[var(--theme-border)] rounded-3xl shadow-xl">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[var(--theme-border)]">
                  {/* Query Input */}
                  <div className="flex flex-1 items-center gap-3 px-5 py-4">
                    <Search className="h-5 w-5 text-[var(--theme-foregroundMuted)] shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="İşletme veya hizmet ara"
                      className="flex-1 bg-transparent focus:outline-none text-base text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundMuted)]"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-foreground)] transition-colors"
                        aria-label="Aramayı temizle"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* City Selector */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-5 py-4 flex items-center gap-3 text-left focus:outline-none"
                      >
                        <MapPin className="h-5 w-5 text-[var(--theme-foregroundMuted)] shrink-0" />
                        <div className="flex flex-col flex-1">
                          <span className="text-xs uppercase tracking-wide text-[var(--theme-foregroundMuted)] leading-none">
                            Şehir
                          </span>
                          <span className="text-[var(--theme-foreground)] font-medium">
                            {selectedCityLabel || 'Şehir seç'}
                          </span>
                        </div>
                        {selectedCity && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedCity('');
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                event.stopPropagation();
                                setSelectedCity('');
                              }
                            }}
                            className="text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-foreground)] transition-colors cursor-pointer"
                            aria-label="Şehir seçimini temizle"
                          >
                            ✕
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 text-[var(--theme-foregroundMuted)]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] max-h-72 p-0"
                      align="start"
                    >
                      <div className="max-h-72 overflow-y-auto">
                        {TURKISH_CITIES.map((city) => (
                          <button
                            key={city.value}
                            type="button"
                            className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                            onClick={() => {
                              setSelectedCity(city.value);
                            }}
                          >
                            <span className="text-gray-900">{city.label}</span>
                            {city.value === selectedCity && (
                              <CheckCircle className="h-4 w-4 text-indigo-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Category Selector */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-5 py-4 flex items-center gap-3 text-left focus:outline-none"
                      >
                        <ListFilter className="h-5 w-5 text-[var(--theme-foregroundMuted)] shrink-0" />
                        <div className="flex flex-col flex-1">
                          <span className="text-xs uppercase tracking-wide text-[var(--theme-foregroundMuted)] leading-none">
                            Kategori
                          </span>
                          <span className="text-[var(--theme-foreground)] font-medium">
                            {selectedCategoryLabel || 'Kategori seç'}
                          </span>
                        </div>
                        {selectedCategory && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedCategory('');
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                event.stopPropagation();
                                setSelectedCategory('');
                              }
                            }}
                            className="text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-foreground)] transition-colors cursor-pointer"
                            aria-label="Kategori seçimini temizle"
                          >
                            ✕
                          </span>
                        )}
                        <ChevronDown className="h-4 w-4 text-[var(--theme-foregroundMuted)]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] max-h-72 p-0"
                      align="start"
                    >
                      <div className="max-h-72 overflow-y-auto">
                        {categoryOptions.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Kategori bulunamadı.
                          </div>
                        ) : (
                          categoryOptions.map((category) => (
                            <button
                              key={category.value}
                              type="button"
                              className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
                              onClick={() => {
                                setSelectedCategory(category.value);
                              }}
                            >
                              <span className="text-gray-900">{category.label}</span>
                              {category.value === selectedCategory && (
                                <CheckCircle className="h-4 w-4 text-indigo-600" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Category Filter removed per design */}
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
              
              <div className="flex items-center gap-3">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] text-sm font-medium transition-colors"
                  >
                    Aramayı Temizle ✕
                  </button>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--theme-foreground)] bg-white border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtrele
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" align="end">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[var(--theme-foreground)] mb-4">Filtreler</h3>
                      
                      {/* Rating Filter */}
                      <div>
                        <label className="text-sm font-medium text-[var(--theme-foreground)] mb-2 block">
                          Minimum Değerlendirme
                        </label>
                        <div className="border border-[var(--theme-border)] rounded-lg">
                          <button
                            onClick={() => setMinRating(null)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                              !minRating ? 'bg-indigo-50' : ''
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              Tümü
                            </span>
                            {!minRating && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                          </button>
                          {[4, 4.5, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setMinRating(rating)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between ${
                                minRating === rating ? 'bg-indigo-50' : ''
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                {rating}+ Yıldız
                              </span>
                              {minRating === rating && (
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clear Filters */}
                      {minRating && (
                        <button
                          onClick={() => setMinRating(null)}
                          className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Filtreyi Temizle
                        </button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

          {/* Businesses Grid */}
          {filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      
                      {/* Rating - Top Right */}
                      {(() => {
                        const rating = business.averageRating ?? business.rating;
                        const totalCount = business.totalRatings ?? business.totalReviews ?? 0;
                        return rating && totalCount > 0 ? (
                          <div className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-900 shadow-md">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            <span className="text-gray-600">({totalCount})</span>
                          </div>
                        ) : null;
                      })()}
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