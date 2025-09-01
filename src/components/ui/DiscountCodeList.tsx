'use client';

import { useState } from 'react';
import { DiscountCode } from '../../types/discount';
import { discountService } from '../../lib/services/discount';
import { handleApiError } from '../../lib/utils/toast';

interface DiscountCodeListProps {
  discountCodes: DiscountCode[];
  onEdit: (code: DiscountCode) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleted: () => void;
}

export default function DiscountCodeList({ 
  discountCodes, 
  onEdit, 
  onDeactivate, 
  onDelete, 
  onDeleted 
}: DiscountCodeListProps) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [loadingUsage, setLoadingUsage] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<Record<string, any>>({});

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (code: DiscountCode) => {
    if (!code.isActive) return 'text-[var(--theme-error)]';
    
    const now = new Date();
    const validFrom = new Date(code.validFrom);
    const validUntil = code.validUntil ? new Date(code.validUntil) : null;
    
    if (validFrom > now) return 'text-[var(--theme-warning)]';
    if (validUntil && validUntil < now) return 'text-[var(--theme-error)]';
    if (code.currentUsages >= code.maxUsages) return 'text-[var(--theme-error)]';
    
    return 'text-[var(--theme-success)]';
  };

  const getStatusText = (code: DiscountCode) => {
    if (!code.isActive) return 'Inactive';
    
    const now = new Date();
    const validFrom = new Date(code.validFrom);
    const validUntil = code.validUntil ? new Date(code.validUntil) : null;
    
    if (validFrom > now) return 'Not Started';
    if (validUntil && validUntil < now) return 'Expired';
    if (code.currentUsages >= code.maxUsages) return 'Used Up';
    
    return 'Active';
  };

  const loadUsageData = async (codeId: string) => {
    if (usageData[codeId]) {
      setExpandedCode(expandedCode === codeId ? null : codeId);
      return;
    }

    setLoadingUsage(codeId);
    try {
      const response = await discountService.getDiscountCodeUsage(codeId, { limit: 5 });
      if (response.success && response.data) {
        setUsageData(prev => ({ ...prev, [codeId]: response.data }));
        setExpandedCode(codeId);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingUsage(null);
    }
  };

  if (discountCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--theme-backgroundSecondary)] rounded-full mb-4">
          <svg className="w-8 h-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[var(--theme-foreground)] mb-2">No discount codes yet</h3>
        <p className="text-[var(--theme-foregroundSecondary)]">Create your first discount code to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {discountCodes.map((code) => (
        <div
          key={code.id}
          className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg transition-colors duration-300"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono font-bold text-[var(--theme-primary)]">
                      {code.code}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(code)}`}>
                      {getStatusText(code)}
                    </span>
                  </div>
                  {code.name && (
                    <p className="text-sm text-[var(--theme-foregroundSecondary)]">{code.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right text-sm">
                  <div className="font-semibold text-[var(--theme-foreground)]">
                    {code.discountType === 'PERCENTAGE' 
                      ? `${code.discountValue}%` 
                      : `${code.discountValue} TL`}
                  </div>
                  <div className="text-[var(--theme-foregroundMuted)]">
                    {code.currentUsages}/{code.maxUsages} used
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loadUsageData(code.id)}
                    className="p-2 text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] rounded-lg transition-colors duration-300"
                    title="View usage details"
                  >
                    {loadingUsage === code.id ? (
                      <div className="w-4 h-4 border-2 border-[var(--theme-foregroundSecondary)] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedCode === code.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={() => onEdit(code)}
                    className="p-2 text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] rounded-lg transition-colors duration-300"
                    title="Edit discount code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {code.isActive && (
                    <button
                      onClick={() => onDeactivate(code.id)}
                      className="p-2 text-[var(--theme-warning)] hover:bg-[var(--theme-warning)]/10 rounded-lg transition-colors duration-300"
                      title="Deactivate discount code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    </button>
                  )}

                  {code.currentUsages === 0 && (
                    <button
                      onClick={() => onDelete(code.id)}
                      className="p-2 text-[var(--theme-error)] hover:bg-[var(--theme-error)]/10 rounded-lg transition-colors duration-300"
                      title="Delete discount code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Discount code details */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[var(--theme-foregroundMuted)]">Created:</span>
                <br />
                <span className="text-[var(--theme-foreground)]">{formatDate(code.createdAt)}</span>
              </div>
              
              {code.validUntil && (
                <div>
                  <span className="text-[var(--theme-foregroundMuted)]">Expires:</span>
                  <br />
                  <span className="text-[var(--theme-foreground)]">{formatDate(code.validUntil)}</span>
                </div>
              )}
              
              {code.minPurchaseAmount && (
                <div>
                  <span className="text-[var(--theme-foregroundMuted)]">Min. Purchase:</span>
                  <br />
                  <span className="text-[var(--theme-foreground)]">{code.minPurchaseAmount} TL</span>
                </div>
              )}
              
              {code.applicablePlans.length > 0 && (
                <div>
                  <span className="text-[var(--theme-foregroundMuted)]">Plans:</span>
                  <br />
                  <span className="text-[var(--theme-foreground)]">{code.applicablePlans.length} selected</span>
                </div>
              )}
            </div>

            {code.description && (
              <div className="mt-3 text-sm text-[var(--theme-foregroundSecondary)]">
                {code.description}
              </div>
            )}
          </div>

          {/* Usage Details */}
          {expandedCode === code.id && usageData[code.id] && (
            <div className="border-t border-[var(--theme-border)] p-4 bg-[var(--theme-backgroundSecondary)]">
              <h4 className="text-sm font-medium text-[var(--theme-foreground)] mb-3">Recent Usage</h4>
              {usageData[code.id].usages.length > 0 ? (
                <div className="space-y-2">
                  {usageData[code.id].usages.map((usage: any) => (
                    <div key={usage.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-[var(--theme-foreground)]">User {usage.userId}</span>
                        <span className="text-[var(--theme-foregroundMuted)] ml-2">
                          {formatDate(usage.usedAt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-[var(--theme-foreground)]">
                          {usage.originalAmount} TL → {usage.finalAmount} TL
                        </div>
                        <div className="text-[var(--theme-success)]">
                          -{usage.discountAmount} TL saved
                        </div>
                      </div>
                    </div>
                  ))}
                  {usageData[code.id].total > 5 && (
                    <div className="text-center text-sm text-[var(--theme-foregroundMuted)] pt-2">
                      Showing 5 of {usageData[code.id].total} total uses
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--theme-foregroundMuted)]">No usage yet</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}