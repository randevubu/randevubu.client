'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { businessService } from '@/src/lib/services/business';
import { appointmentService } from '@/src/lib/services/appointments';
import { staffService, StaffWithUser } from '@/src/lib/services/staff';
import { useAuth } from '@/src/context/AuthContext';
import { showSuccessToast, showErrorToast, handleApiError } from '@/src/lib/utils/toast';
import { getPolicyErrorMessage } from '@/src/lib/utils/policyValidation';
import NameCollectionDialog from '@/src/components/ui/NameCollectionDialog';
import { isProfileComplete } from '@/src/lib/utils/profileValidation';

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
  settings?: {
    priceVisibility?: {
      showPriceOnBooking: boolean;
      priceDisplayMessage: string | null;
      hideAllServicePrices: boolean;
    };
  };
}

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && serviceId && date && time) {
      fetchBusinessData();
    } else {
      // Redirect to service selection if required params are missing
      router.push(`/businesses/${slug}/book/service`);
    }
  }, [slug, serviceId, staffId, date, time]);

  // Check if user profile is complete when page loads
  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      if (!isProfileComplete(user)) {
        setShowNameDialog(true);
      }
    }
  }, [user, isAuthenticated, loading]);

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
          
          // Fetch staff if staffId is provided
          if (staffId) {
            await fetchSelectedStaff(response.data.id, staffId);
          }
        } else {
          // Service not found, redirect to service selection
          router.push(`/businesses/${slug}/book/service`);
        }
      }
    } catch (error) {
      // Error fetching business data - silently fail and show loading state
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedStaff = async (businessId: string, staffId: string) => {
    try {
      const response = await staffService.getBusinessStaffForBooking(businessId);
      if (response.success && response.data?.staff) {
        const staff = response.data.staff.find(s => s.id === staffId);
        if (staff) {
          setSelectedStaff(staff);
        }
      }
    } catch (error) {
      // Error fetching staff - silently fail
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Check if profile is complete (has first name and last name)
    if (!isProfileComplete(user)) {
      setShowNameDialog(true);
      return;
    }

    if (!business || !selectedService || !date || !time) {
      handleApiError({ error: { message: 'Lütfen tüm bilgileri doldurun.' } });
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingLoading(true);
      setBookingError(null); // Clear previous errors

      // Debug: Log the appointment data being sent
      const appointmentData = {
        businessId: business.id,
        serviceId: selectedService.id,
        staffId: selectedStaff?.id,
        date: date,
        startTime: time,
        customerNotes: notes.trim() || undefined
      };
      
      console.log('📅 Appointment data being sent:', appointmentData);
      console.log('🕐 Current time:', new Date().toISOString());
      console.log('📅 Appointment datetime would be:', new Date(`${date}T${time}:00`).toISOString());
      console.log('⏰ Hours difference:', (new Date(`${date}T${time}:00`).getTime() - new Date().getTime()) / (1000 * 60 * 60));

      const response = await appointmentService.createAppointment(appointmentData);

      if (response.success) {
        showSuccessToast('🎉 Randevunuz başarıyla oluşturuldu!');
        // Add a small delay to ensure the toast is visible before redirecting
        setTimeout(() => {
          router.push('/appointments');
        }, 1500);
        return;
      } else {
        // Get user-friendly error message for policy violations
        const errorMessage = getPolicyErrorMessage(response.error || 'Randevu oluşturulurken bir sorun oluştu');
        setBookingError(errorMessage);
        showErrorToast(errorMessage);
        setIsSubmitting(false);
      }
    } catch (error: any) {
      // Get user-friendly error message for policy violations
      const errorMessage = getPolicyErrorMessage(error?.response?.data?.error || error);
      setBookingError(errorMessage);
      showErrorToast(errorMessage);
      setIsSubmitting(false);
    } finally {
      setBookingLoading(false);
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

  const getDateDisplayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Yarın';
    } else {
      return date.toLocaleDateString('tr-TR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const handleNameDialogClose = () => {
    setShowNameDialog(false);
  };

  const handleNameDialogSuccess = () => {
    setShowNameDialog(false);
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

  if (!business || !selectedService || !date || !time) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4">Bilgi Bulunamadı</h2>
          <p className="text-[var(--theme-foregroundSecondary)] mb-6">Randevu bilgileri eksik.</p>
          <button
            onClick={() => router.push(`/businesses/${slug}/book/service`)}
            className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
          >
            Baştan Başla
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
              onClick={() => router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}&date=${date}&time=${time}`)}
              className="flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>

            <h1 className="text-lg font-semibold text-[var(--theme-foreground)]">Randevu Onayı</h1>

            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-4xl mx-auto px-4 py-6 ${showNameDialog ? 'pointer-events-none opacity-50' : ''}`}>
        {/* Business Info */}
        <div className="bg-[var(--theme-card)] rounded-2xl p-6 shadow-xl border border-[var(--theme-border)] mb-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--theme-foreground)] mb-2">{business.name}</h2>
            {business.businessType && (
              <p className="text-sm text-[var(--theme-foregroundSecondary)]">
                {business.businessType.icon} {business.businessType.displayName}
              </p>
            )}
          </div>
        </div>

        {/* Appointment Summary */}
        <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pb-4 border-b border-[var(--theme-border)]">
                <h4 className="font-semibold text-[var(--theme-foreground)] mb-3">Hizmet</h4>
                <div className="space-y-2">
                  <p className="font-medium text-[var(--theme-foreground)]">{selectedService.name}</p>
                  <p className="text-sm text-[var(--theme-foregroundSecondary)]">{formatDuration(selectedService.duration)}</p>
                  {selectedService.price !== null && selectedService.price !== undefined && 
                   !business.settings?.priceVisibility?.hideAllServicePrices && (
                    <p className="text-lg font-bold text-[var(--theme-primary)]">{formatPrice(selectedService.price)}</p>
                  )}
                </div>
              </div>

              {selectedStaff && (
                <div className="pb-4 border-b border-[var(--theme-border)]">
                  <h4 className="font-semibold text-[var(--theme-foreground)] mb-3">Personel</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {selectedStaff.user.avatar ? (
                        <img
                          src={selectedStaff.user.avatar}
                          alt={`${selectedStaff.user.firstName} ${selectedStaff.user.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center">
                          <span className="text-[var(--theme-primary)] font-bold text-sm">
                            {selectedStaff.user.firstName?.charAt(0)}{selectedStaff.user.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-[var(--theme-foreground)]">
                          {selectedStaff.user.firstName} {selectedStaff.user.lastName}
                        </p>
                        <p className="text-sm text-[var(--theme-foregroundSecondary)]">
                          {selectedStaff.role === 'OWNER' ? 'Sahip' : 
                           selectedStaff.role === 'MANAGER' ? 'Yönetici' : 'Personel'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pb-4 border-b border-[var(--theme-border)]">
                <h4 className="font-semibold text-[var(--theme-foreground)] mb-3">Tarih & Saat</h4>
                <div className="space-y-2">
                  <p className="font-medium text-[var(--theme-foreground)]">{getDateDisplayName(date)}</p>
                  <p className="text-sm text-[var(--theme-foregroundSecondary)]">
                    {new Date(date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-lg font-bold text-[var(--theme-primary)]">{time}</p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="pt-4">
              <label htmlFor="notes" className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
                Notlar (İsteğe bağlı)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Randevunuz hakkında özel notlarınızı buraya yazabilirsiniz..."
                className="w-full p-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-[var(--theme-foregroundMuted)] mt-1">
                {notes.length}/500 karakter
              </p>
            </div>

            {/* Booking Error Display */}
            {bookingError && (
              <div className="bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[var(--theme-error)] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--theme-error)] mb-1">Randevu Oluşturulamadı</h4>
                    <p className="text-sm text-[var(--theme-error)]">{bookingError}</p>
                  </div>
                  <button
                    onClick={() => setBookingError(null)}
                    className="ml-2 text-[var(--theme-error)] hover:text-[var(--theme-error)]/70 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Auth Notice */}
            {!isAuthenticated && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">Giriş Yapmanız Gerekiyor</h4>
                    <p className="text-sm text-amber-700">Randevu oluşturmak için önce hesabınıza giriş yapmanız gerekiyor.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                onClick={() => router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}&date=${date}&time=${time}`)}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors py-3 px-6 rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:bg-[var(--theme-background)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[var(--theme-border)]"
              >
                ← Geri Dön
              </button>

              <button
                onClick={handleBooking}
                disabled={isSubmitting || !isAuthenticated}
                className="w-full sm:w-auto bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] py-4 px-8 rounded-2xl font-bold text-lg hover:from-[var(--theme-primaryHover)] hover:to-[var(--theme-accentHover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl disabled:shadow-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : !isAuthenticated ? (
                  'Giriş Yap ve Randevu Oluştur'
                ) : (
                  'Randevu Onayla'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Name Collection Dialog */}
      <NameCollectionDialog
        isOpen={showNameDialog}
        onClose={handleNameDialogClose}
        onSuccess={handleNameDialogSuccess}
        title="Randevu Almak İçin Bilgilerinizi Tamamlayın"
        description="Randevu sistemi sayfasına erişmek için ad ve soyad bilgilerinizi girmeniz gerekiyor."
      />
    </div>
  );
}
