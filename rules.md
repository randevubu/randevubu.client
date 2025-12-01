# Randevubu Frontend - Development Rules & Architecture

A comprehensive guide for maintaining consistency, quality, and clarity in our Next.js 15 frontend application.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Project Structure](#project-structure)
3. [Naming Conventions](#naming-conventions)
4. [State Management](#state-management)
5. [Data Fetching & API Integration](#data-fetching--api-integration)
6. [Context & Providers](#context--providers)
7. [Components](#components)
8. [Hooks](#hooks)
9. [Error Handling](#error-handling)
10. [Authentication](#authentication)
11. [Internationalization (i18n)](#internationalization-i18n)
12. [TypeScript](#typescript)
13. [Performance](#performance)
14. [Security](#security)

---

## Core Principles

### 1. **Pragmatic over Perfect**
- Avoid over-engineering. Solve the problem elegantly without unnecessary abstractions.
- Use established patterns but don't force them where they don't fit.
- Prioritize clarity and maintainability over clever solutions.

### 2. **DRY (Don't Repeat Yourself)**
- Extract reusable logic into services, hooks, or utilities.
- Share constants through centralized files.
- Use path aliases to avoid relative import chains.

### 3. **Single Responsibility Principle**
- Each file, function, and component should have one clear purpose.
- Separate concerns: API logic, business logic, UI logic.

### 4. **Separation of Concerns**
```
Services     → API communication & business logic
Hooks        → State management & side effects
Components   → UI & presentation layer
Contexts     → Global state (auth, theme, locale)
Utils        → Helper functions & utilities
```

### 5. **Type Safety First**
- Always use TypeScript. Avoid `any` types.
- Share types across service/hook/component layers.
- Use discriminated unions for complex state.

---

## Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── (public)/          # Public routes group
│   └── (protected)/       # Protected routes group
│
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (buttons, forms, etc.)
│   ├── layout/           # Layout components (headers, sidebars, etc.)
│   ├── features/         # Feature-specific components
│   └── charts/           # Chart/visualization components
│
├── context/              # React Context & providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── LocaleContext.tsx
│
├── lib/                  # Core library code
│   ├── api.ts           # Axios instance & interceptors
│   ├── hooks/           # Custom React hooks (queries, mutations, etc.)
│   ├── services/        # API service functions
│   ├── utils/           # Helper utilities
│   ├── constants/       # App constants
│   ├── validation/      # Zod schemas & validators
│   └── themes/          # Theme configuration
│
├── types/               # Shared TypeScript types
│   ├── api.ts          # API response types
│   ├── auth.ts         # Auth-related types
│   └── index.ts        # Main exports
│
├── shared/              # Code shared with backend
│   ├── types/          # Shared type definitions
│   ├── utils/          # Shared utilities
│   ├── hooks/          # Shared hooks
│   └── services/       # Shared service logic
│
├── styles/             # Global styles
│   └── globals.css     # Tailwind & global styles
│
├── messages/           # i18n translation files
│   ├── en.json
│   └── tr.json
│
└── i18n.ts            # i18n configuration
```

### Why This Structure?

- **Clear separation** between API layer (`lib/services`), state management (`lib/hooks`), and UI (`components`)
- **Scalability**: Easy to add new features without disrupting existing code
- **Reusability**: Shared code isolated in `shared/` and `lib/utils`
- **Type safety**: All types centralized for consistency

---

## Naming Conventions

### Files & Folders

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserCard.tsx`, `LoginForm.tsx` |
| Hooks | camelCase, prefixed with `use` | `useAuthQueries.ts`, `useDashboardData.ts` |
| Services | camelCase | `appointments.ts`, `auth.ts` |
| Utils | camelCase | `dateFormatter.ts`, `validation.ts` |
| Types | PascalCase | `User.ts`, `ApiResponse.ts` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Folders | kebab-case (multi-word) or camelCase | `api-clients/`, `useAuthQueries` |

### Variables & Functions

```typescript
// Variables & functions: camelCase
const userToken = 'abc123';
function getUserById(id: string) { }

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 3;
const API_TIMEOUT_MS = 30000;

// React Components & Types: PascalCase
interface UserProfile { }
const UserCard: React.FC = () => {};

// Event handlers: on + PascalCase
const onUserClick = () => {};
const onFormSubmit = (e) => {};
```

---

## State Management

### Hierarchy of State Choices

Choose state management based on scope and complexity:

```
┌─────────────────────────────────────────────┐
│ Global State (Contexts & Providers)         │
│ - Auth (user, tokens)                       │
│ - Theme (light/dark mode)                   │
│ - Locale (language preference)              │
│ - Notifications (global alerts)             │
└─────────────────────────────────────────────┘
           ↓ Use for app-wide data
┌─────────────────────────────────────────────┐
│ Server State (TanStack Query)               │
│ - API data (users, appointments, etc.)      │
│ - Cache & synchronization                   │
│ - Automatic refetching & invalidation       │
└─────────────────────────────────────────────┘
           ↓ Use for asynchronous data
┌─────────────────────────────────────────────┐
│ Local Component State (useState)             │
│ - Form inputs, UI toggles                   │
│ - Component-specific temporary state        │
│ - Don't lift unless needed elsewhere        │
└─────────────────────────────────────────────┘
```

### Guidelines

- **TanStack Query (React Query)** for server state: caching, fetching, mutations
- **React Context** for global client state: auth, theme, locale
- **Local State** for UI-only concerns: form inputs, modals, tooltips
- **Never over-lift state**: Keep state as local as possible

---

## Data Fetching & API Integration

### API Client Setup

The API client (`lib/api.ts`) is a centralized Axios instance with:

- **Automatic token injection** in Authorization header
- **Token refresh interceptor** that silently refreshes expired tokens
- **Locale header** for backend language detection
- **Request/response interceptors** for consistent error handling

```typescript
// lib/api.ts structure
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axios instance with interceptors
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor adds token & locale
// Response interceptor handles token refresh & errors
```

### Service Layer Pattern

Every API endpoint should have a corresponding **service function**:

```typescript
// lib/services/appointments.ts
import { apiClient } from '../api';
import { Appointment, ApiResponse } from '@/types';

export const appointmentService = {
  // GET requests
  getList: async (filters?: AppointmentFilters): Promise<ApiResponse<Appointment[]>> => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      '/api/v1/appointments',
      { params: filters }
    );
    return response.data;
  },

  // POST requests
  create: async (data: CreateAppointmentInput): Promise<ApiResponse<Appointment>> => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      '/api/v1/appointments',
      data
    );
    return response.data;
  },

  // PUT requests
  update: async (id: string, data: UpdateAppointmentInput): Promise<ApiResponse<Appointment>> => {
    const response = await apiClient.put<ApiResponse<Appointment>>(
      `/api/v1/appointments/${id}`,
      data
    );
    return response.data;
  },

  // DELETE requests
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/api/v1/appointments/${id}`
    );
    return response.data;
  },
};
```

### Query/Mutation Hook Pattern

Wrap service calls in TanStack Query hooks for automatic caching:

```typescript
// lib/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointments';

// Define query keys for cache management
export const appointmentKeys = {
  all: ['appointments'] as const,
  list: () => [...appointmentKeys.all, 'list'] as const,
  detail: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
};

// Query hook
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(),
    queryFn: () => appointmentService.getList(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Mutation hook
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentInput) => 
      appointmentService.create(data),
    onSuccess: (data) => {
      // Invalidate cache to refetch updated list
      queryClient.invalidateQueries({ 
        queryKey: appointmentKeys.list() 
      });
      // Optionally add new item to cache
      queryClient.setQueryData(
        appointmentKeys.detail(data.id),
        data
      );
    },
  });
}
```

### Query Key Naming

Query keys should be hierarchical and describe the data:

```typescript
// ✅ GOOD: Hierarchical structure
const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters) => [...userKeys.lists(), { filters }] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

// ✅ Usage
queryKey: userKeys.list(filters)
queryKey: userKeys.detail('123')

// ❌ AVOID: Flat, unclear keys
queryKey: ['users']
queryKey: ['user-123']
```

### Best Practices

1. **Always return `ApiResponse<T>`** type from services
2. **Keep services pure** - no React imports or hooks
3. **Use error boundaries** in hooks to catch API errors gracefully
4. **Implement retry logic** for failed requests with exponential backoff
5. **Set appropriate `staleTime`** to balance freshness vs. API load
6. **Use `enabled` flag** to conditionally run queries
7. **Invalidate cache** after mutations to keep UI in sync

---

## Context & Providers

### When to Use Context

✅ **Use Context for:**
- Authentication state (user, tokens)
- Global UI state (theme, language)
- App-wide configuration
- Data needed by many components at different nesting levels

❌ **Don't use Context for:**
- Frequently changing data (use TanStack Query instead)
- Component-local state (use `useState`)
- Complex state machines (consider Redux if necessary)

### Context Pattern

```typescript
// context/AuthContext.tsx
'use client'; // Client component for Context

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, code: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state
  // Fetch initial data if needed
  // Memoize context value to prevent unnecessary re-renders

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Context Consumer Rules

1. Always provide error message if context is used outside provider
2. Use a custom hook (`useAuth()`) instead of direct `useContext()`
3. Keep context logic minimal - delegate complex logic to services
4. Memoize context value with `useMemo` to prevent unnecessary re-renders

---

## Components

### Component Organization

```typescript
// components/features/AppointmentCard.tsx
'use client';

import React from 'react';
import { Appointment } from '@/types';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  return (
    <div className="card">
      <h3>{appointment.title}</h3>
      <p>{formatDate(appointment.date)}</p>
      <div className="actions">
        {onEdit && <Button onClick={() => onEdit(appointment.id)}>Edit</Button>}
        {onDelete && <Button onClick={() => onDelete(appointment.id)}>Delete</Button>}
      </div>
    </div>
  );
}
```

### Component Best Practices

1. **Prop Drilling**: For 2-3 levels it's fine. Beyond that, consider Context.
2. **Event Handlers**: Pass callbacks as props, keep components pure.
3. **Styling**: Use Tailwind classes + CSS modules for scoped styles if needed.
4. **Accessibility**: Use semantic HTML, ARIA labels where appropriate.
5. **Children Pattern**: Use `children` prop for component composition.

```typescript
// ✅ GOOD: Flexible component
interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

---

## Hooks

### Avoiding useEffect - The Better Way

**Philosophy**: `useEffect` is often a code smell indicating logic that belongs elsewhere. Before reaching for `useEffect`, consider these alternatives.

#### Problem: useEffect as "setup"

```typescript
// ❌ ANTI-PATTERN: useEffect for initialization
export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []); // What if dependencies are wrong?

  return <div>{user?.name}</div>;
}
```

**Why it's bad**:
- Hard to manage dependencies correctly
- Can cause race conditions with async operations
- Mixes data fetching with component rendering
- Difficult to test

#### ✅ Solution 1: Use TanStack Query (Recommended)

```typescript
// ✅ BETTER: Let TanStack Query handle data fetching
export function UserProfile() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });

  return <div>{user?.name}</div>;
}
```

**Benefits**:
- Automatic caching and revalidation
- Built-in loading/error states
- No dependency array to manage
- Race condition prevention built-in
- Testable with mock query client

#### Problem: useEffect for side effects on prop change

```typescript
// ❌ ANTI-PATTERN: Syncing props with state
export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchService.search(query).then(setResults);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return <div>{results.map(r => <div key={r.id}>{r.title}</div>)}</div>;
}
```

**Why it's bad**:
- Debouncing logic mixed with side effects
- Race conditions if previous request completes after new one
- Testing requires mocking timers

#### ✅ Solution 2: Move to event handlers or mutations

```typescript
// ✅ BETTER: Event-driven approach
export function SearchResults() {
  const [query, setQuery] = useState('');
  const searchMutation = useMutation({
    mutationFn: (q: string) => searchService.search(q),
  });

  const handleSearch = useCallback(
    debounce((value: string) => {
      setQuery(value);
      searchMutation.mutate(value);
    }, 300),
    [searchMutation]
  );

  return (
    <>
      <input onChange={(e) => handleSearch(e.target.value)} />
      <div>
        {searchMutation.data?.map(r => (
          <div key={r.id}>{r.title}</div>
        ))}
      </div>
    </>
  );
}
```

**Or with callback dependencies**:

```typescript
// ✅ BETTER: Callback-based
export function SearchResults() {
  const [query, setQuery] = useState('');
  const { mutate: search, data: results } = useMutation({
    mutationFn: searchService.search,
  });

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      // Trigger search immediately or debounced
      search(value);
    },
    [search]
  );

  return (
    <>
      <input onChange={(e) => handleQueryChange(e.target.value)} />
      <div>{results?.map(r => <div key={r.id}>{r.title}</div>)}</div>
    </>
  );
}
```

#### Problem: useEffect for form state synchronization

```typescript
// ❌ ANTI-PATTERN: Syncing form with external state
export function EditUserForm({ userId }: { userId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
  });

  // Synchronizing derived state
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </form>
  );
}
```

**Why it's bad**:
- Redundant state duplication
- Risk of state divergence
- Extra render cycles

#### ✅ Solution 3: Eliminate derived state

```typescript
// ✅ BETTER: Use query data directly
export function EditUserForm({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
  });

  const [formData, setFormData] = useState({ name: '', email: '' });

  // Initialize form once when user loads
  const initialize = useCallback(() => {
    if (user && !formData.name) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user, formData.name]);

  React.useLayoutEffect(() => {
    initialize();
  }, [user?.id]); // Only re-run if user ID changes

  return (
    <form>
      <input 
        value={formData.name}
        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
      />
    </form>
  );
}

