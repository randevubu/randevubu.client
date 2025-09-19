'use client';

import React from 'react';

interface SMSCostWarningProps {
  className?: string;
}

export const SMSCostWarning: React.FC<SMSCostWarningProps> = ({ className = '' }) => (
  <div className={`
    bg-[var(--theme-warning)]/10 border border-[var(--theme-warning)]/20 rounded-lg p-3
    flex items-start space-x-3
    ${className}
  `}>
    <div className="flex-shrink-0 mt-0.5">
      <svg className="w-4 h-4 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium text-[var(--theme-warning)] mb-1">
        SMS Test Limiti
      </h4>
      <p className="text-xs text-[var(--theme-foregroundSecondary)]">
        SMS testleri maliyet kontrolü için 5 dakikada bir ile sınırlıdır. Push bildirimleri ücretsiz olarak test edilebilir.
      </p>
    </div>
  </div>
);

export default SMSCostWarning;