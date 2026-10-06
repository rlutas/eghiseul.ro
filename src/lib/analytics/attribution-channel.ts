/**
 * Canalul care a adus o comandă, din atribuirea capturată în browser
 * (`orders.attribution`, vezi `./attribution`).
 *
 * Funcție pură, fără I/O: rulează la crearea draftului (server) și la citire
 * (KPI, admin), ca să clasifice și comenzile vechi la fel. Același fișier e
 * copiat în repo-ul cazierjudiciaronline.com: dacă îl schimbi aici, copiază-l.
 *
 * Model: ultima atingere cu sursă reală. `last` dacă are sursă, altfel
 * `first`, altfel direct. Un client care revine direct după ce a venit din
 * Google rămâne pe Google.
 */

export type Channel =
  | 'google_ads'
  | 'microsoft_ads'
  | 'meta_ads'
  | 'tiktok_ads'
  | 'chatgpt_ads'
  | 'email'
  | 'organic_search'
  | 'ai_assistant'
  | 'social'
  | 'network'
  | 'referral'
  | 'direct';

export const CHANNEL_LABEL: Record<Channel, string> = {
  google_ads: 'Google Ads',
  microsoft_ads: 'Microsoft Ads',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok Ads',
  chatgpt_ads: 'ChatGPT Ads',
  email: 'Email',
  organic_search: 'Căutare organică',
  ai_assistant: 'Asistent AI',
  social: 'Social',
  network: 'Site-urile noastre',
  referral: 'Alt site',
  direct: 'Direct / necunoscut',
};

/** Câmpurile unei atingeri; tolerant la forme vechi și la câmpuri lipsă. */
export interface TouchLike {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  click_id?: string | null;
  click_platform?: string | null;
  oppref?: string | null;
  referrer?: string | null;
}

export interface AttributionLike {
  first?: TouchLike | null;
  last?: TouchLike | null;
}

export interface ChannelResult {
  channel: Channel;
  /** Motorul / platforma / campania: google, bing, chatgpt, facebook, warmup… */
  source: string;
}

const PAID_MEDIUMS = new Set(['cpc', 'ppc', 'paid', 'paidsearch', 'paid_search', 'paid-search', 'paidsocial', 'paid_social', 'paid-social', 'cpm', 'display', 'ads']);
const EMAIL_MEDIUMS = new Set(['email', 'e-mail', 'newsletter', 'lifecycle', 'warmup', 'recovery', 'campaign']);

/** Hosturi → [canal, sursă]. Se potrivește pe sufix (`m.facebook.com` → facebook). */
const SEARCH_ENGINES: Array<[RegExp, string]> = [
  [/(^|\.)google\.[a-z.]+$/, 'google'],
  [/^com\.google\.android\.googlequicksearchbox$/, 'google'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo'],
  [/(^|\.)search\.yahoo\.com$/, 'yahoo'],
  [/(^|\.)yahoo\.com$/, 'yahoo'],
  [/(^|\.)yandex\.[a-z.]+$/, 'yandex'],
  [/(^|\.)ecosia\.org$/, 'ecosia'],
  [/(^|\.)search\.brave\.com$/, 'brave'],
  [/(^|\.)qwant\.com$/, 'qwant'],
  [/(^|\.)startpage\.com$/, 'startpage'],
];

const AI_ASSISTANTS: Array<[RegExp, string]> = [
  [/(^|\.)chatgpt\.com$/, 'chatgpt'],
  [/(^|\.)chat\.openai\.com$/, 'chatgpt'],
  [/(^|\.)openai\.com$/, 'chatgpt'],
  [/(^|\.)perplexity\.ai$/, 'perplexity'],
  [/(^|\.)copilot\.microsoft\.com$/, 'copilot'],
  [/(^|\.)gemini\.google\.com$/, 'gemini'],
  [/(^|\.)bard\.google\.com$/, 'gemini'],
  [/(^|\.)claude\.ai$/, 'claude'],
  [/(^|\.)you\.com$/, 'you'],
  [/(^|\.)deepseek\.com$/, 'deepseek'],
  [/(^|\.)mistral\.ai$/, 'mistral'],
  [/(^|\.)meta\.ai$/, 'meta_ai'],
  [/(^|\.)grok\.com$/, 'grok'],
];

const SOCIAL: Array<[RegExp, string]> = [
  [/(^|\.)facebook\.com$/, 'facebook'],
  [/(^|\.)fb\.com$/, 'facebook'],
  [/(^|\.)messenger\.com$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)t\.co$/, 'x'],
  [/(^|\.)x\.com$/, 'x'],
  [/(^|\.)twitter\.com$/, 'x'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)lnkd\.in$/, 'linkedin'],
  [/(^|\.)whatsapp\.com$/, 'whatsapp'],
  [/(^|\.)wa\.me$/, 'whatsapp'],
  [/(^|\.)youtube\.com$/, 'youtube'],
  [/(^|\.)reddit\.com$/, 'reddit'],
  [/(^|\.)pinterest\.[a-z.]+$/, 'pinterest'],
  [/(^|\.)telegram\.org$/, 'telegram'],
  [/^org\.telegram\.messenger$/, 'telegram'],
];

