/**
 * Utility functions for resolving Google Maps short links and extracting place IDs
 */

export interface ShortLinkResult {
  success: boolean;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  error?: string;
  resolvedUrl?: string;
}

/**
 * Extract coordinates from Google Maps URL
 */
export function extractCoordinatesFromUrl(url: string): { latitude: number; longitude: number } | null {
  // Pattern: @latitude,longitude,zoom
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    return {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2])
    };
  }
  return null;
}

/**
 * Extract place ID from various Google Maps URL formats
 */
export function extractPlaceIdFromUrl(url: string): string | null {
  // Handle different Google Maps URL formats
  const urlPatterns = [
    // New format: https://www.google.com/maps/place/PlaceName/@lat,lng,zoom/data=!3m1!4b1!4m6!3m5!1s0x...!2sChIJ...
    /!2s(Ch[A-Za-z0-9_-]{25,})/,
    // Old format: https://www.google.com/maps/place/PlaceName/@lat,lng,zoom/data=!3m1!4b1!4m6!3m5!1s0x...!1s0x...
    /!1s(0x[A-Za-z0-9]{16}:0x[A-Za-z0-9]{16})/,
    // https://www.google.com/maps/place/?q=place_id:PLACE_ID
    /place_id:(Ch[A-Za-z0-9_-]{25,})/,
    // Direct Place ID in URL (new format)
    /\/place\/(Ch[A-Za-z0-9_-]{25,})/,
    // Alternative search URL patterns (new format)
    /!1s(Ch[A-Za-z0-9_-]{25,})/,
    // CID format in URL (fixed pattern)
    /!1s(0x[A-Za-z0-9]{16}:0x[A-Za-z0-9]{16})/,
  ];

  for (const pattern of urlPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Handle Google Search URLs with gs_ssp parameter
  const gsSspMatch = url.match(/gs_ssp=([^&]*)/);
  if (gsSspMatch) {
    try {
      const decoded = decodeURIComponent(gsSspMatch[1]);
      // Look for Place ID in the decoded string (must start with Ch)
      const placeIdMatch = decoded.match(/(Ch[A-Za-z0-9_-]{25,})/);
      if (placeIdMatch) {
        return placeIdMatch[1];
      }
    } catch (e) {
      // If decoding fails, continue
    }
  }

  return null;
}

/**
 * Resolve a short link to its full URL using a proxy service
 * This uses a CORS proxy to resolve short links
 */
export async function resolveShortLink(shortUrl: string): Promise<ShortLinkResult> {
  try {
    // Check if it's a short link
    if (!shortUrl.includes('goo.gl') && !shortUrl.includes('maps.app.goo.gl') && !shortUrl.includes('bit.ly')) {
      // Not a short link, try to extract place ID and coordinates directly
      const placeId = extractPlaceIdFromUrl(shortUrl);
      const coords = extractCoordinatesFromUrl(shortUrl);
      return {
        success: placeId !== null || coords !== null,
        placeId: placeId || undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        resolvedUrl: shortUrl
      };
    }

    // Use a CORS proxy to resolve the short link
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(shortUrl)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to resolve short link: ${response.status}`);
    }

    const resolvedUrl = await response.text();
    
    // Extract place ID and coordinates from the resolved URL
    const placeId = extractPlaceIdFromUrl(resolvedUrl);
    const coords = extractCoordinatesFromUrl(resolvedUrl);
    
    return {
      success: placeId !== null || coords !== null,
      placeId: placeId || undefined,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      resolvedUrl: resolvedUrl,
      error: (placeId || coords) ? undefined : 'Could not extract place ID or coordinates from resolved URL'
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to resolve short link: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Alternative method using a different proxy service
 */
export async function resolveShortLinkAlternative(shortUrl: string): Promise<ShortLinkResult> {
  try {
    // Check if it's a short link
    if (!shortUrl.includes('goo.gl') && !shortUrl.includes('maps.app.goo.gl') && !shortUrl.includes('bit.ly')) {
      // Not a short link, try to extract place ID and coordinates directly
      const placeId = extractPlaceIdFromUrl(shortUrl);
      const coords = extractCoordinatesFromUrl(shortUrl);
      return {
        success: placeId !== null || coords !== null,
        placeId: placeId || undefined,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        resolvedUrl: shortUrl
      };
    }

    // Use a different CORS proxy
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${shortUrl}`;
    
    const response = await fetch(proxyUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to resolve short link: ${response.status}`);
    }

    const resolvedUrl = response.url;
    
    // Extract place ID and coordinates from the resolved URL
    const placeId = extractPlaceIdFromUrl(resolvedUrl);
    const coords = extractCoordinatesFromUrl(resolvedUrl);
    
    return {
      success: placeId !== null || coords !== null,
      placeId: placeId || undefined,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      resolvedUrl: resolvedUrl,
      error: (placeId || coords) ? undefined : 'Could not extract place ID or coordinates from resolved URL'
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to resolve short link: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Main function to extract place ID from any Google Maps URL (including short links)
 */
export async function extractPlaceIdFromAnyUrl(url: string): Promise<ShortLinkResult> {
  // First, try to extract directly if it's not a short link
  if (!url.includes('goo.gl') && !url.includes('maps.app.goo.gl') && !url.includes('bit.ly')) {
    const placeId = extractPlaceIdFromUrl(url);
    const coords = extractCoordinatesFromUrl(url);
    return {
      success: placeId !== null || coords !== null,
      placeId: placeId || undefined,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      resolvedUrl: url,
      error: (placeId || coords) ? undefined : 'Could not extract place ID or coordinates from URL'
    };
  }

  // Try the first proxy method
  try {
    const result = await resolveShortLink(url);
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.warn('First proxy method failed:', error);
  }

  // Try the alternative proxy method
  try {
    const result = await resolveShortLinkAlternative(url);
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.warn('Alternative proxy method failed:', error);
  }

  return {
    success: false,
    error: 'Could not resolve short link or extract place ID. Please try using the full Google Maps URL instead.'
  };
}

/**
 * Validate if a URL is a Google Maps short link
 */
export function isGoogleMapsShortLink(url: string): boolean {
  return url.includes('goo.gl') || url.includes('maps.app.goo.gl') || url.includes('bit.ly');
}

/**
 * Get helpful instructions for users about short links
 */
export function getShortLinkInstructions(): string {
  return `Short links (goo.gl, maps.app.goo.gl) can be resolved, but for best results:

1. Open the short link in your browser
2. Wait for it to redirect to the full Google Maps URL
3. Copy the full URL from your browser's address bar
4. Paste that full URL here

This ensures we can extract the place ID reliably.`;
}
