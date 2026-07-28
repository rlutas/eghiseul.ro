/**
 * Regenerează ÎMPUTERNICIRILE și CERERILE comenzilor la care numele de familie
 * a plecat contaminat cu prefixul MRZ („PEROUPOPA" în loc de „POPA") — vezi
 * docs/changelog/2026-07-28-imputernicire-apostila-si-nume.md.
 *
 * De ce un script separat: `autoGenerateOrderDocuments` face doar contractele;
 * împuternicirile/cererile se generează prin ruta de admin, care cere sesiune
 * de operator. Scriptul reface aceleași documente pe același drum de cod
 * (`generateDocument`) și cu aceleași numere — alocarea din registrul central
 * e idempotentă per (comandă, tip, serviciu), deci seria/numărul rămân.
 *
 * ⚠️ Poartă de siguranță: documentul nou e comparat cu cel vechi ÎNAINTE de
 * upload. Dacă apar diferențe în afara numelui clientului și a frazei de
 * apostilă, fișierul NU se urcă și cazul se raportează.
 *
 *   npx tsx --env-file=.env.local scripts/regenerate-imputerniciri-name-fix.ts [--apply]
 */
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateDocument,
  type DocumentContext,
  type ClientData,
  type CompanyData,
  type LawyerData,
} from '@/lib/documents/generator';
import { uploadFile, downloadFile, deleteFile, getClientSignatureBase64 } from '@/lib/aws/s3';
import { allocateNumber, findExistingNumber } from '@/lib/registry/client';
import { isPJForDocumentGeneration } from '@/lib/documents/delegation-items';
import { formatPersonName } from '@/lib/format/person-name';
import { estimateFromSelectedOptions } from '@/lib/delivery-calculator';

const APPLY = process.argv.includes('--apply');
const ORDERS = ['E-260713-NYT6R', 'E-260718-ZZ4C5', 'E-260728-YFHH2'];

