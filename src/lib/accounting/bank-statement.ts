/**
 * BT (Banca Transilvania) statement CSV parser + auto-categorization +
 * Stripe-payout matching. Feeds the "Extras bancă" part of /admin/decontari.
 *
 * CSV shape (BT export "Lista de tranzactii"): ~19 header lines, then
 *   "Data tranzactie","Data valuta",Referinta,"Tip tranzactie",Descriere,Debit,Credit
 * Dates are DD/MM/YYYY, amounts use dot decimals. Reference is unique per tx.
 */
import { createAdminClient } from '@/lib/supabase/admin';

export interface BankEntry {
  reference: string;
  account: string;
  tx_date: string; // ISO
  value_date: string | null;
  tx_type: string | null;
  description: string | null;
  debit_bani: number;
  credit_bani: number;
  category: string;
  counterparty: string | null;
  needs_invoice: boolean;
  matched_payout_id: string | null;
}

/** Categorization rules — first match wins. Extend as new counterparties appear. */
const RULES: Array<{
  test: (desc: string, type: string, isCredit: boolean) => boolean;
  category: string;
  counterparty?: (desc: string) => string | null;
  needsInvoice?: boolean;
}> = [
  {
    test: (d, _t, c) => c && /STRIPE TECHNOLOGY/i.test(d),
    category: 'stripe_payout',
    counterparty: () => 'Stripe',
  },
  {
    test: (d) => /KENNA ZWENNA/i.test(d),
    category: 'traduceri',
    counterparty: () => 'Kenna Zwenna SRL (traduceri)',
  },
  {
    test: (d) => /ONRC/i.test(d),
    category: 'taxe_onrc',
    counterparty: () => 'ONRC București (taxe constatatoare)',
  },
  {
    test: (d) => /FAN Curier|FANCOURIER|SAMEDAY/i.test(d),
    category: 'curierat',
    counterparty: (d) => (/SAMEDAY/i.test(d) ? 'Sameday' : 'Fan Courier'),
  },
  {
    test: (d) => /SALARIU/i.test(d),
    category: 'salarii',
  },
  {
    test: (d) => /ANAF|TREZORER|BUGETUL/i.test(d),
    category: 'taxe_anaf',
    counterparty: () => 'ANAF/Trezorerie',
  },
  {
    test: (d) => /aport propriu|Restituire aport/i.test(d),
    category: 'aport',
  },
  {
    test: (d) => /ANCPI/i.test(d),
    category: 'taxe_ancpi',
    counterparty: () => 'ANCPI (taxe extrase CF)',
  },
  {
    test: (d) => /\bOMV\b|\bMOL\b|PETROM|ROMPETROL/i.test(d),
    category: 'combustibil',
  },
  {
    test: (d) => /Porsche Leasing|PORSCHE BROKER|Asigurare RCA/i.test(d),
    category: 'leasing_auto',
    counterparty: () => 'Porsche Leasing/Broker',
  },
  {
    test: (d) => /ORANGE|VODAFONE|TELEKOM|DIGI\b/i.test(d),
    category: 'telecom',
  },
  {
    // POS payments in foreign currency — the supplier invoice must be
    // collected for accounting (it never shows up in SPV). MUST run before
    // the bank-fee rule: every POS line contains "comision tranzactie 0.00".
    test: (d) => /valoare tranzactie: [\d.]+ (USD|EUR|GBP)/i.test(d),
    category: 'furnizor_extern',
    needsInvoice: true,
    counterparty: (d) => {
      const m = d.match(/TID:\S+\s+(.+?)\s+(?:\+?\d|[A-Z]{2}\s+\d)/);
      return m ? m[1].trim().slice(0, 60) : null;
    },
  },
  {
    // Bank fees: match on the transaction TYPE or a fee-only description —
    // NOT on substrings like "comision tranzactie 0.00" inside POS lines.
    test: (d, t) => /Comision|Taxa/i.test(t) || /^(Pachet IZI|Abonament|Comision)/i.test(d),
    category: 'comisioane_banca',
    counterparty: () => 'Banca Transilvania',
  },
];

