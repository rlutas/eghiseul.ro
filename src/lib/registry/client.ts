/**
 * Central Number Registry client
 * =============================================================================
 * Talks to the DEDICATED Supabase project that holds the Bar Association
 * (Baroul Satu Mare) number ranges + journal, shared by eghiseul.ro,
 * cazierjudiciaronline.com and ecazier.ro.
 *
 * This file is intentionally identical in all consumer repos — if you change
 * it here, copy it to the sister repo(s).
 *
 * Env (server-only, NEVER NEXT_PUBLIC): REGISTRY_SUPABASE_URL,
 * REGISTRY_SUPABASE_SERVICE_KEY.
 *
 * Schema + RPCs: eghiseul.ro/supabase/registry/001_registry_schema.sql.
 * allocate_number is IDEMPOTENT per (platform, order_ref, type, service_type)
 * — safe to call from Stripe webhooks that can fire more than once.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type RegistryPlatform = 'eghiseul' | 'cazierjudiciaronline' | 'ecazier';
export type RegistryNumberType = 'contract' | 'delegation';

export interface AllocateNumberParams {
  type: RegistryNumberType;
  platform: RegistryPlatform;
  orderRef: string;
  year?: number;
  orderDocumentRef?: string;
  clientName: string;
  clientEmail?: string;
  clientCnp?: string;
  clientCui?: string;
  serviceType?: string;
  description?: string;
  amount?: number;
  createdBy?: string;
}

export interface AllocateResult {
  number: number;
  series: string | null;
  year: number;
  rangeId: string;
  registryId: string;
  /** TRUE when an existing live allocation was returned (idempotent reuse). */
  reused: boolean;
}

export interface FindExistingResult {
  registryId: string;
  number: number;
  series: string | null;
  year: number;
}

let cachedClient: SupabaseClient | null = null;

/** Service-role client for the central registry project. Server-side only. */
export function getRegistryClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.REGISTRY_SUPABASE_URL;
  const key = process.env.REGISTRY_SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'Registry client: REGISTRY_SUPABASE_URL / REGISTRY_SUPABASE_SERVICE_KEY not configured'
    );
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

/**
 * Allocate (or idempotently reuse) a Bar number for an order.
 * Throws on registry errors — use allocateNumberSafe() in payment webhooks.
 */
export async function allocateNumber(params: AllocateNumberParams): Promise<AllocateResult> {
  const registry = getRegistryClient();

  const { data, error } = await registry.rpc('allocate_number', {
    p_type: params.type,
    p_year: params.year ?? null,
    p_platform: params.platform,
    p_order_ref: params.orderRef,
    p_order_doc_ref: params.orderDocumentRef ?? null,
    p_client_name: params.clientName || '',
    p_client_email: params.clientEmail ?? null,
    p_client_cnp: params.clientCnp ?? null,
    p_client_cui: params.clientCui ?? null,
    p_service_type: params.serviceType ?? null,
    p_description: params.description ?? null,
    p_amount: params.amount ?? null,
    p_source: 'platform',
    p_created_by: params.createdBy ?? params.platform,
  });

  if (error) {
    throw new Error(`Registry allocate_number failed: ${error.message} (code ${error.code})`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error('Registry allocate_number returned no row');
  }

  return {
    number: row.allocated_number,
    series: row.allocated_series ?? null,
    year: row.allocated_year,
    rangeId: row.range_id,
    registryId: row.registry_id,
    reused: !!row.reused,
  };
}

/** Never-throwing variant for payment webhooks (fail-soft, D3). */
export async function allocateNumberSafe(
  params: AllocateNumberParams
): Promise<{ ok: true; data: AllocateResult } | { ok: false; error: string }> {
  try {
    const data = await allocateNumber(params);
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[registry] allocateNumberSafe failed:', message);
    return { ok: false, error: message };
  }
}

/** Look up an existing non-voided allocation (e.g. contract nr. for the împuternicire). */
export async function findExistingNumber(
  platform: RegistryPlatform,
  orderRef: string,
  type: RegistryNumberType,
  serviceType?: string
): Promise<FindExistingResult | null> {
  const registry = getRegistryClient();

  const { data, error } = await registry.rpc('find_existing_number', {
    p_platform: platform,
    p_order_ref: orderRef,
    p_type: type,
    p_service_type: serviceType ?? null,
  });

  if (error) {
    throw new Error(`Registry find_existing_number failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    registryId: row.registry_id,
    number: row.existing_number,
    series: row.existing_series ?? null,
    year: row.existing_year,
  };
}

/** Void a registry entry (number stays consumed, never reused). */
export async function voidNumber(
  registryId: string,
  voidedBy: string,
  reason?: string
): Promise<void> {
  const registry = getRegistryClient();

  const { error } = await registry.rpc('void_number', {
    p_registry_id: registryId,
    p_voided_by: voidedBy,
    p_void_reason: reason ?? null,
  });

  if (error) {
    throw new Error(`Registry void_number failed: ${error.message}`);
  }
}

/** Zero-padded display form: contract '004271', delegation 'SM005757'. */
export function formatRegistryNumber(
  type: RegistryNumberType,
  number: number,
  series?: string | null
): string {
  const padded = String(number).padStart(6, '0');
  return type === 'delegation' ? `${series || 'SM'}${padded}` : padded;
}
