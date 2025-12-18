/**
 * CNP (Cod Numeric Personal) Validation
 *
 * Romanian Personal Identification Number validation
 * Format: SAALLZZJJNNNC
 * S = Gender + Century (1-8)
 * AA = Year (2 digits)
 * LL = Month (01-12)
 * ZZ = Day (01-31)
 * JJ = County code (01-52)
 * NNN = Sequence number (001-999)
 * C = Checksum digit
 */

export interface CNPValidationResult {
  valid: boolean;
  errors: string[];
  data?: {
    gender: 'male' | 'female';
    birthDate: Date;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    countyCode: string;
    age: number;
  };
}

// County codes
const COUNTY_CODES: Record<string, string> = {
  '01': 'Alba',
  '02': 'Arad',
  '03': 'Argeș',
  '04': 'Bacău',
  '05': 'Bihor',
  '06': 'Bistrița-Năsăud',
  '07': 'Botoșani',
  '08': 'Brașov',
  '09': 'Brăila',
  '10': 'Buzău',
  '11': 'Caraș-Severin',
  '12': 'Cluj',
  '13': 'Constanța',
  '14': 'Covasna',
  '15': 'Dâmbovița',
  '16': 'Dolj',
  '17': 'Galați',
  '18': 'Gorj',
  '19': 'Harghita',
  '20': 'Hunedoara',
  '21': 'Ialomița',
  '22': 'Iași',
  '23': 'Ilfov',
  '24': 'Maramureș',
  '25': 'Mehedinți',
  '26': 'Mureș',
  '27': 'Neamț',
  '28': 'Olt',
  '29': 'Prahova',
  '30': 'Satu Mare',
  '31': 'Sălaj',
  '32': 'Sibiu',
  '33': 'Suceava',
  '34': 'Teleorman',
  '35': 'Timiș',
  '36': 'Tulcea',
  '37': 'Vaslui',
  '38': 'Vâlcea',
  '39': 'Vrancea',
  '40': 'București',
  '41': 'București Sector 1',
  '42': 'București Sector 2',
  '43': 'București Sector 3',
  '44': 'București Sector 4',
  '45': 'București Sector 5',
  '46': 'București Sector 6',
  '51': 'Călărași',
  '52': 'Giurgiu',
};

// Checksum weights
const CHECKSUM_WEIGHTS = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

/**
 * Validate a CNP and extract data from it
 */
export function validateCNP(cnp: string): CNPValidationResult {
  const errors: string[] = [];

  // Remove any spaces or dashes
  const cleanCNP = cnp.replace(/[\s-]/g, '');

  // Length check
  if (cleanCNP.length !== 13) {
    errors.push('CNP-ul trebuie să conțină exact 13 cifre');
    return { valid: false, errors };
  }

  // Numeric check
  if (!/^\d{13}$/.test(cleanCNP)) {
    errors.push('CNP-ul trebuie să conțină doar cifre');
    return { valid: false, errors };
  }

  // Parse components
  const genderCentury = parseInt(cleanCNP[0], 10);
  const yearDigits = parseInt(cleanCNP.substring(1, 3), 10);
  const month = parseInt(cleanCNP.substring(3, 5), 10);
  const day = parseInt(cleanCNP.substring(5, 7), 10);
  const countyCode = cleanCNP.substring(7, 9);
  const checkDigit = parseInt(cleanCNP[12], 10);

  // Gender + century validation (1-8)
  if (genderCentury < 1 || genderCentury > 8) {
    errors.push('Prima cifră a CNP-ului este invalidă (trebuie să fie între 1 și 8)');
    return { valid: false, errors };
  }

  // Determine century and gender
  let century: number;
  let gender: 'male' | 'female';

  switch (genderCentury) {
    case 1:
      century = 1900;
      gender = 'male';
      break;
    case 2:
      century = 1900;
      gender = 'female';
      break;
    case 3:
      century = 1800;
      gender = 'male';
      break;
    case 4:
      century = 1800;
      gender = 'female';
      break;
    case 5:
      century = 2000;
      gender = 'male';
      break;
    case 6:
      century = 2000;
      gender = 'female';
      break;
    case 7: // Foreign residents (male, various centuries)
      century = 1900; // Default assumption
      gender = 'male';
      break;
    case 8: // Foreign residents (female, various centuries)
      century = 1900; // Default assumption
      gender = 'female';
      break;
    default:
      errors.push('Prima cifră a CNP-ului este invalidă');
      return { valid: false, errors };
  }

  const birthYear = century + yearDigits;

  // Month validation
  if (month < 1 || month > 12) {
    errors.push('Luna din CNP este invalidă (trebuie să fie între 01 și 12)');
    return { valid: false, errors };
  }

  // Day validation (basic)
  if (day < 1 || day > 31) {
    errors.push('Ziua din CNP este invalidă (trebuie să fie între 01 și 31)');
    return { valid: false, errors };
  }

  // Validate actual date
  const birthDate = new Date(birthYear, month - 1, day);
  if (
    birthDate.getFullYear() !== birthYear ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    errors.push('Data de naștere din CNP este invalidă');
    return { valid: false, errors };
  }

  // Future date check
  const today = new Date();
  if (birthDate > today) {
    errors.push('Data de naștere din CNP nu poate fi în viitor');
    return { valid: false, errors };
  }

  // County code validation
  if (!COUNTY_CODES[countyCode]) {
    errors.push('Codul județului din CNP este invalid');
    return { valid: false, errors };
  }

  // Checksum validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNP[i], 10) * CHECKSUM_WEIGHTS[i];
  }
  const calculatedChecksum = sum % 11 === 10 ? 1 : sum % 11;

  if (calculatedChecksum !== checkDigit) {
    errors.push('CNP-ul este invalid (cifra de control nu corespunde)');
    return { valid: false, errors };
  }

  // Calculate age
  const age = calculateAge(birthDate);

  return {
    valid: true,
    errors: [],
    data: {
      gender,
      birthDate,
      birthYear,
      birthMonth: month,
      birthDay: day,
      countyCode,
      age,
    },
  };
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Extract birth date from CNP (without full validation)
 */
export function extractBirthDateFromCNP(cnp: string): Date | null {
  const result = validateCNP(cnp);
  return result.valid ? result.data!.birthDate : null;
}

/**
 * Check if CNP holder is at least 18 years old
 */
export function isAdult(cnp: string): boolean {
  const result = validateCNP(cnp);
  return result.valid ? result.data!.age >= 18 : false;
}

/**
 * Format CNP with visual separators (for display only)
 */
export function formatCNP(cnp: string): string {
  const clean = cnp.replace(/[\s-]/g, '');
  if (clean.length !== 13) return cnp;

  // Format: S-AALLZZ-JJ-NNN-C
  return `${clean[0]}-${clean.substring(1, 7)}-${clean.substring(7, 9)}-${clean.substring(9, 12)}-${clean[12]}`;
}

/**
 * Mask CNP for display (show only first and last 4 digits)
 */
export function maskCNP(cnp: string): string {
  const clean = cnp.replace(/[\s-]/g, '');
  if (clean.length !== 13) return cnp;

  return `${clean.substring(0, 1)}********${clean.substring(9)}`;
}

/**
 * Get county name from CNP
 */
export function getCountyFromCNP(cnp: string): string | null {
  const clean = cnp.replace(/[\s-]/g, '');
  if (clean.length !== 13) return null;

  const countyCode = clean.substring(7, 9);
  return COUNTY_CODES[countyCode] || null;
}
