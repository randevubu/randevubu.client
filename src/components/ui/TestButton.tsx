'use client';

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

type ChannelType = 'PUSH' | 'SMS' | 'EMAIL';

interface TestButtonProps {
  channel: ChannelType;
  disabled: boolean;
  cooldown?: number;
  showCostWarning?: boolean;
  onTest: () => void;
  children: React.ReactNode;
  className?: string;
}

const getChannelColor = (channel: ChannelType) => {
  switch (channel) {
    case 'PUSH':
      return 'bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryHover)] text-[var(--theme-primaryForeground)]';
    case 'SMS':
      return 'bg-[var(--theme-warning)] hover:bg-[var(--theme-warningHover)] text-[var(--theme-warningForeground)]';
    case 'EMAIL':
      return 'bg-[var(--theme-info)] hover:bg-[var(--theme-infoHover)] text-[var(--theme-infoForeground)]';
    default:
      return 'bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryHover)] text-[var(--theme-primaryForeground)]';
  }
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const TestButton: React.FC<TestButtonProps> = ({
  channel,
  disabled,
  cooldown = 0,
  showCostWarning = false,
  onTest,
  children,
  className = ''
}) => {
  const isOnCooldown = cooldown > 0;
  const channelColorClass = getChannelColor(channel);

  return (
    <button
      onClick={onTest}
      disabled={disabled || isOnCooldown}
      className={`
        relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center space-x-2
        ${channelColorClass}
        ${className}
      `}
    >
      {isOnCooldown ? (
        <>
          <Clock className="w-4 h-4 animate-spin" />
          <span>Wait {formatTime(cooldown)}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {showCostWarning && (
            <AlertTriangle className="w-4 h-4 text-current" />
          )}
        </>
      )}
    </button>
  );
};

export default TestButton;