'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, ThemeVariant, getTheme, getThemeColors, themes } from '../lib/themes/config';

interface ThemeContextType {
  mode: ThemeMode;
  variant: ThemeVariant;
  actualMode: 'light' | 'dark'; // resolved mode (system becomes light/dark)
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  themes: typeof themes;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultVariant?: ThemeVariant;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
  defaultVariant = 'default',
}) => {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [variant, setVariantState] = useState<ThemeVariant>(defaultVariant);
  const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
    
    // Load theme preferences from localStorage
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedVariant = localStorage.getItem('theme-variant') as ThemeVariant;
    
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      setModeState(savedMode);
    }
    
    if (savedVariant && themes.find(t => t.variant === savedVariant)) {
      setVariantState(savedVariant);
    }
    
    setIsLoading(false);
  }, []);

  // Handle system theme detection and updates
  useEffect(() => {
    if (!isClient) return;

    const handleSystemThemeChange = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (mode === 'system') {
        setActualMode(isDark ? 'dark' : 'light');
      }
    };

    // Set initial actual mode
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setActualMode(isDark ? 'dark' : 'light');
    } else {
      setActualMode(mode);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [mode, isClient]);

  // Apply theme styles to document
  useEffect(() => {
    if (!isClient || isLoading) return;

    const theme = getTheme(variant);
    const colors = getThemeColors(variant, actualMode);
    
    // Apply CSS custom properties to :root
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Add theme classes to html element for utility
    root.classList.remove('light', 'dark', ...themes.map(t => t.variant));
    root.classList.add(actualMode, variant);
    
    // Set data attributes for more specific targeting
    root.setAttribute('data-theme-mode', actualMode);
    root.setAttribute('data-theme-variant', variant);

  }, [variant, actualMode, isClient, isLoading]);

  const setMode = (newMode: ThemeMode) => {
    if (!isClient) return;
    
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
    
    if (newMode !== 'system') {
      setActualMode(newMode);
    } else {
      // When switching to system, immediately check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemMode = isDark ? 'dark' : 'light';
      setActualMode(systemMode);
    }
  };

  const setVariant = (newVariant: ThemeVariant) => {
    if (!isClient) return;
    
    setVariantState(newVariant);
    localStorage.setItem('theme-variant', newVariant);
  };

  const value: ThemeContextType = {
    mode,
    variant,
    actualMode,
    setMode,
    setVariant,
    themes,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};