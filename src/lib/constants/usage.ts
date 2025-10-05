export const USAGE_COLOR_SCHEMES = {
  blue: {
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-800',
    progress: 'bg-blue-500',
    icon: 'bg-blue-500'
  },
  green: {
    bg: 'from-green-50 to-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
    progress: 'bg-green-500',
    icon: 'bg-green-500'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-800',
    progress: 'bg-purple-500',
    icon: 'bg-purple-500'
  },
  amber: {
    bg: 'from-amber-50 to-amber-100',
    border: 'border-amber-200',
    text: 'text-amber-800',
    progress: 'bg-amber-500',
    icon: 'bg-amber-500'
  },
  red: {
    bg: 'from-red-50 to-red-100',
    border: 'border-red-200',
    text: 'text-red-800',
    progress: 'bg-red-500',
    icon: 'bg-red-500'
  }
} as const;

export const USAGE_ALERT_TYPES = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⚠️',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '🚨',
    titleColor: 'text-red-800',
    textColor: 'text-red-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✅',
    titleColor: 'text-green-800',
    textColor: 'text-green-700'
  }
} as const;

export const USAGE_PROGRESS_CONFIGS = {
  sms: {
    label: 'SMS Kullanımı',
    unit: ' SMS',
    colorScheme: 'blue' as const,
    iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  staff: {
    label: 'Personel Sayısı',
    unit: ' kişi',
    colorScheme: 'green' as const,
    iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
  },
  customers: {
    label: 'Müşteri Sayısı',
    unit: ' müşteri',
    colorScheme: 'purple' as const,
    iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  services: {
    label: 'Hizmet Sayısı',
    unit: ' hizmet',
    colorScheme: 'amber' as const,
    iconPath: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  storage: {
    label: 'Depolama Alanı',
    unit: ' MB',
    colorScheme: 'red' as const,
    iconPath: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4'
  },
  appointments: {
    label: 'Günlük Randevu',
    unit: ' randevu',
    colorScheme: 'green' as const,
    iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z'
  }
} as const;

export const USAGE_ALERT_MESSAGES = {
  smsQuotaWarning: (percentage: number, remaining: number) => 
    `SMS kotanızın %${percentage.toFixed(1)}'ine ulaştınız. ${remaining} SMS hakkınız kaldı.`,
  staffLimitReached: (current: number, limit: number) => 
    `Personel limitinize ulaştınız (${current}/${limit}). Yeni personel eklemek için planınızı yükseltmeniz gerekiyor.`,
  customerLimitWarning: (percentage: number, remaining: number) => 
    `Müşteri limitinizin %${percentage.toFixed(1)}'ine ulaştınız. ${remaining} müşteri daha ekleyebilirsiniz.`,
  storageLimitWarning: (percentage: number, remaining: string) => 
    `Depolama alanınızın %${percentage.toFixed(1)}'ini kullandınız. ${remaining} alan kaldı.`,
  allGood: 'Tüm limitler sağlıklı aralıkta. Plan limitlerinizi verimli kullanıyorsunuz ve büyüme için yeterli alanınız var.'
} as const;

export const USAGE_PAGE_TEXTS = {
  title: 'Kullanım Durumu',
  subtitle: 'Plan limitlerinizi ve kalan kullanımlarınızı takip edin',
  noDataTitle: 'Bu Ay Verisi Henüz Mevcut Değil',
  noDataMessage: 'Bu ay için henüz kullanım verisi toplanmamış. Sistem otomatik olarak veri toplamaya başlayacak ve bu sayfada görüntülenecektir.',
  loadingTitle: 'Kullanım Bilgileri Yükleniyor',
  loadingMessage: 'Lütfen bekleyin...',
  errorTitle: 'Bir Hata Oluştu',
  retryButton: 'Yeniden Dene',
  noDataFoundTitle: 'Kullanım Bilgileri Bulunamadı',
  noDataFoundMessage: 'Aktif bir aboneliğiniz bulunmuyor.',
  accessDeniedTitle: 'Erişim Reddedildi',
  accessDeniedMessage: 'Bu sayfaya erişim yetkiniz bulunmuyor. Kullanım analitikleri sadece işletme sahipleri tarafından görüntülenebilir.',
  backToDashboard: 'Dashboard\'a Dön',
  alertsTitle: 'Uyarılar ve Öneriler',
  summaryTitle: 'Bu Ay Özeti',
  updatePlanButton: 'Planı Güncelle',
  refreshButton: 'Yenile'
} as const;

export const USAGE_STATS_LABELS = {
  smsSent: 'SMS Gönderildi',
  appointmentsCreated: 'Randevu Oluştu',
  newCustomers: 'Yeni Müşteri',
  storage: 'Depolama'
} as const;
