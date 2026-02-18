import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// number_registry table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// POST /api/admin/settings/number-registry/[id]/void
// Void a registry entry
// ──────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'settings.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json().catch(() => ({}));

    const adminClient: AnyClient = createAdminClient();

    // ── Void number via RPC ──

    const { data, error } = await (adminClient as AnyClient).rpc('void_number', {
      p_registry_id: id,
      p_voided_by: user.id,
      p_void_reason: body.reason || null,
    });

    if (error) {
      console.error('Failed to void number:', error);

      // P0002 = registry entry not found
      if (error.code === 'P0002') {
        return NextResponse.json(
          { success: false, error: 'Inregistrarea din registru nu a fost gasita' },
          { status: 404 }
        );
      }

      // P0003 = already voided
      if (error.code === 'P0003') {
        return NextResponse.json(
          { success: false, error: 'Aceasta inregistrare a fost deja anulata' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Eroare la anularea inregistrarii din registru' },
        { status: 500 }
      );
    }

    // Fetch the updated entry to return it
    const { data: updatedEntry, error: fetchError } = await adminClient
      .from('number_registry')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch updated registry entry:', fetchError);
      // The void succeeded, so return the RPC result
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Number registry void error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
