import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * GET /api/admin/users/employees
 *
 * List all employee and super_admin profiles.
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

    // Fetch all profiles with employee or super_admin role
    const { data: employees, error } = await adminClient
      .from('profiles')
      .select('id, email, first_name, last_name, role, permissions, created_at, updated_at')
      .in('role', ['employee', 'super_admin', 'manager', 'operator', 'contabil', 'avocat'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch employees:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch employees' },
        { status: 500 }
      );
    }

    // Try to get last_sign_in_at from auth.users via Supabase admin API
    // The admin client can list users to get auth metadata
    const employeesWithAuth = await Promise.all(
      (employees || []).map(async (emp) => {
        try {
          const { data: authData } = await adminClient.auth.admin.getUserById(emp.id);
          return {
            ...emp,
            last_sign_in_at: authData?.user?.last_sign_in_at || null,
          };
        } catch {
          return { ...emp, last_sign_in_at: null };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: employeesWithAuth,
    });
  } catch (error) {
    console.error('List employees error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
