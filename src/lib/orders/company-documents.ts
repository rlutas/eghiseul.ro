/**
 * Company documents on a PJ order.
 *
 * A PDF goes straight from the browser to S3 under the order's client-file
 * namespace, because base64 inside the autosave hits Vercel's 4.5 MB body limit
 * (E-261105-MPVQH: HTTP 413 on every later save). `/submit` then copies it to
 * `kyc/<orderId>/company_<type>.<ext>`, where the other company documents live.
 *
 * `s3Key` comes back from the browser inside `customer_data`, so it proves
 * nothing until it is checked against this order: a made-up key must never make
 * the team open another customer's file.
 */

import { isClientFileKey } from '@/lib/orders/client-files';

export type CompanyDocumentKeyKind = 'final' | 'staged' | 'foreign';

export function classifyCompanyDocumentKey(orderId: string, key: unknown): CompanyDocumentKeyKind {
  if (typeof key !== 'string' || key.includes('..') || key.includes('//')) return 'foreign';
  if (key.startsWith(`kyc/${orderId}/`)) return 'final';
  return isClientFileKey(orderId, key) ? 'staged' : 'foreign';
}

export function finalCompanyDocumentKey(
  orderId: string,
  docType: string | undefined,
  mimeType: string | undefined
): string {
  const name = (docType ?? '').replace(/[^a-z0-9_]/gi, '') || 'document';
  const ext = mimeType?.includes('png') ? 'png' : mimeType?.includes('pdf') ? 'pdf' : 'jpg';
  return `kyc/${orderId}/company_${name}.${ext}`;
}

export interface CompanyDocumentRecord {
  id?: string;
  type?: string;
  mimeType?: string;
  s3Key?: string;
  base64?: string;
}

interface SettleDeps {
  copyFile: (sourceKey: string, destinationKey: string) => Promise<string>;
  uploadBase64: (
    key: string,
    base64: string,
    contentType: string,
    metadata?: Record<string, string>
  ) => Promise<unknown>;
}

/**
 * At submit: drop what points outside this order, then bring every document to
 * its final key. A failed copy or upload leaves the document as it was, so the
 * order goes on and the team still has the file.
 */
export async function settleCompanyDocuments<T extends CompanyDocumentRecord>(
  orderId: string,
  documents: T[],
  deps: SettleDeps
): Promise<T[]> {
  const kept = documents.filter((doc) => {
    if (!doc.s3Key || classifyCompanyDocumentKey(orderId, doc.s3Key) !== 'foreign') return true;
    console.error(`[submit] company document with a foreign key dropped: order ${orderId}, type ${doc.type}`);
    return false;
  });

  for (const doc of kept) {
    if (doc.s3Key) {
      if (classifyCompanyDocumentKey(orderId, doc.s3Key) !== 'staged') continue;
      try {
        doc.s3Key = await deps.copyFile(doc.s3Key, finalCompanyDocumentKey(orderId, doc.type, doc.mimeType));
      } catch (err) {
        console.error(`Failed to copy company KYC doc ${doc.type} in S3:`, err);
      }
    } else if (doc.base64) {
      try {
        const s3Key = finalCompanyDocumentKey(orderId, doc.type || doc.id, doc.mimeType);
        await deps.uploadBase64(s3Key, doc.base64, doc.mimeType || 'image/jpeg', {
          'order-id': orderId,
          'document-type': doc.type || 'unknown',
          'uploaded-at': new Date().toISOString(),
        });
        doc.s3Key = s3Key;
        delete doc.base64;
      } catch (err) {
        console.error(`Failed to upload company KYC doc ${doc.type} to S3:`, err);
      }
    }
  }
  return kept;
}
