export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  color: string;
  iconColor: string;
  textColor: string;
}

export const SIDEBAR_NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    id: 'overview', 
    name: 'Genel Bakış', 
    href: '/dashboard', 
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-gray-500 to-gray-600',
    iconColor: 'text-gray-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'appointments', 
    name: 'Randevular', 
    href: '/dashboard/appointments', 
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z',
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'customers', 
    name: 'Müşteriler', 
    href: '/dashboard/customers', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    color: 'from-green-500 to-green-600',
    iconColor: 'text-green-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'staff', 
    name: 'Personel', 
    href: '/dashboard/staff', 
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    color: 'from-teal-500 to-teal-600',
    iconColor: 'text-teal-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'services', 
    name: 'Hizmetler', 
    href: '/dashboard/services', 
    icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    color: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'reports', 
    name: 'Raporlar', 
    href: '/dashboard/reports', 
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-orange-500 to-orange-600',
    iconColor: 'text-orange-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'subscription', 
    name: 'Abonelik', 
    href: '/dashboard/subscription', 
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    color: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'usage',
    name: 'Kullanım',
    href: '/dashboard/usage',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'settings',
    name: 'Ayarlar', 
    href: '/dashboard/settings', 
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'from-gray-500 to-gray-600',
    iconColor: 'text-gray-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
];

export const DASHBOARD_NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    id: 'appointments', 
    name: 'Randevular', 
    href: '/dashboard/appointments', 
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z',
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'customers', 
    name: 'Müşteriler', 
    href: '/dashboard/customers', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    color: 'from-green-500 to-green-600',
    iconColor: 'text-green-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'services', 
    name: 'Hizmetler', 
    href: '/dashboard/services', 
    icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    color: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'staff', 
    name: 'Personel', 
    href: '/dashboard/staff', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
    color: 'from-teal-500 to-teal-600',
    iconColor: 'text-teal-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'reports', 
    name: 'Raporlar', 
    href: '/dashboard/reports', 
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-orange-500 to-orange-600',
    iconColor: 'text-orange-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'subscription', 
    name: 'Abonelik', 
    href: '/dashboard/subscription', 
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    color: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'usage',
    name: 'Kullanım',
    href: '/dashboard/usage',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'settings',
    name: 'Ayarlar', 
    href: '/dashboard/settings', 
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'from-gray-500 to-gray-600',
    iconColor: 'text-gray-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
];
