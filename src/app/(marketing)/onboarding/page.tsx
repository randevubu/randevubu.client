'use client';

import { AlertCircle, ArrowRight, BarChart3, Building, Calendar, CheckCircle, Info, Link, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BusinessGuard from '../../../components/ui/BusinessGuard';
import CitySelector from '../../../components/ui/CitySelector';
import ProfileGuard from '../../../components/ui/ProfileGuard';
import OnboardingPageSkeleton from '../../../components/ui/OnboardingPageSkeleton';
import { useAuth } from '../../../context/AuthContext';
import { useMyBusiness } from '../../../lib/hooks/useMyBusiness';
import { businessService } from '../../../lib/services/business';
import { PaymentsService } from '../../../lib/services/payments';
import { BusinessType, CreateBusinessData } from '../../../types/business';
import { Location } from '../../../types/subscription';
import { SubscriptionStatus } from '../../../types/enums';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { hasBusinesses, isFirstTimeUser, canCreateBusiness, businesses, subscriptions, isLoading: businessLoading } = useMyBusiness(true);
  const [currentStep, setCurrentStep] = useState<'business' | 'success'>('business');
  const [createdBusiness, setCreatedBusiness] = useState<import('../../../types/business').Business | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  
  const [formData, setFormData] = useState<CreateBusinessData>({
    name: '',
    businessTypeId: '',
    description: '',
    phone: '',
    website: '',
    address: '',
    city: 'Istanbul', // Default fallback
    state: '',
    country: 'Turkey',
    neighborhood: '',
    street: '',
    buildingNumber: '',
    apartment: '',
    timezone: 'Europe/Istanbul',
    primaryColor: '#6366F1',
    tags: []
  });

  const [websiteSlug, setWebsiteSlug] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check if user has businesses but no active subscription
  const hasActiveSubscription = subscriptions.some(sub => 
    sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRIAL
  );
  const hasBusinessButNoSubscription = hasBusinesses && !hasActiveSubscription;

  // Debug logging
  console.log('Onboarding Debug:', {
    hasBusinesses,
    subscriptions: subscriptions.length,
    subscriptionStatuses: subscriptions.map(sub => sub.status),
    hasActiveSubscription,
    hasBusinessButNoSubscription,
    businesses: businesses.length,
    businessData: businesses.map(b => ({
      id: b.id,
      name: b.name,
      hasSubscription: !!b.subscription,
      subscriptionStatus: b.subscription?.status
    })),
    rawBusinessData: businesses[0] // Show the first business object
  });
  




  useEffect(() => {
    if (authLoading || businessLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // If user has businesses but no active subscription, show business info instead of form
    if (hasBusinessButNoSubscription) {
      setLoadingTypes(false); // Don't need to load business types
      setLocationLoading(false); // Don't need to detect location
      return; // Don't redirect, show the business info view
    }

    // If user has businesses with active subscription, redirect to dashboard
    if (hasBusinesses && hasActiveSubscription) {
      setLoadingTypes(false); // Don't need to load business types
      setLocationLoading(false); // Don't need to detect location
      router.push('/dashboard');
      return;
    }

    // If user is not a first-time user but has no businesses, something is wrong
    if (!isFirstTimeUser && !hasBusinesses) {
    }

    // Only proceed with onboarding form if user is a first-time user or can create business
    // AND doesn't have businesses (to avoid loading business types unnecessarily)
    if ((isFirstTimeUser || canCreateBusiness) && !hasBusinesses) {
      fetchBusinessTypes();
      detectLocation();
    }
  }, [user, isAuthenticated, authLoading, businessLoading, hasBusinesses, hasActiveSubscription, hasBusinessButNoSubscription, isFirstTimeUser, canCreateBusiness, router]);


  const detectLocation = async () => {
    try {
      setLocationLoading(true);
      const { location: detectedLocation } = await PaymentsService.getSubscriptionPlansWithLocation();
      setLocation(detectedLocation);
      
      // Update form data with detected city or keep Istanbul as fallback
      if (detectedLocation?.city) {
        setFormData(prev => ({
          ...prev,
          city: detectedLocation.city
        }));
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      // Keep Istanbul as fallback
    } finally {
      setLocationLoading(false);
    }
  };

  // Populate phone from profile and keep it immutable in the form
  useEffect(() => {
    if (user?.phoneNumber) {
      setFormData(prev => (prev.phone === user.phoneNumber ? prev : { ...prev, phone: user.phoneNumber }));
    }
  }, [user?.phoneNumber]);

  const fetchBusinessTypes = async () => {
    try {
      console.log('🔄 Fetching business types...');
      const response = await businessService.getBusinessTypes();
      console.log('📦 Business types API response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Business types loaded successfully:', response.data.length, 'types');
        console.log('📋 First few business types:', response.data.slice(0, 3));
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
      console.error('❌ Error fetching business types:', err);
      console.log('🔄 Using fallback business types');
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
    
    if (!formData.phone?.trim()) newErrors.phone = 'Telefon numarası gereklidir';
    else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Geçersiz telefon numarası formatı';
    }
    if (!formData.city?.trim()) newErrors.city = 'Şehir gereklidir';
    
    // Address validation
    if (!formData.neighborhood?.trim()) newErrors.neighborhood = 'Mahalle/Semt gereklidir';
    if (!formData.street?.trim()) newErrors.street = 'Sokak/Cadde gereklidir';
    if (!formData.buildingNumber?.trim()) newErrors.buildingNumber = 'Bina numarası gereklidir';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always show errors when user tries to submit
    setHasInteracted(true);
    
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
      
      return;
    }

    setLoading(true);

    try {
      // Convert tags string to array if needed
      const tagsArray = typeof formData.tags === 'string' 
        ? (formData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : formData.tags || [];

      // Construct full address from individual fields
      const addressParts = [
        formData.neighborhood,
        formData.street,
        formData.buildingNumber,
        formData.apartment
      ].filter(part => part && part.trim()).join(', ');

      const businessData: CreateBusinessData = {
        ...formData,
        address: addressParts,
        tags: tagsArray
      };

      const response = await businessService.createBusiness(businessData);
      
      if (response.success && response.data) {
        // Clear any previous errors
        setErrors({});

        // Refresh user profile to get updated business/role information
        await refreshUser(true); // Force role refresh

        setCreatedBusiness(response.data);

        // Redirect to subscription page with query param to show success message
        router.push('/subscription?from=onboarding');
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
    
    // Mark that user has interacted with the form
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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

  const handleCityChange = (city: string) => {
    // Mark that user has interacted with the form
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    handleInputChange('city', city);
  };

  // Debug loading states
  console.log('Loading states:', {
    authLoading,
    businessLoading,
    loadingTypes,
    locationLoading,
    hasBusinesses,
    hasBusinessButNoSubscription,
    shouldShowLoading: authLoading || (businessLoading && !hasBusinesses) || (loadingTypes && !hasBusinesses) || locationLoading
  });

  // Show loading while checking authentication and business status
  // But don't show loading if we already have business data and can show business info
  if (authLoading || (businessLoading && !hasBusinesses) || (loadingTypes && !hasBusinesses) || locationLoading) {
    return <OnboardingPageSkeleton />;
  }

  // Show business information if user has businesses but no subscription
  console.log('Checking business info condition:', {
    hasBusinessButNoSubscription,
    businessesLength: businesses.length,
    shouldShowBusinessInfo: hasBusinessButNoSubscription && businesses.length > 0
  });
  
  if (hasBusinessButNoSubscription && businesses.length > 0) {
    const primaryBusiness = businesses[0]; // Get the first business
    
    return (
      <div className="min-h-screen max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative bg-white pt-20 pb-16">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30"></div>

          <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-amber-50 rounded-full text-amber-600 font-medium text-xs mb-6">
              ⚠️ Abonelik Gerekli
            </div>

            {/* Business Info Icon */}
            <div className="mb-8">
              <div className="mx-auto flex items-center justify-center w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-2xl mb-6">
                <Building className="w-16 h-16 text-white" />
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
              İşletmeniz Hazır! 🎉
              <br />
              <span className="text-amber-600">Abonelik Planı Seçin</span>
            </h1>

            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 mb-12 max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex items-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mr-4 flex-shrink-0">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      <span className="text-indigo-600">{primaryBusiness.name}</span>
                    </h3>
                    <p className="text-gray-500 text-sm">İşletme Bilgileri</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 mb-6 border border-gray-200/50">
                  <div className="space-y-5">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <Building className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-500 mb-1">İşletme Türü</div>
                        <div className="font-semibold text-gray-900 text-base">
                          {primaryBusiness.businessType?.displayName || primaryBusiness.businessTypeId || 'Belirtilmemiş'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-blue-600 text-lg">📍</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-500 mb-1">Konum</div>
                        <div className="font-semibold text-gray-900 text-base">{primaryBusiness.city}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-green-600 text-lg">🏠</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-500 mb-1">Adres</div>
                        <div className="font-semibold text-gray-900 text-base break-words leading-relaxed">
                          {primaryBusiness.address}
                        </div>
                      </div>
                    </div>
                    
                    {primaryBusiness.phone && (
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-purple-600 text-lg">📞</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-500 mb-1">Telefon</div>
                          <div className="font-semibold text-gray-900 text-base">{primaryBusiness.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  İşletmeniz başarıyla oluşturuldu! Şimdi işletmenizin büyüklüğüne uygun abonelik planını seçmeniz gerekiyor.
                </p>

                {/* What's Next Box */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Info className="w-5 h-5 text-indigo-600 mr-2" />
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
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Hemen Başlayın</h4>
                    <p className="text-gray-600 mb-4">İşletmenizi aktif hale getirmek için abonelik planı seçin</p>
                    
                    <button
                      onClick={() => router.push('/subscription?from=onboarding')}
                      className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl mb-3"
                    >
                      <span className="flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Abonelik Planı Seç
                      </span>
                    </button>

                    <p className="text-xs text-gray-500">
                      Plan seçimi yapmadan dashboard'a erişemezsiniz
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Randevu Yönetimi</h3>
                <p className="text-sm text-gray-600">Kolay rezervasyon ve takvim yönetimi</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Müşteri Yönetimi</h3>
                <p className="text-sm text-gray-600">Müşteri bilgileri ve geçmiş kayıtları</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
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

  // If user is not a first-time user and cannot create business, show error
  if (!isFirstTimeUser && !canCreateBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to create a business.</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen max-w-7xl mx-auto">
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
                <CheckCircle className="w-16 h-16 text-white" />
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
                  <Building className="w-8 h-8 text-white" />
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
                    <Info className="w-5 h-5 text-indigo-600 mr-2" />
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
                  onClick={() => router.push('/subscription?from=onboarding')}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl mb-4"
                >
                  <span className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 mr-2" />
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Randevu Yönetimi</h3>
                <p className="text-sm text-gray-600">Kolay rezervasyon ve takvim yönetimi</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Müşteri Yönetimi</h3>
                <p className="text-sm text-gray-600">Müşteri bilgileri ve geçmiş kayıtları</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
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
    <ProfileGuard>
      <BusinessGuard>
        <div className="min-h-screen max-w-7xl mx-auto pb-8">
          {/* Hero Section */}
          <section className="relative bg-white pt-20 pb-8">
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

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            İşletmeniz hakkında bilgileri girin ve randevu yönetim sisteminizi kullanmaya başlayın.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mobile-form-container pb-4">
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 mx-2 sm:mx-0">
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 mobile-form-spacing">
                {/* Business Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    İşletme Türü * 
                    {businessTypes.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({businessTypes.length} tür yüklendi)
                      </span>
                    )}
                  </label>
                  <select
                    name="businessTypeId"
                    data-field="businessTypeId"
                    value={formData.businessTypeId}
                    onChange={(e) => handleInputChange('businessTypeId', e.target.value)}
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      hasInteracted && errors.businessTypeId 
                        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : formData.businessTypeId 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-200'
                    }`}
                    disabled={loading}
                  >
                    <option value="" disabled>
                      İşletme türünü seçin...
                    </option>
                    {businessTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                  {hasInteracted && errors.businessTypeId && (
                    <div className="flex items-start mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium leading-relaxed">{errors.businessTypeId}</p>
                    </div>
                  )}
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
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mobile-form-field ${
                      hasInteracted && errors.name 
                        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                        : formData.name && formData.name.trim().length >= 3
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-200'
                    }`}
                    placeholder="Örnek: Güzellik Salonu"
                    disabled={loading}
                  />
                  {hasInteracted && errors.name && (
                    <div className="flex items-start mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium leading-relaxed">{errors.name}</p>
                    </div>
                  )}
                  
                                    {/* URL Preview */}
                  {formData.name && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800 font-medium mb-1">Website URL Önizlemesi:</p>
                      <p className="text-sm text-blue-600 font-mono break-all mobile-url-display">
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

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Şehir *</label>
                  {locationLoading ? (
                    <div className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-600">Konum tespit ediliyor...</span>
                    </div>
                  ) : (
                    <CitySelector
                      onCityChange={handleCityChange}
                      currentCity={formData.city || ''}
                      detectedLocation={location || undefined}
                      className="w-full"
                    />
                  )}
                  {hasInteracted && errors.city && (
                    <div className="flex items-start mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium leading-relaxed">{errors.city}</p>
                    </div>
                  )}
                </div>

                {/* Detailed Address */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Mahalle/Semt *</label>
                    <input
                      name="neighborhood"
                      data-field="neighborhood"
                      type="text"
                      value={formData.neighborhood || ''}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mobile-form-field ${
                        hasInteracted && errors.neighborhood 
                          ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                          : formData.neighborhood && formData.neighborhood.trim().length > 0
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-200'
                      }`}
                      placeholder="Örnek: Beşiktaş, Kadıköy, Şişli"
                      disabled={loading}
                    />
                    {hasInteracted && errors.neighborhood && (
                      <div className="flex items-start mt-2 text-red-600">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-relaxed">{errors.neighborhood}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">Sokak/Cadde *</label>
                      <input
                        name="street"
                        data-field="street"
                        type="text"
                        value={formData.street || ''}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mobile-form-field ${
                          hasInteracted && errors.street 
                            ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                            : formData.street && formData.street.trim().length > 0
                              ? 'border-green-400 bg-green-50' 
                              : 'border-gray-200'
                        }`}
                        placeholder="Örnek: Atatürk Caddesi"
                        disabled={loading}
                      />
                      {hasInteracted && errors.street && (
                        <div className="flex items-start mt-2 text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium leading-relaxed">{errors.street}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">Bina No *</label>
                      <input
                        name="buildingNumber"
                        data-field="buildingNumber"
                        type="text"
                        value={formData.buildingNumber || ''}
                        onChange={(e) => handleInputChange('buildingNumber', e.target.value)}
                        className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mobile-form-field ${
                          hasInteracted && errors.buildingNumber 
                            ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-500' 
                            : formData.buildingNumber && formData.buildingNumber.trim().length > 0
                              ? 'border-green-400 bg-green-50' 
                              : 'border-gray-200'
                        }`}
                        placeholder="Örnek: 123, 45/A"
                        disabled={loading}
                      />
                      {hasInteracted && errors.buildingNumber && (
                        <div className="flex items-start mt-2 text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium leading-relaxed">{errors.buildingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Daire/Kat (Opsiyonel)</label>
                    <input
                      name="apartment"
                      data-field="apartment"
                      type="text"
                      value={formData.apartment || ''}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mobile-form-field"
                      placeholder="Örnek: 3. Kat, Daire 15"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Telefon *</label>
                    <input
                      name="phone"
                      data-field="phone"
                      type="tel"
                      value={formData.phone}
                      className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-0 transition-all mobile-form-field ${
                        hasInteracted && errors.phone ? 'border-red-400 bg-red-50' : 'bg-indigo-50 border-indigo-200'
                      } cursor-not-allowed text-gray-700`}
                      placeholder="+90 555 123 4567"
                      disabled={true}
                      readOnly
                    />
                    {hasInteracted && errors.phone && (
                      <div className="flex items-start mt-2 text-red-600">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-relaxed">{errors.phone}</p>
                      </div>
                    )}
                    {!errors.phone && (
                      <p className="text-sm text-gray-500 mt-2">Bu alan profilinizden alınır ve değiştirilemez. Güncellemek için profilinizi düzenleyin.</p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Website URL</label>
                  <div className="relative">
                    <div
                      className="w-full px-4 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-gray-900 break-all pr-12 select-text text-sm mobile-url-display"
                      aria-readonly="true"
                    >
                      {formData.website || 'https://randevubu.com/business/'}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <Link className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Bu URL otomatik olarak işletme adınızdan oluşturulur ve değiştirilemez
                  </p>
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
    </ProfileGuard>
  );
}