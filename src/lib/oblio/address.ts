/**
 * Normalizare adresă client pentru Oblio → e-Factura (SPV).
 *
 * SPV respinge exportul e-Factura când datele clientului nu trec validările
 * ANAF. Cazurile prinse în producție (raport echipă 27.07.2026, facturi
 * EGH-0013 / 0028 / 0048 / 0172 + EGI2024-24312 pe CJO):
 *
 *   1. „Selecteaza un Judet valid Clientului tau."
 *      → județ gol sau text care nu e unul din cele 42 de județe.
 *   2. „Adauga Localitatea Clientului"
 *      → localitate goală.
 *   3. „Pentru ca judetul clientului este Bucuresti, modifica campul
 *       Localitate de forma Sector 1, Sector 2, etc."
 *      → la București, Localitatea TREBUIE să fie „Sector N" (județul rămâne
 *        „București").
 *   4. „Adauga Tara Clientului"
 *      → numele de țară în română („Marea Britanie") nu e recunoscut de
 *        Oblio; codurile ISO alpha-2 sunt (nomenclatorul de clienți din Oblio
 *        conține deja RO/GB/US/ES stocate corect).
 *
 * Regula de aur pentru fallback-uri: adresa se ia PE BLOC, nu pe câmp.
 * Amestecul „județ din billing + localitate din adresa KYC" a produs
 * factura EGH-0048 cu «Ditrau (Harghita)» pe județul «București».
 */

/** Cele 42 de județe (41 + București), scriere canonică cu diacritice. */
export const RO_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brăila', 'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Sălaj', 'Satu Mare',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui',
  'Vrancea',
] as const;

/**
 * Normalizare pentru comparații: fără diacritice (inclusiv cedilla legacy
 * Ş/Ţ pe care le trimite ANAF — vezi lib/company/entity-type-detection.ts),
 * lowercase, spații colapsate.
 */
