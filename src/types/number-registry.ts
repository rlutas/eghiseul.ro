// src/types/number-registry.ts

export interface NumberRange {
  id: string;
  type: 'contract' | 'delegation';
  year: number;
  range_start: number;
  range_end: number;
  next_number: number;
  series: string | null;
  status: 'active' | 'exhausted' | 'archived';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NumberRangeWithStats extends NumberRange {
  total: number;
  used: number;
  available: number;
  usage_percent: number;
}

export interface NumberRegistryEntry {
  id: string;
  range_id: string | null;
  number: number;
  type: 'contract' | 'delegation';
  series: string | null;
  year: number;
  order_id: string | null;
  order_document_id: string | null;
  client_name: string;
  client_email: string | null;
  client_cnp: string | null;
  client_cui: string | null;
  service_type: string | null;
  description: string | null;
  amount: number | null;
  source: 'platform' | 'manual' | 'reserved' | 'voided';
  date: string;
  created_by: string | null;
  created_at: string;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
}

export interface AllocateNumberResult {
  allocated_number: number;
  allocated_series: string | null;
  allocated_year: number;
  range_id: string;
  registry_id: string;
}

export interface FindExistingNumberResult {
  registry_id: string;
  existing_number: number;
  existing_series: string | null;
  existing_year: number;
}

export interface CreateNumberRangeParams {
  type: 'contract' | 'delegation';
  year: number;
  range_start: number;
  range_end: number;
  series?: string;
  notes?: string;
}

export interface ManualNumberEntryParams {
  type: 'contract' | 'delegation';
  client_name: string;
  client_email?: string;
  client_cnp?: string;
  client_cui?: string;
  service_type?: string;
  description?: string;
  amount?: number;
  date?: string;
}

export interface NumberRegistryFilters {
  type?: 'contract' | 'delegation';
  year?: number;
  source?: 'platform' | 'manual' | 'reserved' | 'voided';
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
