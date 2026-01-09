import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// KYC validity period in days
const KYC_VALIDITY_DAYS = 90;

/**
 * GET /api/user/kyc
 * Get KYC verification status and documents for current user
 */
export async function GET() {
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

    // Fetch active KYC documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents, error } = await (supabase as any)
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('verified_at', { ascending: false });

    if (error) {
      console.error('KYC fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch KYC documents' },
        { status: 500 }
      );
    }

    // Calculate KYC status
    const now = new Date();
    const warningThreshold = 30; // days before expiry to show warning

    let status: 'verified' | 'expiring' | 'expired' | 'unverified' | 'partial' = 'unverified';
    let expiresAt: string | null = null;
    let daysUntilExpiry: number | null = null;

    // Check for required documents (ci_front AND selfie are both required)
    const docTypes = documents?.map((d: { document_type: string }) => d.document_type) || [];
    const hasFrontId = docTypes.some((t: string) => t === 'ci_front' || t === 'ci_nou_front');
    const hasSelfie = docTypes.some((t: string) => t === 'selfie' || t === 'selfie_with_id');
    const hasAllRequired = hasFrontId && hasSelfie;

    if (documents && documents.length > 0) {
      // Find the latest verification
      const latestDoc = documents[0];

      // Calculate expiry
      let expiryDate: Date;
      if (latestDoc.expires_at) {
        expiryDate = new Date(latestDoc.expires_at);
        expiresAt = latestDoc.expires_at;
      } else {
        // No expiry date, check verified_at + KYC_VALIDITY_DAYS
        const verifiedAt = new Date(latestDoc.verified_at);
        expiryDate = new Date(verifiedAt.getTime() + KYC_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
        expiresAt = expiryDate.toISOString();
      }

      daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Determine status based on documents AND expiry
      if (!hasAllRequired) {
        // Has some documents but not all required
        status = 'partial';
      } else if (daysUntilExpiry <= 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= warningThreshold) {
        status = 'expiring';
      } else {
        status = 'verified';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        expiresAt,
        daysUntilExpiry,
        // Only verified if we have ALL required documents AND not expired
        isVerified: (status === 'verified' || status === 'expiring') && hasAllRequired,
        isExpiring: status === 'expiring',
        isExpired: status === 'expired',
        isPartial: status === 'partial',
        // Document presence flags
        hasFrontId,
        hasSelfie,
        hasAllRequired,
        documents: documents?.map((doc: {
          id: string;
          document_type: string;
          file_url: string;
          extracted_data: Record<string, unknown>;
          validation_result: Record<string, unknown>;
          verified_at: string;
          expires_at: string;
          created_at: string;
        }) => ({
          id: doc.id,
          documentType: doc.document_type,
          fileUrl: doc.file_url,
          extractedData: doc.extracted_data,
          validationResult: doc.validation_result,
          verifiedAt: doc.verified_at,
          expiresAt: doc.expires_at,
          createdAt: doc.created_at,
        })) || [],
      },
    });
  } catch (error) {
    console.error('KYC fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
