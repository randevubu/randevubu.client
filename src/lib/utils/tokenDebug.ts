import { getAccessToken, debugCurrentToken } from '../api';

export const debugTokenState = (context: string = '') => {
  console.log(`🔍 TOKEN DEBUG ${context ? `(${context})` : ''}`);
  console.log('='.repeat(50));
  
  const token = getAccessToken();
  
  if (token) {
    console.log('✅ Token exists');
    console.log('🔍 Token preview:', token.substring(0, 50) + '...');
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🎭 Token roles:', payload.roles || 'No roles in token');
      console.log('⏰ Token expires:', new Date(payload.exp * 1000).toISOString());
      console.log('👤 User ID:', payload.sub || 'No user ID');
      console.log('🏢 Business ID:', payload.businessId || 'No business ID');
    } catch (e) {
      console.warn('⚠️ Could not decode token payload');
    }
  } else {
    console.log('❌ No access token found');
  }
  
  console.log('='.repeat(50));
};

export const debugBusinessCreationFlow = (step: string = '') => {
  console.log(`🏢 BUSINESS CREATION DEBUG ${step ? `- ${step}` : ''}`);
  debugTokenState('Business Creation');
};