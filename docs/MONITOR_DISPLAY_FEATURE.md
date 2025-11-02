# Dental Clinic Monitor Display Feature

## Overview

This document outlines the requirements and implementation plan for a real-time appointment queue monitor display system designed for dental clinics. The monitor will be displayed on screens in waiting rooms to show patients their position in the queue, current appointments, and wait times.

## Business Problem

Dental clinics need a way to:
- Reduce patient anxiety about wait times
- Provide clear visibility of appointment queue status
- Minimize staff interruptions from "How much longer?" questions
- Create a professional, modern waiting room experience
- Track and improve appointment efficiency

## Solution: Real-Time Monitor Display

A dedicated monitor page that displays:
- **Currently serving** - Active appointment with patient name, service, and staff
- **Next up** - Next appointment in queue with estimated start time
- **Waiting queue** - List of upcoming appointments with wait time estimates
- **Daily statistics** - Completed appointments, average wait times, etc.

## Current API Analysis

### Existing Endpoints
We currently have these appointment-related endpoints:

1. **`GET /api/v1/appointments/business/{businessId}/date-range`**
   - Fetches appointments for a date range
   - Includes all appointment details
   - Good for historical data

2. **`GET /api/v1/appointments/my-appointments`**
   - Business owner's appointments (customers who booked)
   - Supports pagination and filtering
   - Used in dashboard

3. **`GET /api/v1/appointments/my/upcoming`**
   - Upcoming appointments only
   - Limited to specific number of results
   - Good for quick upcoming view

4. **`PUT /api/v1/appointments/{appointmentId}/status`**
   - Update appointment status
   - Essential for queue management

5. **`GET /api/v1/appointments/{appointmentId}`**
   - Get specific appointment details
   - Used for detailed views

### Current Data Structure
```typescript
interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  staffId?: string;
  customerId: string;
  date: string;           // YYYY-MM-DD format
  startTime: string;      // HH:MM format
  endTime: string;        // HH:MM format
  duration: number;
  status: AppointmentStatus;
  customer: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  price: number;
  currency: string;
  customerNotes?: string;
  internalNotes?: string;
  // ... timestamps
}
```

## Required New Endpoint

### `GET /api/v1/appointments/monitor/{businessId}`

**Purpose**: Optimized endpoint specifically for monitor displays that returns only the data needed for real-time queue visualization.

**Why We Need This Endpoint**:
1. **Performance** - Monitor needs to refresh every 15-30 seconds, so we need lightweight data
2. **Real-time Focus** - Only current day appointments with relevant statuses
3. **Optimized Structure** - Pre-calculated queue positions and wait times
4. **Reduced Bandwidth** - No need for full appointment details, just display essentials
5. **Caching Friendly** - Can be cached for short periods to reduce server load

**Query Parameters**:
- `date` (optional): Specific date in YYYY-MM-DD format (defaults to today)
- `includeStats` (optional): Include daily statistics (default: true)
- `maxQueueSize` (optional): Maximum number of waiting appointments to return (default: 10)

**Response Structure**:
```typescript
interface MonitorAppointmentsResponse {
  success: boolean;
  data: {
    // Current appointment being served
    current: {
      appointment: Appointment | null;
      room?: string;
      startedAt: string | null;
      estimatedEndTime: string | null;
    } | null;
    
    // Next appointment in queue
    next: {
      appointment: Appointment | null;
      room?: string;
      estimatedStartTime: string | null;
      waitTimeMinutes: number | null;
    } | null;
    
    // Waiting queue (upcoming appointments)
    queue: Array<{
      appointment: Appointment;
      room?: string;
      estimatedStartTime: string;
      waitTimeMinutes: number;
      position: number;
    }>;
    
    // Daily statistics
    stats: {
      completedToday: number;
      inProgress: number;
      waiting: number;
      averageWaitTime: number;
      averageServiceTime: number;
      totalScheduled: number;
    };
    
    // Metadata
    lastUpdated: string;
    businessInfo: {
      name: string;
      timezone: string;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}
```

**Status Filtering Logic**:
- **Current**: `IN_PROGRESS` status appointments
- **Next**: `CONFIRMED` status appointments, sorted by start time
- **Queue**: `CONFIRMED` status appointments after the "next" appointment
- **Excluded**: `CANCELLED`, `NO_SHOW`, `COMPLETED` appointments

**Wait Time Calculation**:
- Based on appointment duration and current time
- Accounts for delays and overruns
- Updates in real-time as appointments progress

## Frontend Implementation

### Monitor Page Route
```
/monitor/{businessId}
```

