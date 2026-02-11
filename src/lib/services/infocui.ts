/**
 * Company & Address Validation Service
 *
 * Company validation uses the free official ANAF API (webservicesp.anaf.ro):
 * - Validates CUI checksum using Romanian algorithm
 * - Fetches company data (name, address, reg. number, VAT status)
 * - Async two-step flow: POST to submit → wait 2.5s → GET with correlationId
 *
 * Address functions provide geographic autocomplete (counties, localities).
 * Falls back to mock data in development if ANAF is unreachable.
 */

// ============================================================================
// Company Data Types
// ============================================================================

export interface CompanyData {
  cui: string;
  name: string;
  type: string; // SRL, SA, PFA, II, IF, etc.
  registrationNumber: string;
  address: string;
  status: string;
  isActive: boolean;
  vatPayer?: boolean;
  establishedDate?: string;
}

interface CompanyLookupResponse {
  found: boolean;
  data?: CompanyData;
  error?: string;
}

const ANAF_POST_URL = 'https://webservicesp.anaf.ro/AsynchWebService/api/v8/ws/tva';
const ANAF_GET_URL = 'https://webservicesp.anaf.ro/AsynchWebService/api/v8/ws/tva';

/**
 * Validate CUI format
 * Romanian CUI is 2-10 digits, optionally prefixed with "RO"
 */
export function validateCUIFormat(cui: string): { valid: boolean; cleanCUI: string; error?: string } {
  // Remove RO prefix if present
  let cleanCUI = cui.replace(/^RO/i, '').trim();

  // Remove any non-digit characters
  cleanCUI = cleanCUI.replace(/\D/g, '');

  if (!cleanCUI) {
    return { valid: false, cleanCUI: '', error: 'CUI-ul este obligatoriu' };
  }

  if (cleanCUI.length < 2 || cleanCUI.length > 10) {
    return { valid: false, cleanCUI, error: 'CUI-ul trebuie să aibă între 2 și 10 cifre' };
  }

  // Validate checksum (Romanian CUI algorithm)
  const checksum = validateCUIChecksum(cleanCUI);
  if (!checksum.valid) {
    return { valid: false, cleanCUI, error: 'CUI invalid - cifra de control nu corespunde' };
  }

  return { valid: true, cleanCUI };
}

/**
 * Validate CUI checksum using Romanian algorithm
 */
function validateCUIChecksum(cui: string): { valid: boolean } {
  const weights = [7, 5, 3, 2, 1, 7, 5, 3, 2];

  // Pad to 9 digits (excluding control digit)
  const paddedCUI = cui.padStart(10, '0');
  const digits = paddedCUI.split('').map(Number);

  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }

  // Calculate control digit
  const remainder = (sum * 10) % 11;
  const controlDigit = remainder === 10 ? 0 : remainder;

  return { valid: digits[9] === controlDigit };
}

/**
 * Fetch company data from ANAF API (free, official)
 * Falls back to mock data in development if ANAF is unreachable.
 */
export async function fetchCompanyData(cui: string): Promise<CompanyLookupResponse> {
  const validation = validateCUIFormat(cui);

  if (!validation.valid) {
    return { found: false, error: validation.error };
  }

  const cleanCUI = validation.cleanCUI;

  // Try ANAF API (free, official, no key needed)
  try {
    const anafResult = await fetchFromANAF(cleanCUI);
    if (anafResult.found) return anafResult;
    return anafResult; // Return not-found result from ANAF
  } catch (error) {
    console.warn('[ANAF] API error:', error);
  }

  // Fall back to mock data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Company] ANAF unreachable, using mock data (development)');
    return getMockCompanyData(cleanCUI);
  }

  return { found: false, error: 'Serviciul ANAF nu este disponibil momentan. Încercați din nou.' };
}

/**
 * GET request using Node.js https module (ANAF resets keep-alive connections from fetch())
 */
function anafGet(url: string): Promise<{ status: number; body: string }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const https = require('https');
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: { 'Accept': 'application/json', 'Connection': 'close' },
        agent: false,
      },
      (res: import('http').IncomingMessage) => {
        let body = '';
        res.on('data', (d: Buffer) => (body += d));
        res.on('end', () => resolve({ status: res.statusCode || 0, body }));
      }
    );
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('ANAF GET timeout')); });
  });
}

