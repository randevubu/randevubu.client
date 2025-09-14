'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { businessService } from '@/src/lib/services/business';
import { servicesService } from '@/src/lib/services/services';
import { staffService } from '@/src/lib/services/staff';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number | null;
  duration: number;
  currency?: string;
  isActive: boolean;
}

interface BusinessData {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  city?: string;
  state?: string;
  businessType?: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
    category: string;
  };
  services?: Service[];
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
}

export default function ServiceSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null);
  const [priceSettings, setPriceSettings] = useState<{
    hideAllServicePrices: boolean;
    showPriceOnBooking: boolean;
  } | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBusinessData();
    }
  }, [slug, serviceId]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      
      // Get business info
      const businessResponse = await businessService.getBusinessBySlug(slug);
      if (businessResponse.success && businessResponse.data) {
        const businessData = businessResponse.data as BusinessData;
        setBusiness(businessData);
        
        // Store price settings
        setPriceSettings({
          hideAllServicePrices: (businessData as any).priceSettings?.hideAllServicePrices || false,
          showPriceOnBooking: (businessData as any).priceSettings?.showPriceOnBooking || true
        });

        // Get public services using the dedicated endpoint
        const servicesResponse = await servicesService.getPublicServices(businessData.id);
        if (servicesResponse.success && servicesResponse.data) {
          const availableServices = servicesResponse.data.filter((s: Service) => s.isActive);
          setServices(availableServices);

          // Mark service as pre-selected if provided in URL
          if (serviceId) {
            const service = availableServices.find((s: Service) => s.id === serviceId);
            if (service) {
              setPreSelectedServiceId(serviceId);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    // Navigate to staff selection with service ID
    router.push(`/businesses/${slug}/book/staff?serviceId=${service.id}`);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-[var(--theme-card)] rounded-xl shadow-lg border border-[var(--theme-border)] overflow-hidden">
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-[var(--theme-background)] border-2 border-[var(--theme-border)] rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-6 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse w-2/3"></div>
                      <div className="h-8 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse w-1/4"></div>
                    </div>
                    <div className="h-4 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse mb-4 w-full"></div>
                    <div className="h-4 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4">İşletme Bulunamadı</h2>
          <p className="text-[var(--theme-foregroundSecondary)] mb-6">Randevu almak istediğiniz işletme mevcut değil.</p>
          <Link
            href="/businesses"
            className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
          >
            İşletmeleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-[var(--theme-background)]/90 backdrop-blur-xl border-b border-[var(--theme-border)]/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/businesses/${slug}`}
              className="flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </Link>

            <h1 className="text-lg font-semibold text-[var(--theme-foreground)]">Hizmet Seçin</h1>

            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Service Selection */}
        <div className="bg-[var(--theme-card)] rounded-xl shadow-lg border border-[var(--theme-border)] overflow-hidden">
          <div className="p-6">
            {services.length > 0 ? (
              <div className="space-y-4">
                                 {services.map((service) => (
                   <button
                     key={service.id}
                     onClick={() => handleServiceSelect(service)}
                     className={`w-full text-left bg-[var(--theme-background)] border rounded-lg p-6 transition-all duration-200 hover:shadow-md group relative ${
                       preSelectedServiceId === service.id 
                         ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5' 
                         : 'border-[var(--theme-border)] hover:border-[var(--theme-primary)]'
                     }`}
                   >
                    {/* Pre-selected indicator */}
                    {preSelectedServiceId === service.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--theme-success)] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-[var(--theme-foreground)] group-hover:text-[var(--theme-primary)] transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center">
                        {!priceSettings?.hideAllServicePrices && service.price !== null ? (
                          <span className="text-xl font-black text-[var(--theme-primary)]">
                            {formatPrice(service.price)}
                          </span>
                        ) : service.price === null ? (
                          <div className="relative group">
                            <svg 
                              className="w-5 h-5 text-[var(--theme-foregroundSecondary)] cursor-help" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                              <div className="bg-[var(--theme-foreground)] text-[var(--theme-background)] text-xs rounded py-1 px-2 whitespace-nowrap">
                                Bu işletme fiyatları yeni müşterilere göstermemektedir
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-[var(--theme-foregroundSecondary)] italic">
                            Fiyat bilgisi için iletişime geçin
                          </span>
                        )}
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-3 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-[var(--theme-foregroundSecondary)]">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(service.duration)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
                  <svg className="h-8 w-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">Hizmet Bulunamadı</h3>
                <p className="text-[var(--theme-foregroundSecondary)]">Bu işletme henüz hizmet eklenmemiş.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
