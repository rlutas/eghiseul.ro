import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

/**
 * Helper to query employee_invitations table (not in generated types yet).
 */
function invitationsTable(client: AnyClient) {
  return (client as AnyClient).from('employee_invitations');
}

/**
 * GET /api/admin/invite/accept?token=xxx
 *
 * PUBLIC endpoint - no auth required.
 * Validates an invitation token and returns invitation details.
 *
 * Returns: { email, permissions, expiresAt, status }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Find invitation by token
    const { data: invitation, error } = await invitationsTable(adminClient)
      .select('id, email, permissions, status, expires_at, created_at')
      .eq('token', token)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if already used
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'This invitation has already been accepted' },
        { status: 410 }
      );
    }

    // Check if revoked
    if (invitation.status === 'revoked') {
      return NextResponse.json(
        { success: false, error: 'This invitation has been revoked' },
        { status: 410 }
      );
    }

    // Check expiration
    if (invitation.status === 'pending' && new Date(invitation.expires_at) < new Date()) {
      // Update status to expired in DB
      await invitationsTable(adminClient)
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return NextResponse.json(
        { success: false, error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    // Check if already expired in DB
    if (invitation.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        email: invitation.email,
        permissions: invitation.permissions,
        expiresAt: invitation.expires_at,
        status: invitation.status,
      },
    });
  } catch (error) {
    console.error('Validate invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/invite/accept
 *
 * Auth required. Accept an invitation and become an employee.
 *
 * Body: { token: string }
 *
 * Logic:
 * 1. Get authenticated user
 * 2. Validate token (pending, not expired)
 * 3. Check invitation email matches user's email (case-insensitive)
 * 4. Update profile: role='employee', permissions=invitation.permissions
 * 5. Update invitation: status='accepted', accepted_at=now()
 * 6. Return success with redirect to /admin
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in first.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Find invitation by token
    const { data: invitation, error: fetchError } = await invitationsTable(adminClient)
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check invitation status
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Invitation is ${invitation.status}` },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      // Update status to expired
      await invitationsTable(adminClient)
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', invitation.id);

      return NextResponse.json(
        { success: false, error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    // Verify email matches (case-insensitive)
    const userEmail = user.email?.toLowerCase();
    const invitationEmail = invitation.email?.toLowerCase();

    if (!userEmail || !invitationEmail || userEmail !== invitationEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'This invitation was sent to a different email address. Please log in with the correct account.',
        },
        { status: 403 }
      );
    }

    // Check if user is already an admin/employee
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'You are already a super admin' },
        { status: 400 }
      );
    }

    const invitedRole = invitation.role || 'employee';

    if (profile?.role === 'employee' || (profile?.role && ['manager', 'operator', 'contabil', 'avocat'].includes(profile.role))) {
      // Update role and permissions with the new invitation's values
      await adminClient
        .from('profiles')
        .update({
          role: invitedRole,
          permissions: invitation.permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Mark invitation as accepted
      await invitationsTable(adminClient)
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      return NextResponse.json({
        success: true,
        message: 'Permissions updated successfully',
        redirect: '/admin',
      });
    }

    // Update profile with invited role and permissions
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        role: invitedRole,
        permissions: invitation.permissions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to accept invitation' },
        { status: 500 }
      );
    }

    // Mark invitation as accepted
    const { error: invUpdateError } = await invitationsTable(adminClient)
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (invUpdateError) {
      console.error('Failed to update invitation status:', invUpdateError);
      // Don't fail the whole request - profile was already updated
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted! You now have employee access.',
      redirect: '/admin',
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
