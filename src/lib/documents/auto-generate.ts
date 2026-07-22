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
import {
  computeDelegationItems,
  isPJForDocumentGeneration,
} from '@/lib/documents/delegation-items';
import { isNoLawyerService } from '@/lib/documents/no-lawyer-services';
import { isForeignBillingCountry } from '@/lib/orders/billing-validation';
import { allocateNumber, getRegistryClient, formatRegistryNumber } from '@/lib/registry/client';

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
 * Auto-generate the standard documents for an order.
 *
 * Two-phase flow (Barou numbers are allocated ONLY after payment):
 *  - mode 'submit' (order submission, BEFORE payment): generates ONLY
 *    contract-prestari (client-visible, numbered by friendly_order_id — no
 *    Barou number). No registry allocation happens here.
 *  - mode 'post-payment' (Stripe webhook / confirm-payment / cron): allocates
 *    the Barou contract number from the CENTRAL registry, generates
 *    contract-asistenta, and allocates all delegation numbers.
 */
export async function autoGenerateOrderDocuments(
  orderId: string,
  generatedBy: string | null,
  mode: 'submit' | 'post-payment' = 'submit',
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
  // Civil-status step (naștere/căsătorie/celibat) collects parent full names
  // and birth name; personalKyc no longer duplicates them for these services.
  const civil = cd.civil_status || {};

  // `isPJ` here means "the SERVICE is for a legal entity" — drives
  // contract template choice (contract-prestari PF vs PJ), cerere
  // eliberare PF/PJ, împuternicire format, etc. Logic extracted to
  // `delegation-items.isPJForDocumentGeneration` so it can be unit-tested
  // — see that file for the full rationale + the E-260528-DZ8MS regression
  // it prevents.
  // Services with no ID scan / no company KYC (extras CF, constatator) have no
  // `personal`/`company` data — the contracting party is the BILLING party the
  // client filled in (persoană fizică sau juridică). Fall back to billing then.
  const usesBillingAsParty = !personal.firstName && !personal.lastName && !company.companyName;
  const billingIsPJ = billing.type === 'persoana_juridica' || billing.source === 'company';
  const isPJ = usesBillingAsParty ? billingIsPJ : isPJForDocumentGeneration(cd);

  const personalAddress = typeof personal.address === 'object' ? personal.address : undefined;
  const companyAddress = typeof company.address === 'object' ? company.address : undefined;
  // Flat billing address (street line + city + county + postal) → one string.
  // Foreign billing: append the country so contracts carry the full address.
  const billingAddressStr = [
    billing.address,
    billing.city,
    billing.county,
    billing.postalCode,
    isForeignBillingCountry(billing.country) ? billing.country : null,
  ]
    .filter(Boolean)
    .join(', ');

  const clientData: ClientData = {
    name: isPJ
      ? (company.companyName || billing.companyName || 'N/A')
      : (`${personal.firstName || billing.firstName || ''} ${personal.lastName || billing.lastName || ''}`.trim() || 'N/A'),
    firstName: personal.firstName || billing.firstName || '',
    lastName: personal.lastName || billing.lastName || '',
    cnp: personal.cnp || billing.cnp || '',
    cui: company.cui || billing.cui || '',
    email: contact.email || '',
    phone: contact.phone || '',
    address: formatAddress(personal.address) || billingAddressStr,
    ci_series: personal.documentSeries || personal.ci_series || '',
    ci_number: personal.documentNumber || personal.ci_number || '',
    document_issued_by: personal.documentIssuedBy || personal.issuedBy || '',
    document_issue_date: personal.documentIssueDate || personal.issueDate || '',
    company_name: company.companyName || billing.companyName || '',
    company_reg: company.registrationNumber || '',
    company_address: formatAddress(company.address) || billing.companyAddress || '',
    is_pj: isPJ,
    // Step 2 (cazier judiciar PF) no longer collects parent names since
    // 2026-05-27. The DOCX template still references them, so fall back to
    // "-" to print a clean dash on the cerere instead of an empty line.
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
    address_parts: personalAddress ? {
      county: personalAddress.county, city: personalAddress.city,
      sector: personalAddress.sector,
      street: personalAddress.street, number: personalAddress.number,
      building: personalAddress.building, staircase: personalAddress.staircase,
      floor: personalAddress.floor, apartment: personalAddress.apartment,
      postalCode: personalAddress.postalCode,
    } : (usesBillingAsParty && billing.address ? {
      county: billing.county, city: billing.city,
      street: billing.address, postalCode: billing.postalCode,
    } : undefined),
    company_address_parts: companyAddress ? {
      county: companyAddress.county, city: companyAddress.city,
      street: companyAddress.street, number: companyAddress.number,
      building: companyAddress.building, apartment: companyAddress.apartment,
    } : undefined,
  };

  // Extract selected options from order
  const selectedOptions = (order.selected_options as Array<{ option_id?: string; option_name?: string; optionName?: string; code?: string; quantity?: number; price_modifier?: number; priceModifier?: number; bundledFor?: { parentOptionId?: string } | null; bundled_for?: { parent_option_id?: string } | null }>) || [];

  const serviceSlug = order.services?.slug || 'cazier-judiciar';

  // Compute the per-step delivery breakdown so the contract template can show
  // a real timeline (e.g. "5-7 zile lucrătoare" instead of just "2-4"). The
  // helper dedupes bundled add-ons that share the parent's processing slot.
  const deliveryEstimate = (() => {
    try {
      const baseDays = order.services?.estimated_days ?? undefined;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { estimateFromSelectedOptions } = require('@/lib/delivery-calculator') as typeof import('@/lib/delivery-calculator');
      return estimateFromSelectedOptions({
        selectedOptions: selectedOptions.map((o) => ({
          code: o.code ?? null,
          optionName: o.option_name || o.optionName,
          bundledFor: o.bundledFor ?? (o.bundled_for ? { parentOptionId: o.bundled_for.parent_option_id } : null),
        })),
        baseDays,
        // The contract is generated at submission time, BEFORE the order
        // ships, so we include the courier leg when known.
        courier: (cd.delivery as { method?: string } | undefined)?.method ?? null,
        orderDate: order.created_at ? new Date(order.created_at) : undefined,
      });
    } catch (err) {
      console.warn('[auto-generate] delivery estimate failed:', err);
      return null;
    }
  })();

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

  // Determine which templates to generate for this phase.
  // Fully-automated services with no lawyer involvement (ONRC constatator,
  // ANCPI carte funciară / plan cadastral / identificare imobil) must NOT get a
  // legal-assistance contract or a Barou number — see NO_LAWYER_SERVICE_SLUGS.
  //
  // 'submit' = pre-payment → only contract-prestari (no Barou numbers burned
  // on orders that never pay). 'post-payment' → contract-asistenta with a
  // real Barou number from the central registry.
  const noLawyer = isNoLawyerService(serviceSlug);
  const templates =
    mode === 'submit'
      ? ['contract-prestari']
      : noLawyer
        ? []
        : ['contract-asistenta'];
  const friendlyOrderRef: string = order.friendly_order_id || orderId;

  for (const template of templates) {
    try {
      // Document numbering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const documentNumbers: any = {};

      if (template === 'contract-prestari') {
        // contract-prestari uses friendly_order_id, no Barou number needed
      }

      if (template === 'contract-asistenta') {
        // Allocate (or idempotently reuse) the Barou contract number from the
        // CENTRAL registry. The RPC is idempotent per (platform, order_ref,
        // type) — regeneration never wastes a number.
        const allocated = await allocateNumber({
          type: 'contract',
          platform: 'eghiseul',
          orderRef: friendlyOrderRef,
          clientName: clientData.name,
          clientEmail: clientData.email || undefined,
          clientCnp: clientData.cnp || undefined,
          clientCui: clientData.cui || undefined,
          serviceType: order.services?.name || '',
          amount: lawyerData.fee || undefined,
          createdBy: generatedBy ?? 'eghiseul-post-payment',
        });

        documentNumbers.contract_number = allocated.number;
        documentNumbers.contract_series = allocated.series;
        documentNumbers.registry_ids = { contract: allocated.registryId };
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
        motiv_solicitare: contact.purpose || 'Interes personal',
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
        // Only the service contract is exposed to the customer on the status
        // page. Contract de asistență juridică, împuternicirea și cererile
        // conțin date cu caracter personal / acte interne — NU se publică.
        visible_to_client: docType === 'contract_prestari',
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

      // Back-link the generated document to the CENTRAL registry entry.
      if (insertedDoc?.id && template === 'contract-asistenta') {
        try {
          const registry = getRegistryClient();
          if (documentNumbers.registry_ids?.contract) {
            await registry
              .from('number_registry')
              .update({ order_document_ref: insertedDoc.id })
              .eq('id', documentNumbers.registry_ids.contract);
          } else {
            // Catch-all for entries allocated without a stored registry id.
            await registry
              .from('number_registry')
              .update({ order_document_ref: insertedDoc.id })
              .eq('platform', 'eghiseul')
              .eq('order_ref', friendlyOrderRef)
              .eq('type', 'contract')
              .is('order_document_ref', null);
          }
        } catch (linkErr) {
          // Non-fatal: the allocation row exists; only the doc pointer is missing.
          console.warn('[auto-generate] registry back-link failed:', linkErr);
        }
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

  // Auto-allocate ALL needed delegation numbers for the order.
  //
  // Per lawyer reg-bar policy, every official document we obtain on behalf
  // of the client requires its own împuternicire avocațială (= its own
  // delegation number). For multi-service orders this means N delegations:
  //
  //   Example: Cazier Judiciar + Apostila Haga + Certificat Integritate
  //            + Apostila Haga (pe integritate)
  //          → 4 delegations (one per row above)
  //
  // The main service ALWAYS gets a delegation. Options that produce a
  // separate official document also get one. Translation, legalization,
  // urgent processing do NOT (they're modifiers on existing docs, not
  // separate documents we represent the client to obtain).
  //
  // Each delegation is keyed by `service_type` in number_registry, so
  // find_existing_number(orderId, 'delegation', service_type) dedupes
  // per-service on regeneration — without re-using numbers across
  // services within the same order.
  //
  // Compute the list via the pure helper. See delegation-items.ts for the
  // policy + decision logic and tests/unit/lib/documents/delegation-items.test.ts
  // for coverage of the dedup/bundled cases.
  // No-lawyer services (constatator, carte funciară / cadastral / identificare)
  // need NO împuternicire avocațială → no Barou delegation numbers at all.
  // Delegations are allocated ONLY post-payment (Barou numbers are finite).
  const delegationItems =
    mode !== 'post-payment' || noLawyer
      ? []
      : computeDelegationItems({
          services: order.services,
          selected_options: selectedOptions,
        });

  // Allocate one delegation per item — the central RPC is idempotent per
  // (platform, order_ref, 'delegation', service_type), so re-runs reuse.
  let delegationFailures = 0;
  for (const item of delegationItems) {
    try {
      const allocated = await allocateNumber({
        type: 'delegation',
        platform: 'eghiseul',
        orderRef: friendlyOrderRef,
        clientName: clientData.name,
        clientEmail: clientData.email || undefined,
        clientCnp: clientData.cnp || undefined,
        clientCui: clientData.cui || undefined,
        serviceType: item.serviceType,
        description: `Împuternicire pentru ${item.label}`,
        amount: lawyerData.fee || undefined,
        createdBy: generatedBy ?? 'eghiseul-post-payment',
      });

      console.log(
        `${allocated.reused ? 'Reused' : 'Allocated'} delegation ` +
        `${formatRegistryNumber('delegation', allocated.number, allocated.series)} ` +
        `for [${item.label}] on order ${orderId}`
      );
    } catch (err) {
      delegationFailures++;
      console.error(`Error allocating delegation for ${item.serviceType}:`, err);
      // Non-fatal — try the next one; the post-payment cron sweep retries.
    }
  }
  if (delegationFailures > 0) {
    throw new Error(
      `${delegationFailures}/${delegationItems.length} delegation allocations failed — will retry via cron`
    );
  }

  // Log to order_history
  if (results.length > 0) {
    await adminClient.from('order_history').insert({
      order_id: orderId,
      changed_by: generatedBy,
      event_type: 'document_generated',
      new_value: {
        auto_generated: true,
        mode,
        documents: results.map(r => ({ template: r.template, file_name: r.fileName })),
      },
      notes:
        mode === 'post-payment'
          ? 'Contract asistență + numere Barou alocate automat după plată'
          : 'Contractul de prestări servicii a fost generat automat la plasarea comenzii',
    });
  }

  return results;
}
