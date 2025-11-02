'use client';

/**
 * Rating Form Component
 * 
 * Form for submitting ratings with validation and error handling.
 * Follows the established UI patterns in the codebase.
 */

import React, { useState, useEffect } from 'react';
import { Star, Send, X, AlertCircle } from 'lucide-react';
import { useRatingSubmission } from '../../lib/hooks/useRatings';
import { RATING_CONSTANTS } from '../../types/rating';
import type { RatingFormProps, RatingFormData, RatingFormErrors, SubmitRatingRequest } from '../../types/rating';

export const RatingForm: React.FC<RatingFormProps> = ({
  businessId,
  appointmentId,
  onRatingSubmitted,
  onCancel,
  className = '',
}) => {
  const [formData, setFormData] = useState<RatingFormData>({
    rating: 0,
    comment: '',
    isAnonymous: false,
  });
  const [errors, setErrors] = useState<RatingFormErrors>({});
  const [isValid, setIsValid] = useState(false);

  const { submitRating, isSubmitting, error } = useRatingSubmission();

  // Validate form data
  useEffect(() => {
    const newErrors: RatingFormErrors = {};
    
    if (formData.rating < RATING_CONSTANTS.MIN_RATING || formData.rating > RATING_CONSTANTS.MAX_RATING) {
      newErrors.rating = 'Lütfen bir değerlendirme seçin';
    }
    
    if (formData.comment.length > RATING_CONSTANTS.MAX_COMMENT_LENGTH) {
      newErrors.comment = `Yorum ${RATING_CONSTANTS.MAX_COMMENT_LENGTH} karakter veya daha az olmalıdır`;
    }
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0 && formData.rating > 0);
  }, [formData]);

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    // Clear rating error when user selects a rating
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: undefined }));
    }
  };

  const handleCommentChange = (comment: string) => {
    setFormData(prev => ({ ...prev, comment }));
    // Clear comment error when user types
    if (errors.comment) {
      setErrors(prev => ({ ...prev, comment: undefined }));
    }
  };

  const handleAnonymousChange = (isAnonymous: boolean) => {
    setFormData(prev => ({ ...prev, isAnonymous }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || isSubmitting) return;

    try {
      const rating = await submitRating(businessId, {
        appointmentId,
        rating: formData.rating,
        comment: formData.comment.trim() || undefined,
        isAnonymous: formData.isAnonymous,
      } as SubmitRatingRequest);

      onRatingSubmitted(rating);
      
      // Reset form
      setFormData({
        rating: 0,
        comment: '',
        isAnonymous: false,
      });
    } catch (err) {
      console.error('Error submitting rating:', err);
      setErrors(prev => ({ 
        ...prev, 
        general: 'Değerlendirme gönderilemedi. Lütfen tekrar deneyin.' 
      }));
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Reset form
      setFormData({
        rating: 0,
        comment: '',
        isAnonymous: false,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Rating Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deneyiminizi değerlendirin *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`transition-all duration-200 hover:scale-110 ${
                star <= formData.rating
                  ? 'text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
              onClick={() => handleRatingChange(star)}
              disabled={isSubmitting}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= formData.rating ? 'fill-current' : ''
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.rating}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Yorum (isteğe bağlı)
        </label>
        <textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          maxLength={RATING_CONSTANTS.MAX_COMMENT_LENGTH}
          placeholder="Deneyiminizi bizimle paylaşın..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center">
          <small className="text-gray-500">
            {formData.comment.length}/{RATING_CONSTANTS.MAX_COMMENT_LENGTH} karakter
          </small>
          {errors.comment && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.comment}
            </p>
          )}
        </div>
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center gap-2">
        <input
          id="anonymous"
          type="checkbox"
          checked={formData.isAnonymous}
          onChange={(e) => handleAnonymousChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isSubmitting}
        />
        <label htmlFor="anonymous" className="text-sm text-gray-700">
          Anonim olarak gönder
        </label>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.general}
          </p>
        </div>
      )}

      {/* API Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Değerlendirmeyi Gönder
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-4 h-4" />
            İptal
          </button>
        )}
      </div>
    </form>
  );
};

export default RatingForm;