function toIso(d: string): string | null {
  const m = d.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Minimal CSV line parser (quoted fields, commas inside quotes). */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseBtCsv(content: string): { account: string; entries: BankEntry[] } {
  const lines = content.split(/\r?\n/);
  let account = '';
  let headerIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols[0] === 'Numar cont:') account = cols[1] ?? '';
    if (cols[0] === 'Data tranzactie') { headerIdx = i; break; }
  }
  if (headerIdx < 0) throw new Error('Format necunoscut — nu găsesc antetul "Data tranzactie" (e export BT?)');

  const entries: BankEntry[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const c = parseCsvLine(lines[i]);
    const txDate = toIso(c[0] ?? '');
    const reference = (c[2] ?? '').trim();
    if (!txDate || !reference) continue;
    const type = (c[3] ?? '').trim() || null;
    const desc = (c[4] ?? '').trim() || null;
    const debit = Math.round(parseFloat(c[5] || '0') * 100) || 0;
    const credit = Math.round(parseFloat(c[6] || '0') * 100) || 0;

    let category = 'altele';
    let counterparty: string | null = null;
    let needsInvoice = false;
    for (const r of RULES) {
      if (r.test(desc ?? '', type ?? '', credit > 0)) {
        category = r.category;
        counterparty = r.counterparty?.(desc ?? '') ?? null;
        needsInvoice = r.needsInvoice ?? false;
        break;
      }
    }

    entries.push({
      reference,
      account,
      tx_date: txDate,
      value_date: toIso(c[1] ?? ''),
      tx_type: type,
      description: desc,
      debit_bani: debit,
      credit_bani: credit,
      category,
      counterparty,
      needs_invoice: needsInvoice,
      matched_payout_id: null,
    });
  }
  return { account, entries };
}

export interface BankImportResult {
  imported: number;
  payoutsMatched: number;
  unmatchedStripeCredits: number;
  summary: Record<string, { count: number; debit_bani: number; credit_bani: number }>;
}

/** Import entries + match Stripe credits to payouts (exact amount, ±3 days). */
export async function importBankStatement(content: string): Promise<BankImportResult> {
  const { entries } = parseBtCsv(content);
  const admin = createAdminClient();

  // match stripe credits → payouts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payouts } = await (admin as any)
    .from('stripe_payouts')
    .select('id, amount_bani, arrival_date, bank_matched_at');
  const free = (payouts ?? []).filter((p: { bank_matched_at: string | null }) => !p.bank_matched_at);
  let payoutsMatched = 0;
  let unmatchedStripe = 0;
  const usedPayouts = new Set<string>();
  for (const e of entries) {
    if (e.category !== 'stripe_payout') continue;
    const cands = free.filter(
      (p: { id: string; amount_bani: number; arrival_date: string | null }) =>
        !usedPayouts.has(p.id) &&
        p.amount_bani === e.credit_bani &&
        p.arrival_date &&
        Math.abs((new Date(p.arrival_date).getTime() - new Date(e.tx_date).getTime()) / 86400000) <= 3
    );
    if (cands.length === 1) {
      e.matched_payout_id = cands[0].id;
      usedPayouts.add(cands[0].id);
      payoutsMatched++;
    } else {
      unmatchedStripe++;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('bank_statement_entries').upsert(entries);
  if (error) throw new Error(error.message);

  for (const e of entries) {
    if (!e.matched_payout_id) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('stripe_payouts')
      .update({ bank_matched_at: new Date().toISOString() })
      .eq('id', e.matched_payout_id);
  }

  const summary: BankImportResult['summary'] = {};
  for (const e of entries) {
    const s = (summary[e.category] ??= { count: 0, debit_bani: 0, credit_bani: 0 });
    s.count++;
    s.debit_bani += e.debit_bani;
    s.credit_bani += e.credit_bani;
  }
  return { imported: entries.length, payoutsMatched, unmatchedStripeCredits: unmatchedStripe, summary };
}
