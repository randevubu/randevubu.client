'use client';

interface DateNavigationProps {
  viewMode: 'daily' | 'weekly' | 'monthly';
  selectedDate: string;
  weekStart: Date;
  monthStart: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onDateChange: (date: string) => void;
  hasAppointments?: boolean;
  onNavigateToFirstAppointment?: () => void;
}

export default function DateNavigation({
  viewMode,
  selectedDate,
  weekStart,
  monthStart,
  onNavigate,
  onDateChange,
  hasAppointments,
  onNavigateToFirstAppointment
}: DateNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onNavigate('prev')}
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
        onClick={() => onNavigate('next')}
        className="p-1.5 text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-2 py-1 text-xs border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)]"
      />

      {hasAppointments && onNavigateToFirstAppointment && (
        <button
          onClick={onNavigateToFirstAppointment}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          title="Navigate to first appointment date"
        >
          İlk Randevuya Git
        </button>
      )}
    </div>
  );
}
