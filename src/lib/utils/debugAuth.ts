import { parseJWT } from './jwt';
import { getAccessToken } from '../api';

export function debugAuthState(context: string) {
  console.log(`\n🔍 DEBUG AUTH STATE - ${context}`);
  console.log('================================');

  // Check current token in memory
  const currentToken = getAccessToken();
  console.log('Current token in memory:', currentToken ? currentToken.substring(0, 20) + '...' : 'null');

  if (currentToken) {
    const decoded = parseJWT(currentToken);
    if (decoded && decoded.exp) {
      console.log('Token contents:', decoded);
      console.log('Token expires:', new Date(decoded.exp * 1000).toLocaleString());
      console.log('Time until expiry:', Math.round((decoded.exp * 1000 - Date.now()) / 1000 / 60), 'minutes');

      // Check if token contains role information
      if (decoded.roles) {
        console.log('🔑 Roles in JWT:', decoded.roles);
      } else {
        console.log('⚠️  No roles found in JWT - roles likely fetched via API');
      }
    }
  }
  
  // Check cookies
  if (typeof window !== 'undefined') {
    console.log('Has auth cookie:', document.cookie.includes('hasAuth=1'));
  }
  
  console.log('================================\n');
}

export function debugBusinessCreationFlow() {
  console.log('\n🏢 BUSINESS CREATION FLOW DEBUG');
  console.log('=================================');
  console.log('1. Business created successfully ✅');
  console.log('2. Backend assigned OWNER role ✅');
  console.log('3. Backend generated new JWT tokens ✅');
  console.log('4. Frontend received new tokens...');
  debugAuthState('After Business Creation');
}