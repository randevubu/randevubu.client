'use client';

/**
 * Rating Display Component
 * 
 * Displays star ratings with optional count and interactive functionality.
 * Follows the established UI patterns in the codebase.
 */

import React from 'react';
import { Star } from 'lucide-react';
import type { RatingDisplayProps } from '../../types/rating';

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  totalRatings = 0,
  showCount = true,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      let starType: 'full' | 'half' | 'empty' = 'empty';
      
      if (i <= fullStars) {
        starType = 'full';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starType = 'half';
      }

      stars.push(
        <button
          key={i}
          type="button"
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
          onClick={() => handleStarClick(i)}
          disabled={!interactive}
          aria-label={`${i} star${i !== 1 ? 's' : ''}`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              starType === 'full'
                ? 'text-yellow-400 fill-yellow-400'
                : starType === 'half'
                ? 'text-yellow-400 fill-yellow-400/50'
                : 'text-gray-300'
            }`}
          />
        </button>
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>
      
      {showCount && totalRatings > 0 && (
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>
          ({totalRatings})
        </span>
      )}
      
      {!showCount && (
        <span className={`text-gray-600 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
