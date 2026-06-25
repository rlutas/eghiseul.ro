import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { deliverCollaboratorResult } from '@/lib/collaborator/deliver';

/**
 * Collaborator marks the order ready: makes the attached document(s) visible to
 * the client, sets status document_ready, and emails the customer (auto-delivery).
 * Idempotent.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    try {
      await requireCollaboratorForOrder(user.id, orderId);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const result = await deliverCollaboratorResult(orderId);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error ?? 'Eroare la livrare' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[collaborator] mark-ready error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
