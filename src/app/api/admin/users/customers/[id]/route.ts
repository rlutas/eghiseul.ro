import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/customers/[id]
 *
 * Get full customer profile with orders list and KYC status.
 * Requires: users.manage permission
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    try {
      await requirePermission(user.id, 'users.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const adminClient = createAdminClient();

    // Fetch customer profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch customer's orders (exclude drafts)
    const { data: orders } = await adminClient
      .from('orders')
      .select(`
        id,
        friendly_order_id,
        order_number,
        status,
        payment_status,
        total_price,
        delivery_method,
        created_at,
        updated_at
      `)
      .eq('user_id', id)
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    // Fetch KYC verifications (table not in generated types)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kycDocs } = await (adminClient as any)
      .from('kyc_verifications')
      .select('id, document_type, verified_at, expires_at, is_active, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Determine KYC status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeDocs = kycDocs?.filter((d: any) => d.is_active) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasCiFront = activeDocs.some((d: any) => d.document_type === 'ci_front' || d.document_type === 'ci_nou_front');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasCiBack = activeDocs.some((d: any) => d.document_type === 'ci_back' || d.document_type === 'ci_nou_back');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasSelfie = activeDocs.some((d: any) => d.document_type === 'selfie');

    let kycStatus = 'unverified';
    if (hasCiFront && hasCiBack && hasSelfie) {
      kycStatus = 'verified';
    } else if (activeDocs.length > 0) {
      kycStatus = 'partial';
    }

    // Get auth metadata for last sign in
    let lastSignInAt = null;
    try {
      const { data: authData } = await adminClient.auth.admin.getUserById(id);
      lastSignInAt = authData?.user?.last_sign_in_at || null;
    } catch {
      // Ignore auth lookup errors
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          ...profile,
          last_sign_in_at: lastSignInAt,
          kyc_status: kycStatus,
        },
        orders: orders || [],
        kyc_documents: kycDocs || [],
        stats: {
          total_orders: orders?.length || 0,
          kyc_documents_count: activeDocs.length,
        },
      },
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/customers/[id]
 *
 * Block or unblock a customer.
 * Requires: users.manage permission
 *
 * Body: { blocked: boolean }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    try {
      await requirePermission(user.id, 'users.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json();
    const { blocked } = body;

    if (typeof blocked !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'blocked must be a boolean' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Verify target exists and is a customer
    const { data: profile, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (profile.role !== 'customer') {
      return NextResponse.json(
        { success: false, error: 'Can only block/unblock customers' },
        { status: 400 }
      );
    }

    // Update blocked_at timestamp
    const updateData: Record<string, unknown> = {
      blocked_at: blocked ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update customer block status:', updateError);

      // If blocked_at column doesn't exist, return a helpful error
      if (updateError.message?.includes('blocked_at')) {
        return NextResponse.json(
          {
            success: false,
            error: 'blocked_at column does not exist in profiles table. Run migration 024 to add it.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to update customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: blocked ? 'Customer blocked successfully' : 'Customer unblocked successfully',
      data: { blocked, blocked_at: blocked ? updateData.blocked_at : null },
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
