/**
 * Document OCR Service using Google Gemini 2.5 Flash Lite
 *
 * Extracts data from Romanian ID cards and passports using AI vision.
 * Supports:
 * - Carte de Identitate (CI) - front and back
 * - Passport (Romanian and other EU)
 *
 * Model choice: `gemini-2.5-flash-lite` (~2s, vs ~14s for full flash).
 * Confirmed working in production by the team; the speed win matters for
 * the wizard UX and lite is reliable enough for ID cards.
 *
 * On JSON-parse failure we bubble up the raw Gemini text in `issues[]`
 * so production debugging isn't blind — useful when a specific photo
 * trips up the model (rare, but happens).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with the 2.5 Flash Lite model for OCR
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

export type DocumentType = 'ci_front' | 'ci_back' | 'passport' | 'unknown';

/**
 * ScanType — what the user actually uploads in the new (post-2026-05-28)
 * Step 2 flow. Differs from DocumentType because we split passport into
 * `passport_opened` (full spread scan) and the new eCI back into
 * `ci_nou_back` (no address expected).
 *
 * Legacy `ci_back` rămâne disponibil pentru drafts vechi; flow-ul nou
 * nu îl mai folosește (CI vechi e doar față).
 */
export type ScanType =
  | 'ci_front'
  | 'ci_nou_back'
  | 'passport_opened'
  | 'ro_cei_reader_pdf';

/**
 * Data extras de pe spatele eCI (CEI cu cip). NU conține adresă pentru
 * că eCI back nu are adresa printată — e doar în cip. OCR-ul returnează
 * `success: true` chiar dacă adresa lipsește (spre deosebire de
 * extractFromCIBack legacy care marca fail).
 */
export interface ExtractedCINouBack {
  issueDate?: string;          // DD.MM.YYYY
  issuedBy?: string;           // ex. "SPCEP S5 biroul nr.1"
  mrzRaw?: string[];           // 3 linii MRZ (sau 2)
  mrzDocumentNumber?: string;  // extras din MRZ linia 1
  mrzCnp?: string;             // extras din MRZ linia 2
}

/**
 * Data extrasă din PDF-ul RO CEI Reader (aplicația oficială MAI).
 * Conține TOATE datele din CI plus adresa de domiciliu — pentru că PDF-ul
 * citește direct din cip-ul electronic.
 */
export interface ExtractedROCEIReader extends ExtractedPersonalData {
  /** Dacă PDF-ul conține footer-ul "RO CEI Reader a MAI" (anti-forgery basic). */
  isAuthenticated?: boolean;
}

/**
 * Cross-validation warning between scans (front vs back vs PDF).
 * Always severity='warning' — admin decides if it's blocking.
 */
export interface CrossValidationWarning {
  field: 'documentNumber' | 'cnp' | 'name' | 'birthDate';
  values: Record<string, string | undefined>;
  message: string;
  severity: 'warning';
}

export interface ExtractedPersonalData {
  // Personal info
  cnp?: string;
  lastName?: string;
  firstName?: string;
  birthDate?: string; // DD.MM.YYYY
  birthPlace?: string;
  gender?: 'male' | 'female';
  nationality?: string;

  // Document info
  documentType: DocumentType;
  series?: string;
  number?: string;
  issueDate?: string;
  expiryDate?: string;
  issuedBy?: string;

  // Address (from CI back)
  address?: {
    fullAddress?: string;
    county?: string;
    city?: string;
    sector?: string; // For București (1-6)
    street?: string;
    streetType?: string; // Strada/Bulevardul/Aleea/Calea
    number?: string;
    building?: string;
    staircase?: string; // Scara
    floor?: string; // Etaj
    apartment?: string;
    postalCode?: string;
  };
}

export interface OCRResult {
  success: boolean;
  documentType: DocumentType;
  confidence: number;
  extractedData: ExtractedPersonalData;
  rawText?: string;
  issues: string[];
  suggestions: string[];
}

/**
 * Extract data from a Romanian ID card (front side)
 * Supports both old format (pre-2009, address on front) and new format (post-2009)
 */
