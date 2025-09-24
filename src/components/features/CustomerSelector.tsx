'use client';

import React, { useState, useEffect } from 'react';
import { Customer, customerService } from '../../lib/services/customers';
import { handleApiError } from '../../lib/utils/toast';

interface CustomerSelectorProps {
  businessId: string;
  onCustomerSelect: (customer: Customer | null) => void;
  disabled?: boolean;
  selectedCustomer?: Customer | null;
}

export default function CustomerSelector({
  businessId,
  onCustomerSelect,
  disabled = false,
  selectedCustomer = null
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (businessId) {
      fetchBusinessCustomers();
    }
  }, [businessId]);

  const fetchBusinessCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch customers who have had appointments at this business
      const response = await customerService.getMyCustomers({
        page: 1,
        limit: 100, // Get enough customers for selection
        status: 'active' // Only active customers
      });

      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
      } else {
        setError('Müşteriler yüklenemedi');
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setError('Müşteriler yüklenemedi');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber.includes(searchTerm)
  );

  const handleCustomerSelect = (customer: Customer | null) => {
    onCustomerSelect(customer);
  };

  return (
    <div className="customer-selector space-y-4">
      <label className="block text-sm font-medium text-[var(--theme-foreground)]">
        Randevu Kimin İçin? (İsteğe bağlı)
      </label>

      {/* Option to book for self */}
      <div className="customer-option flex items-center p-3 border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors">
        <input
          type="radio"
          name="customer"
          value="self"
          checked={!selectedCustomer}
          onChange={() => handleCustomerSelect(null)}
          disabled={disabled}
          className="h-4 w-4 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] border-[var(--theme-border)]"
        />
        <label className="ml-3 text-sm font-medium text-[var(--theme-foreground)] cursor-pointer">
          Kendim için randevu al
        </label>
      </div>

      {/* Customer search */}
      <div className="customer-search">
        <input
          type="text"
          placeholder="Müşteri ara (isim veya telefon)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled || loading}
          className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-[var(--theme-foregroundSecondary)]">Müşteriler yükleniyor...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/20 rounded-md">
          <p className="text-sm text-[var(--theme-error)]">{error}</p>
          <button
            onClick={fetchBusinessCustomers}
            className="mt-2 text-xs text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] underline"
          >
            Tekrar dene
          </button>
        </div>
      )}

      {/* Customer list */}
      {!loading && !error && (
        <div className="customer-list space-y-2 max-h-48 overflow-y-auto">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => (
              <div key={customer.id} className="customer-option flex items-center p-3 border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors">
                <input
                  type="radio"
                  name="customer"
                  value={customer.id}
                  checked={selectedCustomer?.id === customer.id}
                  onChange={() => handleCustomerSelect(customer)}
                  disabled={disabled || customer.isBanned}
                  className="h-4 w-4 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] border-[var(--theme-border)]"
                />
                <label className="ml-3 flex-1 cursor-pointer">
                  <div className="customer-info">
                    <div className="customer-name text-sm font-medium text-[var(--theme-foreground)]">
                      {customer.firstName} {customer.lastName}
                      {customer.isBanned && (
                        <span className="ml-2 px-2 py-1 text-xs bg-[var(--theme-error)]/10 text-[var(--theme-error)] rounded-full">
                          Yasaklı
                        </span>
                      )}
                    </div>
                    <div className="customer-phone text-sm text-[var(--theme-foregroundSecondary)]">
                      {customer.phoneNumber}
                    </div>
                  </div>
                </label>
              </div>
            ))
          ) : searchTerm ? (
            <div className="no-customers text-center py-4 text-sm text-[var(--theme-foregroundSecondary)]">
              "{searchTerm}" için müşteri bulunamadı.
            </div>
          ) : (
            <div className="no-customers text-center py-4 text-sm text-[var(--theme-foregroundSecondary)]">
              Henüz müşteriniz bulunmuyor.
            </div>
          )}
        </div>
      )}
    </div>
  );
}