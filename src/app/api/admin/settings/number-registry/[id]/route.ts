import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { getRegistryClient } from '@/lib/registry/client';

// The registry lives in the CENTRAL Supabase project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  }
  try {
    await requirePermission(user.id, 'registry.manage');
  } catch (error) {
    if (error instanceof Response) return { error };
    throw error;
  }
  return { user };
}

// ──────────────────────────────────────────────────────────────
// PATCH /api/admin/settings/number-registry/[id]
// Edit a registry entry (corectare număr / client / serviciu / dată).
// Numărul rămâne protejat de UNIQUE (type, year, number) — un duplicat
// întoarce 400, nu suprascrie.
// ──────────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const registry: AnyClient = getRegistryClient();

    const updatePayload: Record<string, unknown> = {};

    if (body.number !== undefined) {
      const n = parseInt(String(body.number), 10);
      if (!Number.isInteger(n) || n <= 0) {
        return NextResponse.json({ success: false, error: 'Numar invalid' }, { status: 400 });
      }
      updatePayload.number = n;
    }
    if (body.series !== undefined) updatePayload.series = body.series?.trim() || null;
    if (body.client_name !== undefined) {
      if (!String(body.client_name).trim()) {
        return NextResponse.json({ success: false, error: 'Numele clientului este obligatoriu' }, { status: 400 });
      }
      updatePayload.client_name = String(body.client_name).trim();
    }
    if (body.client_email !== undefined) updatePayload.client_email = body.client_email?.trim() || null;
    if (body.client_cnp !== undefined) updatePayload.client_cnp = body.client_cnp?.trim() || null;
    if (body.client_cui !== undefined) updatePayload.client_cui = body.client_cui?.trim() || null;
    if (body.service_type !== undefined) updatePayload.service_type = body.service_type?.trim() || null;
    if (body.description !== undefined) updatePayload.description = body.description?.trim() || null;
    if (body.amount !== undefined) updatePayload.amount = body.amount === null || body.amount === '' ? null : parseFloat(body.amount);
    if (body.date !== undefined && body.date) updatePayload.date = body.date;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, error: 'Nimic de actualizat' }, { status: 400 });
    }

    const { data, error } = await registry
      .from('number_registry')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Numarul exista deja in registru pentru acest tip si an' },
          { status: 400 }
        );
      }
      console.error('Registry entry PATCH failed:', error);
      return NextResponse.json({ success: false, error: 'Eroare la actualizare' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Registry entry PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────
// DELETE /api/admin/settings/number-registry/[id]
// Ștergere DEFINITIVĂ (pentru intrări greșite / test). Pentru numere
// consumate real folosiți ANULAREA (void) — ștergerea eliberează numărul
// doar dacă micșorați manual next_number pe interval.
// ──────────────────────────────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const registry: AnyClient = getRegistryClient();
    const { data, error } = await registry
      .from('number_registry')
      .delete()
      .eq('id', id)
      .select('id, number, type')
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Inregistrarea nu a fost gasita' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Registry entry DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
