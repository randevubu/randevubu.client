'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { businessService } from '@/src/lib/services/business';
// Staff service removed - handled in previous booking steps
import Calendar from '@/src/components/ui/Calendar';
import { getDisabledDates } from '@/src/lib/utils/businessHours';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
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
      breaks: Array<{
        startTime: string;
        endTime: string;
        description: string;
      }>;
      isOpen: boolean;
    };
  };
  timezone?: string;
  reservationSettings?: {
    maxAdvanceBookingDays: number;
    minNotificationHours: number;
    maxDailyAppointments: number;
  };
}

// Removed unused TimeSlot interface

export default function DateTimeSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  // Staff selection is handled in previous step
  const [loading, setLoading] = useState(true);
  const [disabledDates, setDisabledDates] = useState<string[]>([]);

  useEffect(() => {
    if (slug && serviceId) {
      fetchBusinessData();
    } else {
      // Redirect to service selection if no serviceId
      router.push(`/businesses/${slug}/book/service`);
    }
  }, [slug, serviceId, staffId]);


  useEffect(() => {
    if (business) {
      fetchDisabledDates();
    }
  }, [business]);


  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await businessService.getBusinessById(slug);
      if (response.success && response.data) {
        setBusiness(response.data as BusinessData);
        const availableServices = (response.data as BusinessData).services?.filter((s: Service) => s.isActive) || [];

        // Find the selected service
        const service = availableServices.find((s: Service) => s.id === serviceId);
        if (service) {
          setSelectedService(service);

          // Staff information is handled in previous booking steps
        } else {
          // Service not found, redirect to service selection
          router.push(`/businesses/${slug}/book/service`);
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Staff fetching removed - handled in previous booking steps

  const fetchDisabledDates = () => {
    if (!business) return;

    try {
      // Use maxAdvanceBookingDays from reservation settings, default to 30 if not set
      const maxDays = business.reservationSettings?.maxAdvanceBookingDays || 30;

      // Use local business hours data instead of multiple API calls
      const disabled = getDisabledDates(business, maxDays);
      setDisabledDates(disabled);
      console.log('Disabled dates (using local data):', disabled);
      console.log('Max advance booking days:', maxDays);
    } catch (error) {
      console.error('Error calculating disabled dates:', error);
      // On error, don't disable any dates (fail gracefully)
      setDisabledDates([]);
    }
  };


  const handleDateSelect = (date: string) => {
    // Navigate to time selection page with selected date
    const params = new URLSearchParams({
      serviceId: serviceId!,
      ...(staffId && { staffId }),
      date
    });
    router.push(`/businesses/${slug}/book/time?${params.toString()}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-[var(--theme-card)] rounded-xl shadow-lg border border-[var(--theme-border)] overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--theme-foregroundSecondary)]">Yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business || !selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4">Hizmet Bulunamadı</h2>
          <p className="text-[var(--theme-foregroundSecondary)] mb-6">Seçilen hizmet mevcut değil.</p>
          <button
            onClick={() => router.push(`/businesses/${slug}/book/service`)}
            className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
          >
            Hizmet Seç
          </button>
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
            <button
              onClick={() => router.push(`/businesses/${slug}/book/staff?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}`)}
              className="flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>

            <h1 className="text-lg font-semibold text-[var(--theme-foreground)]">
              Tarih Seçin
            </h1>

            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Booking Window Information */}
        {business?.reservationSettings && (
          <div className="mb-6 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-[var(--theme-primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[var(--theme-foreground)] mb-1">
                  Randevu Kuralları
                </h3>
                <div className="text-sm text-[var(--theme-foregroundSecondary)] space-y-1">
                  {business.reservationSettings.minNotificationHours > 0 && (
                    <p>
                      • Randevular en az <strong>{business.reservationSettings.minNotificationHours} saat</strong> önceden alınmalıdır
                    </p>
                  )}
                  {business.reservationSettings.maxAdvanceBookingDays > 0 && (
                    <p>
                      • Randevular en fazla <strong>{business.reservationSettings.maxAdvanceBookingDays} gün</strong> önceden alınabilir
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="">
          <Calendar
            onDateSelect={handleDateSelect}
            minDate={(() => {
              // Calculate minimum booking date based on minNotificationHours
              const minHours = business?.reservationSettings?.minNotificationHours || 0;
              const minDate = new Date();
              minDate.setHours(minDate.getHours() + minHours);
              return minDate;
            })()}
            maxDate={(() => {
              // Calculate maximum booking date based on maxAdvanceBookingDays
              const maxDays = business?.reservationSettings?.maxAdvanceBookingDays || 30;
              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + maxDays);
              return maxDate;
            })()}
            disabledDates={disabledDates}
          />
        </div>

      </div>
    </div>
  );
}
