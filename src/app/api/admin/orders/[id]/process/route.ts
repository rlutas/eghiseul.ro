import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  'paid': ['processing'],
  'processing': ['documents_generated'],
  'documents_generated': ['submitted_to_institution'],
  'submitted_to_institution': ['document_received'],
  'document_received': ['extras_in_progress', 'document_ready'],
  'extras_in_progress': ['document_ready'],
  'document_ready': ['shipped'],
  'shipped': ['completed'],
};

// Action to new status mapping
const ACTION_STATUS_MAP: Record<string, string> = {
  'start_processing': 'processing',
  'generate_cerere': 'documents_generated',
  'mark_submitted': 'submitted_to_institution',
  'upload_received': 'document_received',
  'start_extras': 'extras_in_progress',
  'mark_ready': 'document_ready',
  'complete': 'completed',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json();
    const { action, data: actionData } = body;

    if (!action || !ACTION_STATUS_MAP[action]) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ACTION', message: 'Actiune invalida' } },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Get current order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: orderError } = await (adminClient as any)
      .from('orders')
      .select('id, status, selected_options, customer_data')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Comanda nu a fost gasita' } },
        { status: 404 }
      );
    }

    const newStatus = ACTION_STATUS_MAP[action];
    const validNext = VALID_TRANSITIONS[order.status] || [];

    if (!validNext.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: {
          code: 'INVALID_TRANSITION',
          message: `Nu se poate trece de la "${order.status}" la "${newStatus}". Tranzitii valide: ${validNext.join(', ')}`
        }},
        { status: 400 }
      );
    }

    // Update order status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (adminClient as any)
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_FAILED', message: 'Eroare la actualizarea statusului' } },
        { status: 500 }
      );
    }

    // Log to order_history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from('order_history')
      .insert({
        order_id: orderId,
        changed_by: user.id,
        event_type: 'status_changed',
        old_value: { status: order.status },
        new_value: { status: newStatus },
        notes: actionData?.notes || `Status schimbat: ${order.status} → ${newStatus}`,
      });

    // If action involves file upload, store document reference
    if (actionData?.file_key && actionData?.file_name) {
      const docType = action === 'upload_received' ? 'document_received' : 'document_final';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('order_documents')
        .insert({
          order_id: orderId,
          type: docType,
          s3_key: actionData.file_key,
          file_name: actionData.file_name,
          visible_to_client: docType === 'document_final',
          generated_by: user.id,
        });
    }

    // Handle option completion
    if (action === 'complete_option' && actionData?.option_code) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('order_option_status')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        })
        .eq('order_id', orderId)
        .eq('option_code', actionData.option_code);
    }

    return NextResponse.json({
      success: true,
      data: {
        new_status: newStatus,
        order_id: orderId,
      },
    });
  } catch (error) {
    console.error('Process order error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Eroare interna' } },
      { status: 500 }
    );
  }
}
