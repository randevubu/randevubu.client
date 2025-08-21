import { ClosureType } from './enums';

export interface UserBehavior {
  id: string;
  userId: string;
  totalAppointments: number;
  canceledAppointments: number;
  noShowAppointments: number;
  completedAppointments: number;
  lastCancelDate?: Date;
  cancelationsThisMonth: number;
  cancelationsThisWeek: number;
  lastNoShowDate?: Date;
  noShowsThisMonth: number;
  noShowsThisWeek: number;
  isBanned: boolean;
  bannedUntil?: Date;
  banReason?: string;
  banCount: number;
  currentStrikes: number;
  lastStrikeDate?: Date;
  strikeResetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessClosure {
  id: string;
  businessId: string;
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: ClosureType;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessClosureData {
  startDate: Date;
  endDate?: Date;
  reason: string;
  type: ClosureType;
}

export interface UpdateBusinessClosureData {
  endDate?: Date;
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
  bannedUntil?: Date;
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