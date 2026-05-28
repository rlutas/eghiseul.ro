/**
 * POST /api/admin/orders/[id]/verify-documents
 *
 * Marks the customer's identity documents as manually verified by admin.
 * Used when cross-validation warnings exist but the operator has visually
 * confirmed the docs are correct, or just as a sign-off that someone
 * has eyeballed the KYC before processing.
 *
 * Stores `adminVerifiedAt` (ISO timestamp) and `adminVerifiedBy` (admin user id)
 * on `customer_data.personal` (or `customer_data.personalData` for PJ flow).
 *
 * Also inserts an `order_history` row with event_type='documents_verified'
 * so the timeline shows who verified + when, distinct from automated KYC
 * pass/fail.
 *
 * Body: empty (no parameters — verification is binary, no fields).
 *
 * Auth: `orders.manage` permission required.
 *
 * Idempotent — re-verifying just updates the timestamp + actor. No
 * undo button on the UI; if admin needs to mark "actually not verified"
 * they can DELETE via the same endpoint (separate handler below).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export const runtime = 'nodejs';

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
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const admin = createAdminClient();
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      .select('id, customer_data')
      .eq('id', orderId)
      .single();
    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerData = (order.customer_data as any) ?? {};
    const verifiedAt = new Date().toISOString();
    // Patch both shapes (personalData for PJ flow, personal for PF). We
    // update whichever exists; for orders missing personal entirely we
    // create the key (rare but possible for company-only orders).
    const updatedCustomerData = { ...customerData };
    if (customerData.personalData) {
      updatedCustomerData.personalData = {
        ...customerData.personalData,
        adminVerifiedAt: verifiedAt,
        adminVerifiedBy: user.id,
      };
    } else {
      updatedCustomerData.personal = {
        ...(customerData.personal ?? {}),
        adminVerifiedAt: verifiedAt,
        adminVerifiedBy: user.id,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (admin as any)
      .from('orders')
      .update({ customer_data: updatedCustomerData, updated_at: verifiedAt })
      .eq('id', orderId);
    if (updateErr) {
      console.error('[verify-documents] update failed:', updateErr);
      return NextResponse.json({ success: false, error: 'Failed to save verification' }, { status: 500 });
    }

    // Audit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: orderId,
      event_type: 'documents_verified',
      changed_by: user.id,
      new_value: { adminVerifiedAt: verifiedAt, adminVerifiedBy: user.id },
      notes: 'Documente identitate marcate ca verificate manual de admin',
    });

    return NextResponse.json({
      success: true,
      data: { adminVerifiedAt: verifiedAt, adminVerifiedBy: user.id },
    });
  } catch (error) {
    console.error('[verify-documents] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE — clears verification flags. Useful if admin marked verified by
 * mistake (e.g., clicked the wrong order) and wants to revert before
 * re-reviewing.
 */
export async function DELETE(
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
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const admin = createAdminClient();
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      .select('id, customer_data')
      .eq('id', orderId)
      .single();
    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerData = (order.customer_data as any) ?? {};
    const updatedCustomerData = { ...customerData };
    if (customerData.personalData?.adminVerifiedAt) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { adminVerifiedAt, adminVerifiedBy, ...rest } = customerData.personalData;
      updatedCustomerData.personalData = rest;
    }
    if (customerData.personal?.adminVerifiedAt) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { adminVerifiedAt, adminVerifiedBy, ...rest } = customerData.personal;
      updatedCustomerData.personal = rest;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (admin as any)
      .from('orders')
      .update({ customer_data: updatedCustomerData, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (updateErr) {
      console.error('[verify-documents:DELETE] update failed:', updateErr);
      return NextResponse.json({ success: false, error: 'Failed to clear verification' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: orderId,
      event_type: 'documents_verification_cleared',
      changed_by: user.id,
      new_value: { clearedAt: new Date().toISOString() },
      notes: 'Marcaj de verificare manuală retras de admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[verify-documents:DELETE] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
