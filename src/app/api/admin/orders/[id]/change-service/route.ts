/**
 * POST /api/admin/orders/[id]/change-service
 *
 * „Schimbă serviciul" pe o comandă PLĂTITĂ, la același preț în catalogul
 * ACTUAL (cerere echipă, E-261007-K59HB: client care a plătit Cazier Judiciar
 * PF și voia Cazier Fiscal). Banii NU se mișcă aici — pentru diferențe de
 * preț există „Modifică" (opțiuni) sau anulare + comandă nouă.
 *
 * Familii (fără treceri între ele): servicii prin avocat ↔ servicii prin
 * avocat; imobiliare prin topograf ↔ imobiliare prin topograf. Regulile sunt
 * în `@/lib/orders/change-service` (decizii Raul, 02.11.2026).
 *
 * Body: { action: 'preview' | 'apply', targetServiceSlug?, note?, licenseConfirmedRomanian? }
 *  - preview fără țintă → lista serviciilor candidate, fiecare cu eligibilitate;
 *  - preview cu țintă → consecințe: ce lipsește, documente de regenerat,
 *    numere Barou, factură, termen nou;
 *  - apply → schimbă service_id + opțiunile legate de catalogul nou,
 *    recalculează termenul, mută numerele Barou pe serviciul nou (doar
 *    avocat), șterge un job ANCPI rămas în coadă nepornit, scrie istoric.
 *    Statusul comenzii NU se schimbă niciodată de aici.
 *
 * Termenul (`estimated_completion_date`) se recalculează cu regulile
 * serviciului NOU, pornind tot de la `paid_at` (clientul a plătit atunci;
 * schimbarea e greșeala noastră de încadrare, nu o comandă nouă). Excepție:
 * comenzile finalizate / expediate / livrate își păstrează termenul — acolo
 * schimbarea doar corectează evidența.
 *
 * Imobiliare: colaboratorul vede comenzile după serviciu
 * (`collaborator_service_assignments`) sau după alocarea pe comandă
 * (`assigned_collaborator_id`, care rămâne). Dacă topograful care are comanda
 * nu lucrează pe ținta, schimbarea e blocată (ar dispărea din portalul lui).
 *
 * Factura NU se atinge (regula lui Raul): rămâne cu denumirea veche, iar
 * refacerea o decide Raul / contabila („Storno + Reemite" există separat).
 * Documentele generate NU se șterg: echipa le regenerează.
 *
 * Logica de eligibilitate e pură, în `@/lib/orders/change-service`.
 * Auth: `orders.manage`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { brandForOrder } from '@/lib/brand/for-order';
import { brandSellsService } from '@/lib/brand/brands';
import { computeEstimatedCompletionISOForOrder } from '@/lib/orders/order-estimate';
import { getRegistryClient } from '@/lib/registry/client';
import {
  describeDocumentImpact,
  evaluateServiceSwitch,
  invoiceNote,
  isHubService,
  remapSelectedOptions,
  serviceFamily,
  type AncpiJobForSwitch,
  type ServiceForSwitch,
  type TargetOptionForSwitch,
} from '@/lib/orders/change-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ChangeServiceBody {
  action?: unknown;
  targetServiceSlug?: unknown;
  note?: unknown;
  licenseConfirmedRomanian?: unknown;
}

const SERVICE_COLUMNS =
  'id, slug, name, base_price, is_active, verification_config, config, estimated_days, urgent_days, urgent_available';

type ServiceRow = ServiceForSwitch & {
  estimated_days?: number | null;
  urgent_days?: number | null;
  urgent_available?: boolean | null;
};

function fail(status: number, error: string, data?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error, ...(data ? { data } : {}) }, { status });
}

/**
 * Numerele de Barou sunt idempotente pe (platformă, comandă, tip, service_type):
 * contractul e cheiat pe NUMELE serviciului, împuternicirea pe SLUG (vechile
 * alocări manuale pe nume). Fără mutare, regenerarea după schimbare ar aloca
 * numere noi și le-ar lăsa pe cele vechi agățate. Best-effort: o eroare aici
 * nu anulează schimbarea, doar o raportăm echipei.
 */