// ✅ OR EVEN BETTER: Use form library
import { useForm } from 'react-hook-form';

export function EditUserForm({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId),
  });

  const { register, setValue } = useForm({
    values: user ? { name: user.name, email: user.email } : undefined,
  });

  return (
    <form>
      <input {...register('name')} />
      <input {...register('email')} />
    </form>
  );
}
```

#### Problem: useEffect for event listener management

```typescript
// ❌ ANTI-PATTERN: Managing event listeners with useEffect
export function ClickDetector() {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleClick = () => setIsClicked(true);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return <div>{isClicked && 'Clicked!'}</div>;
}
```

**Why it's bad**:
- Verbose cleanup logic
- Easy to forget cleanup
- Multiple re-renders

#### ✅ Solution 4: Use custom hooks for lifecycle management

```typescript
// ✅ BETTER: Extract into reusable hook
export function useClickOutside(ref: RefObject<HTMLElement>) {
  const [isClicked, setIsClicked] = useState(false);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsClicked(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [ref]);

  return isClicked;
}

// Usage - clean and reusable
export function Modal() {
  const ref = useRef<HTMLDivElement>(null);
  const clickedOutside = useClickOutside(ref);

  useEffect(() => {
    if (clickedOutside) {
      closeModal();
    }
  }, [clickedOutside]);

  return <div ref={ref}>Modal content</div>;
}
```

#### Problem: useEffect for coordinating multiple state updates

```typescript
// ❌ ANTI-PATTERN: Cascading effects
export function OrderCheckout({ cartItems }: { cartItems: CartItem[] }) {
  const [total, setTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);

  // Effect 1: Calculate total
  useEffect(() => {
    const sum = cartItems.reduce((acc, item) => acc + item.price, 0);
    setTotal(sum);
  }, [cartItems]);

  // Effect 2: Calculate tax based on total
  useEffect(() => {
    setTax(total * 0.1);
  }, [total]); // Triggered by effect 1!

  // Effect 3: Calculate shipping based on total
  useEffect(() => {
    setShipping(total > 100 ? 0 : 10);
  }, [total]); // Triggered by effect 1!

  return <div>{total + tax + shipping}</div>;
}
```

**Why it's bad**:
- Multiple render cycles (3+ renders!)
- Hard to trace data flow
- Testing nightmare

#### ✅ Solution 5: Calculate derived values, don't store them

```typescript
// ✅ BETTER: Pure calculations, single source of truth
export function OrderCheckout({ cartItems }: { cartItems: CartItem[] }) {
  // Calculate everything from source data
  const total = cartItems.reduce((acc, item) => acc + item.price, 0);
  const tax = total * 0.1;
  const shipping = total > 100 ? 0 : 10;
  const finalTotal = total + tax + shipping;

  return <div>{finalTotal}</div>;
}
```

**Benefits**:
- Single render
- Easy to test (pure functions)
- Automatic sync
- Clear data flow

#### When useEffect is Actually Needed

`useEffect` is appropriate for:

1. **Browser APIs** that don't have React equivalents
2. **External subscriptions** (WebSocket, event listeners)
3. **Imperative operations** (focus management, DOM manipulation)

```typescript
// ✅ ACCEPTABLE: Browser API integration
export function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on mount
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// ✅ ACCEPTABLE: External subscriptions
export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}
```

---

### Custom Hook Patterns

**Rule**: If logic can be extracted and reused, create a hook.

```typescript
// ✅ GOOD: Reusable hook
export function useForm<T>(initialData: T, onSubmit: (data: T) => Promise<void>) {
  const [data, setData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { data, handleChange, handleSubmit, isSubmitting };
}
```

### Hook Rules

1. **Must start with `use`** prefix (React Convention)
2. **Call only at top level** of components or other hooks
3. **Don't call conditionally** - always execute in same order
4. **Extract side effects** into `useEffect` properly
5. **Dependencies array**: Include all external values used

```typescript
// ❌ WRONG: Conditional hook
if (condition) {
  const data = useQuery(...); // WRONG!
}

// ✅ CORRECT: Hook always runs, conditional inside
const { data } = useQuery({
  ...config,
  enabled: condition, // Conditionally enable
});
```

### Data Fetching Hooks with Error Handling

```typescript
export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.list(),
    queryFn: async () => {
      try {
        const response = await appointmentService.getList();
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch');
        }
        return response.data;
      } catch (error) {
        handleApiError(error); // Centralized error handling
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry 401/403 (auth errors)
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
```

---

## Error Handling

### API Error Structure

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>; // For validation errors
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public validationErrors?: Record<string, string[]>
  ) {
    super(message);
  }
}
```

### Error Handling Utilities

```typescript
// lib/utils/errorHandling.ts
export function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiResponse<any>;

    // Handle specific status codes
    if (status === 401) {
      // Token expired - will be handled by interceptor
      return;
    }

    if (status === 403) {
      // Forbidden - insufficient permissions
      toast.error('You do not have permission for this action');
      return;
    }

    if (status === 422 || status === 400) {
      // Validation error
      const message = data.message || 'Validation failed';
      toast.error(message);
      return;
    }

    if (status === 500) {
      // Server error
      toast.error('Server error. Please try again later.');
      return;
    }

    // Generic API error
    toast.error(data.message || 'An error occurred');
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### Component Error Boundaries

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

---

## Authentication

### Auth Flow

1. User submits phone number → backend sends OTP
2. User submits OTP → backend returns `accessToken` + `refreshToken`
3. Frontend stores tokens and sets authenticated state
4. API requests include token in Authorization header
5. When token expires, interceptor silently refreshes it
6. If refresh fails, user is redirected to login

### Auth Implementation

```typescript
// lib/hooks/useAuthQueries.ts
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export function useAuthSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const token = await getStoredToken(); // From cookies or localStorage
      if (token && !isTokenExpired(token)) {
        setAccessToken(token);
        return token;
      }
      return null;
    },
    staleTime: Infinity, // Don't auto-refetch session
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginInput) =>
      authService.verifyLogin(credentials),
    onSuccess: (response) => {
      // Store tokens
      storeTokens(response.data.tokens);
      setAccessToken(response.data.tokens.accessToken);

      // Update auth cache
      queryClient.setQueryData(authKeys.session(), response.data.tokens.accessToken);
      queryClient.setQueryData(authKeys.profile(), response.data.user);
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}
```

### Protected Routes

```typescript
// app/(protected)/layout.tsx
'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    redirect('/login');
  }

  return children;
}
```

---

## Internationalization (i18n)

### i18n Setup

```typescript
// src/i18n.ts
export const locales = ['en', 'tr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
```

### Translation Files

```json
// messages/en.json
{
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "verificationCode": "Verification Code"
  },
  "errors": {
    "invalidCode": "Invalid verification code"
  }
}
```

### Using Translations

```typescript
// In components
'use client';