/**
 * Fetch company data from ANAF public API (free, no API key required)
 * Uses async two-step flow: POST to submit → wait → GET to retrieve results
 */
async function fetchFromANAF(cui: string): Promise<CompanyLookupResponse> {
  const today = new Date().toISOString().split('T')[0];

  // Step 1: Submit query (fetch works fine for POST)
  const postResponse = await fetch(ANAF_POST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ cui: parseInt(cui, 10), data: today }]),
  });

  if (!postResponse.ok) {
    throw new Error(`ANAF POST returned ${postResponse.status}`);
  }

  const postResult = await postResponse.json();
  if (!postResult.correlationId) {
    throw new Error('ANAF API did not return correlationId');
  }

  // Step 2: Wait then retrieve results (ANAF requires minimum 2s wait)
  // Uses https module because ANAF resets keep-alive connections from fetch()
  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 2500 : 1500));

    try {
      const getUrl = `${ANAF_GET_URL}?id=${postResult.correlationId}`;
      const getResponse = await anafGet(getUrl);

      if (getResponse.status !== 200) {
        throw new Error(`ANAF GET returned ${getResponse.status}`);
      }

      result = JSON.parse(getResponse.body);
      break;
    } catch (err) {
      if (attempt === 2) throw err;
      console.warn(`[ANAF] GET attempt ${attempt + 1} failed, retrying...`);
    }
  }

  if (!result) {
    throw new Error('ANAF API: failed to retrieve results after retries');
  }

  // ANAF returns found items in "found" array and missing in "notfound"
  if (!result.found || result.found.length === 0) {
    return { found: false, error: 'CUI inexistent în baza de date ANAF' };
  }

  const company = result.found[0];
  const general = company.date_generale || {};
  const name = general.denumire || '';
  const stare = general.stare_inregistrare || '';
  const isActive = stare.toUpperCase().includes('INREGISTRAT') &&
    !stare.toUpperCase().includes('RADIAT') &&
    !stare.toUpperCase().includes('DIZOLVAT');

  return {
    found: true,
    data: {
      cui,
      name,
      type: extractCompanyType(name),
      registrationNumber: general.nrRegCom || '',
      address: general.adresa || '',
      status: stare,
      isActive,
      vatPayer: company.inregistrare_scop_Tva?.scpTVA === true,
      establishedDate: general.data_inregistrare,
    },
  };
}


/**
 * Extract company type from company name
 */
function extractCompanyType(name: string): string {
  const upperName = name.toUpperCase();

  const types = [
    'S.R.L.', 'SRL',
    'S.A.', 'SA',
    'S.C.S.', 'SCS',
    'S.N.C.', 'SNC',
    'S.C.A.', 'SCA',
    'P.F.A.', 'PFA',
    'I.I.', 'II',
    'I.F.', 'IF',
    'COOPERATIVA',
    'O.N.G.', 'ONG',
    'ASOCIATIE', 'ASOCIAȚIA',
    'FUNDATIE', 'FUNDAȚIA',
    'CABINET',
    'PAROHIE',
    'SINDICAT',
  ];

  for (const type of types) {
    if (upperName.includes(type)) {
      return type.replace(/\./g, '');
    }
  }

  return '';
}

/**
 * Mock company data for development/testing
 */
