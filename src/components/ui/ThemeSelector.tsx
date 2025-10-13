'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Plus, Edit, Trash2, Save, RefreshCw, AlertCircle, CheckCircle, Clock, User, Phone, Mail, MapPin, Settings, BarChart3, Home, CreditCard, FileText, HelpCircle, Info, Warning, AlertTriangle, Ban, Shield, Users, Building, Star, Heart, Zap, Lock, Unlock, Eye, EyeOff, Calendar, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Loader2, Moon, Sun, XCircle, Tag, Bell, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode, ThemeVariant } from '../../lib/themes/config';

interface ThemeSelectorProps {
  mobile?: boolean;
  compact?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ mobile = false, compact = false }) => {
  const { mode, variant, setMode, setVariant, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getModeIcon = (themeMode: ThemeMode) => {
    switch (themeMode) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
    }
  };

  const getVariantColor = (themeVariant: ThemeVariant) => {
    switch (themeVariant) {
      case 'default':
        return 'from-indigo-500 to-purple-600';
      case 'ocean':
        return 'from-blue-500 to-cyan-500';
      case 'sunset':
        return 'from-orange-500 to-red-500';
      case 'forest':
        return 'from-green-500 to-emerald-500';
      case 'purple':
        return 'from-purple-500 to-pink-500';
    }
  };

  const currentTheme = themes.find(t => t.variant === variant);

  if (mobile && !compact) {
    // Full mobile-optimized version for standalone use
    return (
      <div className="space-y-4">
        {/* Mode Selection - Mobile */}
        <div className="bg-[var(--theme-card)] rounded-xl p-4 border border-[var(--theme-border)]">
          <h3 className="text-sm font-semibold text-[var(--theme-foreground)] mb-3 flex items-center">
            <div className="text-[var(--theme-foregroundSecondary)] mr-2">
              {getModeIcon(mode)}
            </div>
            Brightness Mode
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((themeMode) => (
              <button
                key={themeMode}
                onClick={() => setMode(themeMode)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  mode === themeMode
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-sm'
                    : 'border-[var(--theme-border)] hover:bg-[var(--theme-backgroundSecondary)] active:scale-95'
                }`}
              >
                <div className={`mb-2 ${
                  mode === themeMode
                    ? 'text-[var(--theme-primary)]'
                    : 'text-[var(--theme-foreground)]'
                }`}>
                  {getModeIcon(themeMode)}
                </div>
                <span className={`text-xs font-medium capitalize ${
                  mode === themeMode
                    ? 'text-[var(--theme-primary)]'
                    : 'text-[var(--theme-foreground)]'
                }`}>
                  {themeMode === 'system' ? 'Auto' : themeMode}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection - Mobile */}
        <div className="bg-[var(--theme-card)] rounded-xl p-4 border border-[var(--theme-border)]">
          <h3 className="text-sm font-semibold text-[var(--theme-foreground)] mb-3 flex items-center">
            <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getVariantColor(variant)} mr-2`} />
            Color Theme
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setVariant(theme.variant)}
                className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${
                  variant === theme.variant
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 shadow-sm'
                    : 'border-[var(--theme-border)] hover:bg-[var(--theme-backgroundSecondary)] active:scale-95'
                }`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getVariantColor(theme.variant)} shadow-sm flex-shrink-0`} />
                <div className="text-left min-w-0 flex-1">
                  <div className={`text-sm font-medium truncate ${
                    variant === theme.variant
                      ? 'text-[var(--theme-primary)]'
                      : 'text-[var(--theme-foreground)]'
                  }`}>
                    {theme.name}
                  </div>
                </div>
                {variant === theme.variant && (
                  <Check className="w-5 h-5 text-[var(--theme-primary)] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mobile && compact) {
    // Compact mobile version for navbar menu - single row toggle
    return (
      <div className="flex items-center space-x-2">
        {/* Theme toggle button */}
        <button
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          className="flex items-center justify-center w-10 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'light' ? (
            <Moon className="w-4 h-4 text-gray-600" />
          ) : (
            <Sun className="w-4 h-4 text-gray-600" />
          )}
        </button>
        
        {/* Theme variant indicator */}
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getVariantColor(variant)} shadow-sm`} />
      </div>
    );
  }

  // Desktop version with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors border border-[var(--theme-border)] ${
          compact ? 'p-1.5' : 'p-2'
        }`}
        title="Theme Settings"
      >
        <div className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-gradient-to-br ${getVariantColor(variant)} shadow-sm`} />
        {!compact && (
          <div className="text-[var(--theme-foregroundSecondary)]">
            {getModeIcon(mode)}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[var(--theme-card)] rounded-xl shadow-xl border border-[var(--theme-border)] py-4 z-50 max-h-96 overflow-y-auto">
          {/* Quick Mode Toggle */}
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[var(--theme-foreground)]">Mode</h3>
              <div className="text-[var(--theme-foregroundSecondary)]">
                {getModeIcon(mode)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(['light', 'dark', 'system'] as ThemeMode[]).map((themeMode) => (
                <button
                  key={themeMode}
                  onClick={() => setMode(themeMode)}
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all text-xs ${
                    mode === themeMode
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]'
                      : 'border-[var(--theme-border)] hover:bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundMuted)]'
                  }`}
                >
                  <div className="mb-1">
                    {getModeIcon(themeMode)}
                  </div>
                  <span className="capitalize">
                    {themeMode === 'system' ? 'Auto' : themeMode}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="px-4 border-t border-[var(--theme-border)] pt-4">
            <h3 className="text-sm font-medium text-[var(--theme-foreground)] mb-3">
              Color Theme
            </h3>
            <div className="space-y-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setVariant(theme.variant)}
                  className={`w-full flex items-center space-x-3 p-2.5 rounded-lg border transition-all ${
                    variant === theme.variant
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
                      : 'border-[var(--theme-border)] hover:bg-[var(--theme-backgroundSecondary)]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getVariantColor(theme.variant)} shadow-sm`} />
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-medium ${
                      variant === theme.variant
                        ? 'text-[var(--theme-primary)]'
                        : 'text-[var(--theme-foreground)]'
                    }`}>
                      {theme.name}
                    </div>
                  </div>
                  {variant === theme.variant && (
                    <Check className="w-4 h-4 text-[var(--theme-primary)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;