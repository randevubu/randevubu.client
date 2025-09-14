'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { userService } from '@/src/lib/services/user';
import { appointmentService } from '@/src/lib/services/appointments';
import { canViewBusinessStats, isCustomer, getPrimaryRole } from '@/src/lib/utils/permissions';
import { useErrorTranslation } from '@/src/lib/hooks/useErrorTranslation';
import { validateField, validateProfileForm, UserProfileUpdateData } from '@/src/lib/validation/profile';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { translateValidationError } = useErrorTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    timezone: '',
    language: '',
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0
  });
  const profileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'tr',
      });
      
      // Fetch appointments if user is a customer
      if (isCustomer(user)) {
        fetchAppointments();
      }
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMyAppointments();
      if (response.success && response.data) {
        // Handle both possible response formats
        const appointmentList = Array.isArray(response.data) ? response.data : (response.data.appointments || []);
        setAppointments(appointmentList);
        
        // Calculate stats
        const now = new Date();
        const upcoming = appointmentList.filter(apt => {
          const aptDate = new Date(apt.startTime || apt.date);
          return aptDate >= now && (apt.status === 'PENDING' || apt.status === 'CONFIRMED');
        }).length;
        
        const completed = appointmentList.filter(apt => 
          apt.status === 'COMPLETED'
        ).length;
        
        setAppointmentStats({
          total: appointmentList.length,
          upcoming,
          completed
        });
      }
    } catch (error) {
      toast.error('Randevular yüklenirken bir hata oluştu');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear any existing error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validate field on blur
    const fieldError = validateField(name as keyof UserProfileUpdateData, value);
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };


  const handleSave = async () => {
    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    // Client-side validation first
    const validation = validateProfileForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      toast.error('Lütfen form hatalarını düzeltin');
      return;
    }
    
    try {
      await userService.updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
      toast.success('Profil başarıyla güncellendi!');
    } catch (error: any) {
      // Handle API validation errors (fallback)
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        
        if (apiError.code === 'VALIDATION_ERROR' && apiError.details?.field) {
          // Translate validation error to Turkish
          const translatedError = translateValidationError(apiError);
          
          if (translatedError) {
            setErrors({
              [translatedError.field]: translatedError.message
            });
          } else {
            setErrors({
              [apiError.details.field]: apiError.message
            });
          }
        } else {
          // General error
          toast.error(apiError.message || 'Profil güncellenirken bir hata oluştu');
        }
      } else {
        toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to save form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, handleSave]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/5 via-[var(--theme-background)] to-[var(--theme-accent)]/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
        <div className="bg-[var(--theme-card)]/80 backdrop-blur-xl rounded-2xl shadow-lg border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)] px-4 sm:px-6 py-6 sm:py-8 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-16 sm:h-16 bg-[var(--theme-primaryForeground)]/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 sm:w-8 sm:h-8 text-[var(--theme-primaryForeground)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-xl font-bold text-[var(--theme-primaryForeground)] mb-1">
                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Kullanıcı' : 'Kullanıcı'}
                </h1>
                <p className="text-[var(--theme-primaryForeground)]/80 text-base sm:text-sm font-medium mb-1">
                  {getPrimaryRole(user)}
                </p>
                <p className="text-[var(--theme-primaryForeground)]/70 text-sm mb-3">
                  {user?.phoneNumber}
                </p>
                <div className="flex justify-center sm:justify-start">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                    user?.isActive 
                      ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                      : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                  } transition-colors duration-300 shadow-sm`}>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {user?.isActive ? 'Aktif Hesap' : 'Pasif Hesap'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div 
            ref={profileContainerRef}
            className="px-4 sm:px-6 py-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
              <h2 className="text-xl sm:text-lg font-bold text-[var(--theme-foreground)] transition-colors duration-300 text-center sm:text-left">
                Profil Bilgileri
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
                    Adınız
                  </label>
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={isEditing ? formData.firstName : (user?.firstName || '')}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      onFocus={() => setIsEditing(true)}
                      readOnly={!isEditing}
                      className={`w-full px-4 py-3 text-base border-2 ${
                        errors.firstName ? 'border-[var(--theme-error)] focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]' : 
                        isEditing ? 'border-[var(--theme-border)] focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)]' :
                        'border-[var(--theme-border)] bg-[var(--theme-backgroundSecondary)] cursor-pointer hover:bg-[var(--theme-backgroundTertiary)]'
                      } ${isEditing ? 'bg-[var(--theme-card)]' : 'bg-[var(--theme-backgroundSecondary)]'} text-[var(--theme-foreground)] rounded-xl focus:ring-2 transition-all duration-300`}
                      placeholder={isEditing ? "Adınız" : (user?.firstName || 'Belirtilmemiş')}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-[var(--theme-error)] flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
                    Soyadı
                  </label>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={isEditing ? formData.lastName : (user?.lastName || '')}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      onFocus={() => setIsEditing(true)}
                      readOnly={!isEditing}
                      className={`w-full px-4 py-3 text-base border-2 ${
                        errors.lastName ? 'border-[var(--theme-error)] focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]' : 
                        isEditing ? 'border-[var(--theme-border)] focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)]' :
                        'border-[var(--theme-border)] bg-[var(--theme-backgroundSecondary)] cursor-pointer hover:bg-[var(--theme-backgroundTertiary)]'
                      } ${isEditing ? 'bg-[var(--theme-card)]' : 'bg-[var(--theme-backgroundSecondary)]'} text-[var(--theme-foreground)] rounded-xl focus:ring-2 transition-all duration-300`}
                      placeholder={isEditing ? "Soyadınız" : (user?.lastName || 'Belirtilmemiş')}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-[var(--theme-error)] flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
                    Telefon Numarası
                  </label>
                  <div className="px-4 py-3 text-base bg-[var(--theme-backgroundSecondary)] rounded-xl text-[var(--theme-foregroundSecondary)] transition-colors duration-300 border border-[var(--theme-border)] flex items-center justify-between">
                    <span className="font-medium">{user?.phoneNumber}</span>
                    <span className="text-xs text-[var(--theme-foregroundMuted)] bg-[var(--theme-warning)]/10 px-2 py-1 rounded-full">
                      Değiştirilemez
                    </span>
                  </div>
                </div>
              </div>

              {/* User Settings */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--theme-foregroundSecondary)] mb-2 transition-colors duration-300">
                    Zaman Dilimi
                  </label>
                  <div>
                    <select
                      name="timezone"
                      value={isEditing ? formData.timezone : (user?.timezone || 'UTC')}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      onFocus={() => setIsEditing(true)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 text-base border-2 ${
                        errors.timezone ? 'border-[var(--theme-error)] focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]' : 
                        isEditing ? 'border-[var(--theme-border)] focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)]' :
                        'border-[var(--theme-border)] bg-[var(--theme-backgroundSecondary)] cursor-pointer hover:bg-[var(--theme-backgroundTertiary)]'
                      } ${isEditing ? 'bg-[var(--theme-card)]' : 'bg-[var(--theme-backgroundSecondary)]'} text-[var(--theme-foreground)] rounded-xl focus:ring-2 transition-all duration-300 ${!isEditing ? 'cursor-pointer' : ''}`}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                      <option value="Europe/London">Londra (GMT+0)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                    </select>
                    {errors.timezone && (
                      <p className="mt-1 text-sm text-[var(--theme-error)] flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.timezone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">
                    Dil
                  </label>
                  <div>
                    <select
                      name="language"
                      value={isEditing ? formData.language : (user?.language || 'tr')}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      onFocus={() => setIsEditing(true)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 text-sm border ${
                        errors.language ? 'border-[var(--theme-error)] focus:ring-[var(--theme-error)]' : 
                        isEditing ? 'border-[var(--theme-border)] focus:ring-[var(--theme-primary)]' :
                        'border-[var(--theme-border)] bg-[var(--theme-backgroundSecondary)] cursor-pointer hover:bg-[var(--theme-backgroundTertiary)]'
                      } ${isEditing ? 'bg-[var(--theme-card)]' : 'bg-[var(--theme-backgroundSecondary)]'} text-[var(--theme-foreground)] rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300 ${!isEditing ? 'cursor-pointer' : ''}`}
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                    {errors.language && (
                      <p className="mt-1 text-sm text-[var(--theme-error)] flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.language}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">
                    Hesap Durumu
                  </label>
                  <div className="px-3 py-2 text-sm bg-[var(--theme-backgroundSecondary)] rounded-lg text-[var(--theme-foreground)] transition-colors duration-300">
                    {user?.isActive ? (
                      <span className="text-[var(--theme-success)] font-semibold transition-colors duration-300">Aktif</span>
                    ) : (
                      <span className="text-[var(--theme-error)] font-semibold transition-colors duration-300">Pasif</span>
                    )}
                    {user?.isVerified && (
                      <span className="ml-2 text-xs bg-[var(--theme-success)]/20 text-[var(--theme-success)] px-2 py-1 rounded-full transition-colors duration-300">
                        Doğrulanmış
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information - Full Width Sections */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Roles Section */}
              <div>
                <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">
                  Roller
                </label>
                <div className="px-3 py-2 text-sm bg-[var(--theme-backgroundSecondary)] rounded-lg text-[var(--theme-foreground)] transition-colors duration-300">
                  {user?.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] transition-colors duration-300"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15a24.98 24.98 0 01-8-1.308z" />
                          </svg>
                          {role.displayName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--theme-foregroundMuted)] transition-colors duration-300">Henüz rol atanmamış</span>
                  )}
                </div>
              </div>

              {/* Account Dates */}
              <div>
                <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-1 transition-colors duration-300">
                  Hesap Bilgileri
                </label>
                <div className="px-3 py-2 text-sm bg-[var(--theme-backgroundSecondary)] rounded-lg text-[var(--theme-foreground)] space-y-1 transition-colors duration-300">
                  {user?.createdAt && (
                    <div className="flex items-center text-xs">
                      <svg className="w-3 h-3 mr-2 text-[var(--theme-foregroundMuted)] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Oluşturma:</span>
                      <span className="ml-1 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {user?.lastLoginAt && (
                    <div className="flex items-center text-xs">
                      <svg className="w-3 h-3 mr-2 text-[var(--theme-foregroundMuted)] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Son Giriş:</span>
                      <span className="ml-1 font-medium">
                        {new Date(user.lastLoginAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm border border-[var(--theme-border)] text-[var(--theme-foregroundSecondary)] rounded-lg font-semibold hover:bg-[var(--theme-backgroundSecondary)] transition-all duration-300"
                  disabled={isLoading}
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            )}
          </div>

          {/* Statistics Section - Only for business users */}
          {canViewBusinessStats(user) && (
            <div className="bg-[var(--theme-backgroundSecondary)] px-6 py-4 transition-colors duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--theme-foreground)] transition-colors duration-300">İstatistikler</h3>
                <a href="/dashboard" className="text-xs text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium transition-colors duration-300">
                  Dashboard →
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--theme-primary)] transition-colors duration-300">0</div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Toplam Randevu</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--theme-success)] transition-colors duration-300">0</div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Aktif Müşteri</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--theme-accent)] transition-colors duration-300">0</div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Bu Ay</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--theme-warning)] transition-colors duration-300">₺0</div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Gelir</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Customer-specific section */}
          {isCustomer(user) && (
            <div className="bg-[var(--theme-primary)]/10 px-6 py-4 transition-colors duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--theme-foreground)] transition-colors duration-300">Randevularım</h3>
                <a href="/appointments" className="text-xs text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium transition-colors duration-300">
                  Tümünü Gör →
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--theme-primary)] transition-colors duration-300">{appointmentStats.total}</div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Toplam Randevu</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--theme-success)] transition-colors duration-300">{appointmentStats.upcoming}</div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Yaklaşan</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--theme-accent)] transition-colors duration-300">{appointmentStats.completed}</div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] transition-colors duration-300">Tamamlanan</div>
                </div>
              </div>
              
              {/* Recent Appointments List */}
              {appointments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-[var(--theme-foreground)] mb-3">Son Randevular</h4>
                  <div className="space-y-2">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="bg-[var(--theme-card)] rounded-lg p-3 border border-[var(--theme-border)]">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-[var(--theme-foreground)]">
                              {appointment.service?.name || 'Hizmet'}
                            </div>
                            <div className="text-xs text-[var(--theme-foregroundSecondary)]">
                              {new Date(appointment.date).toLocaleDateString('tr-TR')} - {new Date(appointment.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {appointment.business && (
                              <div className="text-xs text-[var(--theme-foregroundMuted)]">
                                {appointment.business.name}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            appointment.status === 'COMPLETED' ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' :
                            appointment.status === 'CONFIRMED' ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]' :
                            appointment.status === 'PENDING' ? 'bg-[var(--theme-warning)]/20 text-[var(--theme-warning)]' :
                            'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                          }`}>
                            {appointment.status === 'COMPLETED' ? 'Tamamlandı' :
                             appointment.status === 'CONFIRMED' ? 'Onaylandı' :
                             appointment.status === 'PENDING' ? 'Bekliyor' :
                             appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {appointments.length > 3 && (
                    <div className="mt-3 text-center">
                      <a href="/appointments" className="text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium">
                        Tüm Randevuları Gör ({appointments.length})
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}