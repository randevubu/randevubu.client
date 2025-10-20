'use client';

/**
 * Business Ratings Component
 * 
 * Displays business ratings with Google integration support.
 * Follows the established UI patterns in the codebase.
 */

import React, { useState } from 'react';
import { MapPin, ExternalLink, Star, Users, MessageSquare } from 'lucide-react';
import { useBusinessRatings } from '../../lib/hooks/useRatings';
import { RatingDisplay } from './RatingDisplay';
import { GoogleMapEmbed } from './GoogleMapEmbed';
import type { BusinessRatingsProps, Rating } from '../../types/rating';

export const BusinessRatings: React.FC<BusinessRatingsProps> = ({
  businessId,
  averageRating,
  totalRatings,
  googleIntegration,
  showGoogleWidget = true,
  className = '',
}) => {
  const [showAllRatings, setShowAllRatings] = useState(false);
  
  const {
    ratings,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
    averageRating: hookAverageRating,
    totalRatings: hookTotalRatings,
  } = useBusinessRatings(businessId, { 
    page: 1, 
    limit: showAllRatings ? 10 : 3 
  });

  // Prioritize ratings API data since it's more accurate
  const displayAverageRating = hookAverageRating !== undefined ? hookAverageRating : averageRating;
  const displayTotalRatings = hookTotalRatings !== undefined ? hookTotalRatings : totalRatings;


  const handleViewAllClick = () => {
    setShowAllRatings(!showAllRatings);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRatingItem = (rating: Rating) => (
    <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <RatingDisplay rating={rating.rating} size="sm" showCount={false} />
          <span className="text-sm text-gray-600">
            {rating.isAnonymous ? 'Anonim' : `${rating.customer?.firstName} ${rating.customer?.lastName}`}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(rating.createdAt)}
        </span>
      </div>
      
      {rating.comment && (
        <p className="text-gray-700 text-sm leading-relaxed">
          {rating.comment}
        </p>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Internal Ratings Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Müşteri Yorumları
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            {displayTotalRatings} yorum
          </div>
        </div>

        {/* Rating Summary */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-3xl font-bold text-gray-900">
            {displayAverageRating.toFixed(1)}
          </div>
          <div className="flex-1">
            <RatingDisplay 
              rating={displayAverageRating} 
              size="lg" 
              showCount={false}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">
              {displayTotalRatings} müşteri yorumuna dayalı
            </p>
          </div>
        </div>

        {/* Individual Ratings */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">
              Yorumlar yüklenemedi. 
              <button 
                onClick={() => refetch()} 
                className="ml-1 text-blue-600 hover:underline"
              >
                Tekrar dene
              </button>
            </p>
          </div>
        ) : ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map(renderRatingItem)}
            
            {/* Load More / View All */}
            {displayTotalRatings > 3 && (
              <div className="pt-4 text-center">
                {!showAllRatings ? (
                  <button
                    onClick={handleViewAllClick}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Tüm {displayTotalRatings} yorumu gör
                  </button>
                ) : (
                  <div className="space-y-2">
                    {hasMore && (
                      <button
                        onClick={loadMore}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Daha fazla yorum yükle
                      </button>
                    )}
                    <button
                      onClick={handleViewAllClick}
                      className="block text-gray-600 hover:text-gray-700 text-sm"
                    >
                      Daha az göster
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Henüz yorum yok. Bu işletmeyi ilk yorumlayan siz olun!
            </p>
          </div>
        )}
      </div>

      {/* Google Integration */}
      {googleIntegration?.googleIntegrationEnabled && showGoogleWidget && googleIntegration.urls && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Google'da Bulun
              </h3>
            </div>
            <a
              href={googleIntegration.urls.reviews}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Google'da Gör
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Google Rating Display */}
          {googleIntegration.averageRating !== undefined && googleIntegration.totalRatings !== undefined && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900">
                      {googleIntegration.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      {[...Array(5)].map((_, i) => {
                        const filled = i < Math.floor(googleIntegration.averageRating!);
                        const partial = i === Math.floor(googleIntegration.averageRating!) &&
                                       googleIntegration.averageRating! % 1 !== 0;

                        return (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              filled
                                ? 'fill-yellow-400 text-yellow-400'
                                : partial
                                  ? 'fill-yellow-200 text-yellow-400'
                                  : 'text-gray-300'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-l border-blue-300 pl-4">
                    <div className="text-sm text-blue-800 font-medium">
                      Google Değerlendirmesi
                    </div>
                    <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {googleIntegration.totalRatings.toLocaleString('tr-TR')} değerlendirme
                    </div>
                    {googleIntegration.lastRatingAt && (
                      <div className="text-xs text-blue-500 mt-1">
                        Son: {new Date(googleIntegration.lastRatingAt).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                </div>
                <a
                  href={googleIntegration.urls.reviews}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors border border-blue-300"
                >
                  Tümünü Gör
                </a>
              </div>
            </div>
          )}

          {/* Info Banner - Only show if no rating data */}
          {(googleIntegration.averageRating === undefined || googleIntegration.totalRatings === undefined) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Bu işletme Google Haritalar'da kayıtlı. Haritada konumu görüntüleyin ve Google'daki yorumları okuyun.
                </span>
              </p>
            </div>
          )}

          {/* Google Maps Embed */}
          <div className="mb-4">
            <GoogleMapEmbed
              latitude={googleIntegration.latitude}
              longitude={googleIntegration.longitude}
              placeId={googleIntegration.googlePlaceId}
              height={300}
              showOpenInMapsLink={false}
            />
          </div>

          {/* Google Links */}
          <div className="flex flex-wrap gap-2">
            <a
              href={googleIntegration.urls.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Google Haritalar'da Görüntüle
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={googleIntegration.urls.reviews}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Star className="w-4 h-4" />
              Google Yorumlarını Görüntüle
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={googleIntegration.urls.writeReview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Yorum Yaz
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessRatings;
