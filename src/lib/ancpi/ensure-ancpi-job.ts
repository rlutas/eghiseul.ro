/**
 * Creates an ANCPI automation job for a paid order, idempotently.
 *
 * Called from the same chokepoints as invoice + ONRC job creation (Stripe webhook
 * + confirm-payment) so an extras-carte-funciară order paid via either path gets
 * queued exactly once. A separate worker (see
 * docs/technical/specs/ancpi-automation-plan.md) polls PENDING jobs, places the
 * order on ePay ANCPI, pays from prepaid credit, downloads the PDF and reports back.
 *
 * Reads the wizard's `customer_data.property` (PropertyState from the Property
 * module: county/locality/carteFunciara/cadastral/…). The county display name is
 * resolved to the ANCPI judetId here; the worker resolves uatId from the locality
 * name at runtime.
 *
 * Idempotency: a unique index on ancpi_jobs.order_id rejects the second insert.
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveJudetId } from '@/lib/ancpi/judete';
import { effectiveIdentifier } from '@/lib/ancpi/cf-format';

// Only this service slug is an ANCPI service.
const ANCPI_SLUG = 'extras-carte-funciara';

// v1 scope: the standard "extras de carte funciară pentru informare" is automated
// via the prepaid product (14200, 1 point/extras). Plan cadastral / colectivă are
// handled by an operator for now (the worker routes them to NEEDS_OPERATOR).
const DEFAULT_PROD_ID = '14200';

// PropertyState as stored by src/components/orders/modules/property/PropertyDataStep.tsx
interface AdditionalImobil {
  locality?: string;
  carteFunciara?: string;
  cadastral?: string;
  topografic?: string;
}
interface PropertyState {
  county?: string;
  locality?: string;
  carteFunciara?: string;
  cadastral?: string;
  topografic?: string;
  motiv?: string;
  additionalImobile?: AdditionalImobil[];
  ownerName?: string;
  ownerCnpCui?: string;
  propertyAddress?: string;
}

/**
 * Pick the best identifier + its type from a set of CF/cadastral/topo values.
 * Applies effectiveIdentifier so a collective building number ("123456-C1") is
 * issued on the land ("123456").
 */
function pickIdentifier(cf?: string, cad?: string, topo?: string): { identificator: string; identificatorType: 'CF' | 'CAD' | 'TOPO' } {
  if (cf) return { identificator: effectiveIdentifier(cf), identificatorType: 'CF' };
  if (cad) return { identificator: effectiveIdentifier(cad), identificatorType: 'CAD' };
  return { identificator: (topo ?? '').trim(), identificatorType: 'TOPO' };
}

interface CustomerData {
  property?: PropertyState;
}

export async function ensureAncpiJobForPaidOrder(orderId: string): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, customer_data, services(slug)')
      .eq('id', orderId)
      .single();

    if (error || !order) return;

    // services() may come back as an object or a single-element array.
    const svc = order.services as { slug?: string } | { slug?: string }[] | null;
    const slug = Array.isArray(svc) ? svc[0]?.slug : svc?.slug;
    if (slug !== ANCPI_SLUG) return; // not an ANCPI service — nothing to queue

    const p = (order.customer_data as CustomerData)?.property ?? {};

    const primary = pickIdentifier(p.carteFunciara, p.cadastral, p.topografic);
    if (!primary.identificator || !p.county) {
      console.error(`[ancpi] order ${orderId} has no county/identificator — not queued`);
      return;
    }

    // All imobile in one order share the SAME county (ANCPI rule); additional
    // ones have their own UAT/locality + identifier. The worker resolves uatId
    // from the locality name at runtime.
    const judetId = resolveJudetId(p.county);
    const mkImobil = (uat: string | undefined, id: { identificator: string; identificatorType: 'CF' | 'CAD' | 'TOPO' }, cf?: string, cad?: string, topo?: string) => ({
      judet: p.county ?? null,
      judetId,
      uat: uat ?? null,
      uatId: null as number | null,
      identificator: id.identificator,
      identificatorType: id.identificatorType,
      carteFunciara: cf ?? null,
      cadastral: cad ?? null,
      topografic: topo ?? null,
      immovableId: null as string | null,
      validatedAddress: null as string | null,
    });

    const imobile = [mkImobil(p.locality, primary, p.carteFunciara, p.cadastral, p.topografic)];
    for (const a of p.additionalImobile ?? []) {
      const id = pickIdentifier(a.carteFunciara, a.cadastral, a.topografic);
      if (!id.identificator) continue; // skip empty extra rows
      imobile.push(mkImobil(a.locality, id, a.carteFunciara, a.cadastral, a.topografic));
    }

    const detail = {
      serviceType: 'extras-cf',
      imobile,
      motiv: p.motiv ?? null,
      ownerName: p.ownerName ?? null,
      ownerCnpCui: p.ownerCnpCui ?? null,
      address: p.propertyAddress ?? null,
    };

    // ancpi_jobs is a new table not yet in generated Supabase types — cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any).from('ancpi_jobs').insert({
      order_id: orderId,
      status: 'PENDING',
      service_type: 'EXTRAS_CF',
      prod_id: DEFAULT_PROD_ID,
      detail,
    });

    // 23505 = unique_violation → job already exists, which is the idempotent path.
    if (insertError && insertError.code !== '23505' && !/duplicate key|unique/i.test(insertError.message)) {
      console.error('[ancpi] failed to create job:', insertError.message);
    } else if (!insertError) {
      console.log(`[ancpi] queued job for order ${orderId} (EXTRAS_CF)`);
    }
  } catch (err) {
    // Never break the payment flow because of queue creation.
    console.error('[ancpi] ensureAncpiJobForPaidOrder error:', err);
  }
}
