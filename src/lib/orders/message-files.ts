/**
 * Files the TEAM (admin) or the TOPOGRAPH (collaborator portal) attaches to a
 * message for the client — e.g. a photo of an unusable CF extract, so the
 * client sees what the problem is.
 *
 * They live in their own S3 namespace per order, `orders/<id>/mesaje-echipa/`,
 * separate from what the client uploads (`acte-client/`), so a client key can
 * never be passed off as a staff file and vice versa. Same accepted types and
 * limits as the client side: PDF, JPG, PNG, WebP; 10 MB; 5 per message.
 *
 * Pure helpers only (no S3 / DB calls) — shared by the presign routes, the
 * message post and the tests.
 */

import { generateFileId, getExtensionFromContentType } from '@/lib/aws/s3';
import {
  CLIENT_FILE_MAX_BYTES,
  CLIENT_FILE_TYPES,
  CLIENT_FILES_MAX_COUNT,
  isClientFileKey,
  sanitizeFileList,
  type ClientFile,
} from '@/lib/orders/client-files';

export const MESSAGE_FILE_TYPES = CLIENT_FILE_TYPES;
export const MESSAGE_FILE_MAX_BYTES = CLIENT_FILE_MAX_BYTES;
export const MESSAGE_FILES_MAX_COUNT = CLIENT_FILES_MAX_COUNT;
/** What the file picker accepts (extensions too: some OSes send an empty type). */
export const MESSAGE_FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp';

export function staffMessageFilesPrefix(orderId: string): string {
  return `orders/${orderId}/mesaje-echipa/`;
}

export function buildStaffMessageFileKey(orderId: string, contentType: string): string {
  const ext = getExtensionFromContentType(contentType);
  return `${staffMessageFilesPrefix(orderId)}${generateFileId()}.${ext}`;
}

/** True when the key is a plain object key in this order's staff namespace. */
export function isStaffMessageFileKey(orderId: string, key: unknown): key is string {
  if (typeof key !== 'string') return false;
  if (key.includes('..') || key.includes('//')) return false;
  return key.startsWith(staffMessageFilesPrefix(orderId)) && key.length < 200;
}

/** Any key a message of this order may legitimately reference. */
export function isOrderMessageFileKey(orderId: string, key: unknown): key is string {
  return isClientFileKey(orderId, key) || isStaffMessageFileKey(orderId, key);
}

export function sanitizeStaffMessageFiles(orderId: string, list: unknown): ClientFile[] {
  return sanitizeFileList(list, (key) => isStaffMessageFileKey(orderId, key));
}

export type UploadCheck = { ok: true } | { ok: false; error: string };

/** Validates a presign request before any S3 call. Errors are Romanian (shown in the UI). */
export function validateMessageFileUpload(contentType: unknown, fileSize: unknown): UploadCheck {
  if (typeof contentType !== 'string' || !(MESSAGE_FILE_TYPES as readonly string[]).includes(contentType)) {
    return { ok: false, error: 'Se pot atașa doar PDF, JPG, PNG sau WebP' };
  }
  const size = Number(fileSize);
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, error: 'Fișierul este gol (0 KB)' };
  }
  if (size > MESSAGE_FILE_MAX_BYTES) {
    return { ok: false, error: 'Fișierul are peste 10 MB' };
  }
  return { ok: true };
}

/**
 * Validates the attachment list the staff posts with a message. Unlike the
 * client side (which silently drops bad entries), staff gets a clear error:
 * a file that silently vanished would leave the client without the document
 * the message talks about.
 */
export function checkStaffAttachments(
  orderId: string,
  list: unknown
): { ok: true; files: ClientFile[] } | { ok: false; error: string } {
  if (list === undefined || list === null) return { ok: true, files: [] };
  if (!Array.isArray(list)) return { ok: false, error: 'Atașamente invalide' };
  if (list.length > MESSAGE_FILES_MAX_COUNT) {
    return { ok: false, error: `Se pot atașa cel mult ${MESSAGE_FILES_MAX_COUNT} fișiere la un mesaj` };
  }
  const files = sanitizeStaffMessageFiles(orderId, list);
  if (files.length !== list.length) return { ok: false, error: 'Atașament invalid. Încărcați fișierul din nou.' };
  return { ok: true, files };
}

/** Message text stored when the staff sends only files (the body column is NOT NULL, 1–4000 chars). */
export function defaultBodyForAttachments(count: number): string {
  return count === 1
    ? 'Vă trimitem atașat un document legat de comanda dumneavoastră.'
    : `Vă trimitem atașate ${count} documente legate de comanda dumneavoastră.`;
}

/** The files presign endpoint next to a messages endpoint, keeping its query (`?as=` preview). */
export function messageFilesEndpoint(messagesEndpoint: string): string {
  const [path, query] = messagesEndpoint.split('?');
  return `${path.replace(/\/$/, '')}/files${query ? `?${query}` : ''}`;
}