function getMockCompanyData(cui: string): CompanyLookupResponse {
  // Some known test CUIs for development
  const mockCompanies: Record<string, CompanyData> = {
    '14399840': {
      cui: '14399840',
      name: 'COMPANIA NATIONALA DE TRANSPORT AL ENERGIEI ELECTRICE TRANSELECTRICA S.A.',
      type: 'SA',
      registrationNumber: 'J40/8060/2000',
      address: 'București, Sector 1, Str. Olteni Nr. 2-4',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: true,
    },
    '14506181': {
      cui: '14506181',
      name: 'ENEL ENERGIE S.A.',
      type: 'SA',
      registrationNumber: 'J40/8060/2002',
      address: 'București, Sector 1, Bd. Ion Mihalache Nr. 41-43',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: true,
    },
    '1590082': {
      cui: '1590082',
      name: 'ORANGE ROMANIA S.A.',
      type: 'SA',
      registrationNumber: 'J40/10178/1996',
      address: 'București, Sector 1, Piața Victoriei Nr. 1',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: true,
    },
    '18189442': {
      cui: '18189442',
      name: 'TEST SRL',
      type: 'SRL',
      registrationNumber: 'J40/1234/2020',
      address: 'București, Sector 3, Str. Test Nr. 1',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: false,
    },
    '76543210': {
      cui: '76543210',
      name: 'EXEMPLU PFA',
      type: 'PFA',
      registrationNumber: 'F40/7654/2019',
      address: 'Cluj-Napoca, Str. Exemplu Nr. 10',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: false,
    },
    '99999992': {
      cui: '99999992',
      name: 'FIRMA INACTIVA SRL',
      type: 'SRL',
      registrationNumber: 'J40/9999/2015',
      address: 'București, Sector 2, Str. Inactiva Nr. 1',
      status: 'INACTIVA',
      isActive: false,
      vatPayer: false,
    },
    '88888883': {
      cui: '88888883',
      name: 'ASOCIATIA TEST',
      type: 'ASOCIATIE',
      registrationNumber: 'AJ40/8888/2018',
      address: 'Timișoara, Str. Asociatiei Nr. 5',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: false,
    },
  };

  if (mockCompanies[cui]) {
    return { found: true, data: mockCompanies[cui] };
  }

  // For unknown CUIs, generate mock data if CUI is valid format
  if (cui.length >= 6) {
    return {
      found: true,
      data: {
        cui,
        name: `FIRMA GENERATA ${cui} SRL`,
        type: 'SRL',
        registrationNumber: `J40/${cui.substring(0, 4)}/2023`,
        address: `București, Sector 1, Str. Generată Nr. ${cui.substring(0, 2)}`,
        status: 'ACTIVA',
        isActive: true,
        vatPayer: Math.random() > 0.5,
      },
    };
  }

  return { found: false, error: 'CUI inexistent în baza de date' };
}

// ============================================================================
// Address Data Types
// ============================================================================

export interface County {
  code: string;
  name: string;
}

export interface Locality {
  id: string;
  name: string;
  county: string;
  countyCode: string;
  postalCode?: string;
  type?: 'municipiu' | 'oras' | 'comuna' | 'sat';
}

export interface Street {
  id: string;
  name: string;
  locality: string;
  postalCode?: string;
}

export interface AddressValidation {
  valid: boolean;
  county?: County;
  locality?: Locality;
  street?: Street;
  postalCode?: string;
  formattedAddress?: string;
  suggestions?: string[];
  error?: string;
}

export interface ParsedAddress {
  county?: string;
  city?: string;
  street?: string;
  streetNumber?: string;
  building?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  postalCode?: string;
}

// ============================================================================
// Romanian Counties (Județe)
// ============================================================================

export const ROMANIAN_COUNTIES: County[] = [
  { code: 'AB', name: 'Alba' },
  { code: 'AR', name: 'Arad' },
  { code: 'AG', name: 'Argeș' },
  { code: 'BC', name: 'Bacău' },
  { code: 'BH', name: 'Bihor' },
  { code: 'BN', name: 'Bistrița-Năsăud' },
  { code: 'BT', name: 'Botoșani' },
  { code: 'BR', name: 'Brăila' },
  { code: 'BV', name: 'Brașov' },
  { code: 'B', name: 'București' },
  { code: 'BZ', name: 'Buzău' },
  { code: 'CL', name: 'Călărași' },
  { code: 'CS', name: 'Caraș-Severin' },
  { code: 'CJ', name: 'Cluj' },
  { code: 'CT', name: 'Constanța' },
  { code: 'CV', name: 'Covasna' },
  { code: 'DB', name: 'Dâmbovița' },
  { code: 'DJ', name: 'Dolj' },
  { code: 'GL', name: 'Galați' },
  { code: 'GR', name: 'Giurgiu' },
  { code: 'GJ', name: 'Gorj' },
  { code: 'HR', name: 'Harghita' },
  { code: 'HD', name: 'Hunedoara' },
  { code: 'IL', name: 'Ialomița' },
  { code: 'IS', name: 'Iași' },
  { code: 'IF', name: 'Ilfov' },
  { code: 'MM', name: 'Maramureș' },
  { code: 'MH', name: 'Mehedinți' },
  { code: 'MS', name: 'Mureș' },
  { code: 'NT', name: 'Neamț' },
  { code: 'OT', name: 'Olt' },
  { code: 'PH', name: 'Prahova' },
  { code: 'SJ', name: 'Sălaj' },
  { code: 'SM', name: 'Satu Mare' },
  { code: 'SB', name: 'Sibiu' },
  { code: 'SV', name: 'Suceava' },
  { code: 'TR', name: 'Teleorman' },
  { code: 'TM', name: 'Timiș' },
  { code: 'TL', name: 'Tulcea' },
  { code: 'VL', name: 'Vâlcea' },
  { code: 'VS', name: 'Vaslui' },
  { code: 'VN', name: 'Vrancea' },
];