export async function extractFromCIFront(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Analizează această imagine a unei cărți de identitate românești (față) și extrage TOATE datele vizibile.

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

ORIENTARE IMAGINII: Dacă imaginea pare rotită (poză făcută în mod portrait deși CI-ul este landscape), analizează conținutul ca și cum ar fi rotit corect. Cărțile de identitate românești au întotdeauna orientare landscape (lățime > înălțime). Ignoră elementele care nu fac parte din CI (degete, suprafețe, fundal).

⚠️ DIACRITICE ROMÂNEȘTI (CRITIC): Limba română folosește DOAR aceste 5 caractere speciale:
  • ă (a cu breve)            — NU confunda cu å, ä, â
  • â (a cu circumflex)       — la mijlocul cuvintelor: "România", "câmp"
  • î (i cu circumflex)       — la început/sfârșit: "în", "începe"
  • ș (s cu virgulă dedesubt) — sau forma veche ş (cedilla); NICIODATĂ š sau č
  • ț (t cu virgulă dedesubt) — sau forma veche ţ (cedilla); NICIODATĂ ť

Greșelile frecvente ale OCR-urilor pe care le INTERZIC:
  ✗ "š", "č", "ž" — aceste caractere NU EXISTĂ în română
  ✗ "Băbăcești"  → corect: "Băbășești" (s cu virgulă, nu č)
  ✗ "Medieșu"   → ok; dar NU "Medieşu" cu cedilla la s (Unicode modern: ș)
  ✗ "Mănăstirea" cu "ă" peste tot — uneori e "Mănăștirea" (cu ș)

Dacă vezi un caracter ambiguu (semn jos sub s/t), e ÎNTOTDEAUNA virgulă, niciodată cedilă-cu-cârlig sau caron.

Cărțile de identitate românești pot fi de 2 tipuri:
1. Format vechi (pre-2009): Are adresa de domiciliu pe FAȚĂ
2. Format nou (post-2009): Are adresa pe VERSO (spatele cardului)

Extrage TOATE datele vizibile:
- CNP (Cod Numeric Personal - 13 cifre)
- Nume (Last Name / Surname)
- Prenume (First Name / Given Names)
- Data nașterii (Birth Date în format DD.MM.YYYY)
- Locul nașterii (Birth Place)
- Seria documentului (2 litere, ex: SM, RD, IF)
- Numărul documentului (6 cifre)
- Data expirării (Expiry Date în format DD.MM.YYYY)
- Data emiterii (Issue Date în format DD.MM.YYYY) dacă e vizibilă
- Sex (M sau F)
- Cetățenia / Naționalitatea
- ADRESA de domiciliu (dacă apare pe față - la CI-urile vechi)
- MRZ (Machine Readable Zone) - cele 2-3 linii de text cu caractere speciale de la baza documentului

Pentru ADRESĂ (dacă există pe față), parsează în componente:
- Județul (fără "Jud.")
- Localitatea/Orașul (fără "Mun."/"Com.")
- Strada (fără "Str."/"Bd.")
- Număr, Bloc, Scară, Etaj, Apartament

Pentru MRZ, extrage textul complet din fiecare linie. MRZ-ul nu conține diacritice (e ASCII) — îl extragi exact așa cum apare.

Analizează calitatea imaginii și identifică tipul de CI (vechi sau nou).

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "ci_front",
  "confidence": 0-100,
  "ciFormat": "old" sau "new",
  "extractedData": {
    "cnp": "string sau null",
    "lastName": "string sau null",
    "firstName": "string sau null",
    "birthDate": "DD.MM.YYYY sau null",
    "birthPlace": "string sau null",
    "gender": "male" sau "female" sau null,
    "nationality": "string sau null",
    "series": "string sau null (ex: SM)",
    "number": "string sau null (ex: 966197)",
    "issueDate": "DD.MM.YYYY sau null",
    "expiryDate": "DD.MM.YYYY sau null",
    "address": {
      "fullAddress": "adresa completă sau null",
      "county": "județ sau null",
      "city": "localitate sau null",
      "sector": "1-6 pentru București sau null",
      "street": "strada sau null",
      "streetType": "Strada/Bulevardul/Aleea sau null",
      "number": "număr sau null",
      "building": "bloc sau null",
      "staircase": "scară sau null",
      "floor": "etaj sau null",
      "apartment": "apartament sau null"
    },
    "mrz": {
      "line1": "prima linie MRZ sau null",
      "line2": "a doua linie MRZ sau null",
      "line3": "a treia linie MRZ sau null (dacă există)"
    }
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru îmbunătățire"]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    return parseGeminiOCRResponse(text, 'ci_front');
  } catch (error) {
    console.error('CI Front OCR error:', error);
    return createErrorResult('ci_front', 'Eroare la procesarea documentului');
  }
}

