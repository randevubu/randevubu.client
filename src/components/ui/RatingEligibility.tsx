'use client';

/**
 * Rating Eligibility Component
 * 
 * Displays rating eligibility status and handles rating submission flow.
 * Follows the established UI patterns in the codebase.
 */

import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Calendar,
  MessageSquare,
  X
} from 'lucide-react';
import { useRatingEligibility } from '../../lib/hooks/useRatings';
import { RatingForm } from './RatingForm';
import type { Rating } from '../../types/rating';

interface RatingEligibilityProps {
  businessId: string;
  appointmentId: string;
  appointmentDetails?: {
    date: string;
    time: string;
    serviceName: string;
    customerName: string;
  };
  onRatingSubmitted?: (rating: Rating) => void;
  className?: string;
}

export const RatingEligibility: React.FC<RatingEligibilityProps> = ({
  businessId,
  appointmentId,
  appointmentDetails,
  onRatingSubmitted,
  className = '',
}) => {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);

  const { eligibility, loading, error, refetch } = useRatingEligibility(businessId, appointmentId);

  const handleRatingSubmitted = (rating: Rating) => {
    setHasSubmittedRating(true);
    setShowRatingForm(false);
    if (onRatingSubmitted) {
      onRatingSubmitted(rating);
    }
  };

  const handleStartRating = () => {
    setShowRatingForm(true);
  };

  const handleCancelRating = () => {
    setShowRatingForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('tr-TR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-semibold text-red-900">
            Değerlendirme Durumu Kontrol Edilemiyor
          </h3>
        </div>
        <p className="text-red-700 mb-4">
          {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!eligibility) {
    return null;
  }

  // If user has already submitted a rating
  if (hasSubmittedRating) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-green-900">
            Değerlendirmeniz İçin Teşekkürler!
          </h3>
        </div>
        <p className="text-green-700">
          Değerlendirmeniz başarıyla gönderildi. Geri bildiriminiz için teşekkür ederiz!
        </p>
      </div>
    );
  }

  // If user can't rate
  if (!eligibility.canRate) {
    // Check if user has already rated this appointment
    const hasExistingRating = eligibility.existingRating;
    
    if (hasExistingRating) {
      return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-blue-900">
              Değerlendirmeniz
            </h3>
          </div>
          
          {/* Show existing rating */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < hasExistingRating.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900">
                {hasExistingRating.rating}/5
              </span>
            </div>
            
            {hasExistingRating.comment && (
              <p className="text-gray-700 text-sm leading-relaxed">
                "{hasExistingRating.comment}"
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Değerlendirme tarihi: {new Date(hasExistingRating.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>
          
          <p className="text-blue-700 text-sm">
            Bu randevu için zaten değerlendirme yaptınız. Değerlendirmenizi değiştiremezsiniz.
          </p>
        </div>
      );
    }
    
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-yellow-900">
            Değerlendirme Mevcut Değil
          </h3>
        </div>
        <p className="text-yellow-700">
          {eligibility.reason || 'Bu randevu için değerlendirme yapamazsınız.'}
        </p>
      </div>
    );
  }

  // If user can rate and form is not shown
  if (!showRatingForm) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Deneyiminizi Değerlendirin
          </h3>
        </div>

        {appointmentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Randevu Detayları</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {formatDate(appointmentDetails.date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {formatTime(appointmentDetails.time)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {appointmentDetails.customerName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {appointmentDetails.serviceName}
                </span>
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-700 mb-4">
          Deneyiminiz nasıldı? Geri bildiriminiz hizmetlerimizi geliştirmemize yardımcı olur.
        </p>

        <button
          onClick={handleStartRating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Star className="w-4 h-4" />
          Yorum Yaz
        </button>
      </div>
    );
  }

  // Rating form
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Yorum Yaz
        </h3>
        <button
          onClick={handleCancelRating}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <RatingForm
        businessId={businessId}
        appointmentId={appointmentId}
        onRatingSubmitted={handleRatingSubmitted}
        onCancel={handleCancelRating}
      />
    </div>
  );
};

export default RatingEligibility;
