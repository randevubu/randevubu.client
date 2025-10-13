'use client';

import Link from 'next/link';
import { Zap, Calendar, Users, BarChart3, Settings, CreditCard, FileText, Bell, Shield, Building, Star, Heart, Clock, User, Phone, Mail, MapPin, Home, HelpCircle, Info, Warning, Check, AlertTriangle, Ban, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Save, Loader2, Moon, Sun, XCircle, Tag, Plus, Edit, Trash2, RefreshCw, CheckCircle, X, Globe } from 'lucide-react';
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
            <Zap className="w-5 h-5 mr-2 text-[var(--theme-primary)]" />
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
                    <Building className="w-5 h-5 text-white" />
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
                      <CheckCircle className="w-3 h-3 mr-1" />
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
                      <Phone className="w-4 h-4 text-[var(--theme-success)]" />
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
                      <Globe className="w-4 h-4 text-[var(--theme-info)]" />
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
                          <ArrowRight className="w-3 h-3 ml-1" />
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
                      <MapPin className="w-4 h-4 text-[var(--theme-accent)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Adres</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300 font-medium">{business.address || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-warning)]/20 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-warning)]/30">
                      <Clock className="w-4 h-4 text-[var(--theme-warning)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">Zaman Dilimi</label>
                      <p className="text-sm text-[var(--theme-foreground)] transition-colors duration-300 font-medium">{business.timezone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[var(--theme-foregroundSecondary)]/20 rounded-lg flex items-center justify-center mt-0.5 transition-colors duration-300 border border-[var(--theme-foregroundSecondary)]/30">
                      <Calendar className="w-4 h-4 text-[var(--theme-foregroundSecondary)]" />
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
                    <Building className="w-3 h-3 text-[var(--theme-primary)]" />
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
                    <CreditCard className="w-3 h-3 text-[var(--theme-success)]" />
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
              <FileText className="mx-auto h-12 w-12 text-[var(--theme-foregroundMuted)] transition-colors duration-300" />
              <p className="mt-2 text-sm text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Henüz aktivite bulunmuyor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}