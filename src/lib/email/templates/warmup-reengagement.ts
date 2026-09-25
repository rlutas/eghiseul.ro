/**
 * Warm-up re-engagement email — sent by /api/cron/warmup-campaign, o singură
 * dată per contact, la un contact din registrul intern (clienți ai platformei
 * și lead-uri WPForms de pe eghiseul.ro vechi).
 *
 * Scop: reactivare. Emailul spune pe nume ce a obținut omul prin noi
 * („certificat constatator și extras de carte funciară") și îl trimite direct
 * în formularul acelui serviciu. Clienții fideli (2+ servicii/comenzi) primesc
 * și un cupon de 10% (decizie Raul 2026-09-25), aplicat singur din buton;
 * restul primesc emailul fără reducere (cercetare: reducerea nu e prima armă
 * la o listă rece). Link de dezabonare vizibil — e email de marketing.
 */

import { brandedEmailHtml, ctaButton } from './branded-layout';
import { withUtm } from '../utm';

const BASE_URL = 'https://eghiseul.ro';

// Slug-uri reale din `contacts.services` (interogat 2026-09-14/25). Fiecare
// cheie e și un serviciu activ cu formular la `/comanda/<slug>/`.
const SERVICE_LABELS: Record<string, string> = {
  'cazier-judiciar': 'cazier judiciar',
  'cazier-judiciar-persoana-fizica': 'cazier judiciar',
  'cazier-judiciar-persoana-juridica': 'cazier judiciar pentru firmă',
  'extras-carte-funciara': 'extras de carte funciară',
  'certificat-nastere': 'certificat de naștere',
  'certificat-casatorie': 'certificat de căsătorie',
  'certificat-celibat': 'certificat de celibat',
  'extras-multilingv-certificat-nastere': 'extras multilingv de naștere',
  'extras-multilingv-certificat-casatorie': 'extras multilingv de căsătorie',
  'certificat-constatator': 'certificat constatator',
  'certificat-integritate': 'certificat de integritate comportamentală',
  'cazier-fiscal': 'cazier fiscal',
  'cazier-auto': 'cazier auto',
  'identificare-imobil': 'identificare imobil',
  'identificare-imobile-proprietar': 'identificare imobile după proprietar',
  'extras-plan-cadastral': 'extras de plan cadastral',
  'plan-amplasament-delimitare': 'plan de amplasament și delimitare',
  'copie-carte-funciara': 'copie de carte funciară',
  'copie-inventar-coordonate': 'inventar de coordonate',
};

export interface WarmupCoupon {
  code: string;
  discountPercent: number;
  validUntil: string;
}

export interface WarmupEmailInput {
  firstName?: string | null;
  /** Slug-urile din `contacts.services`, în ordinea din registru. */
  serviceSlugs?: string[] | null;
  /** A plătit cel puțin o comandă pe platforma nouă (`contacts.is_customer`). */
  isCustomer?: boolean;
  /** Doar pentru clienții fideli. */
  coupon?: WarmupCoupon | null;
  unsubscribeUrl: string;
}

