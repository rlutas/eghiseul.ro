import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/user/prefill-data
 *
 * Fetches saved user data for pre-filling the order wizard.
 * Returns personal data, contact info, KYC documents, and billing profiles.
 *
 * Authentication: Required (Bearer token via Supabase session)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    // Fetch saved data (addresses, contacts)
    const { data: savedData, error: savedDataError } = await supabase
      .from('user_saved_data')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (savedDataError && savedDataError.code !== 'PGRST116') {
      console.error('Saved data fetch error:', savedDataError);
    }

    // Fetch active KYC documents
    const { data: kycDocs, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('verified_at', { ascending: false });

    if (kycError && kycError.code !== 'PGRST116') {
      console.error('KYC fetch error:', kycError);
    }

    // Fetch billing profiles
    const { data: billingProfiles, error: billingError } = await supabase
      .from('billing_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (billingError && billingError.code !== 'PGRST116') {
      console.error('Billing profiles fetch error:', billingError);
    }

    // Check for expiring documents (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Build KYC documents map with expiry status
    const kycDocuments: Record<
      string,
      {
        id: string;
        file_url: string;
        verified_at: string;
        expires_at: string | null;
        is_expiring_soon: boolean;
        is_expired: boolean;
        validation_result: Record<string, unknown> | null;
        extracted_data: Record<string, unknown> | null;
      }
    > = {};

    if (kycDocs && kycDocs.length > 0) {
      for (const doc of kycDocs) {
        const expiresAt = doc.expires_at ? new Date(doc.expires_at) : null;
        const isExpiringSoon = expiresAt ? expiresAt <= thirtyDaysFromNow : false;
        const isExpired = expiresAt ? expiresAt <= now : false;

        kycDocuments[doc.document_type] = {
          id: doc.id,
          file_url: doc.file_url,
          verified_at: doc.verified_at,
          expires_at: doc.expires_at,
          is_expiring_soon: isExpiringSoon,
          is_expired: isExpired,
          validation_result: doc.validation_result,
          extracted_data: doc.extracted_data,
        };
      }
    }

    // Find default address and contact from saved data
    const defaultAddress = savedData?.find(
      (d) => d.data_type === 'address' && d.is_default
    );
    const defaultContact = savedData?.find(
      (d) => d.data_type === 'contact' && d.is_default
    );
    const allAddresses = savedData?.filter((d) => d.data_type === 'address') || [];
    const allContacts = savedData?.filter((d) => d.data_type === 'contact') || [];

    // Build response
    const response = {
      success: true,
      data: {
        // Personal data from profile
        personal: {
          cnp: profile?.cnp || '',
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          birthDate: profile?.birth_date || '',
          birthPlace: profile?.birth_place || '',
          phone: profile?.phone || '',
          // Default address
          address: defaultAddress?.data || null,
        },
        // Contact data
        contact: {
          email: profile?.email || user.email || '',
          phone: profile?.phone || '',
          preferredContact: defaultContact?.data?.preferred_contact || 'email',
        },
        // All saved addresses
        savedAddresses: allAddresses.map((a) => ({
          id: a.id,
          label: a.label,
          data: a.data,
          is_default: a.is_default,
        })),
        // All saved contacts
        savedContacts: allContacts.map((c) => ({
          id: c.id,
          label: c.label,
          data: c.data,
          is_default: c.is_default,
        })),
        // KYC documents
        kyc_documents: kycDocuments,
        kyc_verified: profile?.kyc_verified || false,
        has_valid_kyc: Object.entries(kycDocuments).some(
          ([docType, doc]) => !doc.is_expired && docType !== 'selfie'
        ),
        // Billing profiles
        billing_profiles:
          billingProfiles?.map((bp) => ({
            id: bp.id,
            type: bp.type,
            label: bp.label,
            billing_data: bp.billing_data,
            is_default: bp.is_default,
          })) || [],
        // Metadata
        profile_created_at: profile?.created_at,
        profile_updated_at: profile?.updated_at,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Prefill data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
