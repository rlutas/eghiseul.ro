import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { createInvoiceFromOrder } from '@/lib/oblio';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/orders/[id]/verify-payment
 *
 * Admin endpoint to verify bank transfer payment.
 * Creates invoice and updates order to paid status.
 *
 * Body: { action: 'approve' | 'reject', notes?: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check admin authentication
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
      await requirePermission(user.id, 'payments.verify');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    // Fetch order with service name
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, services(name)')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order is awaiting verification
    if (order.payment_status !== 'awaiting_verification') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot verify payment. Current status: ${order.payment_status}`,
        },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      // Reject the payment
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          verified_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Failed to reject payment:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update order' },
          { status: 500 }
        );
      }

      // Add to order history
      await supabase.from('order_history').insert({
        order_id: id,
        event_type: 'payment_rejected',
        notes: notes || 'Dovada de plata respinsa de admin',
        changed_by: user.id,
        new_value: JSON.stringify({
          payment_status: 'failed',
          verified_by: user.id,
        }),
      });

      // TODO: Send email to customer about rejection

      return NextResponse.json({
        success: true,
        message: 'Payment rejected',
        data: { payment_status: 'failed' },
      });
    }

    // Approve the payment
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        verified_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to approve payment:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`Order ${id} payment verified by admin ${user.id}`);

    // Create invoice
    let invoice = null;
    let invoiceError = null;

    try {
      // Get service name from joined relation
      const serviceName = (order.services as { name: string } | null)?.name || 'Serviciu eGhiseul';

      invoice = await createInvoiceFromOrder(
        {
          id: order.id,
          order_number: order.order_number ?? undefined,
          friendly_order_id: order.friendly_order_id ?? undefined,
          service_name: serviceName,
          base_price: order.base_price ?? undefined,
          total_price: order.total_price,
          selected_options: order.selected_options as Array<{ code?: string; name: string; price: number }> | undefined,
          delivery_method: order.delivery_method ?? undefined,
          delivery_price: order.delivery_price ?? undefined,
          customer_data: order.customer_data as Record<string, unknown> | undefined,
        },
        'Transfer bancar'
      );

      // Update order with invoice info
      await supabase
        .from('orders')
        .update({
          invoice_number: invoice.invoiceNumber,
          invoice_url: invoice.pdfUrl,
          invoice_issued_at: invoice.createdAt,
        })
        .eq('id', id);

      console.log(`Invoice ${invoice.invoiceNumber} created for order ${id}`);
    } catch (err) {
      console.error('Failed to create invoice:', err);
      invoiceError = err instanceof Error ? err.message : 'Invoice creation failed';
    }

    // Add to order history
    await supabase.from('order_history').insert({
      order_id: id,
      event_type: 'payment_verified',
      notes: invoice
        ? `Transfer bancar verificat de admin. Factura: ${invoice.invoiceNumber}`
        : `Transfer bancar verificat de admin. Crearea facturii a esuat: ${invoiceError}`,
      changed_by: user.id,
      new_value: JSON.stringify({
        payment_status: 'paid',
        verified_by: user.id,
        invoice_number: invoice?.invoiceNumber,
        invoice_error: invoiceError,
      }),
    });

    // TODO: Send email to customer confirming payment and attaching invoice

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment_status: 'paid',
        invoice: invoice
          ? {
              number: invoice.invoiceNumber,
              url: invoice.pdfUrl,
            }
          : null,
        invoice_error: invoiceError,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
