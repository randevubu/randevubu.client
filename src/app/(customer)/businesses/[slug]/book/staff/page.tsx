'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { businessService } from '@/src/lib/services/business';
import { staffService, StaffWithUser } from '@/src/lib/services/staff';

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
      isOpen: boolean;
    };
  };
}

export default function StaffSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [staff, setStaff] = useState<StaffWithUser[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && serviceId) {
      fetchBusinessData();
    } else {
      // Redirect to service selection if no serviceId
      router.push(`/businesses/${slug}/book/service`);
    }
  }, [slug, serviceId]);

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
          await fetchBusinessStaff(response.data.id);
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

  const fetchBusinessStaff = async (businessId: string) => {
    try {
      setStaffLoading(true);
      setStaffError(null);
      const response = await staffService.getBusinessStaffForBooking(businessId);
      
      if (response.success && response.data?.staff) {
        const activeStaff = response.data.staff;
        setStaff(activeStaff);
        
        // Don't auto-select staff, let user choose
        // Even if there's only one staff member, show the selection page
      } else {
        throw new Error(response.error?.message || 'Staff bilgileri alınamadı');
      }
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Personel bilgileri yüklenirken bir hata oluştu';
      setStaffError(errorMessage);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleStaffSelect = (staff: StaffWithUser) => {
    setSelectedStaff(staff);
    // Navigate to datetime selection
    router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}&staffId=${staff.id}`);
  };

  const handleSkipStaff = () => {
    // Navigate to datetime selection without staff
    router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}`);
  };

  const retryStaffFetch = () => {
    if (business) {
      fetchBusinessStaff(business.id);
    }
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
              onClick={() => router.push(`/businesses/${slug}/book/service`)}
              className="flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>

            <h1 className="text-lg font-semibold text-[var(--theme-foreground)]">Personel Seçin</h1>

            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Staff Selection */}
        <div className="bg-[var(--theme-card)] rounded-xl shadow-lg border border-[var(--theme-border)] overflow-hidden">
         
          <div className="p-6">
            {staffLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--theme-foregroundSecondary)]">Personeller yükleniyor...</p>
              </div>
            ) : staffError ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-error)]/20 mb-4">
                  <svg className="h-8 w-8 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">Personel Bilgileri Yüklenemedi</h3>
                <p className="text-[var(--theme-foregroundSecondary)] mb-4">{staffError}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={retryStaffFetch}
                    className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-primary)]/90 transition-colors"
                  >
                    Tekrar Dene
                  </button>
                  <button
                    onClick={handleSkipStaff}
                    className="px-4 py-2 bg-[var(--theme-secondary)] text-[var(--theme-secondaryForeground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-secondary)]/90 transition-colors"
                  >
                    Personel Seçmeden Devam Et
                  </button>
                </div>
              </div>
            ) : staff.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((staffMember) => (
                  <div
                    key={staffMember.id}
                    className={`relative bg-[var(--theme-background)] border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedStaff?.id === staffMember.id 
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5' 
                        : 'border-[var(--theme-border)] hover:border-[var(--theme-primary)]'
                    }`}
                    onClick={() => handleStaffSelect(staffMember)}
                  >
                    {/* Selected indicator */}
                    {selectedStaff?.id === staffMember.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--theme-success)] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="text-center">
                      {/* Staff avatar */}
                      <div className="mx-auto mb-3">
                        {staffMember.user.avatar ? (
                          <img
                            src={staffMember.user.avatar}
                            alt={`${staffMember.user.firstName} ${staffMember.user.lastName}`}
                            className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[var(--theme-border)]"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center mx-auto border-2 border-[var(--theme-border)]">
                            <span className="text-[var(--theme-primary)] font-bold text-lg">
                              {staffMember.user.firstName?.charAt(0)}{staffMember.user.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Staff info */}
                      <div className="space-y-1">
                        <h4 className="font-semibold text-[var(--theme-foreground)] text-sm">
                          {staffMember.user.firstName} {staffMember.user.lastName}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          staffMember.role === 'OWNER' 
                            ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                            : staffMember.role === 'MANAGER'
                            ? 'bg-[var(--theme-accent)]/20 text-[var(--theme-accent)]'
                            : 'bg-[var(--theme-secondary)]/20 text-[var(--theme-secondary)]'
                        }`}>
                          {staffMember.role === 'OWNER' ? 'Sahip' : 
                           staffMember.role === 'MANAGER' ? 'Yönetici' : 'Personel'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
                  <svg className="h-8 w-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">Personel Bulunamadı</h3>
                <p className="text-[var(--theme-foregroundSecondary)] mb-4">Bu işletmede randevu alabileceğiniz aktif personel bulunmamaktadır.</p>
                <button
                  onClick={handleSkipStaff}
                  className="px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-primary)]/90 transition-colors"
                >
                  Personel Seçmeden Devam Et
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
