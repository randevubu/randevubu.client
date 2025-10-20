'use client';

/**
 * Google Map Embed Component
 * 
 * Reusable component for embedding Google Maps using coordinates or Place ID.
 * Prioritizes coordinate-based embedding for maximum accuracy.
 */

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

export interface GoogleMapEmbedProps {
  latitude?: number;
  longitude?: number;
  placeId?: string;
  businessName?: string;
  width?: string | number;
  height?: string | number;
  zoom?: number;
  showOpenInMapsLink?: boolean;
  className?: string;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  latitude,
  longitude,
  placeId,
  businessName,
  width = '100%',
  height = 450,
  zoom = 17,
  showOpenInMapsLink = true,
  className = '',
}) => {
  // Generate embed URL with coordinates priority
  const getEmbedUrl = (): string => {
    // Priority 1: Use coordinates if available (most reliable)
    if (latitude && longitude) {
      return `https://maps.google.com/maps?q=${latitude},${longitude}&output=embed&z=${zoom}`;
    }

    // Priority 2: Use Place ID if available
    if (placeId) {
      // Check if it's a CID format (hex format with colon)
      if (placeId.includes('0x') && placeId.includes(':')) {
        // Convert hex CID to decimal
        const cidParts = placeId.split(':');
        // CID format: 0xhex1:0xhex2 - use the second part
        const hexCid = cidParts[1]?.replace('0x', '');

        if (!hexCid) {
          return '';
        }

        try {
          const decimalCid = parseInt(hexCid, 16);

          // Validate conversion
          if (isNaN(decimalCid) || decimalCid <= 0) {
            return '';
          }

          return `https://maps.google.com/maps?cid=${decimalCid}&output=embed`;
        } catch (e) {
          return '';
        }
      }

      // Standard Place ID format (ChIJ...)
      return `https://maps.google.com/maps?q=place_id:${placeId}&output=embed`;
    }

    return '';
  };

  // Generate link to open in Google Maps
  // For business profile links, prioritize Place ID over coordinates
  const getMapsUrl = (): string => {
    // Priority 1: Use Place ID if available (shows business profile)
    if (placeId) {
      if (placeId.includes('0x') && placeId.includes(':')) {
        const cidParts = placeId.split(':');
        const hexCid = cidParts[1]?.replace('0x', '');

        if (!hexCid) {
          return 'https://www.google.com/maps';
        }

        try {
          const decimalCid = parseInt(hexCid, 16);

          if (isNaN(decimalCid) || decimalCid <= 0) {
            return 'https://www.google.com/maps';
          }

          return `https://www.google.com/maps?cid=${decimalCid}`;
        } catch (e) {
          return 'https://www.google.com/maps';
        }
      }
      return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    }

    // Priority 2: Fallback to coordinates (shows generic location)
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    return '';
  };

  const embedUrl = getEmbedUrl();
  const mapsUrl = getMapsUrl();

  // If no valid location data, show placeholder
  if (!embedUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500 p-4">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No location data available</p>
          <p className="text-xs mt-1">Add coordinates or Place ID to display map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`google-map-embed-container ${className}`}>
      {/* Coordinate indicator (if using coordinates) */}
      {latitude && longitude && (
        <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>Using precise coordinate-based location ({latitude.toFixed(6)}, {longitude.toFixed(6)})</span>
        </div>
      )}

      {/* Embed iframe */}
      <div className="relative rounded-lg overflow-hidden border border-gray-300">
        <iframe
          src={embedUrl}
          width={width}
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={businessName ? `Map of ${businessName}` : 'Business location map'}
        />
      </div>

      {/* Open in Google Maps link */}
      {showOpenInMapsLink && mapsUrl && (
        <div className="mt-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            <MapPin className="w-4 h-4" />
            Open in Google Maps
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

export default GoogleMapEmbed;

