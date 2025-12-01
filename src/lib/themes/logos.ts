import { ThemeVariant } from './config';

const themeLogoMap: Record<ThemeVariant, string> = {
  default: '/logo-default.png',
  ocean: '/logo-ocean.png',
  sunset: '/logo-sunset.png',
  forest: '/logo-forest.png',
  purple: '/logo-purple.png',
};

export const getThemeLogo = (variant: ThemeVariant): string => {
  return themeLogoMap[variant] || themeLogoMap.default;
};

