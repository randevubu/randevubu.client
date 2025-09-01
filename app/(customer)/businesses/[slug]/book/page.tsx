'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { businessService } from '@/src/lib/services/business';
import { appointmentService } from '@/src/lib/services/appointments';
import { useAuth } from '@/src/context/AuthContext';
import { showSuccessToast, handleApiError } from '@/src/lib/utils/toast';
import Calendar from '@/src/components/ui/Calendar';

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

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');
  
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [step, setStep] = useState<'service' | 'datetime' | 'time' | 'confirm'>('service');

  useEffect(() => {
    if (slug) {
      fetchBusinessData();
    }
  }, [slug, serviceId]);

  useEffect(() => {
    if (selectedService && selectedDate && business) {
      calculateAvailableSlots();
    }
  }, [selectedService, selectedDate, business]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await businessService.getBusinessById(slug);
              if (response.success && response.data) {
          setBusiness(response.data as BusinessData);
          const availableServices = (response.data as BusinessData).services?.filter((s: Service) => s.isActive) || [];
          setServices(availableServices);
        
        // Auto-select service if provided in URL
        if (serviceId) {
          const service = availableServices.find((s: Service) => s.id === serviceId);
          if (service) {
            setSelectedService(service);
            setStep('datetime');
          }
        } else if (availableServices.length === 1) {
          // Auto-select if only one service
          setSelectedService(availableServices[0]);
          setStep('datetime');
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvailableSlots = async () => {
    if (!selectedService || !selectedDate || !business) return;
    
    try {
      setSlotsLoading(true);
      
      // Get existing appointments for the selected date
      const response = await appointmentService.getBusinessAppointments({
        businessId: business.id,
        startDate: selectedDate,
        endDate: selectedDate
      });
      
      const existingAppointments = (response.success && response.data && response.data.appointments) ? response.data.appointments : [];
      
      // Calculate available slots based on business hours and existing appointments
      const slots = generateTimeSlots(selectedDate, selectedService, existingAppointments, business);
      setAvailableSlots(slots);
      
    } catch (error) {
      console.error('Error calculating available slots:', error);
      // On error, generate basic slots without appointment checking
      const basicSlots = generateBasicTimeSlots(selectedDate, selectedService);
      setAvailableSlots(basicSlots);
    } finally {
      setSlotsLoading(false);
    }
  };
  
  const generateBasicTimeSlots = (date: string, service: Service): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Default business hours if none available
    const defaultOpenTime = 9 * 60; // 9:00 AM in minutes
    const defaultCloseTime = 17 * 60; // 5:00 PM in minutes
    const slotDuration = 30; // 30 minutes
    
    let currentTime = defaultOpenTime;
    
    while (currentTime < defaultCloseTime - service.duration) {
      const timeString = formatTime(currentTime);
      slots.push({
        time: timeString,
        available: true // All slots available as fallback
      });
      currentTime += slotDuration;
    }
    
    return slots;
  };

  const generateTimeSlots = (date: string, service: Service, existingAppointments: any[], businessData: BusinessData): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Ensure business data exists
    if (!businessData || !businessData.businessHours) {
      console.warn('Business data or business hours not available');
      return slots;
    }
    
    // Ensure existingAppointments is an array
    const appointments = Array.isArray(existingAppointments) ? existingAppointments : [];
    
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Map day names to match API format
    const dayMapping: { [key: string]: string } = {
      'Monday': 'monday',
      'Tuesday': 'tuesday', 
      'Wednesday': 'wednesday',
      'Thursday': 'thursday',
      'Friday': 'friday',
      'Saturday': 'saturday',
      'Sunday': 'sunday'
    };
    
    const selectedDay = dayMapping[dayName];
    
    // Get business hours for the selected day
    const dayHours = businessData.businessHours[selectedDay];
    if (!dayHours || !dayHours.isOpen) {
      return slots; // Business is closed
    }
    
    // Parse business hours
    const openTime = parseTime(dayHours.open || '09:00');
    const closeTime = parseTime(dayHours.close || '17:00');
    
    // Generate 30-minute slots (you can adjust this)
    const slotDuration = 30; // minutes
    let currentTime = openTime;
    
    while (currentTime < closeTime - service.duration) {
      const timeString = formatTime(currentTime);
      const endTime = currentTime + service.duration;
      
      // Check if this slot conflicts with existing appointments
      const isAvailable = !appointments.some(apt => {
        if (!apt || !apt.startTime) return false; // Skip if no appointment or start time
        
        try {
          const aptStart = parseTime(apt.startTime);
          const aptEnd = aptStart + (apt.service?.duration || apt.duration || 60);
          
          // Check for overlap
          return (currentTime < aptEnd && endTime > aptStart);
        } catch (error) {
          console.warn('Error parsing appointment time:', apt.startTime, error);
          return false;
        }
      });
      
      slots.push({
        time: timeString,
        available: isAvailable
      });
      
      currentTime += slotDuration;
    }
    
    return slots;
  };
  
  const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirm');
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!business || !selectedService || !selectedDate || !selectedTime) {
      handleApiError({ error: { message: 'Lütfen tüm bilgileri doldurun.' } });
      return;
    }

    try {
      setBookingLoading(true);
      
      const response = await appointmentService.createAppointment({
        businessId: business.id,
        serviceId: selectedService.id,
        date: selectedDate,
        startTime: selectedTime,
        customerNotes: notes.trim() || undefined
      });

      if (response.success) {
        showSuccessToast('🎉 Randevunuz başarıyla oluşturuldu!');
        router.push('/appointments');
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
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

  const handleCalendarDateSelect = (date: string) => {
    handleDateSelect(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-[var(--theme-foregroundSecondary)] text-lg">Randevu sistemi yükleniyor...</p>
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--theme-background)]/90 backdrop-blur-xl border-b border-[var(--theme-border)]/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={`/businesses/${slug}`}
              className="inline-flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors group"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {business.name}
            </Link>
            
            {/* Step Indicator */}
            <div className="hidden md:flex items-center space-x-3">
              <div className={`flex items-center ${step === 'service' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foregroundMuted)]'}`}>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${step === 'service' ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)]' : 'border-[var(--theme-foregroundMuted)]'}`}>
                  1
                </div>
                <span className="ml-2 font-medium text-sm">Hizmet</span>
              </div>
              <div className={`w-6 h-px ${step !== 'service' ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-foregroundMuted)]'}`}></div>
              <div className={`flex items-center ${step === 'datetime' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foregroundMuted)]'}`}>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${step === 'datetime' ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)]' : 'border-[var(--theme-foregroundMuted)]'}`}>
                  2
                </div>
                <span className="ml-2 font-medium text-sm">Tarih</span>
              </div>
              <div className={`w-6 h-px ${step === 'time' || step === 'confirm' ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-foregroundMuted)]'}`}></div>
              <div className={`flex items-center ${step === 'time' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foregroundMuted)]'}`}>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${step === 'time' ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)]' : 'border-[var(--theme-foregroundMuted)]'}`}>
                  3
                </div>
                <span className="ml-2 font-medium text-sm">Saat</span>
              </div>
              <div className={`w-6 h-px ${step === 'confirm' ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-foregroundMuted)]'}`}></div>
              <div className={`flex items-center ${step === 'confirm' ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foregroundMuted)]'}`}>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${step === 'confirm' ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)]' : 'border-[var(--theme-foregroundMuted)]'}`}>
                  4
                </div>
                <span className="ml-2 font-medium text-sm">Onayla</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Business Info Card */}
        <div className="bg-[var(--theme-card)] rounded-2xl p-6 shadow-xl border border-[var(--theme-border)] mb-8">
          <div className="flex items-center space-x-4">
            {business.logoUrl && (
              <img src={business.logoUrl} alt={business.name} className="w-12 h-12 rounded-xl object-cover" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-[var(--theme-cardForeground)]">{business.name}</h1>
              <div className="flex items-center text-[var(--theme-foregroundSecondary)] text-sm">
                {business.businessType && (
                  <>
                    <span className="mr-1">{business.businessType.icon}</span>
                    <span>{business.businessType.displayName}</span>
                  </>
                )}
                {business.businessType && business.city && business.state && <span className="mx-2">•</span>}
                {business.city && business.state && (
                  <span>{business.city}, {business.state}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--theme-border)]">
              <h2 className="text-2xl font-bold text-[var(--theme-cardForeground)] mb-2">Hizmet Seçin</h2>
              <p className="text-[var(--theme-foregroundSecondary)]">Randevu almak istediğiniz hizmeti seçin.</p>
            </div>
            
            <div className="p-8">
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="text-left bg-[var(--theme-background)] border-2 border-[var(--theme-border)] rounded-2xl p-6 hover:border-[var(--theme-primary)] transition-all duration-300 hover:shadow-lg group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-[var(--theme-foreground)] group-hover:text-[var(--theme-primary)] transition-colors">
                          {service.name}
                        </h3>
                        <span className="text-2xl font-black text-[var(--theme-primary)] ml-4">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      
                      {service.description && (
                        <p className="text-[var(--theme-foregroundSecondary)] mb-4 text-sm">
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
                  <p className="text-[var(--theme-foregroundSecondary)]">Bu işletme henüz hizmet eklenmemiş.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 'datetime' && selectedService && (
          <div className="space-y-8">
            {/* Selected Service Summary */}
            <div className="bg-[var(--theme-card)] rounded-2xl p-6 shadow-xl border border-[var(--theme-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--theme-cardForeground)]">{selectedService.name}</h3>
                  <p className="text-[var(--theme-foregroundSecondary)] text-sm">{formatDuration(selectedService.duration)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[var(--theme-primary)]">
                    {formatPrice(selectedService.price)}
                  </div>
                  <button 
                    onClick={() => setStep('service')}
                    className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] text-sm transition-colors"
                  >
                    Değiştir
                  </button>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
              <div className="p-8 border-b border-[var(--theme-border)]">
                <h2 className="text-2xl font-bold text-[var(--theme-cardForeground)] mb-2">Tarih Seçin</h2>
                <p className="text-[var(--theme-foregroundSecondary)]">Randevu için müsait olan tarihi seçin.</p>
              </div>
              
              <div className="p-8">
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleCalendarDateSelect}
                  minDate={new Date()}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Time Selection */}
        {step === 'time' && selectedService && selectedDate && (
          <div className="space-y-8">
            {/* Selected Service & Date Summary */}
            <div className="bg-[var(--theme-card)] rounded-2xl p-6 shadow-xl border border-[var(--theme-border)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[var(--theme-cardForeground)] mb-2">Hizmet</h4>
                  <h3 className="text-lg font-bold text-[var(--theme-cardForeground)]">{selectedService.name}</h3>
                  <p className="text-[var(--theme-foregroundSecondary)] text-sm">{formatDuration(selectedService.duration)}</p>
                  <p className="text-xl font-black text-[var(--theme-primary)] mt-1">{formatPrice(selectedService.price)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--theme-cardForeground)] mb-2">Tarih</h4>
                  <h3 className="text-lg font-bold text-[var(--theme-cardForeground)]">{getDateDisplayName(selectedDate)}</h3>
                  <p className="text-[var(--theme-foregroundSecondary)] text-sm">
                    {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                  <button 
                    onClick={() => setStep('datetime')}
                    className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] text-sm transition-colors mt-1"
                  >
                    Değiştir
                  </button>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
              <div className="p-8 border-b border-[var(--theme-border)]">
                <h2 className="text-2xl font-bold text-[var(--theme-cardForeground)] mb-2">Saat Seçin</h2>
                <p className="text-[var(--theme-foregroundSecondary)]">Seçtiğiniz tarih için müsait olan saati seçin.</p>
              </div>
              
              <div className="p-8">
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-[var(--theme-foregroundSecondary)]">Müsait saatler yükleniyor...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`p-4 text-sm rounded-xl border-2 transition-all duration-300 ${
                          !slot.available
                            ? 'bg-[var(--theme-secondary)] text-[var(--theme-foregroundMuted)] border-[var(--theme-border)] cursor-not-allowed opacity-50'
                            : selectedTime === slot.time
                            ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] border-[var(--theme-primary)] scale-105 shadow-lg'
                            : 'bg-[var(--theme-background)] text-[var(--theme-foreground)] border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:scale-105'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-[var(--theme-foregroundMuted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[var(--theme-foregroundSecondary)] text-lg">Seçilen tarih için müsait saat bulunmuyor</p>
                    <p className="text-[var(--theme-foregroundMuted)] text-sm mt-2">Lütfen başka bir tarih seçmeyi deneyin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && selectedService && selectedDate && selectedTime && (
          <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
            <div className="p-8 border-b border-[var(--theme-border)]">
              <h2 className="text-2xl font-bold text-[var(--theme-cardForeground)] mb-2">Randevu Onayı</h2>
              <p className="text-[var(--theme-foregroundSecondary)]">Randevu bilgilerinizi kontrol edin ve onaylayın.</p>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Appointment Summary */}
              <div className="bg-[var(--theme-background)] rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-[var(--theme-foreground)] mb-3">Hizmet</h4>
                    <div className="space-y-2">
                      <p className="font-medium text-[var(--theme-foreground)]">{selectedService.name}</p>
                      <p className="text-sm text-[var(--theme-foregroundSecondary)]">{formatDuration(selectedService.duration)}</p>
                      <p className="text-lg font-bold text-[var(--theme-primary)]">{formatPrice(selectedService.price)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-[var(--theme-foreground)] mb-3">Tarih & Saat</h4>
                    <div className="space-y-2">
                      <p className="font-medium text-[var(--theme-foreground)]">{getDateDisplayName(selectedDate)}</p>
                      <p className="text-sm text-[var(--theme-foregroundSecondary)]">
                        {new Date(selectedDate).toLocaleDateString('tr-TR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-lg font-bold text-[var(--theme-primary)]">{selectedTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[var(--theme-cardForeground)] mb-3">
                  Not (İsteğe Bağlı)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Randevunuz hakkında özel bir notunuz varsa buraya yazabilirsiniz..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundMuted)] transition-colors resize-none"
                />
              </div>

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
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                <button
                  onClick={() => setStep('time')}
                  className="w-full sm:w-auto text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] font-medium transition-colors py-3 px-6 rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:bg-[var(--theme-background)]"
                >
                  ← Geri Dön
                </button>
                
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || !isAuthenticated}
                  className="w-full sm:w-auto bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] py-4 px-8 rounded-2xl font-bold text-lg hover:from-[var(--theme-primaryHover)] hover:to-[var(--theme-accentHover)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl disabled:shadow-none"
                >
                  {bookingLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Randevu Oluşturuluyor...</span>
                    </div>
                  ) : !isAuthenticated ? (
                    'Giriş Yap ve Randevu Oluştur'
                  ) : (
                    'Randevuyu Onayla'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}