# Sprint 3 Service Catalog - Technical Architecture

**Version:** 1.0
**Date:** 2025-12-16
**Status:** Implementation Ready
**Author:** System Architect

---

## Executive Summary

This document defines the technical architecture for the eGhiseul.ro Service Catalog feature (Sprint 3, US-301 & US-302). The architecture leverages Next.js 14 App Router, React Server Components, @tanstack/react-query for data fetching, and implements a hybrid rendering strategy for optimal SEO and performance.

**Key Decisions:**
- Server Components for initial page load (SEO optimization)
- Client Components for interactive filtering and cart (future)
- React Query for client-side caching and state management
- Static generation for service detail pages
- Edge caching via Next.js ISR

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Type Definitions](#type-definitions)
6. [React Query Hooks](#react-query-hooks)
7. [Caching Strategy](#caching-strategy)
8. [Error Handling](#error-handling)
9. [SEO Implementation](#seo-implementation)
10. [File Structure](#file-structure)

---

## Architecture Overview

### Rendering Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      HYBRID RENDERING STRATEGY                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Homepage (/):                                                   │
│  ├─ Server Component (layout + hero)                            │
│  └─ Featured Services → Server Component (SSR)                  │
│     └─ ServiceCard → Client Component (interactions)            │
│                                                                  │
│  Service Detail (/services/[slug]):                             │
│  ├─ Server Component (SSG with ISR, revalidate: 3600s)          │
│  ├─ Meta tags generated server-side                             │
│  └─ "Order Now" button → Client Component                       │
│                                                                  │
│  Future: Service Catalog Page (/services):                      │
│  ├─ Server Component (initial data)                             │
│  └─ ServiceFilter → Client Component (React Query)              │
│     └─ ServiceGrid → Client Component (React Query)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14.0.10 | App Router, RSC, SSR/SSG |
| Data Fetching | @tanstack/react-query 5.90.12 | Client-side caching, mutations |
| Backend | Supabase PostgreSQL | Database with RLS |
| API | Next.js Route Handlers | RESTful endpoints |
| Validation | Zod 4.2.1 | Runtime type validation |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Components | shadcn/ui | Radix UI + Tailwind |
| State | React Context (local) | Wizard state, filters |

---

## Data Flow

### 1. Homepage Featured Services Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   HOMEPAGE DATA FLOW (SSR)                       │
└─────────────────────────────────────────────────────────────────┘

1. Request: GET /
   │
   ▼
2. Server Component (page.tsx)
   │ - Execute fetch during SSR
   │ - Call Supabase directly (no API route)
   │
   ▼
3. Query:
   SELECT * FROM services
   WHERE is_active = true
     AND is_featured = true
   ORDER BY display_order ASC
   LIMIT 3
   │
   ▼
4. Server renders HTML with data
   │
   ▼
5. Browser receives fully rendered HTML (FCP < 1s)
   │
   ▼
6. Hydration: Client Components interactive
   │
   ▼
7. User clicks "Order Now" → Client-side navigation
```

**Performance:**
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2s
- Time to Interactive (TTI): < 2.5s

### 2. Service Detail Page Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              SERVICE DETAIL DATA FLOW (SSG + ISR)                │
└─────────────────────────────────────────────────────────────────┘

1. Request: GET /services/cazier-fiscal
   │
   ▼
2. Next.js checks static cache
   │
   ├─ Cache HIT (< 1h old)
   │  └─ Return cached HTML (< 100ms)
   │
   └─ Cache MISS or stale
      │
      ▼
      3. Server Component (page.tsx)
         │ - generateStaticParams() for MVP services
         │ - Fetch service + options
         │
         ▼
      4. Query:
         SELECT s.*, array_agg(so.*) as options
         FROM services s
         LEFT JOIN service_options so ON so.service_id = s.id
         WHERE s.slug = 'cazier-fiscal'
           AND s.is_active = true
         GROUP BY s.id
         │
         ▼
      5. Generate HTML + JSON payload
         │
         ▼
      6. Cache HTML (revalidate: 3600s)
         │
         ▼
      7. Return to client
         │
         ▼
      8. Background: ISR regenerates if > 1h old
```

**Caching:**
- Static pages generated at build time for MVP services
- ISR revalidates every 1 hour (3600s)
- On-demand revalidation via webhook when service updated

### 3. Client-Side Filtering Flow (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│              CLIENT-SIDE FILTERING (React Query)                 │
└─────────────────────────────────────────────────────────────────┘

1. User selects filter: category = "fiscale"
   │
   ▼
2. useServices({ category: 'fiscale' }) hook triggered
   │
   ▼
3. React Query checks cache
   │
   ├─ Cache HIT (< 5min old)
   │  └─ Return cached data (instant)
   │
   └─ Cache MISS or stale
      │
      ▼
      4. Fetch: GET /api/services?category=fiscale
         │
         ▼
      5. API Route Handler
         │ - Validate query params (Zod)
         │ - Query Supabase
         │
         ▼
      6. Return JSON response
         │
         ▼
      7. React Query caches response
         │
         ▼
      8. Component re-renders with new data
```

**Cache Invalidation:**
- Automatic: staleTime 5 minutes, gcTime 10 minutes
- Manual: queryClient.invalidateQueries(['services'])
- Background refetch: refetchOnWindowFocus, refetchOnReconnect

---

## Component Architecture

### Component Tree

```
app/
├─ layout.tsx (Root Server Component)
│  └─ QueryClientProvider (Client Component)
│
├─ page.tsx (Homepage Server Component)
│  ├─ Hero (Server Component)
│  ├─ FeaturedServices (Server Component)
│  │  └─ ServiceCard (Client Component) ×3
│  │     ├─ Badge (shadcn/ui)
│  │     ├─ Card (shadcn/ui)
│  │     └─ Button → Link to detail
│  └─ ...
│
└─ services/
   └─ [slug]/
      └─ page.tsx (Server Component, SSG)
         ├─ ServiceHeader (Server Component)
         ├─ ServiceDetails (Server Component)
         ├─ ServiceOptions (Server Component)
         ├─ OrderCTA (Client Component)
         └─ ...
```

### Server vs Client Component Decisions

| Component | Type | Reason |
|-----------|------|--------|
| `page.tsx` (homepage) | Server | SEO, data fetching, no interactivity |
| `FeaturedServices` | Server | Render with data, no state |
| `ServiceCard` | Client | Hover effects, click handlers |
| `page.tsx` (service detail) | Server | SEO critical, static generation |
| `ServiceHeader` | Server | Static content, no interactivity |
| `ServiceOptions` | Server | Display only, no state yet |
| `OrderCTA` | Client | Button click → navigation |
| `ServiceFilter` (future) | Client | Interactive filtering |
| `ServiceGrid` (future) | Client | Real-time search, pagination |

**Decision Matrix:**

```
Does it need useState/useEffect/event handlers? → Client Component
Does it fetch data for SEO? → Server Component
Is it purely presentational? → Server Component (default)
Does it use React Query? → Client Component
Does it need browser APIs? → Client Component
```

---

## State Management

### 1. Server State (React Query)

Used for data fetched from APIs (services, orders).

```typescript
// Query Keys
export const queryKeys = {
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (filters: ServiceFilters) =>
      [...queryKeys.services.lists(), filters] as const,
    details: () => [...queryKeys.services.all, 'detail'] as const,
    detail: (slug: string) =>
      [...queryKeys.services.details(), slug] as const,
  },
};

// Usage in component
const { data, isLoading, error } = useServices({
  category: 'fiscale'
});
```

### 2. Local UI State (React useState)

Used for temporary UI state (filters, search input, modals).

```typescript
// Filter state (Client Component)
const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | null>(null);
const [sortBy, setSortBy] = useState<SortOption>('display_order');
```

### 3. URL State (Next.js searchParams)

Used for shareable state (category, page, sort).

```typescript
// Server Component
export default async function ServicesPage({
  searchParams
}: {
  searchParams: { category?: string; sort?: string; page?: string }
}) {
  const category = searchParams.category;
  const sort = searchParams.sort || 'display_order';
  const page = parseInt(searchParams.page || '1');

  // Fetch data based on URL params
}

// Client Component navigation
const router = useRouter();
const handleCategoryChange = (category: string) => {
  router.push(`/services?category=${category}`);
};
```

### 4. Global Context (Future: Cart)

Used for global state (shopping cart, user preferences).

```typescript
// Cart Context (not implemented yet)
interface CartState {
  items: CartItem[];
  addItem: (service: Service, options: SelectedOptions) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  // ...
};
```

---

## Type Definitions

### Core Types (src/types/services.ts)

```typescript
// Service Category Enum
export type ServiceCategory =
  | 'fiscale'
  | 'juridice'
  | 'imobiliare'
  | 'comerciale'
  | 'auto'
  | 'personale';

// Service Entity
export interface Service {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  shortDescription: string | null;
  category: ServiceCategory;
  basePrice: number;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  requiresKyc: boolean;
  estimatedDays: number;
  urgentAvailable: boolean;
  urgentDays: number | null;
  config: ServiceConfig;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  options?: ServiceOption[];
}

// Service Option Entity
export interface ServiceOption {
  id: string;
  name: string;
  description: string | null;
  type: 'addon' | 'select' | 'input' | 'checkbox';
  priceModifier: number;
  isRequired: boolean;
  choices: OptionChoice[] | null;
  displayOrder: number;
}

// Option Choice
export interface OptionChoice {
  value: string;
  label: string;
  priceModifier: number;
}

// Service Configuration (JSONB)
export interface ServiceConfig {
  processing_steps?: string[];
  required_fields?: string[];
  required_documents?: string[];
  delivery_methods?: DeliveryMethod[];
  icon?: string;
  color?: string;
}

// Delivery Method
export interface DeliveryMethod {
  type: 'email' | 'registered_mail' | 'courier';
  name: string;
  price: number;
  estimated_days: number;
}

// API Response Types
export interface ServicesListResponse {
  success: true;
  data: {
    services: Service[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface ServiceDetailResponse {
  success: true;
  data: {
    service: Service;
  };
}

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// React Query Types
export interface ServiceFilters {
  category?: ServiceCategory;
  sort?: 'display_order' | 'price_asc' | 'price_desc' | 'popular';
  limit?: number;
  offset?: number;
}

export interface UseServicesResult {
  services: Service[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export interface UseServiceResult {
  service: Service | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
```

### Validation Schemas (src/lib/validations/services.ts)

```typescript
import { z } from 'zod';

// Service Category Schema
export const serviceCategorySchema = z.enum([
  'fiscale',
  'juridice',
  'imobiliare',
  'comerciale',
  'auto',
  'personale',
]);

// Service Filters Schema (query params)
export const serviceFiltersSchema = z.object({
  category: serviceCategorySchema.optional(),
  sort: z.enum(['display_order', 'price_asc', 'price_desc', 'popular']).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

// Service Slug Schema (path param)
export const serviceSlugSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

// Validate filters
export function validateServiceFilters(params: unknown) {
  return serviceFiltersSchema.parse(params);
}

// Validate slug
export function validateServiceSlug(slug: unknown) {
  return serviceSlugSchema.parse(slug);
}
```

---

## React Query Hooks

### 1. useServices Hook

**File:** `src/hooks/use-services.ts`

```typescript
'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ServiceFilters, ServicesListResponse, Service } from '@/types/services';
import { queryKeys } from '@/lib/query-keys';

interface UseServicesOptions extends ServiceFilters {
  enabled?: boolean;
}

export function useServices(
  filters: UseServicesOptions = {},
  options?: Omit<UseQueryOptions<ServicesListResponse>, 'queryKey' | 'queryFn'>
) {
  const { enabled = true, ...queryFilters } = filters;

  return useQuery({
    queryKey: queryKeys.services.list(queryFilters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (queryFilters.category) params.append('category', queryFilters.category);
      if (queryFilters.sort) params.append('sort', queryFilters.sort);
      if (queryFilters.limit) params.append('limit', queryFilters.limit.toString());
      if (queryFilters.offset) params.append('offset', queryFilters.offset.toString());

      const response = await fetch(`/api/services?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data: ServicesListResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Unknown error');
      }

      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    ...options,
  });
}

// Convenience hook for featured services
export function useFeaturedServices() {
  return useServices(
    { limit: 3 },
    {
      // Override with longer stale time for homepage
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );
}

// Convenience hook for category filtering
export function useServicesByCategory(category: ServiceCategory) {
  return useServices({ category });
}
```

### 2. useService Hook (Detail)

**File:** `src/hooks/use-service.ts`

```typescript
'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ServiceDetailResponse, Service } from '@/types/services';
import { queryKeys } from '@/lib/query-keys';

interface UseServiceOptions {
  enabled?: boolean;
}

export function useService(
  slug: string,
  options?: UseServiceOptions & Omit<UseQueryOptions<ServiceDetailResponse>, 'queryKey' | 'queryFn'>
) {
  const { enabled = true, ...queryOptions } = options || {};

  return useQuery({
    queryKey: queryKeys.services.detail(slug),
    queryFn: async () => {
      const response = await fetch(`/api/services/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service not found');
        }
        throw new Error('Failed to fetch service');
      }

      const data: ServiceDetailResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Unknown error');
      }

      return data;
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes (detail pages change rarely)
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error.message === 'Service not found') return false;
      return failureCount < 2;
    },
    ...queryOptions,
  });
}
```

### 3. Query Keys Factory

**File:** `src/lib/query-keys.ts`

```typescript
import { ServiceFilters } from '@/types/services';

export const queryKeys = {
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (filters: ServiceFilters) =>
      [...queryKeys.services.lists(), { ...filters }] as const,
    details: () => [...queryKeys.services.all, 'detail'] as const,
    detail: (slug: string) =>
      [...queryKeys.services.details(), slug] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
} as const;
```

### 4. React Query Provider Setup

**File:** `src/providers/query-provider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Global defaults
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

**Integration in layout.tsx:**

```typescript
import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## Caching Strategy

### Multi-Layer Caching

```
┌─────────────────────────────────────────────────────────────────┐
│                      CACHING ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Browser Cache (HTTP Cache-Control)                    │
│  ├─ Static assets: 1 year                                       │
│  └─ HTML pages: No cache (rely on Next.js)                      │
│                                                                  │
│  Layer 2: Next.js App Router Cache                              │
│  ├─ Full Route Cache (SSG pages): Indefinite until revalidate   │
│  ├─ Router Cache (client): 30 seconds                           │
│  └─ Data Cache (fetch): Per-request revalidation                │
│                                                                  │
│  Layer 3: React Query Cache (Client-side)                       │
│  ├─ Services list: 5 minutes stale, 10 minutes gc               │
│  ├─ Service detail: 30 minutes stale, 60 minutes gc             │
│  └─ Featured services: 15 minutes stale                         │
│                                                                  │
│  Layer 4: Supabase Connection Pool                              │
│  └─ Database connection reuse                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Caching Rules

| Resource | Strategy | Revalidate | Reason |
|----------|----------|------------|--------|
| Homepage (/) | SSR | On request | Dynamic content (auth state) |
| Service detail | SSG + ISR | 1 hour | Rarely changes, SEO critical |
| Service list API | No cache | Per request | Filtering/sorting variations |
| React Query | Memory | 5-30 min | Client-side performance |
| Static assets | Browser | 1 year | Immutable with hashed filenames |

### ISR Configuration

**File:** `src/app/services/[slug]/page.tsx`

```typescript
// Generate static pages for MVP services at build time
export async function generateStaticParams() {
  const mvpServices = [
    'cazier-fiscal',
    'extras-carte-funciara',
    'certificat-constatator',
  ];

  return mvpServices.map((slug) => ({ slug }));
}

// Enable ISR with 1-hour revalidation
export const revalidate = 3600; // 1 hour in seconds

// Dynamic segments not in generateStaticParams will 404
export const dynamicParams = false; // Set to true when all 12 services added
```

### Cache Invalidation

**Manual Invalidation (Admin Panel - Future):**

```typescript
// Trigger revalidation when service updated
async function onServiceUpdate(slug: string) {
  // Next.js On-Demand Revalidation
  await fetch(`/api/revalidate?path=/services/${slug}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
}

// API route: /api/revalidate
export async function POST(request: Request) {
  const { path } = await request.json();

  // Validate admin auth
  // ...

  await revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

**React Query Invalidation:**

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

function AdminServiceForm() {
  const queryClient = useQueryClient();

  const onSuccess = async () => {
    // Invalidate all service queries
    await queryClient.invalidateQueries({
      queryKey: queryKeys.services.all
    });

    // Or invalidate specific service
    await queryClient.invalidateQueries({
      queryKey: queryKeys.services.detail('cazier-fiscal')
    });
  };
}
```

---

## Error Handling

### Error Boundary Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR BOUNDARY HIERARCHY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  app/layout.tsx                                                  │
│  └─ Global Error Boundary (app/error.tsx)                       │
│     ├─ Catches unhandled errors                                 │
│     ├─ Shows generic error page                                 │
│     └─ Logs to Sentry/error tracking                            │
│                                                                  │
│  app/services/[slug]/page.tsx                                   │
│  └─ Service Error Boundary (app/services/[slug]/error.tsx)      │
│     ├─ Catches service fetch errors                             │
│     ├─ Shows "Service not found" UI                             │
│     └─ Provides "Back to services" link                         │
│                                                                  │
│  Component Level (React Query)                                  │
│  └─ useService hook error handling                              │
│     ├─ isError state                                            │
│     ├─ error object                                             │
│     └─ retry() function                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Error Types

**1. Network Errors (API unreachable)**

```typescript
// React Query automatic retry
useQuery({
  queryKey: ['services'],
  queryFn: fetchServices,
  retry: 2, // Retry twice before failing
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// Component UI
if (isError) {
  return (
    <div className="error-state">
      <AlertCircle className="text-destructive" />
      <p>Unable to load services. Please check your connection.</p>
      <Button onClick={() => refetch()}>Try Again</Button>
    </div>
  );
}
```

**2. Validation Errors (Invalid query params)**

```typescript
// API Route with Zod validation
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = validateServiceFilters({
      category: searchParams.get('category'),
      sort: searchParams.get('sort'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.flatten(),
          },
        },
        { status: 400 }
      );
    }
    // ...
  }
}
```

**3. Not Found Errors (Service doesn't exist)**

```typescript
// app/services/[slug]/page.tsx
export default async function ServicePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const service = await fetchService(slug);

  if (!service) {
    notFound(); // Triggers not-found.tsx
  }

  return <ServiceDetail service={service} />;
}

// app/services/[slug]/not-found.tsx
export default function ServiceNotFound() {
  return (
    <div className="container py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The service you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/services">Browse All Services</Link>
      </Button>
    </div>
  );
}
```

**4. Database Errors (Supabase down)**

```typescript
// API Route error handling
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch services',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { services: data } });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
```

### Loading States

**Skeleton Components:**

**File:** `src/components/services/service-card-skeleton.tsx`

```typescript
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ServiceCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
        <Skeleton className="h-4 w-full mb-1" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-5/6 mb-4" /> {/* Description line 2 */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-8 w-20" /> {/* Price */}
          <Skeleton className="h-5 w-16" /> {/* Badge */}
        </div>
        <Skeleton className="h-4 w-32" /> {/* Processing time */}
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" /> {/* Button */}
      </CardFooter>
    </Card>
  );
}

// Usage
function ServiceGrid() {
  const { data, isLoading } = useServices();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <div>...</div>;
}
```

---

## SEO Implementation

### Meta Tags Strategy

**File:** `src/app/services/[slug]/page.tsx`

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchService } from '@/lib/services';

// Generate dynamic metadata
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const service = await fetchService(params.slug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const title = service.metaTitle || `${service.name} - eGhiseul.ro`;
  const description = service.metaDescription || service.shortDescription || service.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://eghiseul.ro/services/${service.slug}`,
      siteName: 'eGhiseul.ro',
      locale: 'ro_RO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://eghiseul.ro/services/${service.slug}`,
    },
    robots: {
      index: service.isActive,
      follow: service.isActive,
    },
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await fetchService(params.slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.name,
            description: service.description,
            provider: {
              '@type': 'Organization',
              name: 'eGhiseul.ro',
              url: 'https://eghiseul.ro',
            },
            offers: {
              '@type': 'Offer',
              price: service.basePrice,
              priceCurrency: service.currency,
              availability: 'https://schema.org/InStock',
            },
            areaServed: {
              '@type': 'Country',
              name: 'Romania',
            },
          }),
        }}
      />

      <ServiceDetail service={service} />
    </>
  );
}
```

### Sitemap Generation

**File:** `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { fetchAllServices } from '@/lib/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await fetchAllServices();

  const servicePages = services.map((service) => ({
    url: `https://eghiseul.ro/services/${service.slug}`,
    lastModified: new Date(service.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://eghiseul.ro',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://eghiseul.ro/services',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...servicePages,
  ];
}
```

### robots.txt

**File:** `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account/'],
      },
    ],
    sitemap: 'https://eghiseul.ro/sitemap.xml',
  };
}
```

---

## File Structure

```
eghiseul.ro/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with QueryProvider
│   │   ├── page.tsx                      # Homepage with featured services
│   │   ├── error.tsx                     # Global error boundary
│   │   ├── not-found.tsx                 # Global 404 page
│   │   ├── sitemap.ts                    # Dynamic sitemap
│   │   ├── robots.ts                     # robots.txt
│   │   │
│   │   ├── services/
│   │   │   ├── page.tsx                  # Services catalog (future)
│   │   │   ├── loading.tsx               # Services loading state
│   │   │   ├── error.tsx                 # Services error boundary
│   │   │   │
│   │   │   └── [slug]/
│   │   │       ├── page.tsx              # Service detail (SSG + ISR)
│   │   │       ├── loading.tsx           # Service loading state
│   │   │       ├── error.tsx             # Service error boundary
│   │   │       └── not-found.tsx         # Service 404 page
│   │   │
│   │   └── api/
│   │       └── services/
│   │           ├── route.ts              # GET /api/services (existing)
│   │           └── [slug]/
│   │               └── route.ts          # GET /api/services/[slug] (existing)
│   │
│   ├── components/
│   │   ├── services/
│   │   │   ├── service-card.tsx          # Individual service card (Client)
│   │   │   ├── service-card-skeleton.tsx # Loading skeleton
│   │   │   ├── service-grid.tsx          # Grid layout (Client)
│   │   │   ├── service-filter.tsx        # Category filter (Client)
│   │   │   ├── featured-services.tsx     # Homepage featured (Server)
│   │   │   ├── service-header.tsx        # Detail page header (Server)
│   │   │   ├── service-details.tsx       # Detail page content (Server)
│   │   │   ├── service-options.tsx       # Options display (Server)
│   │   │   └── order-cta.tsx             # Order button (Client)
│   │   │
│   │   └── ui/                           # shadcn/ui components (existing)
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── skeleton.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── use-services.ts               # React Query hook (NEW)
│   │   ├── use-service.ts                # React Query hook (NEW)
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── query-keys.ts                 # Centralized query keys (NEW)
│   │   ├── services.ts                   # Service fetching utilities (NEW)
│   │   │
│   │   ├── validations/
│   │   │   ├── services.ts               # Zod schemas (NEW)
│   │   │   └── ...
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Client Supabase (existing)
│   │   │   └── server.ts                 # Server Supabase (existing)
│   │   │
│   │   └── utils.ts                      # Utilities (existing)
│   │
│   ├── providers/
│   │   └── query-provider.tsx            # React Query provider (NEW)
│   │
│   └── types/
│       ├── services.ts                   # Service type definitions (NEW)
│       └── supabase.ts                   # Supabase types (existing)
│
├── docs/
│   └── technical/
│       ├── sprint-3-service-catalog-architecture.md  # This document
│       └── api/
│           └── services-api.md           # API documentation (existing)
│
└── package.json
```

---

## Implementation Checklist

### Phase 1: Setup (Day 1)

- [ ] Install React Query DevTools (dev dependency)
- [ ] Create `src/providers/query-provider.tsx`
- [ ] Wrap app in `QueryProvider` (app/layout.tsx)
- [ ] Create `src/lib/query-keys.ts`
- [ ] Create `src/types/services.ts`
- [ ] Create `src/lib/validations/services.ts`

### Phase 2: Hooks (Day 1-2)

- [ ] Create `src/hooks/use-services.ts`
- [ ] Create `src/hooks/use-service.ts`
- [ ] Create `src/lib/services.ts` (fetch utilities)
- [ ] Test hooks in development

### Phase 3: Components (Day 2-3)

- [ ] Create `src/components/services/service-card-skeleton.tsx`
- [ ] Create `src/components/services/service-card.tsx` (Client)
- [ ] Create `src/components/services/featured-services.tsx` (Server)
- [ ] Create `src/components/services/service-header.tsx` (Server)
- [ ] Create `src/components/services/service-details.tsx` (Server)
- [ ] Create `src/components/services/order-cta.tsx` (Client)

### Phase 4: Pages (Day 3-4)

- [ ] Update `src/app/page.tsx` (homepage with featured services)
- [ ] Create `src/app/services/[slug]/page.tsx` (SSG + ISR)
- [ ] Implement `generateStaticParams()` for MVP services
- [ ] Implement `generateMetadata()` for SEO
- [ ] Add JSON-LD structured data
- [ ] Create error.tsx and not-found.tsx for service pages

### Phase 5: SEO (Day 4)

- [ ] Create `src/app/sitemap.ts`
- [ ] Create `src/app/robots.ts`
- [ ] Test meta tags in browser dev tools
- [ ] Validate structured data with Google Rich Results Test

### Phase 6: Testing (Day 5)

- [ ] Test SSG build for 3 MVP services
- [ ] Test ISR revalidation
- [ ] Test React Query caching behavior
- [ ] Test error states (network errors, 404s)
- [ ] Test loading states
- [ ] Mobile responsiveness testing
- [ ] Lighthouse performance audit

---

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Homepage FCP | < 1.5s | TBD | - |
| Homepage LCP | < 2.5s | TBD | - |
| Homepage TTI | < 3.5s | TBD | - |
| Service Detail FCP | < 1.0s (SSG) | TBD | - |
| Service Detail LCP | < 2.0s | TBD | - |
| API Response Time (p95) | < 500ms | TBD | - |
| React Query Cache Hit Rate | > 80% | TBD | - |
| Lighthouse Performance Score | > 90 | TBD | - |
| Lighthouse SEO Score | 100 | TBD | - |
| Lighthouse Accessibility Score | > 90 | TBD | - |

---

## Migration Notes

### From Client-Side Only to Hybrid

**Before (Client-Side Rendering):**
```typescript
// ❌ Old approach (CSR only)
function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data.services);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return <ServiceGrid services={services} />;
}
```

**After (Hybrid with React Query):**
```typescript
// ✅ New approach (Hybrid)