/**
 * Extract data from a Romanian ID card (back side)
 */
export async function extractFromCIBack(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Analizează această imagine a unei cărți de identitate românești (verso/spate) și extrage adresa de domiciliu.

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

ORIENTARE: Dacă poza e făcută portrait dar CI-ul e landscape, analizează ca și cum ar fi rotit corect. Ignoră elementele care nu fac parte din CI (degete, suprafețe, fundal).

⚠️ DIACRITICE: limba română folosește DOAR ă, â, î, ș (s cu virgulă dedesubt), ț (t cu virgulă dedesubt). Caracterele š, č, ž NU EXISTĂ în română. Dacă vezi un semn jos sub s/t, e ÎNTOTDEAUNA virgulă (ș/ț), niciodată caron sau cedilă-cu-cârlig. Exemplu: "Băbășești" (corect), NU "Băbăcești". MRZ-ul este ASCII fără diacritice.

Formatul adresei pe buletinele românești poate fi:
- Urban: "Jud. CLUJ, Mun. CLUJ-NAPOCA, Str. MIHAI EMINESCU, Nr. 10, Bl. A1, Sc. 2, Et. 3, Ap. 15"
- Rural: "Jud. IAȘI, Com. REDIU, Sat BREAZU, Nr. 125"
- Simplificat: "BUCUREȘTI, Sect. 1, Bd. MAGHERU, Nr. 5, Ap. 10"

Abrevieri comune:
- Jud. = Județ
- Mun. = Municipiu
- Com. = Comună
- Sat = Sat
- Str. = Strada
- Bd. / Bld. = Bulevardul
- Ale. = Aleea
- Nr. = Număr
- Bl. = Bloc
- Sc. = Scara
- Et. = Etaj
- Ap. = Apartament
- Sect. = Sector (doar București)

Extrage și parsează adresa în componente separate. Pentru București, județul este "București".

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "ci_back",
  "confidence": 0-100,
  "extractedData": {
    "issueDate": "DD.MM.YYYY sau null",
    "issuedBy": "string sau null",
    "address": {
      "fullAddress": "adresa completă exact cum apare pe document",
      "county": "numele județului fără 'Jud.' (ex: Cluj, București, Iași)",
      "city": "localitatea/municipiul/comuna fără 'Mun.'/'Com.' (ex: Cluj-Napoca, Rediu)",
      "sector": "1-6 doar pentru București, altfel null",
      "street": "numele străzii fără 'Str.'/'Bd.'/'Ale.' (ex: Mihai Eminescu)",
      "streetType": "Strada/Bulevardul/Aleea/Calea etc.",
      "number": "numărul (ex: 10, 125-A)",
      "building": "blocul fără 'Bl.' (ex: A1, M5)",
      "staircase": "scara fără 'Sc.' (ex: A, 1, 2)",
      "floor": "etajul fără 'Et.' (ex: 3, P, M)",
      "apartment": "apartamentul fără 'Ap.' (ex: 15, 102)",
      "postalCode": "codul poștal 6 cifre dacă este vizibil, altfel null"
    }
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru îmbunătățire"]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    return parseGeminiOCRResponse(text, 'ci_back');
  } catch (error) {
    console.error('CI Back OCR error:', error);
    return createErrorResult('ci_back', 'Eroare la procesarea documentului');
  }
}

/**
 * Extract data from the BACK of a new electronic CI (eCI / CEI with chip).
 *
 * Key difference from `extractFromCIBack`: eCI back does NOT have the
 * address printed (address is only in the chip — retrieved via RO CEI
 * Reader PDF). Prompt explicitly tells Gemini not to look for an address
 * and not to mark fail if it's absent.
 *
 * What we DO extract from eCI back:
 * - Data emiterii (issueDate)
 * - Autoritatea emitentă (issuedBy, ex. "SPCEP S5 biroul nr.1")
 * - MRZ (3 rânduri ICAO 9303-3)
 * - Document number from MRZ (cross-check with front)
 * - CNP from MRZ (cross-check with front)
 */
