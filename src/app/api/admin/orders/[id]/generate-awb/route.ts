/**
 * POST /api/admin/orders/[id]/generate-awb
 *
 * Admin endpoint to generate an AWB (shipping label) for an order.
 * Creates a shipment with the courier provider and updates the order
 * with tracking information.
 *
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import {
  getCourierProvider,
  getTrackingUrl,
  CourierCode,
  ShipmentRequest,
  SenderAddress,
  Address,
} from '@/lib/services/courier';
import { DEFAULT_DOCUMENT_PACKAGE, extractCourierProviderFromDeliveryMethod } from '@/lib/services/courier/utils';

// eGhiseul.ro company address (sender)
const EGHISEUL_SENDER: SenderAddress = {
  name: 'eGhiseul.ro',
  phone: '0740000000', // Company phone
  email: 'comenzi@eghiseul.ro',
  company: 'eGhiseul.ro SRL',
  street: 'Strada Mihai Eminescu',
  streetNo: '1',
  city: 'Satu Mare',
  county: 'Satu Mare',
  postalCode: '440014',
  country: 'RO',
  contactPerson: 'eGhiseul.ro',
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // 1. Verify admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check permission
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    // 2. Fetch order with all delivery fields
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*, services(name, slug)')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    // 3. Validate: no existing AWB
    if (order.delivery_tracking_number) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AWB_EXISTS',
            message: `AWB already generated: ${order.delivery_tracking_number}`,
          },
        },
        { status: 400 }
      );
    }

    // Parse delivery method to get courier provider info
    const deliveryMethod = order.delivery_method as {
      type?: string;
      name?: string;
      price?: number;
      estimated_days?: number;
    } | null;

    // Get courier provider from delivery_method or courier_provider column
    const courierProviderCode = (order.courier_provider ||
      extractCourierProviderFromDeliveryMethod(deliveryMethod)) as CourierCode | null;

    if (!courierProviderCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_COURIER',
            message: 'Order has no courier provider configured. Delivery method may be email or not set.',
          },
        },
        { status: 400 }
      );
    }

    // Parse delivery address
    const deliveryAddress = order.delivery_address as {
      county?: string;
      city?: string;
      street?: string;
      number?: string;
      building?: string;
      staircase?: string;
      floor?: string;
      apartment?: string;
      postalCode?: string;
      sector?: string;
    } | null;

    // For locker deliveries, address may not be required
    const courierQuote = (order.courier_quote || extractCourierQuote(deliveryMethod)) as {
      lockerId?: string;
      lockerName?: string;
      service?: string;
      serviceName?: string;
    } | null;

    const isLockerDelivery = !!courierQuote?.lockerId;

    if (!isLockerDelivery && (!deliveryAddress || !deliveryAddress.county || !deliveryAddress.city)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_ADDRESS',
            message: 'Order has no delivery address configured',
          },
        },
        { status: 400 }
      );
    }

    // 4. Get courier provider instance
    let courierProvider;
    try {
      courierProvider = getCourierProvider(courierProviderCode);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PROVIDER',
            message: error instanceof Error ? error.message : 'Invalid courier provider',
          },
        },
        { status: 400 }
      );
    }

    // 5. Extract customer contact info
    const customerData = order.customer_data as {
      contact?: {
        firstName?: string;
        lastName?: string;
        name?: string;
        phone?: string;
        email?: string;
      };
      personalData?: {
        firstName?: string;
        lastName?: string;
      };
    } | null;

    const contact = customerData?.contact;
    const personalData = customerData?.personalData;
    const recipientName = contact?.name ||
      [contact?.firstName || personalData?.firstName, contact?.lastName || personalData?.lastName]
        .filter(Boolean)
        .join(' ') ||
      'Destinatar';
    const recipientPhone = contact?.phone || '';
    const recipientEmail = contact?.email || '';

    // 6. Build recipient address
    // Map wizard address fields to courier Address fields
    const recipient: Address = {
      name: recipientName,
      phone: recipientPhone,
      email: recipientEmail,
      street: deliveryAddress?.street || '',
      streetNo: deliveryAddress?.number || '',
      building: deliveryAddress?.building || '',
      entrance: deliveryAddress?.staircase || '', // wizard: staircase -> courier: entrance
      floor: deliveryAddress?.floor || '',
      apartment: deliveryAddress?.apartment || '',
      city: deliveryAddress?.city || '',
      county: deliveryAddress?.county || '',
      postalCode: deliveryAddress?.postalCode || '',
      country: 'RO',
    };

    // Determine service code
    const courierService = order.courier_service || courierQuote?.service || undefined;

    // Order reference
    const orderReference = (order.friendly_order_id || order.order_number || order.id) as string;
    const serviceName = (order.services as { name?: string } | null)?.name || '';

    // 7. Build shipment request
    const shipmentRequest: ShipmentRequest = {
      sender: EGHISEUL_SENDER,
      recipient,
      packages: [{ ...DEFAULT_DOCUMENT_PACKAGE }],
      content: {
        description: `Documente eGhiseul.ro - ${orderReference}${serviceName ? ` (${serviceName})` : ''}`,
        isDocument: true,
      },
      service: courierService,
      paymentBy: 'sender',
      lockerId: courierQuote?.lockerId,
      orderReference,
      notes: isLockerDelivery && courierQuote?.lockerName
        ? `Locker: ${courierQuote.lockerName}`
        : undefined,
    };

    // 8. Create shipment
    const result = await courierProvider.createShipment(shipmentRequest);

    if (!result.success || !result.awb) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SHIPMENT_FAILED',
            message: typeof result.error === 'string'
              ? result.error
              : (typeof result.error === 'object' && result.error !== null && 'message' in result.error
                  ? String((result.error as { message: string }).message)
                  : (result.error ? JSON.stringify(result.error) : 'Eroare la crearea expeditiei')),
            details: result.errors,
          },
        },
        { status: 500 }
      );
    }

    // 9. Update order with AWB data
    const trackingUrl = getTrackingUrl(courierProviderCode, result.awb) || '';

    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        delivery_tracking_number: result.awb,
        delivery_tracking_url: trackingUrl,
        delivery_tracking_status: 'pending',
        courier_provider: courierProviderCode,
        courier_service: courierService || null,
        status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      // AWB was generated but DB update failed - log this critical error
      console.error('[Generate AWB] DB update failed after AWB creation:', updateError);
      console.error('[Generate AWB] AWB was created:', result.awb, 'for order:', id);
    }

    // 10. Add order history event
    await adminClient.from('order_history').insert({
      order_id: id,
      event_type: 'awb_created',
      notes: `AWB generat: ${result.awb} via ${courierProviderCode}${courierService ? ` (${courierService})` : ''}`,
      changed_by: user.id,
      new_value: JSON.stringify({
        awb: result.awb,
        provider: courierProviderCode,
        service: courierService,
        trackingUrl,
        price: result.price,
        priceWithVAT: result.priceWithVAT,
        status: 'shipped',
      }),
    });

    // Also log status change
    await adminClient.from('order_history').insert({
      order_id: id,
      event_type: 'status_change',
      notes: 'Comanda a fost expediata',
      changed_by: user.id,
      new_value: JSON.stringify({
        status: 'shipped',
        previous_status: order.status,
      }),
    });

    return NextResponse.json({
      success: true,
      data: {
        awb: result.awb,
        provider: courierProviderCode,
        service: courierService,
        trackingUrl,
        price: result.price,
        priceWithVAT: result.priceWithVAT,
        currency: result.currency,
        estimatedDays: result.estimatedDays,
      },
    });
  } catch (error) {
    console.error('[Generate AWB] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Extract courier quote from delivery_method JSON.
 * When courier_quote column is not set, try to reconstruct from delivery_method.
 */
function extractCourierQuote(
  deliveryMethod: { type?: string; name?: string } | null
): { service?: string; lockerId?: string } | null {
  if (!deliveryMethod) return null;

  const name = (deliveryMethod.name || '').toLowerCase();

  // Try to determine service from name
  if (name.includes('fanbox')) return { service: 'FANbox' };
  if (name.includes('easybox')) return { service: 'LOCKER_NEXTDAY' };
  if (name.includes('standard 24h')) return { service: 'STANDARD_24H' };
  if (name.includes('standard')) return { service: 'Standard' };

  return null;
}
