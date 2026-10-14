/**
 * Facturi de furnizor care NU vin prin SPV (Meta, Google, TikTok, OpenAI,
 * Anthropic, Vercel…): trebuie descărcate din contul furnizorului, listate și
 * predate contabilului. Lista de furnizori se calculează LA CITIRE din
 * descrierea liniei de extras, deci extrasele importate înainte de 14.10.2026
 * intră în checklist fără reimport.
 *
 * De ce nu ajunge `needs_invoice` din import: regula veche prindea doar plățile
 * POS în valută. Meta, Google Ads și TikTok taxează în RON, așa că zeci de
 * plăți pe lună au căzut pe „altele" și facturile n-au mai ajuns la contabil.
 */

export interface SupplierRule {
  key: string;
  label: string;
  /** Unde găsește echipa facturile — afișat ca indiciu în checklist. */
  where: string;
  test: RegExp;
}

/** Prima regulă care se potrivește câștigă. Extinde când apare furnizor nou. */
export const SUPPLIER_RULES: SupplierRule[] = [
  { key: 'meta', label: 'Meta (Facebook/Instagram Ads)', where: 'Meta Business → Facturare și plăți → Tranzacții', test: /FACEBK|META PLATFORMS|FACEBOOK/i },
  { key: 'google_ads', label: 'Google Ads', where: 'Google Ads → Facturare → Documente', test: /GOOGLE\s*\*\s*ADS/i },
  { key: 'google_cloud', label: 'Google Cloud / Workspace', where: 'console.cloud.google.com → Billing → Documents', test: /GOOGLE\s*\*\s*(CLOUD|GSUITE|WORKSPACE)/i },
  { key: 'tiktok', label: 'TikTok Ads', where: 'TikTok Ads Manager → Plăți → Facturi', test: /TIKTOK/i },
  { key: 'openai', label: 'OpenAI (ChatGPT / API)', where: 'platform.openai.com → Billing / chatgpt.com → Setări → Abonament', test: /OPENAI/i },
  { key: 'anthropic', label: 'Anthropic (Claude)', where: 'claude.ai → Setări → Facturare / console.anthropic.com', test: /ANTHROPIC/i },
  { key: 'vercel', label: 'Vercel', where: 'vercel.com → Settings → Billing → Invoices', test: /VERCEL/i },
  { key: 'supabase', label: 'Supabase', where: 'supabase.com → Organization → Billing → Invoices', test: /SUPABASE/i },
  { key: 'railway', label: 'Railway', where: 'railway.com → Account → Billing', test: /RAILWAY/i },
  { key: 'resend', label: 'Resend', where: 'resend.com → Settings → Billing', test: /RESEND/i },
  { key: 'zoho', label: 'Zoho', where: 'Zoho → Subscriptions → Invoices', test: /ZOHO/i },
  { key: 'amazon', label: 'Amazon', where: 'Amazon Business → Comenzi → Factură', test: /AMAZON|AMZN/i },
];

/** Numele comerciantului dintr-o linie POS BT (`... TID:XXXX NUME  +1415...`). */
export function posMerchant(desc: string): string | null {
  const m = desc.match(/TID:\S+\s+(.+?)\s{2,}/) ?? desc.match(/TID:\S+\s+(.+?)\s+(?:\+?\d|[A-Z]{2}\s+\d)/);
  return m ? m[1].trim().slice(0, 60) : null;
}

const FOREIGN_POS = /valoare tranzactie: [\d.]+ (USD|EUR|GBP)/i;

/**
 * Furnizorul pentru care trebuie adusă factura, sau null când linia nu cere
 * factură descărcată manual (salarii, ANAF, furnizori români din SPV…).
 * Doar debite: o încasare nu are factură de furnizor.
 */
export function supplierFor(
  e: { description: string | null; debit_bani: number; needs_invoice?: boolean }
): { key: string; label: string; where: string | null } | null {
  if (!e.debit_bani || e.debit_bani <= 0) return null;
  const d = e.description ?? '';
  const rule = SUPPLIER_RULES.find((r) => r.test.test(d));
  if (rule) return { key: rule.key, label: rule.label, where: rule.where };
  // Plată POS în valută la un comerciant necunoscut: tot fără SPV.
  if (FOREIGN_POS.test(d) || e.needs_invoice) {
    const name = posMerchant(d) ?? 'Furnizor extern';
    return { key: `pos:${name.toUpperCase().replace(/\s+/g, ' ')}`, label: name, where: null };
  }
  return null;
}

export interface SupplierGroup {
  key: string;
  label: string;
  where: string | null;
  count: number;
  total_bani: number;
  payments: Array<{ reference: string; tx_date: string; debit_bani: number; description: string | null }>;
}

/** Grupează liniile unei luni pe furnizor, cele mai mari sume primele. */
export function groupBySupplier(
  entries: Array<{ reference: string; tx_date: string; description: string | null; debit_bani: number; needs_invoice?: boolean }>
): SupplierGroup[] {
  const groups = new Map<string, SupplierGroup>();
  for (const e of entries) {
    const s = supplierFor(e);
    if (!s) continue;
    const g = groups.get(s.key) ?? { ...s, count: 0, total_bani: 0, payments: [] };
    g.count++;
    g.total_bani += e.debit_bani;
    g.payments.push({ reference: e.reference, tx_date: e.tx_date, debit_bani: e.debit_bani, description: e.description });
    groups.set(s.key, g);
  }
  return [...groups.values()].sort((a, b) => b.total_bani - a.total_bani);
}

export const CHECK_STEPS = ['downloaded', 'printed', 'handed'] as const;
export type CheckStep = (typeof CHECK_STEPS)[number];
