'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  promptEvent: BeforeInstallPromptEvent | null;
  isIOS: boolean;
  canInstall: boolean;
}

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    promptEvent: null,
    isIOS: false,
    canInstall: false,
  });

  useEffect(() => {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        // @ts-ignore
                        window.navigator.standalone === true;

    // Check if app is already installed
    const isInstalled = isStandalone;

    setState(prev => ({
      ...prev,
      isIOS,
      isStandalone,
      isInstalled,
      canInstall: !isInstalled && (isIOS || 'BeforeInstallPromptEvent' in window),
    }));

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      
      setState(prev => ({
        ...prev,
        isInstallable: true,
        promptEvent,
        canInstall: true,
      }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        promptEvent: null,
        canInstall: false,
      }));
      toast.success('Uygulama başarıyla yüklendi!');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install the app
  const installApp = async (): Promise<boolean> => {
    if (!state.promptEvent) {
      toast.error('Yükleme şu anda mevcut değil');
      return false;
    }

    try {
      await state.promptEvent.prompt();
      const choiceResult = await state.promptEvent.userChoice;
      
      setState(prev => ({
        ...prev,
        isInstallable: false,
        promptEvent: null,
      }));

      if (choiceResult.outcome === 'accepted') {
        toast.success('Uygulama yükleniyor...');
        return true;
      } else {
        toast.info('Yükleme iptal edildi');
        return false;
      }
    } catch (error) {
      console.error('Error during app installation:', error);
      toast.error('Yükleme sırasında hata oluştu');
      return false;
    }
  };

  // Get installation instructions for iOS
  const getIOSInstructions = (): string[] => {
    return [
      'Safari tarayıcısında bu sayfayı açın',
      'Alt menüdeki paylaş butonuna (↗) dokunun',
      '"Ana Ekrana Ekle" seçeneğini bulun',
      '"Ekle" butonuna dokunun'
    ];
  };

  // Check if the app can be updated
  const checkForUpdates = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
        
        // Listen for update response
        const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
            resolve(true);
          } else if (event.data && event.data.type === 'NO_UPDATE_AVAILABLE') {
            resolve(false);
          }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          navigator.serviceWorker.removeEventListener('message', handleMessage);
          resolve(false);
        }, 5000);
      } else {
        resolve(false);
      }
    });
  };

  return {
    ...state,
    installApp,
    getIOSInstructions,
    checkForUpdates,
  };
}