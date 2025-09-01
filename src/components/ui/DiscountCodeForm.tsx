'use client';

import { useState, useEffect } from 'react';
import { discountService } from '../../lib/services/discount';
import { DiscountCode, CreateDiscountCodeData, UpdateDiscountCodeData, DiscountType } from '../../types/discount';
import { handleApiError } from '../../lib/utils/toast';

interface DiscountCodeFormProps {
  discountCode?: DiscountCode | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DiscountCodeForm({ discountCode, onSuccess, onCancel }: DiscountCodeFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 0,
    maxUsages: 1,
    validFrom: '',
    validUntil: '',
    minPurchaseAmount: '',
    applicablePlans: [] as string[],
    metadata: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available subscription plans (you might want to fetch this from an API)
  const availablePlans = [
    { id: 'plan-basic-monthly', name: 'Basic Monthly' },
    { id: 'plan-basic-yearly', name: 'Basic Yearly' },
    { id: 'plan-premium-monthly', name: 'Premium Monthly' },
    { id: 'plan-premium-yearly', name: 'Premium Yearly' },
    { id: 'plan-enterprise-monthly', name: 'Enterprise Monthly' },
    { id: 'plan-enterprise-yearly', name: 'Enterprise Yearly' },
  ];

  // Load existing data if editing
  useEffect(() => {
    if (discountCode) {
      setFormData({
        code: discountCode.code,
        name: discountCode.name || '',
        description: discountCode.description || '',
        discountType: discountCode.discountType,
        discountValue: discountCode.discountValue,
        maxUsages: discountCode.maxUsages,
        validFrom: discountCode.validFrom ? new Date(discountCode.validFrom).toISOString().slice(0, 16) : '',
        validUntil: discountCode.validUntil ? new Date(discountCode.validUntil).toISOString().slice(0, 16) : '',
        minPurchaseAmount: discountCode.minPurchaseAmount?.toString() || '',
        applicablePlans: discountCode.applicablePlans || [],
        metadata: discountCode.metadata ? JSON.stringify(discountCode.metadata, null, 2) : ''
      });
    }
  }, [discountCode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim() && !discountCode) {
      newErrors.code = 'Code is required';
    }
    
    if (formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'PERCENTAGE' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (formData.maxUsages <= 0) {
      newErrors.maxUsages = 'Max usages must be greater than 0';
    }

    if (formData.validFrom && formData.validUntil) {
      const fromDate = new Date(formData.validFrom);
      const untilDate = new Date(formData.validUntil);
      if (untilDate <= fromDate) {
        newErrors.validUntil = 'End date must be after start date';
      }
    }

    if (formData.minPurchaseAmount && parseFloat(formData.minPurchaseAmount) < 0) {
      newErrors.minPurchaseAmount = 'Minimum purchase amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        ...(formData.code.trim() && { code: formData.code.trim() }),
        ...(formData.name.trim() && { name: formData.name.trim() }),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        maxUsages: formData.maxUsages,
        ...(formData.validFrom && { validFrom: new Date(formData.validFrom).toISOString() }),
        ...(formData.validUntil && { validUntil: new Date(formData.validUntil).toISOString() }),
        ...(formData.minPurchaseAmount && { minPurchaseAmount: parseFloat(formData.minPurchaseAmount) }),
        applicablePlans: formData.applicablePlans.length > 0 ? formData.applicablePlans : undefined,
        ...(formData.metadata.trim() && { 
          metadata: JSON.parse(formData.metadata.trim()) 
        })
      };

      let response;
      if (discountCode) {
        response = await discountService.updateDiscountCode(discountCode.id, requestData as UpdateDiscountCodeData);
      } else {
        response = await discountService.createDiscountCode(requestData as CreateDiscountCodeData);
      }

      if (response.success) {
        onSuccess();
      } else {
        handleApiError(response.error);
      }
    } catch (error) {
      if (error instanceof SyntaxError && formData.metadata.trim()) {
        setErrors({ metadata: 'Invalid JSON format' });
      } else {
        handleApiError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanToggle = (planId: string) => {
    setFormData(prev => ({
      ...prev,
      applicablePlans: prev.applicablePlans.includes(planId)
        ? prev.applicablePlans.filter(id => id !== planId)
        : [...prev.applicablePlans, planId]
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--theme-foreground)]">
          {discountCode ? 'Edit Discount Code' : 'Create Discount Code'}
        </h2>
        <button
          onClick={onCancel}
          className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] transition-colors duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Code {!discountCode && '*'}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., SAVE20"
              disabled={!!discountCode}
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 disabled:opacity-50"
            />
            {errors.code && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., 20% Off Special"
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this discount code..."
            rows={3}
            className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
          />
        </div>

        {/* Discount Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as DiscountType }))}
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (TL)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Discount Value *
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
              placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '100'}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
            />
            {errors.discountValue && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.discountValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Max Uses *
            </label>
            <input
              type="number"
              value={formData.maxUsages}
              onChange={(e) => setFormData(prev => ({ ...prev, maxUsages: parseInt(e.target.value) || 1 }))}
              min="1"
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
            />
            {errors.maxUsages && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.maxUsages}</p>}
          </div>
        </div>

        {/* Validity Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Valid From
            </label>
            <input
              type="datetime-local"
              value={formData.validFrom}
              onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Valid Until
            </label>
            <input
              type="datetime-local"
              value={formData.validUntil}
              onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
            />
            {errors.validUntil && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.validUntil}</p>}
          </div>
        </div>

        {/* Minimum Purchase Amount */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Minimum Purchase Amount (TL)
          </label>
          <input
            type="number"
            value={formData.minPurchaseAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, minPurchaseAmount: e.target.value }))}
            placeholder="Leave empty for no minimum"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
          />
          {errors.minPurchaseAmount && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.minPurchaseAmount}</p>}
        </div>

        {/* Applicable Plans */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Applicable Plans (leave empty for all plans)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availablePlans.map((plan) => (
              <label key={plan.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.applicablePlans.includes(plan.id)}
                  onChange={() => handlePlanToggle(plan.id)}
                  className="rounded border-[var(--theme-border)] text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                />
                <span className="text-sm text-[var(--theme-foreground)]">{plan.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Metadata (JSON)
          </label>
          <textarea
            value={formData.metadata}
            onChange={(e) => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
            placeholder='{"campaign": "new_year_2025"}'
            rows={3}
            className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] font-mono text-sm transition-colors duration-300"
          />
          {errors.metadata && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.metadata}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[var(--theme-border)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--theme-border)] text-[var(--theme-foreground)] rounded-lg font-medium hover:bg-[var(--theme-backgroundSecondary)] transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-medium hover:bg-[var(--theme-primaryHover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-[var(--theme-primaryForeground)] border-t-transparent rounded-full animate-spin"></div>
                <span>{discountCode ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              discountCode ? 'Update Code' : 'Create Code'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}