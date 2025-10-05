'use client';

interface CalendarModeToggleProps {
  calendarMode: 'booking' | 'blocking';
  isSelecting: boolean;
  onModeChange: (mode: 'booking' | 'blocking') => void;
  onCancelSelection: () => void;
}

export default function CalendarModeToggle({
  calendarMode,
  isSelecting,
  onModeChange,
  onCancelSelection
}: CalendarModeToggleProps) {
  return (
    <>
      {/* Calendar Mode Toggle */}
      <div className="flex rounded-lg border border-[var(--theme-border)] p-1 bg-[var(--theme-backgroundSecondary)]">
        <button
          onClick={() => onModeChange('booking')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
            calendarMode === 'booking'
              ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
              : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
          }`}
          title="Müşteriler için randevu alın"
        >
          📅 Randevu Al
        </button>
        <button
          onClick={() => onModeChange('blocking')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
            calendarMode === 'blocking'
              ? 'bg-[var(--theme-error)] text-white shadow-sm'
              : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
          }`}
          title="Zaman aralığı kapatın"
        >
          🚫 Zaman Engelle
        </button>
      </div>

      {/* Mode Status Indicator */}
      <div className="text-xs text-[var(--theme-foregroundSecondary)] flex items-center gap-2">
        {calendarMode === 'booking' ? (
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full"></div>
            Randevu Alma Modu - Boş saatlere tıklayın
          </span>
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
                onClick={onCancelSelection}
                className="text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium underline"
              >
                İptal
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
