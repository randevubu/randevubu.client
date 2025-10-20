import { memo } from 'react';
import { useDashboard } from '../../context/DashboardContext';

const DashboardHeader = memo(() => {
  const { business, navigationItems, pathname, setSidebarOpen } = useDashboard();
  
  return (
  <header className="bg-[var(--theme-card)] shadow-sm border-b border-[var(--theme-border)] h-16 flex items-center transition-colors duration-300 overflow-x-hidden w-full">
    <div className="flex-1 flex items-center justify-between px-4 sm:px-6 overflow-x-hidden max-w-full">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-md text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] lg:hidden transition-colors duration-300"
        aria-label="Open sidebar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex-1 text-center lg:text-left lg:flex-none">
        <h1 className="text-lg sm:text-xl font-bold text-[var(--theme-foreground)] transition-colors duration-300">
          {navigationItems.find(item => item.href === pathname)?.name || 'Dashboard'}
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        {business.isVerified && (
          <span
            className="hidden sm:inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] transition-colors duration-300"
            aria-label="Doğrulanmış işletme"
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Doğrulanmış</span>
          </span>
        )}
      </div>
    </div>
  </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