async function moveRegistryNumbers(params: {
  platform: string;
  orderRef: string;
  source: { slug: string; name: string };
  target: { slug: string; name: string };
}): Promise<{ moved: number; error: string | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registry = getRegistryClient() as any;
    const { data: rows, error } = await registry
      .from('number_registry')
      .select('id, type, service_type')
      .eq('platform', params.platform)
      .eq('order_ref', params.orderRef)
      .is('voided_at', null);
    if (error) return { moved: 0, error: error.message };
    const live = (rows ?? []) as Array<{ id: string; type: string; service_type: string | null }>;
    let moved = 0;
    for (const r of live) {
      let next: string | null = null;
      if (r.type === 'contract' && r.service_type === params.source.name) next = params.target.name;
      if (r.type === 'delegation' && (r.service_type === params.source.slug || r.service_type === params.source.name)) {
        next = r.service_type === params.source.slug ? params.target.slug : params.target.name;
      }
      if (!next) continue;
      // Nu dubla: dacă există deja o alocare vie pe cheia nouă, o lăsăm.
      if (live.some((x) => x.type === r.type && x.service_type === next)) continue;
      const { error: updErr } = await registry
        .from('number_registry')
        .update({ service_type: next })
        .eq('id', r.id);
      if (updErr) return { moved, error: updErr.message };
      moved += 1;
    }
    return { moved, error: null };
  } catch (err) {
    return { moved: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // ── Auth ───────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return fail(401, 'Authentication required');
  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  // ── Body ───────────────────────────────────────────────────────────────
  let body: ChangeServiceBody;
  try {
    body = (await request.json()) as ChangeServiceBody;
  } catch {
    return fail(400, 'Cerere invalidă (JSON lipsă).');
  }
  if (body.action !== 'preview' && body.action !== 'apply') {
    return fail(400, '`action` trebuie să fie „preview" sau „apply".');
  }
  const targetSlug = typeof body.targetServiceSlug === 'string' ? body.targetServiceSlug.trim() : '';
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '';
  const licenseConfirmedRomanian = body.licenseConfirmedRomanian === true;
  if (body.action === 'apply') {
    if (!targetSlug) return fail(400, 'Alege serviciul nou.');
    if (note.length < 3) return fail(400, 'Scrie motivul schimbării (ex. „clientul voia cazier fiscal").');
  }

  // ── Comanda + serviciul curent ─────────────────────────────────────────
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data: order, error: orderErr } = await db
    .from('orders')
    .select(`*, services(${SERVICE_COLUMNS})`)
    .eq('id', id)
    .single();
  if (orderErr || !order) return fail(404, 'Comanda nu a fost găsită.');
  const source = order.services as ServiceRow | null;
  if (!source) return fail(409, 'Comanda nu are serviciu asociat.');

  const brand = brandForOrder(order);
  const orderRow = {
    status: String(order.status ?? ''),
    payment_status: (order.payment_status as string | null) ?? null,
    base_price: order.base_price,
    selected_options: order.selected_options,
    customer_data: order.customer_data,
    assigned_collaborator_id: (order.assigned_collaborator_id as string | null) ?? null,
  };

  // ── Candidați: aceeași familie (avocat / imobiliare prin topograf) ─────
  // Catalogul e mic (~30 de servicii): îl citim tot și filtrăm aici.
  const sourceFamily = serviceFamily(source);
  const { data: svcRows } = await db.from('services').select(SERVICE_COLUMNS);
  const allServices = (svcRows ?? []) as ServiceRow[];
  const services = targetSlug
    ? allServices.filter((s) => s.slug === targetSlug)
    : allServices.filter(
        (s) => s.slug !== source.slug && s.is_active && !isHubService(s) && serviceFamily(s) === sourceFamily
      );
  if (targetSlug && services.length === 0) return fail(404, 'Serviciul ales nu există.');

  const serviceIds = services.map((s) => s.id);
  const [{ data: optRows }, { data: docRows }, { data: jobRows }, { data: csaRows }] = await Promise.all([
    db.from('service_options').select('id, code, is_active, service_id').in('service_id', serviceIds),
    db.from('order_documents').select('type').eq('order_id', id),
    db.from('ancpi_jobs').select('id, status, ancpi_order_id').eq('order_id', id),
    db
      .from('collaborator_service_assignments')
      .select('collaborator_id, service_id')
      .in('service_id', [source.id, ...serviceIds]),
  ]);
  const optionsBySvc = new Map<string, TargetOptionForSwitch[]>();
  for (const o of (optRows ?? []) as Array<TargetOptionForSwitch & { service_id: string }>) {
    const list = optionsBySvc.get(o.service_id) ?? [];
    list.push({ id: o.id, code: o.code, is_active: o.is_active });
    optionsBySvc.set(o.service_id, list);
  }
  const docTypes = ((docRows ?? []) as Array<{ type: string | null }>).map((d) => d.type).filter((t): t is string => !!t);
  const ancpiJob = (((jobRows ?? []) as AncpiJobForSwitch[])[0] ?? null) as AncpiJobForSwitch | null;
  const collabsBySvc = new Map<string, string[]>();
  for (const r of (csaRows ?? []) as Array<{ collaborator_id: string; service_id: string }>) {
    collabsBySvc.set(r.service_id, [...(collabsBySvc.get(r.service_id) ?? []), r.collaborator_id]);
  }

  const evaluate = (target: ServiceRow) =>
    evaluateServiceSwitch({
      order: orderRow,
      source,
      target,
      targetOptions: optionsBySvc.get(target.id) ?? [],
      brandSellsTarget: brandSellsService(brand, target.slug),
      licenseConfirmedRomanian,
      existingDocTypes: docTypes,
      ancpiJob,
      sourceCollaboratorIds: collabsBySvc.get(source.id) ?? [],
      targetCollaboratorIds: collabsBySvc.get(target.id) ?? [],
    });

  // ── Preview fără țintă: lista ─────────────────────────────────────────
  if (!targetSlug) {
    const candidates = services
      .map((s) => {
        const ev = evaluate(s);
        return {
          slug: s.slug,
          name: s.name,
          basePrice: Number(s.base_price),
          eligible: ev.eligible,
          blockers: ev.blockers,
          needsLicenseConfirmation: ev.needsLicenseConfirmation,
        };
      })
      .sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.name.localeCompare(b.name, 'ro'));
    const familyNote =
      sourceFamily === 'instant'
        ? 'Serviciile emise automat (extras CF, plan cadastral, certificat constatator) nu se schimbă: documentul pleacă pe loc.'
        : sourceFamily === 'other'
          ? 'Serviciul acestei comenzi nu se poate schimba de aici: anulare și comandă nouă.'
          : null;
    return NextResponse.json({
      success: true,
      data: {
        current: {
          slug: source.slug,
          name: source.name,
          paidBasePrice: Number(order.base_price ?? 0),
          currentBasePrice: Number(source.base_price ?? 0),
          status: orderRow.status,
        },
        familyNote,
        candidates,
      },
    });
  }

  // ── Preview / apply cu țintă ──────────────────────────────────────────
  const target = services[0];
  const evaluation = evaluate(target);

  const documents = describeDocumentImpact(source, target, docTypes);
  const invoice = invoiceNote(order.invoice_number as string | null, source.name);

  // Clientul a confirmat permisul românesc → îl scriem, ca termenul și
  // documentele să citească aceeași valoare ca o comandă din wizard.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customerData = { ...((order.customer_data ?? {}) as Record<string, any>) };
  let customerDataChanged = false;
  if (evaluation.needsLicenseConfirmation && licenseConfirmedRomanian) {
    customerData.vehicle = { ...(customerData.vehicle ?? {}), licenseIssuedAbroad: false };
    customerDataChanged = true;
  }
  const newOptions = remapSelectedOptions(order.selected_options, optionsBySvc.get(target.id) ?? []);

  const oldEstimate = (order.estimated_completion_date as string | null) ?? null;
  let newEstimate: string | null = oldEstimate;
  if (!evaluation.keepEstimate) {
    const placedAt = order.paid_at ? new Date(order.paid_at as string) : new Date(order.created_at as string);
    newEstimate = await computeEstimatedCompletionISOForOrder(
      admin,
      { customer_data: customerData, selected_options: newOptions, delivery_method: order.delivery_method },
      target,
      placedAt
    );
  }

  const consequences = {
    from: { slug: source.slug, name: source.name },
    to: { slug: target.slug, name: target.name, basePrice: Number(target.base_price) },
    eligible: evaluation.eligible,
    blockers: evaluation.blockers,
    todo: evaluation.todo,
    warnings: evaluation.warnings,
    changes: evaluation.changes,
    family: evaluation.family,
    paidBasePrice: Number(order.base_price ?? 0),
    needsLicenseConfirmation: evaluation.needsLicenseConfirmation,
    documents,
    invoiceNote: invoice,
    reissueAvailable: !!order.invoice_number,
    estimate: { old: oldEstimate, new: newEstimate, kept: evaluation.keepEstimate },
  };

  if (body.action === 'preview') {
    return NextResponse.json({ success: true, data: { preview: true, ...consequences } });
  }

  if (!evaluation.eligible) {
    return fail(409, evaluation.blockers.join(' '), { blockers: evaluation.blockers });
  }

  // ── Apply ─────────────────────────────────────────────────────────────
  const adminEmail = user.email ?? user.id;
  const nowIso = new Date().toISOString();
  const update: Record<string, unknown> = {
    service_id: target.id,
    selected_options: newOptions,
    last_modified_at: nowIso,
    last_modified_by: adminEmail,
    updated_at: nowIso,
  };
  if (customerDataChanged) update.customer_data = customerData;
  if (!evaluation.keepEstimate && newEstimate) update.estimated_completion_date = newEstimate;

  // Job ANCPI rămas în coadă, nepornit: îl ștergem ÎNAINTE de schimbare, cu
  // gardă pe PENDING + fără comandă ePay. Dacă robotul l-a luat între timp,
  // ștergerea nu prinde nimic și oprim totul (altfel s-ar plăti la ANCPI un
  // document pentru serviciul vechi). ancpi_jobs nu are status „anulat".
  let ancpiJobDeleted = false;
  if (evaluation.deletePendingAncpiJobId) {
    const { data: delRows, error: delErr } = await db
      .from('ancpi_jobs')
      .delete()
      .eq('id', evaluation.deletePendingAncpiJobId)
      .eq('status', 'PENDING')
      .is('ancpi_order_id', null)
      .select('id');
    if (delErr || !delRows || delRows.length === 0) {
      if (delErr) console.error('[change-service] ancpi job delete failed:', delErr);
      return fail(409, 'Robotul ANCPI a pornit jobul între timp: serviciul nu se mai schimbă. Reîncarcă pagina.');
    }
    ancpiJobDeleted = true;
  }

  // Gardă de concurență: aplicăm doar dacă serviciul e tot cel citit.
  const { data: updated, error: updErr } = await db
    .from('orders')
    .update(update)
    .eq('id', id)
    .eq('service_id', source.id)
    .select('id');
  if (updErr) {
    console.error('[change-service] update failed:', updErr, ancpiJobDeleted ? '(ancpi job already deleted)' : '');
    return fail(500, 'Nu am putut schimba serviciul.');
  }
  if (!updated || updated.length === 0) {
    return fail(409, 'Serviciul comenzii s-a schimbat între timp. Reîncarcă pagina.');
  }

  // Numere de Barou există doar pe serviciile prin avocat.
  const registry =
    evaluation.family === 'lawyer'
      ? await moveRegistryNumbers({
          platform: brand.registryPlatform,
          orderRef: (order.friendly_order_id as string | null) || id,
          source,
          target,
        })
      : { moved: 0, error: null };
  if (registry.error) console.error('[change-service] registry move failed:', registry.error);

  const notes = [
    `Serviciu schimbat: ${source.name} → ${target.name} (${note})`,
    `de ${adminEmail}`,
    documents.toRegenerate.length ? `de regenerat: ${documents.toRegenerate.map((d) => d.label).join(', ')}` : null,
    registry.moved ? `numere Barou mutate: ${registry.moved}` : null,
    registry.error ? 'numerele Barou NU s-au putut muta automat' : null,
    order.invoice_number ? `factura ${order.invoice_number} neschimbată` : null,
    evaluation.keepEstimate ? `comanda era ${orderRow.status}: termen și status neschimbate` : null,
    ancpiJobDeleted ? 'jobul ANCPI nepornit a fost șters din coadă' : null,
  ].filter(Boolean) as string[];

  const { error: histErr } = await db.from('order_history').insert({
    order_id: id,
    event_type: 'modified',
    changed_by: adminEmail,
    old_value: { service_slug: source.slug, service_name: source.name, estimated_completion_date: oldEstimate, status: orderRow.status },
    new_value: { service_slug: target.slug, service_name: target.name, estimated_completion_date: newEstimate, reason: note },
    notes: notes.join(' · '),
  });
  if (histErr) console.error('[change-service] history insert failed:', histErr);

  return NextResponse.json({
    success: true,
    data: {
      applied: true,
      ...consequences,
      registry: { moved: registry.moved, error: registry.error ? 'Numerele de Barou nu s-au putut muta automat: verifică în Registru.' : null },
    },
  });
}
