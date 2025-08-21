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
  code: string;
  purpose: VerificationPurpose;
}