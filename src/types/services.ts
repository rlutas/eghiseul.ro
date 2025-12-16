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
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  options?: ServiceOption[];
}

// Service Option Entity
export interface ServiceOption {
  id: string;
  service_id: string;
  name: string;
  code: string;
  description: string | null;
  option_type: 'addon' | 'select' | 'input' | 'checkbox';
  price_modifier: number;
  is_required: boolean;
  choices: OptionChoice[] | null;
  display_order: number;
}

// Option Choice
export interface OptionChoice {
  value: string;
  label: string;
  price_modifier: number;
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
