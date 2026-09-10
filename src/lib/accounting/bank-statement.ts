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
  /** Comanda plătită prin transfer bancar, când linia a putut fi potrivită. */
  matched_order_id: string | null;
}

/**
 * Numele plătitorului dintr-o linie de încasare BT. Formatul e o listă separată
 * de `;` în care numele stă chiar înaintea IBAN-ului:
 *   `C.I.F.:45250538;Plata fact EGH 0278...;2026;6;IULIANA FUNERAR SRL;RO39BTRL...`
 * Fără IBAN sau fără segment înaintea lui, întoarce null — mai bine gol decât
 * un nume ghicit.
 */
export function payerFromDescription(desc: string): string | null {
  const parts = desc.split(';').map((p) => p.trim());
  const ibanAt = parts.findIndex((p) => IBAN_RE.test(p.replace(/\s+/g, '')));
  if (ibanAt < 1) return null;
  const name = parts[ibanAt - 1];
  return name && !IBAN_RE.test(name.replace(/\s+/g, '')) ? name.slice(0, 60) : null;
}

const IBAN_RE = /\bRO\d{2}[A-Z]{4}[A-Z0-9]{16}\b/;

/**
 * Numerele de comandă menționate în descrierea plății. Clientul e instruit în
 * emailul cu datele contului să treacă numărul comenzii la „detalii plată",
 * deci ăsta e semnalul de potrivire cel mai sigur.
 */
export function orderNumbersInDescription(desc: string): string[] {
  return (desc.toUpperCase().match(/E-\d{6}-[A-Z0-9]{5}/g) ?? []).filter(
    (v, i, a) => a.indexOf(v) === i
  );
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
    // Încasare de la client prin transfer bancar (ordin de plată în cont).
    // Semnătura BT: linie de CREDIT care poartă IBAN-ul plătitorului. Regula
    // stă DUPĂ `aport` (care are și el IBAN) și după Stripe, deci prinde doar
    // banii veniți de la terți. Fără ea, plățile prin IBAN cădeau pe „altele"
    // și nu se lega nimic de comandă (10.09.2026, E-260905-DMUZA).
    test: (d, _t, c) => c && /\bRO\d{2}[A-Z]{4}[A-Z0-9]{16}\b/.test(d.replace(/\s+/g, '')),
    category: 'incasare_client',
    counterparty: (d) => payerFromDescription(d),
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
  // BT reuses the same Referinta for related legs occasionally — suffix
  // repeats so the primary key stays unique per statement line.
  const refSeen = new Map<string, number>();
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const c = parseCsvLine(lines[i]);
    const txDate = toIso(c[0] ?? '');
    let reference = (c[2] ?? '').trim();
    if (!txDate || !reference) continue;
    const n = (refSeen.get(reference) ?? 0) + 1;
    refSeen.set(reference, n);
    if (n > 1) reference = `${reference}#${n}`;
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...({ company: process.env.ACCOUNTING_COMPANY ?? 'EDIGITALIZARE' } as any),
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
      matched_order_id: null,
    });
  }
  return { account, entries };
}

export interface BankImportResult {
  imported: number;
  payoutsMatched: number;
  unmatchedStripeCredits: number;
  /** Încasări prin transfer bancar legate de o comandă neconfirmată. */
  clientPaymentsMatched: number;
  /** Încasări de la clienți pe care nu le-am putut lega de nicio comandă. */
  unmatchedClientCredits: number;
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

  // Încasări de la clienți → comenzi plătite prin transfer bancar care încă
  // așteaptă confirmarea. Odată legate, operatorul deschide comanda direct din
  // extras, cu referința tranzacției deja completată.
  const { clientPaymentsMatched, unmatchedClientCredits } = await matchClientPayments(entries);

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
  return {
    imported: entries.length,
    payoutsMatched,
    unmatchedStripeCredits: unmatchedStripe,
    clientPaymentsMatched,
    unmatchedClientCredits,
    summary,
  };
}

/** Fereastra în care căutăm comanda pentru o încasare fără număr de comandă. */
const AMOUNT_MATCH_WINDOW_DAYS = 90;

/**
 * Leagă liniile `incasare_client` de comenzile care așteaptă confirmarea plății.
 *
 * Două semnale, în ordinea încrederii:
 *  1. **numărul comenzii în descriere** — clientul e instruit prin email să-l
 *     treacă la „detalii plată", deci e potrivire directă;
 *  2. **suma exactă**, dar DOAR dacă o singură comandă neconfirmată din
 *     ultimele 90 de zile are exact suma aia. Când sunt mai multe (două cazieri
 *     de 89 lei în aceeași săptămână), nu ghicim — linia rămâne nelegată și o
 *     rezolvă omul.
 *
 * Mutarea comenzii pe „plătită" NU se face aici: încasarea o confirmă un
 * operator, cu factură și emailuri, din pagina comenzii.
 */
async function matchClientPayments(
  entries: BankEntry[]
): Promise<{ clientPaymentsMatched: number; unmatchedClientCredits: number }> {
  const credits = entries.filter((e) => e.category === 'incasare_client' && e.credit_bani > 0);
  if (credits.length === 0) return { clientPaymentsMatched: 0, unmatchedClientCredits: 0 };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (admin as any)
    .from('orders')
    .select('id, friendly_order_id, order_number, total_price, created_at, payment_status')
    .neq('payment_status', 'paid')
    .neq('payment_status', 'refunded')
    .gte(
      'created_at',
      new Date(Date.now() - AMOUNT_MATCH_WINDOW_DAYS * 86400000).toISOString()
    );

  type Row = {
    id: string;
    friendly_order_id: string | null;
    order_number: string | null;
    total_price: string | number | null;
    created_at: string;
  };
  const rows: Row[] = orders ?? [];
  const byNumber = new Map<string, Row>();
  for (const o of rows) {
    for (const key of [o.friendly_order_id, o.order_number]) {
      if (key) byNumber.set(key.toUpperCase(), o);
    }
  }

  const used = new Set<string>();
  let matched = 0;
  let unmatched = 0;

  for (const e of credits) {
    let hit: Row | undefined;

    for (const num of orderNumbersInDescription(e.description ?? '')) {
      const o = byNumber.get(num);
      if (o && !used.has(o.id)) { hit = o; break; }
    }

    if (!hit) {
      const txMs = new Date(e.tx_date).getTime();
      const sameAmount = rows.filter(
        (o) =>
          !used.has(o.id) &&
          Math.round(Number(o.total_price ?? 0) * 100) === e.credit_bani &&
          new Date(o.created_at).getTime() <= txMs
      );
      if (sameAmount.length === 1) hit = sameAmount[0];
    }

    if (hit) {
      e.matched_order_id = hit.id;
      used.add(hit.id);
      matched++;
    } else {
      unmatched++;
    }
  }

  return { clientPaymentsMatched: matched, unmatchedClientCredits: unmatched };
}
