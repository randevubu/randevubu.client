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

// Mapping of districts/neighborhoods to their main cities
// Some IP geolocation services return district names instead of city names
const DISTRICT_TO_CITY_MAP: Record<string, string> = {
  'yildirim': 'bursa',
  'nilüfer': 'bursa',
  'osmangazi': 'bursa',
  'inegöl': 'bursa',
  'kayapa': 'istanbul',
  'sultangazi': 'istanbul',
  'çatalca': 'istanbul',
  'silivri': 'istanbul',
  'beşiktaş': 'istanbul',
  'fatih': 'istanbul',
  'beyoğlu': 'istanbul',
  'ataşehir': 'istanbul',
  'bağcılar': 'istanbul',
  'bahçelievler': 'istanbul',
  'bakırköy': 'istanbul',
  'başakşehir': 'istanbul',
  'bayrampaşa': 'istanbul',
  'beşiktaş': 'istanbul',
  'beylikdüzü': 'istanbul',
  'beyoğlu': 'istanbul',
  'büyükçekmece': 'istanbul',
  'çankırı': 'ankara',
  'çinarcık': 'yalova',
  'adapazarı': 'sakarya',
  'izmit': 'kocaeli',
  'darıca': 'kocaeli',
  'gebze': 'kocaeli',
};

// Valid city values from TURKISH_CITIES
const VALID_CITIES = new Set([
  'adiyaman', 'afyon', 'agri', 'aksaray', 'amasya', 'ankara', 'antalya', 'ardahan',
  'artvin', 'aydin', 'balikesir', 'bartin', 'batman', 'bayburt', 'bilecik', 'bitlis',
  'bolu', 'bursa', 'cankiri', 'corum', 'denizli', 'diyarbakir', 'duzce', 'edirne',
  'elazig', 'erzincan', 'erzurum', 'eskisehir', 'gaziantep', 'giresun', 'gumushane',
  'hakkari', 'hatay', 'igdir', 'istanbul', 'izmir', 'izmit', 'kahramanmaras', 'karabuk',
  'karaman', 'kars', 'kastamonu', 'kayseri', 'kilis', 'kirklareli', 'kirsehir', 'konya',
  'kutahya', 'malatya', 'manisa', 'mardin', 'mersin', 'mugla', 'mus', 'nevsehir', 'nigde',
  'ordu', 'osmaniye', 'rize', 'sakarya', 'samsun', 'sanliurfa', 'siirt', 'sinop', 'sirnak',
  'sivas', 'tekirdag', 'tokat', 'trabzon', 'van', 'yalova', 'yozgat', 'zonguldak'
]);

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
      const detectedCityName = data.city.toLowerCase();
      
      // Check if detected location is a district that should be mapped to a city
      if (DISTRICT_TO_CITY_MAP[detectedCityName]) {
        return DISTRICT_TO_CITY_MAP[detectedCityName];
      }
      
      // Check if the detected city is valid
      if (VALID_CITIES.has(detectedCityName)) {
        return detectedCityName;
      }
      
      // Return original city name as fallback
      return data.city;
    }
    
    // Fallback to Istanbul if not in Turkey or detection fails
    return 'Istanbul';
  } catch (error) {
    console.warn('Location detection failed, using Istanbul as fallback:', error);
    return 'Istanbul';
  }
}

/**
 * Check if a city name is valid (exists in the TURKISH_CITIES list)
 * Case-insensitive comparison
 */
export function isValidCity(cityName: string): boolean {
  return VALID_CITIES.has(cityName.toLowerCase());
}