/**
 * Get all Romanian counties
 */
export function getCounties(): County[] {
  return ROMANIAN_COUNTIES;
}

/**
 * Find county by name or code
 */
export function findCounty(nameOrCode: string): County | undefined {
  const normalized = nameOrCode.toLowerCase().trim();
  return ROMANIAN_COUNTIES.find(
    (c) =>
      c.code.toLowerCase() === normalized ||
      c.name.toLowerCase() === normalized ||
      c.name.toLowerCase().includes(normalized)
  );
}

// ============================================================================
// Address API Functions
// ============================================================================

/**
 * Fetch localities (cities/towns) for a county
 * Uses local data. For real address validation, see Fan Courier API.
 */
export async function fetchLocalities(county: string): Promise<Locality[]> {
  const countyObj = findCounty(county);
  if (!countyObj) {
    console.warn('[Geo] County not found:', county);
    return [];
  }

  return getMockLocalities(countyObj);
}

/**
 * Search localities across all counties (for autocomplete)
 */
export async function searchLocalities(query: string, limit: number = 10): Promise<Locality[]> {
  if (!query || query.length < 2) return [];

  return searchMockLocalities(query, limit);
}

/**
 * Validate an address (county + city combination)
 */
export async function validateAddress(
  county: string,
  city: string,
  street?: string
): Promise<AddressValidation> {
  const countyObj = findCounty(county);
  if (!countyObj) {
    return {
      valid: false,
      error: 'Județ invalid',
      suggestions: ROMANIAN_COUNTIES.slice(0, 5).map((c) => c.name),
    };
  }

  // Fetch localities for the county
  const localities = await fetchLocalities(county);

  // Find matching locality
  const normalizedCity = city.toLowerCase().trim();
  const matchingLocality = localities.find(
    (loc) =>
      loc.name.toLowerCase() === normalizedCity ||
      loc.name.toLowerCase().includes(normalizedCity) ||
      normalizedCity.includes(loc.name.toLowerCase())
  );

  if (!matchingLocality) {
    // Find similar localities as suggestions
    const suggestions = localities
      .filter((loc) => {
        const locName = loc.name.toLowerCase();
        return (
          locName.startsWith(normalizedCity.slice(0, 3)) ||
          levenshteinDistance(locName, normalizedCity) < 4
        );
      })
      .slice(0, 5)
      .map((loc) => loc.name);

    return {
      valid: false,
      county: countyObj,
      error: `Localitatea "${city}" nu a fost găsită în județul ${countyObj.name}`,
      suggestions: suggestions.length > 0 ? suggestions : localities.slice(0, 5).map((l) => l.name),
    };
  }

  // Build formatted address
  let formattedAddress = matchingLocality.name;
  if (street) {
    formattedAddress = `${street}, ${formattedAddress}`;
  }
  formattedAddress += `, Jud. ${countyObj.name}`;
  if (matchingLocality.postalCode) {
    formattedAddress = `${matchingLocality.postalCode} ${formattedAddress}`;
  }

  return {
    valid: true,
    county: countyObj,
    locality: matchingLocality,
    postalCode: matchingLocality.postalCode,
    formattedAddress,
  };
}

/**
 * Parse an address string into components
 * Handles Romanian address format: Str. X Nr. Y, Bl. Z, Sc. A, Et. B, Ap. C, Loc. City, Jud. County
 */
