/**
 * Regulile emailurilor de lifecycle post-comandă (cron `lifecycle-emails`):
 * valabilitatea legală a documentelor (reminder de expirare), harta de
 * cross-sell (ce alt document are sens după cel cumpărat) și „a mers în
 * termen" (cine primește cererea de recenzie).
 *
 * Pure functions — testate în tests/unit/lib/lifecycle/rules.test.ts.
 */

/**
 * Valabilitatea documentelor, în zile calendaristice, de la data finalizării
 * comenzii (proxy pentru data emiterii — instituția emite cu 1-3 zile înainte
 * ca noi să marcăm „finalizată", deci reminderul cade cu câteva zile mai
 * devreme, niciodată mai târziu).
 *
 *   cazier judiciar      6 luni   Legea 290/2004, art. 27
 *   certificat integritate 6 luni Legea 118/2019, art. 21
 *   cazier fiscal        30 zile  OG 39/2015, art. 11
 *   certificat constatator 30 zile uzanță ONRC / cerință licitații și bănci
 *   cazier auto          30 zile  cerință DRPCIV / angajatori
 *
 * Extrasul CF nu are termen legal (cerut „recent" de notari/bănci) și e de
 * regulă cumpărat pentru o singură tranzacție — NU primește reminder, doar
 * cross-sell. Certificatele de stare civilă nu expiră.
 */
export const DOCUMENT_VALIDITY_DAYS: Record<string, number> = {
  'cazier-judiciar': 180,
  'cazier-judiciar-persoana-fizica': 180,
  'cazier-judiciar-persoana-juridica': 180,
  'certificat-integritate': 180,
  'cazier-fiscal': 30,
  'certificat-constatator': 30,
  'cazier-auto': 30,
};

/** Reminderul pleacă în fereastra [expirare − 14 zile, expirare + 30 zile]. */
export const EXPIRY_LEAD_DAYS = 14;
export const EXPIRY_GRACE_DAYS = 30;

export function expiryDate(completedAt: Date, slug: string): Date | null {
  const days = DOCUMENT_VALIDITY_DAYS[slug];
  if (!days) return null;
  return new Date(completedAt.getTime() + days * 86_400_000);
}

/** True dacă azi cade în fereastra de reminder pentru documentul acesta. */
export function isInExpiryWindow(completedAt: Date, slug: string, now = new Date()): boolean {
  const exp = expiryDate(completedAt, slug);
  if (!exp) return false;
  const start = exp.getTime() - EXPIRY_LEAD_DAYS * 86_400_000;
  const end = exp.getTime() + EXPIRY_GRACE_DAYS * 86_400_000;
  return now.getTime() >= start && now.getTime() <= end;
}

/**
 * Cross-sell: ce alte documente au sens după cel cumpărat. Ordinea contează
 * (primele două intră în email). Doar slug-uri active în catalog — cronul
 * ignoră ce nu găsește în `services`.
 */
export const CROSS_SELL_MAP: Record<string, string[]> = {
  'cazier-judiciar': ['certificat-integritate', 'cazier-fiscal', 'cazier-auto'],
  'cazier-judiciar-persoana-fizica': ['certificat-integritate', 'cazier-fiscal', 'cazier-auto'],
  'cazier-judiciar-persoana-juridica': ['certificat-constatator', 'cazier-fiscal'],
  'certificat-integritate': ['cazier-judiciar-persoana-fizica', 'cazier-fiscal'],
  'cazier-fiscal': ['cazier-judiciar-persoana-fizica', 'certificat-constatator'],
  'cazier-auto': ['cazier-judiciar-persoana-fizica', 'rovinieta'],
  'certificat-constatator': ['cazier-fiscal', 'cazier-judiciar-persoana-juridica'],
  'extras-carte-funciara': ['extras-plan-cadastral', 'certificat-sarcini', 'copie-carte-funciara'],
  'extras-cf-colectiv': ['extras-carte-funciara', 'extras-plan-cadastral'],
  'extras-plan-cadastral': ['extras-carte-funciara', 'copie-plan-cadastral'],
  'identificare-imobil': ['extras-carte-funciara', 'extras-plan-cadastral'],
  'identificare-imobile-proprietar': ['extras-carte-funciara', 'certificat-detineri-imobile'],
  'certificat-nastere': ['extras-multilingv-certificat-nastere', 'certificat-casatorie'],
  'certificat-casatorie': ['extras-multilingv-certificat-casatorie', 'certificat-nastere'],
  'certificat-celibat': ['certificat-nastere', 'extras-multilingv-certificat-nastere'],
  'extras-multilingv-certificat-nastere': ['extras-multilingv-certificat-casatorie', 'certificat-celibat'],
  'extras-multilingv-certificat-casatorie': ['extras-multilingv-certificat-nastere', 'certificat-nastere'],
};

/** Cross-sell pleacă la 30–60 de zile după finalizare; o dată per client la 180 de zile. */
export const CROSS_SELL_MIN_DAYS = 30;
export const CROSS_SELL_MAX_DAYS = 60;
export const CROSS_SELL_COOLDOWN_DAYS = 180;

/** Cererea de recenzie pleacă la 3–10 zile după finalizare. */
export const REVIEW_MIN_DAYS = 3;
export const REVIEW_MAX_DAYS = 10;

/** Evenimente din `order_history` care înseamnă „n-a mers ca pe roate". */
export const NEGATIVE_HISTORY_EVENTS = new Set([
  'standby_started',
  'reupload_requested',
  'cancellation_requested',
  'cancelled',
  'refunded',
  'kyc_rejected',
  'document_generation_failed',
]);

/**
 * Din „3-5 zile lucrătoare" / „15 zile lucrătoare" scoate limita superioară și
 * o transformă în zile calendaristice (×7/5, +1 zi de curier). Fallback: null.
 */
export function promisedCalendarDays(estimatedDaysDisplay: string | null | undefined): number | null {
  if (!estimatedDaysDisplay) return null;
  const numbers = estimatedDaysDisplay.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  const upper = Math.max(...numbers.map(Number));
  if (!Number.isFinite(upper) || upper <= 0) return null;
  const business = /lucr/i.test(estimatedDaysDisplay);
  return business ? Math.ceil((upper * 7) / 5) + 1 : upper + 1;
}

export interface OnTimeInput {
  paidAt: Date | null;
  completedAt: Date;
  estimatedCompletionDate: Date | null;
  estimatedDaysDisplay: string | null;
  hadNegativeEvent: boolean;
}

/**
 * „A mers totul super în termen": nicio pauză/reîncărcare/anulare ȘI
 * finalizată până la termenul estimat (când există) sau în limita promisă pe
 * pagina serviciului (când nu există). Fără nicio referință de termen → false
 * (nu cerem recenzie pe ghicite).
 */
export function wasOnTime(input: OnTimeInput): boolean {
  if (input.hadNegativeEvent) return false;
  const done = startOfDay(input.completedAt);
  if (input.estimatedCompletionDate) {
    return done <= startOfDay(input.estimatedCompletionDate);
  }
  const promised = promisedCalendarDays(input.estimatedDaysDisplay);
  if (!promised || !input.paidAt) return false;
  const deadline = new Date(startOfDay(input.paidAt).getTime() + promised * 86_400_000);
  return done <= deadline;
}

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function formatRoDate(d: Date): string {
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Bucharest' });
}
