/**
 * Auto-generate documents for an order.
 *
 * Generates the standard set of documents (contract-complet, imputernicire, cerere)
 * and stores them in S3 + order_documents table.
 *
 * Called automatically at order submission time.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateDocument,
  type DocumentContext,
  type ClientData,
  type CompanyData,
  type LawyerData,
} from '@/lib/documents/generator';
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

interface GenerateResult {
  template: string;
  docType: string;
  fileName: string;
  s3Key: string;
  documentNumber: string | null;
}

/**
 * Auto-generate all standard documents for an order.
 *
 * Generates: contract-complet, imputernicire, and cerere-eliberare-pf/pj.
 * Returns array of generated document metadata.
 */
export async function autoGenerateOrderDocuments(
  orderId: string,
  generatedBy: string | null,
): Promise<GenerateResult[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;
  const results: GenerateResult[] = [];

  // Fetch order with service
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('*, services(id, name, slug, base_price, estimated_days, urgent_days, urgent_available)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Auto-generate: Order not found', orderId);
    return results;
  }

  // Fetch company and lawyer data from admin_settings
  const { data: settings } = await adminClient
    .from('admin_settings')
    .select('key, value')
    .in('key', ['company_data', 'lawyer_data']);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const serviceSlug = order.services?.slug || 'cazier-judiciar';

  // Get client signature from S3 (new) or inline base64 (legacy)
  const clientSignatureBase64 = await getClientSignatureBase64(cd);
  const clientIp = cd.signature_metadata?.ip_address || 'N/A';

  // Download company and lawyer signatures from S3
  let companySignatureBase64: string | undefined;
  let lawyerSignatureBase64: string | undefined;

  if (companyData.signature_s3_key) {
    try {
      const buf = await downloadFile(companyData.signature_s3_key);
      companySignatureBase64 = buf.toString('base64');
    } catch { /* signature not available */ }
  }
  if (lawyerData.signature_s3_key) {
    try {
      const buf = await downloadFile(lawyerData.signature_s3_key);
      lawyerSignatureBase64 = buf.toString('base64');
    } catch { /* signature not available */ }
  }

  // Determine which templates to auto-generate at submission time
  // Only contracts are auto-generated; imputernicire and cerere use custom templates uploaded by admin
  const templates = [
    'contract-prestari',
    'contract-asistenta',
  ];

  for (const template of templates) {
    try {
      // Document numbering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const documentNumbers: any = {};

      if (template === 'contract-prestari') {
        // contract-prestari uses friendly_order_id, no Barou number needed
      }

      if (template === 'contract-asistenta') {
        // Check if a number already exists (regeneration reuse)
        const { data: existing } = await adminClient.rpc('find_existing_number', {
          p_order_id: orderId,
          p_type: 'contract',
        });

        if (existing && existing.length > 0) {
          // Reuse existing number (regeneration case)
          documentNumbers.contract_number = existing[0].existing_number;
          documentNumbers.contract_series = existing[0].existing_series;
        } else {
          // Allocate a new Barou number
          const { data: allocated, error: allocError } = await adminClient.rpc('allocate_number', {
            p_type: 'contract',
            p_order_id: orderId,
            p_client_name: clientData.name,
            p_client_email: clientData.email || null,
            p_client_cnp: clientData.cnp || null,
            p_client_cui: clientData.cui || null,
            p_service_type: order.services?.name || '',
            p_amount: lawyerData.fee || null,
            p_created_by: generatedBy,
          });

          if (allocError) {
            throw new Error(`Nu s-a putut aloca numar de contract: ${allocError.message}`);
          }

          documentNumbers.contract_number = allocated[0].allocated_number;
          documentNumbers.registry_ids = { contract: allocated[0].registry_id };
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
          service_slug: serviceSlug,
          service_price: order.services?.base_price || order.base_price || 0,
          created_at: order.created_at,
          estimated_days: order.services?.estimated_days,
          urgent_days: order.services?.urgent_days,
          urgent_available: order.services?.urgent_available,
        },
        document_numbers: documentNumbers,
        motiv_solicitare: 'Interes personal',
        client_ip: clientIp,
      };

      // Generate DOCX
      const buffer = generateDocument(serviceSlug, template, context, {
        clientSignatureBase64,
        companySignatureBase64,
        lawyerSignatureBase64,
      });

      // Upload to S3
      const docType = template.replace(/-/g, '_');
      const friendlyId = order.friendly_order_id || orderId;
      const fileName = `${template}-${friendlyId}.docx`;
      const s3Key = generateDocumentKey(friendlyId, docType, fileName);

      await uploadFile(
        s3Key,
        buffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        {
          'order-id': orderId,
          'template': template,
          'generated-by': generatedBy || 'system',
          'generated-at': new Date().toISOString(),
        }
      );

      // Insert into order_documents
      let docNumber: string | null = null;
      if (template === 'contract-prestari') {
        docNumber = order.friendly_order_id;
      } else if (template === 'contract-asistenta') {
        docNumber = documentNumbers.contract_number
          ? String(documentNumbers.contract_number).padStart(6, '0')
          : null;
      }

      const { data: insertedDoc, error: insertError } = await adminClient.from('order_documents').insert({
        order_id: orderId,
        type: docType,
        s3_key: s3Key,
        file_name: fileName,
        file_size: buffer.length,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        document_number: docNumber,
        visible_to_client: ['contract_prestari', 'contract_asistenta'].includes(docType),
        generated_by: generatedBy,
        metadata: {
          template,
          document_numbers: documentNumbers,
          auto_generated: true,
          registry_id: documentNumbers.registry_ids?.contract || null,
        },
      }).select('id').single();

      if (insertError) {
        console.error(`DB insert failed for ${template}:`, insertError);
        // Clean up orphan S3 object
        await deleteFile(s3Key).catch(() => {});
        throw new Error(`DB insert failed: ${insertError.message}`);
      }

      // Link order_document_id back to number_registry
      if (documentNumbers.registry_ids?.contract && insertedDoc?.id) {
        await adminClient
          .from('number_registry')
          .update({ order_document_id: insertedDoc.id })
          .eq('id', documentNumbers.registry_ids.contract);
      }

      results.push({
        template,
        docType,
        fileName,
        s3Key,
        documentNumber: docNumber,
      });

      console.log(`Auto-generated document: ${fileName} for order ${orderId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Auto-generate failed for template ${template}:`, errorMessage, err);

      // Record failure in order_history so admin can see it
      await adminClient.from('order_history').insert({
        order_id: orderId,
        changed_by: generatedBy,
        event_type: 'document_generation_failed',
        new_value: { template, error: errorMessage },
        notes: `Generarea documentului ${template} a eșuat: ${errorMessage}`,
      }).then(() => {}, () => {}); // swallow insert errors

      // Continue with other templates
    }
  }

  // Log to order_history
  if (results.length > 0) {
    await adminClient.from('order_history').insert({
      order_id: orderId,
      changed_by: generatedBy,
      event_type: 'document_generated',
      new_value: {
        auto_generated: true,
        documents: results.map(r => ({ template: r.template, file_name: r.fileName })),
      },
      notes: `Contractele au fost generate automat la plasarea comenzii`,
    });
  }

  return results;
}
