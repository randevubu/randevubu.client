export const featureTranslations: Record<string, string> = {
  // Core features
  appointment_booking: 'Randevu Alma',
  calendar_management: 'Takvim Yönetimi',
  customer_database: 'Müşteri Veritabanı',
  email_notifications: 'E-posta Bildirimleri',
  sms_notifications: 'SMS Bildirimleri',
  
  // Analytics
  basic_analytics: 'Temel Analitik',
  advanced_analytics: 'Gelişmiş Analitik',
  premium_analytics: 'Premium Analitik',
  enterprise_analytics: 'Kurumsal Analitik',
  
  // Business management
  business_hours: 'Çalışma Saatleri',
  staff_management: 'Personel Yönetimi',
  service_management: 'Hizmet Yönetimi',
  custom_branding: 'Özel Markalama',
  business_closure_management: 'İşletme Kapatma Yönetimi',
  
  // Advanced features
  multi_location: 'Çoklu Lokasyon',
  api_access: 'API Erişimi',
  priority_support: 'Öncelikli Destek',
  custom_integrations: 'Özel Entegrasyonlar',
  dedicated_support: 'Özel Destek',
  white_label: 'Beyaz Etiket',
  advanced_security: 'Gelişmiş Güvenlik',
  franchise_management: 'Franchise Yönetimi',
  
  // Storage and tracking
  s3_image_storage: 'S3 Resim Depolama',
  user_behavior_tracking: 'Kullanıcı Davranış Takibi',
  advanced_reporting: 'Gelişmiş Raporlama',
  
  // Fallback for unknown features
  default: 'Özellik'
};

export const getFeatureTranslation = (feature: string): string => {
  return featureTranslations[feature] || feature.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
};
