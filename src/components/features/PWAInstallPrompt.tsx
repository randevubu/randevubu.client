'use client';

import { useState } from 'react';
import { usePWAInstall } from '../../lib/hooks/usePWAInstall';

interface PWAInstallPromptProps {
  className?: string;
  variant?: 'banner' | 'card' | 'button';
  showDismiss?: boolean;
}

export default function PWAInstallPrompt({ 
  className = '',
  variant = 'banner',
  showDismiss = true 
}: PWAInstallPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    canInstall, 
    installApp, 
    getIOSInstructions 
  } = usePWAInstall();

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
    } else {
      const success = await installApp();
      if (success) {
        setIsDismissed(true);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleInstall}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${className}`}
      >
        📱 Uygulamayı Yükle
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              RandevuBu'yu Yükle
            </h3>
            <p className="text-gray-600 mb-4">
              Daha hızlı erişim ve push bildirimleri için uygulamayı cihazınıza yükleyin.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isIOS ? 'Nasıl Yüklenir?' : 'Şimdi Yükle'}
              </button>
              
              {showDismiss && (
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sonra
                </button>
              )}
            </div>
          </div>
        </div>

        {/* iOS Installation Instructions Modal */}
        {showInstructions && isIOS && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                iOS'ta Nasıl Yüklenir
              </h3>
              
              <ol className="space-y-3 mb-6">
                {getIOSInstructions().map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Anladım
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Banner variant (default)
  return (
    <>
      <div className={`bg-blue-50 border-l-4 border-blue-400 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="text-xl">📱</span>
            </div>
            <div>
              <p className="text-blue-800 font-medium">
                RandevuBu'yu cihazınıza yükleyin
              </p>
              <p className="text-blue-700 text-sm">
                Daha hızlı erişim ve bildirimler için
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              {isIOS ? 'Nasıl?' : 'Yükle'}
            </button>
            
            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* iOS Installation Instructions Modal */}
      {showInstructions && isIOS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">iOS'ta Nasıl Yüklenir</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">📱</span>
                  <span className="font-medium">Safari'de Açın</span>
                </div>
                <p className="text-sm text-gray-600">
                  Bu sayfayı Safari tarayıcısında açmanız gerekiyor
                </p>
              </div>
              
              <ol className="space-y-3">
                {getIOSInstructions().slice(1).map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 2}
                    </span>
                    <span className="text-gray-700 text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            <button
              onClick={() => {
                setShowInstructions(false);
                setIsDismissed(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}