import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations('auth');

  return (
    <button>{t('login')}</button>
  );
}
```

### Backend Locale Sync

The API client automatically sends the user's language preference:

```typescript
// lib/api.ts
const acceptLanguageHeader = getAcceptLanguageHeader(); // Gets user's locale
axiosInstance.defaults.headers.common['Accept-Language'] = acceptLanguageHeader;
```

---

## TypeScript

### Type Organization

```typescript
// types/index.ts - Main export
export * from './api';
export * from './auth';
export * from './business';

// types/auth.ts
export interface User {
  id: string;
  phoneNumber: string;
  language: 'en' | 'tr';
  roles: Role[];
}

export interface LoginInput {
  phoneNumber: string;
  verificationCode: string;
}

// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
```

### Type Best Practices

```typescript
// ✅ GOOD: Use discriminated unions for complex state
type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// ✅ GOOD: Use Zod for runtime validation
import { z } from 'zod';

export const loginSchema = z.object({
  phoneNumber: z.string().min(10),
  verificationCode: z.string().length(6),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ✅ GOOD: Use readonly for immutable data
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// ❌ AVOID: any type
const response: any = await fetch(...); // DON'T DO THIS

// ❌ AVOID: Optional chains without null checks
const user = data?.user?.name; // Could still be undefined
```

---

## Performance

### Code Splitting

```typescript
// Lazy load components not needed on initial render
'use client';

import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Only needed for components with dynamic imports
});

