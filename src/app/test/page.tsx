'use client';

import { useState, useEffect } from 'react';
import { useServiceWorker } from '../../lib/hooks/useServiceWorker';
import { notificationService } from '../../lib/services/notifications';
import toast, { Toaster } from 'react-hot-toast';

export default function SimpleTestPage() {
  const [status, setStatus] = useState<string[]>([]);
  const { registration, isSupported, isActive } = useServiceWorker();

  useEffect(() => {
    if (registration && isActive) {
      initTest();
    }
  }, [registration, isActive]);

  const log = (message: string) => {
    console.log(message);
    setStatus(prev => [...prev, message]);
  };

  const initTest = async () => {
    log('🚀 Starting PWA test...');
    log(`✅ Service Worker: ${isSupported ? 'Supported' : 'Not supported'}`);
    log(`✅ SW Registration: ${registration ? 'Ready' : 'Not ready'}`);
    log(`✅ SW Active: ${isActive ? 'Active' : 'Not active'}`);

    try {
      const initialized = await notificationService.initialize(registration!);
      log(`✅ Notifications: ${initialized ? 'Initialized' : 'Failed'}`);
    } catch (error) {
      log(`❌ Error: ${error}`);
    }
  };

  const testNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      log(`🔔 Permission: ${permission}`);
      toast.success(`Permission: ${permission}`);
    } catch (error) {
      log(`❌ Permission error: ${error}`);
      toast.error('Permission failed');
    }
  };

  const testSubscribe = async () => {
    try {
      await notificationService.subscribe();
      log('✅ Subscribed to notifications');
      toast.success('Subscribed!');
    } catch (error) {
      log(`❌ Subscribe error: ${error}`);
      toast.error('Subscribe failed');
    }
  };

  const testNotification = async () => {
    try {
      await notificationService.sendTestNotification({
        title: 'Test PWA Notification',
        body: 'Hello from RandevuBu PWA! 🎉'
      });
      log('✅ Test notification sent');
      toast.success('Notification sent!');
    } catch (error) {
      log(`❌ Notification error: ${error}`);
      toast.error('Notification failed');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PWA Simple Test</h1>
      
      {/* Status */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Status:</h2>
        <div className="text-sm space-y-1 font-mono">
          {status.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-3">
        <button
          onClick={testNotificationPermission}
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          1. Request Notification Permission
        </button>
        
        <button
          onClick={testSubscribe}
          className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          2. Subscribe to Push Notifications
        </button>
        
        <button
          onClick={testNotification}
          className="w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          3. Send Test Notification
        </button>
        
        <button
          onClick={() => setStatus([])}
          className="w-full p-3 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Log
        </button>
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-yellow-50 rounded border">
        <h3 className="font-semibold text-yellow-800">How to Test:</h3>
        <ol className="text-sm text-yellow-700 mt-2 space-y-1">
          <li>1. Click buttons in order</li>
          <li>2. Check browser console for details</li>
          <li>3. Allow notifications when prompted</li>
          <li>4. Check if notification appears</li>
          <li>5. Make sure backend is running on localhost:3001</li>
        </ol>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}