'use client';

import { useAuth } from '../../context/AuthContext';
import { getAccessToken, debugCurrentToken } from '../../lib/api';
import { useEffect, useState } from 'react';

export function AuthDebugger() {
  const { isAuthenticated, user, accessToken, hasInitialized } = useAuth();
  const [cookies, setCookies] = useState<string>('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookies(document.cookie);
      
      const currentToken = getAccessToken();
      if (currentToken) {
        setTokenInfo(debugCurrentToken());
      }
    }
  }, [accessToken]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div>Initialized: {hasInitialized ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user ? '✅' : '❌'}</div>
        <div>Access Token: {accessToken ? '✅' : '❌'}</div>
        <div>Memory Token: {getAccessToken() ? '✅' : '❌'}</div>
        <div className="mt-2">
          <div className="font-semibold">Cookies:</div>
          <div className="break-all text-xs">
            {cookies.split(';').map((cookie, i) => (
              <div key={i}>{cookie.trim()}</div>
            ))}
          </div>
        </div>
        {tokenInfo && (
          <div className="mt-2">
            <div className="font-semibold">Token Info:</div>
            <div>User ID: {tokenInfo.sub || 'N/A'}</div>
            <div>Expires: {tokenInfo.exp ? new Date(tokenInfo.exp * 1000).toLocaleString() : 'N/A'}</div>
            <div>Roles: {tokenInfo.roles?.join(', ') || 'N/A'}</div>
          </div>
        )}
      </div>
    </div>
  );
}


