'use client';

import { useState, useEffect } from 'react';
import { discountService } from '../../../src/lib/services/discount';
import { DiscountCode, DiscountCodeStatistics } from '../../../src/types/discount';
import { handleApiError } from '../../../src/lib/utils/toast';
import DiscountCodeForm from '../../../src/components/ui/DiscountCodeForm';
import DiscountCodeList from '../../../src/components/ui/DiscountCodeList';
import AdminGuard from '../../../src/components/features/AdminGuard';

export default function DiscountCodesPage() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [statistics, setStatistics] = useState<DiscountCodeStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  // Load discount codes and statistics
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [codesResponse, statsResponse] = await Promise.all([
        discountService.getDiscountCodes({
          page: currentPage,
          limit: 20,
          isActive: activeFilter
        }),
        discountService.getStatistics()
      ]);

      if (codesResponse.success && codesResponse.data) {
        setDiscountCodes(codesResponse.data.discountCodes);
        setTotalPages(codesResponse.data.totalPages);
      }

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, activeFilter]);

  const handleCodeCreated = () => {
    setShowCreateForm(false);
    loadData();
  };

  const handleCodeUpdated = () => {
    setEditingCode(null);
    loadData();
  };

  const handleCodeDeleted = () => {
    loadData();
  };

  const handleDeactivate = async (id: string) => {
    try {
      const response = await discountService.deactivateDiscountCode(id);
      if (response.success) {
        loadData();
      } else {
        handleApiError(response.error);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await discountService.deleteDiscountCode(id);
      if (response.success) {
        loadData();
      } else {
        handleApiError(response.error);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <AdminGuard>
      {isLoading ? (
        <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">Loading discount codes...</span>
          </div>
        </div>
      ) : (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-foreground)] transition-colors duration-300">
            Discount Codes
          </h1>
          <p className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300">
            Manage promotional discount codes for your subscription plans
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Code
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[var(--theme-card)] rounded-lg p-4 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="text-2xl font-bold text-[var(--theme-primary)]">{statistics.totalCodes}</div>
            <div className="text-sm text-[var(--theme-foregroundSecondary)]">Total Codes</div>
          </div>
          <div className="bg-[var(--theme-card)] rounded-lg p-4 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="text-2xl font-bold text-[var(--theme-success)]">{statistics.activeCodes}</div>
            <div className="text-sm text-[var(--theme-foregroundSecondary)]">Active Codes</div>
          </div>
          <div className="bg-[var(--theme-card)] rounded-lg p-4 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="text-2xl font-bold text-[var(--theme-error)]">{statistics.expiredCodes}</div>
            <div className="text-sm text-[var(--theme-foregroundSecondary)]">Expired Codes</div>
          </div>
          <div className="bg-[var(--theme-card)] rounded-lg p-4 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="text-2xl font-bold text-[var(--theme-accent)]">{statistics.totalUsages}</div>
            <div className="text-sm text-[var(--theme-foregroundSecondary)]">Total Uses</div>
          </div>
          <div className="bg-[var(--theme-card)] rounded-lg p-4 border border-[var(--theme-border)] transition-colors duration-300">
            <div className="text-2xl font-bold text-[var(--theme-primary)]">
              {statistics.totalDiscountAmount.toLocaleString()} TL
            </div>
            <div className="text-sm text-[var(--theme-foregroundSecondary)]">Total Discounts</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-[var(--theme-foreground)]">Filter:</label>
          <select
            value={activeFilter === undefined ? 'all' : activeFilter.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setActiveFilter(value === 'all' ? undefined : value === 'true');
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300"
          >
            <option value="all">All Codes</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Discount Codes List */}
      <DiscountCodeList
        discountCodes={discountCodes}
        onEdit={setEditingCode}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
        onDeleted={handleCodeDeleted}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-[var(--theme-border)] rounded-lg text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--theme-foregroundSecondary)]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-[var(--theme-border)] rounded-lg text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingCode) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--theme-card)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DiscountCodeForm
              discountCode={editingCode}
              onSuccess={editingCode ? handleCodeUpdated : handleCodeCreated}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingCode(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
      )}
    </AdminGuard>
  );
}