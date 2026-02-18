import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// number_ranges table is not in generated Supabase types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// PATCH /api/admin/settings/number-ranges/[id]
// Update or archive a number range
// ──────────────────────────────────────────────────────────────

export async function PATCH(
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

    const adminClient: AnyClient = createAdminClient();

    // Fetch current range to verify it exists
    const { data: currentRange, error: fetchError } = await adminClient
      .from('number_ranges')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentRange) {
      return NextResponse.json(
        { success: false, error: 'Intervalul de numere nu a fost gasit' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { notes, status, series } = body;

    // Build update payload - only allowed fields
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (notes !== undefined) {
      updatePayload.notes = notes?.trim() || null;
    }

    if (series !== undefined) {
      updatePayload.series = series?.trim() || null;
    }

    if (status !== undefined) {
      // Status can be changed to 'archived' or 'active'
      if (status !== 'archived' && status !== 'active') {
        return NextResponse.json(
          { success: false, error: 'Statusul poate fi schimbat doar in "archived" sau "active"' },
          { status: 400 }
        );
      }

      // If reactivating, verify the range isn't exhausted
      if (status === 'active' && currentRange.next_number > currentRange.range_end) {
        return NextResponse.json(
          { success: false, error: 'Intervalul este epuizat si nu poate fi reactivat' },
          { status: 400 }
        );
      }

      updatePayload.status = status;
    }

    // Apply update
    const { data: updatedRange, error: updateError } = await adminClient
      .from('number_ranges')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update number range:', updateError);
      return NextResponse.json(
        { success: false, error: 'Eroare la actualizarea intervalului de numere' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updatedRange });
  } catch (error) {
    console.error('Number ranges PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
