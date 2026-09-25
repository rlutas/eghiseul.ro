/**
 * Files a CLIENT gives us about an order: acts that help identify a property
 * (old CF extract, title deed, sale contract — uploaded in the wizard) and
 * attachments to their replies in the order's message thread.
 *
 * All of them live under ONE S3 namespace per order, `orders/<id>/acte-client/`.
 * Keys come back from the browser (the wizard keeps them in its draft state,
 * the message form posts them), so every server path that stores or serves a
 * key checks it against this namespace first — a key the client made up must
 * never open another order's file.
 */

import { generateFileId, getExtensionFromContentType } from '@/lib/aws/s3';

export const CLIENT_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;
export const CLIENT_FILE_MAX_BYTES = 10 * 1024 * 1024;
/** Per upload list (wizard acts / one message). */
export const CLIENT_FILES_MAX_COUNT = 5;

export interface ClientFile {
  key: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt?: string;
}

export function clientFilesPrefix(orderId: string): string {
  return `orders/${orderId}/acte-client/`;
}

export function buildClientFileKey(orderId: string, contentType: string): string {
  const ext = getExtensionFromContentType(contentType);
  return `${clientFilesPrefix(orderId)}${generateFileId()}.${ext}`;
}

/** True when the key is a plain object key inside this order's namespace. */
export function isClientFileKey(orderId: string, key: unknown): key is string {
  if (typeof key !== 'string') return false;
  if (key.includes('..') || key.includes('//')) return false;
  return key.startsWith(clientFilesPrefix(orderId)) && key.length < 200;
}

/**
 * Keep only well-formed entries in this order's namespace, capped. Used when
 * the list comes from the browser (draft save, submit, message post).
 */
export function sanitizeClientFiles(orderId: string, list: unknown): ClientFile[] {
  if (!Array.isArray(list)) return [];
  const out: ClientFile[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const f = raw as Record<string, unknown>;
    if (!isClientFileKey(orderId, f.key)) continue;
    const mimeType = typeof f.mimeType === 'string' ? f.mimeType : '';
    if (!(CLIENT_FILE_TYPES as readonly string[]).includes(mimeType)) continue;
    out.push({
      key: f.key,
      name: (typeof f.name === 'string' ? f.name : 'document').slice(0, 120),
      mimeType,
      size: typeof f.size === 'number' && f.size > 0 ? f.size : 0,
      uploadedAt: typeof f.uploadedAt === 'string' ? f.uploadedAt : undefined,
    });
    if (out.length >= CLIENT_FILES_MAX_COUNT) break;
  }
  return out;
}
