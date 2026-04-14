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
      open?: string;
      close?: string;
      openTime?: string;
      closeTime?: string;
      isOpen: boolean;
      breaks: Array<{
        startTime: string;
        endTime: string;
        description: string;
      }>;
    };
  };
  settings?: {
    priceVisibility?: {
      showPriceOnBooking: boolean;
      priceDisplayMessage: string | null;
      hideAllServicePrices: boolean;
    };
  };
  timezone?: string;
  reservationSettings?: {
    maxAdvanceBookingDays: number;
    minNotificationHours: number;
    maxDailyAppointments: number;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  isOccupied?: boolean;
  insufficientTime?: boolean;
}

export default function TimeSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const selectedDate = searchParams.get('date');

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithUser | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const formatDateParam = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const goToNextDay = () => {
    if (!selectedDate) return;
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + 1);
    const nextDate = formatDateParam(dateObj);
    const params = new URLSearchParams({
      serviceId: serviceId!,
      ...(staffId && { staffId }),
      date: nextDate
    });
    router.push(`/businesses/${slug}/book/time?${params.toString()}`);
  };

  useEffect(() => {
    if (slug && serviceId && selectedDate) {
      fetchBusinessData();
    } else {
      // Redirect back to date selection if missing parameters
      router.push(`/businesses/${slug}/book/datetime${serviceId ? `?serviceId=${serviceId}` : ''}`);
    }
  }, [slug, serviceId, staffId, selectedDate]);

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
      console.error('Error fetching business data:', error);
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
      console.error('Error fetching staff:', error);
    }
  };

  const parseISOToMinutes = (isoString: string): number => {
    try {
      const date = new Date(isoString);
      return date.getUTCHours() * 60 + date.getUTCMinutes();
    } catch {
      return 0;
    }
  };

  const buildSlotsFromHours = (
    openTime: string,
    closeTime: string,
    serviceDuration: number,
    blockedRanges: Array<{ start: number; end: number }>
  ): TimeSlot[] => {
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    const slots: TimeSlot[] = [];

    for (let hour = openHour; hour < closeHour || (hour === closeHour && 0 < closeMinute); hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === closeHour && minute >= closeMinute) break;
        if (hour === openHour && minute < openMinute) continue;

        const slotStartMinutes = hour * 60 + minute;
        const serviceEndMinutes = slotStartMinutes + serviceDuration;
        const closeMinutes = closeHour * 60 + closeMinute;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        if (serviceEndMinutes > closeMinutes) {
          slots.push({ time: timeString, available: false });
          continue;
        }

        const isOccupied = blockedRanges.some(range =>
          slotStartMinutes >= range.start && slotStartMinutes < range.end
        );

        if (isOccupied) {
          slots.push({ time: timeString, available: false, isOccupied: true });
          continue;
        }

        const hasInsufficientTime = blockedRanges.some(range =>
          range.start > slotStartMinutes && serviceEndMinutes > range.start
        );

        if (hasInsufficientTime) {
          slots.push({ time: timeString, available: false, insufficientTime: true });
          continue;
        }

        slots.push({ time: timeString, available: true });
      }
    }
    return slots;
  };

  const getLocalBusinessHours = (): { openTime: string; closeTime: string } | null => {
    if (!business?.businessHours || !selectedDate) return null;
    const dayOfWeek = new Date(selectedDate).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const hours = business.businessHours[dayName];
    if (!hours?.isOpen) return null;
    const openTime = hours.openTime || hours.open;
    const closeTime = hours.closeTime || hours.close;
    if (!openTime || !closeTime) return null;
    return { openTime, closeTime };
  };

  const calculateAvailableSlots = async () => {
    if (!selectedService || !selectedDate || !business) return;

    try {
      setSlotsLoading(true);
      const serviceDuration = selectedService.duration;

      const response = await businessService.getAvailableSlots(business.id, {
        date: selectedDate,
        serviceId: selectedService.id,
        ...(staffId && { staffId }),
      });

      if (response.success && response.data) {
        const { bookedRanges, businessHours: apiBusinessHours } = response.data;
        const blockedRanges = (bookedRanges || []).map(r => ({
          start: parseISOToMinutes(r.startTime),
          end: parseISOToMinutes(r.endTime),
        }));

        // Use API business hours if available, otherwise fall back to local
        let openTime = apiBusinessHours?.openTime;
        let closeTime = apiBusinessHours?.closeTime;
        let isOpen = apiBusinessHours?.isOpen;

        if (!isOpen || !openTime || !closeTime) {
          const localHours = getLocalBusinessHours();
          if (localHours) {
            openTime = localHours.openTime;
            closeTime = localHours.closeTime;
            isOpen = true;
          }
        }

        if (!isOpen || !openTime || !closeTime) {
          setAvailableSlots([]);
          return;
        }

        setAvailableSlots(buildSlotsFromHours(openTime, closeTime, serviceDuration, blockedRanges));
      } else {
        // API returned unsuccessful - use local business hours without availability data
        const localHours = getLocalBusinessHours();
        if (localHours) {
          setAvailableSlots(buildSlotsFromHours(localHours.openTime, localHours.closeTime, serviceDuration, []));
        } else {
          setAvailableSlots([]);
        }
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // API failed - use local business hours without availability data
      const localHours = getLocalBusinessHours();
      if (localHours) {
        setAvailableSlots(buildSlotsFromHours(localHours.openTime, localHours.closeTime, selectedService.duration, []));
      } else {
        setAvailableSlots(generateFallbackSlots());
      }
    } finally {
      setSlotsLoading(false);
    }
  };

  const generateFallbackSlots = (): TimeSlot[] => {
    if (!business || !selectedDate) return [];
    const dayOfWeek = new Date(selectedDate).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const hours = business.businessHours?.[dayName];

    if (!hours?.isOpen) return [];

    const openTime = hours.openTime || hours.open;
    const closeTime = hours.closeTime || hours.close;
    if (!openTime || !closeTime) return [];

    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    const slots: TimeSlot[] = [];

    for (let hour = openHour; hour < closeHour || (hour === closeHour && 0 < closeMinute); hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === closeHour && minute >= closeMinute) break;
        if (hour === openHour && minute < openMinute) continue;
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: true
        });
      }
    }
    return slots;
  };

  const isTimeSlotInPast = (date: string, timeSlot: string) => {
    const now = new Date();

    // Create a date object for the selected time slot
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(year, month - 1, day, hour, minute);

    // Calculate minimum booking time based on minNotificationHours
    const minHours = business?.reservationSettings?.minNotificationHours || 0;
    const minBookingTime = new Date(now.getTime() + (minHours * 60 * 60 * 1000));

    // Slot is in the past if it's before the minimum booking time
    return slotDateTime <= minBookingTime;
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // Navigate to confirmation page
    const params = new URLSearchParams({
      serviceId: serviceId!,
      ...(staffId && { staffId }),
      date: selectedDate!,
      time
    });
    router.push(`/businesses/${slug}/book/confirm?${params.toString()}`);
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

  if (!business || !selectedService || !selectedDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4">Bilgiler Eksik</h2>
          <p className="text-[var(--theme-foregroundSecondary)] mb-6">Gerekli bilgiler bulunamadı.</p>
          <button
            onClick={() => router.push(`/businesses/${slug}/book/datetime${serviceId ? `?serviceId=${serviceId}` : ''}`)}
            className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
          >
            Tarih Seçin
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
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}`)}
              className="flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>

            <h1 className="text-lg font-semibold text-[var(--theme-foreground)]">
              Saat Seçin
            </h1>

            <button
              onClick={goToNextDay}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/20 transition-colors"
            >
              Sonraki Gün
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Time Selection */}
        <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
          
          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            {slotsLoading ? (
              <div className="space-y-1">
                {[...Array(24)].map((_, index) => {
                  const isHourStart = index % 4 === 0;
                  return (
                    <div
                      key={index}
                      className={`flex items-stretch ${isHourStart ? 'border-b-2 border-[var(--theme-border)]' : 'border-b border-[var(--theme-border)]/50'
                        }`}
                      style={{ minHeight: '40px' }}
                    >
                      <div className="w-16 px-3 py-2 bg-[var(--theme-backgroundSecondary)] border-r border-[var(--theme-border)] flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 p-3 bg-[var(--theme-backgroundSecondary)] animate-pulse"></div>
                    </div>
                  );
                })}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="space-y-1">
                {availableSlots.map((slot) => {
                  const isHourStart = slot.time.endsWith(':00');
                  const isPast = isTimeSlotInPast(selectedDate, slot.time);
                  const isDisabled = !slot.available || isPast;

                  return (
                    <div
                      key={slot.time}
                      className={`flex items-stretch ${isHourStart ? 'border-b-2 border-[var(--theme-border)]' : 'border-b border-[var(--theme-border)]/50'
                        }`}
                      style={{ minHeight: '40px' }}
                    >
                      {/* Time Column */}
                      <div className={`w-16 px-3 py-2 text-xs font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-backgroundSecondary)] border-r border-[var(--theme-border)] flex items-center flex-shrink-0 ${isHourStart ? 'font-semibold' : ''
                        }`}>
                        {slot.time}
                      </div>

                      {/* Slot Column */}
                      <div className="flex-1 min-w-0 relative">
                        <button
                          onClick={() => !isDisabled && handleTimeSelect(slot.time)}
                          disabled={isDisabled}
                          className={`w-full h-full p-3 text-left transition-all duration-200 ${isDisabled
                            ? 'bg-[var(--theme-secondary)] text-[var(--theme-foregroundMuted)] cursor-not-allowed opacity-50'
                            : selectedTime === slot.time
                              ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] font-semibold'
                              : 'bg-[var(--theme-background)] text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] cursor-pointer'
                            }`}
                        >
                          {isPast ? (
                            <span className="text-sm">
                              {business?.reservationSettings?.minNotificationHours && business.reservationSettings.minNotificationHours > 0
                                ? `En az ${business.reservationSettings.minNotificationHours} saat önceden rezervasyon gerekli`
                                : 'Geçmiş Tarihe Randevu Alınamaz'}
                            </span>
                          ) : !slot.available && slot.isOccupied ? (
                            <div className="text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="font-medium">Müsait Değil</span>
                              </div>
                            </div>
                          ) : !slot.available && slot.insufficientTime ? (
                            <div className="text-sm">
                              <div className="flex items-center justify-between space-x-2">
                                <div className='flex items-center space-x-2'>
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="font-medium">Yetersiz Süre</span>
                                </div>
                                {selectedService && (
                                  <span className="text-xs text-[var(--theme-foregroundMuted)]">
                                    {selectedService.duration} dk gerekli
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--theme-foregroundMuted)] mt-1">
                                Sonraki randevuya kadar yeterli süre yok
                              </div>
                            </div>
                          ) : !slot.available ? (
                            <div className="text-sm">
                              <div className="flex items-center justify-between space-x-2">
                                <div className='flex items-center space-x-2'>
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="font-medium">Yetersiz Süre</span>
                                </div>
                                {selectedService && (
                                  <span className="text-xs text-[var(--theme-foregroundMuted)]">
                                    {selectedService.duration} dk gerekli
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--theme-foregroundMuted)] mt-1">
                                Hizmet saatlere sığmıyor
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <div className="flex items-center justify-between space-x-2">
                                <div className='flex items-center space-x-2'>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Müsait</span>
                                </div>
                                {selectedService && (
                                  <div className="flex flex-col items-end text-xs text-[var(--theme-foregroundMuted)]">
                                    <span>{selectedService.duration} dk</span>
                                    <span>
                                      {(() => {
                                        const [hour, minute] = slot.time.split(':').map(Number);
                                        const endMinutes = hour * 60 + minute + selectedService.duration;
                                        const endHour = Math.floor(endMinutes / 60);
                                        const endMinute = endMinutes % 60;
                                        return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')} bitiş`;
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-[var(--theme-foregroundMuted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[var(--theme-foregroundSecondary)] text-lg">Seçilen tarih için müsait saat bulunmuyor</p>
                <p className="text-[var(--theme-foregroundMuted)] text-sm mt-2">
                  {business?.businessHours && (() => {
                    const dateObj = new Date(selectedDate);
                    const dayOfWeek = dateObj.getDay();
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const dayName = dayNames[dayOfWeek];
                    const businessHours = business.businessHours[dayName];

                    if (!businessHours || !businessHours.isOpen) {
                      return 'Bu gün işletme kapalı. Lütfen başka bir tarih seçin.';
                    } else {
                      return 'Lütfen başka bir tarih seçmeyi deneyin.';
                    }
                  })()}
                </p>
                <button
                  onClick={() => router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}`)}
                  className="mt-4 px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
                >
                  Tarih Değiştir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}