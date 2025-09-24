'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Customer } from '../../lib/services/customers';
import { appointmentService, CreateAppointmentData } from '../../lib/services/appointments';
import { servicesService } from '../../lib/services/services';
import { businessService } from '../../lib/services/business';
import { handleApiError, showSuccessToast } from '../../lib/utils/toast';
import { hasRole, isStaff, isOwner } from '../../lib/utils/permissions';
import { Service } from '../../types/service';
import { useUsageLimits } from '../../lib/hooks/useUsageTracking';
import { isQuotaError, getQuotaErrorData } from '../../lib/services/error';
import { isApiError } from '../../lib/services/error';
import CustomerSelector from './CustomerSelector';
import QuotaExceededDialog from '../ui/QuotaExceededDialog';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

interface AppointmentBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  selectedDate: string;
  selectedTimeSlot: string;
  onAppointmentCreated: () => void;
}

interface ExtendedCreateAppointmentData extends CreateAppointmentData {
  customerId?: string; // New field for booking on behalf of customers
}

export default function AppointmentBookingDialog({
  isOpen,
  onClose,
  businessId,
  selectedDate,
  selectedTimeSlot,
  onAppointmentCreated
}: AppointmentBookingDialogProps) {
  const { user } = useAuth();
  const [canBookForOthers, setCanBookForOthers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [quotaError, setQuotaError] = useState<{ code: string; message: string } | null>(null);

  // Usage limits hook
  const { canAddCustomer } = useUsageLimits(businessId);

  const [formData, setFormData] = useState<ExtendedCreateAppointmentData>({
    businessId,
    serviceId: '',
    date: selectedDate,
    startTime: selectedTimeSlot,
    staffId: '',
    customerNotes: ''
  });

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      checkPermissions();
      loadServices();
      loadStaff();
    }
  }, [isOpen, businessId]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      businessId,
      date: selectedDate,
      startTime: selectedTimeSlot
    }));
  }, [businessId, selectedDate, selectedTimeSlot]);

  const checkPermissions = () => {
    // Check if user can book for other customers
    const hasPermission = user && (isOwner(user) || isStaff(user) || hasRole(user, 'MANAGER'));
    setCanBookForOthers(!!hasPermission);
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesService.getBusinessServices(businessId);
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await businessService.getBusinessStaff(businessId);
      if (response.success && response.data) {
        setStaff(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
      // Staff loading is optional, don't show error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceId) {
      handleApiError(new Error('Lütfen bir hizmet seçin'));
      return;
    }

    // Check if creating new customer and quota is exceeded
    if (selectedCustomer === null && !canAddCustomer()) {
      setQuotaError({
        code: 'CUSTOMER_LIMIT_EXCEEDED',
        message: 'Müşteri limitiniz dolmuş. Daha fazla müşteri eklemek için paketinizi yükseltin.'
      });
      setShowQuotaDialog(true);
      return;
    }

    setSubmitting(true);

    try {
      const appointmentData: ExtendedCreateAppointmentData = {
        ...formData,
        // Include customerId only if booking for someone else
        ...(selectedCustomer && { customerId: selectedCustomer.id })
      };

      const response = await appointmentService.createAppointment(appointmentData as CreateAppointmentData);

      if (response.success) {
        onAppointmentCreated();
        handleClose();

        const customerName = selectedCustomer
          ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
          : 'sizin';
        showSuccessToast(`${customerName} için randevu başarıyla oluşturuldu!`);
      } else {
        throw new Error(response.message || 'Randevu oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Failed to create appointment:', error);

      // Check if this is a quota error
      if (isApiError(error) && isQuotaError(error)) {
        const quotaData = getQuotaErrorData(error);
        if (quotaData) {
          setQuotaError({
            code: quotaData.code || 'UNKNOWN_QUOTA_ERROR',
            message: quotaData.message || 'Quota exceeded'
          });
          setShowQuotaDialog(true);
          return;
        }
      }

      // Handle specific error messages
      const errorMessages: Record<string, string> = {
        'You do not have permission to create appointments for other customers':
          'Diğer müşteriler için randevu oluşturma yetkiniz yok.',
        'Customer not found':
          'Seçilen müşteri bulunamadı.',
        'Customer account is not active':
          'Bu müşteri hesabı aktif değil.',
        'Customer is banned':
          'Bu müşteri yasaklı durumda.',
        'Staff member is not available at the selected time':
          'Seçilen saatte personel müsait değil.'
      };

      const userFriendlyMessage = errorMessages[error.message] || error.message;
      handleApiError(new Error(userFriendlyMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      businessId,
      serviceId: '',
      date: selectedDate,
      startTime: selectedTimeSlot,
      staffId: '',
      customerNotes: ''
    });
    setSelectedCustomer(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[var(--theme-card)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--theme-border)] transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--theme-foreground)]">
              Randevu Oluştur
            </h2>
            <button
              onClick={handleClose}
              className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6 p-4 bg-[var(--theme-backgroundSecondary)] rounded-lg">
            <div className="text-sm text-[var(--theme-foregroundSecondary)]">
              <div><strong>Tarih:</strong> {new Date(selectedDate).toLocaleDateString('tr-TR')}</div>
              <div><strong>Saat:</strong> {selectedTimeSlot}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer selector - only show if user has permissions */}
            {canBookForOthers && (
              <div className="border-2 border-dashed border-[var(--theme-border)] rounded-lg p-4 bg-[var(--theme-backgroundSecondary)]/50">
                <CustomerSelector
                  businessId={businessId}
                  onCustomerSelect={setSelectedCustomer}
                  selectedCustomer={selectedCustomer}
                  disabled={submitting}
                />

                {/* Show warning when customer limits are reached */}
                {!canAddCustomer() && !selectedCustomer && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="text-yellow-600 mr-2 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-yellow-800 text-sm font-medium">
                          Müşteri Limiti Doldu
                        </p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Yeni müşteri eklemek için mevcut bir müşteriyi seçin veya paketinizi yükseltin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Service selection */}
            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
                Hizmet *
              </label>
              <select
                id="serviceId"
                value={formData.serviceId}
                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                disabled={loading || submitting}
                required
                className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
              >
                <option value="">Hizmet seçin</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.price}₺ ({service.duration} dk)
                  </option>
                ))}
              </select>
            </div>

            {/* Staff selection */}
            {staff.length > 0 && (
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
                  Personel (İsteğe bağlı)
                </label>
                <select
                  id="staffId"
                  value={formData.staffId || ''}
                  onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
                >
                  <option value="">Herhangi bir personel</option>
                  {staff.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="customerNotes" className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
                Notlar
              </label>
              <textarea
                id="customerNotes"
                value={formData.customerNotes || ''}
                onChange={(e) => setFormData({...formData, customerNotes: e.target.value})}
                disabled={submitting}
                rows={3}
                maxLength={500}
                placeholder={selectedCustomer ? `${selectedCustomer.firstName} için notlar...` : "Randevu için notlarınız..."}
                className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
              />
              <p className="mt-1 text-xs text-[var(--theme-foregroundSecondary)]">
                Maksimum 500 karakter
              </p>
            </div>

            {/* Form actions */}
            <div className="flex gap-3 pt-6 border-t border-[var(--theme-border)]">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--theme-foreground)] bg-[var(--theme-backgroundSecondary)] hover:bg-[var(--theme-backgroundTertiary)] rounded-md transition-colors duration-200 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting || loading || !formData.serviceId}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryHover)] rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Oluşturuluyor...
                  </span>
                ) : (
                  selectedCustomer
                    ? `${selectedCustomer.firstName} için Randevu Oluştur`
                    : 'Randevu Oluştur'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quota Exceeded Dialog */}
      {showQuotaDialog && quotaError && (
        <QuotaExceededDialog
          isOpen={showQuotaDialog}
          onClose={() => setShowQuotaDialog(false)}
          errorCode={quotaError.code}
          errorMessage={quotaError.message}
          businessId={businessId}
        />
      )}
    </div>
  );
}