export async function extractFromCINouBack(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Analizează această imagine a SPATELUI unei cărți electronice de identitate românești (CEI/eCI, cu cip).

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

ATENȚIE CRITICĂ: Pe spatele cărții electronice de identitate NU EXISTĂ adresa de domiciliu printată — adresa este stocată DOAR în cip. NU căuta adresa, NU raporta ca eroare lipsa adresei. Spatele eCI conține:
  • Cip-ul electronic (pătrat auriu)
  • Data emiterii ("Data emiterii / Date of issue")
  • Autoritatea emitentă ("Autoritatea emitentă / Issuing authority", ex. "SPCEP S5 biroul nr.1")
  • Foto micșorat + indicativul "ROU"
  • Zona MRZ (Machine Readable Zone) — 3 rânduri de text ASCII

MRZ-ul are formatul ICAO 9303-3 pentru CI:
  Linia 1: IDROU<seria><număr_document>...
  Linia 2: <data_naștere><sex><data_expirare>ROU<cnp_sau_personal_number>...
  Linia 3: <NUME><<<PRENUME><<...

Extrage MRZ-ul EXACT cum apare (caracterele "<" sunt padding ICAO standard).

ORIENTARE: Dacă poza e făcută portrait dar cardul e landscape, analizează ca și cum ar fi rotit corect. Ignoră reflexii, degete, fundal.

Răspunde în acest format JSON:
{
  "success": true,
  "documentType": "ci_nou_back",
  "confidence": 0-100,
  "extractedData": {
    "issueDate": "DD.MM.YYYY sau null",
    "issuedBy": "string sau null (ex. 'SPCEP S5 biroul nr.1')",
    "mrzRaw": ["linia 1", "linia 2", "linia 3"],
    "mrzDocumentNumber": "numărul documentului extras din MRZ (ex. MB1139128) sau null",
    "mrzCnp": "CNP-ul extras din MRZ (13 cifre) sau null"
  },
  "issues": ["doar probleme REALE de lizibilitate, NU lipsa adresei"],
  "suggestions": ["sugestii pentru îmbunătățire poza, dacă e cazul"]
}

IMPORTANT FINAL: NU SCRIE ÎN "issues" "Address information not visible" sau echivalent. Spatele eCI nu trebuie să aibă adresă. Setează "success": true dacă ai extras măcar data emiterii SAU MRZ-ul.`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    return parseGeminiOCRResponse(text, 'ci_back');  // reuse parser, document type stays ci_back for backward compat in OCRResult
  } catch (error) {
    console.error('CI Nou Back OCR error:', error);
    return createErrorResult('ci_back', 'Eroare la procesarea documentului');
  }
}

/**
 * Extract data from a passport (opened spread — both photo page + opposite page visible).
 *
 * Replaces `extractFromPassport` for the new flow. Same data extracted,
 * but prompt expects an opened spread image (landscape) instead of just
 * the photo page. MRZ verification stricter.
 *
 * Address is NOT extracted (passports don't have addresses). Address for
 * cazier judiciar passport users comes from Step 4 (delivery).
 */
export async function extractFromPassportOpened(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Analizează această imagine a unui pașaport DESCHIS (ambele pagini vizibile: pagina cu foto + pagina opusă).

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

PAȘAPORTUL ROMÂN are pe pagina cu foto:
  • Nume (Surname)
  • Prenume (Given names)
  • Cetățenia (Nationality) — "ROU" pentru pașaport românesc
  • Sex (Sex) — M/F
  • Data nașterii (Date of birth)
  • Locul nașterii (Place of birth)
  • Numărul pașaportului (Passport No.) — în colțul dreapta-sus
  • Data emiterii (Date of issue)
  • Data expirării (Date of expiry)
  • Autoritatea emitentă (Authority)
  • CNP (Personal Code) — uneori vizibil
  • Foto color
  • MRZ — 2 rânduri în partea de jos cu "P<ROU..."

Pașapoarte STRĂINE au fields similare (Surname/Nom, Given names/Prénoms) în engleză + franceză + limba locală.

IMPORTANT: NU căuta adresa de domiciliu. Pașapoartele NU au adresă printată niciodată.

MRZ-ul (Machine Readable Zone) ICAO 9303-1:
  Linia 1: P<<COD_TARA><NUME><<PRENUME><<<...
  Linia 2: <NR_PAȘAPORT><CHECKSUM><COD_TARA><DATA_NAȘTERE><SEX><DATA_EXPIRARE><...

Extrage MRZ-ul EXACT cum apare. Caracterele "<" sunt padding standard.

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "passport",
  "confidence": 0-100,
  "extractedData": {
    "cnp": "string sau null (doar pentru pașaport românesc)",
    "lastName": "string sau null",
    "firstName": "string sau null",
    "birthDate": "DD.MM.YYYY sau null",
    "birthPlace": "string sau null",
    "gender": "male" sau "female" sau null,
    "nationality": "ROU sau cod ISO 3 litere",
    "number": "numărul pașaportului sau null",
    "issueDate": "DD.MM.YYYY sau null",
    "expiryDate": "DD.MM.YYYY sau null",
    "issuedBy": "string sau null",
    "mrz": {
      "line1": "primul rând MRZ sau null",
      "line2": "al doilea rând MRZ sau null"
    }
  },
  "issues": ["lista problemelor REALE — fără 'no address' care nu se aplică"],
  "suggestions": ["sugestii pentru îmbunătățire poza"]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    return parseGeminiOCRResponse(text, 'passport');
  } catch (error) {
    console.error('Passport Opened OCR error:', error);
    return createErrorResult('passport', 'Eroare la procesarea documentului');
  }
}

/**
 * Extract data from RO CEI Reader PDF (official MAI app output).
 *
 * The RO CEI Reader PDF is generated by the official "RO CEI Reader" mobile
 * app from MAI (Ministerul Afacerilor Interne). The user scans the chip of
 * their new electronic CI via NFC and the app exports a PDF containing all
 * the data stored on the chip, INCLUDING the address.
 *
 * Format is predictable (key: value lines), making this OCR very reliable.
 * Gemini handles PDF input natively (no pdf-parse needed).
 *
 * Anti-forgery: we check for the footer string "RO CEI Reader a MAI" in
 * the PDF content. Not a strong defense but catches casual forgeries.
 *
 * Returns address parsed into components (county, city, sector, street,
 * number, building, staircase, floor, apartment).
 */
export async function extractFromROCEIReaderPDF(
  pdfBase64: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Analizează acest PDF generat de aplicația oficială "RO CEI Reader" a MAI (Ministerul Afacerilor Interne din România).

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown.

PDF-ul are formatul standard:
  Nume de familie: <SURNAME>
  Prenume: <GIVEN NAMES>
  Cetățenie: ROU
  Sex: M sau F
  CNP: <13 cifre>
  Data nașterii: DD.MM.YYYY
  Locul nașterii: <oraș>
  Număr document: <ex. MB1139128>
  Data emiterii: DD.MM.YYYY
  Data expirării: DD.MM.YYYY
  Autoritatea emitentă: <ex. SPCEP S5 biroul nr.1>
  Domiciliu: <adresa completă>
  Document foto: <foto persoană>

ADRESA DE DOMICILIU se găsește pe rândul "Domiciliu:" și are formate posibile:
  • București: "Mun.Bucureşti Sec.<N> Bd./Str./Ale.<nume> nr.<N> sc.<X> et.<N> ap.<N>"
  • Urban: "Mun.<oraș> Str.<nume> nr.<N> bl.<X> sc.<X> et.<N> ap.<N>"
  • Rural: "Com.<comună> Sat <sat> nr.<N>"

ANTI-FORGERY: Verifică în textul PDF-ului dacă există string-ul exact "RO CEI Reader a MAI"
(în footer-ul "Acest document este generat cu acordul utilizatorului prin intermediul aplicației RO CEI Reader a MAI"). Returnează "isAuthenticated": true/false pe baza acestei verificări.

DIACRITICE: Folosește DOAR ă, â, î, ș, ț. NICIODATĂ š, č, ţ-cu-cedillă-veche.

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "ro_cei_reader_pdf",
  "confidence": 0-100,
  "isAuthenticated": true sau false,
  "extractedData": {
    "cnp": "string",
    "lastName": "string",
    "firstName": "string",
    "birthDate": "DD.MM.YYYY",
    "birthPlace": "string",
    "gender": "male" sau "female",
    "nationality": "ROU",
    "number": "string (ex. MB1139128)",
    "issueDate": "DD.MM.YYYY",
    "expiryDate": "DD.MM.YYYY",
    "issuedBy": "string (ex. 'SPCEP S5 biroul nr.1')",
    "address": {
      "fullAddress": "exact cum apare după 'Domiciliu:'",
      "county": "județul (ex. 'București', 'Cluj') — pentru București NU 'Bucureşti'",
      "city": "localitatea (ex. 'București', 'Cluj-Napoca')",
      "sector": "1-6 doar pentru București, altfel null",
      "streetType": "Strada/Bulevardul/Aleea/Calea (fără punct sau abrevire)",
      "street": "numele străzii (ex. 'Schitu Măgureanu')",
      "number": "numărul stradal",
      "building": "blocul sau null",
      "staircase": "scara sau null",
      "floor": "etajul sau null",
      "apartment": "apartamentul sau null",
      "postalCode": null
    }
  },
  "issues": [],
  "suggestions": []
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64.replace(/^data:application\/pdf;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    return parseGeminiOCRResponse(text, 'passport'); // fallback DocumentType — we'll set isAuthenticated via extraData
  } catch (error) {
    console.error('RO CEI Reader PDF OCR error:', error);
    return createErrorResult('passport', 'Eroare la procesarea PDF-ului RO CEI Reader');
  }
}

/**
 * Cross-validate extracted data between front, back, and PDF scans.
 *
 * Returns warnings (never errors — admin decides if blocking) when the
 * same field has different values across scans. This catches:
 * - Wrong PDF uploaded (CNP doesn't match CI)
 * - OCR errors (typo in document number on one side)
 * - Photoshopped documents (numbers don't add up)
 *
 * Comparisons are case-insensitive and ignore whitespace. Romanian
 * diacritics are normalized (ș → s, ț → t) for name comparison only
 * because Gemini OCR might inconsistently transcribe them.
 */
export function crossValidateExtractedData(scans: {
  ci_front?: ExtractedPersonalData;
  ci_nou_back?: ExtractedCINouBack;
  ro_cei_reader_pdf?: ExtractedROCEIReader;
}): CrossValidationWarning[] {
  const warnings: CrossValidationWarning[] = [];

  const normalize = (s: string | undefined): string =>
    (s ?? '').trim().toLowerCase();

  const normalizeName = (s: string | undefined): string =>
    normalize(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // strip combining marks
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .replace(/\s+/g, ' ');

  // CI front document number vs MRZ on eCI back
  if (scans.ci_front?.number && scans.ci_nou_back?.mrzDocumentNumber) {
    const front = normalize(scans.ci_front.number);
    const back = normalize(scans.ci_nou_back.mrzDocumentNumber);
    if (front !== back) {
      warnings.push({
        field: 'documentNumber',
        values: { ci_front: scans.ci_front.number, ci_nou_back: scans.ci_nou_back.mrzDocumentNumber },
        message: `Numărul documentului de pe față (${scans.ci_front.number}) diferă de cel din MRZ-ul de pe spate (${scans.ci_nou_back.mrzDocumentNumber}).`,
        severity: 'warning',
      });
    }
  }

  // CI front CNP vs MRZ CNP on eCI back
  if (scans.ci_front?.cnp && scans.ci_nou_back?.mrzCnp) {
    const front = normalize(scans.ci_front.cnp);
    const back = normalize(scans.ci_nou_back.mrzCnp);
    if (front !== back) {
      warnings.push({
        field: 'cnp',
        values: { ci_front: scans.ci_front.cnp, ci_nou_back: scans.ci_nou_back.mrzCnp },
        message: `CNP-ul de pe față (${scans.ci_front.cnp}) diferă de CNP-ul din MRZ-ul de pe spate (${scans.ci_nou_back.mrzCnp}).`,
        severity: 'warning',
      });
    }
  }

  // CI front CNP vs PDF CNP
  if (scans.ci_front?.cnp && scans.ro_cei_reader_pdf?.cnp) {
    const front = normalize(scans.ci_front.cnp);
    const pdf = normalize(scans.ro_cei_reader_pdf.cnp);
    if (front !== pdf) {
      warnings.push({
        field: 'cnp',
        values: { ci_front: scans.ci_front.cnp, ro_cei_reader_pdf: scans.ro_cei_reader_pdf.cnp },
        message: `CNP-ul de pe față (${scans.ci_front.cnp}) diferă de CNP-ul din PDF-ul RO CEI Reader (${scans.ro_cei_reader_pdf.cnp}).`,
        severity: 'warning',
      });
    }
  }

  // CI front document number vs PDF number
  if (scans.ci_front?.number && scans.ro_cei_reader_pdf?.number) {
    const front = normalize(scans.ci_front.number);
    const pdf = normalize(scans.ro_cei_reader_pdf.number);
    if (front !== pdf) {
      warnings.push({
        field: 'documentNumber',
        values: { ci_front: scans.ci_front.number, ro_cei_reader_pdf: scans.ro_cei_reader_pdf.number },
        message: `Numărul documentului de pe față (${scans.ci_front.number}) diferă de cel din PDF-ul RO CEI Reader (${scans.ro_cei_reader_pdf.number}).`,
        severity: 'warning',
      });
    }
  }

  // Name comparison (front vs PDF) — both should match
  if (scans.ci_front?.lastName && scans.ro_cei_reader_pdf?.lastName) {
    const front = normalizeName(scans.ci_front.lastName) + '|' + normalizeName(scans.ci_front.firstName);
    const pdf = normalizeName(scans.ro_cei_reader_pdf.lastName) + '|' + normalizeName(scans.ro_cei_reader_pdf.firstName);
    if (front !== pdf) {
      warnings.push({
        field: 'name',
        values: {
          ci_front: `${scans.ci_front.lastName} ${scans.ci_front.firstName}`,
          ro_cei_reader_pdf: `${scans.ro_cei_reader_pdf.lastName} ${scans.ro_cei_reader_pdf.firstName}`,
        },
        message: `Numele de pe față nu se potrivește cu cel din PDF-ul RO CEI Reader.`,
        severity: 'warning',
      });
    }
  }

  // Birth date comparison
  if (scans.ci_front?.birthDate && scans.ro_cei_reader_pdf?.birthDate) {
    if (scans.ci_front.birthDate !== scans.ro_cei_reader_pdf.birthDate) {
      warnings.push({
        field: 'birthDate',
        values: { ci_front: scans.ci_front.birthDate, ro_cei_reader_pdf: scans.ro_cei_reader_pdf.birthDate },
        message: `Data nașterii de pe față (${scans.ci_front.birthDate}) diferă de cea din PDF (${scans.ro_cei_reader_pdf.birthDate}).`,
        severity: 'warning',
      });
    }
  }

  return warnings;
}

/**
 * Extract data from a passport
 */
export async function extractFromPassport(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Analizează această imagine a unui pașaport și extrage toate datele vizibile.

IMPORTANT: Răspunde DOAR în format JSON valid, fără markdown, fără explicații.

Extrage următoarele date:
- Nume complet (Surname / Nom)
- Prenume (Given Names / Prénoms)
- Data nașterii (Date of Birth)
- Locul nașterii (Place of Birth)
- Sex (Sex)
- Cetățenia (Nationality)
- Numărul pașaportului
- Data emiterii (Date of Issue)
- Data expirării (Date of Expiry)
- CNP (dacă este pașaport românesc - se găsește în zona MRZ sau separat)

Verifică și zona MRZ (Machine Readable Zone) de la baza paginii dacă este vizibilă.

Răspunde în acest format JSON:
{
  "success": true/false,
  "documentType": "passport",
  "confidence": 0-100,
  "extractedData": {
    "cnp": "string sau null (doar pentru pașaport românesc)",
    "lastName": "string sau null",
    "firstName": "string sau null",
    "birthDate": "DD.MM.YYYY sau null",
    "birthPlace": "string sau null",
    "gender": "male" sau "female" sau null,
    "nationality": "string sau null",
    "number": "numărul pașaportului sau null",
    "issueDate": "DD.MM.YYYY sau null",
    "expiryDate": "DD.MM.YYYY sau null",
    "issuedBy": "string sau null"
  },
  "issues": ["lista problemelor detectate"],
  "suggestions": ["sugestii pentru îmbunătățire"]
}`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    return parseGeminiOCRResponse(text, 'passport');
  } catch (error) {
    console.error('Passport OCR error:', error);
    return createErrorResult('passport', 'Eroare la procesarea documentului');
  }
}