export function normalizeCounty(value?: string | null): string {
  return (value || '')
    .trim()
    .replace(/[ŞŞş]/g, 'S')
    .replace(/[ŢŢţ]/g, 'T')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const COUNTY_BY_NORM = new Map(RO_COUNTIES.map((c) => [normalizeCounty(c), c]));

/**
 * Județul în scriere canonică, sau null când textul nu identifică un județ.
 * Acceptă prefixele pe care le pun OCR-ul/clienții („Jud. Cluj", „Municipiul
 * București", „Bucuresti Sector 3", „B") și scrierea fără diacritice.
 */
export function canonicalCounty(value?: string | null): string | null {
  const raw = (value || '').trim();
  if (!raw) return null;
  let n = normalizeCounty(raw)
    .replace(/^(jud|judetul|judet)\s+/, '')
    .replace(/^(mun|municipiul|oras|orasul|com|comuna|loc|localitatea|sat)\s+/, '')
    .trim();
  // Orice formă de București (cu sau fără sector) → județul București.
  if (/^bucure[s]ti\b/.test(n) || n === 'b' || /^sector(ul)?\s*[1-6]$/.test(n)) {
    return 'București';
  }
  n = n.replace(/\s+sector(ul)?\s*[1-6]$/, '').trim();
  return COUNTY_BY_NORM.get(n) ?? null;
}

/** True când județul (în orice scriere) este București. */
export function isBucharestCounty(value?: string | null): boolean {
  return canonicalCounty(value) === 'București';
}

/** Numărul sectorului găsit în text („Sector 3", „sectorul 3", „sec 3",
 *  „București, Sector 5", „S3"), sau null. */
export function extractSector(value?: string | null): number | null {
  const n = normalizeCounty(value);
  const m =
    n.match(/sector(?:ul)?\s*([1-6])\b/) ||
    n.match(/\bsec\s*([1-6])\b/) ||
    n.match(/\bs\s?([1-6])\b/);
  return m ? Number(m[1]) : null;
}

/** True când localitatea e deja în forma cerută de SPV pentru București. */
export function hasBucharestSector(city?: string | null): boolean {
  return /^sector\s*[1-6]$/i.test((city || '').trim());
}

/** Singurele valori pe care SPV le acceptă la „Localitate" când județul e
 *  București — folosite ca listă în dropdown-ul de facturare. */
export const BUCHAREST_SECTORS_BILLING = [
  'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6',
] as const as unknown as string[];

/** „Sector N" din orice text care conține un sector; null altfel. */
export function formatSector(value?: string | null): string | null {
  const nr = extractSector(value);
  return nr ? `Sector ${nr}` : null;
}

// ────────────────────────────────────────────────────────────────────────────
// Țară — denumirea pe care o acceptă Oblio
// ────────────────────────────────────────────────────────────────────────────

/**
 * Oblio NU acceptă coduri ISO pentru e-Factura: câmpul „Tara" din Oblio e o
 * listă de denumiri în română scrise FĂRĂ diacritice. Dovada e chiar
 * nomenclatorul nostru de clienți: valorile care au trecut sunt „Franta",
 * „Elvetia", „Cehia", „Olanda", „Regatul Unit (UK)" — iar „Marea Britanie"
 * (denumirea din wizard) a rămas nesetată, de unde eroarea „Adauga Tara
 * Clientului" pe EGH-0172.
 *
 * Regula: trimitem denumirea din wizard fără diacritice, cu excepțiile din
 * tabelul de mai jos, unde Oblio folosește alt nume.
 */
const OBLIO_COUNTRY_ALIASES: Record<string, string> = {
  // wizard (normalizat, fără diacritice) → denumirea Oblio
  'marea britanie': 'Regatul Unit (UK)',
  'anglia': 'Regatul Unit (UK)',
  'regatul unit': 'Regatul Unit (UK)',
  'uk': 'Regatul Unit (UK)',
  'tarile de jos': 'Olanda',
  'republica ceha': 'Cehia',
  'republica moldova': 'Moldova',
  'statele unite': 'Statele Unite ale Americii',
  'sua': 'Statele Unite ale Americii',
  'usa': 'Statele Unite ale Americii',
  'romania': 'Romania',
  'ro': 'Romania',
};

/** Diacriticele scoase, restul textului păstrat („Franța" → „Franta"). */
function stripDiacritics(value: string): string {
  return value
    .replace(/[ŞŞş]/g, 's')
    .replace(/[ŢŢţ]/g, 't')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/**
 * Denumirea de țară de trimis către Oblio. Gol → „Romania" (wizard-ul
 * tratează lipsa țării ca domestic).
 */
export function countryForOblio(value?: string | null): string {
  const raw = (value || '').trim();
  if (!raw) return 'Romania';
  const alias = OBLIO_COUNTRY_ALIASES[normalizeCounty(raw)];
  if (alias) return alias;
  return stripDiacritics(raw).replace(/\s+/g, ' ').trim();
}

/** True când țara e alta decât România (gol = România, ca în wizard). */
export function isForeignCountry(value?: string | null): boolean {
  const n = normalizeCounty(countryForOblio(value));
  return !!n && n !== 'romania';
}

// ────────────────────────────────────────────────────────────────────────────
// Rezolvarea adresei de facturare
// ────────────────────────────────────────────────────────────────────────────

export interface AddressBlock {
  street?: string;
  city?: string;
  county?: string;
  country?: string;
  /** Doar în adresele KYC — sectorul extras separat de OCR. */
  sector?: string | number;
  number?: string;
}

export interface ResolvedInvoiceAddress {
  address: string;
  city: string;
  /** Județ canonic, '-' pentru clienți străini (convenția Oblio). */
  state: string;
  /** Denumirea de țară în forma acceptată de Oblio (nume RO fără diacritice). */
  country: string;
  /** True când s-a folosit blocul de rezervă (KYC), nu cel de facturare. */
  usedFallback: boolean;
}

/** True dacă blocul are măcar un câmp de adresă completat. */
function hasAnyAddressField(b?: AddressBlock | null): boolean {
  if (!b) return false;
  return !!(b.street?.trim() || b.city?.trim() || b.county?.trim());
}

/** Bloc complet = stradă + localitate + (județ pentru RO). */
function isBlockComplete(b: AddressBlock | null | undefined, foreign: boolean): boolean {
  if (!b) return false;
  const hasStreet = !!b.street?.trim();
  const hasCity = !!b.city?.trim();
  const hasCounty = !!b.county?.trim();
  return hasStreet && hasCity && (foreign || hasCounty);
}

/**
 * Două blocuri se CONTRAZIC când amândouă au județ și nu e același — semn că
 * descriu locuri diferite (EGH-0048: facturare în București, KYC în Harghita).
 * Când unul n-are județ, completarea reciprocă e sigură.
 */
function blocksContradict(
  a: AddressBlock | null | undefined,
  b: AddressBlock | null | undefined,
): boolean {
  const ca = (a?.county || '').trim();
  const cb = (b?.county || '').trim();
  if (!ca || !cb) return false;
  return normalizeCounty(canonicalCounty(ca) ?? ca) !== normalizeCounty(canonicalCounty(cb) ?? cb);
}

/**
 * Adresa clientului pentru factură, rezolvată din blocul de facturare + cel de
 * rezervă (KYC) și normalizată pentru SPV.
 *
 * Regula de combinare:
 * - blocul de facturare complet → se folosește el;
 * - blocurile se CONTRAZIC (județe diferite) → NU se amestecă: se ia întreg
 *   blocul complet (KYC dacă facturarea e incompletă). Fără asta ieșea județ
 *   „București" din facturare + localitate „Ditrau" (Harghita) din KYC =
 *   adresă inexistentă, refuzată de SPV (EGH-0048);
 * - altfel completare câmp-cu-câmp, facturarea având prioritate — cazul
 *   frecvent și sigur: județ „Constanța" în facturare, localitatea doar în KYC
 *   (EGH-0078/0095/0152).
 *
 * Normalizări: localitatea la București devine „Sector N" (din localitate,
 * sectorul din OCR sau textul străzii); județul se scrie canonic (la client
 * străin devine '-'); țara pleacă cu denumirea din lista Oblio.
 */
export function resolveInvoiceAddress(
  billing: AddressBlock | null | undefined,
  fallback: AddressBlock | null | undefined,
): ResolvedInvoiceAddress {
  const rawCountry = (billing?.country || '').trim() || (fallback?.country || '').trim();
  const country = countryForOblio(rawCountry);
  const foreign = isForeignCountry(rawCountry);

  let block: AddressBlock;
  let usedFallback = false;
  if (isBlockComplete(billing, foreign)) {
    block = billing!;
  } else if (blocksContradict(billing, fallback)) {
    // Adrese diferite: preferă blocul care e complet, altfel rămâi pe facturare.
    if (isBlockComplete(fallback, foreign)) {
      block = fallback!;
      usedFallback = true;
    } else {
      block = billing ?? {};
    }
  } else if (hasAnyAddressField(billing) || hasAnyAddressField(fallback)) {
    // Completare câmp-cu-câmp (blocuri necontradictorii).
    block = {
      street: billing?.street?.trim() || fallback?.street?.trim(),
      number: billing?.number?.trim() || fallback?.number?.trim(),
      city: billing?.city?.trim() || fallback?.city?.trim(),
      county: billing?.county?.trim() || fallback?.county?.trim(),
      sector: billing?.sector ?? fallback?.sector,
    };
    usedFallback = !isBlockComplete(billing, foreign);
  } else {
    block = {};
  }

  const street = [block.street?.trim(), block.number?.trim()]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (foreign) {
    return {
      address: street,
      city: (block.city || '').trim(),
      // Oblio acceptă '-' ca județ pentru clienți străini.
      state: (block.county || '').trim() || '-',
      country,
      usedFallback,
    };
  }

  const county = canonicalCounty(block.county) ?? canonicalCounty(block.city) ?? '';
  let city = (block.city || '').trim();

  if (county === 'București') {
    const sector =
      formatSector(block.city) ??
      formatSector(block.sector != null ? `Sector ${block.sector}` : '') ??
      formatSector(block.county) ??
      formatSector(street);
    // Fără sector identificabil lăsăm localitatea goală: guard-ul de
    // completitudine o raportează ca lipsă, în loc să trimitem „București"
    // (pe care SPV îl refuză oricum).
    city = sector ?? '';
  }

  return { address: street, city, state: county, country, usedFallback };
}
