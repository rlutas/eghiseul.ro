/**
 * Creates an ONRC automation job for a paid order, idempotently.
 *
 * Called from the same chokepoints as invoice creation (Stripe webhook +
 * confirm-payment) so an ONRC service that's paid via either path gets queued
 * exactly once. A separate Playwright worker (see
 * docs/technical/specs/onrc-automation-plan.md) polls PENDING jobs.
 *
 * Idempotency: a unique index on onrc_jobs.order_id rejects the second insert.
 */
import { createAdminClient } from '@/lib/supabase/admin';

// DB service slug -> ONRC document type the worker applies for.
const ONRC_SERVICE_DOC_TYPES: Record<string, string> = {
  'certificat-constatator': 'CERTIFICAT_CONSTATATOR',
  // future: 'furnizare-informatii': 'FURNIZARE_INFORMATII',
};

interface CustomerData {
  company?: { cui?: string; companyName?: string };
  constatator?: {
    documentType?: string;
    reportType?: string;
    purpose?: string;
    otherPurpose?: string;
    period?: string;
    periodFrom?: string;
    periodTo?: string;
    requesterName?: string;
    requesterCnp?: string;
  };
}

export async function ensureOnrcJobForPaidOrder(orderId: string): Promise<void> {
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
    const documentType = slug ? ONRC_SERVICE_DOC_TYPES[slug] : undefined;
    if (!documentType) return; // not an ONRC service — nothing to queue

    const cd = (order.customer_data as CustomerData) ?? {};
    const company = cd.company ?? {};
    const c = cd.constatator ?? {};
    const cui = company.cui ?? null;
    const isPf = c.documentType === 'pf';
    // PF is identified by CNP (no CUI); firmă/istoric require a CUI.
    if (isPf) {
      if (!c.requesterCnp) {
        console.error(`[onrc] PF order ${orderId} has no requesterCnp — not queued`);
        return;
      }
    } else if (!cui) {
      console.error(`[onrc] order ${orderId} is an ONRC service but has no CUI — not queued`);
      return;
    }

    const detail = {
      documentType: c.documentType ?? null,
      reportType: c.reportType ?? null,
      // Keep both so the worker can send the ONRC "Altele" option + the free text.
      purpose: c.purpose ?? null,
      otherPurpose: c.otherPurpose ?? null,
      period: c.period ?? null,
      periodFrom: c.periodFrom ?? null,
      periodTo: c.periodTo ?? null,
      requesterName: c.requesterName ?? null,
      requesterCnp: c.requesterCnp ?? null,
    };

    // onrc_jobs is a new table not yet in generated Supabase types — cast.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any).from('onrc_jobs').insert({
      order_id: orderId,
      status: 'PENDING',
      document_type: documentType,
      cui,
      company_name: company.companyName ?? null,
      detail,
    });

    // 23505 = unique_violation → job already exists, which is the idempotent path.
    if (insertError && insertError.code !== '23505' && !/duplicate key|unique/i.test(insertError.message)) {
      console.error('[onrc] failed to create job:', insertError.message);
    } else if (!insertError) {
      console.log(`[onrc] queued job for order ${orderId} (${documentType})`);
    }
  } catch (err) {
    // Never break the payment flow because of queue creation.
    console.error('[onrc] ensureOnrcJobForPaidOrder error:', err);
  }
}
