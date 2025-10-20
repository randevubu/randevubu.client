import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyNotebookService, type DailyNotebook, type RevenueColumn, type MonthlyData, CreateRevenueColumnRequest } from '../services/dailyNotebook';
import { handleApiError } from '../utils/toast';

interface UseDailyNotebookProps {
  businessId: string;
  year: number;
  month: number;
}

export function useDailyNotebook({ businessId, year, month }: UseDailyNotebookProps) {
  const queryClient = useQueryClient();

  // Query for daily notebook data
  const {
    data: notebookData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dailyNotebook', businessId, year, month],
    queryFn: async () => {
      const response = await dailyNotebookService.getDailyNotebook(businessId, year, month);
      if (!response.success) {
        throw new Error(response.error || 'Failed to load daily notebook');
      }
      return response.data!;
    },
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for updating daily entries (bulk)
  const updateEntriesMutation = useMutation({
    mutationFn: async (entries: { [day: number]: { [columnId: string]: number } }) => {
      const response = await dailyNotebookService.updateDailyEntries(businessId, year, month, entries);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update entries');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNotebook', businessId, year, month] });
      // Also refresh reports so dashboard reflects notebook changes
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && ['businessOverview','revenueReport','financialReport'].includes(String(q.queryKey[0]))
      });
    },
    onError: (error) => {
      handleApiError(error);
    }
  });

  // Mutation for updating single entry
  const updateSingleEntryMutation = useMutation({
    mutationFn: async ({ day, columnId, amount, note }: { day: number; columnId: string; amount: number; note?: string }) => {
      const response = await dailyNotebookService.updateSingleEntry(businessId, year, month, day, columnId, amount, note);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update entry');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNotebook', businessId, year, month] });
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && ['businessOverview','revenueReport','financialReport'].includes(String(q.queryKey[0]))
      });
    },
    onError: (error) => {
      handleApiError(error);
    }
  });

  // Mutation for creating new column
  const createColumnMutation = useMutation({
    mutationFn: async (columnData: { name: string; type: 'income' | 'expense'; priority?: 'high' | 'medium' | 'low' }) => {
      const response = await dailyNotebookService.createRevenueColumn(businessId, columnData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create column');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNotebook', businessId, year, month] });
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && ['businessOverview','revenueReport','financialReport'].includes(String(q.queryKey[0]))
      });
    },
    onError: (error) => {
      handleApiError(error);
    }
  });

  // Mutation for updating column
  const updateColumnMutation = useMutation({
    mutationFn: async ({ columnId, columnData }: { columnId: string; columnData: Partial<CreateRevenueColumnRequest> }) => {
      const response = await dailyNotebookService.updateRevenueColumn(businessId, columnId, columnData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update column');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNotebook', businessId, year, month] });
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && ['businessOverview','revenueReport','financialReport'].includes(String(q.queryKey[0]))
      });
    },
    onError: (error) => {
      handleApiError(error);
    }
  });

  // Mutation for deleting column
  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const response = await dailyNotebookService.deleteRevenueColumn(businessId, columnId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete column');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNotebook', businessId, year, month] });
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && ['businessOverview','revenueReport','financialReport'].includes(String(q.queryKey[0]))
      });
    },
    onError: (error) => {
      handleApiError(error);
    }
  });

  // Helper functions
  const updateCell = useCallback((day: number, columnId: string, value: number) => {
    if (!notebookData) return;

    // Update local state optimistically
    const updatedMonthlyData = {
      ...notebookData.monthlyData,
      [day]: {
        ...notebookData.monthlyData[day],
        [columnId]: value
      }
    };

    // Update the query cache
    queryClient.setQueryData(['dailyNotebook', businessId, year, month], {
      ...notebookData,
      monthlyData: updatedMonthlyData
    });

    // Update on server using single entry update for better performance
    updateSingleEntryMutation.mutate({ day, columnId, amount: value });
  }, [notebookData, updateSingleEntryMutation, queryClient, businessId, year, month]);

  const addColumn = useCallback((columnData: { name: string; type: 'income' | 'expense'; priority?: 'high' | 'medium' | 'low' }) => {
    createColumnMutation.mutate(columnData);
  }, [createColumnMutation]);

  const updateColumn = useCallback((columnId: string, columnData: Partial<CreateRevenueColumnRequest>) => {
    updateColumnMutation.mutate({ columnId, columnData });
  }, [updateColumnMutation]);

  const deleteColumn = useCallback((columnId: string) => {
    deleteColumnMutation.mutate(columnId);
  }, [deleteColumnMutation]);

  const getCellValue = useCallback((day: number, columnId: string): number => {
    if (!notebookData) return 0;

    // For appointments column, return the sum of manual entries + appointment revenue
    const column = notebookData.columns.find(col => col.id === columnId);
    if (column?.name === 'Randevular') {
      const manualValue = notebookData.monthlyData[day]?.[columnId] || 0;
      const appointmentValue = notebookData.appointmentRevenue[day]?.[columnId] || 0;
      return manualValue + appointmentValue;
    }

    return notebookData.monthlyData[day]?.[columnId] || 0;
  }, [notebookData]);

  const getVisibleColumns = useCallback((): RevenueColumn[] => {
    if (!notebookData) return [];
    return notebookData.columns.filter(col => col.visible);
  }, [notebookData]);

  const getDayTotal = useCallback((day: number): number => {
    if (!notebookData) return 0;
    return notebookData.totals.dailyTotals[day] || 0;
  }, [notebookData]);

  const getColumnTotal = useCallback((columnId: string): number => {
    if (!notebookData) return 0;
    return notebookData.totals.columnTotals[columnId] || 0;
  }, [notebookData]);

  const getGrandTotal = useCallback((): number => {
    if (!notebookData) return 0;
    return notebookData.totals.grandTotal || 0;
  }, [notebookData]);

  return {
    // Data
    notebookData,
    columns: notebookData?.columns || [],
    monthlyData: notebookData?.monthlyData || {},
    appointmentRevenue: notebookData?.appointmentRevenue || {},
    totals: notebookData?.totals || {
      dailyTotals: {},
      columnTotals: {},
      grandTotal: 0,
      incomeTotal: 0,
      expenseTotal: 0
    },

    // Loading states
    isLoading,
    isUpdating: updateEntriesMutation.isPending,
    isCreatingColumn: createColumnMutation.isPending,
    isUpdatingColumn: updateColumnMutation.isPending,
    isDeletingColumn: deleteColumnMutation.isPending,

    // Error states
    error,

    // Actions
    updateCell,
    addColumn,
    updateColumn,
    deleteColumn,
    refetch,

    // Helper functions
    getCellValue,
    getVisibleColumns,
    getDayTotal,
    getColumnTotal,
    getGrandTotal
  };
}
