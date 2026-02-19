import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client to bypass RLS for public order status lookup
const getServiceClient = () => createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/orders/status
 *
 * Public endpoint to check order status by order code and email.
 * Used by guests who don't have accounts to track their orders.
 *
 * Query parameters:
 * - order_code: The friendly order ID (ORD-YYYYMMDD-XXXXX)
 * - email: The email used when placing the order
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderCode = searchParams.get('order_code');
    const email = searchParams.get('email');

    // Validate required parameters
    if (!orderCode) {
      return NextResponse.json(
        { error: 'Missing order_code parameter' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email parameter' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Look up order by friendly_order_id and email
    // Use lowercase comparison for email to handle case sensitivity
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        friendly_order_id,
        order_number,
        status,
        created_at,
        updated_at,
        base_price,
        options_price,
        delivery_price,
        total_price,
        payment_status,
        delivery_method,
        delivery_tracking_number,
        customer_data,
        selected_options,
        service:services(
          id,
          name,
          slug,
          category,
          estimated_days,
          urgent_days
        )
      `)
      .or(`friendly_order_id.eq.${orderCode},order_number.eq.${orderCode}`)
      .single();

    if (error || !order) {
      return NextResponse.json(
        {
          error: 'Order not found',
          message: 'Nu am găsit comanda. Verifică codul și emailul introduse.',
        },
        { status: 404 }
      );
    }

    // Validate email matches order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerData = order.customer_data as any;
    const orderEmail =
      customerData?.contact?.email ||
      customerData?.email;

    if (!orderEmail || orderEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Email mismatch',
          message: 'Emailul nu corespunde cu cel asociat comenzii.',
        },
        { status: 403 }
      );
    }

    // Fetch client-visible documents
    const { data: documents } = await supabase
      .from('order_documents')
      .select('id, type, file_name, file_size, document_number, created_at')
      .eq('order_id', order.id)
      .eq('visible_to_client', true)
      .order('created_at', { ascending: true });

    // Get order status history for timeline
    const { data: history } = await supabase
      .from('order_history')
      .select('id, event_type, notes, new_value, created_at, changed_by')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    // Return order details (sanitized for public view)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deliveryMethod = order.delivery_method as any;

    // Build timeline from history - extract status from new_value when available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (history || []).map((h: any) => {
      const newValue = h.new_value as { status?: string; payment_status?: string } | null;

      // Determine status to show based on event type
      let status = newValue?.status || h.event_type;
      if (h.event_type === 'payment_confirmed') {
        status = 'payment_confirmed';
      } else if (h.event_type === 'order_created' || h.event_type === 'draft_created') {
        status = 'order_created';
      }

      return {
        status,
        event: h.event_type,
        note: h.notes,
        createdAt: h.created_at,
      };
    });

    // Add initial order creation if not in timeline
    if (timeline.length === 0 || !timeline.find(t => t.event === 'order_created' || t.event === 'draft_created')) {
      timeline.unshift({
        status: 'order_created',
        event: 'order_created',
        note: 'Comanda a fost plasată',
        createdAt: order.created_at,
      });
    }

    // Add payment confirmed if paid but not in timeline
    if (order.payment_status === 'paid' && !timeline.find(t => t.event === 'payment_confirmed')) {
      // Find where to insert - after order created
      const insertIndex = timeline.findIndex(t => t.event !== 'order_created' && t.event !== 'draft_created');
      const paymentEvent = {
        status: 'payment_confirmed',
        event: 'payment_confirmed',
        note: 'Plata a fost confirmată',
        createdAt: order.updated_at || order.created_at,
      };
      if (insertIndex === -1) {
        timeline.push(paymentEvent);
      } else {
        timeline.splice(insertIndex, 0, paymentEvent);
      }
    }

    // Transform documents for client display
    const DOC_TYPE_LABELS: Record<string, string> = {
      contract_complet: 'Contract',
      contract_prestari: 'Contract Prestări Servicii',
      contract_asistenta: 'Contract Asistență Juridică',
      imputernicire: 'Împuternicire',
      cerere_eliberare_pf: 'Cerere Eliberare PF',
      cerere_eliberare_pj: 'Cerere Eliberare PJ',
    };

    const clientDocuments = (documents || []).map(doc => ({
      id: doc.id,
      type: doc.type,
      label: DOC_TYPE_LABELS[doc.type] || doc.type,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      documentNumber: doc.document_number,
      createdAt: doc.created_at,
    }));

    // Determine if order has urgent processing option
    const selectedOptions = (order.selected_options as Array<{ optionName?: string; option_name?: string; priceModifier?: number; quantity?: number }>) || [];
    const hasUrgent = selectedOptions.some(
      opt => (opt.optionName || opt.option_name || '').toLowerCase().includes('urgent')
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceData = order.service as any;
    const estimatedDays = serviceData?.estimated_days || null;
    const urgentDays = serviceData?.urgent_days || null;
    const processingDays = hasUrgent && urgentDays ? urgentDays : (estimatedDays || null);

    // VAT calculation (21% included in price)
    const VAT_RATE = 0.21;
    const totalPrice = parseFloat(String(order.total_price || 0));
    const subtotalWithoutVat = Math.round((totalPrice / (1 + VAT_RATE)) * 100) / 100;
    const vatAmount = Math.round((totalPrice - subtotalWithoutVat) * 100) / 100;

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderCode: order.friendly_order_id || order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        service: serviceData,
        selectedOptions: selectedOptions.map(opt => ({
          optionName: opt.optionName || opt.option_name || '',
          priceModifier: opt.priceModifier || 0,
          quantity: opt.quantity || 1,
        })),
        processingDays,
        hasUrgent,
        delivery: {
          method: deliveryMethod?.type || null,
          methodName: deliveryMethod?.name || null,
          estimatedDays: deliveryMethod?.estimated_days || null,
          trackingNumber: order.delivery_tracking_number || null,
        },
        pricing: {
          basePrice: order.base_price,
          optionsPrice: order.options_price,
          deliveryPrice: order.delivery_price,
          subtotalWithoutVat,
          vatAmount,
          vatRate: VAT_RATE,
          totalPrice: order.total_price,
        },
        timeline,
        documents: clientDocuments,
      },
    });
  } catch (error) {
    console.error('Order status lookup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'A apărut o eroare. Te rugăm să încerci din nou.',
      },
      { status: 500 }
    );
  }
}
