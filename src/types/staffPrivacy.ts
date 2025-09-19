export interface StaffPrivacySettings {
  hideStaffNames: boolean;
  staffDisplayMode: 'NAMES' | 'ROLES' | 'GENERIC';
  customStaffLabels: {
    owner: string;
    manager: string;
    staff: string;
    receptionist: string;
  };
}

export interface StaffPrivacySettingsRequest {
  hideStaffNames?: boolean;
  staffDisplayMode?: 'NAMES' | 'ROLES' | 'GENERIC';
  customStaffLabels?: {
    owner?: string;
    manager?: string;
    staff?: string;
    receptionist?: string;
  };
}

export interface PublicStaffMember {
  id: string;
  role: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
  displayName?: string;
}

export interface PublicStaffResponse {
  success: boolean;
  data: {
    staff: PublicStaffMember[];
  };
  message?: string;
}

export type StaffDisplayMode = 'NAMES' | 'ROLES' | 'GENERIC';

export interface StaffDisplayConfig {
  mode: StaffDisplayMode;
  customLabels?: {
    owner: string;
    manager: string;
    staff: string;
    receptionist: string;
  };
}

