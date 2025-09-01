import { useState, useEffect, useCallback } from 'react';
import { usageService, UsageSummary, UsageAlerts, DailySmsUsage, MonthlyUsage, UsageLimitsCheck } from '../services/usage';

interface UseUsageTrackingReturn {
  usageSummary: UsageSummary | null;
  usageAlerts: UsageAlerts | null;
  isLoading: boolean;
  error: string | null;
  refreshUsage: () => Promise<void>;
}

export const useUsageTracking = (businessId: string): UseUsageTrackingReturn => {
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [usageAlerts, setUsageAlerts] = useState<UsageAlerts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsageData = useCallback(async () => {
    if (!businessId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load usage summary and alerts in parallel
      const [summaryResponse, alertsResponse] = await Promise.all([
        usageService.getUsageSummary(businessId),
        usageService.getUsageAlerts(businessId)
      ]);

      if (summaryResponse.success && summaryResponse.data) {
        setUsageSummary(summaryResponse.data);
      } else {
        throw new Error(summaryResponse.message || 'Kullanım özeti alınamadı');
      }

      if (alertsResponse.success && alertsResponse.data) {
        setUsageAlerts(alertsResponse.data);
      } else {
        // Alerts are not critical, just log the error
        console.warn('Usage alerts could not be loaded:', alertsResponse.message);
      }

    } catch (err: any) {
      setError(err.message || 'Kullanım bilgileri yüklenemedi');
      console.error('Failed to load usage data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const refreshUsage = useCallback(async () => {
    await loadUsageData();
  }, [loadUsageData]);

  useEffect(() => {
    loadUsageData();
  }, [loadUsageData]);

  return {
    usageSummary,
    usageAlerts,
    isLoading,
    error,
    refreshUsage
  };
};

interface UseUsageChartsReturn {
  dailySmsData: DailySmsUsage[] | null;
  monthlyHistoryData: MonthlyUsage[] | null;
  isLoading: boolean;
  error: string | null;
  refreshChartData: () => Promise<void>;
}

export const useUsageCharts = (businessId: string, days: number = 30, months: number = 12): UseUsageChartsReturn => {
  const [dailySmsData, setDailySmsData] = useState<DailySmsUsage[] | null>(null);
  const [monthlyHistoryData, setMonthlyHistoryData] = useState<MonthlyUsage[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChartData = useCallback(async () => {
    if (!businessId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load chart data in parallel
      const [smsResponse, historyResponse] = await Promise.all([
        usageService.getDailySmsUsage(businessId, days),
        usageService.getMonthlyUsageHistory(businessId, months)
      ]);

      if (smsResponse.success && smsResponse.data) {
        setDailySmsData(smsResponse.data);
      } else {
        console.warn('Daily SMS data could not be loaded:', smsResponse.message);
        setDailySmsData([]);
      }

      if (historyResponse.success && historyResponse.data) {
        setMonthlyHistoryData(historyResponse.data);
      } else {
        console.warn('Monthly history data could not be loaded:', historyResponse.message);
        setMonthlyHistoryData([]);
      }

    } catch (err: any) {
      setError(err.message || 'Grafik verileri yüklenemedi');
      console.error('Failed to load chart data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, days, months]);

  const refreshChartData = useCallback(async () => {
    await loadChartData();
  }, [loadChartData]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  return {
    dailySmsData,
    monthlyHistoryData,
    isLoading,
    error,
    refreshChartData
  };
};

interface UseUsageLimitsReturn {
  limitsCheck: UsageLimitsCheck | null;
  isLoading: boolean;
  error: string | null;
  checkLimits: () => Promise<UsageLimitsCheck | null>;
  canSendSms: () => boolean;
  canAddStaff: () => boolean;
  canAddService: () => boolean;
  canAddCustomer: () => boolean;
}

export const useUsageLimits = (businessId: string): UseUsageLimitsReturn => {
  const [limitsCheck, setLimitsCheck] = useState<UsageLimitsCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLimits = useCallback(async (): Promise<UsageLimitsCheck | null> => {
    if (!businessId) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await usageService.checkUsageLimits(businessId);
      
      if (response.success && response.data) {
        setLimitsCheck(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Kullanım limitleri kontrol edilemedi');
      }
    } catch (err: any) {
      setError(err.message || 'Kullanım limitleri kontrol edilemedi');
      console.error('Failed to check usage limits:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  const canSendSms = useCallback((): boolean => {
    return limitsCheck?.sms?.allowed || false;
  }, [limitsCheck]);

  const canAddStaff = useCallback((): boolean => {
    return limitsCheck?.staff?.allowed || false;
  }, [limitsCheck]);

  const canAddService = useCallback((): boolean => {
    return limitsCheck?.service?.allowed || false;
  }, [limitsCheck]);

  const canAddCustomer = useCallback((): boolean => {
    return limitsCheck?.customer?.allowed || false;
  }, [limitsCheck]);

  // Load limits on mount
  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  return {
    limitsCheck,
    isLoading,
    error,
    checkLimits,
    canSendSms,
    canAddStaff,
    canAddService,
    canAddCustomer
  };
};