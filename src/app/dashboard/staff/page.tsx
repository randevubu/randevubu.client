'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { businessService } from '../../../lib/services/business';
import { staffService, StaffWithUser, StaffInviteRequest, StaffInviteVerificationRequest, StaffRole } from '../../../lib/services/staff';
import { canViewBusinessStats } from '../../../lib/utils/permissions';
import { handleApiError } from '../../../lib/utils/toast';
import toast from 'react-hot-toast';

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  // Invite form states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'STAFF' as StaffRole,
    permissions: {}
  });
  const [isInviting, setIsInviting] = useState(false);
  
  // Verification states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingInvite, setPendingInvite] = useState<StaffInviteRequest | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Details modal states
  const [selectedStaff, setSelectedStaff] = useState<StaffWithUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user && canViewBusinessStats(user)) {
      loadBusinessData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      const businessResponse = await businessService.getMyBusiness();
      if (businessResponse.success && businessResponse.data?.businesses?.[0]) {
        const business = businessResponse.data.businesses[0];
        setBusinessId(business.id);
        await loadStaff(business.id);
      }
    } catch (error) {
      console.error('Failed to load business data:', error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaff = async (businessId: string) => {
    try {
      const response = await staffService.getBusinessStaff(businessId, true);
      if (response.success && response.data?.staff && Array.isArray(response.data.staff)) {
        setStaff(response.data.staff);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
      handleApiError(error);
      setStaff([]);
    }
  };

  const handleInviteStaff = async () => {
    if (!businessId) return;

    const inviteData: StaffInviteRequest = {
      businessId,
      ...inviteForm
    };

    try {
      setIsInviting(true);
      const response = await staffService.inviteStaff(inviteData);
      
      if (response.success) {
        setPendingInvite(inviteData);
        setShowInviteModal(false);
        setShowVerificationModal(true);
        toast.success('SMS kodu gönderildi!');
      }
    } catch (error) {
      console.error('Failed to invite staff:', error);
      handleApiError(error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleVerifyInvitation = async () => {
    if (!pendingInvite || !verificationCode) return;

    try {
      setIsVerifying(true);
      const verificationData: StaffInviteVerificationRequest = {
        ...pendingInvite,
        verificationCode
      };

      const response = await staffService.verifyStaffInvitation(verificationData);
      
      if (response.success) {
        toast.success('Personel başarıyla davet edildi!');
        setShowVerificationModal(false);
        setVerificationCode('');
        setPendingInvite(null);
        resetInviteForm();
        
        if (businessId) {
          await loadStaff(businessId);
        }
      }
    } catch (error) {
      console.error('Failed to verify invitation:', error);
      handleApiError(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetInviteForm = () => {
    setInviteForm({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'STAFF',
      permissions: {}
    });
  };

  const handleStaffClick = (staffMember: StaffWithUser) => {
    setSelectedStaff(staffMember);
    setShowDetailsModal(true);
  };

  const handleUpdateStaffStatus = async (staffId: string, isActive: boolean) => {
    try {
      const response = await staffService.updateStaff(staffId, { isActive });
      if (response.success) {
        toast.success(isActive ? 'Personel aktifleştirildi' : 'Personel devre dışı bırakıldı');
        if (businessId) {
          await loadStaff(businessId);
        }
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Failed to update staff status:', error);
      handleApiError(error);
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm('Bu personeli tamamen silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await staffService.removeStaff(staffId);
      if (response.success) {
        toast.success('Personel başarıyla silindi');
        if (businessId) {
          await loadStaff(businessId);
        }
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Failed to remove staff:', error);
      handleApiError(error);
    }
  };

  if (!canViewBusinessStats(user)) {
    return (
      <div className="p-3 sm:p-6 bg-[var(--theme-background)] transition-colors duration-300">
        <div className="text-center py-8 sm:py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[var(--theme-error)]/20 mb-3 sm:mb-4">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-2">Erişim Reddedildi</h3>
          <p className="text-sm sm:text-base text-[var(--theme-foregroundSecondary)]">Personel yönetimini görüntülemek için yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 bg-[var(--theme-background)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[var(--theme-card)] rounded-lg sm:rounded-xl shadow-sm border border-[var(--theme-border)] overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="bg-[var(--theme-primary)] px-3 py-3 sm:px-6 sm:py-4 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--theme-card)]/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Personel Yönetimi</h1>
                  <p className="text-white/70 text-xs sm:text-sm hidden sm:block">İşletmeniz için personel ekleyin ve yönetin</p>
                </div>
              </div>
              <div className="text-white text-right">
                <div className="text-xl sm:text-2xl font-bold">{Array.isArray(staff) ? staff.length : 0}</div>
                <div className="text-xs sm:text-sm text-white/70">Personel</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-3 py-2 sm:px-6 sm:py-3 bg-[var(--theme-backgroundSecondary)] border-b border-[var(--theme-border)] transition-colors duration-300">
            <div className="flex justify-between items-center">
              <div className="text-sm text-[var(--theme-foregroundSecondary)]">
                {Array.isArray(staff) ? staff.filter(s => s.isActive).length : 0} aktif personel
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-3 sm:px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-primary)]/90 transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Personel Davet Et</span>
                <span className="sm:hidden">Davet Et</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-3 sm:px-6 sm:py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base text-[var(--theme-foregroundSecondary)]">Personeller yükleniyor...</span>
                </div>
              </div>
            ) : !Array.isArray(staff) || staff.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-3 sm:mb-4">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)] mb-2">Henüz personel yok</h3>
                <p className="text-sm sm:text-base text-[var(--theme-foregroundSecondary)] mb-4">İşletmenize personel davet ederek işlerinizi paylaşabilirsiniz.</p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-primary)]/90 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  İlk Personelinizi Davet Edin
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {Array.isArray(staff) && staff.map((staffMember) => (
                  <div
                    key={staffMember.id}
                    className={`bg-[var(--theme-card)] border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      !staffMember.isActive ? 'opacity-60 border-gray-300' : 'border-[var(--theme-border)]'
                    }`}
                    onClick={() => handleStaffClick(staffMember)}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        {staffMember.user.avatar ? (
                          <img
                            src={staffMember.user.avatar}
                            alt={`${staffMember.user.firstName} ${staffMember.user.lastName}`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-primary)]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-[var(--theme-foreground)] truncate">
                            {staffMember.user.firstName} {staffMember.user.lastName}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              staffMember.role === 'OWNER' 
                                ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                                : staffMember.role === 'MANAGER'
                                ? 'bg-[var(--theme-accent)]/20 text-[var(--theme-accent)]'
                                : 'bg-[var(--theme-info)]/20 text-[var(--theme-info)]'
                            }`}>
                              {staffMember.role === 'OWNER' ? 'Sahip' : 
                               staffMember.role === 'MANAGER' ? 'Yönetici' : 'Personel'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              staffMember.isActive 
                                ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                                : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                            }`}>
                              {staffMember.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center text-xs text-[var(--theme-foregroundSecondary)]">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="truncate">{staffMember.user.phoneNumber}</span>
                          </div>
                          
                          {staffMember.joinedAt ? (
                            <div className="flex items-center text-xs text-[var(--theme-foregroundSecondary)]">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v16z" />
                              </svg>
                              <span className="truncate">Katıldı: {new Date(staffMember.joinedAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-xs text-[var(--theme-warning)]">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="truncate">Davet Bekleniyor</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Staff Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--theme-card)] rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-[var(--theme-border)]">
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Personel Davet Et</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                    placeholder="Personelin adı"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                    placeholder="Personelin soyadı"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  value={inviteForm.phoneNumber}
                  onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                  placeholder="+905551234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                  Rol *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as StaffRole })}
                  className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
                >
                  <option value="STAFF">Personel</option>
                  <option value="MANAGER">Yönetici</option>
                  <option value="OWNER">Sahip</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-t border-[var(--theme-border)] flex items-center justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  resetInviteForm();
                }}
                disabled={isInviting}
                className="px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={handleInviteStaff}
                disabled={isInviting || !inviteForm.firstName || !inviteForm.lastName || !inviteForm.phoneNumber}
                className="inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Davet Gönderiliyor...
                  </>
                ) : (
                  'Davet Et'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--theme-card)] rounded-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-[var(--theme-border)]">
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">SMS Doğrulaması</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-4">
                  {pendingInvite?.phoneNumber} numarasına gönderilen doğrulama kodunu girin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                  Doğrulama Kodu *
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent text-center text-lg tracking-wider"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-[var(--theme-backgroundSecondary)] border-t border-[var(--theme-border)] flex items-center justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                  setPendingInvite(null);
                }}
                disabled={isVerifying}
                className="px-4 py-2 text-sm font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </button>
              <button
                onClick={handleVerifyInvitation}
                disabled={isVerifying || !verificationCode}
                className="inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Doğrulanıyor...
                  </>
                ) : (
                  'Doğrula'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Details Modal */}
      {showDetailsModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-[var(--theme-card)] rounded-t-xl sm:rounded-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--theme-card)] border-b border-[var(--theme-border)] px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--theme-foreground)]">Personel Detayları</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-[var(--theme-backgroundSecondary)] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Staff Header */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {selectedStaff.user.avatar ? (
                    <img
                      src={selectedStaff.user.avatar}
                      alt={`${selectedStaff.user.firstName} ${selectedStaff.user.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[var(--theme-primary)]/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--theme-primary)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[var(--theme-foreground)]">
                    {selectedStaff.user.firstName} {selectedStaff.user.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedStaff.role === 'OWNER' 
                        ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]'
                        : selectedStaff.role === 'MANAGER'
                        ? 'bg-[var(--theme-accent)]/20 text-[var(--theme-accent)]'
                        : 'bg-[var(--theme-info)]/20 text-[var(--theme-info)]'
                    }`}>
                      {selectedStaff.role === 'OWNER' ? 'Sahip' : 
                       selectedStaff.role === 'MANAGER' ? 'Yönetici' : 'Personel'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedStaff.isActive 
                        ? 'bg-[var(--theme-success)]/20 text-[var(--theme-success)]' 
                        : 'bg-[var(--theme-error)]/20 text-[var(--theme-error)]'
                    }`}>
                      {selectedStaff.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateStaffStatus(selectedStaff.id, !selectedStaff.isActive)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    selectedStaff.isActive
                      ? 'bg-[var(--theme-warning)] text-white hover:bg-[var(--theme-warning)]/90'
                      : 'bg-[var(--theme-success)] text-white hover:bg-[var(--theme-success)]/90'
                  }`}
                >
                  {selectedStaff.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                </button>
                
                {selectedStaff.role !== 'OWNER' && (
                  <button
                    onClick={() => handleRemoveStaff(selectedStaff.id)}
                    className="inline-flex items-center px-4 py-2 bg-[var(--theme-error)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--theme-error)]/90 transition-colors"
                  >
                    Kaldır
                  </button>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-4">
                <h4 className="text-lg font-medium text-[var(--theme-foreground)] mb-4">İletişim Bilgileri</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-[var(--theme-foreground)]">{selectedStaff.user.phoneNumber}</span>
                  </div>

                </div>
              </div>

              {/* Staff Information */}
              <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-4">
                <h4 className="text-lg font-medium text-[var(--theme-foreground)] mb-4">Personel Bilgileri</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-[var(--theme-foregroundSecondary)]">Oluşturulma Tarihi: </span>
                    <span className="text-[var(--theme-foreground)]">{new Date(selectedStaff.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {selectedStaff.joinedAt ? (
                    <div>
                      <span className="font-medium text-[var(--theme-foregroundSecondary)]">Katılım Tarihi: </span>
                      <span className="text-[var(--theme-foreground)]">{new Date(selectedStaff.joinedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-medium text-[var(--theme-success)]">Durum: </span>
                      <span className="text-[var(--theme-success)]">Katılmış</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-[var(--theme-foregroundSecondary)]">Son Güncelleme: </span>
                    <span className="text-[var(--theme-foreground)]">{new Date(selectedStaff.updatedAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}