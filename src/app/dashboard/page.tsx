'use client';

import Link from 'next/link';
import { useDashboardBusiness, useDashboardNavigation } from '../../context/DashboardContext';

export default function DashboardPage() {
  const business = useDashboardBusiness();
  const navigationItems = useDashboardNavigation();

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Navigation Cards - Mobile Only */}
      <div className="lg:hidden bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
        <div className="px-4 sm:px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] flex items-center transition-colors duration-300">
            <svg className="w-5 h-5 mr-2 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Hızlı Erişim
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group relative overflow-hidden rounded-lg p-2.5 sm:p-3 transition-all duration-300 hover:scale-105 hover:shadow-md bg-[var(--theme-backgroundSecondary)] border border-[var(--theme-border)] hover:border-[var(--theme-borderSecondary)] min-h-[80px]"
                >
                  {/* Background gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`relative z-10 w-6 h-6 mx-auto mb-2 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>

                  {/* Label */}
                  <div className="relative z-10 text-center">
                    <span className={`text-[10px] leading-tight font-medium ${item.textColor} group-hover:text-[var(--theme-foreground)] transition-colors duration-300`}>
                      {item.name}
                    </span>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-[var(--theme-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Business Details & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a2 2 0 012-2h2a2 2 0 012 2v9m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--theme-foreground)] transition-colors duration-300">{business.name}</h3>
                    <p className="text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">{business.city}, {business.country}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                    business.isActive 
                      ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)] border border-[var(--theme-success)]/30' 
                      : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)] border border-[var(--theme-error)]/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 transition-colors duration-300 ${
                      business.isActive ? 'bg-[var(--theme-success)]' : 'bg-[var(--theme-error)]'
                    }`}></div>
                    {business.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  {business.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/30 transition-colors duration-300">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Doğrulanmış
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">


              {/* Contact & Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[var(--theme-foregroundSecondary)] uppercase tracking-wide mb-3">İletişim Bilgileri</h4>
                  
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-success)]/20 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-success)]/30">
                      <svg className="w-4 h-4 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Telefon</label>
                      {business.phone ? (
                        <a href={`tel:${business.phone}`} className="text-sm text-[var(--theme-success)] hover:text-[var(--theme-success)]/80 hover:underline transition-colors duration-300 font-medium">
                          {business.phone}
                        </a>
                      ) : (
                        <p className="text-sm text-[var(--theme-foregroundMuted)] transition-colors duration-300">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-info)]/20 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-info)]/30">
                      <svg className="w-4 h-4 text-[var(--theme-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Website</label>
                      {business.website ? (
                        <a 
                          href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-[var(--theme-info)] hover:text-[var(--theme-info)]/80 hover:underline inline-flex items-center transition-colors duration-300 font-medium"
                        >
                          {business.website}
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <p className="text-sm text-[var(--theme-foregroundMuted)] transition-colors duration-300">Belirtilmemiş</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[var(--theme-foregroundSecondary)] uppercase tracking-wide mb-3">Konum & Detaylar</h4>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-accent)]/20 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-accent)]/30">
                      <svg className="w-4 h-4 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Adres</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300 font-medium">{business.address || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-warning)]/20 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-warning)]/30">
                      <svg className="w-4 h-4 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Zaman Dilimi</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300 font-medium">{business.timezone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-foregroundSecondary)]/20 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-foregroundSecondary)]/30">
                      <svg className="w-4 h-4 text-[var(--theme-foregroundSecondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Kuruluş Tarihi</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300 font-medium">{new Date(business.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Business Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[var(--theme-foregroundSecondary)] uppercase tracking-wide mb-2">İşletme Detayları</h4>
                
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--theme-primary)]/20 rounded-md flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-primary)]/30">
                    <svg className="w-3 h-3 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-0.5 transition-colors duration-300">İşletme Türü</label>
                    <p className="text-xs text-[var(--theme-foreground)] transition-colors duration-300 font-medium">
                      {business.businessType?.displayName || 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--theme-success)]/20 rounded-md flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-success)]/30">
                    <svg className="w-3 h-3 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-0.5 transition-colors duration-300">Abonelik Durumu</label>
                    <p className="text-xs text-[var(--theme-foreground)] transition-colors duration-300 font-medium">
                      {business.subscription?.status === 'ACTIVE' && 'Aktif'}
                      {business.subscription?.status === 'TRIAL' && 'Deneme Süresi'}
                      {business.subscription?.status === 'PAST_DUE' && 'Ödeme Gecikmiş'}
                      {business.subscription?.status === 'CANCELED' && 'İptal Edildi'}
                      {!business.subscription?.status && 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-[var(--theme-card)] rounded-lg shadow-sm border border-[var(--theme-border)] p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-4 transition-colors duration-300">Son Aktiviteler</h3>
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-[var(--theme-foregroundMuted)] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Henüz aktivite bulunmuyor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}