export interface Staff {
  id: string;
  businessId: string;
  userId: string;
  role: StaffRole;
  permissions: Record<string, any>;
  isActive: boolean;
  joinedAt?: string;
  leftAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffInviteRequest {
  businessId: string;
  phoneNumber: string;
  role: StaffRole;
  permissions: Record<string, any>;
  firstName: string;
  lastName: string;
}

export interface StaffInviteVerificationRequest {
  businessId: string;
  phoneNumber: string;
  verificationCode: string;
  role: StaffRole;
  permissions: Record<string, any>;
  firstName: string;
  lastName: string;
}

export interface StaffUpdateRequest {
  role?: StaffRole;
  permissions?: Record<string, any>;
  isActive?: boolean;
}

export type StaffRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface StaffWithUser extends Staff {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    avatar: string | null;
    isActive: boolean;
  };
}

export interface StaffListResponse {
  staff: StaffWithUser[];
}