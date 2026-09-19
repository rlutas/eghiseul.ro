/**
 * Brand of the CURRENT REQUEST, server side.
 *
 * ⚠️ `headers()` opts the calling route into dynamic rendering. Call
 * `getBrand()` only from layouts/pages that are dynamic anyway (wizard,
 * checkout, account, API routes) or from the documentero route group. Static
 * eghiseul pages must keep using `BASE_URL` / `buildPageMetadata` as before.
 */

import { headers } from 'next/headers';
import { brandFromHost, type Brand } from './brands';

export async function getBrand(): Promise<Brand> {
  const h = await headers();
  return brandFromHost(h.get('host') ?? h.get('x-forwarded-host'));
}

/** For route handlers that already hold the request. */
export function brandFromRequest(request: { headers: Headers }): Brand {
  return brandFromHost(request.headers.get('host') ?? request.headers.get('x-forwarded-host'));
}
