import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { generateOrderId } from '@/lib/order-id';
import { getMissingInvoiceClientFields } from '@/lib/oblio/invoice';
import { emailDomainAcceptsMail } from '@/lib/email-mx';

/**
 * POST /api/admin/orders/create — comandă telefonică creată de admin A→Z.
 *
 * Prețul se calculează EXCLUSIV server-side (services.base_price +
 * service_options.price după optionId + livrare fixă) — clientul HTTP trimite
 * doar id-uri. Comanda intră direct pe status='pending' (post-submit),
 * ocolind deliberat draft/submit și KYC guard-ul: actele + semnătura vin
 * ulterior prin link-ul de completare (/completare/[token]), după plată.
 *
 * Body:
 * {
 *   serviceId: string,
 *   optionIds?: string[],                        // service_options.id
 *   delivery?: { method: 'email' } | { method: 'courier', price: number? } — price ignorat, vezi mai jos
 *   customer: {
 *     contact: { firstName, lastName, email, phone },
 *     personal?: Record<string, unknown>,        // câmpuri tastate de operator
 *     billing: Record<string, unknown>,          // complet — validat cu getMissingInvoiceClientFields
 *     extra?: Record<string, unknown>            // secțiuni specifice serviciului (constatator, property...)
 *   },
 *   note?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json();
    const {
      serviceId,
      optionIds = [],
      delivery = { method: 'email' },
      customer,
      note,
    } = body as {
      serviceId?: string;
      optionIds?: string[];
      delivery?: { method: string; price?: number };
      customer?: {
        contact?: { firstName?: string; lastName?: string; email?: string; phone?: string };
        personal?: Record<string, unknown>;
        billing?: Record<string, unknown>;
        extra?: Record<string, unknown>;
      };
      note?: string;
    };

    if (!serviceId || !customer?.contact?.email || !customer?.contact?.phone) {
      return NextResponse.json(
        { success: false, error: 'Serviciul, emailul și telefonul clientului sunt obligatorii.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Service + price base — server-side source of truth.
    const { data: service, error: svcError } = await adminClient
      .from('services')
      .select('id, name, slug, base_price, is_active')
      .eq('id', serviceId)
      .single();
    if (svcError || !service || !service.is_active) {
      return NextResponse.json({ success: false, error: 'Serviciu inexistent sau inactiv.' }, { status: 400 });
    }

    // Options — fetch by id, price from DB only.
    let optionsPrice = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedOptions: any[] = [];
    if (optionIds.length > 0) {
      const { data: options, error: optError } = await adminClient
        .from('service_options')
        .select('id, code, name, price, is_active')
        .in('id', optionIds)
        .eq('service_id', serviceId);
      if (optError) {
        return NextResponse.json({ success: false, error: 'Eroare la încărcarea opțiunilor.' }, { status: 500 });
      }
      const found = options || [];
      if (found.length !== optionIds.length) {
        return NextResponse.json(
          { success: false, error: 'Una sau mai multe opțiuni nu aparțin serviciului selectat.' },
          { status: 400 }
        );
      }
      for (const opt of found) {
        const price = Number(opt.price) || 0;
        optionsPrice += price;
        // Persist in the wizard's snake_case shape — normalizeOrderOptions
        // downstream (Oblio, admin, status) understands it natively.
        selectedOptions.push({
          option_id: opt.id,
          option_name: opt.name,
          price_modifier: price,
          code: opt.code,
          quantity: 1,
        });
      }
    }

    // Delivery — email = 0; courier RO standard = flat 25 (minim livrare RO,
    // aliniat cu wizard-ul). Adminul poate ajusta ulterior din Modify.
    const deliveryPrice = delivery?.method === 'courier' ? 25 : 0;
    const deliveryMethod =
      delivery?.method === 'courier'
        ? { type: 'courier', name: 'Curier (stabilit telefonic)', price: deliveryPrice }
        : { type: 'email', name: 'Email (PDF)', price: 0 };

    const basePrice = Number(service.base_price) || 0;
    const totalPrice = Math.round((basePrice + optionsPrice + deliveryPrice) * 100) / 100;

    // Guards la creare — altfel factura (mark-paid/webhook) și gate-ul de
    // confirmare email de pe link-ul de completare pică mai târziu, silențios.
    const contact = {
      firstName: customer.contact.firstName || '',
      lastName: customer.contact.lastName || '',
      email: String(customer.contact.email).trim().toLowerCase(),
      phone: customer.contact.phone,
    };

    const billing = customer.billing || {};
    const missingBilling = getMissingInvoiceClientFields({ billing, contact, personal: customer.personal || {} } as never);
    if (missingBilling.length > 0) {
      return NextResponse.json(
        { success: false, error: `Date de facturare incomplete: ${missingBilling.join(', ')}` },
        { status: 400 }
      );
    }

    try {
      const mxOk = await emailDomainAcceptsMail(contact.email);
      // null = necunoscut (eroare DNS tranzitorie) → fail-open; doar false blochează.
      if (mxOk === false) {
        return NextResponse.json(
          { success: false, error: `Domeniul emailului „${contact.email}” nu acceptă mesaje — verifică adresa cu clientul.` },
          { status: 400 }
        );
      }
    } catch {
      /* MX check fail-open (rețea) — nu blocăm crearea */
    }

    const friendlyOrderId = generateOrderId();
    const customerData: Record<string, unknown> = {
      contact,
      personal: customer.personal || {},
      billing,
      ...(customer.extra || {}),
      manual_order: { createdBy: user.id, createdAt: new Date().toISOString(), note: note || null },
    };

    const { data: order, error: insertError } = await adminClient
      .from('orders')
      .insert({
        friendly_order_id: friendlyOrderId,
        order_number: friendlyOrderId,
        service_id: serviceId,
        user_id: null,
        status: 'pending',
        payment_status: 'unpaid',
        customer_data: customerData,
        selected_options: selectedOptions,
        delivery_method: deliveryMethod,
        base_price: basePrice,
        options_price: optionsPrice,
        delivery_price: deliveryPrice,
        total_price: totalPrice,
        channel: 'phone',
        created_by_admin: user.id,
        submitted_at: new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select('id, friendly_order_id, total_price')
      .single();

    if (insertError || !order) {
      console.error('[admin create order] insert failed:', insertError);
      return NextResponse.json({ success: false, error: 'Eroare la crearea comenzii.' }, { status: 500 });
    }

    await adminClient.from('order_history').insert({
      order_id: order.id,
      event_type: 'admin_action',
      notes: `Comandă telefonică creată de admin · ${service.name} · total ${totalPrice} RON${note ? ` · ${note}` : ''}`,
      changed_by: user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    return NextResponse.json({
      success: true,
      data: { id: order.id, friendlyOrderId: order.friendly_order_id, totalPrice },
    });
  } catch (err) {
    console.error('[admin create order] failed:', err);
    return NextResponse.json({ success: false, error: 'Eroare internă.' }, { status: 500 });
  }
}
