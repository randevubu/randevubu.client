'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronRight, MapPin, ThumbsUp, Info } from 'lucide-react';
import { businessService, PublicBusiness } from '@/src/lib/services/business';

const getRatingValue = (business: PublicBusiness) => {
  if (typeof business.rating === 'number') return business.rating;
  if (typeof business.averageRating === 'number') return business.averageRating;
  return null;
};

const getReviewCount = (business: PublicBusiness) => {
  if (typeof business.totalReviews === 'number') return business.totalReviews;
  if (typeof business.totalRatings === 'number') return business.totalRatings;
  return 0;
};

export default function RecommendedBusinesses() {
  const [businesses, setBusinesses] = useState<PublicBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await businessService.getBusinesses({ limit: 20 });
      if (response.success && response.data) {
        // Sort by points (rating * reviews count for better ranking)
        // Businesses with higher ratings and more reviews get higher points
        let sortedBusinesses = [...response.data].filter((business) => !business.isClosed);
        
        // Prioritize businesses with ratings, but also include those without
        const withRatings = sortedBusinesses
          .filter((business) => {
            const ratingValue = getRatingValue(business);
            const reviewCount = getReviewCount(business);
            return ratingValue !== null && reviewCount > 0;
          })
          .sort((a, b) => {
            // Calculate points: rating * log(reviews + 1) to balance rating and review count
            const ratingA = getRatingValue(a) || 0;
            const ratingB = getRatingValue(b) || 0;
            const reviewsA = getReviewCount(a);
            const reviewsB = getReviewCount(b);
            const pointsA = ratingA * Math.log10(reviewsA + 1);
            const pointsB = ratingB * Math.log10(reviewsB + 1);
            return pointsB - pointsA; // Sort descending
          });
        
        const withoutRatings = sortedBusinesses
          .filter((business) => {
            const ratingValue = getRatingValue(business);
            const reviewCount = getReviewCount(business);
            return ratingValue === null || reviewCount === 0;
          });
        
        // Combine: businesses with ratings first, then those without
        sortedBusinesses = [...withRatings, ...withoutRatings].slice(0, 10);
        setBusinesses(sortedBusinesses);
      }
    } catch (error) {
      console.error('Error fetching recommended businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-gray-200 rounded-lg h-64 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4 bg-white min-h-[200px]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Önerilenler</h2>
          <Link 
            href="/businesses" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            Tüm İşletmeler
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {businesses.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No businesses available at the moment.</p>
            <p className="text-sm mt-2">Check back later for recommended businesses.</p>
          </div>
        )}

        {/* Scrollable Business Cards */}
        {businesses.length > 0 && (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/businesses/${business.slug}`}
                className="flex-shrink-0 w-[320px] group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col cursor-pointer">
                  {/* Business Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {business.coverImageUrl || business.logoUrl ? (
                      <Image
                        src={business.coverImageUrl || business.logoUrl || ''}
                        alt={business.name}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-4xl opacity-50">{business.businessType.icon || '🏢'}</span>
                      </div>
                    )}
                    
                    {/* Rating - Top Right */}
                    {(() => {
                      const ratingValue = getRatingValue(business);
                      const reviewCount = getReviewCount(business);
                      return ratingValue !== null && reviewCount > 0 ? (
                        <div className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-900 shadow-md">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{ratingValue.toFixed(1)}</span>
                          <span className="text-gray-600">({reviewCount})</span>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Business Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Business Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {business.name}
                    </h3>

                    {/* Address */}
                    <div className="flex items-start text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {business.city}, {business.state}
                      </span>
                    </div>

                    <div className="mt-auto min-h-[16px]" />
                  </div>
                </div>
              </Link>
              ))}
            </div>

            {/* Scroll Button */}
            {businesses.length > 3 && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all z-10 border border-gray-200 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