/**
 * Auto-detect document type and extract data
 */
export async function extractFromDocument(
  imageBase64: string,
  mimeType: string
): Promise<OCRResult> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const detectPrompt = `Analizează această imagine și determină ce tip de document este.

IMPORTANT: Răspunde DOAR cu unul din aceste cuvinte:
- "ci_front" - dacă este fața unei cărți de identitate românești
- "ci_back" - dacă este spatele unei cărți de identitate românești
- "passport" - dacă este un pașaport (orice țară)
- "unknown" - dacă nu poți determina tipul

Răspunde cu UN SINGUR CUVÂNT.`;

  try {
    // First, detect document type
    const detectResult = await model.generateContent([
      detectPrompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      },
    ]);

    const detectResponse = await detectResult.response;
    const detectedType = detectResponse.text().toLowerCase().trim() as DocumentType;

    // Extract data based on detected type
    switch (detectedType) {
      case 'ci_front':
        return extractFromCIFront(imageBase64, mimeType);
      case 'ci_back':
        return extractFromCIBack(imageBase64, mimeType);
      case 'passport':
        return extractFromPassport(imageBase64, mimeType);
      default:
        return {
          success: false,
          documentType: 'unknown',
          confidence: 0,
          extractedData: { documentType: 'unknown' },
          issues: ['Nu s-a putut determina tipul documentului'],
          suggestions: [
            'Încărcați o fotografie clară a cărții de identitate (față sau verso) sau a pașaportului',
          ],
        };
    }
  } catch (error) {
    console.error('Document detection error:', error);
    return createErrorResult('unknown', 'Eroare la detectarea tipului de document');
  }
}

