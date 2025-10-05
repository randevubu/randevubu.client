import { memo } from 'react';
import Link from 'next/link';
import { useDashboard } from '../../context/DashboardContext';

const DashboardSidebar = memo(() => {
  const { user, business, navigationItems, pathname, sidebarOpen, setSidebarOpen, logout } = useDashboard();
  
  return (
  <div
    className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--theme-card)] shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}
    role="navigation"
    aria-label="Main navigation"
  >
    {/* Logo/Brand */}
    <div className="flex items-center h-16 px-6 border-b border-[var(--theme-border)] transition-colors duration-300">
      <Link href="/" className="flex items-center space-x-2" aria-label="RandevuBu Home">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-lg font-bold text-[var(--theme-foreground)] transition-colors duration-300">RandevuBu</span>
      </Link>
    </div>

    {/* Business Info */}
    <div className="px-6 py-4 border-b border-[var(--theme-border)] transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center transition-colors duration-300" aria-hidden="true">
          <svg className="w-5 h-5 text-[var(--theme-primary)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--theme-foreground)] truncate transition-colors duration-300">{business.name}</p>
          <p className="text-xs text-[var(--theme-foregroundMuted)] truncate transition-colors duration-300">{business.city}, {business.country}</p>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-6 py-4 space-y-2" aria-label="Dashboard navigation">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
              isActive
                ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                : 'text-[var(--theme-foregroundSecondary)] hover:bg-[var(--theme-backgroundSecondary)] hover:text-[var(--theme-foreground)]'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.name}
          </Link>
        );
      })}
    </nav>

    {/* User Profile */}
    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--theme-border)] transition-colors duration-300">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full flex items-center justify-center" aria-hidden="true">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--theme-foreground)] truncate transition-colors duration-300">{user.phoneNumber}</p>
          <p className="text-xs text-[var(--theme-foregroundMuted)] transition-colors duration-300">Online</p>
        </div>
        <button
          onClick={logout}
          className="p-2 text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-foregroundSecondary)] transition-colors duration-300"
          title="Çıkış Yap"
          aria-label="Çıkış Yap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
