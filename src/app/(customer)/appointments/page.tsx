'use client';

import { useEffect, useState } from 'react';
import { Calendar, CalendarDays, ChevronDown, Filter, X, Check, Clock, AlertCircle, List, CheckCircle, XCircle, AlertTriangle, RefreshCw, Calendar as CalendarIcon, User, ChevronDown as ChevronDownIcon, MapPin, Phone, DollarSign, FileText, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { appointmentService } from '@/src/lib/services/appointments';
import { isCustomer } from '@/src/lib/utils/permissions';
import { showSuccessToast, showErrorToast } from '@/src/lib/utils/toast';
import { getPolicyErrorMessage } from '@/src/lib/utils/policyValidation';
import { RatingEligibility } from '@/src/components';

interface AppointmentData {
  id: string;
  businessId: string;
  serviceId: string;
  customerId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  price: number;
  currency: string;
  bookedAt: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  customerNotes?: string;
  internalNotes?: string;
  business: {
    id: string;
    name: string;
    slug: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    primaryColor: string;
    settings?: {
      priceVisibility?: {
        showPriceOnBooking: boolean;
        priceDisplayMessage: string | null;
        hideAllServicePrices: boolean;
      };
    };
  };
  service: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    currency: string;
  };
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

export default function AppointmentsPage() {
  const { user, isLoading: authLoading, hasInitialized } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  
  // Cancel appointment states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentData | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);

  useEffect(() => {
    if (hasInitialized && user && isCustomer(user)) {
      fetchAppointments();
    } else if (hasInitialized) {
      setIsLoading(false);
    }
  }, [hasInitialized, user, selectedStatus, selectedDateFilter, currentPage]);

  const getDateRange = (filter: string) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          startDate: startOfDay.toISOString(),
          endDate: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
        };
      case 'thisWeek':
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        return {
          startDate: startOfWeek.toISOString(),
          endDate: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: startOfMonth.toISOString(),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        };
      case 'thisYear':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return {
          startDate: startOfYear.toISOString(),
          endDate: new Date(now.getFullYear(), 11, 31).toISOString()
        };
      default:
        return null;
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedStatus !== 'all' && { status: selectedStatus as any })
      };

      const response = await appointmentService.getMyAppointments(params);
      
      if (response.success && response.data) {
        // Handle both old and new API response structures
        let appointmentList: any[] = [];
        let totalPages = 1;
        
        if (Array.isArray(response.data)) {
          // New API structure: appointments directly in data array
          appointmentList = response.data;
          totalPages = response.meta?.totalPages || 1;
        } else if (response.data.appointments && Array.isArray(response.data.appointments)) {
          // Old API structure: appointments in data.appointments
          appointmentList = response.data.appointments;
          totalPages = response.data.totalPages || response.meta?.totalPages || 1;
        }
        
        // Apply date filtering on client side if needed
        if (selectedDateFilter !== 'all') {
          const dateRange = getDateRange(selectedDateFilter);
          if (dateRange) {
            appointmentList = appointmentList.filter(appointment => {
              const appointmentDate = new Date(appointment.date);
              return appointmentDate >= new Date(dateRange.startDate) && 
                     appointmentDate <= new Date(dateRange.endDate);
            });
          }
        }
        
        setAppointments(appointmentList);
        setTotalPages(totalPages);
      } else {
        setError('Randevular yüklenemedi');
      }
    } catch (error) {
      setError('Randevular yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      setIsCancelling(true);
      const response = await appointmentService.cancelAppointment(
        appointmentToCancel.id,
        cancelReason || undefined
      );

      if (response.success) {
        // Update the appointment in the list
        setAppointments(prev => prev.map(apt =>
          apt.id === appointmentToCancel.id
            ? { ...apt, status: 'CANCELLED', cancelReason: cancelReason }
            : apt
        ));

        // Close modal and reset states
        setShowCancelModal(false);
        setShowFinalConfirmation(false);
        setAppointmentToCancel(null);
        setCancelReason('');

        // Show success toast
        showSuccessToast('Randevu başarıyla iptal edildi');
      } else {
        // Get user-friendly error message
        const errorMessage = getPolicyErrorMessage(response.error || 'Randevu iptal edilirken bir hata oluştu');
        showErrorToast(errorMessage);
      }
    } catch (error: any) {
      // Get user-friendly error message from the error object
      const errorMessage = getPolicyErrorMessage(error?.response?.data?.error || error);
      showErrorToast(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const openCancelModal = (appointment: AppointmentData) => {
    setAppointmentToCancel(appointment);
    setCancelReason('');
    setShowFinalConfirmation(false);
    setShowCancelModal(true);
  };

  const handleCancelConfirmation = () => {
    setShowFinalConfirmation(true);
  };

  const handleCancelBack = () => {
    setShowFinalConfirmation(false);
  };

  const canCancelAppointment = (appointment: AppointmentData) => {
    return ['PENDING', 'CONFIRMED'].includes(appointment.status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]';
      case 'CONFIRMED':
        return 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]';
      case 'PENDING':
        return 'bg-[var(--theme-warning)]/20 text-[var(--theme-warning)]';
      case 'CANCELLED':
        return 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]';
      case 'CANCELED':
        return 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]';
      case 'NO_SHOW':
        return 'bg-orange-500/20 text-orange-600';
      default:
        return 'bg-[var(--theme-secondary)]/20 text-[var(--theme-foregroundSecondary)]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CONFIRMED':
        return 'Onaylandı';
      case 'PENDING':
        return 'Bekliyor';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'CANCELED':
        return 'İptal Edildi';
      case 'NO_SHOW':
        return 'Gelmedi';
      default:
        return status;
    }
  };

  // Show skeleton loading while auth context is initializing
  if (!hasInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
          {/* Skeleton Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="w-16 h-16 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-3xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="h-8 sm:h-9 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 sm:h-5 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Skeleton Filters */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="h-12 bg-[var(--theme-backgroundSecondary)] rounded-xl animate-pulse flex-1"></div>
              <div className="h-12 bg-[var(--theme-backgroundSecondary)] rounded-xl animate-pulse flex-1"></div>
            </div>
          </div>

          {/* Skeleton Appointments */}
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-[var(--theme-card)] dark:bg-gray-800/60 rounded-2xl border border-[var(--theme-border)] p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[var(--theme-backgroundSecondary)] rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-[var(--theme-backgroundSecondary)] rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-3 bg-[var(--theme-backgroundSecondary)] rounded animate-pulse w-16"></div>
                    <div className="h-3 bg-[var(--theme-backgroundSecondary)] rounded animate-pulse w-20"></div>
                  </div>
                  <div className="w-16 h-6 bg-[var(--theme-backgroundSecondary)] rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show sign in message only after auth context has initialized and user is confirmed to be null
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4">Giriş Yapın</h1>
            <p className="text-[var(--theme-foregroundSecondary)]">Randevularınızı görmek için giriş yapmalısınız.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCustomer(user)) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4">Erişim Yetkiniz Yok</h1>
            <p className="text-[var(--theme-foregroundSecondary)]">Bu sayfa sadece müşteriler için kullanılabilir.</p>
          </div>
        </div>
      </div>
  );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/5 via-[var(--theme-background)] to-[var(--theme-accent)]/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
        {/* Mobile-Optimized Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="w-16 h-16 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-3xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--theme-foreground)] transition-colors duration-300 mb-1">
                Randevularım
              </h1>
              <p className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300 text-sm sm:text-base">
                Tüm randevularınızı tek bir yerde yönetin
              </p>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowDateDropdown(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] transition-colors duration-300 hover:border-[var(--theme-primary)]/30"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="text-sm font-semibold text-[var(--theme-foreground)]">
                    {[
                      { value: 'all', label: 'Tüm Durumlar' },
                      { value: 'CONFIRMED', label: 'Onaylandı' },
                      { value: 'COMPLETED', label: 'Tamamlandı' },
                      { value: 'CANCELLED', label: 'İptal Edildi' },
                      { value: 'NO_SHOW', label: 'Gelmedi' }
                    ].find(f => f.value === selectedStatus)?.label}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--theme-foregroundSecondary)] transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full mt-2 w-full bg-[var(--theme-card)] dark:bg-gray-800/90 rounded-xl border border-[var(--theme-border)] shadow-xl z-20 overflow-hidden">
                  {[
                    { value: 'all', label: 'Tüm Durumlar', icon: List },
                    { value: 'CONFIRMED', label: 'Onaylandı', icon: CheckCircle },
                    { value: 'COMPLETED', label: 'Tamamlandı', icon: Check },
                    { value: 'CANCELLED', label: 'İptal Edildi', icon: XCircle },
                    { value: 'NO_SHOW', label: 'Gelmedi', icon: AlertTriangle }
                  ].map((filter, index) => {
                    const IconComponent = filter.icon;
                    return (
                      <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedStatus(filter.value);
                        setCurrentPage(1);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-[var(--theme-backgroundSecondary)] transition-colors duration-200 ${
                        index === 0 ? '' : 'border-t border-[var(--theme-border)]'
                      } ${
                        selectedStatus === filter.value ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]' : 'text-[var(--theme-foreground)]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{filter.label}</span>
                      {selectedStatus === filter.value && (
                        <Check className="w-4 h-4 ml-auto text-[var(--theme-primary)]" />
                      )}
                    </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowFilterDropdown(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] transition-colors duration-300 hover:border-[var(--theme-accent)]/30"
              >
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4 text-[var(--theme-accent)]" />
                  <span className="text-sm font-semibold text-[var(--theme-foreground)]">
                    {[
                      { value: 'all', label: 'Tüm Zamanlar' },
                      { value: 'today', label: 'Bugün' },
                      { value: 'thisWeek', label: 'Bu Hafta' },
                      { value: 'thisMonth', label: 'Bu Ay' },
                      { value: 'thisYear', label: 'Bu Yıl' }
                    ].find(f => f.value === selectedDateFilter)?.label}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--theme-foregroundSecondary)] transition-transform duration-200 ${showDateDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDateDropdown && (
                <div className="absolute top-full mt-2 w-full bg-[var(--theme-card)] dark:bg-gray-800/90 rounded-xl border border-[var(--theme-border)] shadow-xl z-20 overflow-hidden">
                  {[
                    { value: 'all', label: 'Tüm Zamanlar', icon: Calendar },
                    { value: 'today', label: 'Bugün', icon: Clock },
                    { value: 'thisWeek', label: 'Bu Hafta', icon: Calendar },
                    { value: 'thisMonth', label: 'Bu Ay', icon: Calendar },
                    { value: 'thisYear', label: 'Bu Yıl', icon: Calendar }
                  ].map((filter, index) => {
                    const IconComponent = filter.icon;
                    return (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedDateFilter(filter.value);
                        setCurrentPage(1);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-[var(--theme-backgroundSecondary)] transition-colors duration-200 ${
                        index === 0 ? '' : 'border-t border-[var(--theme-border)]'
                      } ${
                        selectedDateFilter === filter.value ? 'bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]' : 'text-[var(--theme-foreground)]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{filter.label}</span>
                      {selectedDateFilter === filter.value && (
                        <Check className="w-4 h-4 ml-auto text-[var(--theme-accent)]" />
                      )}
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="transition-colors duration-300">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">Randevularınız Yükleniyor</h3>
                <p className="text-[var(--theme-foregroundSecondary)]">Lütfen bekleyin...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[var(--theme-error)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-[var(--theme-error)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--theme-foreground)] mb-3">Bir Hata Oluştu</h3>
              <p className="text-[var(--theme-foregroundSecondary)] mb-6 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchAppointments}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] rounded-xl text-sm font-semibold hover:shadow-lg  transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-accent)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6  transition-transform duration-300">
                <CalendarIcon className="w-12 h-12 text-[var(--theme-primary)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--theme-foreground)] mb-3">Henüz Randevu Yok</h3>
              <p className="text-[var(--theme-foregroundSecondary)] mb-6 max-w-md mx-auto transition-colors duration-300">
                {selectedStatus === 'all' && selectedDateFilter === 'all'
                  ? 'İlk randevunuzu oluşturmaya hazır mısınız? İşletmeleri keşfederek başlayabilirsiniz.' 
                  : 'Seçilen filtrelerde randevu bulunamadı. Diğer filtreleri deneyebilirsiniz.'
                }
              </p>
              <a 
                href="/businesses" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] rounded-xl text-sm font-semibold hover:shadow-lg  transition-all duration-300"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                İşletmeleri Keşfet
              </a>
            </div>
          ) : (
            <>
              {/* Collapsible Appointments Grid */}
              <div className="grid gap-4 sm:gap-6">
                {appointments.map((appointment) => {
                  const isExpanded = expandedCards.has(appointment.id);
                  const toggleCard = () => {
                    const newExpanded = new Set(expandedCards);
                    if (isExpanded) {
                      newExpanded.delete(appointment.id);
                    } else {
                      newExpanded.add(appointment.id);
                    }
                    setExpandedCards(newExpanded);
                  };
                  
                  return (
                  <div 
                    key={appointment.id} 
                    className="group relative bg-[var(--theme-card)] dark:bg-gray-800/60 rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/20 hover:shadow-xl transition-all duration-300"
                  >

                    {/* Compact Header - Always Visible */}
                    <div className="p-3 cursor-pointer" onClick={toggleCard}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0"
                            style={{ backgroundColor: appointment.business.primaryColor || 'var(--theme-primary)' }}
                          >
                            <User className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-[var(--theme-foreground)] group-hover:text-[var(--theme-primary)] transition-colors duration-300 truncate">
                              {appointment.service.name}
                            </h3>
                            <p className="text-sm text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300 truncate">
                              {appointment.business.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-[var(--theme-foreground)]">
                              {new Date(appointment.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                            </p>
                            <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                              {new Date(appointment.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${getStatusBadge(appointment.status)} shadow-sm`}>
                            {getStatusText(appointment.status)}
                          </span>
                          <ChevronDownIcon className={`w-4 h-4 text-[var(--theme-foregroundSecondary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-[var(--theme-border)]/50 bg-gradient-to-br from-[var(--theme-backgroundSecondary)]/10 to-transparent">
                        <div className="pt-3 space-y-3">
                          {/* Quick Info Row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[var(--theme-card)]/60 dark:bg-gray-700/40 rounded-lg p-2.5">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-[var(--theme-primary)]" />
                                <div>
                                  <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Tam Tarih</p>
                                  <p className="text-sm font-semibold text-[var(--theme-foreground)]">
                                    {new Date(appointment.date).toLocaleDateString('tr-TR', { 
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-[var(--theme-card)]/60 dark:bg-gray-700/40 rounded-lg p-2.5">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-[var(--theme-accent)]" />
                                <div>
                                  <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Süre</p>
                                  <p className="text-sm font-semibold text-[var(--theme-foreground)]">
                                    {new Date(appointment.startTime).toLocaleTimeString('tr-TR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })} - {new Date(new Date(appointment.startTime).getTime() + appointment.duration * 60000).toLocaleTimeString('tr-TR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })} ({appointment.duration}dk)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contact & Address Info */}
                          <div className="bg-[var(--theme-card)]/60 rounded-lg p-2.5">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-[var(--theme-primary)]" />
                                <div className="flex-1">
                                  <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Adres</p>
                                  <p className="text-sm text-[var(--theme-foreground)] font-semibold">{appointment.business.address}</p>
                                </div>
                              </div>
                              {appointment.business.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-[var(--theme-accent)]" />
                                  <div className="flex-1">
                                    <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Telefon</p>
                                    <p className="text-sm text-[var(--theme-foreground)] font-semibold">{appointment.business.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price & Service Details */}
                          {(!appointment.business.settings?.priceVisibility?.hideAllServicePrices || appointment.service.description) && (
                            <div className={`grid gap-3 ${
                              !appointment.business.settings?.priceVisibility?.hideAllServicePrices && appointment.service.description 
                                ? 'grid-cols-1 sm:grid-cols-2' 
                                : 'grid-cols-1'
                            }`}>
                              {!appointment.business.settings?.priceVisibility?.hideAllServicePrices && (
                                <div className="bg-gradient-to-r from-[var(--theme-success)]/10 to-[var(--theme-success)]/5 rounded-lg p-2.5 border border-[var(--theme-success)]/20">
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-[var(--theme-success)]" />
                                    <div>
                                      <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Ücret</p>
                                      <p className="text-lg font-bold text-[var(--theme-success)]">{appointment.price} {appointment.currency}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {appointment.service.description && (
                                <div className="bg-[var(--theme-card)]/60 dark:bg-gray-700/40 rounded-lg p-2.5">
                                  <div className="flex items-start space-x-2">
                                    <FileText className="w-4 h-4 text-[var(--theme-primary)] mt-0.5" />
                                    <div className="flex-1">
                                      <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium mb-1">Hizmet Açıklaması</p>
                                      <p className="text-sm text-[var(--theme-foreground)] leading-relaxed">{appointment.service.description}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Customer Notes */}
                          {appointment.customerNotes && (
                            <div className="bg-gradient-to-r from-[var(--theme-primary)]/10 to-[var(--theme-accent)]/10 rounded-lg p-2.5 border border-[var(--theme-primary)]/20">
                              <div className="flex items-start space-x-2">
                                <FileText className="w-4 h-4 text-[var(--theme-primary)] mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium mb-1">Müşteri Notu</p>
                                  <p className="text-sm text-[var(--theme-foreground)] leading-relaxed">{appointment.customerNotes}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Rating Section for Completed Appointments */}
                          {appointment.status === 'COMPLETED' && (
                            <div className="bg-gradient-to-r from-[var(--theme-success)]/10 to-[var(--theme-success)]/5 rounded-lg p-2.5 border border-[var(--theme-success)]/20">
                              <RatingEligibility
                                businessId={appointment.businessId}
                                appointmentId={appointment.id}
                                appointmentDetails={{
                                  date: appointment.date,
                                  time: appointment.startTime,
                                  serviceName: appointment.service.name,
                                  customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
                                }}
                                className="mt-0"
                              />
                            </div>
                          )}

                          {/* Cancel Button */}
                          {canCancelAppointment(appointment) && (
                            <div className="flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCancelModal(appointment);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[var(--theme-error)] to-red-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg  transition-all duration-300"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Randevuyu İptal Et
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                  );
                })}
              </div>

              {/* Mobile-Responsive Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex items-center justify-center">
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-[var(--theme-backgroundSecondary)] rounded-2xl p-2 border border-[var(--theme-border)]">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--theme-foreground)] rounded-xl hover:bg-[var(--theme-card)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Önceki</span>
                    </button>
                    
                    <div className="flex items-center space-x-0.5 sm:space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-lg'
                              : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--theme-foreground)] rounded-xl hover:bg-[var(--theme-card)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Sonraki</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Appointment Modal */}
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-card)] dark:bg-gray-800/90 rounded-2xl border border-[var(--theme-border)] max-w-md w-full p-6 shadow-2xl">
            {!showFinalConfirmation ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[var(--theme-error)] to-red-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--theme-foreground)]">Randevu İptal Et</h3>
                    <p className="text-sm text-[var(--theme-foregroundSecondary)]">Bu işlem geri alınamaz</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-[var(--theme-foreground)] mb-1">
                      {appointmentToCancel.service.name}
                    </p>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)] mb-2">
                      {appointmentToCancel.business.name}
                    </p>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                      {new Date(appointmentToCancel.date).toLocaleDateString('tr-TR', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })} - {new Date(appointmentToCancel.startTime).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="cancelReason" className="block text-sm font-semibold text-[var(--theme-foreground)] mb-2">
                      İptal Nedeni (İsteğe bağlı)
                    </label>
                    <textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="İptal nedeninizi yazabilirsiniz..."
                      className="w-full p-3 bg-[var(--theme-backgroundSecondary)] border border-[var(--theme-border)] rounded-lg text-sm text-[var(--theme-foreground)] placeholder-[var(--theme-foregroundSecondary)] focus:outline-none focus:border-[var(--theme-primary)] transition-colors duration-200 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setAppointmentToCancel(null);
                      setCancelReason('');
                      setShowFinalConfirmation(false);
                    }}
                    className="flex-1 px-4 py-2 bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-border)] transition-colors duration-200"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleCancelConfirmation}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--theme-error)] to-red-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg  transition-all duration-300"
                  >
                    Randevuyu İptal Et
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[var(--theme-error)] to-red-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--theme-foreground)]">Emin misiniz?</h3>
                    <p className="text-sm text-[var(--theme-foregroundSecondary)]">Bu işlem geri alınamaz</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="bg-gradient-to-r from-[var(--theme-error)]/10 to-red-500/10 rounded-lg p-4 border border-[var(--theme-error)]/20">
                    <p className="text-sm text-[var(--theme-foreground)] mb-2">
                      <strong>{appointmentToCancel.service.name}</strong> randevusunu iptal etmek istediğinizden emin misiniz?
                    </p>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                      Bu işlem geri alınamaz ve randevu kalıcı olarak iptal edilecektir.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelBack}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2 bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-border)] transition-colors duration-200 disabled:opacity-50"
                  >
                    Geri Dön
                  </button>
                  <button
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--theme-error)] to-red-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        İptal Ediliyor...
                      </div>
                    ) : (
                      'Evet, İptal Et'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}