/** Textul vizibil dintr-un DOCX, pentru comparație. */
function docxText(buf: Buffer): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const PizZip = require('pizzip');
  const zip = new PizZip(buf);
  const xml: string = zip.file('word/document.xml')?.asText() ?? '';
  return xml
    .replace(/<w:p[ >]/g, '\n<w:p ')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

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

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const { data: settings } = await db
    .from('admin_settings')
    .select('key, value')
    .in('key', ['company_data', 'lawyer_data']);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settingsMap: Record<string, any> = {};
  for (const s of settings || []) settingsMap[s.key] = s.value;
  const companyData: CompanyData = settingsMap.company_data || {};
  const lawyerData: LawyerData = settingsMap.lawyer_data || {};

  for (const orderNumber of ORDERS) {
    const { data: order } = await db
      .from('orders')
      .select('*, services(id, name, slug, base_price, estimated_days, urgent_days, urgent_available)')
      .eq('order_number', orderNumber)
      .maybeSingle();
    if (!order) {
      console.log(`⚠️  ${orderNumber}: negăsită`);
      continue;
    }

    const cd = order.customer_data || {};
    const contact = cd.contact || {};
    const personal = cd.personalData || cd.personal || {};
    const company = cd.companyData || cd.company || {};
    const billing = cd.billing || {};
    const civil = cd.civil_status || {};
    const usesBillingAsParty = !personal.firstName && !personal.lastName && !company.companyName;
    const isPJ = usesBillingAsParty
      ? billing?.type === 'persoana_juridica' || billing?.source === 'company'
      : isPJForDocumentGeneration(cd);
    const personalAddress = typeof personal.address === 'object' ? personal.address : undefined;
    const companyAddress = typeof company.address === 'object' ? company.address : undefined;

    const clientData: ClientData = {
      name: isPJ
        ? company.companyName || billing.companyName || 'N/A'
        : formatPersonName(personal.lastName, personal.firstName) || 'N/A',
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
      father_name: personal.fatherName || civil.fatherName || '-',
      mother_name: personal.motherName || civil.motherName || '-',
      civil_status: civil.maritalStatus || personal.maritalStatus || '',
      previous_name: personal.previousName || civil.birthName || '',
      birth_date: personal.birthDate || '',
      birth_county: personal.birthPlace || personal.birthCounty || '',
      birth_country: personal.birthCountry || 'ROMANIA',
      birth_locality: civil.birthLocality || personal.birthPlace || '',
      birth_judet: civil.birthCounty || '',
      spouse_name: civil.spouseNameBeforeMarriage || '',
      marriage_date: civil.marriageDate || '',
      marriage_place: civil.registrationPlace || '',
      marriage_abroad_intent: civil.marriageAbroadIntent === true,
      future_spouse_name: civil.futureSpouseName || '',
      future_spouse_citizenship: civil.nationality || '',
      marriage_country: civil.countryOfUse || '',
      celibacy_purpose: civil.purpose || '',
      address_parts: personalAddress
        ? {
            county: personalAddress.county,
            city: personalAddress.city,
            sector: personalAddress.sector,
            street: personalAddress.street,
            number: personalAddress.number,
            building: personalAddress.building,
            staircase: personalAddress.staircase,
            floor: personalAddress.floor,
            apartment: personalAddress.apartment,
            postalCode: personalAddress.postalCode,
          }
        : undefined,
      company_address_parts: companyAddress
        ? {
            county: companyAddress.county,
            city: companyAddress.city,
            street: companyAddress.street,
            number: companyAddress.number,
            building: companyAddress.building,
            apartment: companyAddress.apartment,
          }
        : undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedOptions = (order.selected_options as any[]) || [];
    const deliveryEstimate = (() => {
      try {
        return estimateFromSelectedOptions({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selectedOptions: selectedOptions.map((o: any) => ({
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

    const clientSignatureBase64 = await getClientSignatureBase64(cd);
    let companySignatureBase64: string | undefined;
    let lawyerSignatureBase64: string | undefined;
    if (companyData.signature_s3_key) {
      companySignatureBase64 = (await downloadFile(companyData.signature_s3_key)).toString('base64');
    }
    if (lawyerData.signature_s3_key) {
      lawyerSignatureBase64 = (await downloadFile(lawyerData.signature_s3_key)).toString('base64');
    }

    // Documentele de refăcut: împuternicirile + cererile deja existente.
    const { data: docs } = await db
      .from('order_documents')
      .select('id, type, file_name, s3_key, metadata')
      .eq('order_id', order.id)
      .in('type', ['imputernicire', 'cerere_eliberare_pf', 'cerere_eliberare_pj'])
      .order('created_at');

    console.log(`\n=== ${orderNumber} — client: ${clientData.name}`);

    for (const doc of docs ?? []) {
      const template = doc.type === 'imputernicire' ? 'imputernicire' : doc.type.replace(/_/g, '-');
      const delegationServiceType: string | null = doc.metadata?.service_type ?? null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const documentNumbers: any = {};
      if (template === 'imputernicire') {
        const allocated = await allocateNumber({
          type: 'delegation',
          platform: 'eghiseul',
          orderRef: order.friendly_order_id || order.id,
          clientName: clientData.name,
          clientEmail: clientData.email || undefined,
          clientCnp: clientData.cnp || undefined,
          clientCui: clientData.cui || undefined,
          serviceType: delegationServiceType || order.services?.name || '',
          amount: lawyerData?.fee || undefined,
          createdBy: 'script-name-fix-2026-07-28',
        });
        documentNumbers.imputernicire_number = allocated.number;
        documentNumbers.imputernicire_series = allocated.series || 'SM';
        documentNumbers.registry_ids = { delegation: allocated.registryId };
        const contractEntry = await findExistingNumber(
          'eghiseul',
          order.friendly_order_id || order.id,
          'contract'
        );
        if (contractEntry) documentNumbers.contract_number = contractEntry.number;
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
          service_slug: order.services?.slug || '',
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
        delegation_service_type: template === 'imputernicire' ? delegationServiceType : null,
        client_ip: cd.signature_metadata?.ip_address || 'N/A',
      };

      const buffer = generateDocument(order.services?.slug || '', template, context, {
        clientSignatureBase64,
        companySignatureBase64,
        lawyerSignatureBase64,
      });

      // Poartă de siguranță: ce s-a schimbat față de fișierul de pe S3?
      const oldBuf = await downloadFile(doc.s3_key);
      const oldLines = docxText(oldBuf).split('\n');
      const newLines = docxText(buffer).split('\n');
      const changed: Array<[string, string]> = [];
      const max = Math.max(oldLines.length, newLines.length);
      for (let i = 0; i < max; i++) {
        if ((oldLines[i] ?? '') !== (newLines[i] ?? '')) changed.push([oldLines[i] ?? '', newLines[i] ?? '']);
      }

      console.log(`\n  ▸ ${doc.file_name} — ${changed.length} linie/linii diferite`);
      for (const [o, n] of changed.slice(0, 6)) {
        console.log(`      - ${o.slice(0, 150)}`);
        console.log(`      + ${n.slice(0, 150)}`);
      }

      // Se urcă DOAR dacă singura schimbare e numele clientului. Două capcane
      // reale prinse la rulare:
      //  - E-260713-NYT6R: între timp s-a schimbat TEMPLATE-ul împuternicirii
      //    pentru stare civilă (model UNBR Anexa II) → documentul ar ieși cu
      //    totul altfel decât cel depus la instituție;
      //  - E-260718-ZZ4C5: data delegației s-ar rescrie din 20.07 în ziua
      //    regenerării, deși delegația a fost emisă atunci.
      const touchesDateOrLayout = changed.some(
        ([o, n]) => /Serie SM (și|si) Nr\.|^\s*Data \d|Anexa nr\.II|Baroul /.test(o + ' ' + n)
      );
      if (touchesDateOrLayout || changed.length > 2) {
        console.log('      ⏭  SĂRIT — schimbă și data/șablonul, nu doar numele. Decizie umană.');
        continue;
      }

      if (!APPLY) continue;

      await uploadFile(
        doc.s3_key,
        buffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        { 'order-id': order.id, template, 'regenerated-by': 'script-name-fix-2026-07-28' }
      );
      await deleteFile(`${doc.s3_key}.preview.pdf`).catch(() => {});
      await db
        .from('order_documents')
        .update({ file_size: buffer.length, metadata: { ...doc.metadata, regenerated_at: new Date().toISOString(), regenerated_reason: 'fix nume MRZ + text apostilă' } })
        .eq('id', doc.id);
      console.log('      ✓ urcat peste fișierul vechi (aceeași cheie S3, același număr)');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
