export interface NavigationItem {
  id: string;
  name: string;
  href: string;
  color: string;
  iconColor: string;
  textColor: string;
}

export const SIDEBAR_NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    id: 'overview', 
    name: 'Genel Bakış', 
    href: '/dashboard', 
    color: 'from-gray-500 to-gray-600',
    iconColor: 'text-gray-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'appointments', 
    name: 'Randevular', 
    href: '/dashboard/appointments', 
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'monitor', 
    name: 'Bekleme Ekranı', 
    href: '/dashboard/monitor', 
    color: 'from-cyan-500 to-cyan-600',
    iconColor: 'text-cyan-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'customers', 
    name: 'Müşteriler', 
    href: '/dashboard/customers', 
    color: 'from-green-500 to-green-600',
    iconColor: 'text-green-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'staff', 
    name: 'Personel', 
    href: '/dashboard/staff', 
    color: 'from-teal-500 to-teal-600',
    iconColor: 'text-teal-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'services', 
    name: 'Hizmetler', 
    href: '/dashboard/services', 
    color: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'reports', 
    name: 'Raporlar', 
    href: '/dashboard/reports', 
    color: 'from-orange-500 to-orange-600',
    iconColor: 'text-orange-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'tables', 
    name: 'Gelir-Gider Tablosu', 
    href: '/dashboard/tables', 
    color: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'subscription', 
    name: 'Abonelik', 
    href: '/dashboard/subscription', 
    color: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'usage',
    name: 'Kullanım',
    href: '/dashboard/usage',
    color: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'settings',
    name: 'Ayarlar', 
    href: '/dashboard/settings', 
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
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'customers', 
    name: 'Müşteriler', 
    href: '/dashboard/customers', 
    color: 'from-green-500 to-green-600',
    iconColor: 'text-green-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'services', 
    name: 'Hizmetler', 
    href: '/dashboard/services', 
    color: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'staff', 
    name: 'Personel', 
    href: '/dashboard/staff', 
    color: 'from-teal-500 to-teal-600',
    iconColor: 'text-teal-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'reports', 
    name: 'Raporlar', 
    href: '/dashboard/reports', 
    color: 'from-orange-500 to-orange-600',
    iconColor: 'text-orange-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  { 
    id: 'subscription', 
    name: 'Abonelik', 
    href: '/dashboard/subscription', 
    color: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'usage',
    name: 'Kullanım',
    href: '/dashboard/usage',
    color: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
  {
    id: 'settings',
    name: 'Ayarlar', 
    href: '/dashboard/settings', 
    color: 'from-gray-500 to-gray-600',
    iconColor: 'text-gray-500',
    textColor: 'text-[var(--theme-foreground)]'
  },
];