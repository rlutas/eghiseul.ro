import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';

/**
 * Single order detail for the collaborator: customer + property data needed to
 * do the work, plus any documents already attached. Scope is enforced by
 * requireCollaboratorForOrder (order's service must be assigned to this user).
 */
export async function GET(
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

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (admin as any)
      .from('orders')
      .select('id, friendly_order_id, status, created_at, service_id, customer_data, selected_options, services:service_id(name, slug, processing_config)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    const deliverable = order.services?.processing_config?.deliverable || null;

    // Only the collaborator's own uploads — the rest of the order's documents
    // (contract, cerere) carry client personal data and aren't his work.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents } = await (admin as any)
      .from('order_documents')
      .select('id, type, file_name, file_size, mime_type, visible_to_client, metadata, created_at')
      .eq('order_id', orderId)
      .eq('metadata->>source', 'collaborator')
      .order('created_at', { ascending: false });

    // Privacy: only the work data (property) reaches the collaborator —
    // contact/billing/personal client data stays server-side. ownerName/address
    // inside property ARE the object of the work on identificare services.
    const sanitizedOrder = {
      ...order,
      customer_data: { property: order.customer_data?.property ?? null },
    };

    return NextResponse.json({ success: true, data: { ...sanitizedOrder, deliverable, documents: documents ?? [] } });
  } catch (error) {
    console.error('[collaborator] order detail error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
