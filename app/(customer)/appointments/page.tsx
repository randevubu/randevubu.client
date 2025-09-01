'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { appointmentService } from '@/src/lib/services/appointments';
import { isCustomer } from '@/src/lib/utils/permissions';

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
      console.error('Failed to fetch appointments:', error);
      setError('Randevular yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
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
      case 'NO_SHOW':
        return 'Gelmedi';
      default:
        return status;
    }
  };

  // Show skeleton loading while auth context is initializing
  if (!hasInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/5 via-[var(--theme-background)] to-[var(--theme-accent)]/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
          {/* Skeleton Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="w-16 h-16 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-3xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
                </svg>
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
              <div key={index} className="bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/5 via-[var(--theme-background)] to-[var(--theme-accent)]/5 transition-colors duration-300">
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
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/5 via-[var(--theme-background)] to-[var(--theme-accent)]/5 transition-colors duration-300">
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
              <svg className="w-8 h-8 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
              </svg>
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
                  <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  <span className="text-sm font-semibold text-[var(--theme-foreground)]">
                    {[
                      { value: 'all', label: 'Tüm Durumlar' },
                      { value: 'CONFIRMED', label: 'Onaylandı' },
                      { value: 'COMPLETED', label: 'Tamamlandı' },
                      { value: 'CANCELLED', label: 'İptal' },
                      { value: 'NO_SHOW', label: 'Gelmedi' }
                    ].find(f => f.value === selectedStatus)?.label}
                  </span>
                </div>
                <svg className={`w-4 h-4 text-[var(--theme-foregroundSecondary)] transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full mt-2 w-full bg-[var(--theme-card)] rounded-xl border border-[var(--theme-border)] shadow-xl z-20 overflow-hidden">
                  {[
                    { value: 'all', label: 'Tüm Durumlar', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z' },
                    { value: 'CONFIRMED', label: 'Onaylandı', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { value: 'COMPLETED', label: 'Tamamlandı', icon: 'M5 13l4 4L19 7' },
                    { value: 'CANCELLED', label: 'İptal', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { value: 'NO_SHOW', label: 'Gelmedi', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728' }
                  ].map((filter, index) => (
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
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filter.icon} />
                      </svg>
                      <span className="text-sm font-medium">{filter.label}</span>
                      {selectedStatus === filter.value && (
                        <svg className="w-4 h-4 ml-auto text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
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
                  <svg className="w-4 h-4 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
                  </svg>
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
                <svg className={`w-4 h-4 text-[var(--theme-foregroundSecondary)] transition-transform duration-200 ${showDateDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDateDropdown && (
                <div className="absolute top-full mt-2 w-full bg-[var(--theme-card)] rounded-xl border border-[var(--theme-border)] shadow-xl z-20 overflow-hidden">
                  {[
                    { value: 'all', label: 'Tüm Zamanlar', icon: 'M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z' },
                    { value: 'today', label: 'Bugün', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { value: 'thisWeek', label: 'Bu Hafta', icon: 'M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z' },
                    { value: 'thisMonth', label: 'Bu Ay', icon: 'M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z' },
                    { value: 'thisYear', label: 'Bu Yıl', icon: 'M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z' }
                  ].map((filter, index) => (
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
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filter.icon} />
                      </svg>
                      <span className="text-sm font-medium">{filter.label}</span>
                      {selectedDateFilter === filter.value && (
                        <svg className="w-4 h-4 ml-auto text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
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
                <svg className="w-8 h-8 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--theme-foreground)] mb-3">Bir Hata Oluştu</h3>
              <p className="text-[var(--theme-foregroundSecondary)] mb-6 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchAppointments}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] rounded-xl text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tekrar Dene
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-accent)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
                <svg className="w-12 h-12 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
                </svg>
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
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] text-[var(--theme-primaryForeground)] rounded-xl text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
                    className="group relative bg-gradient-to-r from-[var(--theme-card)] to-[var(--theme-card)]/80 backdrop-blur-xl rounded-2xl border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/20 hover:shadow-xl sm:transform sm:hover:-translate-y-1 transition-all duration-300"
                  >

                    {/* Compact Header - Always Visible */}
                    <div className="p-3 cursor-pointer" onClick={toggleCard}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md flex-shrink-0"
                            style={{ backgroundColor: appointment.business.primaryColor || 'var(--theme-primary)' }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
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
                          <svg className={`w-4 h-4 text-[var(--theme-foregroundSecondary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 border-t border-[var(--theme-border)]/50 bg-gradient-to-br from-[var(--theme-backgroundSecondary)]/10 to-transparent">
                        <div className="pt-3 space-y-3">
                          {/* Quick Info Row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[var(--theme-card)]/60 rounded-lg p-2.5">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m16 0v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7h16z" />
                                </svg>
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

                            <div className="bg-[var(--theme-card)]/60 rounded-lg p-2.5">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
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
                                <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Adres</p>
                                  <p className="text-sm text-[var(--theme-foreground)] font-semibold">{appointment.business.address}</p>
                                </div>
                              </div>
                              {appointment.business.phone && (
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <div className="flex-1">
                                    <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Telefon</p>
                                    <p className="text-sm text-[var(--theme-foreground)] font-semibold">{appointment.business.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price & Service Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-gradient-to-r from-[var(--theme-success)]/10 to-[var(--theme-success)]/5 rounded-lg p-2.5 border border-[var(--theme-success)]/20">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <div>
                                  <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium">Ücret</p>
                                  <p className="text-lg font-bold text-[var(--theme-success)]">{appointment.price} {appointment.currency}</p>
                                </div>
                              </div>
                            </div>
                            
                            {appointment.service.description && (
                              <div className="bg-[var(--theme-card)]/60 rounded-lg p-2.5">
                                <div className="flex items-start space-x-2">
                                  <svg className="w-4 h-4 text-[var(--theme-primary)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div className="flex-1">
                                    <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium mb-1">Hizmet Açıklaması</p>
                                    <p className="text-sm text-[var(--theme-foreground)] leading-relaxed">{appointment.service.description}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Customer Notes */}
                          {appointment.customerNotes && (
                            <div className="bg-gradient-to-r from-[var(--theme-primary)]/10 to-[var(--theme-accent)]/10 rounded-lg p-2.5 border border-[var(--theme-primary)]/20">
                              <div className="flex items-start space-x-2">
                                <svg className="w-4 h-4 text-[var(--theme-primary)] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-xs text-[var(--theme-foregroundSecondary)] font-medium mb-1">Müşteri Notu</p>
                                  <p className="text-sm text-[var(--theme-foreground)] leading-relaxed">{appointment.customerNotes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hover Gradient Border Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--theme-primary)]/20 via-[var(--theme-accent)]/20 to-[var(--theme-primary)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
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
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}