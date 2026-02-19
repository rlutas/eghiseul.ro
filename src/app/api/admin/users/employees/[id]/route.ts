import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission, ALL_PERMISSIONS, type Permission } from '@/lib/admin/permissions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/users/employees/[id]
 *
 * Update an employee's permissions.
 * Requires: users.manage permission
 *
 * Body: { permissions: Record<string, boolean> }
 *
 * Rules:
 * - Cannot modify super_admin permissions
 * - Only employees can have permissions modified
 * - Permission keys must be valid (from ALL_PERMISSIONS)
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
    const { permissions, role: newRole } = body;

    // Validate permissions object
    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Permissions object is required' },
        { status: 400 }
      );
    }

    // Validate role if provided
    const validRoles = ['employee', 'avocat', 'manager', 'operator', 'contabil'];
    if (newRole && !validRoles.includes(newRole)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Valid roles: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate permission keys
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

    // Fetch the target employee
    const { data: employee, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .single();

    if (fetchError || !employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Cannot modify super_admin permissions
    if (employee.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot modify super_admin permissions' },
        { status: 403 }
      );
    }

    // Only admin roles can be modified (not super_admin, not customer)
    const editableRoles = ['employee', 'avocat', 'manager', 'operator', 'contabil'];
    if (!employee.role || !editableRoles.includes(employee.role)) {
      return NextResponse.json(
        { success: false, error: 'Can only modify permissions for admin roles' },
        { status: 400 }
      );
    }

    // Update role and permissions
    const updateData: Record<string, unknown> = {
      permissions,
      updated_at: new Date().toISOString(),
    };
    if (newRole) {
      updateData.role = newRole;
    }

    const { error: updateError } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update employee permissions:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update permissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee permissions updated successfully',
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/employees/[id]
 *
 * Remove employee role (revert to customer).
 * Requires: users.manage permission
 *
 * Rules:
 * - Cannot delete super_admin
 * - Sets role back to 'customer' and clears permissions
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

    // Fetch the target employee
    const { data: employee, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', id)
      .single();

    if (fetchError || !employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Cannot delete super_admin
    if (employee.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove super_admin role' },
        { status: 403 }
      );
    }

    // Only admin roles can be demoted
    const demotableRoles = ['employee', 'avocat', 'manager', 'operator', 'contabil'];
    if (!employee.role || !demotableRoles.includes(employee.role)) {
      return NextResponse.json(
        { success: false, error: 'User is not an admin/employee' },
        { status: 400 }
      );
    }

    // Prevent self-demotion
    if (id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove your own employee role' },
        { status: 400 }
      );
    }

    // Revert to customer role and clear permissions
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        role: 'customer',
        permissions: {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to remove employee:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to remove employee' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee role removed successfully. User reverted to customer.',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
