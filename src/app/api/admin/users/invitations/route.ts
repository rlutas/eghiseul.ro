import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * GET /api/admin/users/invitations
 *
 * List all employee invitations (pending, accepted, expired, revoked).
 * Requires: users.manage permission
 */
export async function GET() {
  try {
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

    // Fetch all invitations, ordered by creation date (newest first)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invitations, error } = await (adminClient as any)
      .from('employee_invitations')
      .select('id, email, role, permissions, status, expires_at, accepted_at, created_at, invited_by')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch invitations:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    // Auto-expire any invitations that have passed their expiry date
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedInvitations = invitations?.map((inv: any) => {
      if (inv.status === 'pending' && new Date(inv.expires_at) < now) {
        // Mark as expired in the response (we'll also update DB)
        return { ...inv, status: 'expired' };
      }
      return inv;
    });

    // Batch-update expired invitations in DB
    const expiredIds = invitations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.filter((inv: any) => inv.status === 'pending' && new Date(inv.expires_at) < now)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((inv: any) => inv.id);

    if (expiredIds && expiredIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('employee_invitations')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .in('id', expiredIds);
    }

    return NextResponse.json({
      success: true,
      data: updatedInvitations || [],
    });
  } catch (error) {
    console.error('List invitations error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