/**
 * Combined extraction from both CI front and back
 */
export async function extractFromCIBothSides(
  frontImageBase64: string,
  frontMimeType: string,
  backImageBase64: string,
  backMimeType: string
): Promise<{
  success: boolean;
  confidence: number;
  extractedData: ExtractedPersonalData;
  issues: string[];
  suggestions: string[];
}> {
  // Process both sides in parallel
  const [frontResult, backResult] = await Promise.all([
    extractFromCIFront(frontImageBase64, frontMimeType),
    extractFromCIBack(backImageBase64, backMimeType),
  ]);

  // Merge the results
  const mergedData: ExtractedPersonalData = {
    documentType: 'ci_front',
    // From front
    cnp: frontResult.extractedData.cnp,
    lastName: frontResult.extractedData.lastName,
    firstName: frontResult.extractedData.firstName,
    birthDate: frontResult.extractedData.birthDate,
    birthPlace: frontResult.extractedData.birthPlace,
    gender: frontResult.extractedData.gender,
    nationality: frontResult.extractedData.nationality,
    series: frontResult.extractedData.series,
    number: frontResult.extractedData.number,
    expiryDate: frontResult.extractedData.expiryDate,
    // From back
    issueDate: backResult.extractedData.issueDate,
    issuedBy: backResult.extractedData.issuedBy,
    address: backResult.extractedData.address,
  };

  const allIssues = [...frontResult.issues, ...backResult.issues];
  const allSuggestions = [...frontResult.suggestions, ...backResult.suggestions];

  return {
    success: frontResult.success && backResult.success,
    confidence: Math.min(frontResult.confidence, backResult.confidence),
    extractedData: mergedData,
    issues: [...new Set(allIssues)], // Remove duplicates
    suggestions: [...new Set(allSuggestions)],
  };
}

