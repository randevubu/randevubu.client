'use client';

import React from 'react';

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
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Wait {formatTime(cooldown)}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {showCostWarning && (
            <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </>
      )}
    </button>
  );
};

export default TestButton;