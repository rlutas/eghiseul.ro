/**
 * Oblio API Client
 *
 * Handles authentication and API requests to Oblio.
 * Uses OAuth 2.0 with client credentials flow.
 *
 * API Docs: https://www.oblio.eu/api
 */

import type {
  OblioApiResponse,
  OblioTokenResponse,
  OblioConfig,
} from './types';

// ============================================================================
// Configuration
// ============================================================================

const OBLIO_BASE_URL = 'https://www.oblio.eu/api';

function getConfig(): OblioConfig {
  const clientId = process.env.OBLIO_CLIENT_ID;
  const clientSecret = process.env.OBLIO_CLIENT_SECRET;
  const companyCif = process.env.OBLIO_COMPANY_CIF;
  const seriesName = process.env.OBLIO_SERIES_NAME || 'EGH';

  if (!clientId || !clientSecret || !companyCif) {
    throw new Error(
      'Missing Oblio configuration. Set OBLIO_CLIENT_ID, OBLIO_CLIENT_SECRET, and OBLIO_COMPANY_CIF'
    );
  }

  return { clientId, clientSecret, companyCif, seriesName };
}

// ============================================================================
// Token Management
// ============================================================================

interface CachedToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: CachedToken | null = null;

/**
 * Get valid access token, refreshing if needed
 * Token is cached with 5 minute buffer before expiry
 */
export async function getOblioToken(): Promise<string> {
  const bufferMs = 5 * 60 * 1000; // 5 minutes

  // Return cached token if still valid
  if (cachedToken && cachedToken.expires_at > Date.now() + bufferMs) {
    return cachedToken.access_token;
  }

  // Get new token
  const config = getConfig();

  const response = await fetch(`${OBLIO_BASE_URL}/authorize/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Oblio auth failed:', errorText);
    throw new Error(`Oblio authentication failed: ${response.status}`);
  }

  const data: OblioTokenResponse = await response.json();

  // Cache token with expiry timestamp
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.access_token;
}

/**
 * Clear cached token (useful for testing or on auth errors)
 */
export function clearTokenCache(): void {
  cachedToken = null;
}

// ============================================================================
// API Request Helper
// ============================================================================

export interface OblioRequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
}

/**
 * Make authenticated request to Oblio API
 */
export async function oblioRequest<T>(
  options: OblioRequestOptions
): Promise<T> {
  const { endpoint, method = 'GET', body } = options;

  const token = await getOblioToken();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const config = getConfig();

  const url = `${OBLIO_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Oblio API error:', response.status, errorText);

    // Clear token cache on 401 (might be expired)
    if (response.status === 401) {
      clearTokenCache();
    }

    throw new Error(`Oblio API error: ${response.status} - ${errorText}`);
  }

  const data: OblioApiResponse<T> = await response.json();

  if (data.status !== 200) {
    throw new Error(`Oblio error: ${data.statusMessage}`);
  }

  return data.data;
}

/**
 * Get Oblio configuration (for use in invoice creation)
 */
export function getOblioConfig(): OblioConfig {
  return getConfig();
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Test Oblio connection by getting token
 */
export async function testOblioConnection(): Promise<boolean> {
  try {
    await getOblioToken();
    return true;
  } catch {
    return false;
  }
}