/** Aplicații / webmail: referrerul e clientul de email, nu un site. */
const EMAIL_HOSTS: Array<[RegExp, string]> = [
  [/^com\.google\.android\.gm$/, 'gmail'],
  [/(^|\.)mail\.google\.com$/, 'gmail'],
  [/(^|\.)mail\.yahoo\.com$/, 'yahoo_mail'],
  [/(^|\.)outlook\.(live|office|office365)\.com$/, 'outlook'],
  [/(^|\.)mail\.zoho\.[a-z.]+$/, 'zoho'],
];

/** Site-urile noastre: un link între ele nu e un canal extern. */
const NETWORK: Array<[RegExp, string]> = [
  [/(^|\.)eghiseul\.ro$/, 'eghiseul'],
  [/(^|\.)documentero\.ro$/, 'documentero'],
  [/(^|\.)ecazier\.ro$/, 'ecazier'],
  [/(^|\.)cazierjudiciaronline\.com$/, 'cazierjudiciaronline'],
  [/(^|\.)avocat-tarta\.ro$/, 'avocat-tarta'],
];

/**
 * Hosturi care NU sunt o sursă: întoarcerea de la plată sau de la un
 * furnizor. Le tratăm ca navigare internă (fără referrer).
 */
const IGNORED_REFERRERS: RegExp[] = [
  /(^|\.)stripe\.com$/,
  /(^|\.)oblio\.eu$/,
  /(^|\.)paypal\.com$/,
  /(^|\.)revolut\.com$/,
  /(^|\.)3dsecure\./,
  /(^|\.)acs\./,
];

export function isIgnoredReferrer(referrer: string | null | undefined): boolean {
  const host = referrerHost(referrer);
  return !!host && IGNORED_REFERRERS.some((re) => re.test(host));
}

