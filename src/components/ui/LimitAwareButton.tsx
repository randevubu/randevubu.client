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
    canSendSms,
    canAddStaff,
    canAddService,
    canAddCustomer
  } = useUsageLimits(businessId);

  const actionLimits = {
    sms: canSendSms,
    staff: canAddStaff,
    service: canAddService,
    customer: canAddCustomer
  };

  const isAllowed = actionLimits[action];

  const handleClick = () => {
    if (!isAllowed) {
      onLimitReached?.('Limit reached for this action');
      return;
    }
    onClick?.();
  };

  return (
    <div className="limit-aware-button-container">
      <button
        {...props}
        disabled={!isAllowed || props.disabled}
        onClick={handleClick}
        className={`${className} ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>
      {!isAllowed && showWarning && (
        <div className="text-red-500 text-sm mt-1">
          Limit reached for this action
        </div>
      )}
    </div>
  );
}