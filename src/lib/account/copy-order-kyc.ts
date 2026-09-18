/**
 * Copies the identity documents of an order into a customer's account.
 *
 * The order's documents are ALREADY in S3, at `kyc/<orderId>/<type>.jpg` —
 * `customer_data.personal.uploadedDocuments` carries `s3Key`, never `base64`
 * (the legacy inline shape is still accepted). The copy is server-side
 * (CopyObject), so no image is downloaded or re-uploaded. It has to happen:
 * `/api/upload/download` presigns a `kyc/` key only when the key contains the
 * caller's user id, so a row pointing at the order's key would be unreadable
 * from the account.
 *
 * Every insert is checked. Before migration 171 the CHECK on `document_type`
 * rejected `act_identitate`, `passport_opened` and the rest, and the original
 * loop failed on every document without anyone knowing, because the result was
 * never read.
 *
 * Used by `register-from-order` (a new account, with the customer's consent
 * ticked on the success page) and by `sync-paid-order` (an existing account
 * that just paid an order).
 */

import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isStorableKycDocumentType, isIdentityDocumentType, hasCompleteKyc } from '@/lib/kyc/identity-documents';
import {
  copyFile,
  generateKycKey,
  getDownloadUrl,
  getExtensionFromContentType,
  uploadKycDocument,
  type KycDocumentType,
} from '@/lib/aws/s3';
import { KYC_VALIDITY_DAYS } from '@/lib/kyc/constants';

export interface OrderUploadedDocument {
  id?: string;
  type: string;
  /** Where the wizard put the image. Present on every recent order. */
  s3Key?: string;
  /** Legacy: an inline image, with no S3 object behind it. */
  base64?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface OrderOcrResult {
  documentType: string;
  extractedData: Record<string, unknown>;
  confidence: number;
}

export interface CopyOrderKycResult {
  /** Rows written to `kyc_verifications`. */
  copied: number;
  /** At least one of them establishes WHO the person is. */
  identityCopied: boolean;
}

export async function copyOrderKycDocumentsToAccount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: SupabaseClient<any>,
  input: {
    userId: string;
    /** The order the documents came from — only keys under `kyc/<orderId>/` are copied. */
    orderId: string;
    uploadedDocuments: OrderUploadedDocument[];
    ocrResults: OrderOcrResult[];
    /** Prefix for the log lines, so a failure says which path it came from. */
    logPrefix: string;
  }
): Promise<CopyOrderKycResult> {
  const { userId, orderId, uploadedDocuments, ocrResults, logPrefix } = input;
  const allowedPrefix = `kyc/${orderId}/`;
  let copied = 0;
  let identityCopied = false;

  for (const doc of uploadedDocuments) {
    if (!isStorableKycDocumentType(doc.type)) {
      console.warn(`${logPrefix}: skipping unknown document type ${doc.type}`);
      continue;
    }

    const ocrResult = ocrResults.find((r) => r.documentType === doc.type);
    const mimeType = doc.mimeType || 'image/jpeg';
    const verificationId = randomUUID();
    // The document's own expiry when the OCR read one and it is still in the
    // future; otherwise the standard validity of a stored scan. Same rule as
    // `api/user/kyc/save`, so a document copied from an order does not outlive
    // one uploaded in the account.
    const ocrExpiry = ocrResult?.extractedData?.expiryDate;
    const parsedExpiry = typeof ocrExpiry === 'string' ? new Date(ocrExpiry) : null;
    const expiresAt =
      parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) && parsedExpiry > new Date()
        ? parsedExpiry
        : new Date(Date.now() + KYC_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

    // `customer_data` is written from the browser: a key that is not the
    // submit route's own `kyc/<orderId>/…` could point at somebody else's
    // object, and this copy runs with service-role S3 access.
    if (doc.s3Key && !doc.s3Key.startsWith(allowedPrefix)) {
      console.warn(`${logPrefix}: ${doc.type} key outside the order's prefix, skipped`);
      continue;
    }

    let fileKey: string;
    try {
      if (doc.s3Key) {
        fileKey = generateKycKey(
          userId,
          verificationId,
          doc.type as KycDocumentType,
          getExtensionFromContentType(mimeType)
        );
        await copyFile(doc.s3Key, fileKey);
      } else if (doc.base64) {
        // Legacy shape: an inline image with no S3 object behind it.
        const uploaded = await uploadKycDocument(
          userId,
          verificationId,
          doc.type as KycDocumentType,
          doc.base64,
          mimeType
        );
        fileKey = uploaded.key;
      } else {
        console.warn(`${logPrefix}: ${doc.type} has neither s3Key nor base64`);
        continue;
      }
    } catch (copyError) {
      // A failed copy must not cost the customer the rest of their profile;
      // the document can be uploaded again from the account.
      console.error(`${logPrefix}: could not copy ${doc.type} into the account:`, copyError);
      continue;
    }

    const fileUrl = await getDownloadUrl(fileKey);

    const { error: kycInsertError } = await adminClient.from('kyc_verifications').insert({
      id: verificationId,
      user_id: userId,
      document_type: doc.type,
      file_url: fileUrl,
      file_key: fileKey,
      file_size: doc.fileSize || null,
      mime_type: mimeType,
      extracted_data: ocrResult?.extractedData || {},
      validation_result: { confidence: ocrResult?.confidence || 0 },
      verified_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true,
    });

    if (kycInsertError) {
      console.error(
        `${logPrefix}: could not save ${doc.type} to kyc_verifications:`,
        kycInsertError.message
      );
      continue;
    }

    copied += 1;
    if (isIdentityDocumentType(doc.type)) identityCopied = true;
  }

  // `kyc_verified` is what the wizard and `/submit` read to skip the identity
  // step next time. Set only when the account now holds an identity document
  // AND the selfie — either alone proves nothing. Only ever raised.
  if (copied > 0) {
    const { data: activeRows } = await adminClient
      .from('kyc_verifications')
      .select('document_type')
      .eq('user_id', userId)
      .eq('is_active', true);
    const activeTypes = ((activeRows ?? []) as Array<{ document_type: string }>).map((r) => r.document_type);
    if (hasCompleteKyc(activeTypes)) {
      const { error: flagError } = await adminClient
        .from('profiles')
        .update({ kyc_verified: true, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (flagError) {
        console.error(`${logPrefix}: kyc_verified not set:`, flagError.message);
      }
    }
  }

  return { copied, identityCopied };
}
