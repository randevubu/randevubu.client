'use client';

import { ArrowRight, Building, Calendar, CheckCircle, Clock, CreditCard, Globe, MapPin, Phone, ExternalLink, Calendar as CalendarIcon, CreditCard as CreditCardIcon } from 'lucide-react';
import { useDashboardBusiness, useDashboardNavigation } from '../../context/DashboardContext';
import { getBusinessPublicUrl } from '../../lib/utils/businessUrl';
import { MobileNavigationSidebar } from '../../components/layout';


export default function DashboardPage() {
  const business = useDashboardBusiness();
  const navigationItems = useDashboardNavigation();

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Mobile Navigation Sidebar */}
      <MobileNavigationSidebar navigationItems={navigationItems} />

      {/* Business Details */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div>
          <div className="bg-[var(--theme-card)] rounded-xl shadow-lg border border-[var(--theme-border)] overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-6 bg-gradient-to-r from-[var(--theme-backgroundSecondary)] to-[var(--theme-background)] border-b border-[var(--theme-border)] transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-xl flex items-center justify-center shadow-lg ring-2 ring-[var(--theme-primary)]/20">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--theme-foreground)] transition-colors duration-300">{business.name}</h3>
                    <p className="text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {business.city}, {business.country}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm ${
                    business.isActive 
                      ? 'bg-gradient-to-r from-[var(--theme-success)]/20 to-[var(--theme-success)]/10 text-[var(--theme-success)] border border-[var(--theme-success)]/30' 
                      : 'bg-gradient-to-r from-[var(--theme-error)]/20 to-[var(--theme-error)]/10 text-[var(--theme-error)] border border-[var(--theme-error)]/30'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full mr-2 transition-colors duration-300 ${
                      business.isActive ? 'bg-[var(--theme-success)]' : 'bg-[var(--theme-error)]'
                    }`}></div>
                    {business.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  {business.isVerified && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[var(--theme-primary)]/20 to-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30 transition-all duration-300 shadow-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Doğrulanmış
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              {/* Contact & Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full"></div>
                    <h4 className="text-lg font-bold text-[var(--theme-foreground)]">İletişim Bilgileri</h4>
                  </div>
                  
                  
                  <div className="flex items-start space-x-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-success)]/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--theme-success)]/20 to-[var(--theme-success)]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[var(--theme-success)]/30">
                      <Phone className="w-5 h-5 text-[var(--theme-success)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">Telefon</label>
                      {business.phone ? (
                        <a href={`tel:${business.phone}`} className="text-base text-[var(--theme-success)] hover:text-[var(--theme-success)]/80 hover:underline transition-colors duration-300 font-semibold">
                          {business.phone}
                        </a>
                      ) : (
                        <p className="text-base text-[var(--theme-foregroundMuted)] transition-colors duration-300">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-info)]/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--theme-info)]/20 to-[var(--theme-info)]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[var(--theme-info)]/30">
                      <Globe className="w-5 h-5 text-[var(--theme-info)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">Website</label>
                      {business.slug ? (
                        <a 
                          href={getBusinessPublicUrl(business.slug)} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-base text-[var(--theme-info)] hover:text-[var(--theme-info)]/80 hover:underline inline-flex items-center transition-colors duration-300 font-semibold"
                        >
                          {getBusinessPublicUrl(business.slug)}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      ) : business.website ? (
                        <a 
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-base text-[var(--theme-info)] hover:text-[var(--theme-info)]/80 hover:underline inline-flex items-center transition-colors duration-300 font-semibold"
                        >
                          {business.website}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      ) : (
                        <p className="text-base text-[var(--theme-foregroundMuted)] transition-colors duration-300">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-[var(--theme-accent)] to-[var(--theme-primary)] rounded-full"></div>
                    <h4 className="text-lg font-bold text-[var(--theme-foreground)]">Konum & Detaylar</h4>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-accent)]/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--theme-accent)]/20 to-[var(--theme-accent)]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[var(--theme-accent)]/30">
                      <MapPin className="w-5 h-5 text-[var(--theme-accent)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">Adres</label>
                      <p className="text-base text-[var(--theme-foreground)] transition-colors duration-300 font-semibold">{business.address || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-warning)]/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--theme-warning)]/20 to-[var(--theme-warning)]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[var(--theme-warning)]/30">
                      <Clock className="w-5 h-5 text-[var(--theme-warning)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">Zaman Dilimi</label>
                      <p className="text-base text-[var(--theme-foreground)] transition-colors duration-300 font-semibold">{business.timezone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-foregroundSecondary)]/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--theme-foregroundSecondary)]/20 to-[var(--theme-foregroundSecondary)]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[var(--theme-foregroundSecondary)]/30">
                      <CalendarIcon className="w-5 h-5 text-[var(--theme-foregroundSecondary)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">Kuruluş Tarihi</label>
                      <p className="text-base text-[var(--theme-foreground)] transition-colors duration-300 font-semibold">{new Date(business.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Business Information */}
              <div className="mt-8 pt-6 border-t border-[var(--theme-border)]">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full"></div>
                  <h4 className="text-lg font-bold text-[var(--theme-foreground)]">İşletme Detayları</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-primary)]/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)]/20 to-[var(--theme-primary)]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[var(--theme-primary)]/30">
                      <Building className="w-5 h-5 text-[var(--theme-primary)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">İşletme Türü</label>
                      <p className="text-base text-[var(--theme-foreground)] transition-colors duration-300 font-semibold">
                        {business.businessType?.displayName || 'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-[var(--theme-backgroundSecondary)] rounded-xl border border-[var(--theme-border)] hover:border-[var(--theme-success)]/30 transition-all duration-300 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--theme-success)]/20 to-[var(--theme-success)]/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-[var(--theme-success)]/30">
                      <CreditCardIcon className="w-5 h-5 text-[var(--theme-success)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">Abonelik Durumu</label>
                      <p className="text-base text-[var(--theme-foreground)] transition-colors duration-300 font-semibold">
                        {business.subscription?.status === 'TRIAL' && 'Deneme Süresi'}
                        {business.subscription?.status === 'PAST_DUE' && 'Ödeme Gecikmiş'}
                        {business.subscription?.status === 'CANCELED' && 'İptal Edildi'}
                        {business.subscription?.status === 'ACTIVE' && 'Aktif Abonelik'}
                        {!business.subscription?.status && 'Belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}