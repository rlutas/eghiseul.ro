import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { getRegistryClient } from '@/lib/registry/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// POST /api/admin/settings/number-registry/[id]/restore
// Restaurează o intrare ANULATĂ (void) — numărul redevine valid.
// ──────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'registry.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const registry: AnyClient = getRegistryClient();

    const { data: entry, error: fetchError } = await registry
      .from('number_registry')
      .select('id, voided_at, platform, order_ref')
      .eq('id', id)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json({ success: false, error: 'Inregistrarea nu a fost gasita' }, { status: 404 });
    }
    if (!entry.voided_at) {
      return NextResponse.json({ success: false, error: 'Inregistrarea nu este anulata' }, { status: 400 });
    }

    const { data, error } = await registry
      .from('number_registry')
      .update({
        voided_at: null,
        voided_by: null,
        void_reason: null,
        source: entry.platform ? 'platform' : 'manual',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // 23505 = restaurarea ar reactiva o alocare duplicat pe aceeași comandă
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Comanda are deja un numar activ de acest tip — nu se poate restaura' },
          { status: 400 }
        );
      }
      console.error('Registry restore failed:', error);
      return NextResponse.json({ success: false, error: 'Eroare la restaurare' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Registry restore error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
