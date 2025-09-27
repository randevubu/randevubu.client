'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { appointmentService } from '../../lib/services/appointments';
import { useAuth } from '../../context/AuthContext';
import { AppointmentStatus } from '../../types/enums';

export interface RevenueColumn {
  id: string;
  name: string;
  type: 'income' | 'expense'; // + or -
}

export interface DayData {
  [columnId: string]: number;
}

export interface MonthlyData {
  [day: number]: DayData;
}

interface ExcelLikeTableProps {
  title?: string;
  onDataChange?: (data: { columns: RevenueColumn[]; monthlyData: MonthlyData }) => void;
  initialColumns?: RevenueColumn[];
  initialData?: MonthlyData;
}

export default function ExcelLikeTable({ 
  title = "Günlük Defterim",
  onDataChange,
  initialColumns = [],
  initialData = {}
}: ExcelLikeTableProps) {
  const { user } = useAuth();
  const [columns, setColumns] = useState<RevenueColumn[]>(() => {
    if (initialColumns.length > 0) {
      return initialColumns;
    }
    return [
      { id: 'appointments', name: 'Randevular', type: 'income' },
      { id: '1', name: 'Satış', type: 'income' },
      { id: '2', name: 'Kira', type: 'expense' }
    ];
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData>(initialData);
  const [appointmentRevenue, setAppointmentRevenue] = useState<MonthlyData>({});
  const [editingCell, setEditingCell] = useState<{ day: number; columnId: string } | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'income' | 'expense'>('income');

  // Get current month info
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Generate array of days for current month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Fetch appointments for the current month
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.businesses?.[0]?.id) return;

      try {
        const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
        
        const response = await appointmentService.getBusinessAppointments({
          businessId: user.businesses[0].id,
          startDate,
          endDate
        });

        if (response.success && response.data) {
          const dailyRevenue: MonthlyData = {};
          
          response.data.forEach(appointment => {
            // Only count completed appointments as revenue
            if (appointment.status === AppointmentStatus.COMPLETED) {
              const appointmentDate = new Date(appointment.date);
              const day = appointmentDate.getDate();
              
              if (!dailyRevenue[day]) {
                dailyRevenue[day] = {};
              }
              
              const currentAmount = dailyRevenue[day]['appointments'] || 0;
              dailyRevenue[day]['appointments'] = currentAmount + appointment.price;
            }
          });

          setAppointmentRevenue(dailyRevenue);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    fetchAppointments();
  }, [user?.businesses?.[0]?.id, currentMonth, currentYear]);

  const addColumn = useCallback(() => {
    if (!newColumnName.trim()) return;
    
    const newColumn: RevenueColumn = {
      id: Date.now().toString(),
      name: newColumnName.trim(),
      type: newColumnType
    };
    
    setColumns(prev => [...prev, newColumn]);
    setNewColumnName('');
    setShowAddColumn(false);
  }, [newColumnName, newColumnType]);

  const removeColumn = useCallback((columnId: string) => {
    if (columns.length <= 1 || columnId === 'appointments') return; // Don't allow deleting appointments column
    setColumns(prev => prev.filter(col => col.id !== columnId));
    
    // Remove data for this column from all days
    setMonthlyData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(day => {
        const dayNum = parseInt(day);
        if (updated[dayNum]) {
          const { [columnId]: removed, ...rest } = updated[dayNum];
          updated[dayNum] = rest;
        }
      });
      return updated;
    });
  }, [columns.length]);

  const updateCell = useCallback((day: number, columnId: string, value: number) => {
    setMonthlyData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [columnId]: value || 0
      }
    }));
    setEditingCell(null);
  }, []);

  const handleCellClick = useCallback((day: number, columnId: string) => {
    setEditingCell({ day, columnId });
  }, []);

  const getCellValue = useCallback((day: number, columnId: string): number => {
    // For appointments column, return the sum of manual entries + appointment revenue
    if (columnId === 'appointments') {
      const manualValue = monthlyData[day]?.[columnId] || 0;
      const appointmentValue = appointmentRevenue[day]?.[columnId] || 0;
      return manualValue + appointmentValue;
    }
    return monthlyData[day]?.[columnId] || 0;
  }, [monthlyData, appointmentRevenue]);

  const getDayTotal = useCallback((day: number): number => {
    return columns.reduce((total, col) => {
      const value = getCellValue(day, col.id);
      return total + (col.type === 'income' ? value : -value);
    }, 0);
  }, [columns, getCellValue]);

  const getColumnTotal = useCallback((columnId: string): number => {
    return days.reduce((total, day) => {
      return total + getCellValue(day, columnId);
    }, 0);
  }, [days, getCellValue]);

  const getGrandTotal = useCallback((): number => {
    return days.reduce((total, day) => total + getDayTotal(day), 0);
  }, [days, getDayTotal]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Notify parent component of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ columns, monthlyData });
    }
  }, [columns, monthlyData, onDataChange]);

  const CellEditor = ({ day, columnId, value }: { day: number; columnId: string; value: number }) => {
    const [localValue, setLocalValue] = useState(value.toString());

    useEffect(() => {
      setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
      const processedValue = parseFloat(localValue) || 0;
      updateCell(day, columnId, processedValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        const processedValue = parseFloat(localValue) || 0;
        updateCell(day, columnId, processedValue);
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
    const hasAppointmentRevenue = columnId === 'appointments' && (appointmentRevenue[day]?.['appointments'] || 0) > 0;
    const manualValue = columnId === 'appointments' ? (monthlyData[day]?.[columnId] || 0) : value;
    const autoValue = columnId === 'appointments' ? (appointmentRevenue[day]?.['appointments'] || 0) : 0;
    
    return (
      <div 
        className="px-2 sm:px-3 py-3 sm:py-2 cursor-pointer hover:bg-[var(--theme-backgroundSecondary)] transition-colors duration-200 min-h-[44px] sm:min-h-[36px] flex items-center justify-end text-xs sm:text-sm text-[var(--theme-foreground)] hover:border border-[var(--theme-border)] hover:border-dashed"
        onClick={() => handleCellClick(day, columnId)}
        title={hasAppointmentRevenue ? `Manuel: ${formatCurrency(manualValue)}, Randevu: ${formatCurrency(autoValue)}` : undefined}
      >
        <div className="flex items-center space-x-1">
          {value > 0 && formatCurrency(value)}
          {hasAppointmentRevenue && <span className="text-blue-500 text-xs">⚡</span>}
        </div>
      </div>
    );
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  return (
    <div className="bg-[var(--theme-card)] rounded-2xl p-3 sm:p-4 shadow-sm border border-[var(--theme-border)] transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)]">{title}</h3>
          <p className="text-xs sm:text-sm text-[var(--theme-foregroundSecondary)]">
            {monthNames[currentMonth]} {currentYear}
          </p>
        </div>
        <button
          onClick={() => setShowAddColumn(true)}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-[var(--theme-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span>Sütun Ekle</span>
        </button>
      </div>

      {/* Add Column Modal */}
      {showAddColumn && (
        <div className="mb-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-lg border border-[var(--theme-border)]">
          <div className="flex flex-col space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                Sütun Adı
              </label>
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Örn: Satış, Kira, Maaş..."
                className="w-full px-3 py-2 text-sm border border-[var(--theme-border)] rounded-md focus:ring-1 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-card)] text-[var(--theme-foreground)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
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
                onClick={addColumn}
                disabled={!newColumnName.trim()}
                className="flex-1 px-3 py-2 bg-[var(--theme-primary)] text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ekle
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
      )}

      {/* Excel Table */}
      <div className="overflow-hidden border border-[var(--theme-border)] rounded-lg">
        <div className="overflow-x-auto" style={{ maxWidth: '100vw' }}>
          <table className="w-full" style={{ minWidth: `${Math.max(400, columns.length * 120 + 100)}px` }}>
            <thead>
              <tr className="bg-[var(--theme-backgroundSecondary)]">
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-[var(--theme-foregroundSecondary)] uppercase tracking-wider w-16 sticky left-0 bg-[var(--theme-backgroundSecondary)]">
                  Gün
                </th>
                {columns.map((column) => (
                  <th key={column.id} className="px-2 sm:px-3 py-2 sm:py-3 text-right text-xs font-medium text-[var(--theme-foregroundSecondary)] uppercase tracking-wider min-w-[100px] sm:min-w-[120px] relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs ${column.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {column.type === 'income' ? '+' : '-'}
                        </span>
                        <span>{column.name}</span>
                        {column.id === 'appointments' && (
                          <span className="text-xs text-blue-500 ml-1" title="Otomatik randevu geliri dahil">⚡</span>
                        )}
                      </div>
                      {column.id !== 'appointments' && (
                        <button
                          onClick={() => removeColumn(column.id)}
                          disabled={columns.length <= 1}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sütunu sil"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
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
                  <td className="px-2 sm:px-3 py-2 text-center text-sm font-medium text-[var(--theme-foreground)] border-r border-[var(--theme-border)] sticky left-0 bg-[var(--theme-card)]">
                    {day}
                  </td>
                  {columns.map((column) => {
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
                <td className="px-2 sm:px-3 py-3 text-center text-xs sm:text-sm text-[var(--theme-foreground)] border-r border-[var(--theme-border)] sticky left-0 bg-[var(--theme-backgroundSecondary)]">
                  TOPLAM
                </td>
                {columns.map((column) => (
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

      {/* Summary Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-90 mb-1">Aylık Gelir</div>
              <div className="text-lg sm:text-xl font-bold">
                {formatCurrency(columns.filter(c => c.type === 'income').reduce((sum, col) => sum + getColumnTotal(col.id), 0))}
              </div>
            </div>
            <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-lg p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-90 mb-1">Aylık Gider</div>
              <div className="text-lg sm:text-xl font-bold">
                {formatCurrency(columns.filter(c => c.type === 'expense').reduce((sum, col) => sum + getColumnTotal(col.id), 0))}
              </div>
            </div>
            <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div>
        
        <div className={`rounded-lg p-3 text-white ${
          getGrandTotal() >= 0 
            ? 'bg-gradient-to-br from-blue-500 to-[var(--theme-primary)]' 
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-90 mb-1">Net Kar/Zarar</div>
              <div className="text-lg sm:text-xl font-bold">{formatCurrency(getGrandTotal())}</div>
            </div>
            <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-[var(--theme-backgroundSecondary)] rounded-lg">
        <div className="text-xs text-[var(--theme-foregroundSecondary)]">
          <strong>Kullanım:</strong> Hücrelere dokunarak/tıklayarak günlük tutarları girin • 
          <span className="hidden sm:inline"> Enter ile kaydet • </span>
          <strong>+ Gelir</strong> ve <strong>- Gider</strong> sütunları ekleyebilirsiniz
        </div>
      </div>
    </div>
  );
}