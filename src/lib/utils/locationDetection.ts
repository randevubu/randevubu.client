/**
 * Frontend location detection utility
 * Detects user's city using IP geolocation service
 */

export interface DetectedLocation {
  city: string;
  state: string;
  country: string;
  countryCode: string;
}

/**
 * Detect user's location using IP geolocation
 * Falls back to Istanbul if detection fails or user is not in Turkey
 */
export async function detectUserCity(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    
    // Only use detected city if it's in Turkey
    if (data.city && data.country_code === 'TR') {
      return data.city;
    }
    
    // Fallback to Istanbul if not in Turkey or detection fails
    return 'Istanbul';
  } catch (error) {
    console.warn('Location detection failed, using Istanbul as fallback:', error);
    return 'Istanbul';
  }
}

