export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeVariant = 'default' | 'ocean' | 'sunset' | 'forest' | 'purple';

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Foreground colors
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;
  
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryForeground: string;
  
  // Accent colors
  accent: string;
  accentHover: string;
  accentForeground: string;
  
  // UI element colors
  border: string;
  borderSecondary: string;
  ring: string;
  
  // State colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Card and surface colors
  card: string;
  cardForeground: string;
  
  // Navigation
  navbar: string;
  navbarForeground: string;
}

export interface Theme {
  id: string;
  name: string;
  variant: ThemeVariant;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  variant: 'default',
  colors: {
    light: {
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      backgroundTertiary: '#f1f5f9',
      foreground: '#0f172a',
      foregroundSecondary: '#475569',
      foregroundMuted: '#64748b',
      primary: '#6366f1',
      primaryHover: '#5855eb',
      primaryForeground: '#ffffff',
      secondary: '#e2e8f0',
      secondaryHover: '#cbd5e1',
      secondaryForeground: '#475569',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      accentForeground: '#ffffff',
      border: '#e2e8f0',
      borderSecondary: '#cbd5e1',
      ring: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#ffffff',
      cardForeground: '#0f172a',
      navbar: 'rgba(255, 255, 255, 0.8)',
      navbarForeground: '#0f172a',
    },
    dark: {
      background: '#0a0a0a',
      backgroundSecondary: '#111111',
      backgroundTertiary: '#1a1a1a',
      foreground: '#ededed',
      foregroundSecondary: '#a3a3a3',
      foregroundMuted: '#737373',
      primary: '#6366f1',
      primaryHover: '#7c3aed',
      primaryForeground: '#ffffff',
      secondary: '#262626',
      secondaryHover: '#404040',
      secondaryForeground: '#d4d4d4',
      accent: '#8b5cf6',
      accentHover: '#a855f7',
      accentForeground: '#ffffff',
      border: '#262626',
      borderSecondary: '#404040',
      ring: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#111111',
      cardForeground: '#ededed',
      navbar: 'rgba(10, 10, 10, 0.8)',
      navbarForeground: '#ededed',
    },
  },
};

const oceanTheme: Theme = {
  id: 'ocean',
  name: 'Ocean',
  variant: 'ocean',
  colors: {
    light: {
      background: '#ffffff',
      backgroundSecondary: '#f0f9ff',
      backgroundTertiary: '#e0f2fe',
      foreground: '#0c4a6e',
      foregroundSecondary: '#0369a1',
      foregroundMuted: '#0284c7',
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      primaryForeground: '#ffffff',
      secondary: '#e0f2fe',
      secondaryHover: '#bae6fd',
      secondaryForeground: '#0369a1',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentForeground: '#ffffff',
      border: '#bae6fd',
      borderSecondary: '#7dd3fc',
      ring: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      card: '#ffffff',
      cardForeground: '#0c4a6e',
      navbar: 'rgba(240, 249, 255, 0.8)',
      navbarForeground: '#0c4a6e',
    },
    dark: {
      background: '#0c1426',
      backgroundSecondary: '#1e293b',
      backgroundTertiary: '#334155',
      foreground: '#e2e8f0',
      foregroundSecondary: '#cbd5e1',
      foregroundMuted: '#94a3b8',
      primary: '#0ea5e9',
      primaryHover: '#38bdf8',
      primaryForeground: '#ffffff',
      secondary: '#1e293b',
      secondaryHover: '#334155',
      secondaryForeground: '#cbd5e1',
      accent: '#06b6d4',
      accentHover: '#22d3ee',
      accentForeground: '#ffffff',
      border: '#334155',
      borderSecondary: '#475569',
      ring: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      card: '#1e293b',
      cardForeground: '#e2e8f0',
      navbar: 'rgba(12, 20, 38, 0.8)',
      navbarForeground: '#e2e8f0',
    },
  },
};

const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset',
  variant: 'sunset',
  colors: {
    light: {
      background: '#ffffff',
      backgroundSecondary: '#fff7ed',
      backgroundTertiary: '#ffedd5',
      foreground: '#9a3412',
      foregroundSecondary: '#c2410c',
      foregroundMuted: '#ea580c',
      primary: '#f97316',
      primaryHover: '#ea580c',
      primaryForeground: '#ffffff',
      secondary: '#ffedd5',
      secondaryHover: '#fed7aa',
      secondaryForeground: '#c2410c',
      accent: '#ef4444',
      accentHover: '#dc2626',
      accentForeground: '#ffffff',
      border: '#fed7aa',
      borderSecondary: '#fdba74',
      ring: '#f97316',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#ffffff',
      cardForeground: '#9a3412',
      navbar: 'rgba(255, 247, 237, 0.8)',
      navbarForeground: '#9a3412',
    },
    dark: {
      background: '#1c1917',
      backgroundSecondary: '#292524',
      backgroundTertiary: '#44403c',
      foreground: '#fbbf24',
      foregroundSecondary: '#f59e0b',
      foregroundMuted: '#d97706',
      primary: '#f97316',
      primaryHover: '#fb923c',
      primaryForeground: '#ffffff',
      secondary: '#292524',
      secondaryHover: '#44403c',
      secondaryForeground: '#f59e0b',
      accent: '#ef4444',
      accentHover: '#f87171',
      accentForeground: '#ffffff',
      border: '#44403c',
      borderSecondary: '#57534e',
      ring: '#f97316',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#292524',
      cardForeground: '#fbbf24',
      navbar: 'rgba(28, 25, 23, 0.8)',
      navbarForeground: '#fbbf24',
    },
  },
};

