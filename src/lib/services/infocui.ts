/**
 * InfoCUI Service
 *
 * Integrates with InfoCUI.ro API to validate and retrieve company data.
 * Falls back to mock data in development if no API key is configured.
 */

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

interface InfoCUIResponse {
  found: boolean;
  data?: CompanyData;
  error?: string;
}

const INFOCUI_API_KEY = process.env.INFOCUI_API_KEY;
const INFOCUI_BASE_URL = 'https://api.infocui.ro';

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
  const remainder = sum % 11;
  const controlDigit = remainder === 10 ? 0 : remainder;

  return { valid: digits[9] === controlDigit };
}

/**
 * Fetch company data from InfoCUI API
 */
export async function fetchCompanyData(cui: string): Promise<InfoCUIResponse> {
  const validation = validateCUIFormat(cui);

  if (!validation.valid) {
    return { found: false, error: validation.error };
  }

  const cleanCUI = validation.cleanCUI;

  // If no API key, use mock data in development
  if (!INFOCUI_API_KEY) {
    console.log('[InfoCUI] No API key configured, using mock data');
    return getMockCompanyData(cleanCUI);
  }

  try {
    const response = await fetch(`${INFOCUI_BASE_URL}/v1/company/${cleanCUI}`, {
      headers: {
        'Authorization': `Bearer ${INFOCUI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { found: false, error: 'CUI inexistent în baza de date' };
      }

      const errorText = await response.text();
      console.error('[InfoCUI] API error:', response.status, errorText);
      return { found: false, error: 'Eroare la verificarea CUI' };
    }

    const data = await response.json();

    return {
      found: true,
      data: {
        cui: data.cui || cleanCUI,
        name: data.denumire || data.name || '',
        type: extractCompanyType(data.denumire || data.name || ''),
        registrationNumber: data.nr_reg_com || data.registrationNumber || '',
        address: data.adresa || data.address || '',
        status: data.stare || data.status || '',
        isActive: (data.stare || data.status)?.toLowerCase()?.includes('activ') ||
                  data.activa === true ||
                  data.isActive === true,
        vatPayer: data.tva === true || data.platitor_tva === true,
        establishedDate: data.data_infiintare || data.establishedDate,
      },
    };

  } catch (error) {
    console.error('[InfoCUI] Fetch error:', error);
    return { found: false, error: 'Eroare de conexiune la serviciul de verificare' };
  }
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
function getMockCompanyData(cui: string): InfoCUIResponse {
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
    '6563700': {
      cui: '6563700',
      name: 'ORANGE ROMANIA S.A.',
      type: 'SA',
      registrationNumber: 'J40/10178/1996',
      address: 'București, Sector 1, Piața Victoriei Nr. 1',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: true,
    },
    '1234567': {
      cui: '1234567',
      name: 'TEST SRL',
      type: 'SRL',
      registrationNumber: 'J40/1234/2020',
      address: 'București, Sector 3, Str. Test Nr. 1',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: false,
    },
    '7654321': {
      cui: '7654321',
      name: 'EXEMPLU PFA',
      type: 'PFA',
      registrationNumber: 'F40/7654/2019',
      address: 'Cluj-Napoca, Str. Exemplu Nr. 10',
      status: 'ACTIVA',
      isActive: true,
      vatPayer: false,
    },
    '9999999': {
      cui: '9999999',
      name: 'FIRMA INACTIVA SRL',
      type: 'SRL',
      registrationNumber: 'J40/9999/2015',
      address: 'București, Sector 2, Str. Inactiva Nr. 1',
      status: 'INACTIVA',
      isActive: false,
      vatPayer: false,
    },
    '8888888': {
      cui: '8888888',
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
