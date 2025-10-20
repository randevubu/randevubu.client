export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  duration: number;
  price: number | null;
  currency: string;
  category?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  pricing?: Record<string, any>;
  bufferTime: number;
  maxAdvanceBooking: number;
  minAdvanceBooking: number;
  showPrice?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceStaff {
  id: string;
  serviceId: string;
  staffId: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  duration: number;
  price: number;
  currency?: string;
  category?: string;
  image?: string;
  pricing?: Record<string, any>;
  bufferTime?: number;
  maxAdvanceBooking?: number;
  minAdvanceBooking?: number;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  currency?: string;
  category?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  pricing?: Record<string, any>;
  bufferTime?: number;
  maxAdvanceBooking?: number;
  minAdvanceBooking?: number;
}

export interface AssignStaffToServiceData {
  staffId: string;
}

export interface ServiceSearchFilters {
  businessId?: string;
  category?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  duration?: number;
}