'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDailyNotebook } from '../../lib/hooks/useDailyNotebook';
import { Plus, Columns, X, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export interface RevenueColumn {
  id: string;
  businessId: string;
  name: string;
  type: 'income' | 'expense';
  priority: 'high' | 'medium' | 'low';
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DayData {
  [columnId: string]: number;
}

export interface MonthlyData {
  [day: number]: DayData;
}

interface ExcelLikeTableProps {
  title?: string;
  businessId?: string;
  year?: number;
  month?: number;
  mobileView?: 'table' | 'cards' | 'auto';
}

export default function ExcelLikeTable({ 
  title = "Günlük Defterim",
  businessId,
  year,
  month,
  mobileView = 'auto'
}: ExcelLikeTableProps) {
  const { user } = useAuth();
  
  // Use current date if not provided
  const currentDate = new Date();
  const currentYear = year || currentDate.getFullYear();
  const currentMonth = month || (currentDate.getMonth() + 1);
  const businessIdToUse = businessId || user?.businesses?.[0]?.id;

  // Use the daily notebook hook
  const {
    columns,
    monthlyData,
    appointmentRevenue,
    totals,
    isLoading,
    isUpdating,
    isCreatingColumn,
    isUpdatingColumn,
    isDeletingColumn,
    updateCell,
    addColumn,
    updateColumn,
    deleteColumn,
    getCellValue,
    getVisibleColumns,
    getDayTotal,
    getColumnTotal,
    getGrandTotal
  } = useDailyNotebook({
    businessId: businessIdToUse!,
    year: currentYear,
    month: currentMonth
  });

  const [editingCell, setEditingCell] = useState<{ day: number; columnId: string } | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'income' | 'expense'>('income');

  // Value Dialog State for Mobile Card Edits
  const [showValueDialog, setShowValueDialog] = useState(false);
  const [dialogDay, setDialogDay] = useState<number | null>(null);
  const [dialogColumnId, setDialogColumnId] = useState<string | null>(null);
  const [dialogColumnName, setDialogColumnName] = useState<string>('');
  const [dialogValue, setDialogValue] = useState<string>('');
  const [currentMobileView, setCurrentMobileView] = useState<'table' | 'cards'>('table');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showColumnDetails, setShowColumnDetails] = useState(false);
  const [detailsColumnId, setDetailsColumnId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const displayTitle = isMobile ? 'Defterim' : title;

  // Generate array of days for current month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobileView === 'auto') {
        setCurrentMobileView(mobile ? 'cards' : 'table');
      } else {
        setCurrentMobileView(mobileView);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileView]);


  const handleAddColumn = useCallback(() => {
    if (!newColumnName.trim()) return;
    
    addColumn({
      name: newColumnName.trim(),
      type: newColumnType,
      priority: 'medium'
    });
    
    setNewColumnName('');
    setShowAddColumn(false);
  }, [newColumnName, newColumnType, addColumn]);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column) {
      updateColumn(columnId, { visible: !column.visible });
    }
  }, [columns, updateColumn]);

  const getMobileColumns = useCallback(() => {
    // For card view, show all visible columns
    return getVisibleColumns();
  }, [getVisibleColumns]);

  const handleRemoveColumn = useCallback((columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column && column.isSystem) return; // Don't allow deleting system columns
    
    if (columns.length <= 1) return;
    
    deleteColumn(columnId);
  }, [columns, deleteColumn]);

  const openColumnDetails = useCallback((columnId: string) => {
    setDetailsColumnId(columnId);
    setShowColumnDetails(true);
  }, []);

  const closeColumnDetails = useCallback(() => {
    setShowColumnDetails(false);
    setDetailsColumnId(null);
  }, []);

  const openDeleteConfirm = useCallback((columnId: string) => {
    setColumnToDelete(columnId);
    setShowDeleteConfirm(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
    setColumnToDelete(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (columnToDelete) {
      handleRemoveColumn(columnToDelete);
      closeColumnDetails();
      closeDeleteConfirm();
    }
  }, [columnToDelete, handleRemoveColumn, closeColumnDetails, closeDeleteConfirm]);

  const handleUpdateCell = useCallback((day: number, columnId: string, value: number) => {
    updateCell(day, columnId, value);
    setEditingCell(null);
  }, [updateCell]);

  const handleCellClick = useCallback((day: number, columnId: string) => {
    setEditingCell({ day, columnId });
  }, []);

  const openValueDialog = useCallback((day: number, columnId: string, columnName: string) => {
    const current = getCellValue(day, columnId);
    setDialogDay(day);
    setDialogColumnId(columnId);
    setDialogColumnName(columnName);
    setDialogValue(current ? String(current) : '');
    setShowValueDialog(true);
  }, [getCellValue]);

  const closeValueDialog = useCallback(() => {
    setShowValueDialog(false);
    setDialogDay(null);
    setDialogColumnId(null);
    setDialogColumnName('');
    setDialogValue('');
  }, []);

  const saveValueDialog = useCallback(() => {
    if (dialogDay == null || !dialogColumnId) {
      closeValueDialog();
      return;
    }
    const num = parseFloat(dialogValue);
    const amount = Number.isFinite(num) ? num : 0;
    handleUpdateCell(dialogDay, dialogColumnId, amount);
    closeValueDialog();
  }, [dialogDay, dialogColumnId, dialogValue, handleUpdateCell, closeValueDialog]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Compute appointment revenue total for summary card with fallback
  const getAppointmentRevenueTotal = () => {
    // Sum from appointmentRevenue map first (auto-only)
    const autoTotal = Object.values(appointmentRevenue || {}).reduce<number>((sum, day) => {
      const dayMap = day as Record<string, number>;
      return sum + Object.values(dayMap || {}).reduce<number>((inner, val) => inner + (val ?? 0), 0);
    }, 0);

    if (autoTotal > 0) return autoTotal;

    // Fallback: sum Randevular column from monthlyData if backend didn't provide appointmentRevenue
    const appointmentsCol = columns.find(c => c.name === 'Randevular');
    if (!appointmentsCol) return 0;
    return Object.values(monthlyData || {}).reduce<number>((sum, day) => {
      const val = (day as Record<string, number>)[appointmentsCol.id] ?? 0;
      return sum + val;
    }, 0);
  };


  const CellEditor = ({ day, columnId, value }: { day: number; columnId: string; value: number }) => {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
      setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
      const processedValue = parseFloat(localValue) || 0;
      handleUpdateCell(day, columnId, processedValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        const processedValue = parseFloat(localValue) || 0;
        handleUpdateCell(day, columnId, processedValue);
      }
      if (e.key === 'Escape') {
        setEditingCell(null);
      }
    };

    return (
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        className="w-full px-2 py-2 sm:py-1 text-xs sm:text-sm border-2 border-[var(--theme-primary)] rounded focus:outline-none bg-[var(--theme-card)] text-[var(--theme-foreground)] min-h-[40px] sm:min-h-[32px] text-right"
        placeholder="0"
        autoFocus
        step="0.01"
      />
    );
  };

  const CellDisplay = ({ day, columnId, value }: { day: number; columnId: string; value: number }) => {
    const column = columns.find(col => col.id === columnId);
    const hasAppointmentRevenue = column?.isSystem && column?.name === 'Randevular' && (appointmentRevenue[day]?.[columnId] || 0) > 0;
    const manualValue = column?.isSystem && column?.name === 'Randevular' ? (monthlyData[day]?.[columnId] || 0) : value;
    const autoValue = column?.isSystem && column?.name === 'Randevular' ? (appointmentRevenue[day]?.[columnId] || 0) : 0;
    const sign = column?.type === 'income' ? '+' : '-';
    
    return (
      <div 
        className="px-2 sm:px-3 py-3 sm:py-2 cursor-pointer hover:bg-[var(--theme-backgroundSecondary)] transition-colors duration-200 min-h-[44px] sm:min-h-[36px] flex items-center justify-end text-xs sm:text-sm text-[var(--theme-foreground)] hover:border border-[var(--theme-border)] hover:border-dashed"
        onClick={() => openValueDialog(day, columnId, column?.name || '')}
        title={hasAppointmentRevenue ? `Manuel: ${formatCurrency(manualValue)}, Randevu: ${formatCurrency(autoValue)}` : undefined}
      >
        <div className="flex items-center space-x-1">
          {value > 0 ? (
            <>
              <span className={`text-[10px] ${column?.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{sign}</span>
              <span>{formatCurrency(value)}</span>
            </>
          ) : (
            <span>0 ₺</span>
          )}
          {hasAppointmentRevenue && <span className="text-blue-500 text-xs">⚡</span>}
        </div>
      </div>
    );
  };

  // Mobile Card View Component
  const MobileCardView = () => {
    const visibleColumns = getMobileColumns();
    const hiddenColumns = getVisibleColumns().filter(col => !getMobileColumns().includes(col));
    
    return (
      <div className="space-y-3">
        {days.map((day) => (
          <div key={day} className="bg-[var(--theme-card)] rounded-lg border border-[var(--theme-border)] p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[var(--theme-foreground)]">Gün {day}</h4>
              <div className={`text-sm font-bold ${getDayTotal(day) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(getDayTotal(day))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              {visibleColumns.map((column) => {
                const value = getCellValue(day, column.id);
                const isIncome = String(column.type).toLowerCase() === 'income';
                return (
                  <div
                    key={column.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer min-w-0 ${isIncome ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                    onClick={() => openValueDialog(day, column.id, column.name)}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className={`text-[11px] font-bold ${isIncome ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{isIncome ? '+' : '-'}</span>
                      <span className="text-xs text-[var(--theme-foregroundSecondary)] truncate max-w-[8rem]">{column.name}</span>
                    </div>
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${value > 0 ? (isIncome ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400') : 'text-[var(--theme-foregroundSecondary)]'}`}>
                      {value > 0 ? `${formatCurrency(value)}` : '0 ₺'}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        ))}
      </div>
    );
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-[var(--theme-card)] rounded-2xl p-3 sm:p-4 shadow-sm border border-[var(--theme-border)] transition-colors duration-300">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)] font-medium">Günlük defter yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--theme-card)] rounded-2xl p-3 sm:p-4 shadow-sm border border-[var(--theme-border)] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)]">{displayTitle}</h3>
          <p className="text-xs sm:text-sm text-[var(--theme-foregroundSecondary)]">
            {monthNames[currentMonth]} {currentYear}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2 flex-nowrap overflow-x-auto whitespace-nowrap">
          {isMobile && (
            <div className="flex space-x-1 bg-[var(--theme-backgroundSecondary)] p-1 rounded-lg">
              <button
                onClick={() => setCurrentMobileView('table')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  currentMobileView === 'table' 
                    ? 'bg-[var(--theme-card)] text-[var(--theme-primary)]' 
                    : 'text-[var(--theme-foregroundSecondary)]'
                }`}
              >
                Tablo
              </button>
              <button
                onClick={() => setCurrentMobileView('cards')}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  currentMobileView === 'cards' 
                    ? 'bg-[var(--theme-card)] text-[var(--theme-primary)]' 
                    : 'text-[var(--theme-foregroundSecondary)]'
                }`}
              >
                Kartlar
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="flex items-center justify-center space-x-1 px-2 py-2 bg-gray-500 text-white rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium"
            title="Sütunlar"
          >
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">Sütunlar</span>
          </button>
          
          <button
            onClick={() => setShowAddColumn(true)}
            disabled={isCreatingColumn}
            className="flex items-center justify-center px-2 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={isCreatingColumn ? 'Ekleniyor...' : 'Sütun Ekle'}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">{isCreatingColumn ? 'Ekleniyor...' : 'Sütun Ekle'}</span>
          </button>
        </div>
      </div>

      {/* Inline Summary Above Table */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg px-2 py-2 text-white flex items-center justify-between shadow-sm">
          <span className="opacity-90">Gelir</span>
          <span className="text-base sm:text-lg font-semibold">{formatCurrency(totals.incomeTotal)}</span>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-lg px-2 py-2 text-white flex items-center justify-between shadow-sm">
          <span className="opacity-90">Gider</span>
          <span className="text-base sm:text-lg font-semibold">{formatCurrency(totals.expenseTotal)}</span>
        </div>
        <div className={`${totals.grandTotal >= 0 ? 'bg-gradient-to-br from-sky-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-red-600'} rounded-lg px-2 py-2 text-white flex items-center justify-between shadow-sm`}>
          <span className="opacity-90">Net</span>
          <span className="text-base sm:text-lg font-semibold">{formatCurrency(totals.grandTotal)}</span>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg px-2 py-2 text-white flex items-center justify-between shadow-sm">
          <span className="opacity-90">Randevu Geliri</span>
          <span className="text-base sm:text-lg font-semibold">{formatCurrency(getAppointmentRevenueTotal())}</span>
        </div>
      </div>

      {/* Add Column Dialog */}
      {showAddColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[92%] max-w-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4 shadow-xl">
            <div className="flex flex-col space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-[var(--theme-foreground)] mb-2">Yeni Sütun</h4>
                <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1">
                  Sütun Adı
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Örn: Satış, Kira, Maaş..."
                  className="w-full px-3 py-2 text-sm border border-[var(--theme-border)] rounded-md focus:ring-1 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                  Tür
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="income"
                      checked={newColumnType === 'income'}
                      onChange={(e) => setNewColumnType(e.target.value as 'income')}
                      className="text-green-600"
                    />
                    <span className="text-sm text-green-600 font-medium">+ Gelir</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="expense"
                      checked={newColumnType === 'expense'}
                      onChange={(e) => setNewColumnType(e.target.value as 'expense')}
                      className="text-red-600"
                    />
                    <span className="text-sm text-red-600 font-medium">- Gider</span>
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumnName.trim() || isCreatingColumn}
                  className="flex-1 px-3 py-2 bg-[var(--theme-primary)] text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingColumn ? 'Ekleniyor...' : 'Ekle'}
                </button>
                <button
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnName('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Selector Modal */}
      {showColumnSelector && (
        <div className="mb-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-lg border border-[var(--theme-border)]">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[var(--theme-foreground)]">Sütunlar</h4>
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center justify-between p-2 bg-[var(--theme-card)] rounded">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${column.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {column.type === 'income' ? '+' : '-'}
                    </span>
                    <span className="text-sm text-[var(--theme-foreground)]">{column.name}</span>
                    {/* priority badges removed per request */}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleColumnVisibility(column.id)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        column.visible ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        column.visible ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-[var(--theme-foregroundMuted)]">
              <strong>İpucu:</strong> Kart görünümünde tüm görünür sütunlar gösterilir
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Mobile Card View or Table */}
      {isMobile && currentMobileView === 'cards' ? (
        <MobileCardView />
      ) : (
      <div className="overflow-hidden border border-[var(--theme-border)] rounded-lg">
        <div className="overflow-x-auto" style={{ maxWidth: '100vw' }}>
            <table className="w-full" style={{ minWidth: `${Math.max(400, getVisibleColumns().length * 120 + 100)}px` }}>
            <thead>
              <tr className="bg-[var(--theme-backgroundSecondary)]">
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-[var(--theme-foregroundSecondary)] uppercase tracking-wider w-16">
                  Gün
                </th>
                  {getVisibleColumns().map((column) => (
                  <th key={column.id} className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs font-medium text-[var(--theme-foregroundSecondary)] uppercase tracking-wider min-w-[100px] sm:min-w-[120px]">
                    <div className="flex items-center justify-between">
                    <button className="flex items-center space-x-1 hover:opacity-80" onClick={() => openColumnDetails(column.id)}>
                      {(() => { const isIncome = String(column.type).toLowerCase() === 'income'; return (
                        <span className={`text-xs ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isIncome ? '+' : '-'}
                        </span>
                      );})()}
                        <span className="text-[var(--theme-foreground)]">{column.name}</span>
                        {column.isSystem && column.name === 'Randevular' && (
                          <span className="text-xs text-blue-500 ml-1" title="Otomatik randevu geliri dahil">⚡</span>
                        )}
                      </button>
                    </div>
                  </th>
                ))}
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs font-medium text-[var(--theme-foregroundSecondary)] uppercase tracking-wider min-w-[100px] bg-[var(--theme-backgroundSecondary)]">
                  Toplam
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--theme-card)] divide-y divide-[var(--theme-border)]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-[var(--theme-backgroundSecondary)]/50 transition-colors duration-200">
                  <td className="px-2 sm:px-3 py-2 text-center text-sm font-medium text-[var(--theme-foreground)] border-r border-[var(--theme-border)]">
                    {day}
                  </td>
                  {getVisibleColumns().map((column) => {
                    const value = getCellValue(day, column.id);
                    return (
                      <td key={column.id} className="border-r border-[var(--theme-border)]">
                        {editingCell?.day === day && editingCell?.columnId === column.id ? (
                          <CellEditor day={day} columnId={column.id} value={value} />
                        ) : (
                          <CellDisplay day={day} columnId={column.id} value={value} />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 sm:px-3 py-2 text-right text-sm font-medium border-r border-[var(--theme-border)] bg-[var(--theme-backgroundSecondary)]">
                    <span className={`${getDayTotal(day) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(getDayTotal(day))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            
            {/* Totals Footer */}
            <tfoot className="bg-[var(--theme-backgroundSecondary)] border-t-2 border-[var(--theme-border)]">
              <tr className="font-semibold">
                <td className="px-2 sm:px-3 py-3 text-center text-xs sm:text-sm text-[var(--theme-foreground)] border-r border-[var(--theme-border)]">
                  TOPLAM
                </td>
                {getVisibleColumns().map((column) => (
                  <td key={column.id} className="px-2 sm:px-3 py-3 text-right text-xs sm:text-sm border-r border-[var(--theme-border)]">
                    <span className={`${column.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(getColumnTotal(column.id))}
                    </span>
                  </td>
                ))}
                <td className={`px-2 sm:px-3 py-3 text-right text-xs sm:text-sm font-bold border-r border-[var(--theme-border)] ${
                  getGrandTotal() >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                } bg-[var(--theme-backgroundSecondary)]`}>
                  {formatCurrency(getGrandTotal())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      )}

      {/* Lower summary removed: already displayed above */}

      {/* Value Input Dialog */}
      {showValueDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4 shadow-xl">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-[var(--theme-foreground)]">{dialogColumnName}</h4>
              <p className="text-xs text-[var(--theme-foregroundSecondary)]">Gün {dialogDay}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1">Tutar</label>
                <input
                  type="number"
                  value={dialogValue}
                  onChange={(e) => setDialogValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[var(--theme-border)] rounded-md focus:ring-1 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)]"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={saveValueDialog}
                  className="flex-1 px-3 py-2 bg-[var(--theme-primary)] text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Kaydet
                </button>
                <button
                  onClick={closeValueDialog}
                  className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Column Details Dialog */}
      {showColumnDetails && detailsColumnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[92%] max-w-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-4 shadow-xl">
            {(() => {
              const col = columns.find(c => c.id === detailsColumnId);
              if (!col) return null;
              return (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--theme-foreground)] flex items-center space-x-2">
                      <span className={`text-xs ${col.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{col.type === 'income' ? '+' : '-'}</span>
                      <span>{col.name}</span>
                    </h4>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)]">Tür: {col.type === 'income' ? 'Gelir' : 'Gider'}{col.isSystem ? ' • Sistem Sütunu' : ''}</p>
                  </div>
                  <div className="flex space-x-2">
                    {!col.isSystem && (
                      <button
                        onClick={() => openDeleteConfirm(col.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                      >
                        Sütunu Sil
                      </button>
                    )}
                    <button
                      onClick={closeColumnDetails}
                      className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90%] max-w-md bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl p-6 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">
                Sütunu Sil
              </h3>
              <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-6">
                Bu sütunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve sütundaki tüm veriler kalıcı olarak silinecektir.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-backgroundSecondary)] rounded-lg hover:bg-[var(--theme-border)] transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-[var(--theme-backgroundSecondary)] rounded-lg">
        <div className="text-xs text-[var(--theme-foregroundSecondary)]">
          <strong>Kullanım:</strong> Hücrelere dokunarak/tıklayarak günlük tutarları girin • 
          <span className="hidden sm:inline"> Enter ile kaydet • </span>
          <strong>+ Gelir</strong> ve <strong>- Gider</strong> sütunları ekleyebilirsiniz
          {isMobile && (
            <span> • <strong>Sütunlar</strong> butonu ile görünürlük ayarlayın • <strong>Kartlar</strong> görünümü mobilde daha kolay • Gizli sütunlar hesaplamalardan çıkarılır</span>
          )}
        </div>
      </div>
    </div>
  );
}