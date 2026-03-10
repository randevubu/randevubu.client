'use client';

import { Check, X } from 'lucide-react';
import { SubscriptionPlan } from '../../types/subscription';

interface PlanComparisonTableProps {
  plans: SubscriptionPlan[];
  onClose: () => void;
}

function isProPlan(plan: SubscriptionPlan): boolean {
  return plan.id === 'plan_pro' || plan.name === 'pro';
}

function hasDescFeature(plan: SubscriptionPlan, exactPhrases: string[]): boolean {
  const desc = plan.features?.description;
  if (!Array.isArray(desc)) return false;
  const lower = desc.map((d) => String(d).toLowerCase());
  return exactPhrases.some((phrase) => lower.some((d) => d.includes(phrase.toLowerCase())));
}

const FEATURE_ROWS: Array<{
  key: string;
  label: string;
  getValue: (plan: SubscriptionPlan) => boolean | number | string;
  type: 'boolean' | 'number' | 'string';
}> = [
  { key: 'trial', label: '7 Gün Ücretsiz Deneme', getValue: (p) => !isProPlan(p), type: 'boolean' },
  { key: 'staff', label: 'Personel', getValue: (p) => { if (isProPlan(p)) return 'Sınırsız'; const n = p.maxStaffPerBusiness || 0; return n === 0 ? '—' : n; }, type: 'string' },
  { key: 'sms', label: 'Aylık SMS', getValue: (p) => { if (isProPlan(p)) return 'Sınırsız'; const n = p.features?.smsQuota ?? 0; return n === 0 ? '—' : typeof n === 'number' ? n.toLocaleString('tr-TR') : String(n); }, type: 'string' },
  { key: 'customers', label: 'Müşteri', getValue: () => 'Sınırsız', type: 'string' },
  { key: 'appointmentBooking', label: 'Online Randevu Sistemi', getValue: (p) => isProPlan(p) || !!p.features?.appointmentBooking, type: 'boolean' },
  { key: 'unlimitedAppointments', label: 'Sınırsız Randevu', getValue: () => true, type: 'boolean' },
  { key: 'emailSms', label: 'E-posta ve SMS Bildirimleri', getValue: (p) => isProPlan(p) || !!(p.features?.emailNotifications && p.features?.smsNotifications), type: 'boolean' },
  { key: 'mobileApp', label: 'Mobil Uygulama Erişimi', getValue: () => true, type: 'boolean' },
  { key: 'basicReports', label: 'Temel Raporlama ve Analiz', getValue: (p) => isProPlan(p) || !!(p.features?.basicReports && !p.features?.advancedReports), type: 'boolean' },
  { key: 'advancedReports', label: 'Gelişmiş Raporlar', getValue: (p) => isProPlan(p) || !!p.features?.advancedReports, type: 'boolean' },
  { key: 'revenueAnalytics', label: 'Gelir Analizi', getValue: (p) => isProPlan(p) || !!p.features?.advancedReports, type: 'boolean' },
  { key: 'whatsapp', label: 'WhatsApp Entegrasyonu', getValue: (p) => isProPlan(p) || (p.features?.integrations?.some((i) => String(i).toLowerCase().includes('whatsapp')) ?? false), type: 'boolean' },
  { key: 'googleCalendar', label: 'Google Takvim Senkronizasyonu', getValue: (p) => isProPlan(p) || (p.features?.integrations?.some((i) => String(i).toLowerCase().includes('google')) ?? false), type: 'boolean' },
  { key: 'outlook', label: 'Google Takvim ve Outlook Entegrasyonu', getValue: (p) => isProPlan(p) || (p.features?.integrations?.some((i) => String(i).toLowerCase().includes('outlook')) ?? false), type: 'boolean' },
  { key: 'customerManagement', label: 'Müşteri Yönetimi', getValue: () => true, type: 'boolean' },
  { key: 'serviceManagement', label: 'Hizmet Yönetimi', getValue: () => true, type: 'boolean' },
  { key: 'basicSegmentation', label: 'Temel Müşteri Segmentasyonu', getValue: (p) => isProPlan(p) || !!(p.features?.basicReports && !p.features?.advancedReports), type: 'boolean' },
  { key: 'advancedSegmentation', label: 'Gelişmiş Müşteri Segmentasyonu', getValue: (p) => isProPlan(p) || !!p.features?.advancedReports, type: 'boolean' },
  { key: 'appointmentReminders', label: 'Randevu Hatırlatmaları', getValue: () => true, type: 'boolean' },
  { key: 'businessHours', label: 'İş Saatleri Yönetimi', getValue: () => true, type: 'boolean' },
  { key: 'customerFeedback', label: 'Müşteri Geri Bildirim Sistemi', getValue: () => true, type: 'boolean' },
  { key: 'loyaltyPrograms', label: 'Müşteri Sadakat Programları', getValue: (p) => isProPlan(p) || !!p.features?.advancedReports, type: 'boolean' },
  { key: 'advancedScheduling', label: 'Gelişmiş Randevu Planlama', getValue: (p) => isProPlan(p) || !!p.features?.advancedReports, type: 'boolean' },
  { key: 'staffPerformance', label: 'Personel Performans Takibi', getValue: (p) => isProPlan(p) || !!p.features?.advancedReports, type: 'boolean' },
  { key: 'advancedNotifications', label: 'Gelişmiş Bildirim Ayarları', getValue: (p) => isProPlan(p) || !!p.features?.advancedReports, type: 'boolean' },
  { key: 'customBranding', label: 'Özel Markalama', getValue: (p) => isProPlan(p) || !!p.features?.customBranding, type: 'boolean' },
  { key: 'apiAccess', label: 'API Erişimi', getValue: (p) => isProPlan(p) || !!p.features?.apiAccess, type: 'boolean' },
  { key: 'accountManager', label: 'Özel Hesap Yöneticisi', getValue: (p) => isProPlan(p), type: 'boolean' },
  { key: 'customIntegrations', label: 'Özel Entegrasyonlar', getValue: (p) => isProPlan(p) || !!p.features?.apiAccess, type: 'boolean' },
  { key: 'prioritySupport', label: 'Öncelikli Destek', getValue: (p) => isProPlan(p) || !!p.features?.prioritySupport, type: 'boolean' },
  { key: 'customReporting', label: 'Özel Raporlama', getValue: (p) => isProPlan(p), type: 'boolean' },
  { key: 'multiLocation', label: 'Çoklu Lokasyon Desteği', getValue: (p) => isProPlan(p) || !!p.features?.multiLocation, type: 'boolean' },
];

