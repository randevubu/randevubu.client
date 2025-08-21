import { BusinessStaffRole } from './enums';

export interface BusinessType {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  ownerId: string;
  businessTypeId: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  businessHours?: Record<string, any>;
  timezone: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  isClosed: boolean;
  closedUntil?: Date;
  closureReason?: string;
  tags: string[];
  rating?: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface BusinessStaff {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessStaffRole;
  permissions?: Record<string, any>;
  isActive: boolean;
  joinedAt: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessImage {
  id: string;
  businessId: string;
  url: string;
  alt?: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateBusinessData {
  businessTypeId: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  tags?: string[];
}

export interface UpdateBusinessData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  businessHours?: Record<string, any>;
  timezone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  tags?: string[];
}

export interface AddStaffData {
  userId: string;
  role: BusinessStaffRole;
  permissions?: Record<string, any>;
}

export interface UpdateStaffData {
  role?: BusinessStaffRole;
  permissions?: Record<string, any>;
  isActive?: boolean;
}

export interface BusinessSearchFilters {
  businessTypeId?: string;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  rating?: number;
}