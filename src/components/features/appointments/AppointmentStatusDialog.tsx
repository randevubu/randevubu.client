import { memo } from 'react';
import { Appointment, AppointmentStatus } from '../../../types';
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getCustomerDisplayName,
  getCustomerPhoneNumber,
  getServiceName,
  formatTime
} from '../../../lib/utils/appointmentHelpers';

interface AppointmentStatusDialogProps {
  appointment: Appointment;
  isOpen: boolean;
  isUpdating: boolean;
  onClose: () => void;
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
}

// Helper function for button border colors
function getStatusBorderColor(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.PENDING:
      return 'border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20';
    case AppointmentStatus.CONFIRMED:
      return 'border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20';
    case AppointmentStatus.IN_PROGRESS:
      return 'border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20';
    case AppointmentStatus.COMPLETED:
      return 'border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20';
    case AppointmentStatus.CANCELED:
      return 'border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20';
    case AppointmentStatus.NO_SHOW:
      return 'border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20';
    default:
      return 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20';
  }
}

const AppointmentStatusDialog = memo(({
  appointment,
  isOpen,
  isUpdating,
  onClose,
  onUpdateStatus
}: AppointmentStatusDialogProps) => {
  if (!isOpen) return null;

  const availableStatuses = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELED,
    AppointmentStatus.NO_SHOW
  ].filter(status => status !== appointment.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--theme-card)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[var(--theme-cardForeground)]">
              Randevu Durumu
            </h3>
            <button
              onClick={onClose}
              className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] transition-colors"
              aria-label="Kapat"
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
                  {getCustomerDisplayName(appointment)}
                </span>
              </div>
              {getCustomerPhoneNumber(appointment) && (
                <div className="flex justify-between">
                  <span className="text-[var(--theme-foregroundSecondary)]">Telefon:</span>
                  <a 
                    href={`tel:${getCustomerPhoneNumber(appointment)}`}
                    className="text-[var(--theme-primary)] hover:text-[var(--theme-primaryForeground)] font-medium transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{getCustomerPhoneNumber(appointment)}</span>
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--theme-foregroundSecondary)]">Hizmet:</span>
                <span className="text-[var(--theme-foreground)] font-medium">
                  {getServiceName(appointment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--theme-foregroundSecondary)]">Tarih:</span>
                <span className="text-[var(--theme-foreground)] font-medium">
                  {formatTime(appointment.startTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--theme-foregroundSecondary)]">Mevcut Durum:</span>
                <div className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(appointment.status)}`}>
                  <span className="text-sm">{getStatusIcon(appointment.status)}</span>
                  <span>{getStatusText(appointment.status)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[var(--theme-cardForeground)] mb-3">
              Yeni Durum Seç:
            </h4>

            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => onUpdateStatus(appointment.id, status)}
                disabled={isUpdating}
                className={`w-full p-3 border-2 rounded-xl text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 ${getStatusBorderColor(status)}`}
              >
                <span className="text-lg">{getStatusIcon(status)}</span>
                <span className="font-medium text-[var(--theme-foreground)]">
                  {getStatusText(status)}
                </span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isUpdating && (
            <div className="flex items-center justify-center py-4 mt-4">
              <div className="w-6 h-6 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-[var(--theme-foregroundSecondary)]">Güncelleniyor...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AppointmentStatusDialog.displayName = 'AppointmentStatusDialog';

export default AppointmentStatusDialog;
