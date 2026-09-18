import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  STORABLE_KYC_DOCUMENT_TYPES,
  isStorableKycDocumentType,
  isCompanyDocumentType,
  isIdentityDocumentType,
  fillsProfileFromOcr,
} from '@/lib/kyc/identity-documents';
import { KYC_VALIDITY_DAYS } from '@/lib/kyc/constants';
import { billingProfileFromIdData, hasUsableAddress } from '@/lib/account/id-data-to-profile';
import { findSameAddress } from '@/lib/account/same-address';
import { toIsoDate } from '@/lib/format/romanian-date';

/**
 * POST /api/user/kyc/save
 * Save a new KYC document verification
 *
 * Body:
 * - documentType: any of STORABLE_KYC_DOCUMENT_TYPES (kept in sync with the
 *   DB CHECK — migration 171 — and with what the order wizard produces)
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
      // Faza 3 / decision D8: reusing the document's data for invoicing is the
      // customer's choice and is OFF unless they asked for it. It used to happen
      // on every scan, silently, and it overwrote a billing profile they may
      // have typed by hand.
      useIdDataForBilling = false,
    } = body;

    // Validate required fields
    if (!documentType || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: documentType and fileUrl' },
        { status: 400 }
      );
    }

    if (!isStorableKycDocumentType(documentType)) {
      return NextResponse.json(
        { error: `Invalid document type. Allowed: ${STORABLE_KYC_DOCUMENT_TYPES.join(', ')}` },
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

    const documentExpiryIso = toIsoDate(typeof documentExpiry === 'string' ? documentExpiry : null);
    if (documentExpiryIso) {
      // The document's own date („02.07.2029" as printed, or ISO) — read
      // tolerantly; `new Date('02.07.2029')` is Invalid Date and threw here.
      expiresAt = new Date(`${documentExpiryIso}T00:00:00Z`).toISOString();
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
    if (isCompanyDocumentType(documentType)) {
      await adminClient
        .from('profiles')
        .update({
          company_verified: true,
          updated_at: now.toISOString(),
        })
        .eq('id', user.id);
    } else if (isIdentityDocumentType(documentType)) {
      // Only documents that establish WHO the person is flip kyc_verified. A
      // driving licence or a residence permit is useful to an order but says
      // nothing about the identity check having been done.
      await adminClient
        .from('profiles')
        .update({
          kyc_verified: true,
          updated_at: now.toISOString(),
        })
        .eq('id', user.id);
    }

    // What the scan may fill in, from a document that carries personal data
    // (CI front, passport data page, new-CI back for the address). Each write
    // below is either additive or explicitly asked for — a scan must never
    // quietly replace something the customer entered.
    if (fillsProfileFromOcr(documentType) && extractedData) {
      // The address from the document, kept under its own label so it is
      // distinguishable from one the customer wrote.
      if (hasUsableAddress(extractedData.address)) {
        // The same place under any label counts as existing — the personal
        // step's own save and this one used to produce two „Adresă din act".
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: savedAddresses } = await (supabase as any)
          .from('user_saved_data')
          .select('id, label, data')
          .eq('user_id', user.id)
          .eq('data_type', 'address');
        const existingAddress = findSameAddress(
          (savedAddresses ?? []) as Array<{ id: string; label: string; data: Record<string, unknown> }>,
          extractedData.address as Record<string, unknown>
        );

        if (existingAddress) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('user_saved_data')
            .update({ data: extractedData.address, updated_at: now.toISOString() })
            .eq('id', existingAddress.id);
        } else {
          // Its own `from()`: reusing the builder above would stack the filters
          // and return nothing, silently.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { count: addressCount } = await (supabase as any)
            .from('user_saved_data')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('data_type', 'address');

          // Default only when there is nothing else to be default. Scanning a
          // document must not silently move the delivery address the customer
          // chose.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('user_saved_data')
            .insert({
              user_id: user.id,
              data_type: 'address',
              label: 'Adresă din act',
              data: extractedData.address,
              is_default: (addressCount ?? 0) === 0,
            });
        }
      }

      // The billing profile: only when the customer asked for it, and only when
      // they do not already have one. An existing profile is never touched —
      // they may have corrected it by hand, and the OCR is not more right than
      // the person reading their own invoice.
      if (useIdDataForBilling) {
        const profileFromId = billingProfileFromIdData(extractedData);

        if (!profileFromId) {
          console.warn(
            `kyc/save: ${documentType} does not carry a complete enough address for a billing profile`
          );
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existingProfile } = await (supabase as any)
            .from('billing_profiles')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'persoana_fizica')
            .maybeSingle();

          if (!existingProfile) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: billingError } = await (supabase as any)
              .from('billing_profiles')
              .insert({
                user_id: user.id,
                type: 'persoana_fizica',
                label: profileFromId.label,
                billing_data: profileFromId,
                is_default: true,
              });
            if (billingError) {
              console.error('kyc/save: billing profile from document not saved:', billingError.message);
            }
          }
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
