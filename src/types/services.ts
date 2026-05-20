// Service Category Enum
export type ServiceCategory =
  | 'fiscale'
  | 'juridice'
  | 'imobiliare'
  | 'comerciale'
  | 'auto'
  | 'personale';

// Import verification config type
import type { ServiceVerificationConfig } from './verification-modules';

// Service Entity
export interface Service {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category: ServiceCategory;
  base_price: number;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  requires_kyc: boolean;
  estimated_days: number;
  urgent_available: boolean;
  urgent_days: number | null;
  config: ServiceConfig | null;
  verification_config: ServiceVerificationConfig | null;  // NEW: Modular verification configuration
  /**
   * Optional per-service processing metadata (JSONB).
   * Currently used by price sidebar to display a range string
   * (`estimated_days_display`) instead of the single `estimated_days` number.
   */
  processing_config?: {
    estimated_days_display?: string;
    [key: string]: unknown;
  } | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  options?: ServiceOption[];
}

/**
 * Format the estimated delivery time for display.
 * Prefers the custom `estimated_days_display` range from `processing_config`
 * (e.g., "2-4 zile lucrătoare") when set, otherwise falls back to the
 * single `estimated_days` number (e.g., "3 zile lucrătoare").
 */
export function formatEstimatedDays(service: Pick<Service, 'estimated_days' | 'processing_config'>): string {
  return service.processing_config?.estimated_days_display
    ?? `${service.estimated_days} zile lucrătoare`;
}

// Service Option Entity
export interface ServiceOption {
  id: string;
  service_id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  price_type?: 'fixed' | 'percentage';
  is_required: boolean;
  is_active: boolean;
  max_quantity?: number;
  config?: Record<string, unknown> | null;
  display_order: number;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

// Option Choice (for select-type options)
export interface OptionChoice {
  value: string;
  label: string;
  price: number;
}

// Service Configuration (JSONB) - Legacy config
export interface ServiceConfig {
  processing_steps?: string[];
  required_fields?: string[];
  required_documents?: string[];
  delivery_methods?: DeliveryMethod[];
  icon?: string;
  color?: string;
}

// Re-export verification module types for convenience
export type { ServiceVerificationConfig } from './verification-modules';

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
    details?: Record<string, unknown>;
  };
}

// React Query Types
export interface ServiceFilters {
  category?: ServiceCategory;
  sort?: 'display_order' | 'price_asc' | 'price_desc' | 'popular';
  limit?: number;
  offset?: number;
}