export function Dashboard() {
  const { role } = useAuth();
  return role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}
```

### Query Optimization

```typescript
// Set appropriate cache times
useQuery({
  queryKey: [...],
  queryFn: [...],
  staleTime: 5 * 60 * 1000,        // Cache for 5 minutes
  gcTime: 10 * 60 * 1000,          // Keep in memory for 10 minutes
  retry: 2,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// Use dependent queries efficiently
const { data: user } = useQuery(...); // Runs first

const { data: appointments } = useQuery({
  ...config,
  enabled: !!user?.id, // Only run after user is loaded
});
```

### Memoization

```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]); // Re-compute only when data changes

// Memoize callbacks passed to child components
const handleSubmit = useCallback((formData) => {
  mutate(formData);
}, [mutate]); // Re-create only when mutate changes
```

### Image Optimization

```typescript
// Use Next.js Image component
'use client';

import Image from 'next/image';

export function UserAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="rounded-full"
    />
  );
}
```

---

## Security

### Token Management

```typescript
// ✅ Store tokens in httpOnly cookies (set by backend)
// Accessed only through API client, never exposed to JavaScript

// ❌ DON'T store tokens in localStorage
// localStorage.setItem('token', token); // NEVER DO THIS

// ✅ Tokens refreshed silently by interceptor
// User doesn't need to manually handle refresh
```

### API Security

```typescript
// ✅ All API calls through centralized client
const response = await apiClient.get('/api/v1/data');

