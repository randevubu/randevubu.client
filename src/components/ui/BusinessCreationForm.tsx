'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../lib/services/business';
import { CreateBusinessData, BusinessType } from '../../types/business';
import { debugBusinessCreationFlow } from '../../lib/utils/debugAuth';
import { getAccessToken } from '../../lib/api';
import { debugTokenState } from '../../lib/utils/tokenDebug';

interface BusinessCreationFormProps {
  onSuccess?: (business: any) => void;
  onError?: (error: string) => void;
}

export default function BusinessCreationForm({ onSuccess, onError }: BusinessCreationFormProps) {
  const router = useRouter();
  const { updateTokensAndUser, refreshTokenAndUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  
  const [formData, setFormData] = useState<CreateBusinessData>({
    name: '',
    businessTypeId: 'beauty_salon',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'Turkey',
    postalCode: '',
    timezone: 'Europe/Istanbul',
    primaryColor: '#FF6B6B',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await businessService.getBusinessTypes();
        if (response.success && response.data) {
          setBusinessTypes(response.data);
        } else {
          // Use fallback business types
          setBusinessTypes([
            { id: 'beauty_salon', name: 'beauty_salon', displayName: 'Beauty Salon', description: 'Hair and beauty services', category: 'Beauty', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: 'barbershop', name: 'barbershop', displayName: 'Barbershop', description: 'Men\'s grooming services', category: 'Beauty', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: 'spa', name: 'spa', displayName: 'Spa', description: 'Wellness and spa services', category: 'Wellness', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: 'clinic', name: 'clinic', displayName: 'Medical Clinic', description: 'Healthcare services', category: 'Healthcare', isActive: true, createdAt: new Date(), updatedAt: new Date() },
            { id: 'fitness', name: 'fitness', displayName: 'Fitness Center', description: 'Gym and fitness services', category: 'Fitness', isActive: true, createdAt: new Date(), updatedAt: new Date() }
          ]);
        }
      } catch (err) {
        console.error('Error fetching business types:', err);
        // Use fallback business types
        setBusinessTypes([
          { id: 'beauty_salon', name: 'beauty_salon', displayName: 'Beauty Salon', description: 'Hair and beauty services', category: 'Beauty', isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: 'barbershop', name: 'barbershop', displayName: 'Barbershop', description: 'Men\'s grooming services', category: 'Beauty', isActive: true, createdAt: new Date(), updatedAt: new Date() }
        ]);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchBusinessTypes();
  }, []);

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.businessTypeId) newErrors.businessTypeId = 'Business type is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Convert tags string to array if needed
      const tagsArray = typeof formData.tags === 'string' 
        ? (formData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : formData.tags || [];

      const businessData: CreateBusinessData = {
        ...formData,
        tags: tagsArray
      };

      const response = await businessService.createBusiness(businessData);
      console.log('🚀 Creating business...');
      console.log('📦 Business creation response:', response);
      console.log('📦 Raw response keys:', Object.keys(response));
      
      if (response.success && response.data) {
        console.log('✅ Business created successfully:', response.data.name);
        
        // 🔍 CHECK: Are we getting new tokens?
        if (response.tokens?.accessToken) {
          console.log('🔑 NEW ACCESS TOKEN RECEIVED!');
          console.log('Old token preview:', getAccessToken()?.substring(0, 50) + '...');
          
          // ✅ UPDATE: Store new token immediately via AuthContext
          await updateTokensAndUser(response.tokens);
          
          console.log('New token preview:', response.tokens.accessToken.substring(0, 50) + '...');
          console.log('✅ Token updated successfully');
          console.log('👑 User promoted to business owner!');
        } else {
          console.warn('⚠️ NO NEW TOKENS IN RESPONSE!');
          console.log('Response structure:', {
            hasData: !!response.data,
            hasTokens: !!response.tokens,
            keys: Object.keys(response)
          });
          console.log('⚠️ Falling back to force role refresh...');
          await refreshTokenAndUser(true); // Force role refresh
        }
        
        // Debug the complete flow
        debugBusinessCreationFlow();
        debugTokenState('After business creation');
        
        onSuccess?.(response.data);
        
        // Navigate after ensuring auth state is fully updated
        router.push('/subscription');
      } else {
        const error = 'Failed to create business';
        setErrors({ general: error });
        onError?.(error);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to create business';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
      console.error('Error creating business:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateBusinessData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (loadingTypes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Business</h1>
            <p className="text-gray-600">Tell us about your business to get started</p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
              <select
                value={formData.businessTypeId}
                onChange={(e) => handleInputChange('businessTypeId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.businessTypeId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                {businessTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.displayName}
                  </option>
                ))}
              </select>
              {errors.businessTypeId && <p className="text-red-500 text-sm mt-1">{errors.businessTypeId}</p>}
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Hair & Beauty Salon"
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Professional hair and beauty services..."
                disabled={loading}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="info@yourbusiness.com"
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+905551234567"
                  disabled={loading}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourbusiness.com"
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main Street, Kadıköy"
                disabled={loading}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Istanbul"
                  disabled={loading}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Istanbul"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="34710"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="#FF6B6B"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="hair, beauty, salon, styling"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Business...
                  </div>
                ) : (
                  'Create Business & Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}