'use client';

import { useUsageLimits } from '@/lib/hooks/useUsageTracking';
import { ReactNode, ButtonHTMLAttributes } from 'react';

type LimitAction = 'sms' | 'staff' | 'service' | 'customer';

interface LimitAwareButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  action: LimitAction;
  businessId: string;
  children: ReactNode;
  onClick?: () => void;
  onLimitReached?: (reason: string) => void;
  showWarning?: boolean;
}

export function LimitAwareButton({
  action,
  businessId,
  children,
  onClick,
  onLimitReached,
  showWarning = true,
  className = '',
  ...props
}: LimitAwareButtonProps) {
  const {
    limitsCheck,
    canSendSms,
    canAddStaff,
    canAddService,
    canAddCustomer,
    isLoading
  } = useUsageLimits(businessId);

  const actionLimits = {
    sms: canSendSms(),
    staff: canAddStaff(),
    service: canAddService(),
    customer: canAddCustomer()
  };

  const isAllowed = actionLimits[action];
  const reason = limitsCheck?.[action]?.reason;

  const handleClick = () => {
    if (!isAllowed && reason) {
      onLimitReached?.(reason);
      return;
    }
    onClick?.();
  };

  return (
    <div className="limit-aware-button-container">
      <button
        {...props}
        disabled={!isAllowed || props.disabled || isLoading}
        onClick={handleClick}
        className={`${className} ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>
      {!isAllowed && showWarning && reason && (
        <div className="text-red-500 text-sm mt-1">
          {reason}
        </div>
      )}
    </div>
  );
}