export function parseAddressString(address: string): ParsedAddress {
  const result: ParsedAddress = {};

  // Extract postal code (6 digits at start)
  const postalMatch = address.match(/^(\d{6})\s*/);
  if (postalMatch) {
    result.postalCode = postalMatch[1];
    address = address.slice(postalMatch[0].length);
  }

  // Extract county (Jud. X or Județul X)
  const countyMatch = address.match(/(?:Jud(?:ețul)?\.?\s*)([^,]+)/i);
  if (countyMatch) {
    result.county = countyMatch[1].trim();
  }

  // Extract city (Loc. X, Mun. X, Or. X, Com. X, Sat X)
  const cityMatch = address.match(/(?:Loc(?:alitatea)?\.?\s*|Mun(?:icipiul)?\.?\s*|Or(?:așul)?\.?\s*|Com(?:una)?\.?\s*|Sat\s+)([^,]+)/i);
  if (cityMatch) {
    result.city = cityMatch[1].trim();
  } else {
    // Try to extract city before Jud.
    const beforeCountyMatch = address.match(/,\s*([^,]+)\s*,\s*(?:Jud)/i);
    if (beforeCountyMatch) {
      result.city = beforeCountyMatch[1].trim();
    }
  }

  // Extract street (Str. X, Bd. X, Calea X, Aleea X, etc.)
  const streetMatch = address.match(/(?:Str(?:ada)?\.?\s*|Bd\.?\s*|B-dul\.?\s*|Calea\s+|Aleea\s+|Șos(?:eaua)?\.?\s*|Piața\s+)([^,]+)/i);
  if (streetMatch) {
    result.street = streetMatch[0].trim();
  }

  // Extract street number (Nr. X)
  const numberMatch = address.match(/Nr\.?\s*(\d+[A-Za-z]?)/i);
  if (numberMatch) {
    result.streetNumber = numberMatch[1];
  }

  // Extract building (Bl. X)
  const buildingMatch = address.match(/Bl\.?\s*([^,\s]+)/i);
  if (buildingMatch) {
    result.building = buildingMatch[1];
  }

  // Extract entrance (Sc. X)
  const entranceMatch = address.match(/Sc\.?\s*([^,\s]+)/i);
  if (entranceMatch) {
    result.entrance = entranceMatch[1];
  }

  // Extract floor (Et. X)
  const floorMatch = address.match(/Et\.?\s*([^,\s]+)/i);
  if (floorMatch) {
    result.floor = floorMatch[1];
  }

  // Extract apartment (Ap. X)
  const apartmentMatch = address.match(/Ap\.?\s*([^,\s]+)/i);
  if (apartmentMatch) {
    result.apartment = apartmentMatch[1];
  }

  return result;
}

/**
 * Format address components into a standard Romanian address string
 */
export function formatAddress(components: ParsedAddress): string {
  const parts: string[] = [];

  if (components.street) {
    let streetPart = components.street;
    if (components.streetNumber) {
      streetPart += ` Nr. ${components.streetNumber}`;
    }
    parts.push(streetPart);
  }

  const buildingParts: string[] = [];
  if (components.building) buildingParts.push(`Bl. ${components.building}`);
  if (components.entrance) buildingParts.push(`Sc. ${components.entrance}`);
  if (components.floor) buildingParts.push(`Et. ${components.floor}`);
  if (components.apartment) buildingParts.push(`Ap. ${components.apartment}`);
  if (buildingParts.length > 0) {
    parts.push(buildingParts.join(', '));
  }

  if (components.city) {
    parts.push(components.city);
  }

  if (components.county) {
    parts.push(`Jud. ${components.county}`);
  }

  let address = parts.join(', ');
  if (components.postalCode) {
    address = `${components.postalCode} ${address}`;
  }

  return address;
}

// ============================================================================
// Mock Data for Development
// ============================================================================

/**
 * Mock localities for a county (development fallback)
 */
