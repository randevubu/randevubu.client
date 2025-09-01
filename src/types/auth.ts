import { AuditAction, VerificationPurpose } from './enums';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity?: string;
  details?: Record<string, any>;
  createdAt: Date;
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
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  maxAttempts: number;
  phoneNumber: string;
  userId?: string;
}

export interface RefreshToken {
  id: string;
  token: string;
  createdAt: Date;
  deviceId?: string;
  expiresAt: Date;
  ipAddress?: string;
  isRevoked: boolean;
  lastUsedAt: Date;
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
  createdAt: Date;
  deletedAt?: Date;
  failedLoginAttempts: number;
  firstName?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  lastName?: string;
  lockedUntil?: Date;
  phoneNumber: string;
  updatedAt: Date;
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
