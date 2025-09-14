'use client';

import { useState, useEffect } from 'react';
import { useServiceWorker } from '../../lib/hooks/useServiceWorker';
import { notificationService, handleNotificationError } from '../../lib/services/notifications';
import { appointmentService } from '../../lib/services/appointments';
import { usePWAInstall } from '../../lib/hooks/usePWAInstall';
import toast, { Toaster } from 'react-hot-toast';

export default function PWATestPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('Not subscribed');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [testResults, setTestResults] = useState<string[]>([]);

  // PWA Hooks
  const { registration, isSupported, isActive, isRegistered } = useServiceWorker();
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWAInstall();

  useEffect(() => {
    if (registration && isActive) {
      initializeNotificationService();
    }
  }, [registration, isActive]);

  const initializeNotificationService = async () => {
    try {
      const initialized = await notificationService.initialize(registration!);
      setIsInitialized(initialized);
      
      if (initialized) {
        updateStatus();
        addTestResult('✅ Notification service initialized successfully');
      } else {
        addTestResult('❌ Failed to initialize notification service');
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      addTestResult(`❌ Initialization error: ${error}`);
    }
  };

  const updateStatus = () => {
    setPermissionStatus(notificationService.getPermissionStatus());
    setSubscriptionStatus(notificationService.isSubscribed() ? 'Subscribed' : 'Not subscribed');
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    addTestResult('🧪 Starting PWA tests...');
    
    // Test 1: Service Worker
    addTestResult(`Service Worker Supported: ${isSupported ? '✅' : '❌'}`);
    addTestResult(`Service Worker Registered: ${isRegistered ? '✅' : '❌'}`);
    addTestResult(`Service Worker Active: ${isActive ? '✅' : '❌'}`);
    
    // Test 2: PWA Installation
    addTestResult(`PWA Installable: ${isInstallable ? '✅' : '❌'}`);
    addTestResult(`PWA Installed: ${isInstalled ? '✅' : '❌'}`);
    addTestResult(`PWA Standalone: ${isStandalone ? '✅' : '❌'}`);
    
    // Test 3: Notifications
    addTestResult(`Notification Service Initialized: ${isInitialized ? '✅' : '❌'}`);
    addTestResult(`Notification Permission: ${permissionStatus}`);
    addTestResult(`Push Subscription: ${subscriptionStatus}`);
    
    // Test 4: Backend connectivity
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/notifications/push/vapid-key`);
      const isBackendConnected = response.ok;
      addTestResult(`Backend Connection: ${isBackendConnected ? '✅' : '❌'}`);
      
      if (isBackendConnected) {
        const data = await response.json();
        addTestResult(`VAPID Key Available: ${data.success && data.data?.publicKey ? '✅' : '❌'}`);
      }
    } catch (error) {
      addTestResult(`❌ Backend Connection Failed: ${error}`);
    }
    
    addTestResult('🧪 Tests completed!');
  };

  const requestPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      setPermissionStatus(permission);
      updateStatus();
      
      if (permission === 'granted') {
        addTestResult('✅ Notification permission granted');
        toast.success('Notification permission granted!');
      } else {
        addTestResult('❌ Notification permission denied');
        toast.error('Notification permission denied');
      }
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      addTestResult(`❌ Permission request failed: ${errorMessage}`);
      toast.error(errorMessage);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      await notificationService.subscribe();
      updateStatus();
      addTestResult('✅ Successfully subscribed to push notifications');
      toast.success('Subscribed to notifications!');
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      addTestResult(`❌ Subscription failed: ${errorMessage}`);
      toast.error(errorMessage);
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      await notificationService.unsubscribe();
      updateStatus();
      addTestResult('✅ Successfully unsubscribed from push notifications');
      toast.success('Unsubscribed from notifications!');
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      addTestResult(`❌ Unsubscribe failed: ${errorMessage}`);
      toast.error(errorMessage);
    }
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendTestNotification({
        title: 'PWA Test Notification',
        body: 'This is a test notification from your RandevuBu PWA! 🎉'
      });
      addTestResult('✅ Test notification sent');
      toast.success('Test notification sent!');
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      addTestResult(`❌ Test notification failed: ${errorMessage}`);
      toast.error(errorMessage);
    }
  };

  const testAppointmentAPI = async () => {
    try {
      const result = await appointmentService.getNearestAppointmentCurrentHour();
      addTestResult(`✅ Nearest appointment API: ${result.success ? 'Success' : 'No data'}`);
      toast.success('Appointment API test completed');
    } catch (error) {
      addTestResult(`❌ Appointment API failed: ${error}`);
      toast.error('Appointment API test failed');
    }
  };

  const installPWA = async () => {
    try {
      const success = await installApp();
      addTestResult(`PWA Installation: ${success ? '✅ Success' : '❌ Failed'}`);
      if (success) {
        toast.success('PWA installation started!');
      }
    } catch (error) {
      addTestResult(`❌ PWA Installation failed: ${error}`);
      toast.error('PWA installation failed');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">PWA Test Dashboard</h1>
          
          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900">Service Worker</h3>
              <div className="text-sm text-blue-700 mt-2">
                <p>Supported: {isSupported ? '✅' : '❌'}</p>
                <p>Registered: {isRegistered ? '✅' : '❌'}</p>
                <p>Active: {isActive ? '✅' : '❌'}</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900">PWA Status</h3>
              <div className="text-sm text-green-700 mt-2">
                <p>Installable: {isInstallable ? '✅' : '❌'}</p>
                <p>Installed: {isInstalled ? '✅' : '❌'}</p>
                <p>Standalone: {isStandalone ? '✅' : '❌'}</p>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900">Notifications</h3>
              <div className="text-sm text-purple-700 mt-2">
                <p>Initialized: {isInitialized ? '✅' : '❌'}</p>
                <p>Permission: {permissionStatus}</p>
                <p>Status: {subscriptionStatus}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <button
              onClick={runTests}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🧪 Run All Tests
            </button>
            
            {isInstallable && (
              <button
                onClick={installPWA}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                📱 Install PWA
              </button>
            )}
            
            {permissionStatus === 'default' && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                🔔 Request Permission
              </button>
            )}
            
            {permissionStatus === 'granted' && subscriptionStatus === 'Not subscribed' && (
              <button
                onClick={subscribeToNotifications}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                ➕ Subscribe
              </button>
            )}
            
            {subscriptionStatus === 'Subscribed' && (
              <>
                <button
                  onClick={sendTestNotification}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  📬 Test Notification
                </button>
                
                <button
                  onClick={unsubscribeFromNotifications}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  ➖ Unsubscribe
                </button>
              </>
            )}
            
            <button
              onClick={testAppointmentAPI}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              📅 Test Appointments API
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              🗑️ Clear Results
            </button>
          </div>

          {/* Test Results */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Test Results</h3>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p>No test results yet. Click "Run All Tests" to start.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">Testing Instructions</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p><strong>1.</strong> First run "Run All Tests" to check your PWA setup</p>
              <p><strong>2.</strong> If installable, try installing the PWA</p>
              <p><strong>3.</strong> Request notification permission if needed</p>
              <p><strong>4.</strong> Subscribe to notifications and test them</p>
              <p><strong>5.</strong> Test the appointments API connectivity</p>
              <p><strong>Note:</strong> Make sure your backend is running on localhost:3001 for full functionality</p>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}