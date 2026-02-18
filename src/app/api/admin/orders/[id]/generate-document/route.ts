import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { generateDocument, type DocumentContext, type ClientData, type CompanyData, type LawyerData } from '@/lib/documents/generator';
import { uploadFile, generateDocumentKey, downloadFile, deleteFile, getClientSignatureBase64 } from '@/lib/aws/s3';

/**
 * Format an AddressState object (or string) into a human-readable Romanian address.
 */
function formatAddress(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address !== 'object') return '';

  const a = address as Record<string, string>;
  const parts: string[] = [];
  if (a.street) parts.push(`Str. ${a.street}`);
  if (a.number) parts.push(`Nr. ${a.number}`);
  if (a.building) parts.push(`Bl. ${a.building}`);
  if (a.staircase) parts.push(`Sc. ${a.staircase}`);
  if (a.floor) parts.push(`Et. ${a.floor}`);
  if (a.apartment) parts.push(`Ap. ${a.apartment}`);
  if (a.city) parts.push(a.city);
  if (a.county) parts.push(`Jud. ${a.county}`);
  if (a.postalCode) parts.push(a.postalCode);
  return parts.join(', ');
}

/**
 * POST /api/admin/orders/[id]/generate-document
 * Body: { template: string } - e.g., "contract-prestari", "cerere-eliberare-pf"
 * Returns the generated DOCX file as download
 */
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

    const body = await request.json();
    const { template } = body;

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template name required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch order with service
    const { data: order, error: orderError } = await (adminClient as any)
      .from('orders')
      .select('*, services(id, name, slug, base_price, estimated_days, urgent_days, urgent_available)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Fetch company and lawyer data from admin_settings
    const { data: settings } = await (adminClient as any)
      .from('admin_settings')
      .select('key, value')
      .in('key', ['company_data', 'lawyer_data']);

    const settingsMap: Record<string, any> = {};
    for (const s of settings || []) {
      settingsMap[s.key] = s.value;
    }

    const companyData: CompanyData = settingsMap.company_data || {};
    const lawyerData: LawyerData = settingsMap.lawyer_data || {};

    // Extract client data from order
    const cd = order.customer_data || {};
    const contact = cd.contact || {};
    const personal = cd.personalData || cd.personal || {};
    const company = cd.companyData || cd.company || {};
    const billing = cd.billing || {};

    const isPJ = billing?.type === 'persoana_juridica' || !!company?.companyName;

    const personalAddress = typeof personal.address === 'object' ? personal.address : undefined;
    const companyAddress = typeof company.address === 'object' ? company.address : undefined;

    const clientData: ClientData = {
      name: isPJ
        ? (company.companyName || billing.companyName || 'N/A')
        : (`${personal.firstName || ''} ${personal.lastName || ''}`.trim() || 'N/A'),
      firstName: personal.firstName || '',
      lastName: personal.lastName || '',
      cnp: personal.cnp || '',
      cui: company.cui || billing.cui || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: formatAddress(personal.address),
      ci_series: personal.documentSeries || personal.ci_series || '',
      ci_number: personal.documentNumber || personal.ci_number || '',
      company_name: company.companyName || billing.companyName || '',
      company_reg: company.registrationNumber || '',
      company_address: formatAddress(company.address) || billing.companyAddress || '',
      is_pj: isPJ,
      father_name: personal.fatherName || '',
      mother_name: personal.motherName || '',
      previous_name: personal.previousName || '',
      birth_date: personal.birthDate || '',
      birth_county: personal.birthPlace || personal.birthCounty || '',
      address_parts: personalAddress ? {
        county: personalAddress.county, city: personalAddress.city,
        street: personalAddress.street, number: personalAddress.number,
        building: personalAddress.building, apartment: personalAddress.apartment,
      } : undefined,
      company_address_parts: companyAddress ? {
        county: companyAddress.county, city: companyAddress.city,
        street: companyAddress.street, number: companyAddress.number,
        building: companyAddress.building, apartment: companyAddress.apartment,
      } : undefined,
    };

    // Allocate document numbers via number_registry system
    let documentNumbers: any = {};

    if (template === 'contract-prestari') {
      // Contract prestari does NOT consume a Barou number
      // It uses friendly_order_id as its identifier
      // No allocation needed
    }

    if (['contract-asistenta', 'contract-complet'].includes(template)) {
      // Check for existing number (regeneration reuse)
      const { data: existing } = await (adminClient as any).rpc('find_existing_number', {
        p_order_id: orderId,
        p_type: 'contract',
      });

      if (existing && existing.length > 0) {
        documentNumbers.contract_number = existing[0].existing_number;
        documentNumbers.contract_series = existing[0].existing_series;
      } else {
        const { data: allocated, error: allocError } = await (adminClient as any).rpc('allocate_number', {
          p_type: 'contract',
          p_order_id: orderId,
          p_client_name: clientData.name,
          p_client_email: clientData.email || null,
          p_client_cnp: clientData.cnp || null,
          p_client_cui: clientData.cui || null,
          p_service_type: order.services?.name || '',
          p_amount: lawyerData?.fee || null,
          p_created_by: user.id,
        });

        if (allocError) {
          console.error('Failed to allocate contract number:', allocError);
          return NextResponse.json(
            { success: false, error: 'Nu s-a putut aloca numar de contract. Verificati intervalele disponibile.' },
            { status: 400 }
          );
        }

        documentNumbers.contract_number = allocated[0].allocated_number;
        documentNumbers.contract_series = allocated[0].allocated_series;
        documentNumbers.registry_ids = {
          ...documentNumbers.registry_ids,
          contract: allocated[0].registry_id,
        };
      }
    }

    if (template === 'imputernicire') {
      // Check for existing delegation number (regeneration reuse)
      const { data: existing } = await (adminClient as any).rpc('find_existing_number', {
        p_order_id: orderId,
        p_type: 'delegation',
        p_service_type: body.service_type || order.services?.name || null,
      });

      if (existing && existing.length > 0) {
        documentNumbers.imputernicire_number = existing[0].existing_number;
        documentNumbers.imputernicire_series = existing[0].existing_series || 'SM';
      } else {
        const { data: allocated, error: allocError } = await (adminClient as any).rpc('allocate_number', {
          p_type: 'delegation',
          p_order_id: orderId,
          p_client_name: clientData.name,
          p_client_email: clientData.email || null,
          p_client_cnp: clientData.cnp || null,
          p_client_cui: clientData.cui || null,
          p_service_type: body.service_type || order.services?.name || '',
          p_amount: lawyerData?.fee || null,
          p_created_by: user.id,
        });

        if (allocError) {
          console.error('Failed to allocate delegation number:', allocError);
          return NextResponse.json(
            { success: false, error: 'Nu s-a putut aloca numar de imputernicire. Verificati intervalele disponibile.' },
            { status: 400 }
          );
        }

        documentNumbers.imputernicire_number = allocated[0].allocated_number;
        documentNumbers.imputernicire_series = allocated[0].allocated_series || 'SM';
        documentNumbers.registry_ids = {
          ...documentNumbers.registry_ids,
          delegation: allocated[0].registry_id,
        };
      }

      // Also fetch the contract number from this order for cross-reference in template
      const { data: contractEntry } = await (adminClient as any).rpc('find_existing_number', {
        p_order_id: orderId,
        p_type: 'contract',
      });

      if (contractEntry && contractEntry.length > 0) {
        documentNumbers.contract_number = contractEntry[0].existing_number;
      }
    }

    const context: DocumentContext = {
      client: clientData,
      company: companyData,
      lawyer: lawyerData,
      order: {
        order_number: order.order_number || '',
        friendly_order_id: order.friendly_order_id || '',
        total_price: order.total_price || 0,
        service_name: order.services?.name || '',
        service_slug: order.services?.slug || 'cazier-judiciar',
        service_price: order.services?.base_price || order.base_price || 0,
        created_at: order.created_at,
        estimated_days: order.services?.estimated_days,
        urgent_days: order.services?.urgent_days,
        urgent_available: order.services?.urgent_available,
      },
      document_numbers: documentNumbers,
      motiv_solicitare: body.motiv_solicitare || 'Interes personal',
      client_ip: cd.signature_metadata?.ip_address || 'N/A',
    };

    const serviceSlug = order.services?.slug || 'cazier-judiciar';

    // Get client signature from S3 (new) or inline base64 (legacy)
    const clientSignatureBase64 = await getClientSignatureBase64(cd);

    // Get company and lawyer signatures from S3 (keys stored in company_data/lawyer_data)
    let companySignatureBase64: string | undefined;
    let lawyerSignatureBase64: string | undefined;

    if (companyData.signature_s3_key) {
      try {
        const buf = await downloadFile(companyData.signature_s3_key);
        companySignatureBase64 = buf.toString('base64');
      } catch (e) {
        console.error('Failed to download company signature:', e);
      }
    }
    if (lawyerData.signature_s3_key) {
      try {
        const buf = await downloadFile(lawyerData.signature_s3_key);
        lawyerSignatureBase64 = buf.toString('base64');
      } catch (e) {
        console.error('Failed to download lawyer signature:', e);
      }
    }

    const buffer = generateDocument(serviceSlug, template, context, {
      clientSignatureBase64,
      companySignatureBase64,
      lawyerSignatureBase64,
    });

    // Store document reference in order_documents
    const docType = template.replace(/-/g, '_');
    const friendlyId = order.friendly_order_id || orderId;
    const fileName = `${template}-${friendlyId}.docx`;

    // Upload generated document to S3
    const s3Key = generateDocumentKey(friendlyId, docType, fileName);

    try {
      await uploadFile(
        s3Key,
        buffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        {
          'order-id': orderId,
          'template': template,
          'generated-by': user.id,
          'generated-at': new Date().toISOString(),
        }
      );
    } catch (s3Error) {
      console.error('S3 upload failed for generated document:', s3Error);
      return NextResponse.json({ success: false, error: 'Nu s-a putut încărca documentul în storage' }, { status: 500 });
    }

    // Insert new DB row FIRST (before deleting old ones, to prevent data loss on failure)
    const { data: insertedDoc, error: insertError } = await (adminClient as any)
      .from('order_documents')
      .insert({
        order_id: orderId,
        type: docType,
        s3_key: s3Key,
        file_name: fileName,
        file_size: buffer.length,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        document_number: (() => {
          if (template === 'contract-prestari') {
            return order.friendly_order_id;
          } else if (['contract-asistenta', 'contract-complet'].includes(template)) {
            return documentNumbers.contract_number
              ? String(documentNumbers.contract_number).padStart(6, '0')
              : null;
          } else if (template === 'imputernicire') {
            return documentNumbers.imputernicire_number
              ? `${documentNumbers.imputernicire_series || 'SM'}${String(documentNumbers.imputernicire_number).padStart(6, '0')}`
              : null;
          }
          return null;
        })(),
        visible_to_client: ['contract_complet', 'contract_prestari', 'contract_asistenta', 'imputernicire', 'cerere_eliberare_pf', 'cerere_eliberare_pj'].includes(docType),
        generated_by: user.id,
        metadata: {
          template,
          document_numbers: documentNumbers,
          registry_id: documentNumbers.registry_ids?.contract || documentNumbers.registry_ids?.delegation || null,
        },
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('DB insert failed for generated document:', insertError);
      // Clean up orphan S3 object
      await deleteFile(s3Key).catch(() => {});
      return NextResponse.json({ success: false, error: 'Nu s-a putut salva documentul' }, { status: 500 });
    }

    // Link document back to registry entry
    const registryId = documentNumbers.registry_ids?.contract || documentNumbers.registry_ids?.delegation;
    if (registryId && insertedDoc?.id) {
      await (adminClient as any)
        .from('number_registry')
        .update({ order_document_id: insertedDoc.id })
        .eq('id', registryId);
    }

    // Now clean up previous versions of this document type (safe — new row already exists)
    const { data: existingDocs } = await (adminClient as any)
      .from('order_documents')
      .select('id, s3_key')
      .eq('order_id', orderId)
      .eq('type', docType)
      .neq('s3_key', s3Key);

    if (existingDocs && existingDocs.length > 0) {
      // Delete old S3 objects
      await Promise.all(
        existingDocs.map((doc: { id: string; s3_key: string }) =>
          deleteFile(doc.s3_key).catch((e: unknown) =>
            console.error(`Failed to delete old S3 object ${doc.s3_key}:`, e)
          )
        )
      );
      // Delete old DB rows
      const oldIds = existingDocs.map((doc: { id: string }) => doc.id);
      await (adminClient as any)
        .from('order_documents')
        .delete()
        .in('id', oldIds);
    }

    // Log to order_history
    await (adminClient as any)
      .from('order_history')
      .insert({
        order_id: orderId,
        changed_by: user.id,
        event_type: 'document_generated',
        new_value: { template, document_type: docType, file_name: fileName },
        notes: `Document generat: ${fileName}`,
      });

    // Return the DOCX file as download
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('Generate document error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
