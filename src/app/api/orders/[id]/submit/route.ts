import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit, getAuditContext } from '@/lib/security/audit-logger';
import { createHash } from 'crypto';
import { autoGenerateOrderDocuments } from '@/lib/documents/auto-generate';
import { uploadOrderSignature, uploadBase64 } from '@/lib/aws/s3';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/submit
 *
 * Submits a draft order, changing its status to 'pending'.
 * Links the order to the authenticated user if not already linked.
 * Uses admin client to bypass RLS for reliable database operations.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get user if authenticated (use regular client for auth)
    const { data: { user } } = await supabase.auth.getUser();

    // Parse request body
    const body = await request.json().catch(() => ({}));

    // Fetch the order (use admin client to bypass RLS)
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found',
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership or allow guest orders
    if (order.user_id && user && order.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to submit this order',
          },
        },
        { status: 403 }
      );
    }

    // Only allow submitting draft orders
    if (order.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Order has already been submitted',
          },
        },
        { status: 400 }
      );
    }

    // Capture audit context (IP, user agent) from request
    const auditCtx = getAuditContext(request);
    const now = new Date().toISOString();

    // Build update object
    // Use 'pending' status (valid in database constraint)
    const updateData: Record<string, unknown> = {
      status: 'pending',
      updated_at: now,
      submitted_at: now,
      contract_signed_at: now,
    };

    // Update user profile with order data (phone, personal info)
    if (user) {
      // Check if profile exists first (use admin client)
      // Cast to any for columns not in generated types (birth_date, birth_place from migration 015)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (adminClient as any)
        .from('profiles')
        .select('id, phone, first_name, last_name, cnp, birth_date, birth_place')
        .eq('id', user.id)
        .single();

      // Extract customer data from order
      const customerData = order.customer_data as {
        contact?: { email?: string; phone?: string };
        personal?: { firstName?: string; lastName?: string; cnp?: string; birthDate?: string; birthPlace?: string };
      } | null;
      const contactData = customerData?.contact || {};
      const personalData = customerData?.personal || {};

      if (!profile) {
        // Create profile from order contact data
        await adminClient.from('profiles').insert({
          id: user.id,
          email: contactData.email || user.email,
          phone: contactData.phone || null,
          first_name: personalData.firstName || null,
          last_name: personalData.lastName || null,
          cnp: personalData.cnp || null,
          birth_date: personalData.birthDate || null,
          birth_place: personalData.birthPlace || null,
        });
      } else {
        // Update profile with any missing data from order
        const profileUpdates: Record<string, unknown> = {};

        // Update phone if missing or empty in profile but present in order
        if ((!profile.phone || profile.phone === '') && contactData.phone) {
          profileUpdates.phone = contactData.phone;
        }
        // Update other fields if missing
        if (!profile.first_name && personalData.firstName) {
          profileUpdates.first_name = personalData.firstName;
        }
        if (!profile.last_name && personalData.lastName) {
          profileUpdates.last_name = personalData.lastName;
        }
        if (!profile.cnp && personalData.cnp) {
          profileUpdates.cnp = personalData.cnp;
        }
        if (!profile.birth_date && personalData.birthDate) {
          profileUpdates.birth_date = personalData.birthDate;
        }
        if (!profile.birth_place && personalData.birthPlace) {
          profileUpdates.birth_place = personalData.birthPlace;
        }

        // Update profile if there are changes
        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updated_at = new Date().toISOString();
          await adminClient
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id);
        }
      }

      // Link order to user if not already linked
      if (!order.user_id) {
        updateData.user_id = user.id;
      }
    }

    // Update total price if provided
    if (body.total_price !== undefined) {
      updateData.total_price = body.total_price;
    }

    // Save signature, consent data, and audit metadata into customer_data
    const existingCustomerData = (order.customer_data as Record<string, unknown>) || {};

    // Compute document hash from the contract content the client signed
    // This proves which contract version was agreed to
    const contractContentForHash = JSON.stringify({
      customer_data: existingCustomerData,
      total_price: body.total_price || order.total_price,
      service_id: order.service_id,
    });
    const documentHash = createHash('sha256').update(contractContentForHash).digest('hex');

    // Build signature metadata for legal validity (Law 214/2024, eIDAS Art. 25)
    const signatureMetadata = {
      ip_address: auditCtx.ipAddress,
      user_agent: auditCtx.userAgent,
      signed_at: now,
      document_hash: documentHash,
      consent: {
        terms_accepted: body.consent?.termsAccepted === true,
        privacy_accepted: body.consent?.privacyAccepted === true,
        signature_consent: body.consent?.signatureConsent === true,
        withdrawal_waiver: body.consent?.withdrawalWaiver === true,
        consent_timestamp: now,
      },
    };

    // Upload signature to S3 (removes large base64 from JSONB)
    let signatureS3Key: string | undefined;
    if (body.signature_base64) {
      try {
        const result = await uploadOrderSignature(id, body.signature_base64);
        signatureS3Key = result.key;
      } catch (e) {
        console.error('Failed to upload signature to S3, falling back to JSONB:', e);
      }
    }

    // Upload KYC documents (CI front, CI back, selfie) to S3
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const personalData = (existingCustomerData.personal || existingCustomerData.personalData) as any;
    if (personalData?.uploadedDocuments?.length > 0) {
      for (const doc of personalData.uploadedDocuments) {
        if (doc.base64 && !doc.s3Key) {
          try {
            const ext = doc.mimeType?.includes('png') ? 'png' : 'jpg';
            const contentType = doc.mimeType || 'image/jpeg';
            const s3Key = `kyc/${id}/${doc.type || doc.id || 'document'}.${ext}`;

            await uploadBase64(s3Key, doc.base64, contentType, {
              'order-id': id,
              'document-type': doc.type || 'unknown',
              'uploaded-at': new Date().toISOString(),
            });
            doc.s3Key = s3Key;
            // Remove base64 to keep DB lean
            delete doc.base64;
          } catch (err) {
            console.error(`Failed to upload KYC doc ${doc.type} to S3:`, err);
            // Keep base64 as fallback if S3 upload fails
          }
        }
      }
    }

    // Upload company KYC documents to S3 (if PJ)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const companyData = (existingCustomerData.company || existingCustomerData.companyData) as any;
    if (companyData?.uploadedDocuments?.length > 0) {
      for (const doc of companyData.uploadedDocuments) {
        if (doc.base64 && !doc.s3Key) {
          try {
            const ext = doc.mimeType?.includes('png') ? 'png' : doc.mimeType?.includes('pdf') ? 'pdf' : 'jpg';
            const contentType = doc.mimeType || 'image/jpeg';
            const s3Key = `kyc/${id}/company_${doc.type || doc.id || 'document'}.${ext}`;

            await uploadBase64(s3Key, doc.base64, contentType, {
              'order-id': id,
              'document-type': doc.type || 'unknown',
              'uploaded-at': new Date().toISOString(),
            });
            doc.s3Key = s3Key;
            delete doc.base64;
          } catch (err) {
            console.error(`Failed to upload company KYC doc ${doc.type} to S3:`, err);
          }
        }
      }
    }

    updateData.customer_data = {
      ...existingCustomerData,
      // Store S3 key if upload succeeded, otherwise fall back to inline base64
      ...(signatureS3Key
        ? { signature_s3_key: signatureS3Key }
        : body.signature_base64
          ? { signature_base64: body.signature_base64 }
          : {}),
      signature_metadata: signatureMetadata,
    };

    // Update the order (use admin client to bypass RLS)
    const { data: updatedOrder, error: updateError } = await adminClient
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Order submit error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to submit order',
          },
        },
        { status: 500 }
      );
    }

    // Auto-generate documents (contract-complet, imputernicire, cerere)
    try {
      const docResults = await autoGenerateOrderDocuments(id, user?.id || null);
      if (docResults.length > 0) {
        console.log(`Auto-generated ${docResults.length} documents for order ${id}`);
      }
    } catch (docError) {
      // Don't fail the submission if document generation fails
      console.error('Auto-document generation failed (order still submitted):', docError);
    }

    // Create order_history entry for submission (audit trail)
    await adminClient.from('order_history').insert({
      order_id: id,
      changed_by: user?.id || null,
      event_type: 'order_submitted',
      new_value: {
        status: 'pending',
        document_hash: documentHash,
        consent: signatureMetadata.consent,
      },
      ip_address: auditCtx.ipAddress,
      user_agent: auditCtx.userAgent,
      notes: 'Comanda trimisă cu semnătură electronică',
    });

    // Audit log for compliance
    logAudit({
      action: 'order_update',
      status: 'success',
      userId: user?.id || null,
      ipAddress: auditCtx.ipAddress,
      userAgent: auditCtx.userAgent,
      resourceType: 'order',
      resourceId: id,
      metadata: {
        event: 'order_submitted',
        document_hash: documentHash,
        has_signature: !!body.signature_base64,
        consent_given: signatureMetadata.consent,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: updatedOrder.id,
          friendly_order_id: updatedOrder.friendly_order_id,
          status: updatedOrder.status,
          user_id: updatedOrder.user_id,
          total_price: updatedOrder.total_price,
          updated_at: updatedOrder.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/orders/[id]/submit:', error);
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
