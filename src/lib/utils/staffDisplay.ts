import { StaffPrivacySettings, PublicStaffMember, StaffDisplayMode } from '../../types/staffPrivacy';

/**
 * Get the display name for a staff member based on privacy settings
 */
export function getStaffDisplayName(
  member: PublicStaffMember, 
  settings?: StaffPrivacySettings
): string {
  // If displayName is provided (privacy enabled), use it
  if (member.displayName) {
    return member.displayName;
  }
  
  // If privacy settings are not provided or names are not hidden, use actual name
  if (!settings || !settings.hideStaffNames) {
    return getActualStaffName(member);
  }
  
  // Privacy is enabled, determine display based on mode
  return getPrivacyDisplayName(member, settings);
}

/**
 * Get the actual staff name from user data
 */
export function getActualStaffName(member: PublicStaffMember): string {
  if (member.user.firstName && member.user.lastName) {
    return `${member.user.firstName} ${member.user.lastName}`;
  }
  
  return member.user.firstName || 'Staff Member';
}

/**
 * Get the privacy-aware display name
 */
function getPrivacyDisplayName(member: PublicStaffMember, settings: StaffPrivacySettings): string {
  switch (settings.staffDisplayMode) {
    case 'ROLES':
      return getRoleDisplayName(member.role);
    
    case 'GENERIC':
      return getCustomLabelForRole(member.role, settings.customStaffLabels);
    
    case 'NAMES':
    default:
      return getActualStaffName(member);
  }
}

/**
 * Get the display name for a role
 */
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    'OWNER': 'Sahip',
    'MANAGER': 'Müdür',
    'STAFF': 'Personel',
    'RECEPTIONIST': 'Resepsiyonist',
  };
  
  return roleNames[role] || 'Personel';
}

/**
 * Get custom label for a role
 */
function getCustomLabelForRole(role: string, customLabels: StaffPrivacySettings['customStaffLabels']): string {
  const roleKey = role.toLowerCase() as keyof typeof customLabels;
  return customLabels[roleKey] || 'Staff';
}

/**
 * Get role display name for UI
 */
export function getRoleDisplayNameForUI(role: string): string {
  const roleNames: Record<string, string> = {
    'OWNER': 'Sahip',
    'MANAGER': 'Müdür',
    'STAFF': 'Personel',
    'RECEPTIONIST': 'Resepsiyonist',
  };
  
  return roleNames[role] || 'Personel';
}

/**
 * Validate custom staff labels
 */
export function validateCustomLabels(labels: StaffPrivacySettings['customStaffLabels']): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  Object.entries(labels).forEach(([role, label]) => {
    if (!label || label.trim() === '') {
      errors[role] = `${getRoleDisplayNameForUI(role.toUpperCase())} etiketi boş olamaz`;
    } else if (label.length > 50) {
      errors[role] = `${getRoleDisplayNameForUI(role.toUpperCase())} etiketi 50 karakterden uzun olamaz`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Get preview display names for all roles
 */
export function getPreviewDisplayNames(settings: StaffPrivacySettings): Array<{
  role: string;
  roleDisplayName: string;
  displayName: string;
}> {
  const roles = ['OWNER', 'MANAGER', 'STAFF', 'RECEPTIONIST'];
  
  return roles.map(role => {
    let displayName: string;
    
    if (settings.staffDisplayMode === 'ROLES') {
      // For ROLES mode, use Turkish role names
      displayName = getRoleDisplayNameForUI(role);
    } else if (settings.staffDisplayMode === 'GENERIC') {
      // For GENERIC mode, use custom labels
      displayName = getCustomLabelForRole(role, settings.customStaffLabels);
    } else {
      // For NAMES mode, show actual names (but this shouldn't happen in preview)
      displayName = 'İsim Görünecek';
    }
    
    return {
      role,
      roleDisplayName: getRoleDisplayNameForUI(role),
      displayName
    };
  });
}

/**
 * Check if staff privacy is enabled
 */
export function isStaffPrivacyEnabled(settings?: StaffPrivacySettings): boolean {
  return settings?.hideStaffNames === true;
}

/**
 * Get staff display mode label
 */
export function getDisplayModeLabel(mode: StaffDisplayMode): string {
  const labels: Record<StaffDisplayMode, string> = {
    'NAMES': 'İsimler',
    'ROLES': 'Roller',
    'GENERIC': 'Özel Etiketler'
  };
  
  return labels[mode];
}
