'use client';

import { useState } from 'react';
import { Search, User, Mail, Phone, MapPin, Calendar, Clock, AlertCircle, CheckCircle, X, ChevronDown, ChevronRight, Filter, Eye, Ban, Shield, MoreVertical, Edit, Trash2, RefreshCw, Plus, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Customer, CustomerDetails, BanCustomerRequest, UnbanCustomerRequest } from '../../../lib/services/customers';
import { canViewBusinessStats } from '../../../lib/utils/permissions';
import { banCustomerSchema } from '../../../lib/validation/customers';
import { useCustomers, useCustomerDetails, useBanCustomer, useUnbanCustomer } from '../../../lib/hooks/useCustomers';

export default function CustomersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBanConfirmModal, setShowBanConfirmModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState(30);
  const [banIsTemporary, setBanIsTemporary] = useState(true);
  const [banNotifyCustomer, setBanNotifyCustomer] = useState(true);
  const [banAdditionalNotes, setBanAdditionalNotes] = useState('');
  const [banErrors, setBanErrors] = useState<Record<string, string>>({});
  
  // Unban states
  const [showUnbanConfirmModal, setShowUnbanConfirmModal] = useState(false);
  const [unbanReason, setUnbanReason] = useState('');
  const [unbanNotifyCustomer, setUnbanNotifyCustomer] = useState(true);
  const [unbanRestoreAccess, setUnbanRestoreAccess] = useState(true);

  // TanStack Query hooks
  const { data: customersData, isLoading, error } = useCustomers({
    page: currentPage,
    limit: 50,
    search: searchQuery.trim() || undefined,
  });

  const { data: selectedCustomer, isLoading: isLoadingDetails } = useCustomerDetails(selectedCustomerId);

  const banCustomerMutation = useBanCustomer();
  const unbanCustomerMutation = useUnbanCustomer();

  // Extract data from query results
  const customers = customersData?.customers || [];
  const total = customersData?.total || 0;
  const totalPages = customersData?.totalPages || 1;

  // Check if user has permission to view customers
  const canViewCustomers = user && canViewBusinessStats(user);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedCustomerId(null);
  };

  const handleBanClick = () => {
    setShowBanConfirmModal(true);
  };

  const handleBanConfirm = async () => {
    if (!selectedCustomerId) return;

    const banData: BanCustomerRequest = {
      reason: banReason.trim(),
      isTemporary: banIsTemporary,
      notifyCustomer: banNotifyCustomer,
      additionalNotes: banAdditionalNotes.trim() || undefined
    };

    // Only include durationDays for temporary bans
    if (banIsTemporary) {
      banData.durationDays = parseInt(String(banDuration), 10);
    }

    // Validate the data
    try {
      banCustomerSchema.parse(banData);
    } catch (error) {
      if (error instanceof Error) {
        setBanErrors({ general: error.message });
      }
      return;
    }

    banCustomerMutation.mutate(
      { customerId: selectedCustomerId, banData },
      {
        onSuccess: () => {
          // Reset form and close modals
          setBanReason('');
          setBanDuration(30);
          setBanIsTemporary(true);
          setBanNotifyCustomer(true);
          setBanAdditionalNotes('');
          setBanErrors({});
          setShowBanConfirmModal(false);
          setShowDetailsModal(false);
          setSelectedCustomerId(null);
        },
        onError: () => {
          // Error is handled by the mutation hook
        },
      }
    );
  };

  const closeBanConfirmModal = () => {
    setShowBanConfirmModal(false);
    setBanReason('');
    setBanDuration(30);
    setBanIsTemporary(true);
    setBanNotifyCustomer(true);
    setBanAdditionalNotes('');
    setBanErrors({});
  };

  const handleUnbanClick = () => {
    setShowUnbanConfirmModal(true);
  };

  const handleUnbanConfirm = async () => {
    if (!selectedCustomerId || !unbanReason.trim()) return;

    const unbanData: UnbanCustomerRequest = {
      reason: unbanReason.trim(),
      notifyCustomer: unbanNotifyCustomer,
      restoreAccess: unbanRestoreAccess
    };

    unbanCustomerMutation.mutate(
      { customerId: selectedCustomerId, unbanData },
      {
        onSuccess: () => {
          // Reset form and close modals
          setUnbanReason('');
          setUnbanNotifyCustomer(true);
          setUnbanRestoreAccess(true);
          setShowUnbanConfirmModal(false);
          setShowDetailsModal(false);
          setSelectedCustomerId(null);
        },
        onError: () => {
          // Error is handled by the mutation hook
        },
      }
    );
  };

  const closeUnbanConfirmModal = () => {
    setShowUnbanConfirmModal(false);
    setUnbanReason('');
    setUnbanNotifyCustomer(true);
    setUnbanRestoreAccess(true);
  };

  if (!canViewCustomers) {
    return (
      <div className="p-3 sm:p-6 bg-[var(--theme-background)] transition-colors duration-300">
        <div className="text-center py-8 sm:py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[var(--theme-error)]/20 mb-3 sm:mb-4">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--theme-error)]" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-2">Erişim Reddedildi</h3>
          <p className="text-sm sm:text-base text-[var(--theme-foregroundSecondary)]">Müşteri listesini görüntülemek için yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 bg-[var(--theme-background)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[var(--theme-card)] rounded-lg sm:rounded-xl shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
          {/* Compact Header */}
          <div className="bg-[var(--theme-primary)] px-3 py-3 sm:px-6 sm:py-4 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--theme-card)]/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Müşteriler</h1>
                  <p className="text-white/70 text-xs sm:text-sm hidden sm:block">İşletmelerinize randevu alan müşteriler</p>
                </div>
              </div>
              <div className="text-white text-right">
                <div className="text-xl sm:text-2xl font-bold">{total}</div>
                <div className="text-xs sm:text-sm text-white/70">Toplam</div>
              </div>
            </div>
          </div>

          {/* Compact Search and Filters */}
          <div className="px-3 py-2 sm:px-6 sm:py-3 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
            <form onSubmit={handleSearch} className="space-y-2">
              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--theme-foregroundMuted)]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Müşteri adı veya telefon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-7 sm:pl-10 pr-3 py-2 border border-[var(--theme-border)] rounded-lg text-sm placeholder-[var(--theme-foregroundMuted)] bg-[var(--theme-card)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-colors duration-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Ara</span>
                </button>
              </div>
              

            </form>
          </div>

          {/* Content */}
          <div className="px-3 py-3 sm:px-6 sm:py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base text-[var(--theme-foregroundSecondary)]">Müşteriler yükleniyor...</span>
                </div>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-3 sm:mb-4">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--theme-foregroundMuted)]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-2">
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz müşteriniz yok'}
                </h3>
                <p className="text-sm sm:text-base text-[var(--theme-foregroundSecondary)]">
                  {searchQuery 
                    ? 'Arama kriterlerinizi değiştirip tekrar deneyin.' 
                    : 'İlk randevunuz alındığında müşterileriniz burada görünecek.'}
                </p>
              </div>
            ) : (
              <>
                {/* Compact Customer Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  {customers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className={`bg-[var(--theme-card)] border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        customer.isBanned 
                          ? 'border-red-300 bg-red-50/50' 
                          : 'border-[var(--theme-border)]'
                      }`}
                      onClick={() => handleCustomerClick(customer.id)}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0">
                          {customer.profilePicture ? (
                            <img
                              src={customer.profilePicture}
                              alt={`${customer.firstName} ${customer.lastName}`}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[var(--theme-foreground)] truncate">
                              {customer.firstName} {customer.lastName}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {customer.isBanned && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--theme-error)]/20 text-[var(--theme-error)]">
                                  <Ban className="w-3 h-3 mr-1" />
                                  Engelli
                                </span>
                              )}
                              {Number(customer.currentStrikes) > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--theme-warning)]/20 text-[var(--theme-warning)]">
                                  ⚠️ {customer.currentStrikes}
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                customer.isActive 
                                  ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                                  : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                              }`}>
                                {customer.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center text-xs text-[var(--theme-foregroundSecondary)]">
                              <Phone className="w-3 h-3 mr-1" />
                              <span className="truncate">{customer.phoneNumber}</span>
                            </div>
                            
                            {customer.email && (
                              <div className="flex items-center text-xs text-[var(--theme-foregroundSecondary)]">
                                <Mail className="w-3 h-3 mr-1" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compact Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[var(--theme-border)] px-3 py-3 sm:px-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-backgroundSecondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Önceki
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md hover:bg-[var(--theme-backgroundSecondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-[var(--theme-foregroundSecondary)]">
                          <span className="font-medium">{((currentPage - 1) * 50) + 1}</span>
                          {' '}-{' '}
                          <span className="font-medium">{Math.min(currentPage * 50, total)}</span>
                          {' '}arası, toplam{' '}
                          <span className="font-medium">{total}</span> sonuç
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-[var(--theme-backgroundSecondary)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  currentPage === pageNumber
                                    ? 'z-10 bg-[var(--theme-primary)] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    : 'text-[var(--theme-foreground)] ring-1 ring-inset ring-gray-300 hover:bg-[var(--theme-backgroundSecondary)] focus:z-20 focus:outline-offset-0'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-[var(--theme-backgroundSecondary)] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[var(--theme-card)] rounded-t-xl sm:rounded-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Mobile-optimized header */}
            <div className="sticky top-0 bg-[var(--theme-card)] border-b border-[var(--theme-border)] px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--theme-foreground)]">Müşteri Detayları</h2>
                <button
                  onClick={closeDetailsModal}
                  className="p-2 hover:bg-[var(--theme-backgroundSecondary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-foregroundMuted)]" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base text-[var(--theme-foregroundSecondary)]">Müşteri detayları yükleniyor...</span>
                  </div>
                </div>
              ) : selectedCustomer ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Customer Header - Mobile optimized */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="flex-shrink-0">
                      {selectedCustomer.avatar || selectedCustomer.profilePicture ? (
                        <img
                          src={selectedCustomer.avatar || selectedCustomer.profilePicture}
                          alt={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                          className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-16 sm:h-16 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 sm:w-8 sm:h-8 text-[var(--theme-primary)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl sm:text-2xl font-semibold text-[var(--theme-foreground)]">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                        {selectedCustomer.isBanned && (
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[var(--theme-error)]/20 text-[var(--theme-error)]">
                            <Ban className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Engelli
                          </span>
                        )}
                        {selectedCustomer.currentStrikes > 0 && (
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[var(--theme-warning)]/20 text-[var(--theme-warning)]">
                            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {selectedCustomer.currentStrikes} Uyarı
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                          selectedCustomer.isActive 
                            ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                            : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                        }`}>
                          {selectedCustomer.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        {selectedCustomer.isVerified && (
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[var(--theme-info)]/20 text-[var(--theme-info)]">
                            Doğrulanmış
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Better placement */}
                  <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b border-[var(--theme-border)]">
                    {selectedCustomer?.isBanned ? (
                      <button
                        onClick={handleUnbanClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Engeli Kaldır
                      </button>
                    ) : (
                      <button
                        onClick={handleBanClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Engelle
                      </button>
                    )}
                  </div>

                  {/* Ban Information - Show only if banned */}
                  {selectedCustomer.isBanned && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-red-900 mb-4 flex items-center">
                        <Ban className="w-5 h-5 mr-2" />
                        Engelleme Bilgileri
                      </h4>
                      <div className="space-y-3">
                        {selectedCustomer.banReason && (
                          <div>
                            <span className="font-medium text-red-800">Engelleme Nedeni: </span>
                            <span className="text-red-700">{selectedCustomer.banReason}</span>
                          </div>
                        )}
                        {selectedCustomer.bannedUntil && (
                          <div>
                            <span className="font-medium text-red-800">Engel Bitiş Tarihi: </span>
                            <span className="text-red-700">
                              {new Date(selectedCustomer.bannedUntil).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        {!selectedCustomer.bannedUntil && (
                          <div>
                            <span className="font-medium text-red-800">Engel Türü: </span>
                            <span className="text-red-700">Kalıcı Engel</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-4">
                    <h4 className="text-lg font-medium text-[var(--theme-foreground)] mb-4">İletişim Bilgileri</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-[var(--theme-foreground)]">{selectedCustomer.phoneNumber}</span>
                      </div>
                      {selectedCustomer.email && (
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-[var(--theme-foreground)]">{selectedCustomer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Statistics */}
                  <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-4">
                    <h4 className="text-lg font-medium text-[var(--theme-foreground)] mb-4">Randevu İstatistikleri</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalAppointments}</div>
                        <div className="text-sm text-[var(--theme-foregroundSecondary)]">Toplam Randevu</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedCustomer.completedAppointments}</div>
                        <div className="text-sm text-[var(--theme-foregroundSecondary)]">Tamamlanan</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedCustomer.cancelledAppointments}</div>
                        <div className="text-sm text-[var(--theme-foregroundSecondary)]">İptal Edilen</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedCustomer.noShowCount}</div>
                        <div className="text-sm text-[var(--theme-foregroundSecondary)]">Gelmedi</div>
                      </div>
                    </div>
                  </div>

                  {/* Reliability Score */}
                  <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-4">
                    <h4 className="text-lg font-medium text-[var(--theme-foreground)] mb-4">Güvenilirlik Skoru</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(selectedCustomer.reliabilityScore, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xl font-bold text-[var(--theme-foreground)]">{selectedCustomer.reliabilityScore}%</span>
                    </div>
                    <div className="text-sm text-[var(--theme-foregroundSecondary)] mt-2">
                      {selectedCustomer.reliabilityScore >= 80 ? 'Çok güvenilir' : 
                       selectedCustomer.reliabilityScore >= 60 ? 'Güvenilir' :
                       selectedCustomer.reliabilityScore >= 40 ? 'Orta düzey' : 'Düşük güvenilirlik'}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-4">
                    <h4 className="text-lg font-medium text-[var(--theme-foreground)] mb-4">Hesap Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-[var(--theme-foregroundSecondary)]">Kayıt Tarihi: </span>
                        <span className="text-[var(--theme-foreground)]">{new Date(selectedCustomer.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      {selectedCustomer.lastLoginAt && (
                        <div>
                          <span className="font-medium text-[var(--theme-foregroundSecondary)]">Son Giriş: </span>
                          <span className="text-[var(--theme-foreground)]">{new Date(selectedCustomer.lastLoginAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                      {selectedCustomer.lastAppointmentDate && (
                        <div>
                          <span className="font-medium text-[var(--theme-foregroundSecondary)]">Son Randevu: </span>
                          <span className="text-[var(--theme-foreground)]">{new Date(selectedCustomer.lastAppointmentDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-[var(--theme-foregroundMuted)]">Müşteri detayları yüklenemedi.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {showBanConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--theme-card)] rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-[var(--theme-border)]">
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Müşteriyi Engelle</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Bu işlem geri alınamaz!
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        {selectedCustomer && `${selectedCustomer.firstName} ${selectedCustomer.lastName}`} adlı müşteriyi engellemek istediğinizden emin misiniz?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                  Engelleme Nedeni *
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                    banErrors.reason 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-[var(--theme-border)] focus:ring-red-500'
                  }`}
                  rows={3}
                  placeholder="Müşteriyi engelleme nedenini açıklayın..."
                  required
                />
                {banErrors.reason && (
                  <p className="mt-1 text-sm text-red-600">{banErrors.reason}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                    Süre (Gün)
                  </label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(parseInt(e.target.value) || 30)}
                    disabled={!banIsTemporary}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      banErrors.durationDays 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-[var(--theme-border)] focus:ring-red-500'
                    } ${!banIsTemporary ? 'bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundMuted)] cursor-not-allowed' : ''}`}
                    min="1"
                    max="365"
                  />
                  {banErrors.durationDays && (
                    <p className="mt-1 text-sm text-red-600">{banErrors.durationDays}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                    Engelleme Türü
                  </label>
                  <select
                    value={banIsTemporary ? 'temporary' : 'permanent'}
                    onChange={(e) => setBanIsTemporary(e.target.value === 'temporary')}
                    className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="temporary">Geçici</option>
                    <option value="permanent">Kalıcı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={banNotifyCustomer}
                    onChange={(e) => setBanNotifyCustomer(e.target.checked)}
                    className="rounded border-[var(--theme-border)] text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-[var(--theme-foregroundSecondary)]">Müşteriyi bilgilendir</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                  Ek Notlar
                </label>
                <textarea
                  value={banAdditionalNotes}
                  onChange={(e) => setBanAdditionalNotes(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                    banErrors.additionalNotes 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-[var(--theme-border)] focus:ring-red-500'
                  }`}
                  rows={2}
                  placeholder="Ek bilgiler veya notlar..."
                />
                {banErrors.additionalNotes && (
                  <p className="mt-1 text-sm text-red-600">{banErrors.additionalNotes}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-t border-[var(--theme-border)] flex items-center justify-end space-x-3 rounded-b-xl">
              <button
                onClick={closeBanConfirmModal}
                disabled={banCustomerMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={handleBanConfirm}
                disabled={banCustomerMutation.isPending || !banReason.trim() || Object.keys(banErrors).length > 0}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {banCustomerMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Engelleniyor...
                  </>
                ) : (
                  'Engelle'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Confirmation Modal */}
      {showUnbanConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--theme-card)] rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-[var(--theme-border)]">
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Engeli Kaldır</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Engeli Kaldır
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        {selectedCustomer && `${selectedCustomer.firstName} ${selectedCustomer.lastName}`} adlı müşterinin engelini kaldırmak istediğinizden emin misiniz?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                  Engel Kaldırma Nedeni *
                </label>
                <textarea
                  value={unbanReason}
                  onChange={(e) => setUnbanReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Engelin neden kaldırıldığını açıklayın..."
                  required
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={unbanNotifyCustomer}
                      onChange={(e) => setUnbanNotifyCustomer(e.target.checked)}
                      className="rounded border-[var(--theme-border)] text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-[var(--theme-foregroundSecondary)]">Müşteriyi bilgilendir</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={unbanRestoreAccess}
                      onChange={(e) => setUnbanRestoreAccess(e.target.checked)}
                      className="rounded border-[var(--theme-border)] text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-[var(--theme-foregroundSecondary)]">Erişimi geri yükle</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-t border-[var(--theme-border)] flex items-center justify-end space-x-3 rounded-b-xl">
              <button
                onClick={closeUnbanConfirmModal}
                disabled={unbanCustomerMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={handleUnbanConfirm}
                disabled={unbanCustomerMutation.isPending || !unbanReason.trim()}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unbanCustomerMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Engel Kaldırılıyor...
                  </>
                ) : (
                  'Engeli Kaldır'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}