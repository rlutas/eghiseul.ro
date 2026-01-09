/**
 * AWS S3 Document Storage Service
 *
 * Handles all document storage operations for eGhiseul.ro:
 * - KYC documents (ID scans, selfies)
 * - Order documents (uploads, signatures)
 * - Contracts and invoices
 * - Final delivered documents
 *
 * @see docs/deployment/AWS_S3_SETUP.md for configuration guide
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_DOCUMENTS || 'eghiseul-documents';

// ============================================================================
// Types
// ============================================================================

export type DocumentCategory =
  | 'kyc'           // KYC verification documents
  | 'orders'        // Order-related uploads
  | 'contracts'     // Generated contracts
  | 'invoices'      // Generated invoices
  | 'final'         // Final delivered documents
  | 'templates'     // Document templates
  | 'temp';         // Temporary files (auto-deleted)

export type KycDocumentType =
  | 'ci_front'      // ID card front
  | 'ci_back'       // ID card back
  | 'ci_nou_front'  // New ID card front
  | 'ci_nou_back'   // New ID card back
  | 'passport'      // Passport
  | 'selfie'        // Selfie alone
  | 'selfie_with_id'; // Selfie holding ID

export interface UploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
  expiresIn?: number; // seconds, default 900 (15 min)
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  contentType?: string;
  metadata?: Record<string, string>;
}

// ============================================================================
// Key Generation
// ============================================================================

/**
 * Generate S3 key for KYC documents
 * Pattern: kyc/{user_id}/{verification_id}/{doc_type}.{ext}
 */
export function generateKycKey(
  userId: string,
  verificationId: string,
  docType: KycDocumentType,
  extension: string = 'jpg'
): string {
  return `kyc/${userId}/${verificationId}/${docType}.${extension}`;
}

/**
 * Generate S3 key for order documents
 * Pattern: orders/{year}/{month}/{order_id}/uploads/{filename}
 */
export function generateOrderKey(
  orderId: string,
  filename: string,
  subFolder: 'uploads' | 'signature' = 'uploads'
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `orders/${year}/${month}/${orderId}/${subFolder}/${filename}`;
}

/**
 * Generate S3 key for contracts
 * Pattern: contracts/{year}/{month}/{contract_number}/{filename}
 */
export function generateContractKey(
  contractNumber: string,
  filename: string
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `contracts/${year}/${month}/${contractNumber}/${filename}`;
}

/**
 * Generate S3 key for invoices
 * Pattern: invoices/{year}/{month}/{invoice_number}.pdf
 */
export function generateInvoiceKey(invoiceNumber: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `invoices/${year}/${month}/${invoiceNumber}.pdf`;
}

/**
 * Generate S3 key for final delivered documents
 * Pattern: final/{year}/{month}/{order_id}/{filename}
 */
export function generateFinalDocumentKey(
  orderId: string,
  filename: string
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `final/${year}/${month}/${orderId}/${filename}`;
}

/**
 * Generate S3 key for temporary files
 * Pattern: temp/{upload_id}/{filename}
 */
export function generateTempKey(uploadId: string, filename: string): string {
  return `temp/${uploadId}/${filename}`;
}

// ============================================================================
// Presigned URLs
// ============================================================================

/**
 * Generate a presigned URL for uploading a file
 * Client can PUT directly to this URL
 */
export async function getUploadUrl(
  key: string,
  options: UploadOptions
): Promise<UploadResult> {
  const { contentType, metadata = {}, expiresIn = 900 } = options;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
    Metadata: metadata,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });

  return {
    key,
    url,
    bucket: BUCKET,
  };
}

/**
 * Generate a presigned URL for downloading a file
 */
export async function getDownloadUrl(
  key: string,
  expiresIn: number = 900 // 15 minutes default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

// ============================================================================
// Direct Operations
// ============================================================================

/**
 * Upload a file directly from server (Buffer or string)
 */
export async function uploadFile(
  key: string,
  body: Buffer | string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
    Metadata: metadata,
  });

  await s3Client.send(command);
  return key;
}

/**
 * Upload a base64 encoded file
 */
export async function uploadBase64(
  key: string,
  base64Data: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  return uploadFile(key, buffer, contentType, metadata);
}

/**
 * Download a file and return as Buffer
 */
