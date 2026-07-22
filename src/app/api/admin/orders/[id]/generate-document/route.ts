import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { generateDocument, type DocumentContext, type ClientData, type CompanyData, type LawyerData } from '@/lib/documents/generator';
import { uploadFile, generateDocumentKey, downloadFile, deleteFile, getClientSignatureBase64 } from '@/lib/aws/s3';
import { allocateNumber, findExistingNumber, getRegistryClient } from '@/lib/registry/client';
import { isPJForDocumentGeneration } from '@/lib/documents/delegation-items';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: orderError } = await (adminClient as any)
      .from('orders')
      .select('*, services(id, name, slug, base_price, estimated_days, urgent_days, urgent_available)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Fetch company and lawyer data from admin_settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (adminClient as any)
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
    // Civil-status step (naștere/căsătorie/celibat) collects parent full names
    // and birth name; personalKyc no longer duplicates them for these services.
    const civil = cd.civil_status || {};

    // "PJ" = SERVICIUL e pentru o firmă (există company KYC / clientType pj),
    // NU "factura e pe firmă". O comandă PF cu factura pe angajator rămâne PF
    // pe documente (aceeași regulă ca auto-generate.ts / delegation-items).
    // Excepție: servicii fără date personale/firmă (extras CF, constatator) —
    // partea contractantă e entitatea de FACTURARE.
    const usesBillingAsParty = !personal.firstName && !personal.lastName && !company.companyName;
    const isPJ = usesBillingAsParty
      ? (billing?.type === 'persoana_juridica' || billing?.source === 'company')
      : isPJForDocumentGeneration(cd);

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
      document_issued_by: personal.documentIssuedBy || personal.issuedBy || '',
      document_issue_date: personal.documentIssueDate || personal.issueDate || '',
      company_name: company.companyName || billing.companyName || '',
      company_reg: company.registrationNumber || '',
      company_address: formatAddress(company.address) || billing.companyAddress || '',
      is_pj: isPJ,
      // Step 2 (cazier judiciar PF) no longer asks for parent names since
      // 2026-05-27 — the official cerere template still has those fields
      // though. Fill with "-" so the printed form shows a clean dash instead
      // of an empty line that an inspector might mistake for missing data.
      father_name: personal.fatherName || civil.fatherName || '-',
      mother_name: personal.motherName || civil.motherName || '-',
      // Marital status from the civil-status wizard step — feeds the
      // stare-civilă împuternicire (UNBR Anexa II) template.
      civil_status: civil.maritalStatus || personal.maritalStatus || '',
      previous_name: personal.previousName || civil.birthName || '',
      birth_date: personal.birthDate || '',
      birth_county: personal.birthPlace || personal.birthCounty || '',
      birth_country: personal.birthCountry || 'ROMANIA',
      // Extras multilingv (ANEXA 4): localitatea + județul nașterii, separate.
      // Localitatea = pasul civil-status (celibat) sau OCR-ul CI (birthPlace,
      // curățat de prefixe în generator); județul = civil-status sau CNP.
      birth_locality: civil.birthLocality || personal.birthPlace || '',
      birth_judet: civil.birthCounty || '',
      // Extras multilingv căsătorie (ANEXA 4): soțul/soția + data + locul
      // căsătoriei (registrationPlace = județul care a înregistrat actul).
      spouse_name: civil.spouseNameBeforeMarriage || '',
      marriage_date: civil.marriageDate || '',
      marriage_place: civil.registrationPlace || '',
      // Certificat de celibat (ANEXA 9): scopul alege varianta de cerere
      // (căsătorie în străinătate vs. „alte situații" — vezi
      // resolveTemplateName în generator.ts) + datele viitorului soț.
      marriage_abroad_intent: civil.marriageAbroadIntent === true,
      future_spouse_name: civil.futureSpouseName || '',
      future_spouse_citizenship: civil.nationality || '',
      marriage_country: civil.countryOfUse || '',
      celibacy_purpose: civil.purpose || '',
      address_parts: personalAddress ? {
        county: personalAddress.county, city: personalAddress.city,
        sector: personalAddress.sector,
        street: personalAddress.street, number: personalAddress.number,
        building: personalAddress.building, staircase: personalAddress.staircase,
        floor: personalAddress.floor, apartment: personalAddress.apartment,
        postalCode: personalAddress.postalCode,
      } : undefined,
      company_address_parts: companyAddress ? {
        county: companyAddress.county, city: companyAddress.city,
        street: companyAddress.street, number: companyAddress.number,
        building: companyAddress.building, apartment: companyAddress.apartment,
      } : undefined,
    };

    // Extract selected options from order
    const selectedOptions = (order.selected_options as Array<{ option_id?: string; option_name?: string; optionName?: string; code?: string; quantity?: number; price_modifier?: number; priceModifier?: number; bundledFor?: { parentOptionId?: string } | null; bundled_for?: { parent_option_id?: string } | null }>) || [];

    // Per-step delivery breakdown for the contract — same helper used at
    // submission time so admin-triggered regeneration produces identical
    // wording. Hidden behind a try/catch because the calculator is optional;
    // legacy services without a baseDays still get the fallback term text.
    const deliveryEstimate = (() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { estimateFromSelectedOptions } = require('@/lib/delivery-calculator') as typeof import('@/lib/delivery-calculator');
        return estimateFromSelectedOptions({
          selectedOptions: selectedOptions.map((o) => ({
            code: o.code ?? null,
            optionName: o.option_name || o.optionName,
            bundledFor: o.bundledFor ?? (o.bundled_for ? { parentOptionId: o.bundled_for.parent_option_id } : null),
          })),
          baseDays: order.services?.estimated_days ?? undefined,
          courier: (cd.delivery as { method?: string } | undefined)?.method ?? null,
          orderDate: order.created_at ? new Date(order.created_at) : undefined,
        });
      } catch {
        return null;
      }
    })();

    // Allocate document numbers via the CENTRAL registry (dedicated Supabase
    // project). Barou numbers are finite — they may be consumed ONLY by PAID
    // orders (post-payment allocation policy, 2026-07).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentNumbers: any = {};
    const registryOrderRef: string = order.friendly_order_id || orderId;
    const needsBarouNumber = ['contract-asistenta', 'contract-complet', 'imputernicire'].includes(template);

    if (needsBarouNumber && order.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Numerele Barou se alocă doar după plată. Comanda nu este plătită.' },
        { status: 400 }
      );
    }

    if (template === 'contract-prestari') {
      // Contract prestari does NOT consume a Barou number
      // It uses friendly_order_id as its identifier
      // No allocation needed
    }

    if (['contract-asistenta', 'contract-complet'].includes(template)) {
      try {
        // Idempotent: reuses the existing allocation on regeneration.
        const allocated = await allocateNumber({
          type: 'contract',
          platform: 'eghiseul',
          orderRef: registryOrderRef,
          clientName: clientData.name,
          clientEmail: clientData.email || undefined,
          clientCnp: clientData.cnp || undefined,
          clientCui: clientData.cui || undefined,
          serviceType: order.services?.name || '',
          amount: lawyerData?.fee || undefined,
          createdBy: user.email ?? user.id,
        });

        documentNumbers.contract_number = allocated.number;
        documentNumbers.contract_series = allocated.series;
        documentNumbers.registry_ids = {
          ...documentNumbers.registry_ids,
          contract: allocated.registryId,
        };
      } catch (allocError) {
        console.error('Failed to allocate contract number:', allocError);
        return NextResponse.json(
          { success: false, error: 'Nu s-a putut aloca numar de contract. Verificati intervalele disponibile in /admin/registru.' },
          { status: 400 }
        );
      }
    }

    if (template === 'imputernicire') {
      try {
        // Idempotent per (order, service_type) — regeneration reuses.
        const allocated = await allocateNumber({
          type: 'delegation',
          platform: 'eghiseul',
          orderRef: registryOrderRef,
          clientName: clientData.name,
          clientEmail: clientData.email || undefined,
          clientCnp: clientData.cnp || undefined,
          clientCui: clientData.cui || undefined,
          serviceType: body.service_type || order.services?.name || '',
          amount: lawyerData?.fee || undefined,
          createdBy: user.email ?? user.id,
        });

        documentNumbers.imputernicire_number = allocated.number;
        documentNumbers.imputernicire_series = allocated.series || 'SM';
        documentNumbers.registry_ids = {
          ...documentNumbers.registry_ids,
          delegation: allocated.registryId,
        };
      } catch (allocError) {
        console.error('Failed to allocate delegation number:', allocError);
        return NextResponse.json(
          { success: false, error: 'Nu s-a putut aloca numar de imputernicire. Verificati intervalele disponibile in /admin/registru.' },
          { status: 400 }
        );
      }

      // Contract number cross-reference for the împuternicire template.
      try {
        const contractEntry = await findExistingNumber('eghiseul', registryOrderRef, 'contract');
        if (contractEntry) {
          documentNumbers.contract_number = contractEntry.number;
        }
      } catch (crossRefErr) {
        console.warn('Contract cross-reference lookup failed (non-fatal):', crossRefErr);
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
        estimated_completion_date: order.estimated_completion_date ?? null,
      },
      selected_options: selectedOptions,
      delivery_estimate: deliveryEstimate
        ? {
            minDays: deliveryEstimate.minDays,
            maxDays: deliveryEstimate.maxDays,
            breakdown: deliveryEstimate.breakdown,
          }
        : null,
      document_numbers: documentNumbers,
      // Fall back to the purpose the customer picked in the wizard (e.g.
      // cazier-fiscal "Informare") before the generic default.
      motiv_solicitare: body.motiv_solicitare || contact.purpose || 'Interes personal',
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

    // Store document reference in order_documents.
    // Împuternicirile sunt PER SERVICIU (cazier, apostilă, integritate...) —
    // fiecare are numărul ei de delegație și fișierul ei; sufixul de serviciu
    // în nume separă documentele și scopează cleanup-ul (fără el, generarea
    // împuternicirii #2 o ștergea pe #1).
    const docType = template.replace(/-/g, '_');
    const friendlyId = order.friendly_order_id || orderId;
    const serviceSuffix =
      template === 'imputernicire' && body.service_type
        ? '-' + String(body.service_type).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
        : '';
    const fileName = `${template}${serviceSuffix}-${friendlyId}.docx`;

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

    // The document key is deterministic, so regeneration overwrites the same
    // DOCX — invalidate the cached PDF render (preview route recreates it).
    await deleteFile(`${s3Key}.preview.pdf`).catch(() => {});

    // ANAF cazier fiscal cerere: fill the native PDF form (pdf-lib, no
    // external converter needed) and upload it as the preview render so the
    // admin preview/print is pixel-faithful immediately.
    if (serviceSlug === 'cazier-fiscal' && template === 'cerere-eliberare-pf') {
      try {
        const { generateFiscalCererePdf } = await import('@/lib/documents/cazier-fiscal-cerere-pdf');
        const addr = clientData.address_parts;
        const pdfBuf = await generateFiscalCererePdf({
          cnp: clientData.cnp || '',
          lastName: clientData.lastName || '',
          firstName: clientData.firstName || '',
          county: addr?.county || '',
          city: addr?.city || '',
          street: addr?.street || '',
          number: addr?.number || '',
          building: addr?.building || '',
          staircase: addr?.staircase || '',
          apartment: addr?.apartment || '',
          motiv: context.motiv_solicitare || 'Informare',
          date: new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        });
        await uploadFile(`${s3Key}.preview.pdf`, pdfBuf, 'application/pdf', {
          'source-key': s3Key,
          'renderer': 'pdf-lib-native',
        });
      } catch (e) {
        // Preview render is best-effort — the DOCX is the document of record.
        console.error('Native fiscal cerere PDF render failed:', e);
      }
    }

    // Insert new DB row FIRST (before deleting old ones, to prevent data loss on failure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // Only the service contract is client-visible. Contract de asistență,
        // împuternicirea și cererile de eliberare sunt acte interne / cu date
        // personale și NU se publică pe pagina de status a clientului.
        visible_to_client: docType === 'contract_prestari',
        generated_by: user.id,
        metadata: {
          template,
          service_type: template === 'imputernicire' ? (body.service_type || order.services?.name || null) : null,
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

    // Link document back to the CENTRAL registry entry (non-fatal).
    try {
      const registry = getRegistryClient();
      const registryId = documentNumbers.registry_ids?.contract || documentNumbers.registry_ids?.delegation;
      if (registryId && insertedDoc?.id) {
        await registry
          .from('number_registry')
          .update({ order_document_ref: insertedDoc.id })
          .eq('id', registryId);
      } else if (insertedDoc?.id) {
        // Catch-all for reused numbers without a stored registry id.
        const docType2 = template === 'imputernicire' ? 'delegation' :
                         ['contract-asistenta', 'contract-complet'].includes(template) ? 'contract' : null;
        if (docType2) {
          let linkQuery = registry
            .from('number_registry')
            .update({ order_document_ref: insertedDoc.id })
            .eq('platform', 'eghiseul')
            .eq('order_ref', registryOrderRef)
            .eq('type', docType2)
            .is('order_document_ref', null);
          // Multi-delegation orders: link ONLY the delegation of this service.
          if (docType2 === 'delegation' && body.service_type) {
            linkQuery = linkQuery.eq('service_type', body.service_type);
          }
          await linkQuery;
        }
      }
    } catch (linkErr) {
      console.warn('Registry back-link failed (non-fatal):', linkErr);
    }

    // Now clean up previous versions of THIS document (safe — new row already
    // exists). Scoped pe file_name ca împuternicirile altor servicii de pe
    // aceeași comandă (alt sufix → alt fișier) să NU fie șterse.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingDocs } = await (adminClient as any)
      .from('order_documents')
      .select('id, s3_key')
      .eq('order_id', orderId)
      .eq('type', docType)
      .eq('file_name', fileName)
      .neq('s3_key', s3Key);

    if (existingDocs && existingDocs.length > 0) {
      // Delete old S3 objects (+ their cached PDF renders)
      await Promise.all(
        existingDocs.flatMap((doc: { id: string; s3_key: string }) => [
          deleteFile(doc.s3_key).catch((e: unknown) =>
            console.error(`Failed to delete old S3 object ${doc.s3_key}:`, e)
          ),
          deleteFile(`${doc.s3_key}.preview.pdf`).catch(() => {}),
        ])
      );
      // Delete old DB rows
      const oldIds = existingDocs.map((doc: { id: string }) => doc.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('order_documents')
        .delete()
        .in('id', oldIds);
    }

    // Log to order_history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any)
      .from('order_history')
      .insert({
        order_id: orderId,
        changed_by: user.id,
        event_type: 'document_generated',
        new_value: { template, document_type: docType, file_name: fileName },
        notes: `Document generat: ${fileName}`,
      });

    // Generating the cerere/împuternicirea IS the start of manual processing
    // (cazier judiciar/fiscal etc. — the automated services never pass through
    // here), so move a still-'paid' order to 'processing' automatically
    // instead of asking the operator for a second click. Contract re-generation
    // is excluded — that's a correction, not a work signal.
    const startsProcessing = template.startsWith('cerere') || template === 'imputernicire';
    if (startsProcessing && order.status === 'paid') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any)
        .from('orders')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('status', 'paid');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient as any).from('order_history').insert({
        order_id: orderId,
        changed_by: user.id,
        event_type: 'status_changed',
        old_value: { status: 'paid' },
        new_value: { status: 'processing' },
        notes: 'Trecut automat în procesare la generarea cererii',
      });
    }

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
