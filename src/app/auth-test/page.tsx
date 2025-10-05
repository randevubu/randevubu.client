'use client';

import { useAuth } from '../../context/AuthContext';
import { getAccessToken, testTokenRefresh } from '../../lib/api';
import { useState, useEffect } from 'react';

export default function AuthTestPage() {
  const { isAuthenticated, user, accessToken, hasInitialized } = useAuth();
  const [cookies, setCookies] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookies(document.cookie);
      
      const currentToken = getAccessToken();
      if (currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          setTokenInfo(payload);
        } catch (e) {
          setTokenInfo(null);
        }
      }
    }
  }, [accessToken]);

  const runTokenRotationTest = async () => {
    if (!isAuthenticated) {
      setTestResult('❌ Not authenticated');
      return;
    }

    setTestResult('🔄 Running token rotation test...');

    try {
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

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Auth Test Page</h1>
          <p className="text-gray-600 mt-2">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔍 Auth Debug & Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auth Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔐 Authentication Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Initialized:</span>
                <span className={hasInitialized ? 'text-green-600' : 'text-red-600'}>
                  {hasInitialized ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <span className={user ? 'text-green-600' : 'text-red-600'}>
                  {user ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Access Token:</span>
                <span className={accessToken ? 'text-green-600' : 'text-red-600'}>
                  {accessToken ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Memory Token:</span>
                <span className={getAccessToken() ? 'text-green-600' : 'text-red-600'}>
                  {getAccessToken() ? '✅' : '❌'}
                </span>
              </div>
            </div>
          </div>

          {/* Token Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎫 Token Information</h2>
            {tokenInfo ? (
              <div className="space-y-2 text-sm">
                <div><strong>User ID:</strong> {tokenInfo.sub || 'N/A'}</div>
                <div><strong>Expires:</strong> {tokenInfo.exp ? new Date(tokenInfo.exp * 1000).toLocaleString() : 'N/A'}</div>
                <div><strong>Roles:</strong> {tokenInfo.roles?.join(', ') || 'N/A'}</div>
                <div><strong>Issued At:</strong> {tokenInfo.iat ? new Date(tokenInfo.iat * 1000).toLocaleString() : 'N/A'}</div>
              </div>
            ) : (
              <p className="text-gray-500">No token information available</p>
            )}
          </div>

          {/* Cookies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🍪 Cookies</h2>
            <div className="text-sm space-y-1">
              {cookies.split(';').map((cookie, i) => (
                <div key={i} className="break-all">{cookie.trim()}</div>
              ))}
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🧪 Test Actions</h2>
            <div className="space-y-4">
              <button
                onClick={runTokenRotationTest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
                disabled={!isAuthenticated}
              >
                Test Token Rotation
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Reload Page
              </button>
            </div>
            
            {testResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 How to Use This Page</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• This page is accessible without authentication</li>
            <li>• Use it to debug auth issues when you can't access the dashboard</li>
            <li>• Check the "Authentication Status" section to see what's working</li>
            <li>• Use "Test Token Rotation" to verify refresh token functionality</li>
            <li>• Check cookies to see if refresh token is present</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


