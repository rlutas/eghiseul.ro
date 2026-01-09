import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getUploadUrl,
  generateKycKey,
  generateOrderKey,
  generateTempKey,
  generateFileId,
  isAllowedFileType,
  getExtensionFromContentType,
  type KycDocumentType,
  type DocumentCategory,
} from '@/lib/aws/s3';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadRequest {
  category: DocumentCategory;
  contentType: string;
  filename?: string;
  fileSize?: number;
  // For KYC uploads
  documentType?: KycDocumentType;
  verificationId?: string;
  // For order uploads
  orderId?: string;
}

/**
 * POST /api/upload
 *
 * Generate a presigned URL for uploading a file to S3.
 * Returns the URL and key for client-side upload.
 *
 * Body:
 * - category: 'kyc' | 'orders' | 'temp'
 * - contentType: MIME type of the file
 * - filename: (optional) Original filename
 * - fileSize: (optional) File size in bytes for validation
 * - documentType: (required for kyc) Type of KYC document
 * - verificationId: (required for kyc) Verification ID
 * - orderId: (required for orders) Order ID
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UploadRequest = await request.json();
    const {
      category,
      contentType,
      filename,
      fileSize,
      documentType,
      verificationId,
      orderId,
    } = body;

    // Validate category
    if (!category || !['kyc', 'orders', 'temp'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be kyc, orders, or temp' },
        { status: 400 }
      );
    }

    // Validate content type
    if (!contentType) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = category === 'kyc'
      ? ['image/jpeg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    if (!isAllowedFileType(contentType, allowedTypes)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    let key: string;
    const extension = getExtensionFromContentType(contentType);

    // Generate S3 key based on category
    switch (category) {
      case 'kyc':
        if (!documentType || !verificationId) {
          return NextResponse.json(
            { error: 'documentType and verificationId are required for KYC uploads' },
            { status: 400 }
          );
        }
        key = generateKycKey(user.id, verificationId, documentType, extension);
        break;

      case 'orders':
        if (!orderId) {
          return NextResponse.json(
            { error: 'orderId is required for order uploads' },
            { status: 400 }
          );
        }
        const orderFilename = filename || `${generateFileId()}.${extension}`;
        key = generateOrderKey(orderId, orderFilename);
        break;

      case 'temp':
        const tempFilename = filename || `${generateFileId()}.${extension}`;
        key = generateTempKey(generateFileId(), tempFilename);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
    }

    // Generate presigned URL
    const result = await getUploadUrl(key, {
      contentType,
      metadata: {
        'user-id': user.id,
        'original-filename': filename || 'unknown',
        'uploaded-at': new Date().toISOString(),
      },
      expiresIn: 900, // 15 minutes
    });

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: result.url,
        key: result.key,
        bucket: result.bucket,
        expiresIn: 900,
      },
    });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 *
 * Health check for S3 configuration
 */
export async function GET() {
  const hasConfig = !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_DOCUMENTS
  );

  return NextResponse.json({
    status: hasConfig ? 'configured' : 'not_configured',
    region: process.env.AWS_REGION || 'not set',
    bucket: process.env.AWS_S3_BUCKET_DOCUMENTS || 'not set',
    hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
  });
}
