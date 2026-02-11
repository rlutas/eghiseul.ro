import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// KYC validity period in days
const KYC_VALIDITY_DAYS = 90;

/**
 * POST /api/user/kyc/save
 * Save a new KYC document verification
 *
 * Body:
 * - documentType: 'ci_front' | 'ci_back' | 'selfie' | 'passport' | 'address_certificate'
 * - fileUrl: S3 URL or data URL
 * - fileKey?: S3 key for deletion
 * - extractedData: OCR extracted data
 * - validationResult: KYC validation result
 * - documentExpiry?: Document expiry date (from ID)
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const {
      documentType,
      fileUrl,
      fileKey,
      fileSize,
      mimeType,
      extractedData,
      validationResult,
      documentExpiry,
    } = body;

    // Validate required fields
    if (!documentType || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: documentType and fileUrl' },
        { status: 400 }
      );
    }

    const validTypes = ['ci_front', 'ci_back', 'selfie', 'passport', 'address_certificate', 'ci_nou_front', 'ci_nou_back', 'company_registration_cert', 'company_statement_cert'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Deactivate previous documents of the same type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('kyc_verifications')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('document_type', documentType);

    // Calculate expiry date (use document expiry if available, otherwise KYC validity period)
    const now = new Date();
    let expiresAt: string;

    if (documentExpiry) {
      // Use document expiry date
      expiresAt = new Date(documentExpiry).toISOString();
    } else {
      // Use KYC validity period
      expiresAt = new Date(now.getTime() + KYC_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    }

    // Insert new KYC document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('kyc_verifications')
      .insert({
        user_id: user.id,
        document_type: documentType,
        file_url: fileUrl,
        file_key: fileKey || null,
        file_size: fileSize || null,
        mime_type: mimeType || null,
        extracted_data: extractedData || {},
        validation_result: validationResult || {},
        verified_at: now.toISOString(),
        expires_at: expiresAt,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('KYC save error:', error);
      return NextResponse.json(
        { error: 'Failed to save KYC document' },
        { status: 500 }
      );
    }

    // Update profile flags (use admin client to bypass RLS)
    const adminClient = createAdminClient();

    // For company documents, set company_verified flag
    const isCompanyDoc = documentType === 'company_registration_cert' || documentType === 'company_statement_cert';
    if (isCompanyDoc) {
      await adminClient
        .from('profiles')
        .update({
          company_verified: true,
          updated_at: now.toISOString(),
        })
        .eq('id', user.id);
    } else {
      // For personal documents, set kyc_verified flag
      await adminClient
        .from('profiles')
        .update({
          kyc_verified: true,
          updated_at: now.toISOString(),
        })
        .eq('id', user.id);
    }

    // Auto-create address and billing profile from extracted data if this is a front ID
    if ((documentType === 'ci_front' || documentType === 'ci_nou_front' || documentType === 'passport') && extractedData) {
      // Auto-create address if we have address data
      if (extractedData.address) {
        // Check if we already have an address from act (to avoid duplicates)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingAddress } = await (supabase as any)
          .from('user_saved_data')
          .select('id')
          .eq('user_id', user.id)
          .eq('data_type', 'address')
          .eq('label', 'Adresă din act')
          .maybeSingle();

        if (existingAddress) {
          // Update existing address instead of creating duplicate
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('user_saved_data')
            .update({
              data: extractedData.address,
              updated_at: now.toISOString(),
            })
            .eq('id', existingAddress.id);
        } else {
          // Create new address
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('user_saved_data')
            .insert({
              user_id: user.id,
              data_type: 'address',
              label: 'Adresă din act',
              data: extractedData.address,
              is_default: true,
            })
            .select()
            .maybeSingle();
        }
      }

      // Auto-create PF billing profile
      if (extractedData.firstName || extractedData.lastName || extractedData.cnp) {
        // Check if we already have a PF billing profile (by type or by label)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingProfile } = await (supabase as any)
          .from('billing_profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'persoana_fizica')
          .maybeSingle();

        // Format address string
        const addr = extractedData.address || {};
        const addressParts = [
          addr.street,
          addr.number ? `Nr. ${addr.number}` : null,
          addr.building ? `Bl. ${addr.building}` : null,
          addr.staircase ? `Sc. ${addr.staircase}` : null,
          addr.apartment ? `Ap. ${addr.apartment}` : null,
          addr.city,
          addr.county,
        ].filter(Boolean);

        const billingData = {
          firstName: extractedData.firstName,
          lastName: extractedData.lastName,
          cnp: extractedData.cnp,
          address: addressParts.join(', '),
        };

        if (existingProfile) {
          // Update existing billing profile instead of creating duplicate
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('billing_profiles')
            .update({
              billing_data: billingData,
              updated_at: now.toISOString(),
            })
            .eq('id', existingProfile.id);
        } else {
          // Create new billing profile
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('billing_profiles')
            .insert({
              user_id: user.id,
              type: 'persoana_fizica',
              label: 'Profil personal',
              billing_data: billingData,
              is_default: true,
            })
            .maybeSingle();
        }
      }

      // Update profile with personal data (use admin client to bypass RLS)
      const adminClient = createAdminClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileUpdates: Record<string, any> = { updated_at: now.toISOString() };
      if (extractedData.firstName) profileUpdates.first_name = extractedData.firstName;
      if (extractedData.lastName) profileUpdates.last_name = extractedData.lastName;
      if (extractedData.cnp) profileUpdates.cnp = extractedData.cnp;
      if (extractedData.birthDate) {
        // Convert European date format (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
        const dateMatch = extractedData.birthDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (dateMatch) {
          profileUpdates.birth_date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        } else {
          // Already in ISO format or other format, try as-is
          profileUpdates.birth_date = extractedData.birthDate;
        }
      }
      if (extractedData.birthPlace) profileUpdates.birth_place = extractedData.birthPlace;

      const { error: profileError } = await adminClient
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (profileError) {
        console.error('Failed to update profile:', profileError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        documentType: data.document_type,
        fileUrl: data.file_url,
        extractedData: data.extracted_data,
        validationResult: data.validation_result,
        verifiedAt: data.verified_at,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      },
      message: 'KYC document saved successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('KYC save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
