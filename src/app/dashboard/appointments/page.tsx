'use client';

import { useEffect, useState } from 'react';
import ClosureDialog from '../../../components/ui/ClosureDialog';
import AppointmentBookingDialog from '../../../components/features/AppointmentBookingDialog';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { MyAppointmentsParams, appointmentService } from '../../../lib/services/appointments';
import { businessService } from '../../../lib/services/business';
import { servicesService } from '../../../lib/services/services';
import { canViewBusinessStats, isStaff, isOwner, hasRole } from '../../../lib/utils/permissions';
import { handleApiError, showSuccessToast } from '../../../lib/utils/toast';
import { Appointment, AppointmentStatus } from '../../../types';
import { Business } from '../../../types/business';
import { Service } from '../../../types/service';
import { getBusinessHoursForDate } from '../../../lib/utils/businessHours';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { actualMode, variant, setMode } = useTheme();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  // Closure dialog state
  const [closureDialogOpen, setClosureDialogOpen] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Selection state
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Closure details modal state
  const [selectedClosure, setSelectedClosure] = useState<any | null>(null);
  const [closureDetailsOpen, setClosureDetailsOpen] = useState(false);
  
  // Delete confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeletingClosure, setIsDeletingClosure] = useState(false);
  
  // Closure management modal
  const [showClosureManagementModal, setShowClosureManagementModal] = useState(false);
  
  // Appointment status update dialog
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Appointment booking dialog state
  const [appointmentBookingDialogOpen, setAppointmentBookingDialogOpen] = useState(false);
  const [selectedTimeSlotForBooking, setSelectedTimeSlotForBooking] = useState<string>('');

  // Calendar mode state
  const [calendarMode, setCalendarMode] = useState<'booking' | 'blocking'>('booking');

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  // Closures state
  const [closures, setClosures] = useState<any[]>([]);
  const [closuresLoading, setClosuresLoading] = useState(false);
  const [appointmentFilters, setAppointmentFilters] = useState<MyAppointmentsParams>({
    page: 1,
    limit: 50
  });
  const [appointmentsPagination, setAppointmentsPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });

  // View mode state
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek + 1); // Start from Monday
    return start;
  });
  const [monthStart, setMonthStart] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);


  useEffect(() => {
    if (user && canViewBusinessStats(user)) {
      loadBusinessData();
    }
  }, [user]);

  // Prevent page scroll on mobile, allow only time slots container to scroll
  useEffect(() => {
    const checkIsMobile = () => window.innerWidth <= 768 || 'ontouchstart' in window;

    if (checkIsMobile()) {
      // Prevent body scroll on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }

    return () => {
      // Restore normal scrolling when leaving the page
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    if (business && user && canViewBusinessStats(user)) {
      loadServices();
      loadAppointmentsForCurrentView();
    }
  }, [business, user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  useEffect(() => {
    if (business && user && canViewBusinessStats(user)) {
      loadAppointmentsForCurrentView();
      loadClosures();
    }
  }, [business, appointmentFilters, viewMode, selectedDate, weekStart, monthStart]);

  const loadAppointmentsForCurrentView = () => {
    if (viewMode === 'daily') {
      loadAppointments();
    } else if (viewMode === 'weekly') {
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
      loadAppointments({
        start: weekStart.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });
    } else if (viewMode === 'monthly') {
      const endDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      loadAppointments({
        start: monthStart.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });
    }
  };

  const loadBusinessData = async () => {
    try {
      const response = await businessService.getMyBusiness();

      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        setBusiness(primaryBusiness);
      }
    } catch (error) {
      console.error('Business data loading failed:', error);
      handleApiError(error);
    }
  };

  const loadAppointments = async (dateRange?: { start: string; end: string }) => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError(null);

      const params: any = { ...appointmentFilters };
      if (business?.id) {
        params.businessId = business.id;
      }

      // Set date range based on view mode
      if (dateRange) {
        params.dateFrom = dateRange.start;
        params.dateTo = dateRange.end;
      } else {
        params.date = selectedDate;
      }

      const response = await appointmentService.getBusinessOwnerAppointments(params);

      if (!response.success) {
        setAppointmentsError(response.error?.message || 'Randevular alınamadı.');
        return;
      }

      if (response.data) {
        setAppointments(response.data.appointments);
        setAppointmentsPagination({
          total: response.data.total,
          page: response.data.page,
          totalPages: response.data.totalPages
        });
      }

    } catch (error) {
      console.error('Appointments loading failed:', error);
      handleApiError(error);
      setAppointmentsError('Randevular yüklenirken bir hata oluştu.');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      if (business?.id) {
        const response = await servicesService.getMyServices({ businessId: business.id });
        if (response.success && response.data) {
          setServices(response.data.services);
        }
      }
    } catch (error) {
      console.error('Services loading failed:', error);
    }
  };

  const loadClosures = async () => {
    try {
      setClosuresLoading(true);
      // Load all closures (active and inactive) so users can see and restore inactive ones
      const response = await businessService.getClosures();
      if (response.success && response.data) {
        setClosures(response.data);
      }
    } catch (error) {
      console.error('Closures loading failed:', error);
    } finally {
      setClosuresLoading(false);
    }
  };

  // Utility functions
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600';
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case AppointmentStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case AppointmentStatus.CANCELED:
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      case AppointmentStatus.NO_SHOW:
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return '⏳';
      case AppointmentStatus.CONFIRMED:
        return '✅';
      case AppointmentStatus.IN_PROGRESS:
        return '🔄';
      case AppointmentStatus.COMPLETED:
        return '✔️';
      case AppointmentStatus.CANCELED:
        return '❌';
      case AppointmentStatus.NO_SHOW:
        return '👻';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'Bekliyor';
      case AppointmentStatus.CONFIRMED:
        return 'Onaylandı';
      case AppointmentStatus.COMPLETED:
        return 'Tamamlandı';
      case AppointmentStatus.CANCELED:
        return 'İptal Edildi';
      case AppointmentStatus.NO_SHOW:
        return 'Gelmedi';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Convert to Istanbul timezone (same logic as booking page)
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(dateObj);
  };

  // Generate time slots based on business hours
  const generateTimeSlots = (date?: string) => {
    const targetDate = date || selectedDate;

    if (!business?.businessHours) {
      // Fallback to default business hours if no business hours data
      const slots = [];
      for (let hour = 8; hour < 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:15`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
        slots.push(`${hour.toString().padStart(2, '0')}:45`);
      }
      return slots;
    }

    // Get business hours for the target date
    const businessHours = getBusinessHoursForDate(business, targetDate);

    if (!businessHours.isOpen || !businessHours.openTime || !businessHours.closeTime) {
      // If business is closed on selected day, show empty schedule
      return [];
    }

    // Generate slots based on actual business hours
    const slots = [];
    const [openHour, openMinute] = businessHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = businessHours.closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    // Generate 15-minute intervals within business hours
    for (let minutes = openMinutes; minutes < closeMinutes; minutes += 15) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Skip break periods
      const isInBreak = businessHours.breaks?.some(breakPeriod => {
        const [breakStartHour, breakStartMinute] = breakPeriod.startTime.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = breakPeriod.endTime.split(':').map(Number);
        const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
        const breakEndMinutes = breakEndHour * 60 + breakEndMinute;
        return minutes >= breakStartMinutes && minutes < breakEndMinutes;
      });

      if (!isInBreak) {
        slots.push(timeString);
      }
    }

    return slots;
  };

  // Check if a time slot is in the past
  const isTimeSlotInPast = (date: string, timeSlot: string) => {
    const now = new Date();
    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(date + 'T00:00:00');
    slotDateTime.setHours(hour, minute, 0, 0);
    
    return slotDateTime < now;
  };

  // Check if a closure is in the future (can be clicked/deleted)
  const isClosureInFuture = (closure: any) => {
    const now = new Date();
    const closureStart = new Date(closure.startDate);
    return closureStart > now;
  };

  // Get closure time-based status
  const getClosureTimeStatus = (closure: any) => {
    const now = new Date();
    const closureStart = new Date(closure.startDate);
    const closureEnd = new Date(closure.endDate);
    
    if (now < closureStart) {
      return 'future'; // Scheduled for future
    } else if (now >= closureStart && now <= closureEnd) {
      return 'current'; // Currently active
    } else {
      return 'past'; // Past closure
    }
  };

  // Translate closure type to Turkish
  const getClosureTypeText = (type: string) => {
    switch (type) {
      case 'VACATION':
        return 'Tatil';
      case 'SICK_LEAVE':
        return 'Hastalık İzni';
      case 'MAINTENANCE':
        return 'Bakım';
      case 'EMERGENCY':
        return 'Acil Durum';
      case 'OTHER':
        return 'Diğer';
      default:
        return type; // Fallback to original if unknown
    }
  };

  // Get closure display status and editability
  const getClosureDisplayInfo = (closure: any) => {
    const timeStatus = getClosureTimeStatus(closure);
    const isActive = closure.isActive;
    
    // Can only edit future closures that are active
    const canEdit = timeStatus === 'future' && isActive;
    
    // Status text based on time and active status
    let statusText = '';
    let statusColor = '';
    
    if (!isActive) {
      statusText = 'Devre Dışı';
      statusColor = 'bg-gray-100 text-gray-600';
    } else {
      switch (timeStatus) {
        case 'future':
          statusText = 'Planlanmış';
          statusColor = 'bg-blue-100 text-blue-800';
          break;
        case 'current':
          statusText = 'Aktif';
          statusColor = 'bg-red-100 text-red-800';
          break;
        case 'past':
          statusText = 'Tamamlandı';
          statusColor = 'bg-gray-100 text-gray-600';
          break;
      }
    }
    
    return {
      canEdit,
      statusText,
      statusColor,
      timeStatus,
      editabilityText: canEdit ? 'Düzenlenebilir' : 'Düzenlenemez'
    };
  };

  // Format closure date range intelligently
  const formatClosureDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if it's the same day
    const isSameDay = start.toDateString() === end.toDateString();
    
    if (isSameDay) {
      // Same day closure - show date once with time range if different times
      const startTime = start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const endTime = end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      
      if (startTime === endTime || (startTime === '00:00' && endTime === '23:59')) {
        // All day or same time
        return start.toLocaleDateString('tr-TR', { 
          day: 'numeric', 
          month: 'short',
          year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
      } else {
        // Same day, different times
        return `${start.toLocaleDateString('tr-TR', { 
          day: 'numeric', 
          month: 'short',
          year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        })} ${startTime}-${endTime}`;
      }
    } else {
      // Different days
      return `${start.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short',
        year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })} - ${end.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short',
        year: end.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })}`;
    }
  };

  // Get appointment info for a time slot
  const getSlotAppointment = (timeSlot: string) => {
    const dayAppointments = getAppointmentsForDate(selectedDate);

    // Find appointment that starts at this time
    const startingAppointment = dayAppointments.find(apt => {
      const startTime = formatTime(apt.startTime);
      return startTime === timeSlot;
    });

    if (startingAppointment) {
      // Calculate how many 15-minute slots this appointment spans
      const durationInMinutes = startingAppointment.duration;
      const slotsToSpan = Math.ceil(durationInMinutes / 15);

      return {
        appointment: startingAppointment,
        type: 'start',
        slotsToSpan: slotsToSpan
      };
    }

    // Check if this slot is occupied by a continuing appointment
    const occupyingAppointment = dayAppointments.find(apt => {
      const startTime = new Date(apt.startTime);
      const endTime = new Date(apt.endTime);
      const slotTime = new Date(apt.startTime);
      const [hour, minute] = timeSlot.split(':').map(Number);
      slotTime.setHours(hour, minute, 0, 0);

      return startTime <= slotTime && slotTime < endTime;
    });

    if (occupyingAppointment) {
      return {
        appointment: occupyingAppointment,
        type: 'continue'
      };
    }

    return { type: 'empty' };
  };

  // Get appointments for the selected date
  const getAppointmentsForDate = (date: string) => {
    if (!appointments || !Array.isArray(appointments)) {
      return [];
    }

    return appointments.filter(apt => {
      // Use startTime to determine the appointment date
      // Convert startTime to the business timezone and get the date
      const businessTimezone = business?.timezone || 'Europe/Istanbul';
      const appointmentDate = new Date(apt.startTime);
      const appointmentDateString = new Intl.DateTimeFormat('en-CA', {
        timeZone: businessTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(appointmentDate);

      return appointmentDateString === date;
    });
  };

  // Get closures for the selected date
  const getClosuresForDate = (date: string) => {
    const dayClosures = closures.filter(closure => {
      // Parse closure dates as UTC (they come from server as UTC)
      const closureStart = new Date(closure.startDate);
      const closureEnd = new Date(closure.endDate);
      
      // Create local date range for the selected day
      const dayStart = new Date(date + 'T00:00:00');
      const dayEnd = new Date(date + 'T23:59:59.999');
      
      // Check if closure overlaps with this local date
      const overlaps = (closureStart < dayEnd && closureEnd > dayStart);
      

      
      return overlaps;
    });
    
    return dayClosures;
  };

  // Check if a time slot is affected by closures
  const isTimeSlotClosed = (date: string, timeSlot: string) => {
    const dayClosures = getClosuresForDate(date);
    
    return dayClosures.some(closure => {
      // Only consider active closures for time slot blocking
      if (!closure.isActive) return false;
      
      // Parse closure dates (they come as UTC from server)
      const closureStart = new Date(closure.startDate);
      const closureEnd = new Date(closure.endDate);
      
      // Create datetime for this time slot - but we need to convert to UTC for comparison
      const [hour, minute] = timeSlot.split(':').map(Number);
      const slotTime = new Date(date + 'T00:00:00');
      slotTime.setHours(hour, minute, 0, 0);
      
      // Convert slot time to UTC for proper comparison
      const slotTimeUTC = new Date(slotTime.getTime() - (slotTime.getTimezoneOffset() * 60000));
      

      
      // Check if slot time (in UTC) is within closure period
      return slotTimeUTC >= closureStart && slotTimeUTC < closureEnd;
    });
  };


  // Get closure info for a time slot
  const getSlotClosure = (date: string, timeSlot: string) => {
    const dayClosures = getClosuresForDate(date);
    
    return dayClosures.find(closure => {
      // Only return active closures for display
      if (!closure.isActive) return false;
      
      // Parse closure dates (they come as UTC from server)
      const closureStart = new Date(closure.startDate);
      const closureEnd = new Date(closure.endDate);
      
      // Create datetime for this time slot and convert to UTC for comparison
      const [hour, minute] = timeSlot.split(':').map(Number);
      const slotTime = new Date(date + 'T00:00:00');
      slotTime.setHours(hour, minute, 0, 0);
      
      // Convert slot time to UTC for proper comparison
      const slotTimeUTC = new Date(slotTime.getTime() - (slotTime.getTimezoneOffset() * 60000));
      
      // Check if slot time (in UTC) is within closure period
      return slotTimeUTC >= closureStart && slotTimeUTC < closureEnd;
    });
  };

  // Parse time string (HH:MM) to minutes since midnight
  const parseTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if a time slot has any appointment (starting or spanning)
  const hasAppointmentInSlot = (timeSlot: string) => {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    
    return dayAppointments.some(apt => {
      const appointmentStart = formatTime(apt.startTime);
      const appointmentDuration = apt.duration;
      const slotStartTime = parseTime(timeSlot);
      const appointmentStartTime = parseTime(appointmentStart);
      const appointmentEndTime = appointmentStartTime + appointmentDuration;
      
      // Check if this slot is within the appointment time range
      return slotStartTime >= appointmentStartTime && slotStartTime < appointmentEndTime;
    });
  };

  // Get slot status for coloring based on appointment
  const getSlotColor = (appointment: Appointment | null) => {
    if (!appointment) {
      return 'bg-[var(--theme-card)] border-l-4 border-l-[var(--theme-border)]';
    }

    switch (appointment.status) {
      case AppointmentStatus.PENDING:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-l-4 border-l-gray-500 shadow-sm';
      case AppointmentStatus.CONFIRMED:
        return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-l-4 border-l-green-500 shadow-sm';
      case AppointmentStatus.IN_PROGRESS:
        return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-l-4 border-l-green-500 shadow-sm';
      case AppointmentStatus.COMPLETED:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-l-4 border-l-blue-500 shadow-sm';
      case AppointmentStatus.CANCELED:
        return 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-l-red-500 shadow-sm';
      case AppointmentStatus.NO_SHOW:
        return 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-l-red-500 shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-l-4 border-l-gray-500 shadow-sm';
    }
  };

  // Get service name from appointment service object
  const getServiceName = (appointment: any) => {
    return appointment.service?.name || 'Hizmet bulunamadı';
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      setUpdatingStatus(true);
      
      const response = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      if (response.success) {
        showSuccessToast('Randevu durumu güncellendi!');
        // Refresh appointments
        await loadAppointments();
        setShowStatusDialog(false);
        setSelectedAppointment(null);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Get customer display name from appointment customer object
  const getCustomerDisplayName = (appointment: any) => {
    const customer = appointment.customer;
    if (customer?.firstName && customer?.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    } else if (customer?.firstName) {
      return customer.firstName;
    } else if (customer?.phoneNumber) {
      return customer.phoneNumber;
    }
    return 'Misafir';
  };

  // Generate week days
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Generate calendar days for monthly view
  const getMonthDays = () => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday

    const days = [];
    for (let i = 0; i < 42; i++) { // Always show 6 weeks for consistent layout
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Get appointments for specific date
  const getAppointmentsForSpecificDate = (date: Date) => {
    if (!appointments || !Array.isArray(appointments)) {
      return [];
    }
    // Format the target date in business timezone
    const businessTimezone = business?.timezone || 'Europe/Istanbul';
    const targetDateString = new Intl.DateTimeFormat('en-CA', {
      timeZone: businessTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
    
    return appointments.filter(apt => {
      // Use the business timezone to get the actual appointment date
      const appointmentDate = new Date(apt.startTime);
      const businessDateString = new Intl.DateTimeFormat('en-CA', {
        timeZone: businessTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(appointmentDate);
      return businessDateString === targetDateString;
    });
  };

  // Set tomorrow date
  const setTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setViewMode('daily');
  };

  // Enhanced click handler with scroll detection
  // Check if user can book appointments for customers
  const canBookForCustomers = () => {
    return user && (isOwner(user) || isStaff(user) || hasRole(user, 'MANAGER'));
  };

  // Enhanced click handler with mode-based behavior
  const handleTimeSlotClick = (timeSlot: string, shiftKey: boolean = false) => {
    // Ignore clicks if user was scrolling
    if (isScrolling) {
      setIsScrolling(false);
      return;
    }

    // Only allow interaction on empty slots that are not closed and not in the past
    const slotInfo = getSlotAppointment(timeSlot);
    const isClosed = isTimeSlotClosed(selectedDate, timeSlot);
    const isPast = isTimeSlotInPast(selectedDate, timeSlot);

    if (slotInfo.type !== 'empty' || isClosed || isPast) {
      return;
    }

    if (calendarMode === 'booking') {
      // Booking mode: Single click opens appointment booking dialog
      if (canBookForCustomers()) {
        setSelectedTimeSlotForBooking(timeSlot);
        setAppointmentBookingDialogOpen(true);
      }
      // For regular customers, we could show a message or redirect to customer booking
    } else if (calendarMode === 'blocking') {
      // Blocking mode: First click = start, second click = end
      if (!isSelecting) {
        // Start selection mode
        setIsSelecting(true);
        setSelectionStart(timeSlot);
        setSelectedTimeSlots([timeSlot]);
        return;
      }

      // We're in selection mode, this click ends the selection
      if (!selectionStart) return;

      const timeSlots = generateTimeSlots();
      const startIndex = timeSlots.indexOf(selectionStart);
      const currentIndex = timeSlots.indexOf(timeSlot);

      if (startIndex === -1 || currentIndex === -1) return;

      const start = Math.min(startIndex, currentIndex);
      const end = Math.max(startIndex, currentIndex);

      // Check all slots in the range to ensure they're all empty, not closed, and not in the past
      let allEmpty = true;
      for (let i = start; i <= end; i++) {
        const slot = timeSlots[i];
        const slotInfo = getSlotAppointment(slot);
        const isClosed = isTimeSlotClosed(selectedDate, slot);
        const isPast = isTimeSlotInPast(selectedDate, slot);
        if (slotInfo.type !== 'empty' || isClosed || isPast) {
          allEmpty = false;
          break;
        }
      }

      if (!allEmpty) {
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectedTimeSlots([]);
        return;
      }

      // Select the range and open dialog
      const selection = [];
      for (let i = start; i <= end; i++) {
        selection.push(timeSlots[i]);
      }
      setSelectedTimeSlots(selection);
      setClosureDialogOpen(true);

      // Reset selection mode
      setIsSelecting(false);
      setSelectionStart(null);
    }
  };

  // Debounced hover handler for smoother selection

  const handleTimeSlotHover = (timeSlot: string) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Set a small delay to prevent flickering during rapid movement
    const timeout = setTimeout(() => {
      // Show preview of selection during selection mode
      if (!isSelecting || !selectionStart) return;

      const slotInfo = getSlotAppointment(timeSlot);
      const isClosed = isTimeSlotClosed(selectedDate, timeSlot);
      const isPast = isTimeSlotInPast(selectedDate, timeSlot);
      
      if (slotInfo.type !== 'empty' || isClosed || isPast) {
        return;
      }

      const timeSlots = generateTimeSlots();
      const startIndex = timeSlots.indexOf(selectionStart);
      const currentIndex = timeSlots.indexOf(timeSlot);
      
      if (startIndex === -1 || currentIndex === -1) return;

      const start = Math.min(startIndex, currentIndex);
      const end = Math.max(startIndex, currentIndex);
      
      // Check if range is valid (all empty, not closed, and not in the past)
      let allEmpty = true;
      for (let i = start; i <= end; i++) {
        const slot = timeSlots[i];
        const slotInfo = getSlotAppointment(slot);
        const isClosed = isTimeSlotClosed(selectedDate, slot);
        const isPast = isTimeSlotInPast(selectedDate, slot);
        if (slotInfo.type !== 'empty' || isClosed || isPast) {
          allEmpty = false;
          break;
        }
      }
      
      if (allEmpty) {
        const selection = [];
        for (let i = start; i <= end; i++) {
          selection.push(timeSlots[i]);
        }
        setSelectedTimeSlots(selection);
      } else {
        // Reset to just the start slot if range is invalid
        setSelectedTimeSlots([selectionStart]);
      }
    }, 25); // 25ms delay for more responsive selection

    setHoverTimeout(timeout);
  };

  const cancelSelection = () => {
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectedTimeSlots([]);
  };

  // Simplified mobile touch handlers - just detect scrolling
  const handleTouchStart = (timeSlot: string, e?: React.TouchEvent) => {
    // Store touch start time for scroll detection
    setTouchStartTime(Date.now());
    setIsScrolling(false);

    // Prevent default to avoid text selection in blocking mode
    if (calendarMode === 'blocking' && e) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (timeSlot: string, e?: React.TouchEvent) => {
    // Reset scroll detection
    setIsScrolling(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Only handle touch move if we're actually in selection mode
    if (!isSelecting || !selectionStart) {
      return; // Let native scrolling handle everything else
    }

    const touch = e.touches[0];

    // Use requestAnimationFrame to avoid blocking scroll performance
    requestAnimationFrame(() => {
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

      if (elementBelow && (elementBelow as HTMLElement).dataset?.timeSlot) {
        const timeSlot = (elementBelow as HTMLElement).dataset.timeSlot!;
        handleTimeSlotHover(timeSlot);
      }
    });

    // Don't prevent default - always allow native scrolling
  };

  // Enhanced mouse event handlers for desktop
  const handleMouseDown = (timeSlot: string, e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    const slotInfo = getSlotAppointment(timeSlot);
    const isClosed = isTimeSlotClosed(selectedDate, timeSlot);
    const isPast = isTimeSlotInPast(selectedDate, timeSlot);
    
    if (slotInfo.type !== 'empty' || isClosed || isPast) {
      return;
    }

    // Start selection mode
    setIsSelecting(true);
    setSelectionStart(timeSlot);
    setSelectedTimeSlots([timeSlot]);
    
    // Add mouse move and up listeners
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isSelecting || !selectionStart) return;
      
      const elementBelow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      if (elementBelow && (elementBelow as HTMLElement).dataset?.timeSlot) {
        const timeSlot = (elementBelow as HTMLElement).dataset.timeSlot!;
        handleTimeSlotHover(timeSlot);
      }
      
      // Allow natural scrolling during selection
      handleScrollDuringSelection();
    };
    
    const handleMouseUp = () => {
      // Remove listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // If we have a valid selection, open the closure dialog
      if (selectedTimeSlots.length > 0 && isSelecting) {
        setClosureDialogOpen(true);
        setIsSelecting(false);
        setSelectionStart(null);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Simple approach: allow natural scrolling during selection (like Google Calendar)
  const handleScrollDuringSelection = () => {
    // Don't prevent scrolling - let the user scroll naturally while selecting
    // This is what most companies do (Google Calendar, Outlook, etc.)
  };

  const handleClosureCreated = () => {
    setSelectedTimeSlots([]);
    loadAppointmentsForCurrentView();
    loadClosures(); // Also reload closures to show the new one
  };

  const handleAppointmentCreated = () => {
    setSelectedTimeSlotForBooking('');
    loadAppointmentsForCurrentView(); // Reload appointments to show the new one
  };

  const handleDeleteClosure = () => {
    if (!selectedClosure) return;
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteClosure = async () => {
    if (!selectedClosure) return;
    
    setIsDeletingClosure(true);
    
    try {
      await businessService.deleteClosure(selectedClosure.id);
      // Close all modals
      setShowDeleteConfirmation(false);
      setClosureDetailsOpen(false);
      setSelectedClosure(null);
      // Reload closures to refresh the UI
      await loadClosures();
      // Show success message
      showSuccessToast('Kapatma başarıyla silindi!');
    } catch (error) {
      console.error('Closure delete failed:', error);
      handleApiError(error);
    } finally {
      setIsDeletingClosure(false);
    }
  };

  const cancelDeleteClosure = () => {
    setShowDeleteConfirmation(false);
  };

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'daily') {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      setSelectedDate(newDate.toISOString().split('T')[0]);
    } else if (viewMode === 'weekly') {
      const newWeekStart = new Date(weekStart);
      newWeekStart.setDate(weekStart.getDate() + (direction === 'next' ? 7 : -7));
      setWeekStart(newWeekStart);
    } else if (viewMode === 'monthly') {
      const newMonthStart = new Date(monthStart);
      newMonthStart.setMonth(monthStart.getMonth() + (direction === 'next' ? 1 : -1));
      setMonthStart(newMonthStart);
    }
  };

  const setTodayDate = () => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);

    // Reset week and month to current
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + 1);
    setWeekStart(weekStart);

    setMonthStart(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div className={`p-2 max-w-full select-none bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 pb-6 ${isMobile ? 'h-screen overflow-hidden flex flex-col gap-3' : 'space-y-3'}`}>
      {/* Header with View Controls */}
      <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] p-2 transition-colors duration-300">
        <div className="flex flex-col gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-[var(--theme-border)] p-1 bg-[var(--theme-backgroundSecondary)]">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${viewMode === 'daily'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
                : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
                }`}
            >
              Günlük
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${viewMode === 'weekly'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
                : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
                }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${viewMode === 'monthly'
                ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
                : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
                }`}
            >
              Aylık
            </button>
          </div>

          {/* Calendar Mode Toggle - Only show for business owners/staff */}
          {canBookForCustomers() && (
            <div className="flex rounded-lg border border-[var(--theme-border)] p-1 bg-[var(--theme-backgroundSecondary)]">
              <button
                onClick={() => {
                  setCalendarMode('booking');
                  // Reset any active selection when switching modes
                  setIsSelecting(false);
                  setSelectionStart(null);
                  setSelectedTimeSlots([]);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${calendarMode === 'booking'
                  ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
                  : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
                  }`}
                title="Müşteriler için randevu alın"
              >
                📅 Randevu Al
              </button>
              <button
                onClick={() => {
                  setCalendarMode('blocking');
                  // Reset any active selection when switching modes
                  setIsSelecting(false);
                  setSelectionStart(null);
                  setSelectedTimeSlots([]);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${calendarMode === 'blocking'
                  ? 'bg-[var(--theme-error)] text-white shadow-sm'
                  : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
                  }`}
                title="Zaman aralığı kapatın"
              >
                🚫 Zaman Engelle
              </button>
            </div>
          )}

          {/* Mode Status Indicator */}
          {canBookForCustomers() && (
            <div className="text-xs text-[var(--theme-foregroundSecondary)] flex items-center gap-2">
              {calendarMode === 'booking' ? (
                <>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full"></div>
                    Randevu Alma Modu - Boş saatlere tıklayın
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--theme-error)] rounded-full"></div>
                    {isSelecting
                      ? "Zaman Engelleme - Bitiş saatini seçin"
                      : "Zaman Engelleme - Başlangıç saatini seçin"
                    }
                  </span>
                  {isSelecting && (
                    <button
                      onClick={cancelSelection}
                      className="text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium underline"
                    >
                      İptal
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Navigation and Controls in one row */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 text-center">
              {viewMode === 'daily' && (
                <h3 className="text-sm font-medium text-[var(--theme-foreground)]">
                  {new Date(selectedDate).toLocaleDateString('tr-TR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </h3>
              )}
              {viewMode === 'weekly' && (
                <h3 className="text-sm font-medium text-[var(--theme-foreground)]">
                  {weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} -
                  {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </h3>
              )}
              {viewMode === 'monthly' && (
                <h3 className="text-sm font-medium text-[var(--theme-foreground)]">
                  {monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </h3>
              )}
            </div>

            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setViewMode('daily');
              }}
              className="px-2 py-1 text-xs border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)]"
            />

            {/* Theme Toggle */}
            <button
              onClick={() => setMode(actualMode === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded-md transition-colors text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)]"
              title={`${actualMode === 'light' ? 'Karanlık' : 'Aydınlık'} temaya geç (${actualMode})`}
            >
              {actualMode === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Theme Info */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[var(--theme-backgroundSecondary)] rounded-md text-xs text-[var(--theme-foregroundSecondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)]"></span>
              {variant}
            </div>

            {/* Closure Management Icon */}
            <button
              onClick={() => setShowClosureManagementModal(true)}
              className="relative p-1.5 rounded-md transition-colors text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-error)] hover:bg-[var(--theme-backgroundSecondary)]"
              title="Kapatma Yönetimi"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A7 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l3-3m-5.196-5.196a5 5 0 01-7.072-7.072" />
              </svg>
              {closures.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--theme-error)] text-[var(--theme-errorForeground)] text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {closures.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>



      {/* Content based on view mode */}
      {viewMode === 'daily' && (
        <div className={`bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden ${isMobile ? 'flex-1' : ''}`}>

          {appointmentsLoading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[var(--theme-foregroundSecondary)]">Randevular yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div
              className={`overflow-y-auto relative ${isSelecting ? 'selection-mode' : ''} ${isMobile ? 'h-full' : ''}`}
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: isSelecting ? 'pan-y' : 'auto',
                maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto'
              }}
              onClick={(e) => {
                // Cancel selection if clicking outside slots
                if (e.target === e.currentTarget && isSelecting) {
                  cancelSelection();
                }
              }}
              onTouchMove={isSelecting ? handleTouchMove : undefined}
            >
              

              {/* Time slots - show all slots or closed message */}
              {(() => {
                const timeSlots = generateTimeSlots();

                if (timeSlots.length === 0 && business?.businessHours) {
                  // Business is closed on this day
                  const businessHours = getBusinessHoursForDate(business, selectedDate);
                  return (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            İşletme Kapalı
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {businessHours.dayName.charAt(0).toUpperCase() + businessHours.dayName.slice(1)} günü işletme kapalıdır.
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            Başka bir gün seçin veya çalışma saatleri ayarlarından {businessHours.dayName} gününü açın.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return timeSlots.map((timeSlot, index) => {
                const isHourStart = timeSlot.endsWith(':00');
                // Check if this time slot has an appointment covering it
                const hasAppointment = appointments.some(apt => {
                  const startTime = formatTime(apt.startTime);
                  const endTime = formatTime(apt.endTime);
                  return timeSlot >= startTime && timeSlot < endTime;
                });

                return (
                  <div
                    key={timeSlot}
                    className={`flex items-stretch last:border-b-0 bg-[var(--theme-card)] ${
                      !hasAppointment && (isHourStart ? 'border-b-2 border-[var(--theme-border)]' : 'border-b border-[var(--theme-border)]/50')
                    }`}
                    style={{ minHeight: '40px' }}
                  >
                    {/* Time Column */}
                    <div className={`w-14 sm:w-16 px-2 py-2 text-xs font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-backgroundSecondary)] border-r border-[var(--theme-border)] flex items-center flex-shrink-0 ${
                      isHourStart ? 'font-semibold' : ''
                    }`}>
                      {timeSlot}
                    </div>

                    {/* Empty slot column */}
                    <div className="flex-1 min-w-0 relative">
                      {(() => {
                        const isClosed = isTimeSlotClosed(selectedDate, timeSlot);
                        const closure = getSlotClosure(selectedDate, timeSlot);
                        const isPast = isTimeSlotInPast(selectedDate, timeSlot);
                        

                        
                        return (
                          <div
                            className={`h-full ${!hasAppointment ? 'border-r border-[var(--theme-border)]/50' : ''} select-none transition-colors duration-150 ${
                              isPast && !isClosed
                                ? 'bg-[var(--theme-backgroundSecondary)] border-[var(--theme-border)] cursor-not-allowed opacity-50'
                                : isClosed
                                  ? 'bg-[var(--theme-error)]/10 border-[var(--theme-error)] border-2 cursor-pointer hover:bg-[var(--theme-error)]/20'
                                  : calendarMode === 'blocking' && selectedTimeSlots.includes(timeSlot)
                                    ? 'bg-[var(--theme-error)]/20 border-[var(--theme-error)]/30 cursor-pointer'
                                    : calendarMode === 'blocking' && isSelecting && selectionStart === timeSlot
                                      ? 'bg-[var(--theme-error)]/30 border-[var(--theme-error)] border-2 cursor-crosshair'
                                    : calendarMode === 'blocking' && isSelecting
                                      ? 'cursor-crosshair hover:bg-[var(--theme-error)]/10'
                                    : calendarMode === 'booking' && canBookForCustomers()
                                      ? 'cursor-pointer hover:bg-[var(--theme-primary)]/10 border-l-2 border-l-transparent hover:border-l-[var(--theme-primary)]'
                                      : 'cursor-pointer hover:bg-[var(--theme-backgroundSecondary)]'
                            }`}
                        data-time-slot={timeSlot}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Allow closure clicks only for future closures
                              if (isClosed && closure && isClosureInFuture(closure)) {
                                setSelectedClosure(closure);
                                setClosureDetailsOpen(true);
                              } else if (!isClosed && !isPast) {
                                handleTimeSlotClick(timeSlot, e.shiftKey);
                              }
                            }}
                        onMouseEnter={() => {
                          if (!isMobile) {
                            handleTimeSlotHover(timeSlot);
                          }
                        }}
                        onMouseDown={(e) => {
                          if (!isMobile) {
                            handleMouseDown(timeSlot, e);
                          }
                        }}
                        onTouchStart={(e) => {
                          handleTouchStart(timeSlot, e);
                        }}
                        onTouchEnd={(e) => {
                          handleTouchEnd(timeSlot, e);
                        }}
                            title={
                              isPast
                                ? "Geçmiş zaman dilimi - seçilemez"
                                : isClosed
                                  ? `İşletme Kapalı: ${closure?.reason || 'Sebep belirtilmemiş'}`
                                  : calendarMode === 'booking' && canBookForCustomers()
                                    ? "Randevu almak için tıklayın"
                                    : calendarMode === 'blocking'
                                      ? isSelecting
                                        ? "Bitiş saatini seçmek için tıklayın"
                                        : "Başlangıç saatini seçmek için tıklayın"
                                      : "Boş zaman dilimi"
                            }
                          >
                            {isPast && !isClosed && !hasAppointmentInSlot(timeSlot) && (
                              <div className="flex items-center justify-center h-full text-xs text-[var(--theme-foregroundMuted)] font-medium">
                                <span className="truncate px-1 text-center leading-tight">Geçmiş saate randevu alınamaz</span>
                              </div>
                            )}
                            {calendarMode === 'blocking' && isSelecting && selectedTimeSlots.includes(timeSlot) && (
                              <div className="flex items-center justify-center h-full text-xs text-[var(--theme-error)] font-medium relative">
                                <span className="truncate px-1">
                                  {timeSlot === selectionStart ? "🚀" : "✓"}
                                </span>
                                {timeSlot !== selectionStart && (
                                  <div className="absolute inset-0 border-l-2 border-[var(--theme-error)] border-dashed"></div>
                                )}
                              </div>
                            )}
                            {isClosed && closure && (
                              <div 
                                className={`flex items-center justify-center h-full text-xs text-[var(--theme-error)] font-medium ${
                                  isClosureInFuture(closure) 
                                    ? 'cursor-pointer hover:bg-[var(--theme-error)]/20' 
                                    : 'cursor-not-allowed opacity-60'
                                } transition-colors`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isClosureInFuture(closure)) {
                                    setSelectedClosure(closure);
                                    setClosureDetailsOpen(true);
                                  }
                                }}
                                title={
                                  isClosureInFuture(closure) 
                                    ? "Kapatma detaylarını görmek için tıklayın" 
                                    : "Geçmiş kapatmalar düzenlenemez"
                                }
                              >
                                <span className="truncate px-1 flex items-center gap-1">
                                  <span className="text-[var(--theme-error)]">🚫</span>
                                  <span className="font-semibold">{closure.reason}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
                });
              })()}

              {/* Appointments positioned absolutely over the time slots */}
              {getAppointmentsForDate(selectedDate).map((appointment) => {
                const startTime = formatTime(appointment.startTime);
                const startIndex = generateTimeSlots().findIndex(slot => slot === startTime);
                const durationInMinutes = appointment.duration;
                const slotsToSpan = Math.ceil(durationInMinutes / 15);

                if (startIndex === -1) return null;

                const top = startIndex * 40; // 40px per slot
                const height = slotsToSpan * 40;

                return (
                  <div
                    key={appointment.id}
                    className={`absolute right-0 z-10 ${getSlotColor(appointment)} rounded-lg shadow-sm border-2 border-[var(--theme-card)] border-b-4 border-b-[var(--theme-border)] cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}
                    style={{
                      top: `${top + 2}px`, // Add 2px top margin for separation
                      height: `${height - 8}px`, // Reduce height more to accommodate bottom border
                      left: '60px', // Start after time column with more space
                      width: 'calc(100% - 80px)' // Take remaining width with larger margins
                    }}
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowStatusDialog(true);
                    }}
                  >
                    <div className="p-2 h-full flex flex-col justify-center">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[var(--theme-foreground)] truncate">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                          <div className="font-medium text-sm truncate text-[var(--theme-foreground)] truncate">
                            {getCustomerDisplayName(appointment)}
                          </div>
                          <div className="text-xs text-[var(--theme-foregroundSecondary)] truncate mb-1">
                            {getServiceName(appointment)}
                          </div>

                        </div>
                        <div className='flex flex-col h-full items-end justify-between'>
                          <div className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 ml-2 border ${getStatusColor(appointment.status)}`}>
                            <span className="text-sm">{getStatusIcon(appointment.status)}</span>
                            <span>{getStatusText(appointment.status)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-[var(--theme-success)] font-medium">
                              {appointment.price} {appointment.currency}
                            </span>
                            <span className="text-[var(--theme-info)] font-medium">
                              {appointment.duration}dk
                            </span>
                          </div>
                        </div>

                      </div>

                      {expandedAppointment === appointment.id && (
                        <div className="mt-2 pt-2 border-t border-[var(--theme-border)] space-y-1">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-[var(--theme-foregroundSecondary)]">
                              💰 {appointment.price} {appointment.currency}
                            </div>
                            <div className="text-[var(--theme-foregroundSecondary)]">
                              ⏱️ {appointment.duration} dk
                            </div>
                          </div>
                          {appointment.customerNotes && (
                            <div className="text-xs text-[var(--theme-foregroundSecondary)] italic">
                              "{appointment.customerNotes}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <div className={`bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden ${isMobile ? 'flex-1' : ''}`}>
          {appointmentsLoading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[var(--theme-foregroundSecondary)]">Randevular yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div
              className={`overflow-auto ${isMobile ? 'h-full' : 'overflow-x-auto'}`}
              style={{
                WebkitOverflowScrolling: 'touch',
                maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto'
              }}
            >
              <div className="flex">
                {/* Time column - show time slots for the first open day or use default */}
                <div className="w-14 bg-[var(--theme-backgroundSecondary)] border-r border-[var(--theme-border)] flex-shrink-0">
                  <div className="h-8 border-b border-[var(--theme-border)]"></div>
                  {(() => {
                    // Find the first day with business hours or use default slots
                    const weekDays = getWeekDays();
                    let timeSlots: string[] = [];
                    
                    for (const day of weekDays) {
                      const dayDateString = day.getFullYear() + '-' + 
                        String(day.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(day.getDate()).padStart(2, '0');
                      const daySlots: string[] = generateTimeSlots(dayDateString);
                      if (daySlots.length > 0) {
                        timeSlots = daySlots;
                        break;
                      }
                    }
                    
                    // If no day has business hours, use default slots
                    if (timeSlots.length === 0) {
                      timeSlots = generateTimeSlots();
                    }
                    
                    return timeSlots.map((timeSlot: string, index: number) => (
                      <div
                        key={timeSlot}
                        className="h-10 border-b border-[var(--theme-border)]/50 flex items-center justify-center text-xs text-[var(--theme-foregroundSecondary)]"
                      >
                        {timeSlot}
                      </div>
                    ));
                  })()}
                </div>

                {/* Days grid */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-7 gap-px bg-[var(--theme-border)]">
                    {/* Week header */}
                    {getWeekDays().map((day, index) => {
                      const dayName = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][index];
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div key={day.toISOString()} className={`bg-[var(--theme-backgroundSecondary)] h-8 text-center text-xs font-medium border-b border-[var(--theme-border)] flex flex-col justify-center ${isToday ? 'text-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'text-[var(--theme-foregroundSecondary)]'
                          }`}>
                          <div>{dayName}</div>
                          <div className="font-bold">{day.getDate()}</div>
                        </div>
                      );
                    })}

                    {/* Week days content */}
                    {getWeekDays().map((day) => {
                      const dayAppointments = getAppointmentsForSpecificDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const dayDateString = day.getFullYear() + '-' + 
                        String(day.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(day.getDate()).padStart(2, '0');
                      const dayTimeSlots = generateTimeSlots(dayDateString);
                      const totalSlots = dayTimeSlots.length;
                      const totalHeight = totalSlots * 40; // 40px per slot

                      return (
                        <div
                          key={day.toISOString()}
                          className={`bg-[var(--theme-card)] cursor-pointer hover:bg-[var(--theme-backgroundSecondary)] transition-colors relative ${isToday ? 'bg-[var(--theme-primary)]/10' : ''
                            }`}
                          style={{ minHeight: `${totalHeight}px` }}
                          onClick={() => {
                            // Use local date formatting to avoid timezone issues
                            const localDateString = day.getFullYear() + '-' + 
                              String(day.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(day.getDate()).padStart(2, '0');
                            setSelectedDate(localDateString);
                            setViewMode('daily');
                          }}
                        >
                          {/* Time slots grid background */}
                          {dayTimeSlots.map((timeSlot, index) => (
                            <div
                              key={timeSlot}
                              className="h-10 border-b border-[var(--theme-border)]/50"
                            />
                          ))}

                          {/* Appointments positioned absolutely - only show customer names */}
                          {dayAppointments.map((appointment) => {
                            const startTime = formatTime(appointment.startTime);
                            const startIndex = dayTimeSlots.findIndex(slot => slot === startTime);
                            const durationInMinutes = appointment.duration;
                            const slotsToSpan = Math.ceil(durationInMinutes / 15);

                            if (startIndex === -1) return null;


                            const top = startIndex * 40; // 40px per slot
                            const height = slotsToSpan * 40;

                            return (
                              <div
                              key={appointment.id}
                              className={`absolute left-0 right-0 z-10 rounded-md cursor-pointer shadow-sm border transition-all hover:shadow-md ${
                                appointment.status === 'PENDING' ? 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/30 dark:border-gray-600 dark:text-gray-200' :
                                appointment.status === 'CONFIRMED' ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200' :
                                appointment.status === 'IN_PROGRESS' ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200' :
                                appointment.status === 'COMPLETED' ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200' :
                                appointment.status === 'CANCELED' ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200' :
                                appointment.status === 'NO_SHOW' ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200' :
                                'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/30 dark:border-gray-600 dark:text-gray-200'
                              }`}
                              style={{
                                top: `${top}px`,
                                height: `${height}px`
                              }}
                            >
                              <div className="h-full w-full flex items-center justify-center p-1">
                                <div className="text-xs leading-tight break-words overflow-hidden text-center">
                                  <div className="font-medium">{getCustomerDisplayName(appointment)}</div>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        <div className={`bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden h-fit ${isMobile ? 'flex-1' : ''}`}>
          {appointmentsLoading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[var(--theme-foregroundSecondary)]">Randevular yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div
              className={`overflow-auto ${isMobile ? 'h-full' : 'overflow-x-auto'}`}
              style={{
                WebkitOverflowScrolling: 'touch',
                maxHeight: isMobile ? 'calc(100vh - 200px)' : 'auto'
              }}
            >
              <div className="grid grid-cols-7 gap-px bg-[var(--theme-border)] w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
                {/* Month header */}
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                  <div key={day} className="bg-[var(--theme-backgroundSecondary)] p-1 sm:p-2 text-center text-xs font-medium text-[var(--theme-foregroundSecondary)] min-w-0">
                    {day}
                  </div>
                ))}

                {/* Month days */}
                {getMonthDays().map((day, index) => {
                  const dayAppointments = getAppointmentsForSpecificDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayLocalDateString = day.getFullYear() + '-' + 
                    String(day.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(day.getDate()).padStart(2, '0');
                  const isSelected = dayLocalDateString === selectedDate;
                  const isCurrentMonth = day.getMonth() === monthStart.getMonth();

                  return (
                    <div
                      key={day.toISOString()}
                      className={`bg-[var(--theme-card)] p-0.5 sm:p-1 min-h-[70px] sm:min-h-[80px] lg:min-h-[90px] cursor-pointer hover:bg-[var(--theme-backgroundSecondary)] transition-colors min-w-0 flex flex-col ${isToday ? 'bg-[var(--theme-primary)]/10' : ''
                        } ${isSelected ? 'ring-1 ring-[var(--theme-primary)]' : ''
                        } ${!isCurrentMonth ? 'opacity-50' : ''
                        }`}
                      onClick={() => {
                        // Use local date formatting to avoid timezone issues
                        const localDateString = day.getFullYear() + '-' + 
                          String(day.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(day.getDate()).padStart(2, '0');
                        setSelectedDate(localDateString);
                        setViewMode('daily');
                      }}
                    >
                      <div className={`text-xs font-bold mb-1 flex-shrink-0 ${isToday ? 'text-[var(--theme-primary)]' : isCurrentMonth ? 'text-[var(--theme-foreground)]' : 'text-[var(--theme-foregroundMuted)]'
                        }`}>
                        {day.getDate()}
                      </div>

                      <div className="space-y-0.5 flex-1 min-h-0 overflow-hidden">
                        {dayAppointments.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className={`text-xs p-1 rounded border ${apt.status === 'PENDING' ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600' :
                              apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' :
                                apt.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' :
                                  apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' :
                                    apt.status === 'CANCELED' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' :
                                      apt.status === 'NO_SHOW' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700' :
                                        'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600'
                              }`}
                            title={`${formatTime(apt.startTime)} - ${getCustomerDisplayName(apt)} - ${getStatusText(apt.status)}`}
                          >
                            <div className="font-bold truncate text-xs leading-tight">{formatTime(apt.startTime)}</div>
                            <div className="font-medium truncate text-xs leading-tight">{getCustomerDisplayName(apt)}</div>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-[var(--theme-foregroundMuted)] text-center bg-[var(--theme-backgroundSecondary)] rounded px-1 py-0.5 mt-1">
                            +{dayAppointments.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Closure Dialog */}
      <ClosureDialog
        isOpen={closureDialogOpen}
        onClose={() => {
          setClosureDialogOpen(false);
          setSelectedTimeSlots([]);
        }}
        selectedTimeSlots={selectedTimeSlots}
        selectedDate={selectedDate}
        onClosureCreated={handleClosureCreated}
      />

      {/* Appointment Booking Dialog */}
      <AppointmentBookingDialog
        isOpen={appointmentBookingDialogOpen}
        onClose={() => {
          setAppointmentBookingDialogOpen(false);
          setSelectedTimeSlotForBooking('');
        }}
        businessId={business?.id || ''}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlotForBooking}
        onAppointmentCreated={handleAppointmentCreated}
      />

      {/* Closure Details Modal */}
      {closureDetailsOpen && selectedClosure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-red-600">🚫</span>
                  Kapatma Detayları
                </h3>
                <button
                  onClick={() => {
                    setClosureDetailsOpen(false);
                    setSelectedClosure(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sebep</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">{selectedClosure.reason}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {getClosureTypeText(selectedClosure.type)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                      {new Date(selectedClosure.startDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                      {new Date(selectedClosure.endDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  {selectedClosure && (() => {
                    const displayInfo = getClosureDisplayInfo(selectedClosure);
                    return (
                      <div className="space-y-2">
                        <p className={`text-sm p-2 rounded-md ${displayInfo.statusColor.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                          <span className="font-medium">{displayInfo.statusText}</span>
                          {displayInfo.timeStatus === 'current' && ' - Şu anda aktif'}
                          {displayInfo.timeStatus === 'future' && ' - Zamanlanmış'}
                          {displayInfo.timeStatus === 'past' && ' - Tamamlanmış'}
                        </p>
                        <p className={`text-xs p-2 rounded-md ${
                          displayInfo.canEdit 
                            ? 'text-green-800 bg-green-50' 
                            : 'text-gray-600 bg-gray-50'
                        }`}>
                          {displayInfo.canEdit 
                            ? '✏️ Bu kapatma düzenlenebilir ve silinebilir' 
                            : '🔒 Bu kapatma düzenlenemez'}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oluşturulma</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                    {new Date(selectedClosure.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>

                {selectedClosure.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tekrarlama</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                      ✅ Bu kapatma tekrarlanan bir kapamadır
                    </p>
                  </div>
                )}

                {selectedClosure.notifyCustomers && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Bildirimi</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-md">
                      ✅ Müşterilere bildirim gönderildi ({selectedClosure.notifiedCustomersCount || 0} müşteri)
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-between">
                {selectedClosure && getClosureDisplayInfo(selectedClosure).canEdit && (
                  <button
                    onClick={handleDeleteClosure}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Sil
                  </button>
                )}
                <button
                  onClick={() => {
                    setClosureDetailsOpen(false);
                    setSelectedClosure(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  style={{ marginLeft: 'auto' }}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Closure Management Modal */}
      {showClosureManagementModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l3-3m-5.196-5.196a5 5 0 01-7.072-7.072" />
                      </svg>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Kapatma Yönetimi</h2>
                      {closures.length > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-0.5 rounded-full self-start">
                          {closures.length} kapatma
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClosureManagementModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                    title="Kapat"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 sm:p-6">
                {closuresLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 sm:mt-4 text-sm text-gray-600">Kapatmalar yükleniyor...</p>
                  </div>
                ) : closures.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4h8v4z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Henüz kapatma bulunmuyor</h3>
                    <p className="text-sm text-gray-500 px-4">İş yeriniz için kapatma oluşturmak için takvimden zaman seçin.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {closures.map((closure) => {
                      const displayInfo = getClosureDisplayInfo(closure);
                      
                      return (
                        <div
                          key={closure.id}
                          className={`p-3 sm:p-4 rounded-lg border transition-all ${
                            displayInfo.canEdit 
                              ? 'cursor-pointer hover:shadow-md hover:border-indigo-300' 
                              : 'cursor-default'
                          } ${
                            displayInfo.timeStatus === 'current' && closure.isActive
                              ? 'border-red-200 bg-red-50' 
                              : displayInfo.timeStatus === 'future' && closure.isActive
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-gray-200 bg-gray-50'
                          } ${
                            !closure.isActive ? 'opacity-60' : ''
                          }`}
                          onClick={() => {
                            if (displayInfo.canEdit) {
                              setSelectedClosure(closure);
                              setClosureDetailsOpen(true);
                              setShowClosureManagementModal(false);
                            }
                          }}
                        >
                          {/* Mobile Layout */}
                          <div className="sm:hidden">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                displayInfo.timeStatus === 'current' && closure.isActive
                                  ? 'bg-red-100' 
                                  : displayInfo.timeStatus === 'future' && closure.isActive
                                  ? 'bg-blue-100'
                                  : 'bg-gray-100'
                              }`}>
                                <span className={`text-lg ${
                                  displayInfo.timeStatus === 'current' && closure.isActive
                                    ? 'text-red-600' 
                                    : displayInfo.timeStatus === 'future' && closure.isActive
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                }`}>
                                  {displayInfo.timeStatus === 'current' && closure.isActive
                                    ? '🚫' 
                                    : displayInfo.timeStatus === 'future' && closure.isActive
                                    ? '⏰'
                                    : '⭕'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                    {getClosureTypeText(closure.type)}
                                  </h4>
                                  <div className="flex flex-col gap-1 items-end">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${displayInfo.statusColor}`}>
                                      {displayInfo.statusText}
                                    </span>
                                    <span className={`text-xs font-medium ${
                                      displayInfo.canEdit ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                      {displayInfo.editabilityText}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs text-gray-600">
                                  <div>
                                    📅 {formatClosureDateRange(closure.startDate, closure.endDate)}
                                  </div>
                                  <div>
                                    🏷️ {getClosureTypeText(closure.type)}
                                  </div>
                                  {closure.notifyCustomers && (
                                    <div>💬 Müşterilere bildirildi</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden sm:block">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  displayInfo.timeStatus === 'current' && closure.isActive
                                    ? 'bg-red-100' 
                                    : displayInfo.timeStatus === 'future' && closure.isActive
                                    ? 'bg-blue-100'
                                    : 'bg-gray-100'
                                }`}>
                                  <span className={`text-xl ${
                                    displayInfo.timeStatus === 'current' && closure.isActive
                                      ? 'text-red-600' 
                                      : displayInfo.timeStatus === 'future' && closure.isActive
                                      ? 'text-blue-600'
                                      : 'text-gray-400'
                                  }`}>
                                    {displayInfo.timeStatus === 'current' && closure.isActive
                                      ? '🚫' 
                                      : displayInfo.timeStatus === 'future' && closure.isActive
                                      ? '⏰'
                                      : '⭕'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900 truncate">
                                      {getClosureTypeText(closure.type)}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${displayInfo.statusColor}`}>
                                      {displayInfo.statusText}
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4h8v4z" />
                                      </svg>
                                      <span>{formatClosureDateRange(closure.startDate, closure.endDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                      </svg>
                                                                              <span>
                                          {getClosureTypeText(closure.type)}
                                        </span>
                                    </div>
                                    {closure.notifyCustomers && (
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H6l5 5v-5z" />
                                        </svg>
                                        <span>Müşterilere bildirim gönderildi</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  displayInfo.canEdit ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {displayInfo.editabilityText}
                                </span>
                                {displayInfo.canEdit && (
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && selectedClosure && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              {/* Header with Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Kapatmayı Sil
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-600 text-center mb-2">
                <span className="font-medium text-gray-900">"{selectedClosure.reason}"</span> kapatmasını silmek istediğinizden emin misiniz?
              </p>
              <p className="text-xs text-red-600 text-center mb-6">
                Bu işlem geri alınamaz ve kapatma kalıcı olarak silinecektir.
              </p>

              {/* Closure Info Card */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Başlangıç:</span>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedClosure.startDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Bitiş:</span>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedClosure.endDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tür:</span>
                    <p className="text-gray-900 mt-1">
                      {getClosureTypeText(selectedClosure.type)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Durum:</span>
                    <p className={`mt-1 ${selectedClosure.isActive ? 'text-red-600' : 'text-gray-600'}`}>
                      {selectedClosure.isActive ? 'Aktif' : 'Pasif'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
              <button
                type="button"
                onClick={cancelDeleteClosure}
                disabled={isDeletingClosure}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmDeleteClosure}
                disabled={isDeletingClosure}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isDeletingClosure && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isDeletingClosure ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Status Update Dialog */}
      {showStatusDialog && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--theme-card)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--theme-cardForeground)]">
                  Randevu Durumu
                </h3>
                <button
                  onClick={() => {
                    setShowStatusDialog(false);
                    setSelectedAppointment(null);
                  }}
                  className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Appointment Details */}
              <div className="bg-[var(--theme-background)] rounded-xl p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--theme-foregroundSecondary)]">Müşteri:</span>
                    <span className="text-[var(--theme-foreground)] font-medium">
                      {getCustomerDisplayName(selectedAppointment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--theme-foregroundSecondary)]">Hizmet:</span>
                    <span className="text-[var(--theme-foreground)] font-medium">
                      {getServiceName(selectedAppointment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--theme-foregroundSecondary)]">Tarih:</span>
                    <span className="text-[var(--theme-foreground)] font-medium">
                      {formatTime(selectedAppointment.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--theme-foregroundSecondary)]">Mevcut Durum:</span>
                    <div className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(selectedAppointment.status)}`}>
                      <span className="text-sm">{getStatusIcon(selectedAppointment.status)}</span>
                      <span>{getStatusText(selectedAppointment.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Options */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[var(--theme-cardForeground)] mb-3">
                  Yeni Durum Seç:
                </h4>
                
                {[AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELED, AppointmentStatus.NO_SHOW].map((status) => {
                  if (status === selectedAppointment.status) return null;
                  
                  const getStatusLabel = (status: AppointmentStatus) => {
                    switch (status) {
                      case AppointmentStatus.PENDING: return 'Bekliyor';
                      case AppointmentStatus.CONFIRMED: return 'Onaylandı';
                      case AppointmentStatus.IN_PROGRESS: return 'Devam Ediyor';
                      case AppointmentStatus.COMPLETED: return 'Tamamlandı';
                      case AppointmentStatus.CANCELED: return 'İptal Edildi';
                      case AppointmentStatus.NO_SHOW: return 'Gelmedi';
                      default: return status;
                    }
                  };

                  const getStatusColor = (status: AppointmentStatus) => {
                    switch (status) {
                      case AppointmentStatus.PENDING: return 'border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20';
                      case AppointmentStatus.CONFIRMED: return 'border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20';
                      case AppointmentStatus.IN_PROGRESS: return 'border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20';
                      case AppointmentStatus.COMPLETED: return 'border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20';
                      case AppointmentStatus.CANCELED: return 'border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20';
                      case AppointmentStatus.NO_SHOW: return 'border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20';
                      default: return 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20';
                    }
                  };

                  return (
                    <button
                      key={status}
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, status)}
                      disabled={updatingStatus}
                      className={`w-full p-3 border-2 rounded-xl text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 ${getStatusColor(status)}`}
                    >
                      <span className="text-lg">{getStatusIcon(status)}</span>
                      <span className="font-medium text-[var(--theme-foreground)]">
                        {getStatusLabel(status)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Loading State */}
              {updatingStatus && (
                <div className="flex items-center justify-center py-4 mt-4">
                  <div className="w-6 h-6 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-[var(--theme-foregroundSecondary)]">Güncelleniyor...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}