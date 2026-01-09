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
      documentSeries = extractedData.documentSeries || null;
      documentNumber = extractedData.documentNumber || null;
      documentType = kycDoc.document_type === 'ci_nou_front' ? 'CI Nou' :
                     kycDoc.document_type === 'ci_front' ? 'CI Vechi' :
                     extractedData.documentType || null;
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
