'use client';

import Image from 'next/image';
import { useTheme } from '../../context/ThemeContext';
import { getThemeLogo } from '../../lib/themes/logos';

type BrandLogoSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<BrandLogoSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

interface BrandLogoProps {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  text?: string;
  showText?: boolean;
  size?: BrandLogoSize;
  priority?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  logoClassName = '',
  textClassName = '',
  text = 'RandevuBu',
  showText = true,
  size = 'md',
  priority = false,
}) => {
  const { variant } = useTheme();
  const logoSrc = getThemeLogo(variant);
  const dimension = sizeMap[size] ?? sizeMap.md;
  const defaultTextClass = 'text-xl font-black tracking-tight text-[var(--theme-foreground)]';
  const computedTextClass = textClassName || defaultTextClass;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src={logoSrc}
        alt={`${text} logo`}
        width={dimension}
        height={dimension}
        priority={priority}
        className={`object-contain flex-shrink-0 ${logoClassName}`}
      />
      {showText && (
        <span className={`${computedTextClass} leading-none`}>{text}</span>
      )}
    </div>
  );
};

export default BrandLogo;

