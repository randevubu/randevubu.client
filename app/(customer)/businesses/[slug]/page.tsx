'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { businessService } from '@/src/lib/services/business';
import { Business, BusinessType } from '@/src/types/business';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  currency?: string;
  isActive: boolean;
}

interface BusinessDetailsResponse extends Business {
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
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    about: true, // Hakkımızda open by default
    services: false,
    tags: false,
    workingHours: false
  });

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
              openTime: hours.open,
              closeTime: hours.close
            };
          });
        }
        setWorkingHours(transformedHours);
        
        // Set business type from API response
        if (businessData?.businessType) {
          setBusinessType(businessData.businessType);
        }
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
                    {business.isVerified && (
                      <div className="bg-green-500 text-white p-1.5 sm:p-2 rounded-full shadow-lg self-start sm:self-auto">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
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
              
              <Link
                href={`/businesses/${business.slug}/book`}
                className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryHover)] text-[var(--theme-primaryForeground)] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto text-center"
              >
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Randevu Al</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Description - Collapsible */}
              {business.description && (
                <div className="bg-[var(--theme-card)] rounded-3xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                  <button
                    onClick={() => toggleSection('about')}
                    className="w-full p-6 sm:p-8 text-left flex items-center justify-between hover:bg-[var(--theme-background)]/50 transition-colors"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--theme-cardForeground)]">Hakkımızda</h2>
                    <svg 
                      className={`w-6 h-6 text-[var(--theme-foregroundSecondary)] transition-transform duration-300 ${openSections.about ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.about && (
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                      <p className="text-[var(--theme-foregroundSecondary)] text-base sm:text-lg leading-relaxed">
                        {business.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Services - Collapsible */}
              <div className="bg-[var(--theme-card)] rounded-3xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
                <button
                  onClick={() => toggleSection('services')}
                  className="w-full p-6 sm:p-8 text-left flex items-center justify-between hover:bg-[var(--theme-background)]/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--theme-cardForeground)]">Hizmetlerimiz</h2>
                    <span className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-3 sm:px-4 py-2 rounded-full text-sm font-semibold">
                      {services.filter(s => s.isActive).length} Hizmet
                    </span>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-[var(--theme-foregroundSecondary)] transition-transform duration-300 ${openSections.services ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openSections.services && (
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8">
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
                        {Object.entries(workingHours).map(([day, hours]) => (
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
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
    </div>
  );
}