function getPlanDisplayName(plan: SubscriptionPlan): string {
  const name = plan.displayName?.replace(/ - Tier \d/i, '').trim() || plan.name || 'Plan';
  const map: Record<string, string> = {
    'Basic Plan': 'Temel Plan',
    'Premium Plan': 'Premium Plan',
    'Pro Plan': 'Pro Plan',
  };
  return map[name] || name;
}

export default function PlanComparisonTable({ plans, onClose }: PlanComparisonTableProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-base sm:text-xl font-bold text-gray-900">Plan Karşılaştırma</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 p-2 sm:p-4 -webkit-overflow-scrolling-touch">
          <table className="w-full border-collapse text-xs sm:text-sm min-w-[280px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 sm:py-4 px-2 sm:px-4 font-semibold text-gray-900 bg-gray-50 rounded-tl-lg sticky left-0 z-10 min-w-[120px] sm:min-w-[180px]">
                  Özellik
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className="text-center py-2 sm:py-4 px-1 sm:px-4 font-semibold text-gray-900 min-w-[70px] sm:min-w-[100px]"
                  >
                    <span className="block truncate">{getPlanDisplayName(plan)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, idx) => (
                <tr
                  key={row.key}
                  className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 sticky left-0 bg-inherit z-10 text-xs sm:text-sm">
                    <span>{row.label}</span>
                  </td>
                  {plans.map((plan) => {
                    const value = row.getValue(plan);
                    return (
                      <td key={plan.id} className="py-2 sm:py-3 px-1 sm:px-4 text-center">
                        {row.type === 'boolean' ? (
                          value ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-400 flex-shrink-0">
                              <X className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                            </span>
                          )
                        ) : row.type === 'number' ? (
                          <span className="text-gray-700 text-xs sm:text-sm">
                            {value === 0 ? '—' : typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
                          </span>
                        ) : (
                          <span className="text-gray-700 text-xs sm:text-sm truncate block">{String(value)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
