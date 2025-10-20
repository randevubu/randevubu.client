import { memo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Home,
  Users,
  CalendarDays,
  Settings,
  BarChart3,
  User,
  LogOut,
  Monitor,
  ClipboardList,
  CreditCard,
  Activity,
  Table,
  Package
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const DashboardSidebar = memo(() => {
  const { user, business, navigationItems, pathname, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, logout } = useDashboard();
  
  return (
  <>
    {/* Mobile backdrop overlay */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
    )}

    {/* Sidebar */}
    <div
      className={`fixed inset-y-0 left-0 z-50 bg-[var(--theme-card)] shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col overflow-hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-20 w-64' : 'w-64'}`}
      role="navigation"
      aria-label="Main navigation"
    >
    {/* Logo/Brand */}
    <div className={`flex items-center h-16 border-b border-[var(--theme-border)] transition-all duration-300 ${
      sidebarCollapsed ? 'lg:justify-center lg:px-4 px-6' : 'px-6'
    }`}>
      <Link href="/" className="flex items-center space-x-2" aria-label="RandevuBu Home">
        <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-lg flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <span className={`text-lg font-bold text-[var(--theme-foreground)] transition-all duration-300 whitespace-nowrap ${
          sidebarCollapsed ? 'lg:hidden' : ''
        }`}>RandevuBu</span>
      </Link>
    </div>


    {/* Navigation */}
    <nav className={`flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
      sidebarCollapsed ? 'lg:px-2 px-6' : 'px-6'
    }`} aria-label="Dashboard navigation">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const getIcon = (id: string) => {
          const iconClass = `w-5 h-5 ${sidebarCollapsed ? 'lg:mr-0' : 'mr-3'} transition-all duration-300 flex-shrink-0`;
          switch(id) {
            case 'overview': return <Home className={iconClass} />;
            case 'customers': return <Users className={iconClass} />;
            case 'appointments': return <CalendarDays className={iconClass} />;
            case 'monitor': return <Monitor className={iconClass} />;
            case 'staff': return <User className={iconClass} />;
            case 'services': return <Package className={iconClass} />;
            case 'reports': return <BarChart3 className={iconClass} />;
            case 'tables': return <Table className={iconClass} />;
            case 'subscription': return <CreditCard className={iconClass} />;
            case 'usage': return <Activity className={iconClass} />;
            case 'settings': return <Settings className={iconClass} />;
            default: return null;
          }
        };

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            title={sidebarCollapsed ? item.name : undefined}
            className={`w-full flex items-center text-sm font-medium rounded-lg transition-all duration-300 relative group ${
              sidebarCollapsed ? 'lg:justify-center lg:px-3 px-3 py-2' : 'px-3 py-2'
            } ${
              isActive
                ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                : 'text-[var(--theme-foregroundSecondary)] hover:bg-[var(--theme-backgroundSecondary)] hover:text-[var(--theme-foreground)]'
            }`}
          >
            {getIcon(item.id)}
            <span className={`transition-all duration-300 whitespace-nowrap ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}>{item.name}</span>

            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="hidden lg:block absolute left-full ml-6 px-3 py-2 bg-[var(--theme-card)] text-[var(--theme-foreground)] text-sm rounded-lg shadow-lg border border-[var(--theme-border)] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                {item.name}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[var(--theme-card)]"></div>
              </div>
            )}
          </Link>
        );
      })}
    </nav>


    {/* Business Profile */}
    <div className={`flex-shrink-0 border-t border-[var(--theme-border)] transition-all duration-300 bg-[var(--theme-card)] ${
      sidebarCollapsed ? 'lg:p-3 p-6' : 'p-6'
    }`}>
      <div className={`flex items-center overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:flex-col lg:space-x-0 lg:space-y-2 space-x-3' : 'space-x-3'
      }`}>
        <div className={`bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:w-10 lg:h-10 w-8 h-8' : 'w-8 h-8'
        }`} aria-hidden="true">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
        <div className={`flex-1 min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:hidden' : ''
        }`}>
          <p className="text-sm font-medium text-[var(--theme-foreground)] truncate transition-colors duration-300">{business.name}</p>
          <p className="text-xs text-[var(--theme-foregroundMuted)] truncate transition-colors duration-300">{business.city}, {business.country}</p>
        </div>
        <button
          onClick={logout}
          className={`p-2 text-[var(--theme-foregroundMuted)] hover:text-[var(--theme-error)] hover:bg-[var(--theme-error)]/10 rounded-lg transition-all duration-300 group flex-shrink-0 ${
            sidebarCollapsed ? 'lg:w-full lg:justify-center' : ''
          }`}
          title="Çıkış Yap"
          aria-label="Çıkış Yap"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
  </>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