// Server Component (initial render)
export default async function ServicesPage() {
  const services = await fetchServices(); // Direct DB query

  return (
    <div>
      <FeaturedServices initialData={services} />
      <ServiceFilter /> {/* Client Component with React Query */}
    </div>
  );
}

// Client Component (interactive filtering)
'use client';
function ServiceFilter() {
  const [category, setCategory] = useState(null);
  const { data } = useServices({ category }); // React Query

  return <ServiceGrid services={data?.services} />;
}
```

### Benefits of Hybrid Approach

1. **SEO:** Server Components render HTML with content for crawlers
2. **Performance:** Faster FCP with server-rendered HTML
3. **Interactivity:** Client Components for filtering, search
4. **Caching:** Multi-layer caching (Next.js + React Query)
5. **Developer Experience:** Use React Query for client-side state management

---

## Security Considerations

### API Security

```typescript
// Rate limiting (future implementation)
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
});

export async function GET(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

### XSS Prevention

```typescript
// All user input sanitized via Zod validation
import { z } from 'zod';

// ✅ Safe: Validated and sanitized
const filters = serviceFiltersSchema.parse(params);

// ❌ Unsafe: Direct use of user input
const category = searchParams.get('category'); // Don't use directly
```

### CORS Configuration

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://eghiseul.ro' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

---

## Monitoring & Observability

### Metrics to Track

```typescript
// Future: Send metrics to analytics
function trackServiceView(slug: string) {
  if (typeof window !== 'undefined') {
    window.gtag?.('event', 'view_service', {
      service_slug: slug,
    });
  }
}

function trackServiceError(error: Error, context: string) {
  console.error(`[${context}]`, error);
  // Future: Send to Sentry
  // Sentry.captureException(error, { tags: { context } });
}
```

### React Query DevTools

```typescript
// Development only
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  {process.env.NODE_ENV === 'development' && (
    <ReactQueryDevtools initialIsOpen={false} />
  )}
</QueryClientProvider>
```

---

## Related Documents

- [Services API Documentation](/Users/raullutas/eghiseul.ro/docs/technical/api/services-api.md)
- [Sprint 3: KYC & Documents](/Users/raullutas/eghiseul.ro/docs/sprints/sprint-3-kyc-documents.md)
- [Development Master Plan](/Users/raullutas/eghiseul.ro/DEVELOPMENT_MASTER_PLAN.md)
- [Database Schema](/Users/raullutas/eghiseul.ro/supabase/migrations/)

---

## Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-16 | 1.0 | Initial architecture design | System Architect |

---

**Status:** Ready for Implementation
**Next Steps:** Begin Phase 1 (Setup) following the implementation checklist
**Questions:** Contact tech lead or post in #eghiseul-dev Slack channel
