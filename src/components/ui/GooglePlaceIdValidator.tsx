'use client';

/**
 * Google Place ID Validator Component
 * 
 * Helps validate and fix Google Place ID formats.
 * Shows warnings for invalid Place IDs and provides guidance.
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ExternalLink, MapPin } from 'lucide-react';

interface GooglePlaceIdValidatorProps {
  placeId: string;
  businessName?: string;
  businessAddress?: string;
  onValidPlaceId?: (placeId: string) => void;
  className?: string;
}

export const GooglePlaceIdValidator: React.FC<GooglePlaceIdValidatorProps> = ({
  placeId,
  businessName,
  businessAddress,
  onValidPlaceId,
  className = '',
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [suggestedPlaceId, setSuggestedPlaceId] = useState<string>('');

  useEffect(() => {
    validatePlaceId(placeId);
  }, [placeId]);

  const validatePlaceId = (id: string) => {
    if (!id) {
      setIsValid(false);
      setValidationMessage('No Place ID provided');
      return;
    }

    // Check for valid Google Place ID formats
    const validFormats = [
      /^ChIJ[a-zA-Z0-9_-]+$/, // Standard Place ID format
      /^[a-zA-Z0-9_-]{20,}$/, // Long alphanumeric format
      /^0x[a-fA-F0-9]+:0x[a-fA-F0-9]+$/, // CID format (Customer ID) - both parts start with 0x
    ];

    const isValidFormat = validFormats.some(pattern => pattern.test(id));
    
    if (isValidFormat) {
      setIsValid(true);
      if (id.includes('0x') && id.includes(':')) {
        setValidationMessage('Valid CID (Customer ID) format');
      } else {
        setValidationMessage('Valid Google Place ID format');
      }
    } else {
      setIsValid(false);
      setValidationMessage('Invalid Google Place ID format. Should be a Place ID (ChIJ...), CID (0x...:0x...), or long alphanumeric string.');
      
      // Try to suggest a corrected format
      if (id.includes('0x') || id.includes(':')) {
        setSuggestedPlaceId('This appears to be a CID format. Make sure it follows the pattern: 0x[hex]:0x[hex]');
      }
    }
  };

  const getGoogleMapsSearchUrl = () => {
    const searchQuery = businessName && businessAddress 
      ? `${businessName}, ${businessAddress}`
      : businessName || businessAddress || 'business location';
    
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
  };

  const getPlaceIdFromUrl = () => {
    // If it's a CID format, convert to decimal and use cid parameter
    if (placeId.includes('0x') && placeId.includes(':')) {
      const cidParts = placeId.split(':');
      // CID format: 0xhex1:0xhex2
      // The second part is typically used as the CID
      const hexCid = cidParts[1]?.replace('0x', '');
      if (!hexCid) {
        return `https://www.google.com/maps`;
      }
      try {
        const decimalCid = parseInt(hexCid, 16);
        // Validate the conversion
        if (isNaN(decimalCid) || decimalCid <= 0) {
          return `https://www.google.com/maps`;
        }
        return `https://www.google.com/maps?cid=${decimalCid}`;
      } catch (e) {
        return `https://www.google.com/maps`;
      }
    }
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  };

  const getEmbedUrl = () => {
    // If it's a CID format, convert to decimal and use cid parameter
    if (placeId.includes('0x') && placeId.includes(':')) {
      const cidParts = placeId.split(':');
      const hexCid = cidParts[1].replace('0x', '');
      try {
        const decimalCid = parseInt(hexCid, 16);
        return `https://maps.google.com/maps?cid=${decimalCid}&output=embed`;
      } catch (e) {
      }
    }
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=place_id:${placeId}`;
  };

  const getDecimalCid = () => {
    if (placeId.includes('0x') && placeId.includes(':')) {
      const cidParts = placeId.split(':');
      const hexCid = cidParts[1].replace('0x', '');
      try {
        return parseInt(hexCid, 16).toString();
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Place ID Status */}
      <div className={`p-4 rounded-lg border ${
        isValid === true 
          ? 'bg-green-50 border-green-200' 
          : isValid === false 
            ? 'bg-red-50 border-red-200' 
            : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start gap-3">
          {isValid === true ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          ) : isValid === false ? (
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          ) : (
            <div className="w-5 h-5 bg-gray-400 rounded-full mt-0.5" />
          )}
          
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              Google Place ID Status
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {validationMessage}
            </p>
            
            <div className="bg-gray-100 rounded p-2 font-mono text-sm break-all">
              {placeId || 'No Place ID'}
            </div>
          </div>
        </div>
      </div>

      {/* Invalid Place ID Help */}
      {isValid === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            How to Fix This
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>
              Go to{' '}
              <a 
                href={getGoogleMapsSearchUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Search for your business: "{businessName || 'Your Business Name'}"</li>
            <li>Click on your business listing</li>
            <li>Look at the URL - it should contain a <code>place_id</code> parameter</li>
            <li>Copy the Place ID (it should start with "ChIJ")</li>
            <li>Update your Google integration settings with the correct Place ID</li>
          </ol>
        </div>
      )}

      {/* CID Info */}
      {placeId && getDecimalCid() && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2">
            CID Information
          </h4>
          <div className="space-y-2 text-sm text-purple-700">
            <div>
              <span className="font-medium">Hex Format:</span>
              <div className="bg-white rounded p-2 font-mono text-xs break-all mt-1">
                {placeId}
              </div>
            </div>
            <div>
              <span className="font-medium">Decimal Format:</span>
              <div className="bg-white rounded p-2 font-mono text-xs break-all mt-1">
                {getDecimalCid()}
              </div>
            </div>
            <div>
              <span className="font-medium">Embed URL:</span>
              <div className="bg-white rounded p-2 font-mono text-xs break-all mt-1">
                {getEmbedUrl()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Current Place ID */}
      {placeId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            Test Current Place ID
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            Click the button below to test if your current Place ID works on Google Maps:
          </p>
          <a
            href={getPlaceIdFromUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Test on Google Maps
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Test Embed */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700 mb-2 font-medium">Test Embed Preview:</p>
            <iframe
              src={getEmbedUrl()}
              width="100%"
              height="200"
              frameBorder="0"
              allowFullScreen
              title="Google Maps Embed Test"
              className="rounded-md border border-blue-300"
              onError={(e) => {
              }}
              onLoad={() => {
              }}
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-blue-600 font-semibold">
                ⚠️ Important: Check if the map shows YOUR business location
              </p>
              <p className="text-xs text-blue-600">
                • If the map is blank or shows a different location, the CID is incorrect
              </p>
              <p className="text-xs text-blue-600">
                • If the map shows the correct location, the CID is working!
              </p>
              <p className="text-xs text-blue-600">
                • Try clicking "Test on Google Maps" to verify in a new tab
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Valid Place ID Success */}
      {isValid === true && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800">
              Place ID Format is Valid
            </h4>
          </div>
          <p className="text-sm text-green-700 mb-3">
            The format is correct, but please verify it points to YOUR business:
          </p>
          <div className="bg-yellow-50 border border-yellow-300 rounded p-3 space-y-2">
            <p className="text-sm text-yellow-800 font-semibold">
              🔍 How to verify this is the correct Place ID:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
              <li>Click the "Test on Google Maps" button above</li>
              <li>Check if it opens YOUR business (correct name, location, photos)</li>
              <li>If it shows a different business or no business, you need a new Place ID</li>
              <li>To get the correct Place ID:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Search for your business on <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a></li>
                  <li>Click on your business listing</li>
                  <li>Copy the URL and look for "place_id" or "cid" parameter</li>
                  <li>Use that in your Google integration settings</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default GooglePlaceIdValidator;