/** Hostul din referrer, inclusiv `android-app://pachet` → `pachet`. */
export function referrerHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  const r = referrer.trim().toLowerCase();
  const app = /^android-app:\/\/([^/?#]+)/.exec(r);
  if (app) return app[1];
  try {
    return new URL(r).hostname.replace(/^www\./, '');
  } catch {
    const m = /^(?:[a-z]+:\/\/)?([^/?#]+)/.exec(r);
    return m ? m[1].replace(/^www\./, '') : null;
  }
}

function matchHost(host: string, table: Array<[RegExp, string]>): string | null {
  for (const [re, name] of table) if (re.test(host)) return name;
  return null;
}

const norm = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();

/** Clasifică o singură atingere. `null` = atingerea n-are nicio sursă. */
export function classifyTouch(t: TouchLike | null | undefined): ChannelResult | null {
  if (!t) return null;
  const src = norm(t.utm_source);
  const med = norm(t.utm_medium);
  const camp = norm(t.utm_campaign);
  const click = norm(t.click_platform);

  // 1. Email-urile noastre (UTM pus de noi) au prioritate: un link din email
  //    deschis în Gmail are și referrer de Gmail.
  if (EMAIL_MEDIUMS.has(med) || src === 'email' || src === 'newsletter') {
    return { channel: 'email', source: camp || med || src || 'email' };
  }

  // 2. ChatGPT Ads: `oppref` îl pune doar OpenAI pe click-urile plătite.
  if (t.oppref || ((src === 'chatgpt' || src === 'openai') && PAID_MEDIUMS.has(med))) {
    return { channel: 'chatgpt_ads', source: 'chatgpt' };
  }

  // 3. Click ID-uri de platformă.
  if (click === 'google') return { channel: 'google_ads', source: 'google' };
  if (click === 'microsoft') return { channel: 'microsoft_ads', source: 'bing' };
  if (click === 'tiktok') return { channel: PAID_MEDIUMS.has(med) ? 'tiktok_ads' : 'social', source: 'tiktok' };

  // 4. UTM plătit fără click ID (auto-tagging oprit, sitelinkuri cu UTM manual).
  if (PAID_MEDIUMS.has(med)) {
    if (/google|adwords/.test(src)) return { channel: 'google_ads', source: 'google' };
    if (/bing|microsoft/.test(src)) return { channel: 'microsoft_ads', source: 'bing' };
    if (/facebook|meta|instagram|^fb$|^ig$/.test(src)) return { channel: 'meta_ads', source: src || 'meta' };
    if (/tiktok/.test(src)) return { channel: 'tiktok_ads', source: 'tiktok' };
  }

  // fbclid: Facebook îl pune și pe linkurile organice partajate. Fără medium
  // plătit e social, nu reclamă.
  if (click === 'meta') return { channel: 'social', source: 'facebook' };
  if (click === 'linkedin') return { channel: 'social', source: 'linkedin' };

  // 5. UTM fără medium plătit: unele platforme își pun singure sursa
  //    (ChatGPT adaugă `utm_source=chatgpt.com` pe citările organice).
  if (src) {
    const host = src.replace(/^www\./, '');
    const ai = matchHost(host, AI_ASSISTANTS) ?? (/^(chatgpt|perplexity|copilot|gemini|claude)$/.test(src) ? src : null);
    if (ai) return { channel: 'ai_assistant', source: ai };
    const social = matchHost(host, SOCIAL) ?? (/^(facebook|fb|instagram|ig|tiktok|linkedin|whatsapp|x|twitter|youtube|yt|reddit|pinterest|telegram)$/.test(src) ? src.replace(/^fb$/, 'facebook').replace(/^ig$/, 'instagram').replace(/^twitter$/, 'x').replace(/^yt$/, 'youtube') : null);
    if (social) return { channel: 'social', source: social };
    const engine = matchHost(host, SEARCH_ENGINES) ?? (/^(google|bing)$/.test(src) ? src : null);
    if (engine) return { channel: 'organic_search', source: engine };
    const net = matchHost(host, NETWORK);
    if (net) return { channel: 'network', source: net };
    return { channel: 'referral', source: src };
  }

  // 6. Referrer.
  const host = referrerHost(t.referrer);
  if (host && !IGNORED_REFERRERS.some((re) => re.test(host))) {
    // Email și AI înaintea motoarelor: com.google.android.gm (Gmail) și
    // gemini.google.com s-ar potrivi altfel cu google.*.
    const mail = matchHost(host, EMAIL_HOSTS);
    if (mail) return { channel: 'email', source: mail };
    const ai = matchHost(host, AI_ASSISTANTS);
    if (ai) return { channel: 'ai_assistant', source: ai };
    const engine = matchHost(host, SEARCH_ENGINES);
    if (engine) return { channel: 'organic_search', source: engine };
    const social = matchHost(host, SOCIAL);
    if (social) return { channel: 'social', source: social };
    const net = matchHost(host, NETWORK);
    if (net) return { channel: 'network', source: net };
    return { channel: 'referral', source: host };
  }

  return null;
}

/** Canalul comenzii: ultima atingere cu sursă (`last`, apoi `first`), altfel direct. */
export function classifyAttribution(a: AttributionLike | null | undefined): ChannelResult {
  return classifyTouch(a?.last) ?? classifyTouch(a?.first) ?? { channel: 'direct', source: 'direct' };
}