// ❌ Don't make direct fetch calls
// const response = await fetch('http://api.example.com/data'); // AVOID

// ✅ Validate user input with Zod
const validated = loginSchema.parse(userInput);

// ✅ Use CSRF tokens if needed (backend provides)
// Axios automatically includes CSRF token from cookies
```

### Content Security

```typescript
// ✅ Sanitize HTML if displaying user content
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userContent);
return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;

// ❌ Never use dangerouslySetInnerHTML without sanitizing
// <div dangerouslySetInnerHTML={{ __html: userContent }} />; // DANGEROUS
```

### Environment Variables

```typescript
// .env.local (never commit)
NEXT_PUBLIC_API_URL=http://localhost:3001  // Client-visible
NEXT_PUBLIC_APP_NAME=Randevubu

// Use via process.env.NEXT_PUBLIC_*
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## Summary Checklist

### Before Committing Code

- [ ] Types are properly defined and exported
- [ ] No `any` types used
- [ ] API calls use service layer + hooks pattern
- [ ] Error handling is implemented
- [ ] Component props are documented with JSDoc or TypeScript
- [ ] Performance-critical components are memoized
- [ ] i18n strings are in message files
- [ ] Tests pass (if applicable)
- [ ] No console.logs left in production code
- [ ] Code follows the naming conventions

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints match production backend
- [ ] Auth flow tested end-to-end
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] No hard-coded URLs or credentials

---

## Quick Reference

### API Call Pattern

```typescript
// 1. Create service (lib/services/)
export const userService = {
  getProfile: () => apiClient.get('/api/v1/users/profile'),
};

// 2. Create hook (lib/hooks/)
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
  });
}

// 3. Use in component
export function Profile() {
  const { data: user, isLoading } = useUserProfile();
  return <div>{user?.name}</div>;
}
```

### Context Pattern

```typescript
// 1. Create context (context/)
const MyContext = createContext<MyContextType | undefined>(undefined);

// 2. Create provider
export function MyProvider({ children }: { children: ReactNode }) {
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// 3. Create hook
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMyContext must be used within MyProvider');
  return context;
}

// 4. Add to layout
export default function RootLayout({ children }) {
  return <MyProvider>{children}</MyProvider>;
}
```

---

## Resources & Tools

- **Next.js**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query
- **Zod**: https://zod.dev
- **next-intl**: https://next-intl-docs.vercel.app
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Last Updated**: November 26, 2025
**Project**: Randevubu Frontend (Next.js 15)
