# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint codebase
npm run lint
```

## Project Architecture

### Core Framework
- **Next.js 15** with App Router architecture
- **React 19** for UI components
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling with custom theming system

### Route Structure
The application uses Next.js App Router with route groups:

- `app/(marketing)/` - Public marketing pages (about, pricing, features, contact)
- `app/(customer)/` - Customer-facing booking and profile pages
- `app/dashboard/` - Business owner dashboard (protected by SubscriptionGuard)
- `app/auth/` - Authentication flow
- `app/settings/` - User settings

### Authentication & Authorization

**Authentication Flow:**
- Phone number-based authentication with SMS verification
- JWT access tokens (stored in memory) + HTTP-only refresh token cookies
- Automatic token refresh with interceptors
- SSR-safe authentication state handling

**Key Components:**
- `AuthContext` - Manages authentication state and token handling
- `middleware.ts` - Route protection and auth state propagation
- `BusinessGuard` - Protects onboarding routes (redirects if business exists)
- `SubscriptionGuard` - Protects dashboard routes (requires active subscription)

**Token Management:**
- Access tokens stored in memory only (cleared on refresh)
- Refresh tokens stored as HTTP-only cookies
- Automatic refresh on 401 responses via axios interceptors

### State Management
- **React Query** (`@tanstack/react-query`) for server state and caching
- **React Context** for authentication, theme, and global state
- **Custom hooks** for API interactions

### Theming System
- **Custom CSS variables** for consistent theming
- **5 theme variants**: default, ocean, sunset, forest, purple
- **Light/dark/system** mode support
- **Theme persistence** in localStorage
- **SSR-safe** theme initialization

### API Layer
- **Axios client** with automatic token injection
- **Centralized error handling** with toast notifications
- **Service layer** pattern for API interactions
- **Type-safe** request/response interfaces

### Key Services
- `authService` - Authentication operations
- `userService` - User profile management
- `businessService` - Business CRUD operations
- `appointmentService` - Appointment management
- `customerService` - Customer management
- `paymentService` - Payment processing
- `reportService` - Analytics and reporting

### Business Logic Flow
1. **Registration/Login** → Phone verification → JWT tokens
2. **Onboarding** → Business creation (protected by BusinessGuard)
3. **Subscription** → Payment setup → Dashboard access
4. **Dashboard** → Full business management (protected by SubscriptionGuard)

### Permission System
- **Role-based access control** (RBAC) with business context
- **Subscription-based** feature access
- **Guard components** for route protection
- **Permission utilities** for feature gates

### Data Types
Key TypeScript interfaces:
- `User` - User profile with roles and business associations
- `Business` - Business entity with subscription info
- `Appointment` - Booking system core entity
- `Subscription` - Payment and feature access control
- API response wrappers with success/error handling

### UI Components
- **Reusable components** in `app/components/ui/`
- **Feature components** in `app/components/features/`
- **Layout components** in `app/components/layout/`
- **CSS-in-JS** with Tailwind and CSS variables
- **Toast notifications** via react-hot-toast

### Development Notes
- **Server-side rendering** safe patterns throughout
- **Hydration mismatch** prevention in auth/theme contexts
- **Automatic token refresh** prevents session interruptions
- **Type-safe API calls** with Zod validation
- **Error boundaries** and graceful error handling
- **Progressive enhancement** approach for better UX
- **TypeScript path aliases** configured for clean imports:
  - `@/src/*` → `./src/*`
  - `@/components/*` → `./src/components/*`
  - `@/lib/*` → `./src/lib/*`
  - `@/types/*` → `./src/types/*`

### Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Basic UI components
│   ├── features/    # Feature-specific components
│   └── layout/      # Layout components
├── context/         # React context providers
├── lib/            # Utilities and services
│   ├── services/   # API service functions
│   ├── utils/      # Utility functions
│   ├── themes/     # Theme configuration
│   └── hooks/      # Custom React hooks
├── types/          # TypeScript interfaces
├── styles/         # Global styles and CSS
└── constants/      # App constants

app/                # Next.js App Router
├── (marketing)/    # Marketing pages route group
├── (customer)/     # Customer-facing route group
├── dashboard/      # Business dashboard routes
├── auth/          # Authentication pages
└── settings/      # Settings pages
```

### File Patterns
- `src/components/*/` - Reusable UI components
- `src/types/*.ts` - TypeScript interfaces
- `src/lib/services/*.ts` - API service functions
- `src/lib/utils/*.ts` - Utility functions
- `app/**/page.tsx` - Route components
- `app/**/layout.tsx` - Layout wrappers

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API base URL (defaults to http://localhost:3001)