export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  level: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  grantedBy?: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  conditions?: Record<string, any>;
  grantedBy?: string;
  grantedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface GrantPermissionData {
  roleId: string;
  permissionId: string;
  conditions?: Record<string, any>;
}