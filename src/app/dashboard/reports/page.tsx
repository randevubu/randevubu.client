'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { reportsService, BusinessOverviewReport, RevenueReport, FinancialReport } from '../../../lib/services/reports';
import { handleApiError } from '../../../lib/utils/toast';
import { SimpleChart } from '../../../components/charts/SimpleChart';
import ExcelLikeTable, { type RevenueColumn, type MonthlyData } from '../../../components/ui/ExcelLikeTable';

interface DateRange {
  startDate: string;
  endDate: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [overviewData, setOverviewData] = useState<BusinessOverviewReport | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFilter, setActiveFilter] = useState<string>('Bu Ay'); // Track active filter
  const [calculatorData, setCalculatorData] = useState<{ columns: RevenueColumn[]; monthlyData: MonthlyData }>({ columns: [], monthlyData: {} }); // Calculator table data
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const tabs = [
    { id: 'overview', name: 'Genel' },
    { id: 'calculator', name: 'Günlük Defterim' },
  ];

  useEffect(() => {
    if (user) {
      loadAllReports();
    }
  }, [user, dateRange]);

  const loadAllReports = async () => {
    try {
      setIsLoading(true);
      
      const params = {
        startDate: `${dateRange.startDate}T00:00:00.000Z`,
        endDate: `${dateRange.endDate}T23:59:59.999Z`,
      };

      // Load all reports in parallel
      const [overviewRes, revenueRes, financialRes] = await Promise.all([
        reportsService.getBusinessOverview(params),
        reportsService.getRevenueReport(params),
        reportsService.getFinancialReport(params),
      ]);

      if (overviewRes.success) setOverviewData(overviewRes.data ?? {
        businessId: '',
        businessName: 'İşletme',
        totalAppointments: 0,
        completedAppointments: 0,
        canceledAppointments: 0,
        noShowAppointments: 0,
        totalRevenue: 0,
        averageAppointmentValue: 0,
        completionRate: 0,
        cancellationRate: 0,
        noShowRate: 0,
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0
      });
      if (revenueRes.success) setRevenueData(revenueRes.data ?? {
        totalRevenue: 0,
        periodRevenue: 0,
        revenueByDay: [],
        revenueByService: []
      });
      if (financialRes.success) setFinancialData(financialRes.data ?? {
        totalRevenue: 0,
        netProfit: 0,
        expenses: 0,
        profitMargin: 0,
        revenueGrowth: 0,
        avgTransactionValue: 0,
        paymentMethods: [],
        monthlyTrends: []
      });
      
    } catch (error) {
      console.error('Reports loading failed:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] font-medium">Raporlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--theme-background)] transition-colors duration-300 flex flex-col overflow-hidden">
      {/* Compact Date & Filter Bar */}
      <div className="bg-[var(--theme-card)] shadow-sm border-b border-[var(--theme-border)] sticky top-0 z-10 transition-colors duration-300">
        <div className="px-3 py-2">
          {/* Period Quick Select - Scrollable */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
            {[
              { label: 'Bugün', action: () => {
                const today = new Date();
                setDateRange({
                  startDate: today.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0],
                });
                setActiveFilter('Bugün');
              }},
              { label: 'Bu Hafta', action: () => {
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                setDateRange({
                  startDate: weekStart.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0],
                });
                setActiveFilter('Bu Hafta');
              }},
              { label: 'Bu Ay', action: () => {
                const today = new Date();
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateRange({
                  startDate: monthStart.toISOString().split('T')[0],
                  endDate: today.toISOString().split('T')[0],
                });
                setActiveFilter('Bu Ay');
              }},
              { label: 'Geçen Ay', action: () => {
                const today = new Date();
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                setDateRange({
                  startDate: lastMonthStart.toISOString().split('T')[0],
                  endDate: lastMonthEnd.toISOString().split('T')[0],
                });
                setActiveFilter('Geçen Ay');
              }}
            ].map((period, index) => (
              <button
                key={index}
                onClick={period.action}
                className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  activeFilter === period.label
                    ? 'bg-[var(--theme-primary)] text-white shadow-md'
                    : 'bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)] hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-primary)]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          {/* Custom Date Range - Compact */}
          <div className="flex space-x-2 mt-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                setActiveFilter(''); // Clear active filter when custom date is selected
              }}
              className="flex-1 px-2 py-1 text-xs border border-[var(--theme-border)] rounded-md focus:ring-1 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-300"
            />
            <span className="text-[var(--theme-foregroundMuted)] self-center">—</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, endDate: e.target.value }));
                setActiveFilter(''); // Clear active filter when custom date is selected
              }}
              className="flex-1 px-2 py-1 text-xs border border-[var(--theme-border)] rounded-md focus:ring-1 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-300"
            />
          </div>
        </div>
        
        {/* Tab Selector - Modern Pills */}
        <div className="px-3 pb-2">
          <div className="flex space-x-1 bg-[var(--theme-backgroundSecondary)] p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[var(--theme-card)] text-[var(--theme-primary)] shadow-sm'
                    : 'text-[var(--theme-foregroundSecondary)] hover:text-gray-800 hover:bg-[var(--theme-border)]'
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="text-sm font-medium">{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Dashboard Style */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3">
        {activeTab === 'overview' && overviewData && (
          <>
            {/* KPI Dashboard - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-[var(--theme-card)]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-100 opacity-90">Toplam Gelir</div>
                    <div className="text-lg font-bold">{formatCurrency(overviewData.totalRevenue)}</div>
                  </div>
                </div>
                <div className="text-xs text-emerald-100">
                  Ort: {formatCurrency(overviewData.averageAppointmentValue)}
                </div>
              </div>

              {/* Total Appointments */}
              <div className="bg-gradient-to-br from-blue-500 to-[var(--theme-primary)] rounded-2xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-[var(--theme-card)]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-100 opacity-90">Randevu</div>
                    <div className="text-lg font-bold">{overviewData.totalAppointments}</div>
                  </div>
                </div>
                <div className="text-xs text-blue-100">
                  {formatPercentage(overviewData.completionRate)} tamamlanma
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-[var(--theme-card)]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-purple-100 opacity-90">Müşteri</div>
                    <div className="text-lg font-bold">{overviewData.totalCustomers}</div>
                  </div>
                </div>
                <div className="text-xs text-purple-100">
                  {overviewData.newCustomers} yeni
                </div>
              </div>

              {/* Performance Score */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-3 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-[var(--theme-card)]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-orange-100 opacity-90">Performans</div>
                    <div className="text-lg font-bold">{Math.round(100 - overviewData.cancellationRate - overviewData.noShowRate)}%</div>
                  </div>
                </div>
                <div className="text-xs text-orange-100">
                  {formatPercentage(overviewData.cancellationRate)} iptal
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Appointment Status - Compact */}
              <div className="bg-[var(--theme-card)] rounded-2xl p-3 shadow-sm border border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Randevu Durumları</h3>
                  <div className="text-xs text-[var(--theme-foregroundMuted)]">{overviewData.totalAppointments} toplam</div>
                </div>
                <SimpleChart
                  type="pie"
                  height={120}
                  data={[
                    { label: 'Tamamlanan', value: overviewData.completedAppointments, color: 'stroke-green-500' },
                    { label: 'İptal', value: overviewData.canceledAppointments, color: 'stroke-red-500' },
                    { label: 'Gelmedi', value: overviewData.noShowAppointments, color: 'stroke-yellow-500' },
                  ]}
                />
              </div>

              {/* Customer Analysis - Compact */}
              <div className="bg-[var(--theme-card)] rounded-2xl p-3 shadow-sm border border-[var(--theme-border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Müşteri Analizi</h3>
                  <div className="text-xs text-[var(--theme-foregroundMuted)]">{overviewData.totalCustomers} toplam</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-[var(--theme-foregroundSecondary)]">Yeni Müşteri</span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--theme-foreground)]">{overviewData.newCustomers}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-[var(--theme-foregroundSecondary)]">Sadık Müşteri</span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--theme-foreground)]">{overviewData.returningCustomers}</div>
                  </div>
                  <div className="pt-2 border-t border-[var(--theme-border)]">
                    <div className="flex justify-between text-xs text-[var(--theme-foregroundMuted)]">
                      <span>Sadakat Oranı</span>
                      <span>{formatPercentage((overviewData.returningCustomers / Math.max(overviewData.totalCustomers, 1)) * 100)}</span>
                    </div>
                    <div className="mt-1 bg-[var(--theme-border)] rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${(overviewData.returningCustomers / Math.max(overviewData.totalCustomers, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}


        {activeTab === 'calculator' && (
          <div className="space-y-4">
            {/* Calculator Tab Description */}
            <div className="bg-[var(--theme-card)] rounded-2xl p-4 shadow-sm border border-[var(--theme-border)]">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-[var(--theme-primary)] rounded-xl flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Günlük Defterim</h3>
                  <p className="text-sm text-[var(--theme-foregroundSecondary)]">Günlük gelir ve giderlerinizi kaydedin, otomatik hesaplamalarla kontrolünüzü sağlayın</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs text-[var(--theme-foregroundMuted)]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Otomatik hesaplama</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Dinamik satır ekleme</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Excel benzeri kullanım</span>
                </div>
              </div>
            </div>

            {/* Excel-like Table Component */}
            <ExcelLikeTable
              title="Günlük Defterim"
              onDataChange={setCalculatorData}
              initialColumns={calculatorData.columns}
              initialData={calculatorData.monthlyData}
            />

            {/* Additional Calculator Statistics */}
            {calculatorData.columns.length > 0 && (
              <div className="bg-[var(--theme-card)] rounded-2xl p-4 shadow-sm border border-[var(--theme-border)]">
                <h4 className="text-md font-semibold text-[var(--theme-foreground)] mb-3">Özet İstatistikler</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--theme-foregroundSecondary)]">Aktif Sütunlar:</span>
                      <span className="text-sm font-medium text-[var(--theme-foreground)]">
                        {calculatorData.columns.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--theme-foregroundSecondary)]">Gelir Sütunları:</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {calculatorData.columns.filter(col => col.type === 'income').length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--theme-foregroundSecondary)]">Gider Sütunları:</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {calculatorData.columns.filter(col => col.type === 'expense').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--theme-foregroundSecondary)]">Veri Girişi:</span>
                      <span className="text-sm font-medium text-[var(--theme-foreground)]">
                        {Object.keys(calculatorData.monthlyData).length} gün
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}