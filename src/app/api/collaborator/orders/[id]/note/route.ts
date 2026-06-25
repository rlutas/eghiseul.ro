import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';

/**
 * A collaborator (topograph) adds a note on one of their orders. Stored in
 * order_history (event_type='note_added') so the admin team sees it in the
 * order's history, tagged as coming from the collaborator.
 */
const MAX_NOTE_LENGTH = 2000;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requireCollaboratorForOrder(user.id, orderId);
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const body = await request.json().catch(() => ({}));
    const note = ((body?.note as string) ?? '').trim();
    if (!note) {
      return NextResponse.json({ success: false, error: 'Nota nu poate fi goală' }, { status: 400 });
    }
    if (note.length > MAX_NOTE_LENGTH) {
      return NextResponse.json({ success: false, error: `Maxim ${MAX_NOTE_LENGTH} caractere` }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: profile } = await admin.from('profiles').select('first_name, last_name, email').eq('id', user.id).single();
    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email || 'colaborator';

    const { error } = await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'note_added',
      changed_by: `colaborator: ${name}`,
      notes: note,
    });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[collaborator] note error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
