import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_DOCUMENTS = process.env.AWS_S3_BUCKET_DOCUMENTS!

export type DocumentFolder = 'kyc' | 'contracts' | 'final-documents' | 'templates'

/**
 * Generate a presigned URL for uploading a file
 */
export async function getUploadUrl(
  folder: DocumentFolder,
  userId: string,
  orderId: string,
  filename: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const key = `${folder}/${userId}/${orderId}/${filename}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_DOCUMENTS,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Generate a presigned URL for downloading a file
 */
export async function getDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_DOCUMENTS,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_DOCUMENTS,
    Key: key,
  })

  await s3Client.send(command)
}

/**
 * Generate the S3 key for a document
 */
export function generateDocumentKey(
  folder: DocumentFolder,
  userId: string,
  orderId: string,
  filename: string
): string {
  return `${folder}/${userId}/${orderId}/${filename}`
}

/**
 * Generate contract key with year/month structure
 */
export function generateContractKey(
  year: number,
  month: number,
  contractNumber: string,
  filename: string
): string {
  const monthStr = month.toString().padStart(2, '0')
  return `contracts/${year}/${monthStr}/${contractNumber}/${filename}`
}
