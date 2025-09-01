'use client';

import { useTheme } from '../../context/ThemeContext';
import { getThemeColors } from '../themes/config';

export const useThemeColors = () => {
  const { variant, actualMode } = useTheme();
  
  return getThemeColors(variant, actualMode);
};

export const useThemeValue = (colorKey: string) => {
  if (typeof window === 'undefined') return '';
  
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--theme-${colorKey}`)
    .trim();
};