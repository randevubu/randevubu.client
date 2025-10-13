'use client';

import { useAuth } from '../../context/AuthContext';
import { getAccessToken, testTokenRefresh } from '../../lib/api';
import { useState } from 'react';

export function TokenRotationTest() {
  const { isAuthenticated, accessToken } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const runTokenRotationTest = async () => {
    if (!isAuthenticated) {
      setTestResult('❌ Not authenticated');
      return;
    }

    setTestResult('🔄 Running token rotation test...');

    try {
      // This will trigger the API interceptor to refresh the token
      const result = await testTokenRefresh();
      
      if (result.success) {
        setTestResult('✅ Token rotation test passed! The refresh token was successfully rotated.');
      } else {
        setTestResult(`❌ Token rotation test failed: ${result.error}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Token rotation test error: ${error.message}`);
    }
  };

  const forceRefresh = async () => {
    setTestResult('🔄 Force refreshing token...');
    
    try {
      // Import authService dynamically to avoid circular imports
      const { authService } = await import('../../lib/services/auth');
      const response = await authService.refreshToken();
      
      if (response.success && response.data?.tokens?.accessToken) {
        setTestResult('✅ Force refresh successful! Check the debug info above.');
        // Reload the page to see the updated state
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setTestResult(`❌ Force refresh failed: ${response.message}`);
      }
    } catch (error: any) {
      setTestResult(`❌ Force refresh error: ${error.message}`);
    }
  };

  const clearBrokenTokens = () => {
    setTestResult('🧹 Clearing broken tokens...');
    
    // Clear all auth cookies
    document.cookie = 'hasAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear access token from memory
    const { setApiAccessToken } = require('../../lib/api');
    setApiAccessToken(null);
    
    setTestResult('✅ Cleared all tokens. Refresh the page to see clean state.');
    
    // Reload after a short delay
    setTimeout(() => window.location.reload(), 1000);
  };

  const testSessionRefresh = async () => {
    setTestResult('🔄 Testing session refresh...');
    
    try {
      // Import authService and test refresh directly
      const { authService } = await import('../../lib/services/auth');
      console.log('🍪 [TEST] Current cookies:', document.cookie);
      
      const response = await authService.refreshToken();
      console.log('🔄 [TEST] Refresh response:', response);
      
      if (response.success && response.data?.tokens?.accessToken) {
        setTestResult('✅ Session refresh successful! Check console for details.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setTestResult(`❌ Session refresh failed: ${response.message}`);
      }
    } catch (error: any) {
      console.error('❌ [TEST] Session refresh error:', error);
      setTestResult(`❌ Session refresh error: ${error.message}`);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔄 Token Rotation Test</h3>
      <div className="space-y-2">
        <div>Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}</div>
        <div>Token: {accessToken ? '✅ Present' : '❌ Missing'}</div>
        <div>Memory Token: {getAccessToken() ? '✅ Present' : '❌ Missing'}</div>
        
        <button
          onClick={runTokenRotationTest}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
          disabled={!isAuthenticated}
        >
          Test Token Rotation
        </button>
        
        <button
          onClick={forceRefresh}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs"
        >
          Force Refresh Token
        </button>
        
        <button
          onClick={clearBrokenTokens}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
        >
          Clear Broken Tokens
        </button>
        
        <button
          onClick={testSessionRefresh}
          className="w-full bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs"
        >
          Test Session Refresh
        </button>
        
        {testResult && (
          <div className="mt-2 p-2 bg-black/50 rounded text-xs">
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}


