import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission, ALL_PERMISSIONS, type Permission } from '@/lib/admin/permissions';
import crypto from 'crypto';

/**
 * POST /api/admin/users/invite
 *
 * Send an employee invitation to an email address.
 * Requires: users.manage permission
 *
 * Body: { email: string, role?: string, permissions: Record<string, boolean> }
 */

const VALID_INVITE_ROLES = ['employee', 'avocat', 'manager', 'operator', 'contabil'];

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
    const { email, permissions, role: requestedRole } = body;

    // Validate role
    const role = requestedRole || 'employee';
    if (!VALID_INVITE_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Valid roles: ${VALID_INVITE_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate permissions object
    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Permissions object is required' },
        { status: 400 }
      );
    }

    // Validate that all permission keys are valid
    const invalidKeys = Object.keys(permissions).filter(
      (key) => !ALL_PERMISSIONS.includes(key as Permission)
    );
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid permission keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if user already exists with employee/super_admin role
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, email, role')
      .eq('email', email.toLowerCase())
      .single();

    const adminRoles = ['employee', 'super_admin', 'manager', 'operator', 'contabil', 'avocat'];
    if (existingProfile && existingProfile.role && adminRoles.includes(existingProfile.role)) {
      return NextResponse.json(
        { success: false, error: 'This user already has an admin/employee role' },
        { status: 409 }
      );
    }

    // Check if pending invitation already exists for this email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingInvitation } = await (adminClient as any)
      .from('employee_invitations')
      .select('id, email, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { success: false, error: 'A pending invitation already exists for this email' },
        { status: 409 }
      );
    }

    // Generate secure token
    const token = crypto.randomUUID();

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Insert invitation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invitation, error: insertError } = await (adminClient as any)
      .from('employee_invitations')
      .insert({
        email: email.toLowerCase(),
        invited_by: user.id,
        role,
        permissions,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select('id, email, token, expires_at, created_at')
      .single();

    if (insertError) {
      console.error('Failed to create invitation:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Build invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eghiseul.ro';
    const inviteLink = `${baseUrl}/admin/invite/accept?token=${token}`;

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        link: inviteLink,
        expiresAt: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Invite user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
