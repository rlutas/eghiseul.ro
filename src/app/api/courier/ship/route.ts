/**
 * Courier Ship API
 *
 * POST /api/courier/ship - Create a shipment (generate AWB)
 *
 * Body:
 * - provider: Courier provider code (required)
 * - orderId: Order ID for reference (optional)
 * - sender: Sender address (required)
 * - recipient: Recipient address (required)
 * - packages: Package details (required)
 * - content: Shipment content description (required)
 * - service: Service code (optional, defaults to standard)
 * - cod: Cash on delivery amount (optional)
 * - notes: Delivery notes (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCourierProvider,
  getTrackingUrl,
  CourierCode,
  ShipmentRequest,
  Address,
  SenderAddress,
  Package,
} from '@/lib/services/courier';

interface ShipRequestBody {
  provider: CourierCode;
  orderId?: string;
  sender: SenderAddress;
  recipient: Address;
  packages: Package[];
  content: {
    description: string;
    declaredValue?: number;
    isDocument?: boolean;
  };
  service?: string;
  paymentBy?: 'sender' | 'recipient';
  cod?: number;
  lockerId?: string;
  notes?: string;
  openAtDelivery?: boolean;
  returnOnFail?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for creating shipments
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const body: ShipRequestBody = await request.json();

    // Validate required fields
    if (!body.provider || !body.sender || !body.recipient || !body.packages || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Missing required fields: provider, sender, recipient, packages, content',
          },
        },
        { status: 400 }
      );
    }

    // Get the courier provider
    let courierProvider;
    try {
      courierProvider = getCourierProvider(body.provider);
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

    // Build shipment request
    const shipmentRequest: ShipmentRequest = {
      sender: body.sender,
      recipient: body.recipient,
      packages: body.packages,
      content: body.content,
      service: body.service,
      paymentBy: body.paymentBy || 'sender',
      cod: body.cod,
      lockerId: body.lockerId,
      notes: body.notes,
      openAtDelivery: body.openAtDelivery,
      returnOnFail: body.returnOnFail,
      orderReference: body.orderId,
    };

    // Create the shipment
    const result = await courierProvider.createShipment(shipmentRequest);

    // If orderId provided, update the order with AWB info
    if (body.orderId && result.success) {
      // Use existing columns for tracking
      // Note: courier_provider, courier_service, courier_quote columns need migration 020
      await supabase
        .from('orders')
        .update({
          delivery_tracking_number: result.awb,
          delivery_tracking_url: getTrackingUrl(body.provider, result.awb) || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.orderId);

      // Add to order history
      await supabase
        .from('order_history')
        .insert({
          order_id: body.orderId,
          event_type: 'awb_created',
          notes: `AWB created: ${result.awb} via ${body.provider}`,
          new_value: JSON.stringify({
            awb: result.awb,
            provider: body.provider,
            service: body.service || 'STANDARD',
          }),
          changed_by: user.id,
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        awb: result.awb,
        provider: result.provider,
        trackingUrl: getTrackingUrl(body.provider, result.awb) || '',
        estimatedDays: result.estimatedDays,
        price: result.price,
        priceWithVAT: result.priceWithVAT,
        currency: result.currency,
      },
    });
  } catch (error) {
    console.error('[Courier Ship API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SHIPMENT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create shipment',
        },
      },
      { status: 500 }
    );
  }
}
