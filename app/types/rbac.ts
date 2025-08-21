export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  grantedBy?: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  conditions?: Record<string, any>;
  grantedBy?: string;
  grantedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleData {
  name: string;
  displayName: string;
  description?: string;
  level?: number;
}

export interface UpdateRoleData {
  displayName?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export interface CreatePermissionData {
  name: string;
  displayName: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface AssignRoleData {
  userId: string;
  roleId: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface GrantPermissionData {
  roleId: string;
  permissionId: string;
  conditions?: Record<string, any>;
}