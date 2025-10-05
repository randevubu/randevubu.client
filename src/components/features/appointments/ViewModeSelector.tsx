'use client';

interface ViewModeSelectorProps {
  viewMode: 'daily' | 'weekly' | 'monthly';
  onViewModeChange: (mode: 'daily' | 'weekly' | 'monthly') => void;
}

export default function ViewModeSelector({ viewMode, onViewModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex rounded-lg border border-[var(--theme-border)] p-1 bg-[var(--theme-backgroundSecondary)]">
      <button
        onClick={() => onViewModeChange('daily')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
          viewMode === 'daily'
            ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
            : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
        }`}
      >
        Günlük
      </button>
      <button
        onClick={() => onViewModeChange('weekly')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
          viewMode === 'weekly'
            ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
            : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
        }`}
      >
        Haftalık
      </button>
      <button
        onClick={() => onViewModeChange('monthly')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
          viewMode === 'monthly'
            ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] shadow-sm'
            : 'text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
        }`}
      >
        Aylık
      </button>
    </div>
  );
}
