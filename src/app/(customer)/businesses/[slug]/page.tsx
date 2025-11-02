'use client';

import { BusinessRatings } from '@/src/components';
import { businessService } from '@/src/lib/services/business';
import { ratingService } from '@/src/lib/services/ratings';
import { Business, BusinessType } from '@/src/types/business';
import { GoogleIntegration } from '@/src/types/rating';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  currency?: string;
  isActive: boolean;
}

interface BusinessDetailsResponse extends Omit<Business, 'businessType'> {
  services?: Service[];
  businessType?: BusinessType;
}


interface WorkingHours {
  [key: string]: {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  };
}

export default function BusinessDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [business, setBusiness] = useState<BusinessDetailsResponse | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [googleIntegration, setGoogleIntegration] = useState<GoogleIntegration | null>(null);
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    services: false,
    tags: false,
    workingHours: true  // Open by default
  });

  // Gallery modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchBusinessDetails();
    }
  }, [slug]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      // Use the new getBusinessBySlug method
      const response = await businessService.getBusinessBySlug(slug);
      if (response.success && response.data) {
        const businessData = response.data as BusinessDetailsResponse;
        setBusiness(businessData);
        // Extract services from API response
        setServices(businessData.services || []);
        // Transform business hours to match expected format
        const transformedHours: WorkingHours = {};
        if (businessData.businessHours) {
          Object.entries(businessData.businessHours).forEach(([day, hours]: [string, any]) => {
            transformedHours[day] = {
              isOpen: hours.isOpen,
              openTime: hours.openTime || hours.open,
              closeTime: hours.closeTime || hours.close
            };
          });
        }
        setWorkingHours(transformedHours);
        
        // Set business type from API response
        if (businessData?.businessType) {
          setBusinessType(businessData.businessType);
        }

        // Fetch Google integration data separately
        try {
          const googleResponse = await ratingService.getGoogleIntegration(businessData.id);
          if (googleResponse.success && googleResponse.data) {
            setGoogleIntegration(googleResponse.data);
          }
        } catch (googleError) {
          // This is not an error - Google integration is optional
        }
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}s ${remainingMinutes}dk` : `${hours} saat`;
  };

  const getDayName = (dayKey: string) => {
    const days = {
      monday: 'Pazartesi',
      tuesday: 'Salı', 
      wednesday: 'Çarşamba',
      thursday: 'Perşembe',
      friday: 'Cuma',
      saturday: 'Cumartesi',
      sunday: 'Pazar'
    };
    return days[dayKey as keyof typeof days] || dayKey;
  };

  // Define the correct day order for chronological display
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return 'Geçersiz tarih';
      }
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Tarih bilgisi yok';
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openGallery = (index: number = 0) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    if (business?.galleryImages?.length) {
      setCurrentImageIndex((prev) =>
        prev === business.galleryImages!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (business?.galleryImages?.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? business.galleryImages!.length - 1 : prev - 1
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isGalleryOpen) {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, business?.galleryImages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="animate-pulse">
            <div className="h-48 sm:h-80 bg-[var(--theme-secondary)] rounded-3xl mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="h-6 sm:h-8 bg-[var(--theme-secondary)] rounded w-1/2"></div>
                <div className="h-3 sm:h-4 bg-[var(--theme-secondary)] rounded w-3/4"></div>
                <div className="h-24 sm:h-32 bg-[var(--theme-secondary)] rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 sm:h-48 bg-[var(--theme-secondary)] rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[var(--theme-secondary)] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--theme-foreground)] mb-3 sm:mb-4">İşletme Bulunamadı</h2>
          <p className="text-[var(--theme-foregroundSecondary)] mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
            Aradığınız işletme mevcut değil veya geçici olarak hizmet vermiyor.
          </p>
          <Link 
            href="/businesses"
            className="inline-flex items-center bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold hover:bg-[var(--theme-primaryHover)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            İşletmeleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
        {/* Hero Section */}
      <section className="relative">
        <div className="h-48 sm:h-80 overflow-hidden">
          {business.coverImageUrl ? (
            <img 
              src={business.coverImageUrl} 
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-accent)]/20 flex items-center justify-center">
              <div className="text-4xl sm:text-6xl lg:text-8xl opacity-30">{businessType?.icon || '🏢'}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Top Right Icons */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {/* Gallery Button */}
            {business.galleryImages && business.galleryImages.length > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openGallery(0);
                }}
                className="bg-black/60 backdrop-blur-sm text-white p-3 sm:p-2.5 rounded-full shadow-lg hover:bg-black/80 active:bg-black/90 transition-all duration-300 group relative z-10 touch-manipulation"
                title={`${business.galleryImages.length} görsel`}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {business.galleryImages.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-full flex items-center justify-center text-xs font-semibold">
                    {business.galleryImages.length}
                  </div>
                )}
              </button>
            )}

            {/* Verified Badge */}
            {business.isVerified && (
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Business Header Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                {business.logoUrl && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white self-start sm:self-auto">
                    <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black">{business.name}</h1>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-white/80 text-sm sm:text-base">
                    {businessType && (
                      <span className="flex items-center">
                        <span className="mr-2">{businessType.icon}</span>
                        {businessType.displayName}
                      </span>
                    )}
                    {businessType && business.city && business.state && <span className="hidden sm:inline">•</span>}
                    {business.city && business.state && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {business.city}, {business.state}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-8">
              {/* Randevu Al Button */}
              <div>
                <Link
                  href={`/businesses/${business.slug}/book`}
                  className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryHover)] text-[var(--theme-primaryForeground)] px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-center block"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Randevu Al</span>
                  </div>
                </Link>
              </div>

              {/* Description - Always Open */}
              {business.description && (
                <div className="bg-[var(--theme-card)] rounded-3xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <h2 className="text-sm sm:text-base font-bold text-[var(--theme-cardForeground)] mb-4">Hakkımızda</h2>
                    <p className="text-[var(--theme-foregroundSecondary)] text-base sm:text-lg leading-relaxed">
                      {business.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Information - Always Open */}
              <div className="bg-[var(--theme-card)] rounded-3xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h2 className="text-sm sm:text-base font-bold text-[var(--theme-cardForeground)] mb-4 sm:mb-6">İletişim Bilgileri</h2>
                  <div className="space-y-4 sm:space-y-6">
                    
                    {business.phone && (
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-1">Telefon</p>
                          <a 
                            href={`tel:${business.phone}`} 
                            className="text-[var(--theme-foreground)] font-medium hover:text-[var(--theme-primary)] transition-colors break-all sm:break-normal"
                          >
                            {business.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {business.address && (
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-1">Adres</p>
                          <div className="text-[var(--theme-foreground)] font-medium">
                            <p className="break-words leading-relaxed">
                              {business.address}
                            </p>
                            {business.city && business.state && (
                              <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
                                {business.city}, {business.state}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {business.website && (
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-1">Web Sitesi</p>
                          <a 
                            href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[var(--theme-foreground)] font-medium hover:text-[var(--theme-primary)] transition-colors break-all sm:break-normal block"
                          >
                            {business.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Reviews - Always Open */}
              <div className="bg-[var(--theme-card)] rounded-3xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h2 className="text-sm sm:text-base font-bold text-[var(--theme-cardForeground)] mb-4 sm:mb-6">Müşteri Yorumları</h2>
                  
                  
                  <BusinessRatings
                    businessId={business.id}
                    averageRating={0} // Will be overridden by ratings API data
                    totalRatings={0}  // Will be overridden by ratings API data
                    googleIntegration={googleIntegration || undefined}
                    showGoogleWidget={true}
                  />
                </div>
              </div>

            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              {/* Tags - Collapsible */}
              {business.tags && business.tags.length > 0 && (
                <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                  <button
                    onClick={() => toggleSection('tags')}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-[var(--theme-background)]/50 transition-colors"
                  >
                    <h3 className="font-bold text-[var(--theme-cardForeground)] text-sm sm:text-base">Etiketler</h3>
                    <svg 
                      className={`w-5 h-5 text-[var(--theme-foregroundSecondary)] transition-transform duration-300 ${openSections.tags ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.tags && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="flex flex-wrap gap-2">
                        {business.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-[var(--theme-secondary)] text-[var(--theme-foregroundSecondary)] text-xs sm:text-sm rounded-xl font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Working Hours - Collapsible */}
              {Object.keys(workingHours).length > 0 && (
                <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                  <button
                    onClick={() => toggleSection('workingHours')}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-[var(--theme-background)]/50 transition-colors"
                  >
                    <h3 className="font-bold text-[var(--theme-cardForeground)] text-sm sm:text-base">Çalışma Saatleri</h3>
                    <svg 
                      className={`w-5 h-5 text-[var(--theme-foregroundSecondary)] transition-transform duration-300 ${openSections.workingHours ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.workingHours && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="space-y-2 sm:space-y-3">
                        {dayOrder.map((day) => {
                          const hours = workingHours[day];
                          if (!hours) return null;
                          
                          return (
                            <div key={day} className="flex justify-between items-center py-1.5 sm:py-2">
                              <span className="font-medium text-[var(--theme-cardForeground)] text-sm sm:text-base">
                                {getDayName(day)}
                              </span>
                              <span className="text-[var(--theme-foregroundSecondary)] text-sm sm:text-base">
                                {hours.isOpen && hours.openTime && hours.closeTime
                                  ? `${hours.openTime} - ${hours.closeTime}`
                                  : 'Kapalı'
                                }
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Services - Collapsible */}
              <div className="bg-[var(--theme-card)] rounded-3xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                <button
                  onClick={() => toggleSection('services')}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-[var(--theme-background)]/50 transition-colors"
                >
                  <h2 className="text-sm sm:text-base font-bold text-[var(--theme-cardForeground)]">Hizmetlerimiz</h2>
                  <div className="flex items-center space-x-3">
                    <span className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-semibold">
                      {services.filter(s => s.isActive).length} Hizmet
                    </span>
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-foregroundSecondary)] transition-transform duration-300 ${openSections.services ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {openSections.services && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    {services.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {services.filter(service => service.isActive).map((service) => (
                          <div
                            key={service.id}
                            className="bg-[var(--theme-background)] border-2 border-[var(--theme-border)] rounded-2xl p-4 sm:p-6 hover:border-[var(--theme-primary)] transition-all duration-300 hover:shadow-lg"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                              <h3 className="text-base sm:text-lg font-bold text-[var(--theme-foreground)]">
                                {service.name}
                              </h3>
                              <span className="text-xl sm:text-2xl font-black text-[var(--theme-primary)] sm:ml-4">
                                {formatPrice(service.price)}
                              </span>
                            </div>

                            {service.description && (
                              <p className="text-[var(--theme-foregroundSecondary)] mb-3 sm:mb-4 text-sm">
                                {service.description}
                              </p>
                            )}

                            <div className="flex items-center text-sm text-[var(--theme-foregroundSecondary)]">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDuration(service.duration)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--theme-secondary)] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-[var(--theme-cardForeground)] mb-2 sm:mb-3">Henüz Hizmet Eklenmemiş</h3>
                        <p className="text-[var(--theme-foregroundSecondary)] text-sm sm:text-base">Bu işletme henüz hizmet listesi oluşturmamış.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📅</div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-primaryForeground)] mb-2 sm:mb-3">
                  Hemen Randevu Al
                </h3>
                <p className="text-[var(--theme-primaryForeground)]/80 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                  Müsait zamanları görün ve kolayca randevunuzu oluşturun.
                </p>
                <Link
                  href={`/businesses/${business.slug}/book`}
                  className="block w-full bg-white/20 hover:bg-white/30 backdrop-blur text-[var(--theme-primaryForeground)] font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  Randevu Sistemi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {isGalleryOpen && business?.galleryImages && business.galleryImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeGallery();
            }}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 active:text-gray-400 transition-colors p-3 touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {business.galleryImages.length}
          </div>

          {/* Main image container */}
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4 sm:p-8">
            <div className="relative max-w-full max-h-full">
              <img
                src={business.galleryImages[currentImageIndex]}
                alt={`${business.name} galeri görseli ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdvcnNlbDwvdGV4dD48L3N2Zz4=';
                }}
              />

              {/* Navigation arrows */}
              {business.galleryImages.length > 1 && (
                <>
                  {/* Previous button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 active:text-gray-400 bg-black/50 hover:bg-black/70 active:bg-black/80 rounded-full p-3 sm:p-3 transition-all duration-300 group touch-manipulation"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Next button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 active:text-gray-400 bg-black/50 hover:bg-black/70 active:bg-black/80 rounded-full p-3 sm:p-3 transition-all duration-300 group touch-manipulation"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail navigation */}
          {business.galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
              {business.galleryImages.map((imageUrl, index) => (
                <button
                  key={`thumb-${index}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 touch-manipulation ${
                    index === currentImageIndex
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60 hover:scale-105 active:scale-95'
                  }`}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <img
                    src={imageUrl}
                    alt={`Küçük görsel ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeGallery}
          />
        </div>
      )}
    </div>
  );
}