function getMockLocalities(county: County): Locality[] {
  const mockLocalities: Record<string, Locality[]> = {
    B: [
      { id: '1', name: 'București Sector 1', county: 'București', countyCode: 'B', postalCode: '010011', type: 'municipiu' },
      { id: '2', name: 'București Sector 2', county: 'București', countyCode: 'B', postalCode: '020011', type: 'municipiu' },
      { id: '3', name: 'București Sector 3', county: 'București', countyCode: 'B', postalCode: '030011', type: 'municipiu' },
      { id: '4', name: 'București Sector 4', county: 'București', countyCode: 'B', postalCode: '040011', type: 'municipiu' },
      { id: '5', name: 'București Sector 5', county: 'București', countyCode: 'B', postalCode: '050011', type: 'municipiu' },
      { id: '6', name: 'București Sector 6', county: 'București', countyCode: 'B', postalCode: '060011', type: 'municipiu' },
    ],
    CJ: [
      { id: '10', name: 'Cluj-Napoca', county: 'Cluj', countyCode: 'CJ', postalCode: '400001', type: 'municipiu' },
      { id: '11', name: 'Turda', county: 'Cluj', countyCode: 'CJ', postalCode: '401001', type: 'municipiu' },
      { id: '12', name: 'Dej', county: 'Cluj', countyCode: 'CJ', postalCode: '405200', type: 'oras' },
      { id: '13', name: 'Câmpia Turzii', county: 'Cluj', countyCode: 'CJ', postalCode: '405100', type: 'oras' },
      { id: '14', name: 'Gherla', county: 'Cluj', countyCode: 'CJ', postalCode: '405300', type: 'oras' },
      { id: '15', name: 'Huedin', county: 'Cluj', countyCode: 'CJ', postalCode: '405400', type: 'oras' },
      { id: '16', name: 'Florești', county: 'Cluj', countyCode: 'CJ', postalCode: '407280', type: 'comuna' },
      { id: '17', name: 'Baciu', county: 'Cluj', countyCode: 'CJ', postalCode: '407015', type: 'comuna' },
    ],
    TM: [
      { id: '20', name: 'Timișoara', county: 'Timiș', countyCode: 'TM', postalCode: '300001', type: 'municipiu' },
      { id: '21', name: 'Lugoj', county: 'Timiș', countyCode: 'TM', postalCode: '305500', type: 'municipiu' },
      { id: '22', name: 'Sânnicolau Mare', county: 'Timiș', countyCode: 'TM', postalCode: '305600', type: 'oras' },
      { id: '23', name: 'Jimbolia', county: 'Timiș', countyCode: 'TM', postalCode: '305400', type: 'oras' },
    ],
    IS: [
      { id: '30', name: 'Iași', county: 'Iași', countyCode: 'IS', postalCode: '700001', type: 'municipiu' },
      { id: '31', name: 'Pașcani', county: 'Iași', countyCode: 'IS', postalCode: '705200', type: 'oras' },
      { id: '32', name: 'Hârlău', county: 'Iași', countyCode: 'IS', postalCode: '705100', type: 'oras' },
    ],
    CT: [
      { id: '40', name: 'Constanța', county: 'Constanța', countyCode: 'CT', postalCode: '900001', type: 'municipiu' },
      { id: '41', name: 'Mangalia', county: 'Constanța', countyCode: 'CT', postalCode: '905500', type: 'municipiu' },
      { id: '42', name: 'Medgidia', county: 'Constanța', countyCode: 'CT', postalCode: '905600', type: 'municipiu' },
      { id: '43', name: 'Năvodari', county: 'Constanța', countyCode: 'CT', postalCode: '905700', type: 'oras' },
    ],
    BV: [
      { id: '50', name: 'Brașov', county: 'Brașov', countyCode: 'BV', postalCode: '500001', type: 'municipiu' },
      { id: '51', name: 'Făgăraș', county: 'Brașov', countyCode: 'BV', postalCode: '505200', type: 'municipiu' },
      { id: '52', name: 'Săcele', county: 'Brașov', countyCode: 'BV', postalCode: '505600', type: 'municipiu' },
      { id: '53', name: 'Codlea', county: 'Brașov', countyCode: 'BV', postalCode: '505100', type: 'oras' },
    ],
  };

  return mockLocalities[county.code] || [
    {
      id: '999',
      name: county.name,
      county: county.name,
      countyCode: county.code,
      type: 'municipiu',
    },
  ];
}

/**
 * Search mock localities across all counties
 */
function searchMockLocalities(query: string, limit: number): Locality[] {
  const results: Locality[] = [];
  const normalizedQuery = query.toLowerCase();

  for (const county of ROMANIAN_COUNTIES) {
    const localities = getMockLocalities(county);
    for (const loc of localities) {
      if (loc.name.toLowerCase().includes(normalizedQuery)) {
        results.push(loc);
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
