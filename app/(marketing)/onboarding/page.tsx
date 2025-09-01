'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';
import { businessService } from '../../../src/lib/services/business';
import { CreateBusinessData, BusinessType } from '../../../src/types/business';
import BusinessGuard from '../../../src/components/features/BusinessGuard';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<'business' | 'success'>('business');
  const [createdBusiness, setCreatedBusiness] = useState<any>(null);
  
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
    primaryColor: '#6366F1',
    tags: []
  });

  const [websiteSlug, setWebsiteSlug] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Check profile completeness before allowing business creation
    if (user && (!user.firstName || !user.lastName)) {
      router.push('/settings?tab=profile&redirect=onboarding');
      return;
    }

    // Check if user already has a business via API (not user context)
    checkBusinessStatus();
  }, [user, isAuthenticated, authLoading, router]);

  const checkBusinessStatus = async () => {
    try {
      const response = await businessService.getMyBusiness('?includeSubscription=true');
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        router.push('/subscription');
        return;
      }
      
      fetchBusinessTypes();
    } catch (error) {
      // On error, allow onboarding (safe default)
      fetchBusinessTypes();
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      const response = await businessService.getBusinessTypes();
      if (response.success && response.data) {
        setBusinessTypes(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, businessTypeId: response.data![0].id }));
        }
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
      // Use fallback business types
      setBusinessTypes([
        { id: 'beauty_salon', name: 'beauty_salon', displayName: 'Beauty Salon', description: 'Hair and beauty services', category: 'Beauty', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'barbershop', name: 'barbershop', displayName: 'Barbershop', description: 'Men\'s grooming services', category: 'Beauty', isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ]);
    } finally {
      setLoadingTypes(false);
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'İşletme adı gereklidir';
    else if (formData.name.trim().length < 3) newErrors.name = 'İşletme adı en az 3 karakter olmalıdır';
    else if (formData.name.trim().length > 100) newErrors.name = 'İşletme adı en fazla 100 karakter olmalıdır';
    if (!formData.businessTypeId) newErrors.businessTypeId = 'İşletme türü gereklidir';
    if (!formData.email?.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçersiz e-posta formatı';
    }
    if (!formData.phone?.trim()) newErrors.phone = 'Telefon numarası gereklidir';
    else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Geçersiz telefon numarası formatı';
    }
    if (!formData.city?.trim()) newErrors.city = 'Şehir gereklidir';
    if (!formData.address?.trim()) newErrors.address = 'Adres gereklidir';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      // Scroll to the first error field
      const firstErrorField = Object.keys(formErrors)[0];
      
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                          document.querySelector(`[data-field="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Force a re-render to show errors
      setErrors({ ...formErrors });
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
      
      if (response.success && response.data) {
        // Clear any previous errors
        setErrors({});
        
        // Refresh user context to include the new business
        await refreshUser();
        
        setCreatedBusiness(response.data);
        
        // Redirect to the business page using the generated slug
        router.push(`/business/${websiteSlug}`);
        return;
      } else {
        const error = 'İşletme oluşturulamadı';
        setErrors({ general: error });
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || 'İşletme oluşturulamadı';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const generateWebsiteSlug = (businessName: string) => {
    // Turkish character mapping
    const turkishCharMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'I': 'I', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };

    return businessName
      .split('')
      .map(char => turkishCharMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
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

    // Auto-generate website slug when business name changes
    if (field === 'name') {
      const slug = generateWebsiteSlug(value);
      setWebsiteSlug(slug);
      setFormData(prev => ({
        ...prev,
        website: `https://randevubu.com/business/${slug}`
      }));
    }
  };

  if (authLoading || loadingTypes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-white pt-20 pb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30"></div>

          <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-green-50 rounded-full text-green-600 font-medium text-xs mb-6">
              ✅ İşletme Oluşturuldu
            </div>

            {/* Big Success Icon */}
            <div className="mb-8">
              <div className="mx-auto flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl mb-6 animate-bounce">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Tebrikler! 🎉
              <br />
              <span className="text-green-600">İşletmeniz Hazır</span>
            </h1>

            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 mb-12 max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 012-2h2a2 2 0 012 2v9m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v7" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  <span className="text-indigo-600">{createdBusiness?.name}</span>
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  İşletmeniz başarıyla sistemimize kaydedildi ve randevu almaya hazır! 
                  Şimdi işletmenizin büyüklüğüne uygun abonelik planını seçmeniz gerekiyor.
                </p>

                {/* What's Next Box */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Sırada Ne Var?
                  </h4>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Abonelik planı seçin</span>
                        <p className="text-sm text-gray-600">İşletmenizin büyüklüğüne uygun planı seçin</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Ödeme yapın</span>
                        <p className="text-sm text-gray-600">Güvenli ödeme ile aboneliğinizi başlatın</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Randevuları yönetmeye başlayın!</span>
                        <p className="text-sm text-gray-600">Dashboard'dan işletmenizi yönetebilirsiniz</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => router.push('/subscription')}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl mb-4"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                    Abonelik Planı Seç
                  </span>
                </button>

                <p className="text-xs text-gray-500">
                  Plan seçimi yapmadan dashboard'a erişemezsiniz
                </p>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Randevu Yönetimi</h3>
                <p className="text-sm text-gray-600">Kolay rezervasyon ve takvim yönetimi</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Müşteri Yönetimi</h3>
                <p className="text-sm text-gray-600">Müşteri bilgileri ve geçmiş kayıtları</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Raporlama</h3>
                <p className="text-sm text-gray-600">Detaylı istatistik ve analiz raporları</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <BusinessGuard>
      <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative bg-white pt-20 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            🏢 İşletme Kaydı
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
            İşletmenizi
            <br />
            <span className="text-indigo-600">Kaydedin</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            İşletmeniz hakkında bilgileri girin ve randevu yönetim sisteminizi kullanmaya başlayın.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-4 lg:px-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}



            {/* Field Validation Errors Summary */}
            {Object.keys(errors).filter(key => key !== 'general').length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-bold">
                      ⚠️ Form Hataları - Lütfen aşağıdaki alanları düzeltin:
                    </p>
                    <ul className="mt-3 text-sm text-red-600 space-y-1">
                      {Object.entries(errors)
                        .filter(([key]) => key !== 'general')
                        .map(([key, message]) => (
                          <li key={key} className="flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            <span className="font-medium">{message}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Business Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">İşletme Türü *</label>
                  <select
                    name="businessTypeId"
                    data-field="businessTypeId"
                    value={formData.businessTypeId}
                    onChange={(e) => handleInputChange('businessTypeId', e.target.value)}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.businessTypeId ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    disabled={loading}
                  >
                    {businessTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                  {errors.businessTypeId && <p className="text-red-500 text-sm mt-2 font-medium">{errors.businessTypeId}</p>}
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">İşletme Adı *</label>
                  <input
                    name="name"
                    data-field="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Örnek: Güzellik Salonu"
                    disabled={loading}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-2 font-medium">{errors.name}</p>}
                  
                                    {/* URL Preview */}
                  {formData.name && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800 font-medium mb-1">Website URL Önizlemesi:</p>
                      <p className="text-sm text-blue-600 font-mono">
                        https://randevubu.com/business/{websiteSlug || 'your-business-name'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    rows={4}
                    placeholder="İşletmeniz hakkında kısa bir açıklama..."
                    disabled={loading}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">E-posta *</label>
                    <input
                      name="email"
                      data-field="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="info@isletmeniz.com"
                      disabled={loading}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-2 font-medium">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Telefon *</label>
                    <input
                      name="phone"
                      data-field="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="+90 555 123 4567"
                      disabled={loading}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-2 font-medium">{errors.phone}</p>}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Website URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.website || 'https://randevubu.com/business/'}
                      className="w-full px-4 py-4 bg-gray-100 border-2 border-gray-300 rounded-2xl text-gray-600 cursor-not-allowed"
                      placeholder="https://randevubu.com/business/"
                      disabled={true}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Bu URL otomatik olarak işletme adınızdan oluşturulur ve değiştirilemez
                  </p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Adres *</label>
                  <input
                    name="address"
                    data-field="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Mahalle, Sokak, No"
                    disabled={loading}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-2 font-medium">{errors.address}</p>}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Şehir *</label>
                    <input
                      name="city"
                      data-field="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="İstanbul"
                      disabled={loading}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-2 font-medium">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">İl/Bölge</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="İstanbul"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Posta Kodu</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="34710"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Brand Color */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Marka Rengi</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-20 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="flex-1 px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="#6366F1"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Etiketler (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="kuaför, güzellik, cilt bakımı"
                    disabled={loading}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        İşletme Oluşturuluyor...
                      </div>
                    ) : (
                      <>
                        <span className="mr-2">İşletmeyi Oluştur</span>
                        <span className="text-lg">🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
    </BusinessGuard>
  );
}