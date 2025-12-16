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
    list: (filters: Record<string, unknown>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
} as const;
