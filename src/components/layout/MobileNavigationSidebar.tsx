'use client';

import { Zap } from 'lucide-react';
import Link from 'next/link';
import { NavigationItem } from '../../lib/constants/navigation';

// Icon mapping for navigation items
const getNavigationIcon = (id: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'overview': <Home className="w-3 h-3" />,
    'appointments': <CalendarIcon2 className="w-3 h-3" />,
    'monitor': <Monitor className="w-3 h-3" />,
    'customers': <Users className="w-3 h-3" />,
    'staff': <User className="w-3 h-3" />,
    'services': <Package className="w-3 h-3" />,
    'reports': <BarChart3 className="w-3 h-3" />,
    'tables': <BarChart3 className="w-3 h-3" />,
    'subscription': <CreditCardIcon2 className="w-3 h-3" />,
    'usage': <Activity className="w-3 h-3" />,
    'settings': <Settings className="w-3 h-3" />,
  };
  return iconMap[id] || <Home className="w-3 h-3" />;
};

// Import the icons we need
import { 
  Home, 
  Calendar as CalendarIcon2, 
  Monitor, 
  Users, 
  User, 
  Package, 
  BarChart3, 
  CreditCard as CreditCardIcon2, 
  Activity, 
  Settings 
} from 'lucide-react';

interface MobileNavigationSidebarProps {
  navigationItems: NavigationItem[];
}

export default function MobileNavigationSidebar({ navigationItems }: MobileNavigationSidebarProps) {
  return (
    <div className="lg:hidden bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
      <div className="px-4 sm:px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
        <h3 className="text-lg font-semibold text-[var(--theme-foreground)] flex items-center transition-colors duration-300">
          <Zap className="w-5 h-5 mr-2 text-[var(--theme-primary)]" />
          Hızlı Erişim
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative overflow-hidden rounded-lg p-2.5 sm:p-3 transition-all duration-300 hover:scale-105 hover:shadow-md bg-[var(--theme-backgroundSecondary)] border border-[var(--theme-border)] hover:border-[var(--theme-borderSecondary)] min-h-[80px]"
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`relative z-10 w-6 h-6 mx-auto mb-2 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                <div className="w-3 h-3 text-white">
                  {getNavigationIcon(item.id)}
                </div>
              </div>

              {/* Label */}
              <div className="relative z-10 text-center">
                <span className={`text-[10px] leading-tight font-medium ${item.textColor} group-hover:text-[var(--theme-foreground)] transition-colors duration-300`}>
                  {item.name}
                </span>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-[var(--theme-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