export async function downloadFile(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  const stream = response.Body;

  if (!stream) {
    throw new Error('Empty response body');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  // @ts-expect-error - stream is readable
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file info (size, last modified, etc.)
 */
export async function getFileInfo(key: string): Promise<FileInfo> {
  const command = new HeadObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);

  return {
    key,
    size: response.ContentLength || 0,
    lastModified: response.LastModified || new Date(),
    contentType: response.ContentType,
    metadata: response.Metadata,
  };
}

/**
 * List files in a folder
 */
export async function listFiles(
  prefix: string,
  maxKeys: number = 1000
): Promise<FileInfo[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  const response = await s3Client.send(command);

  return (response.Contents || []).map(item => ({
    key: item.Key || '',
    size: item.Size || 0,
    lastModified: item.LastModified || new Date(),
  }));
}

/**
 * Copy a file to a new location
 */
export async function copyFile(
  sourceKey: string,
  destinationKey: string
): Promise<string> {
  const command = new CopyObjectCommand({
    Bucket: BUCKET,
    CopySource: `${BUCKET}/${sourceKey}`,
    Key: destinationKey,
    ServerSideEncryption: 'AES256',
  });

  await s3Client.send(command);
  return destinationKey;
}

/**
 * Move a file (copy + delete)
 */
export async function moveFile(
  sourceKey: string,
  destinationKey: string
): Promise<string> {
  await copyFile(sourceKey, destinationKey);
  await deleteFile(sourceKey);
  return destinationKey;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get file extension from content type
 */
export function getExtensionFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  return map[contentType] || 'bin';
}

/**
 * Get content type from file extension
 */
export function getContentTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return map[ext] || 'application/octet-stream';
}

/**
 * Validate file type against allowed list
 */
export function isAllowedFileType(
  contentType: string,
  allowed: string[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
): boolean {
  return allowed.includes(contentType);
}

/**
 * Generate a unique file ID
 */
export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// KYC-Specific Functions
// ============================================================================

/**
 * Upload a KYC document
 */
export async function uploadKycDocument(
  userId: string,
  verificationId: string,
  docType: KycDocumentType,
  base64Data: string,
  contentType: string = 'image/jpeg'
): Promise<{ key: string; url: string }> {
  const extension = getExtensionFromContentType(contentType);
  const key = generateKycKey(userId, verificationId, docType, extension);

  await uploadBase64(key, base64Data, contentType, {
    'user-id': userId,
    'verification-id': verificationId,
    'document-type': docType,
    'uploaded-at': new Date().toISOString(),
  });

  const url = await getDownloadUrl(key);
  return { key, url };
}

/**
 * Get download URL for a KYC document
 */
export async function getKycDocumentUrl(
  userId: string,
  verificationId: string,
  docType: KycDocumentType,
  extension: string = 'jpg'
): Promise<string | null> {
  const key = generateKycKey(userId, verificationId, docType, extension);

  if (await fileExists(key)) {
    return getDownloadUrl(key);
  }

  return null;
}

/**
 * Delete all KYC documents for a verification
 */
export async function deleteKycVerification(
  userId: string,
  verificationId: string
): Promise<void> {
  const prefix = `kyc/${userId}/${verificationId}/`;
  const files = await listFiles(prefix);

  await Promise.all(files.map(file => deleteFile(file.key)));
}

// ============================================================================
// Order-Specific Functions
// ============================================================================

/**
 * Upload an order document
 */
export async function uploadOrderDocument(
  orderId: string,
  filename: string,
  base64Data: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const key = generateOrderKey(orderId, filename);

  await uploadBase64(key, base64Data, contentType, {
    'order-id': orderId,
    'original-filename': filename,
    'uploaded-at': new Date().toISOString(),
  });

  const url = await getDownloadUrl(key);
  return { key, url };
}

/**
 * Upload order signature
 */
export async function uploadOrderSignature(
  orderId: string,
  base64Data: string
): Promise<{ key: string; url: string }> {
  const key = generateOrderKey(orderId, 'signature.png', 'signature');

  await uploadBase64(key, base64Data, 'image/png', {
    'order-id': orderId,
    'signed-at': new Date().toISOString(),
  });

  const url = await getDownloadUrl(key);
  return { key, url };
}

/**
 * List all documents for an order
 */
export async function listOrderDocuments(orderId: string): Promise<FileInfo[]> {
  // We need to search across all year/month combinations
  // For simplicity, list from known prefix patterns
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const prefix = `orders/${year}/${month}/${orderId}/`;
  return listFiles(prefix);
}

// ============================================================================
// Exports
// ============================================================================

export { s3Client, BUCKET };