/** Etichete unice, în ordine („cazier judiciar" apare o dată chiar dacă vine din două slug-uri). */
export function serviceLabels(slugs: string[] | null | undefined): string[] {
  const out: string[] = [];
  for (const slug of slugs ?? []) {
    const label = SERVICE_LABELS[slug] ?? slug.replace(/-/g, ' ');
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

/** „A", „A și B", „A, B și C". */
function joinRo(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} și ${items[items.length - 1]}`;
}

/** Primul serviciu cunoscut → formularul lui (cu cuponul în URL, aplicat singur la pasul de plată); altfel lista de servicii. */
export function warmupCtaUrl(input: Pick<WarmupEmailInput, 'serviceSlugs' | 'coupon'>): string {
  const slug = (input.serviceSlugs ?? []).find((s) => s in SERVICE_LABELS);
  const url = new URL(slug ? `${BASE_URL}/comanda/${slug}/` : `${BASE_URL}/servicii/`);
  if (slug && input.coupon) url.searchParams.set('coupon', input.coupon.code);
  return withUtm(url.toString(), 'warmup', input.coupon ? 'warmup-fidel' : 'warmup');
}

function ctaLabel(input: WarmupEmailInput): string {
  const slug = (input.serviceSlugs ?? []).find((s) => s in SERVICE_LABELS);
  return slug ? `Comandă ${SERVICE_LABELS[slug]}` : 'Vezi serviciile disponibile';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
}

function historyLine(input: WarmupEmailInput): string | null {
  const labels = serviceLabels(input.serviceSlugs);
  if (labels.length === 0) return null;
  const verb = input.isCustomer ? 'Ai obținut prin noi' : 'Ai apelat la noi pentru';
  return `${verb} ${joinRo(labels)}.`;
}

export function buildWarmupSubject(input: WarmupEmailInput): string {
  const name = input.firstName?.trim();
  if (input.coupon) {
    const base = `ai ${input.coupon.discountPercent}% reducere pentru că ne-ai ales de mai multe ori`;
    return name ? `${name}, ${base}` : base.charAt(0).toUpperCase() + base.slice(1);
  }
  return name ? `${name}, eGhișeul.ro s-a schimbat de când ne-ai scris` : 'eGhișeul.ro s-a schimbat de când ne-ai scris';
}

export function buildWarmupHtml(input: WarmupEmailInput): string {
  const greeting = input.firstName ? `Salut ${escapeHtml(input.firstName)},` : 'Salut,';
  const labels = serviceLabels(input.serviceSlugs);
  const history = labels.length
    ? `${input.isCustomer ? 'Ai obținut prin noi' : 'Ai apelat la noi pentru'} ${joinRo(labels.map((l) => `<strong>${escapeHtml(l)}</strong>`))}.`
    : 'Ai fost în contact cu noi.';
  const thanks = input.coupon ? ' Mulțumim că ne-ai ales de mai multe ori.' : ' De atunci am rescris toată platforma.';
  const couponBlock = input.coupon
    ? `<div style="margin:0 0 16px;padding:14px 16px;border:1px dashed #0B1B33;border-radius:8px;background:#F8FAFC;">
          <p style="margin:0 0 6px;color:#0B1B33;font-size:14px;line-height:1.5;">Ca mulțumire, ai <strong>${input.coupon.discountPercent}% reducere</strong> la următoarea comandă:</p>
          <p style="margin:0 0 6px;font-family:monospace;font-size:20px;font-weight:bold;letter-spacing:1px;color:#0B1B33;">${escapeHtml(input.coupon.code)}</p>
          <p style="margin:0;color:#64748b;font-size:12px;line-height:1.5;">Valabil până la ${formatDate(input.coupon.validUntil)}, o singură folosire, pe orice serviciu. Din butonul de mai jos se aplică singur.</p>
        </div>`
    : '';
  return brandedEmailHtml({
    preheader: input.coupon
      ? `${input.coupon.discountPercent}% reducere la următoarea comandă, pentru că ne-ai ales de mai multe ori.`
      : 'Am rescris platforma — comenzi online, plată directă, curier până la ușă.',
    content: `
        <h1 style="margin:0 0 12px;color:#0B1B33;font-size:20px;">${greeting}</h1>
        <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">${history}${thanks}</p>
        ${couponBlock}
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Comanzi online în câteva minute, plătești cu cardul și primești actul prin curier sau pe email, fără drumuri la ghișeu. Obținem pentru tine cazier judiciar, extras de carte funciară, certificat constatator, certificate de stare civilă și altele.</p>
        ${ctaButton(ctaLabel(input), warmupCtaUrl(input))}
        <p style="margin:12px 0 0;font-size:13px;color:#475569;line-height:1.6;">Sau <a href="${escapeAttr(withUtm(`${BASE_URL}/servicii/`, 'warmup', input.coupon ? 'warmup-fidel' : 'warmup'))}" style="color:#0B1B33;">vezi toate serviciile</a>${input.coupon ? ' și introdu codul la pasul de plată' : ''}.</p>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">Primești acest email pentru că ai fost în contact cu eGhișeul.ro. Dacă nu te mai interesează, te poți dezabona oricând — <a href="${escapeAttr(input.unsubscribeUrl)}" style="color:#0B1B33;">un singur click</a>.</p>`,
  });
}

export function buildWarmupText(input: WarmupEmailInput): string {
  const greeting = input.firstName ? `Salut ${input.firstName},` : 'Salut,';
  const history = historyLine(input) ?? 'Ai fost în contact cu noi.';
  const lines = [greeting, '', `${history}${input.coupon ? ' Mulțumim că ne-ai ales de mai multe ori.' : ' De atunci am rescris toată platforma.'}`, ''];
  if (input.coupon) {
    lines.push(
      `Ca mulțumire, ai ${input.coupon.discountPercent}% reducere la următoarea comandă: ${input.coupon.code}`,
      `Valabil până la ${formatDate(input.coupon.validUntil)}, o singură folosire, pe orice serviciu.`,
      '',
    );
  }
  lines.push(
    'Comanzi online în câteva minute, plătești cu cardul și primești actul prin curier sau pe email, fără drumuri la ghișeu.',
    '',
    `${ctaLabel(input)}: ${warmupCtaUrl(input)}`,
    '',
    `Dezabonare: ${input.unsubscribeUrl}`,
    '',
    '— Echipa eGhișeul.ro',
  );
  return lines.join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