const forestTheme: Theme = {
  id: 'forest',
  name: 'Forest',
  variant: 'forest',
  colors: {
    light: {
      background: '#ffffff',
      backgroundSecondary: '#f0fdf4',
      backgroundTertiary: '#dcfce7',
      foreground: '#14532d',
      foregroundSecondary: '#166534',
      foregroundMuted: '#15803d',
      primary: '#22c55e',
      primaryHover: '#16a34a',
      primaryForeground: '#ffffff',
      secondary: '#dcfce7',
      secondaryHover: '#bbf7d0',
      secondaryForeground: '#166534',
      accent: '#84cc16',
      accentHover: '#65a30d',
      accentForeground: '#ffffff',
      border: '#bbf7d0',
      borderSecondary: '#86efac',
      ring: '#22c55e',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#ffffff',
      cardForeground: '#14532d',
      navbar: 'rgba(240, 253, 244, 0.8)',
      navbarForeground: '#14532d',
    },
    dark: {
      background: '#0f1419',
      backgroundSecondary: '#1a202c',
      backgroundTertiary: '#2d3748',
      foreground: '#68d391',
      foregroundSecondary: '#48bb78',
      foregroundMuted: '#38a169',
      primary: '#22c55e',
      primaryHover: '#4ade80',
      primaryForeground: '#ffffff',
      secondary: '#1a202c',
      secondaryHover: '#2d3748',
      secondaryForeground: '#48bb78',
      accent: '#84cc16',
      accentHover: '#a3e635',
      accentForeground: '#ffffff',
      border: '#2d3748',
      borderSecondary: '#4a5568',
      ring: '#22c55e',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#1a202c',
      cardForeground: '#68d391',
      navbar: 'rgba(15, 20, 25, 0.8)',
      navbarForeground: '#68d391',
    },
  },
};

const purpleTheme: Theme = {
  id: 'purple',
  name: 'Purple',
  variant: 'purple',
  colors: {
    light: {
      background: '#ffffff',
      backgroundSecondary: '#faf5ff',
      backgroundTertiary: '#f3e8ff',
      foreground: '#581c87',
      foregroundSecondary: '#7c2d12',
      foregroundMuted: '#a21caf',
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryForeground: '#ffffff',
      secondary: '#f3e8ff',
      secondaryHover: '#e9d5ff',
      secondaryForeground: '#7c2d12',
      accent: '#d946ef',
      accentHover: '#c026d3',
      accentForeground: '#ffffff',
      border: '#e9d5ff',
      borderSecondary: '#ddd6fe',
      ring: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#ffffff',
      cardForeground: '#581c87',
      navbar: 'rgba(250, 245, 255, 0.8)',
      navbarForeground: '#581c87',
    },
    dark: {
      background: '#1a0b2e',
      backgroundSecondary: '#2d1b4e',
      backgroundTertiary: '#432a5f',
      foreground: '#e9d5ff',
      foregroundSecondary: '#d8b4fe',
      foregroundMuted: '#c4b5fd',
      primary: '#8b5cf6',
      primaryHover: '#a855f7',
      primaryForeground: '#ffffff',
      secondary: '#2d1b4e',
      secondaryHover: '#432a5f',
      secondaryForeground: '#d8b4fe',
      accent: '#d946ef',
      accentHover: '#e879f9',
      accentForeground: '#ffffff',
      border: '#432a5f',
      borderSecondary: '#553c71',
      ring: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      card: '#2d1b4e',
      cardForeground: '#e9d5ff',
      navbar: 'rgba(26, 11, 46, 0.8)',
      navbarForeground: '#e9d5ff',
    },
  },
};

export const themes: Theme[] = [
  defaultTheme,
  oceanTheme,
  sunsetTheme,
  forestTheme,
  purpleTheme,
];

export const getTheme = (variant: ThemeVariant): Theme => {
  return themes.find((theme) => theme.variant === variant) || defaultTheme;
};

export const getThemeColors = (variant: ThemeVariant, mode: 'light' | 'dark'): ThemeColors => {
  const theme = getTheme(variant);
  return theme.colors[mode];
};