/**
 * Helper to create error result. When `rawGeminiText` is provided we include
 * a truncated copy in `issues[]` so production logs/console actually show
 * what the model said instead of silently returning confidence: 0.
 */
function createErrorResult(
  documentType: DocumentType,
  message: string,
  rawGeminiText?: string,
): OCRResult {
  const issues = [message];
  if (rawGeminiText) {
    const trimmed = rawGeminiText.trim().slice(0, 500);
    issues.push(`[gemini-raw]: ${trimmed}`);
  }
  return {
    success: false,
    documentType,
    confidence: 0,
    extractedData: { documentType },
    issues,
    suggestions: ['Verificați conexiunea și încercați din nou'],
  };
}

/**
 * Parse Gemini's free-form response into an OCRResult.
 *
 * Gemini sometimes wraps JSON in markdown fences or prepends a sentence
 * even when the prompt says "no markdown". We grab the first complete
 * JSON object (`{...}`) we can find. On failure we bubble the raw text
 * up to the caller's `issues[]` for debugging.
 */
export function parseGeminiOCRResponse(
  rawText: string,
  documentType: DocumentType,
): OCRResult {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return createErrorResult(
      documentType,
      'Nu s-a putut procesa documentul',
      rawText,
    );
  }

  let parsed: {
    success?: boolean;
    confidence?: number;
    extractedData?: Record<string, unknown>;
    issues?: string[];
    suggestions?: string[];
  };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return createErrorResult(
      documentType,
      'Răspuns AI invalid (JSON malformat)',
      rawText,
    );
  }

  return {
    success: parsed.success ?? false,
    documentType,
    confidence: parsed.confidence ?? 0,
    extractedData: {
      ...(parsed.extractedData as ExtractedPersonalData | undefined),
      documentType,
    },
    issues: parsed.issues ?? [],
    suggestions: parsed.suggestions ?? [],
  };
}

/**
 * Convert extracted date format (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
 */
export function convertDateToISO(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;

  // Handle DD.MM.YYYY format
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return undefined;
}
