import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/user/profile
 * Update user profile data (name, CNP, birth date, etc.)
 */
export async function PATCH(request: Request) {
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
      firstName,
      lastName,
      cnp,
      birthDate,
      birthPlace,
      phone,
      // Company profile fields
      companyCui,
      companyName,
      companyType,
      companyRegistrationNumber,
      companyAddress,
      companyIsActive,
      companyVatPayer,
      companyVerified,
    } = body;

    // Build update object with only provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (cnp !== undefined) updates.cnp = cnp;
    if (birthDate !== undefined) updates.birth_date = birthDate;
    if (birthPlace !== undefined) updates.birth_place = birthPlace;
    if (phone !== undefined) updates.phone = phone;

    // Company fields
    if (companyCui !== undefined) updates.company_cui = companyCui;
    if (companyName !== undefined) updates.company_name = companyName;
    if (companyType !== undefined) updates.company_type = companyType;
    if (companyRegistrationNumber !== undefined) updates.company_registration_number = companyRegistrationNumber;
    if (companyAddress !== undefined) updates.company_address = companyAddress;
    if (companyIsActive !== undefined) updates.company_is_active = companyIsActive;
    if (companyVatPayer !== undefined) updates.company_vat_payer = companyVatPayer;
    if (companyVerified !== undefined) updates.company_verified = companyVerified;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Cast to any for columns not in generated types (birth_date, birth_place from migration 015)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileData = data as any;

    // Auto-create/update PJ billing profile when company data is saved
    if (companyCui && companyName) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingPjProfile } = await (supabase as any)
          .from('billing_profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('type', 'persoana_juridica')
          .maybeSingle();

        const billingData = {
          companyName,
          cui: companyCui,
          regCom: companyRegistrationNumber || '',
          address: companyAddress || '',
        };

        if (existingPjProfile) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('billing_profiles')
            .update({
              billing_data: billingData,
              label: companyName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingPjProfile.id);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('billing_profiles')
            .insert({
              user_id: user.id,
              type: 'persoana_juridica',
              label: companyName,
              billing_data: billingData,
              is_default: false,
            });
        }
      } catch (billingError) {
        console.error('Failed to auto-create PJ billing profile:', billingError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profileData.id,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        cnp: profileData.cnp,
        birthDate: profileData.birth_date,
        birthPlace: profileData.birth_place,
        phone: profileData.phone,
        kycVerified: profileData.kyc_verified,
        // Company profile
        companyProfile: profileData.company_cui ? {
          cui: profileData.company_cui,
          name: profileData.company_name,
          type: profileData.company_type,
          registrationNumber: profileData.company_registration_number,
          address: profileData.company_address,
          isActive: profileData.company_is_active,
          vatPayer: profileData.company_vat_payer,
          verified: profileData.company_verified,
        } : null,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/profile
 * Get current user profile with document data from KYC
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

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Fetch KYC documents to get document info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kycDocs } = await (supabase as any)
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .in('document_type', ['ci_front', 'ci_nou_front'])
      .order('verified_at', { ascending: false })
      .limit(1);

    // Extract document info from KYC
    let documentSeries = null;
    let documentNumber = null;
    let documentType = null;
    let documentExpiry = null;

    if (kycDocs && kycDocs.length > 0) {
      const kycDoc = kycDocs[0];
      const extractedData = kycDoc.extracted_data || {};

      // OCR returns 'series' and 'number', not 'documentSeries'/'documentNumber'
      documentSeries = extractedData.series || extractedData.documentSeries || null;
      documentNumber = extractedData.number || extractedData.documentNumber || null;

      // Determine document type label
      // Note: ci_front = old format, ci_nou_front = new format, but both are "Carte de Identitate"
      documentType = kycDoc.document_type === 'ci_nou_front' ? 'Carte de Identitate (nou)' :
                     kycDoc.document_type === 'ci_front' ? 'Carte de Identitate' :
                     kycDoc.document_type === 'passport' ? 'Pașaport' :
                     extractedData.documentType || 'Document Identitate';

      documentExpiry = extractedData.expiryDate || kycDoc.expires_at || null;
    }

    // Cast to any for columns not in generated types (birth_date, birth_place from migration 015)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileData = data as any;

    return NextResponse.json({
      success: true,
      data: {
        id: profileData.id,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        cnp: profileData.cnp,
        birthDate: profileData.birth_date,
        birthPlace: profileData.birth_place,
        phone: profileData.phone,
        kycVerified: profileData.kyc_verified,
        role: profileData.role,
        createdAt: profileData.created_at,
        // Document info from KYC
        documentSeries,
        documentNumber,
        documentType,
        documentExpiry,
        // Company profile
        companyProfile: profileData.company_cui ? {
          cui: profileData.company_cui,
          name: profileData.company_name,
          type: profileData.company_type,
          registrationNumber: profileData.company_registration_number,
          address: profileData.company_address,
          isActive: profileData.company_is_active,
          vatPayer: profileData.company_vat_payer,
          verified: profileData.company_verified,
        } : null,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
