import { ClosureType } from './enums';

export interface UserBehavior {
  id: string;
  userId: string;
  totalAppointments: number;
  canceledAppointments: number;
  noShowAppointments: number;
  completedAppointments: number;
  lastCancelDate?: string;
  cancelationsThisMonth: number;
  cancelationsThisWeek: number;
  lastNoShowDate?: string;
  noShowsThisMonth: number;
  noShowsThisWeek: number;
  isBanned: boolean;
  bannedUntil?: string;
  banReason?: string;
  banCount: number;
  currentStrikes: number;
  lastStrikeDate?: string;
  strikeResetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessClosure {
  id: string;
  businessId: string;
  startDate: string;
  endDate?: string;
  reason: string;
  type: ClosureType;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessClosureData {
  startDate: string;
  endDate?: string;
  reason: string;
  type: ClosureType;
}

export interface UpdateBusinessClosureData {
  endDate?: string;
  reason?: string;
  type?: ClosureType;
  isActive?: boolean;
}

export interface UpdateUserBehaviorData {
  totalAppointments?: number;
  canceledAppointments?: number;
  noShowAppointments?: number;
  completedAppointments?: number;
  isBanned?: boolean;
  bannedUntil?: string;
  banReason?: string;
  currentStrikes?: number;
}

export interface BehaviorAnalytics {
  totalUsers: number;
  bannedUsers: number;
  usersWithStrikes: number;
  averageCompletionRate: number;
  averageCancellationRate: number;
  averageNoShowRate: number;
}