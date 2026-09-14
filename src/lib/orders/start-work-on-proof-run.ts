import { createAdminClient } from '@/lib/supabase/admin';
import { ensureBarouDocumentsForPaidOrder } from '@/lib/documents/ensure-barou-documents';
import { assessStartWorkOnProof, type StartWorkCandidate } from './start-work-on-proof';

/** Server-side: vezi `start-work-on-proof.ts` pentru context și gardă. */
export async function startWorkOnVerifiedProof(
  orderId: string,
  opts: { adminId: string; note?: string }
): Promise<{ ok: true; barou: 'generated' | 'skipped' | 'failed' } | { ok: false; error: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: order, error } = await admin
    .from('orders')
    .select('id, status, payment_status, payment_method, proof_verified_at, payment_proof_url')
    .eq('id', orderId)
    .single();
  if (error || !order) return { ok: false, error: 'Comanda nu a fost găsită.' };

  const gate = assessStartWorkOnProof(order as StartWorkCandidate);
  if (!gate.ok) return gate;

  const now = new Date().toISOString();
  // Update condiționat pe statusul citit — două clickuri simultane nu pornesc
  // lucrul de două ori (al doilea nu potrivește niciun rând).
  const { data: updated, error: updateError } = await admin
    .from('orders')
    .update({
      status: 'processing',
      proof_verified_at: now,
      proof_verified_by: opts.adminId,
      updated_at: now,
    })
    .eq('id', orderId)
    .eq('status', 'awaiting_payment')
    .is('proof_verified_at', null)
    .select('id');
  if (updateError) return { ok: false, error: `Eroare la pornirea lucrului: ${updateError.message}` };
  if (!updated || updated.length === 0) {
    return { ok: false, error: 'Lucrul a pornit deja pe dovada de plată.' };
  }

  await admin.from('order_history').insert({
    order_id: orderId,
    event_type: 'work_started_on_proof',
    changed_by: opts.adminId,
    old_value: { status: 'awaiting_payment' },
    new_value: { status: 'processing', payment_status: 'awaiting_verification' },
    notes:
      'Dovada de plată verificată de operator — lucrul a pornit înainte de încasare. ' +
      'Factura și emailul de confirmare pleacă la „Confirmă plata".' +
      (opts.note ? ` Notă: ${opts.note}` : ''),
  });

  // Barou: numere + contract asistență + împuterniciri, ca la plată. Fail-soft
  // — helperul scrie `barou_allocation_failed` în istoric; cronul orar NU îl
  // reia pe comenzile neplătite, dar „Confirmă plata" îl rulează din nou.
  const barou = await ensureBarouDocumentsForPaidOrder(orderId, { allowVerifiedProof: true });
  return { ok: true, barou: barou.ok ? (barou.skipped ? 'skipped' : 'generated') : 'failed' };
}
