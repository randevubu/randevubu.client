'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/businesses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/businesses');
    }
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/businesses?category=${encodeURIComponent(category)}`);
  };

  // Category links similar to Booksy
  const categories = [
    { name: 'Saç', value: 'Beauty' },
    { name: 'Berber', value: 'Beauty' },
    { name: 'Tırnak', value: 'Beauty' },
    { name: 'Cilt Bakımı', value: 'Beauty' },
    { name: 'Kaş & Kirpik', value: 'Beauty' },
    { name: 'Masaj', value: 'Wellness' },
    { name: 'Makyaj', value: 'Beauty' },
    { name: 'Wellness & Spa', value: 'Wellness' },
  ];

  // Use bundled hero background asset to avoid external dependency
  const backgroundImageUrl = '/hero-background.jpg';

  return (
    <>
      {/* Mobile Hero */}
      <section className="block lg:hidden relative overflow-hidden h-[78vh] -mt-16 pt-16">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImageUrl}
            alt="Professional salon"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/50"></div>
        </div>
        
        {/* Mobile Content */}
        <div className="relative px-4 h-full flex flex-col justify-center">
          {/* Main Title - Booksy style: smaller */}
          <div className="text-center mb-5">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2">
              Randevu Al
              <br/>
              <span className="text-white">30 Saniyede</span>
            </h1>
            <p className="text-sm text-white/90 leading-relaxed px-2 mb-4">
              Modern salon rezervasyon deneyimi. Hızlı, kolay, güvenilir.
            </p>
          </div>

          {/* Search Bar - Booksy style */}
          <form onSubmit={handleSearch} className="mb-3 px-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Salon veya hizmet ara"
                className="w-full pl-12 pr-4 py-3 text-base bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder-gray-500 shadow-xl"
              />
            </div>
          </form>

          {/* Category Links - Booksy style: smaller, tighter */}
          <div className="mb-0 overflow-x-auto px-4">
            <div className="flex gap-4 justify-center min-w-max">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.value)}
                  className="text-white/90 hover:text-white text-sm font-normal whitespace-nowrap transition-colors hover:underline"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Hero */}
      <section className="hidden lg:flex relative overflow-hidden h-[73vh] items-center -mt-16 pt-16">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImageUrl}
            alt="Professional salon"
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/50"></div>
        </div>
        
        {/* Desktop Content */}
        <div className="relative max-w-5xl mx-auto px-6 w-full h-full flex items-center">
          <div className="text-center w-full">
            {/* Headline - Booksy style: smaller, cleaner */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
              Randevu Almak
              <br />
              <span className="text-white">Hiç Bu Kadar Kolay Olmamıştı</span>
            </h1>
            
            {/* Subheadline - Booksy style: smaller text */}
            <p className="text-base lg:text-lg text-white/90 leading-relaxed mb-6 max-w-2xl mx-auto">
              Modern randevu sistemi ile müşterilerinizi zahmetsizce yönetin. 
              Online rezervasyon, otomatik hatırlatıcılar ve gelir takibi.
            </p>
            
            {/* Search Bar - Primary CTA - Booksy style */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Salon veya hizmet ara"
                  className="w-full pl-12 pr-4 py-4 text-base bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-gray-900 placeholder-gray-500 shadow-xl"
                />
              </div>
            </form>

            {/* Category Links - Booksy style: smaller, tighter spacing */}
            <div className="mb-0">
              <div className="flex flex-wrap gap-4 justify-center items-center text-white/90">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.value)}
                    className="text-white/90 hover:text-white text-sm font-normal transition-colors hover:underline whitespace-nowrap"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
