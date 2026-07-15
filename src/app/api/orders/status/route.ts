import { createClient as createServiceClient } from '@supabase/supabase-js';
import { normalizeOrderOptions } from '@/lib/orders/normalize';
import { NextRequest, NextResponse } from 'next/server';
import { reuploadDocLabel } from '@/lib/reupload/doc-types';

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
        paid_at,
        base_price,
        options_price,
        delivery_price,
        total_price,
        payment_status,
        invoice_number,
        invoice_url,
        extra_billing,
        additional_paid_amount,
        delivery_method,
        delivery_tracking_number,
        estimated_completion_date,
        customer_data,
        selected_options,
        service:services(
          id,
          name,
          slug,
          category,
          estimated_days,
          urgent_days,
          processing_config
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

    // Internal/team-only events must NEVER reach the public timeline — team
    // notes (note_added) can contain operational details (e.g. corrected
    // phone numbers), and the reupload/kyc events use team-facing wording.
    const INTERNAL_EVENTS = new Set([
      'note_added',
      'admin_action',
      'reupload_requested',
      'kyc_photo_resubmitted',
    ]);

    // Build timeline from history - extract status from new_value when available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (history || []).filter((h: any) => !INTERNAL_EVENTS.has(h.event_type)).map((h: any) => {
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

    // Clean the customer-facing timeline (team feedback): each stage appears
    // ONCE (raw history has repeats — two pending_payment rows, 'paid' +
    // payment_confirmed, double 'completed'), and the raw 'paid' status is
    // folded into payment_confirmed so nothing renders untranslated.
    const seenStages = new Set<string>();
    const cleanedTimeline = timeline.filter((t) => {
      const stage = t.status === 'paid' ? 'payment_confirmed' : t.status;
      t.status = stage;
      if (seenStages.has(stage)) return false;
      seenStages.add(stage);
      return true;
    });
    timeline.length = 0;
    timeline.push(...cleanedTimeline);

    // Transform documents for client display
    const DOC_TYPE_LABELS: Record<string, string> = {
      contract_complet: 'Contract',
      constatator: 'Certificat Constatator (ONRC)',
      document_received: 'Document primit de la instituție',
      document_final: 'Document final',
      contract_prestari: 'Contract Prestări Servicii',
      contract_asistenta: 'Contract Asistență Juridică',
      imputernicire: 'Împuternicire',
      cerere_eliberare_pf: 'Cerere Eliberare PF',
      cerere_eliberare_pj: 'Cerere Eliberare PJ',
      'collaborator-document': 'Document eliberat',
      'extras-carte-funciara': 'Extras de Carte Funciară',
      'ancpi-chitanta': 'Chitanță ANCPI',
    };

    // Company name for constatator label — the client should see WHICH firm
    // the certificate is for (e.g. "Certificat Constatator — RNWE GROUP SRL").
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cdAny = order.customer_data as any;
    const firmName =
      cdAny?.billing?.companyName || cdAny?.company?.companyName ||
      cdAny?.companyData?.companyName || cdAny?.constatator?.companyName || null;

    // Client identity for the status card (requester already proved
    // order_code + email ownership). PF name from billing/personal; PJ = firm.
    const isPJ =
      cdAny?.billing?.type === 'persoana_juridica' || cdAny?.billing?.type === 'company' ||
      cdAny?.billing?.source === 'company' || !!firmName;
    const pfName = [
      cdAny?.billing?.firstName || cdAny?.personal?.firstName,
      cdAny?.billing?.lastName || cdAny?.personal?.lastName,
    ].filter(Boolean).join(' ') || null;
    // Motivul solicitării — same lookup chain as the admin order page.
    const purpose =
      cdAny?.contact?.purpose || cdAny?.civil_status?.purpose ||
      cdAny?.property?.motiv || cdAny?.constatator?.purpose || null;

    const clientDocuments = (documents || []).map(doc => ({
      id: doc.id,
      type: doc.type,
      label:
        doc.type === 'constatator' && firmName
          ? `Certificat Constatator — ${firmName}`
          : DOC_TYPE_LABELS[doc.type] || doc.type,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      documentNumber: doc.document_number,
      createdAt: doc.created_at,
    }));

    // Canonical option shape (snake_case wizard rows + camelCase Modify rows) —
    // the old manual map showed 0 lei on wizard rows (read only priceModifier)
    // and is the single place the client sees what they paid for, including
    // add-ons bought later via extra payment.
    const normalizedOptions = normalizeOrderOptions(
      order.selected_options as Parameters<typeof normalizeOrderOptions>[0]
    );
    const hasUrgent = normalizedOptions.some((opt) => opt.name.toLowerCase().includes('urgent'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceData = order.service as any;
    const estimatedDays = serviceData?.estimated_days || null;
    const urgentDays = serviceData?.urgent_days || null;
    const processingDays = hasUrgent && urgentDays ? urgentDays : (estimatedDays || null);

    // Active "Solicită documente" request → the status page shows an upload
    // banner with the direct link. Safe to expose here: the caller already
    // proved they know the order code + the order's email.
    let pendingReupload: {
      url: string;
      documents: string[];
      expiresAt: string;
    } | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: reupload } = await (supabase as any)
        .from('reupload_requests')
        .select('token, document_type, document_types, completed_documents, token_expires_at')
        .eq('order_id', order.id)
        .eq('status', 'pending')
        .gt('token_expires_at', new Date().toISOString())
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (reupload) {
        const types: string[] =
          Array.isArray(reupload.document_types) && reupload.document_types.length > 0
            ? reupload.document_types
            : [reupload.document_type];
        const done = new Set(
          (Array.isArray(reupload.completed_documents) ? reupload.completed_documents : []).map(
            (d: { type: string }) => d.type
          )
        );
        const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
        pendingReupload = {
          url: `${base}/reincarca-poza/${reupload.token}`,
          documents: types
            .filter((t) => !done.has(t))
            .map((t) => reuploadDocLabel(t)),
          expiresAt: reupload.token_expires_at,
        };
      }
    } catch (err) {
      console.error('[order-status] reupload lookup failed (continuing):', err);
    }

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
        clientType: isPJ ? 'PJ' : 'PF',
        clientName: isPJ ? null : pfName,
        companyName: isPJ ? firmName : null,
        purpose,
        status: order.status,
        paymentStatus: order.payment_status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoiceNumber: (order as any).invoice_number as string | null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoiceUrl: (order as any).invoice_url as string | null,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paidAt: (order as any).paid_at as string | null,
        // Per-service 30-min self-cancel toggle (processing_config.allow_self_cancel).
        // Default true when unset; instant-automated services set it false.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selfCancelAllowed: ((order as any).service?.processing_config?.allow_self_cancel) !== false,
        service: serviceData,
        selectedOptions: normalizedOptions.map((opt) => ({
          optionName: opt.name,
          priceModifier: opt.unitPrice,
          quantity: opt.quantity,
        })),
        // Fiscal invoices for extra payments (admin Modify flow) — shown next
        // to the main invoice so the client sees the full billing picture.
        extraInvoices: (Array.isArray((order as any).extra_billing) ? (order as any).extra_billing : [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((e: any) => e?.invoice?.number)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((e: any) => ({
            number: `${e.invoice.seriesName}-${e.invoice.number}`,
            url: e.invoice.link ?? null,
            amount: e.amount ?? null,
            paidAt: e.paidAt ?? null,
          })),
        processingDays,
        hasUrgent,
        pendingReupload,
        estimatedCompletionDate: order.estimated_completion_date
          ? new Date(order.estimated_completion_date).toISOString()
          : null,
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
          // Extra payments collected after the original order (Modify flow).
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          additionalPaid: Number((order as any).additional_paid_amount ?? 0) || 0,
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
