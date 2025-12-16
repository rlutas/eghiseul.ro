/**
 * Validates Romanian CNP (Cod Numeric Personal)
 * Format: SAALLZZJJNNNC
 * S = Sex/Century, AA = Year, LL = Month, ZZ = Day, JJ = County, NNN = Serial, C = Control
 */
export function validateCNP(cnp: string): { valid: boolean; error?: string; data?: CNPData } {
  if (!cnp || typeof cnp !== 'string') {
    return { valid: false, error: 'CNP-ul este obligatoriu' }
  }

  const cleanCNP = cnp.replace(/\s/g, '')

  if (cleanCNP.length !== 13) {
    return { valid: false, error: 'CNP-ul trebuie să aibă 13 cifre' }
  }

  if (!/^\d{13}$/.test(cleanCNP)) {
    return { valid: false, error: 'CNP-ul trebuie să conțină doar cifre' }
  }

  const digits = cleanCNP.split('').map(Number)
  const [s, a1, a2, l1, l2, z1, z2, j1, j2, n1, n2, n3, c] = digits

  // Validate sex/century digit (1-8)
  if (s < 1 || s > 8) {
    return { valid: false, error: 'Prima cifră (sex/secol) este invalidă' }
  }

  // Calculate year based on sex/century digit
  const yearPrefix = getYearPrefix(s)
  if (yearPrefix === null) {
    return { valid: false, error: 'Prima cifră (sex/secol) este invalidă' }
  }
  const year = yearPrefix + a1 * 10 + a2

  // Validate month (01-12)
  const month = l1 * 10 + l2
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Luna este invalidă' }
  }

  // Validate day (01-31, depends on month)
  const day = z1 * 10 + z2
  const maxDays = getMaxDaysInMonth(month, year)
  if (day < 1 || day > maxDays) {
    return { valid: false, error: 'Ziua este invalidă' }
  }

  // Validate county code (01-52, with some exceptions)
  const county = j1 * 10 + j2
  if (!isValidCounty(county)) {
    return { valid: false, error: 'Codul județului este invalid' }
  }

  // Validate control digit
  const controlKey = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * controlKey[i]
  }
  const expectedControl = sum % 11 === 10 ? 1 : sum % 11
  if (c !== expectedControl) {
    return { valid: false, error: 'Cifra de control este invalidă' }
  }

  // Extract data
  const sex = s % 2 === 1 ? 'M' : 'F'
  const birthDate = new Date(year, month - 1, day)

  return {
    valid: true,
    data: {
      cnp: cleanCNP,
      sex,
      birthDate,
      county: getCountyName(county),
      countyCode: county,
    },
  }
}

function getYearPrefix(s: number): number | null {
  switch (s) {
    case 1:
    case 2:
      return 1900
    case 3:
    case 4:
      return 1800
    case 5:
    case 6:
      return 2000
    case 7:
    case 8:
      return 1900 // Residents/foreigners
    default:
      return null
  }
}

function getMaxDaysInMonth(month: number, year: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) {
    return 29
  }
  return daysInMonth[month - 1]
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function isValidCounty(code: number): boolean {
  // Valid county codes: 01-46, 51, 52
  return (code >= 1 && code <= 46) || code === 51 || code === 52
}

const COUNTIES: Record<number, string> = {
  1: 'Alba',
  2: 'Arad',
  3: 'Argeș',
  4: 'Bacău',
  5: 'Bihor',
  6: 'Bistrița-Năsăud',
  7: 'Botoșani',
  8: 'Brașov',
  9: 'Brăila',
  10: 'Buzău',
  11: 'Caraș-Severin',
  12: 'Cluj',
  13: 'Constanța',
  14: 'Covasna',
  15: 'Dâmbovița',
  16: 'Dolj',
  17: 'Galați',
  18: 'Gorj',
  19: 'Harghita',
  20: 'Hunedoara',
  21: 'Ialomița',
  22: 'Iași',
  23: 'Ilfov',
  24: 'Maramureș',
  25: 'Mehedinți',
  26: 'Mureș',
  27: 'Neamț',
  28: 'Olt',
  29: 'Prahova',
  30: 'Satu Mare',
  31: 'Sălaj',
  32: 'Sibiu',
  33: 'Suceava',
  34: 'Teleorman',
  35: 'Timiș',
  36: 'Tulcea',
  37: 'Vaslui',
  38: 'Vâlcea',
  39: 'Vrancea',
  40: 'București',
  41: 'București S.1',
  42: 'București S.2',
  43: 'București S.3',
  44: 'București S.4',
  45: 'București S.5',
  46: 'București S.6',
  51: 'Călărași',
  52: 'Giurgiu',
}

function getCountyName(code: number): string {
  return COUNTIES[code] || 'Necunoscut'
}

export interface CNPData {
  cnp: string
  sex: 'M' | 'F'
  birthDate: Date
  county: string
  countyCode: number
}
