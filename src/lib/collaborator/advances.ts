/**
 * Balance of the money sent to the collaborator for institution fees
 * (`collaborator_advances`) against the ANCPI fees recorded on his orders.
 * Shared by the admin panel and the collaborator portal so both show the same
 * balance.
 */
import { sumAncpiCosts } from '@/lib/collaborator/settlement';

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface AdvanceRow {
  id: string;
  amount_ron: number;
  sent_at: string;
  method: string;
  note: string | null;
  created_at?: string;
}

export interface AdvancesSummary {
  advances: AdvanceRow[];
  /** Total sent. */
  sent: number;
  /** ANCPI fees recorded on his orders. */
  spent: number;
  /** Positive = money still with him, not yet spent on fees. */
  balance: number;
}

export async function getAdvancesSummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  collaboratorId: string,
  serviceIds: string[]
): Promise<AdvancesSummary> {
  const { data: advances, error } = await admin
    .from('collaborator_advances')
    .select('id, amount_ron, sent_at, method, note, created_at')
    .eq('collaborator_id', collaboratorId)
    .order('sent_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(`advances: ${error.message}`);

  // Consumption: ANCPI fees recorded on the collaborator's orders.
  const scope = serviceIds.length
    ? `service_id.in.(${serviceIds.join(',')}),assigned_collaborator_id.eq.${collaboratorId}`
    : `assigned_collaborator_id.eq.${collaboratorId}`;
  const { data: orders } = await admin
    .from('orders')
    .select('id')
    .or(scope)
    .eq('payment_status', 'paid')
    .neq('status', 'cancelled');
  const ids = (orders ?? []).map((o: { id: string }) => o.id);
  let spent = 0;
  for (let i = 0; i < ids.length; i += 200) {
    const { data: rows } = await admin
      .from('order_supplier_costs')
      .select('supplier, category, amount_ron')
      .in('order_id', ids.slice(i, i + 200));
    spent += sumAncpiCosts(rows ?? []);
  }

  const list = (advances ?? []) as AdvanceRow[];
  const sent = list.reduce((s, a) => s + (Number(a.amount_ron) || 0), 0);
  return { advances: list, sent: round2(sent), spent: round2(spent), balance: round2(sent - spent) };
}
