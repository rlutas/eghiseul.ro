import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPaymentProofToken } from '@/lib/orders/payment-proof-token';
import {
  getUploadUrl,
  generateKycKey,
  generateOrderKey,
  generateTempKey,
  generateSignatureKey,
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
  // For signature uploads
  signatureType?: string;
  // For payment-proof uploads by a guest (issued by the status/order API)
  proofToken?: string;
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
    const { data: { user: sessionUser } } = await supabase.auth.getUser();
    const body: UploadRequest = await request.json();
    const {
      category,
      contentType,
      filename,
      fileSize,
      documentType,
      verificationId,
      orderId,
      signatureType,
      proofToken,
    } = body;

    // Payment proof for a bank-transfer order — the one branch a GUEST may
    // use, with the order-scoped token from the status/order API. Server
    // names the key; ≤ 5 presigns per order per hour, counted in the DB.
    if (category === 'payment-proof') {
      if (!orderId || !/^[A-Za-z0-9-]+$/.test(orderId)) {
        return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;
      const { data: order } = await admin
        .from('orders')
        .select('id, user_id, status, payment_status')
        .eq('id', orderId)
        .maybeSingle();
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      const authorized = order.user_id
        ? !!sessionUser && sessionUser.id === order.user_id
        : verifyPaymentProofToken(proofToken, orderId);
      if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (order.payment_status === 'paid' || !['pending', 'awaiting_payment'].includes(order.status)) {
        return NextResponse.json({ error: 'Comanda nu așteaptă o dovadă de plată' }, { status: 400 });
      }
      if (!contentType || !isAllowedFileType(contentType, ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])) {
        return NextResponse.json({ error: 'Acceptăm JPG, PNG, WebP sau PDF' }, { status: 400 });
      }
      if (!fileSize || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Fișierul trebuie să aibă între 1 byte și 10 MB' }, { status: 400 });
      }
      const { data: withinBudget } = await admin.rpc('count_proof_presign', { p_order_id: orderId, p_max: 5 });
      if (withinBudget !== true) {
        return NextResponse.json({ error: 'Prea multe încercări. Așteaptă o oră și încearcă din nou.' }, { status: 429 });
      }
      const ext = getExtensionFromContentType(contentType);
      const key = generateOrderKey(orderId, `proof-${Date.now()}-${generateFileId()}.${ext}`);
      const result = await getUploadUrl(key, {
        contentType,
        metadata: {
          'user-id': sessionUser?.id ?? 'guest',
          'original-filename': filename || 'unknown',
          'uploaded-at': new Date().toISOString(),
        },
        expiresIn: 900,
      });
      return NextResponse.json({
        success: true,
        data: { uploadUrl: result.url, key: result.key, bucket: result.bucket, expiresIn: 900 },
      });
    }

    // Everything else needs a session.
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const user = sessionUser;

    // Validate category
    if (!category || !['kyc', 'orders', 'temp', 'signatures', 'templates'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be kyc, orders, temp, signatures, or templates' },
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
    const allowedTypes = category === 'templates'
      ? ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      : (category === 'kyc' || category === 'signatures')
        ? ['image/jpeg', 'image/png', 'image/webp']
        : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    if (!isAllowedFileType(contentType, allowedTypes)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size. The empty check is deliberate and must come first:
    // `fileSize && ...` treats 0 as absent, so a 0-byte upload used to slip
    // through and land in S3 as an unopenable file (CJO-20260720-12500 —
    // phone handed over a cloud-only photo with no local bytes). Images are
    // caught client-side by compressImage, but PDFs never touch it, so this
    // is the only guard covering them.
    if (fileSize === 0) {
      return NextResponse.json(
        { error: 'Fișierul este gol (0 KB). Încarcă din nou documentul — dacă l-ai ales din galerie, fă poza direct cu camera.' },
        { status: 400 }
      );
    }
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
        // Only the order's owner may write into its namespace (a guest order
        // counts as owned when its contact email is the session's).
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const admin = createAdminClient() as any;
          const { data: ord } = await admin
            .from('orders')
            .select('id, user_id, customer_data')
            .eq('id', orderId)
            .maybeSingle();
          const ordEmail = ((ord?.customer_data as { contact?: { email?: string } } | null)?.contact?.email || '').toLowerCase();
          const owns = !!ord && (ord.user_id ? ord.user_id === user.id : !!user.email && ordEmail === user.email.toLowerCase());
          if (!owns) {
            return NextResponse.json({ error: 'You do not have access to this order' }, { status: 403 });
          }
        }
        const orderFilename = filename || `${generateFileId()}.${extension}`;
        key = generateOrderKey(orderId, orderFilename);
        break;

      case 'signatures':
        if (!signatureType || !['company_signature', 'lawyer_signature', 'lawyer_stamp'].includes(signatureType)) {
          return NextResponse.json(
            { error: 'signatureType is required for signature uploads. Must be company_signature, lawyer_signature, or lawyer_stamp' },
            { status: 400 }
          );
        }
        key = generateSignatureKey(signatureType, extension);
        break;

      case 'templates':
        const templateName = filename || `template-${generateFileId()}.docx`;
        key = `templates/custom/${templateName}`;
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
