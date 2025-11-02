import { AuditAction, VerificationPurpose } from './enums';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity?: string;
  details?: Record<string, any>;
  createdAt: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export interface PhoneVerification {
  id: string;
  code: string;
  purpose: VerificationPurpose;
  attempts: number;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
  maxAttempts: number;
  phoneNumber: string;
  userId?: string;
}

export interface RefreshToken {
  id: string;
  token: string;
  createdAt: string;
  deviceId?: string;
  expiresAt: string;
  ipAddress?: string;
  isRevoked: boolean;
  lastUsedAt: string;
  userAgent?: string;
  userId: string;
}

export interface UserRole {
  name: string;
  displayName: string;
  level: number;
  businessId?: string; // Add business context to roles
}

export interface UserBusiness {
  id: string;
  name: string;
  role: string; // OWNER, STAFF, MANAGER
  isActive: boolean;
}

export interface User {
  id: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
  deletedAt?: string;
  failedLoginAttempts: number;
  firstName?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  lastName?: string;
  lockedUntil?: string;
  phoneNumber: string;
  updatedAt: string;
  roles?: UserRole[];
  effectiveLevel?: number;
  businesses?: UserBusiness[]; // User's associated businesses
  primaryBusinessId?: string; // Primary business for quick access
}

export interface CreateUserData {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  timezone?: string;
  language?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
}

export interface PhoneVerificationRequest {
  phoneNumber: string;
  purpose: VerificationPurpose;
}

export interface PhoneVerificationConfirm {
  phoneNumber: string;
  verificationCode: string;
}