### Custom Hook: `useMonitorAppointments`
```typescript
interface UseMonitorAppointmentsOptions {
  businessId: string;
  refetchInterval?: number;  // Default: 15000ms (15 seconds)
  autoRefresh?: boolean;     // Default: true
  includeStats?: boolean;    // Default: true
}

interface UseMonitorAppointmentsResult {
  // Queue data
  currentAppointment: MonitorAppointment | null;
  nextAppointment: MonitorAppointment | null;
  waitingQueue: MonitorAppointment[];
  
  // Statistics
  stats: MonitorStats | null;
  
  // State
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // Actions
  refetch: () => void;
  refreshNow: () => void;
}
```

### UI Design Specifications

**Layout Requirements**:
- **Large, clear fonts** (24px+ for names, 18px+ for details)
- **High contrast colors** for visibility from distance
- **Responsive design** (works on tablets, TVs, monitors)
- **Minimal animations** (subtle status changes only)
- **No user interaction** (read-only display)

**Color Coding**:
- 🟢 **Green**: Currently being served
- 🔵 **Blue**: Next in line
- 🟡 **Yellow**: Waiting in queue
- 🔴 **Red**: Delayed/Overdue
- ⚫ **Gray**: Completed/Cancelled

**Display Sections**:
1. **Header**: Clinic name, current time, last updated indicator
2. **Current**: Large display of active appointment
3. **Next**: Next appointment with wait time
4. **Queue**: List of waiting appointments with positions
5. **Stats**: Daily statistics (optional, can be toggled)

## Technical Considerations

### Performance Optimizations
1. **Efficient Querying**: Only fetch today's appointments with relevant statuses
2. **Caching**: Cache monitor data for 10-15 seconds to reduce API calls
3. **Pagination**: Limit queue size to prevent overwhelming display
4. **Background Refresh**: Use TanStack Query's background refetching

### Real-time Updates
1. **Polling Interval**: 15-30 seconds (configurable)
2. **Connection Status**: Show indicator when offline/error
3. **Graceful Degradation**: Continue showing last known data during outages
4. **Auto-recovery**: Automatically retry failed requests

### Security Considerations
1. **Business ID Validation**: Ensure user can only access their business data
2. **Rate Limiting**: Prevent excessive API calls
3. **Data Privacy**: Only show essential information (no sensitive details)
4. **Access Control**: Monitor page should be accessible without full authentication

## Business Value

### For Dental Clinics
- **Reduced Patient Anxiety**: Clear visibility of queue position and wait times
- **Improved Efficiency**: Staff can see queue status at a glance
- **Professional Appearance**: Modern, digital queue system
- **Reduced Interruptions**: Fewer "How much longer?" questions
- **Data Insights**: Track wait times and appointment efficiency

### For Your App
- **Premium Feature**: Charge extra for monitor display capability
- **Competitive Advantage**: Most booking systems don't offer this
- **Easy Upsell**: Natural progression from basic appointment booking
- **Low Maintenance**: Once built, minimal ongoing work required
- **Scalable**: Can be used by any type of appointment-based business

## Implementation Phases

### Phase 1: MVP (Minimum Viable Product)
- [ ] Create monitor endpoint
- [ ] Build basic monitor page
- [ ] Implement `useMonitorAppointments` hook
- [ ] Simple queue display (current/next/waiting)
- [ ] 15-second auto-refresh

### Phase 2: Enhanced Features
- [ ] Add daily statistics display
- [ ] Include staff assignments and room numbers
- [ ] Implement wait time calculations
- [ ] Add status change animations
- [ ] Mobile-responsive design

### Phase 3: Advanced Features
- [ ] Multiple monitor layouts (compact, detailed, etc.)
- [ ] Custom branding for each clinic
- [ ] Integration with existing appointment management
- [ ] Analytics dashboard for clinic owners
- [ ] Push notifications for status changes

## Success Metrics

### Technical Metrics
- **Page Load Time**: < 2 seconds
- **Refresh Rate**: 15-30 seconds
- **Uptime**: 99.9%
- **Error Rate**: < 1%

### Business Metrics
- **Adoption Rate**: % of clinics using monitor feature
- **Patient Satisfaction**: Reduced wait time complaints
- **Staff Efficiency**: Time saved on queue management
- **Revenue Impact**: Additional revenue from premium feature

## Conclusion

The monitor display feature is a highly valuable addition that leverages existing appointment infrastructure while providing significant business value. The implementation is straightforward with the current API structure, and the feature can be developed incrementally to minimize risk and maximize learning.

The key to success will be creating a simple, reliable, and visually appealing display that reduces patient anxiety and improves clinic operations.
