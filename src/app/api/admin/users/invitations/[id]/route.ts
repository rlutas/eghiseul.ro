import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/admin/users/invitations/[id]
 *
 * Revoke an invitation (sets status to 'revoked', does not actually delete).
 * Requires: users.manage permission
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    // Check invitation exists and is in a revocable state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invitation, error: fetchError } = await (adminClient as any)
      .from('employee_invitations')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Cannot revoke invitation with status: ${invitation.status}` },
        { status: 400 }
      );
    }

    // Update status to revoked
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (adminClient as any)
      .from('employee_invitations')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to revoke invitation:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to revoke invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully',
    });
  } catch (error) {
    console.error('Revoke invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
