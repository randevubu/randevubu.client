'use client';

/**
 * Google Integration Settings Component
 * 
 * Settings panel for managing Google Place ID and integration preferences.
 * Follows the established UI patterns in the codebase.
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Save, 
  RefreshCw,
  Globe,
  Link,
  Settings
} from 'lucide-react';
import { useGoogleIntegration } from '../../lib/hooks/useRatings';
import type { GoogleIntegrationSettingsProps, GoogleIntegration } from '../../types/rating';

export const GoogleIntegrationSettings: React.FC<GoogleIntegrationSettingsProps> = ({
  businessId,
  currentSettings,
  onSettingsUpdated,
  className = '',
}) => {
  const [placeId, setPlaceId] = useState(currentSettings?.googlePlaceId || '');
  const [enabled, setEnabled] = useState(currentSettings?.googleIntegrationEnabled || false);
  const [isValidPlaceId, setIsValidPlaceId] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [inputType, setInputType] = useState<'placeId' | 'url'>('placeId');

  const {
    integration,
    loading,
    error,
    updateIntegration,
    isUpdating,
    refetch,
  } = useGoogleIntegration(businessId);

  // Update local state when integration data changes
  useEffect(() => {
    if (integration) {
      setPlaceId(integration.googlePlaceId || '');
      setEnabled(integration.googleIntegrationEnabled);
    }
  }, [integration]);

  // Validate Google Place ID format or extract from URL
  useEffect(() => {
    let isCancelled = false;
    
    const validateInput = async () => {
      if (placeId.trim()) {
        const trimmedInput = placeId.trim();
        
        // Check if it's a Google Maps URL
        if (isGoogleMapsUrl(trimmedInput)) {
          setValidationMessage('URL işleniyor...');
          try {
            const extractedPlaceId = await extractPlaceIdFromUrl(trimmedInput);
            
            // Check if component is still mounted and not cancelled
            if (isCancelled) return;
            
            if (extractedPlaceId) {
              setIsValidPlaceId(true);
              setValidationMessage(`Place ID başarıyla çıkarıldı: ${extractedPlaceId.substring(0, 10)}...`);
              setInputType('url');
            } else {
              setIsValidPlaceId(false);
              if (trimmedInput.includes('google.com/search')) {
                setValidationMessage('Bu bir arama sonuçları sayfası. Place ID çıkarabilmek için önce işletme listelemesine tıklayıp o sayfanın URL\'sini kopyalayın.');
              } else if (trimmedInput.includes('goo.gl') || trimmedInput.includes('maps.app.goo.gl')) {
                setValidationMessage('Kısa URL\'ler (goo.gl) desteklenmiyor. Lütfen Google Haritalar\'da işletmenizi bulup "Paylaş" butonuna tıklayarak tam URL\'yi kopyalayın.');
              } else {
                setValidationMessage('URL\'den Place ID çıkarılamadı. Lütfen geçerli bir Google Haritalar URL\'si girin.');
              }
              setInputType('url');
            }
          } catch (error) {
            // Check if component is still mounted and not cancelled
            if (isCancelled) return;
            
            setIsValidPlaceId(false);
            setValidationMessage('URL işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setInputType('url');
          }
        } else {
          // Check if it's a direct Place ID
          // Support both new format (Ch...) and old format (0x...)
          const newFormatRegex = /^Ch[A-Za-z0-9_-]{25,}$/;
          const oldFormatRegex = /^0x[A-Za-z0-9]{16}:[A-Za-z0-9]{16}$/;
          const isValid = newFormatRegex.test(trimmedInput) || oldFormatRegex.test(trimmedInput);
          setIsValidPlaceId(isValid);
          setInputType('placeId');
          
          if (isValid) {
            setValidationMessage('Place ID formatı geçerli görünüyor');
          } else {
            setValidationMessage('Geçersiz Place ID formatı. Google Place ID\'leri "Ch" ile başlamalı veya "0x" formatında olmalıdır.');
          }
        }
      } else {
        setIsValidPlaceId(null);
        setValidationMessage('');
      }
    };

    validateInput();
    
    // Cleanup function to prevent state updates after component unmounts
    return () => {
      isCancelled = true;
    };
  }, [placeId]);

  const handleSave = async () => {
    if (!placeId.trim() && enabled) {
      setValidationMessage('Google entegrasyonu etkinleştirildiğinde Place ID veya URL gereklidir');
      return;
    }

    try {
      const inputValue = placeId.trim();
      
      // Send URL directly to backend if it's a Google Maps URL
      // Backend will extract both coordinates and Place ID
      if (isGoogleMapsUrl(inputValue)) {
        await updateIntegration({
          googleUrl: inputValue,
          enabled,
        });
      } else {
        // If it's a direct Place ID, send it as before
        await updateIntegration({
          googlePlaceId: inputValue || undefined,
          enabled,
        });
      }

      if (onSettingsUpdated) {
        onSettingsUpdated({
          googlePlaceId: integration?.googlePlaceId,
          googleIntegrationEnabled: enabled,
          googleLinkedAt: integration?.googleLinkedAt,
          latitude: integration?.latitude,
          longitude: integration?.longitude,
          urls: integration?.urls,
        });
      }
    } catch (err: unknown) {
      console.error('Error updating Google integration:', err);
      
      // Handle backend validation errors
      const { extractApiError, extractErrorMessage } = await import('../../lib/utils/errorExtractor');
      const apiError = extractApiError(err);
      const errorMessage = extractErrorMessage(err, 'Google entegrasyonu güncellenemedi');
      
      if (apiError?.message) {
        setValidationMessage(apiError.message);
      } else if (errorMessage) {
        setValidationMessage(errorMessage);
      } else {
        setValidationMessage('Google entegrasyonu güncellenirken bir hata oluştu.');
      }
    }
  };

  const handlePlaceIdChange = (value: string) => {
    setPlaceId(value);
    if (validationMessage.includes('gereklidir')) {
      setValidationMessage('');
    }
  };

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      setPlaceId('');
      setValidationMessage('');
    }
  };

  // Extract Place ID from Google Maps URL or Search URL (including short links)
  const extractPlaceIdFromUrl = async (url: string): Promise<string | null> => {
    try {
      const { extractPlaceIdFromAnyUrl } = await import('../../lib/utils/shortLinkResolver');
      const result = await extractPlaceIdFromAnyUrl(url);
      
      if (result.success && result.placeId) {
        return result.placeId;
      }
      
      // If it's a short link that failed to resolve, show helpful message
      if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
        setValidationMessage('Short links can be resolved, but for best results, please open the link in your browser and copy the full Google Maps URL.');
        return null;
      }
      
      // For search URLs, we might not find a Place ID directly
      if (url.includes('google.com/search')) {
        setValidationMessage('Please click on your business listing in the search results and copy the full URL from the business details page.');
        return null;
      }
      
      setValidationMessage('Could not extract place ID from this URL. Please make sure you\'re using a valid Google Maps business listing URL.');
      return null;
    } catch (error) {
      console.error('Error extracting place ID:', error);
      setValidationMessage('An error occurred while processing the URL. Please try again.');
      return null;
    }
  };

  // Validate if input is a Google Maps URL or Search URL
  const isGoogleMapsUrl = (input: string): boolean => {
    const urlPatterns = [
      /^https?:\/\/(www\.)?google\.com\/maps/,
      /^https?:\/\/(maps\.)?google\.com/,
      /^https?:\/\/goo\.gl\/maps/,
      /^https?:\/\/maps\.app\.goo\.gl/,
      /^https?:\/\/maps\.google\.com/,
      // Google Search URLs that might contain business listings
      /^https?:\/\/(www\.)?google\.com\/search/,
    ];
    
    return urlPatterns.some(pattern => pattern.test(input.trim()));
  };

  const getPlaceIdHelpUrl = () => {
    return 'https://developers.google.com/maps/documentation/places/web-service/place-id';
  };

  const getGoogleMapsUrl = () => {
    if (placeId.trim()) {
      return `https://www.google.com/maps/place/?q=place_id:${placeId.trim()}`;
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Google Entegrasyonu
          </h3>
          <p className="text-sm text-gray-600">
            İşletmenizi Google Haritalar ve Yorumlar ile bağlayın
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">
              Google Entegrasyonunu Etkinleştir
            </label>
            <p className="text-sm text-gray-600">
              İşletme sayfanızda Google Haritalar ve yorumları gösterin
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Google Place ID or URL Input */}
        {enabled && (
          <div className="space-y-3">
            <div>
              <label htmlFor="placeId" className="block text-sm font-medium text-gray-900 mb-2">
                Google Place ID veya Google Haritalar URL'si *
              </label>
              <div className="relative">
                <input
                  id="placeId"
                  type="text"
                  value={placeId}
                  onChange={(e) => handlePlaceIdChange(e.target.value)}
                  placeholder={inputType === 'url' ? 
                    "https://www.google.com/maps/place/İşletme-Adı/@lat,lng,zoom" : 
                    "ChIJN1t_tDeuEmsRUsoyG83frY4"
                  }
                  disabled={isUpdating}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isValidPlaceId === false ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isValidPlaceId === true && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {isValidPlaceId === false && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              
              {/* Input Type Indicator */}
              {placeId.trim() && (
                <div className="mt-1 flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inputType === 'url' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {inputType === 'url' ? 'URL' : 'Place ID'}
                  </div>
                  {inputType === 'url' && isValidPlaceId && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Otomatik çıkarıldı
                    </span>
                  )}
                </div>
              )}

              {/* Validation Message */}
              {validationMessage && (
                <p className={`text-sm mt-1 flex items-center gap-1 ${
                  isValidPlaceId === true ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isValidPlaceId === true ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {validationMessage}
                </p>
              )}

              {/* Help Text */}
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Google Place ID'nizi nasıl bulursunuz:</p>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-medium text-blue-900 mb-1">Yöntem 1: Google Haritalar URL'si (Önerilen) ✨</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Google'da işletmenizi arayın</li>
                          <li><strong>İşletme listelemenize tıklayın</strong> (sadece arama sonuçları değil)</li>
                          <li>İşletme sayfasının URL'sini kopyalayın</li>
                          <li>Buraya yapıştırın - sistem otomatik olarak koordinatları ve Place ID'yi çıkaracaktır</li>
                        </ol>
                        <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                          <p className="font-medium text-blue-900 mb-1">Örnek URL formatları:</p>
                          <p className="text-blue-800 break-all">• https://www.google.com/maps/place/İşletme-Adı/@lat,lng,zoom</p>
                          <p className="text-blue-800 break-all">• https://maps.google.com/maps/place/...</p>
                        </div>
                        <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                          <p className="font-medium text-yellow-900 mb-1">⚠️ Önemli:</p>
                          <p className="text-yellow-800">Arama sonuçları sayfası URL'si (google.com/search) çalışmaz. İşletme listelemesine tıklayıp o sayfanın URL'sini kullanın.</p>
                          <p className="text-yellow-800 mt-1"><strong>Doğru:</strong> https://www.google.com/maps/place/İşletme-Adı/@lat,lng,zoom</p>
                          <p className="text-yellow-800"><strong>Yanlış:</strong> https://www.google.com/search?gs_ssp=...</p>
                          <p className="text-yellow-800"><strong>Kısa URL'ler:</strong> goo.gl/maps/... veya maps.app.goo.gl/... desteklenmiyor</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 mb-1">Yöntem 2: Doğrudan Place ID</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Google Haritalar'da işletmenizi arayın</li>
                          <li>İşletme listelemenize tıklayın</li>
                          <li>"Paylaş" düğmesine tıklayın</li>
                          <li>URL'den Place ID'yi manuel olarak kopyalayın</li>
                        </ol>
                        <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                          <p className="font-medium text-blue-900 mb-1">Place ID formatı:</p>
                          <p className="text-blue-800">• Yeni format: "Ch" ile başlar (örn: ChIJN1t_tDeuEmsRUsoyG83frY4)</p>
                          <p className="text-blue-800">• Eski format: "0x" ile başlar (örn: 0x14c94904b01833f1:0x3411f4f9a8147194)</p>
                          <p className="text-blue-800">• Her iki format da desteklenir</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <a
                          href={getPlaceIdHelpUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Place ID'ler hakkında daha fazla bilgi edinin
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Link */}
            {placeId.trim() && isValidPlaceId && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700 mb-2">Google Haritalar listelemenizi önizleyin:</p>
                <a
                  href={getGoogleMapsUrl() || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <MapPin className="w-4 h-4" />
                  Google Haritalar'da Görüntüle
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Current Status */}
        {integration && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Mevcut Durum</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>Entegrasyon: {enabled ? 'Etkin' : 'Devre Dışı'}</span>
              </div>
              {integration.latitude && integration.longitude && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Koordinatlar: {integration.latitude.toFixed(6)}, {integration.longitude.toFixed(6)}</span>
                </div>
              )}
              {integration.googleLinkedAt && (
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span>Bağlandı: {new Date(integration.googleLinkedAt).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isUpdating || (enabled && !placeId.trim()) || (enabled && isValidPlaceId === false)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Ayarları Kaydet
              </>
            )}
          </button>

          <button
            onClick={() => refetch()}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {/* Benefits Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Google Entegrasyonunun Faydaları
        </h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• İşletme sayfanızda Google Haritalar konumunuzu gösterin</li>
          <li>• Koordinat-tabanlı harita gösterimi ile tam konum doğruluğu</li>
          <li>• İç değerlendirmelerinizin yanında Google yorumlarını gösterin</li>
          <li>• Google Haritalar ve yorumlara doğrudan bağlantılar sağlayın</li>
          <li>• Ek maliyet yok - ücretsiz Google Embed API kullanır</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleIntegrationSettings;
