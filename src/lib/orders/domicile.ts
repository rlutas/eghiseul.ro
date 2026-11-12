/**
 * Where the client is domiciled, for contracts and the other generated documents.
 *
 * The wizard only offered a Romanian address (county + locality lists). A
 * Romanian citizen whose passport states a domicile abroad had nothing to
 * pick, typed a placeholder („-", București) and the contract printed it
 * (E-261112-7A93Y, 12.11.2026). `personal.domicileAbroad` holds the country and
 * the address as free text; when present it wins over the Romanian fields.
 *
 * Foreign citizens have their own fields (`personal.foreignData.foreignAddress`
 * + `domicileCountry`); the same rule applies when they have no Romanian domicile.
 */

export interface DomicileAbroad {
  country: string;
  address: string;
}

export interface DomicileParts {
  county?: string;
  city?: string;
  sector?: string;
  street?: string;
  number?: string;
  building?: string;
  staircase?: string;
  floor?: string;
  apartment?: string;
  postalCode?: string;
}

export interface Domicile {
  abroad: boolean;
  /** One line, ready to print after „cu domiciliul în". Empty when nothing was given. */
  text: string;
  /** Romanian structured address. Undefined for a domicile abroad. */
  parts?: DomicileParts;
}

/** The domicile abroad as typed by the client, or null when it is not (fully) given. */
export function domicileAbroadOf(personal: unknown): DomicileAbroad | null {
  const raw = (personal as { domicileAbroad?: Partial<DomicileAbroad> | null } | null | undefined)?.domicileAbroad;
  if (!raw || typeof raw !== 'object') return null;
  const country = typeof raw.country === 'string' ? raw.country.trim() : '';
  const address = typeof raw.address === 'string' ? raw.address.trim() : '';
  if (!country && !address) return null;
  return { country, address };
}

/** „Stradă 1, Mijas, Spania" — the country is not repeated when the client already typed it. */
export function formatDomicileAbroad(domicile: DomicileAbroad): string {
  const { address, country } = domicile;
  if (!address) return country;
  if (!country) return address;
  return address.toLowerCase().includes(country.toLowerCase()) ? address : `${address}, ${country}`;
}

/** A Romanian `AddressState` (or a plain string) as one line. */
export function formatRomanianAddress(address: unknown): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  if (typeof address !== 'object') return '';

  const a = address as Record<string, string>;
  const parts: string[] = [];
  if (a.street) parts.push(`Str. ${a.street}`);
  if (a.number) parts.push(`Nr. ${a.number}`);
  if (a.building) parts.push(`Bl. ${a.building}`);
  if (a.staircase) parts.push(`Sc. ${a.staircase}`);
  if (a.floor) parts.push(`Et. ${a.floor}`);
  if (a.apartment) parts.push(`Ap. ${a.apartment}`);
  if (a.city) parts.push(a.city);
  if (a.county) parts.push(`Jud. ${a.county}`);
  if (a.postalCode) parts.push(a.postalCode);
  return parts.join(', ');
}

export function resolveDomicile(personal: unknown): Domicile {
  const abroad = domicileAbroadOf(personal);
  if (abroad) return { abroad: true, text: formatDomicileAbroad(abroad) };

  // Foreign citizen who answered „no Romanian domicile": free text + country.
  const foreign = (personal as { foreignData?: { hasRomanianAddress?: boolean; foreignAddress?: string; domicileCountry?: string } } | null | undefined)?.foreignData;
  if (foreign?.hasRomanianAddress === false && foreign.foreignAddress?.trim()) {
    return {
      abroad: true,
      text: formatDomicileAbroad({ country: (foreign.domicileCountry || '').trim(), address: foreign.foreignAddress.trim() }),
    };
  }

  const address = (personal as { address?: unknown } | null | undefined)?.address;
  if (address && typeof address === 'object') {
    const a = address as Record<string, string | undefined>;
    return {
      abroad: false,
      text: formatRomanianAddress(address),
      parts: {
        county: a.county, city: a.city, sector: a.sector,
        street: a.street, number: a.number,
        building: a.building, staircase: a.staircase,
        floor: a.floor, apartment: a.apartment,
        postalCode: a.postalCode,
      },
    };
  }
  return { abroad: false, text: formatRomanianAddress(address) };
}
