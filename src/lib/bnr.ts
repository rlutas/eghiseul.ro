/**
 * Cursul valutar oficial BNR — feed-ul zilnic bnr.ro/nbrfxrates.xml (referință
 * RON). Folosit de ruta /api/bnr-rate (toggle €/Lei din calculatoare) și de
 * pagina /curs-valutar. Cache 1h; degradează grațios dacă feed-ul e indisponibil.
 */

export interface BnrRate {
  currency: string;
  multiplier: number; // câte unități de valută corespund valorii (1 sau 100)
  value: number; // lei pentru `multiplier` unități
}

export interface BnrData {
  date: string | null;
  rates: BnrRate[];
  eur: number; // lei / 1 EUR (shortcut folosit de calculatoare)
}

const FALLBACK_EUR = 5.07;

export async function getBnrRates(): Promise<BnrData> {
  try {
    const res = await fetch('https://www.bnr.ro/nbrfxrates.xml', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`bnr ${res.status}`);
    const xml = await res.text();
    const date = xml.match(/<Cube date="([\d-]+)">/)?.[1] ?? null;
    const rates: BnrRate[] = [];
    const re = /<Rate currency="([A-Z]+)"(?: multiplier="(\d+)")?>([\d.]+)<\/Rate>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      rates.push({
        currency: m[1],
        multiplier: m[2] ? parseInt(m[2], 10) : 1,
        value: parseFloat(m[3]),
      });
    }
    const eur = rates.find((r) => r.currency === 'EUR')?.value ?? FALLBACK_EUR;
    return { date, rates, eur };
  } catch {
    return { date: null, rates: [], eur: FALLBACK_EUR };
  }
}

export interface BnrHistory {
  dates: string[]; // crescător (cel mai vechi → cel mai nou)
  series: Record<string, number[]>; // valoare per 1 unitate, aliniată cu `dates`
}

/** Istoricul pe 10 zile (bnr.ro/nbrfxrates10days.xml) pentru variație + grafice. */
export async function getBnrHistory(): Promise<BnrHistory> {
  try {
    const res = await fetch('https://www.bnr.ro/nbrfxrates10days.xml', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`bnr ${res.status}`);
    const xml = await res.text();
    const cubeRe = /<Cube date="([\d-]+)">([\s\S]*?)<\/Cube>/g;
    const cubes: { date: string; body: string }[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = cubeRe.exec(xml)) !== null) cubes.push({ date: cm[1], body: cm[2] });
    cubes.sort((a, b) => a.date.localeCompare(b.date));

    const dates: string[] = [];
    const series: Record<string, number[]> = {};
    for (const cube of cubes) {
      dates.push(cube.date);
      const rateRe = /<Rate currency="([A-Z]+)"(?: multiplier="(\d+)")?>([\d.]+)<\/Rate>/g;
      let rm: RegExpExecArray | null;
      while ((rm = rateRe.exec(cube.body)) !== null) {
        const mult = rm[2] ? parseInt(rm[2], 10) : 1;
        (series[rm[1]] ??= []).push(parseFloat(rm[3]) / mult);
      }
    }
    return { dates, series };
  } catch {
    return { dates: [], series: {} };
  }
}

/** Denumiri RO pentru valutele publicate de BNR (fallback = codul). */
export const CURRENCY_NAMES: Record<string, string> = {
  AED: 'Dirham UAE',
  AUD: 'Dolar australian',
  BGN: 'Leva bulgărească',
  BRL: 'Real brazilian',
  CAD: 'Dolar canadian',
  CHF: 'Franc elvețian',
  CNY: 'Yuan chinezesc',
  CZK: 'Coroană cehă',
  DKK: 'Coroană daneză',
  EGP: 'Liră egipteană',
  EUR: 'Euro',
  GBP: 'Liră sterlină',
  HUF: 'Forint maghiar',
  INR: 'Rupie indiană',
  JPY: 'Yen japonez',
  KRW: 'Won sud-coreean',
  MDL: 'Leu moldovenesc',
  MXN: 'Peso mexican',
  NOK: 'Coroană norvegiană',
  NZD: 'Dolar neozeelandez',
  PLN: 'Zlot polonez',
  RSD: 'Dinar sârbesc',
  RUB: 'Rublă rusească',
  SEK: 'Coroană suedeză',
  THB: 'Baht thailandez',
  TRY: 'Liră turcească',
  UAH: 'Hrivnă ucraineană',
  USD: 'Dolar american',
  XAU: 'Aur (gram)',
  ZAR: 'Rand sud-african',
};
