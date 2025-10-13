import { memo } from 'react';
import Link from 'next/link';
import { Calendar, Home, Users, CalendarDays, Settings, BarChart3, User, LogOut } from 'lucide-react';
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
          <Calendar className="w-5 h-5 text-white" />
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
            {item.icon === 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' && <Home className="w-5 h-5 mr-3" />}
            {item.icon === 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' && <Users className="w-5 h-5 mr-3" />}
            {item.icon === 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' && <CalendarDays className="w-5 h-5 mr-3" />}
            {item.icon === 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' && <BarChart3 className="w-5 h-5 mr-3" />}
            {item.icon === 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' && <Settings className="w-5 h-5 mr-3" />}
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
