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
import { validateCNP } from '@/lib/validations/cnp';

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

⚠️ NUME vs PRENUME (CRITIC):
- "Nume" (Last Name) și "Prenume" (First Name) sunt câmpurile ETICHETATE de pe fața cardului — acelea sunt sursa de adevăr.
- NU pune NICIODATĂ în lastName prefixul din MRZ: "ID" = tipul actului, "ROU" = codul țării. Secvența "IDROU" de la începutul MRZ NU face parte din nume.
- În MRZ numele are formatul SURNAME<<GIVEN_NAMES ("<<" separă numele de prenume, "<" simplu = spațiu).
- Exemplu: pentru MRZ "IDROUANDREI<<EUGEN" → lastName="ANDREI", firstName="EUGEN" (GREȘIT: lastName="IDROU").

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
    // Old CIs carry a TD1 MRZ on the front whose personal-number field holds
    // the CNP — recover it deterministically if Gemini missed the printed one.
    // Then correct the name: Gemini often leaks the "IDROU" (doc-type+country)
    // MRZ prefix into the surname on old TD2 cards — fix it from the MRZ.
    return correctCiFrontNames(
      applyMrzCnpFallback(parseGeminiOCRResponse(text, 'ci_front')),
    );
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
    // eCI back MRZ (TD1, 3 lines) carries the CNP in its personal-number
    // field — recover it so the CNP can backfill even if the front scan missed
    // it. Reliable: scans for the unique validateCNP-passing 13-digit run.
    return applyMrzCnpFallback(parseGeminiOCRResponse(text, 'ci_back')); // reuse parser, document type stays ci_back for backward compat in OCRResult
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

ORIENTAREA IMAGINII: Poza poate fi rotită sau RĂSTURNATĂ (cu susul în jos) — clienții fotografiază des greșit. Analizează conținutul ca și cum ar fi orientat corect, indiferent de cum apare. NU refuza și NU rata câmpuri din cauza orientării. Ignoră degete, masă, fundal.

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
  • CNP — câmpul numerotat "5. Cod Numeric Personal / Personal No. / Nr. personal"
  • Foto color
  • MRZ — 2 rânduri în partea de jos cu "P<ROU..."

⚠️ CNP (CRITIC pentru pașaport ROMÂNESC): pașapoartele românești AU ÎNTOTDEAUNA CNP-ul, 13 cifre. Se găsește în DOUĂ locuri — caută-l în AMBELE și verifică să fie identice:
  1. Câmpul numerotat "5. Cod Numeric Personal/Personal No./Nr. personal" de pe pagina cu foto.
  2. MRZ rândul 2 — ULTIMUL grup lung de cifre (câmpul "personal number"), înainte de cifrele de control finale.
Dacă pașaportul are cetățenia "ROU", CNP-ul NU poate fi null — extrage-l. Pentru pașapoarte STRĂINE (non-ROU) NU există CNP → pune null.

Pașapoarte STRĂINE au fields similare (Surname/Nom, Given names/Prénoms) în engleză + franceză + limba locală și NU au CNP.

IMPORTANT: NU căuta adresa de domiciliu. Pașapoartele NU au adresă printată niciodată.

MRZ-ul (Machine Readable Zone) ICAO 9303-1 (TD3, 2 rânduri × 44 caractere):
  Linia 1: P<<COD_TARA><NUME><<PRENUME><<<...
  Linia 2: <NR_PAȘAPORT(9)><check><COD_TARA(3)><DATA_NAȘTERE(6)><check><SEX><DATA_EXPIRARE(6)><check><PERSONAL_NUMBER(14)><check><check>
  La pașaportul ROMÂNESC câmpul PERSONAL_NUMBER conține CNP-ul (13 cifre).

Extrage MRZ-ul EXACT cum apare, fiecare rând complet, inclusiv toate cifrele. Caracterele "<" sunt padding standard.

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
    return applyMrzCnpFallback(parseGeminiOCRResponse(text, 'passport'));
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
/**
 * Parse Romanian eCI MRZ lines into structured fields.
 *
 * Why this exists: Gemini OCR's extraction of `mrzDocumentNumber` and
 * `mrzCnp` was unreliable — observed on order E-260528-DZ8MS it concatenated
 * `MB1139128` + check digit + CNP into a single string `MB113912841710211434518`,
 * then picked the wrong substring for CNP (3602151 — slice of expiry date).
 * Gemini is good at OCR (reading raw text), bad at strict position-based
 * parsing of fixed-format strings.
 *
 * Solution: extract `mrzRaw[]` (the 3 lines as Gemini reads them, which is
 * accurate) and run a deterministic TS parser to pull document number + CNP.
 *
 * Romanian eCI MRZ format (TD1-like, 3 lines × 30 chars):
 *   Line 1: I + D + ROU + DOC_NUMBER_9 + CHECK_1 + PERSONAL_NUMBER_13 + <pad>
 *           "IDROUMB1139128<4<1710211434518<<<" or "IDROUMB113912841710211434518<<<<"
 *   Line 2: BIRTH_DATE_6 + CHECK_1 + SEX + EXP_DATE_6 + CHECK_1 + NATIONALITY_3 + <pad>
 *   Line 3: SURNAME<<GIVEN_NAMES + <pad>
 *
 * Returns parsed values normalized (no padding `<`, uppercase). If a line
 * is missing or doesn't match the expected format, the corresponding field
 * is undefined and cross-validation skips it.
 */
export function parseRomanianEciMrz(mrzRaw: string[] | undefined): {
  documentNumber?: string;
  cnp?: string;
  birthDate?: string;       // YYMMDD as on MRZ
  sex?: 'M' | 'F';
  expiryDate?: string;      // YYMMDD as on MRZ
  nationality?: string;
  surname?: string;
  givenNames?: string;
} {
  if (!mrzRaw || mrzRaw.length === 0) return {};

  // Strip stray whitespace + padding from each line for easier parsing.
  // We DON'T pad lines to 30 chars because Gemini sometimes truncates the
  // trailing `<<<` — fields we care about are always near the start.
  const lines = mrzRaw.map((l) => (l || '').toUpperCase().trim());

  const out: ReturnType<typeof parseRomanianEciMrz> = {};

  // Line 1: ICAO TD1-style with Romanian eCI layout.
  // Format: "ID" + "ROU" + DOC_NUMBER (9 chars, < pads, alpha-num) +
  //         CHECK_DIGIT (1) + PERSONAL_NUMBER (13 digits) + < pads.
  //
  // Examples observed in the wild:
  //   "IDROUMB113912841710211434518<<<<" — 5 + 9 + 1 + 13 = 28 + pad
  //   "IDROUMB1139128<4<1710211434518<<" — sometimes ANAF adds < between
  //     the segments, sometimes runs them together.
  if (lines[0]) {
    const l1 = lines[0].replace(/\s/g, '');
    if (l1.startsWith('IDROU')) {
      const body = l1.slice(5); // strip "IDROU"
      // Try strict TD1: 9-char doc, 1-char check, 13-digit personal.
      // Allow `<` padding INSIDE the 9-char doc field.
      let m = body.match(/^([A-Z0-9<]{9})(\d)(\d{13})/);
      if (!m) {
        // Some MRZs add explicit `<` separators between the segments.
        // Try: 9-char doc + `<` + 1-digit check + `<` + 13-digit personal.
        m = body.match(/^([A-Z0-9<]{1,9})<+(\d)<+(\d{13})/);
      }
      if (m) {
        out.documentNumber = m[1].replace(/</g, ''); // strip pad
        out.cnp = m[3];
      } else {
        // Last-resort fallback: pull doc as first [A-Z]{2}[0-9]+ token
        // and CNP as the first 13-digit run.
        const docFallback = body.match(/^([A-Z]{1,2}\d{6,8})/);
        if (docFallback) out.documentNumber = docFallback[1];
        const cnpFallback = body.match(/\d{13}/);
        if (cnpFallback) out.cnp = cnpFallback[0];
      }
    }
  }

  // Line 2: birth (6) + check (1) + sex (1) + expiry (6) + check (1) + country (3)
  if (lines[1]) {
    const l2 = lines[1].replace(/\s/g, '');
    const m = l2.match(/^(\d{6})(\d)([MF])(\d{6})(\d)([A-Z]{3})/);
    if (m) {
      out.birthDate = m[1];
      out.sex = m[3] as 'M' | 'F';
      out.expiryDate = m[4];
      out.nationality = m[6];
    }
  }

  // Line 3: surname<<given_names
  if (lines[2]) {
    const l3 = lines[2].replace(/\s/g, '').replace(/<+$/, '');
    const parts = l3.split('<<');
    if (parts[0]) out.surname = parts[0].replace(/</g, ' ').trim();
    if (parts[1]) out.givenNames = parts[1].replace(/</g, ' ').trim();
  }

  return out;
}

/**
 * Recover the holder's surname + given names from a Romanian ID MRZ.
 *
 * Handles BOTH layouts we see in the wild:
 *  - TD2 (old CI, 2-line MRZ): the name sits on LINE 1, right after the
 *    "ID" (document type) + "ROU" (country) prefix, e.g.
 *    "IDROUANDREI<<EUGEN<<<<" → surname=ANDREI, given=EUGEN. The "IDROU" is
 *    NOT the surname — Gemini frequently leaks it into `lastName`.
 *  - TD1 (new eCI, 3-line MRZ): the name sits on LINE 3 as
 *    "SURNAME<<GIVEN_NAMES".
 *
 * The "<<" separator (surname<<given) is the reliable anchor. We scan for the
 * first line that has it, strip a leading IDROU/IROU/I<ROU prefix (but never a
 * bare "I"/"ID" — that would corrupt real surnames like IONESCU), reject any
 * candidate that contains digits (that's the doc-number/CNP line), then split.
 */
export function recoverNamesFromMrz(
  mrz:
    | { line1?: string | null; line2?: string | null; line3?: string | null }
    | string[]
    | undefined,
): { surname?: string; givenNames?: string } {
  if (!mrz) return {};

  const lines: string[] = Array.isArray(mrz)
    ? mrz
    : [mrz.line1 ?? '', mrz.line2 ?? '', mrz.line3 ?? ''];

  for (const raw of lines) {
    let l = (raw || '').toUpperCase().replace(/\s/g, '');
    if (!l.includes('<<')) continue; // a name field always has surname<<given
    // Strip the document-type + issuing-country prefix of a TD2 line-1 name
    // field. Only the specific "IDROU"/"IROU"/"I<ROU" forms — NOT a bare "I".
    l = l.replace(/^I[D<]?ROU/, '');
    const trimmed = l.replace(/<+$/, '');
    if (/\d/.test(trimmed)) continue; // names never contain digits → skip MRZ data lines
    const parts = trimmed.split(/<{2,}/).filter(Boolean);
    const surname = parts[0]?.replace(/</g, ' ').replace(/\s+/g, ' ').trim();
    const given = parts[1]?.replace(/</g, ' ').replace(/\s+/g, ' ').trim();
    if (surname && /[A-Z]/.test(surname)) {
      return { surname, givenNames: given || undefined };
    }
  }
  return {};
}

/** Strip Romanian diacritics + non-letters for case/accent-insensitive compare. */
function deburrName(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks (ă, â, î, ș, ț, ş, ţ)
    .toUpperCase()
    .replace(/[^A-Z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Correct the CI-front `lastName`/`firstName` using the MRZ when Gemini's
 * visual extraction is contaminated — most commonly the "IDROU" document-type
 * + country prefix leaking into the surname on old TD2 cards.
 *
 * Strategy: the MRZ is the source of truth for the surname↔given SPLIT, but the
 * MRZ is ASCII (no diacritics). So we rebuild the split from MRZ and, for each
 * token, recover the diacritic spelling from whatever the visual fields held
 * (matched de-diacritic). We only act when the MRZ yields BOTH a surname and a
 * given name AND the visual split disagrees with it — otherwise it's a no-op.
 */
export function correctCiFrontNames(result: OCRResult): OCRResult {
  const data = result.extractedData as ExtractedPersonalData & {
    mrz?: { line1?: string | null; line2?: string | null; line3?: string | null };
  };

  const mrzNames = recoverNamesFromMrz(data.mrz);
  if (!mrzNames.surname || !mrzNames.givenNames) return result;

  const mrzSur = deburrName(mrzNames.surname);
  const mrzGiv = deburrName(mrzNames.givenNames);

  const visLast = (data.lastName || '').trim();
  const visFirst = (data.firstName || '').trim();

  // Visual split already agrees with the MRZ → keep visual (has diacritics).
  if (deburrName(visLast) === mrzSur && deburrName(visFirst) === mrzGiv) {
    return result;
  }

  // Disagreement → rebuild from MRZ, recovering diacritics from the visual text.
  const visualTokens = `${visLast} ${visFirst}`.trim().split(/\s+/).filter(Boolean);
  const pickSpelling = (mrzToken: string): string => {
    const hit = visualTokens.find((t) => deburrName(t) === mrzToken);
    return hit || mrzToken; // CI names are printed upper-case → MRZ form is fine
  };

  data.lastName = mrzSur.split(' ').map(pickSpelling).join(' ');
  data.firstName = mrzGiv.split(' ').map(pickSpelling).join(' ');

  result.issues = [
    ...(result.issues ?? []).filter((i) => !/nume corectat din mrz/i.test(i)),
    'Nume corectat din MRZ (prefix tip-act/țară eliminat)',
  ];
  return result;
}

/**
 * Parse a passport's TD3 (2-line) MRZ into structured fields + the CNP.
 *
 * The CNP is read by POSITION, not by scanning for any 13-digit run. A blind
 * scan is unsafe: a long concatenated digit run can contain a spurious 13-digit
 * window that happens to pass `validateCNP` (e.g. a nonsense "born 1817" code
 * with a coincidentally-correct checksum) before the real one. The fixed-width
 * TD3 layout lets us target the personal-number field exactly.
 *
 * TD3 line 2 layout (44 chars):
 *   passportNo(9) check(1) nationality(3) birth(6) check(1) sex(1)
 *   expiry(6) check(1) personalNumber(14) check(1) overallCheck(1)
 * Romania puts the CNP (13 digits) at the start of the personal-number field.
 */
export function parsePassportMrz(
  mrz: { line1?: string | null; line2?: string | null } | string[] | undefined,
): {
  passportNumber?: string;
  nationality?: string;
  birthDate?: string; // YYMMDD as on MRZ
  sex?: 'M' | 'F';
  expiryDate?: string; // YYMMDD as on MRZ
  cnp?: string;
} {
  if (!mrz) return {};

  const lines: string[] = Array.isArray(mrz)
    ? mrz
    : [mrz.line1 ?? '', mrz.line2 ?? ''];

  const clean = lines.map((l) => (l || '').toUpperCase().replace(/\s/g, ''));
  if (clean.every((l) => l.length === 0)) return {};

  const out: ReturnType<typeof parsePassportMrz> = {};

  // Find the line that matches the TD3 second-line layout and pull every field
  // by position. Group 9 is the 14-char personal-number field (CNP + padding).
  for (const l of clean) {
    const m = l.match(
      /([A-Z0-9<]{9})(\d)([A-Z<]{1,3})(\d{6})(\d)([MFX<])(\d{6})(\d)([A-Z0-9<]{0,14})/,
    );
    if (m) {
      out.passportNumber = m[1].replace(/</g, '');
      out.nationality = m[3].replace(/</g, '') || undefined;
      out.birthDate = m[4];
      if (m[6] === 'M' || m[6] === 'F') out.sex = m[6];
      out.expiryDate = m[7];
      const personal = (m[9] || '').replace(/</g, '');
      const candidate = personal.slice(0, 13);
      if (candidate.length === 13 && validateCNP(candidate).valid) {
        out.cnp = candidate;
      }
      break;
    }
  }

  return out;
}

/**
 * If Gemini missed (or mis-read) the CNP on a Romanian ID, recover it
 * deterministically from the MRZ. Delegates to the POSITION-BASED parsers
 * (never a blind digit scan): `parseRomanianEciMrz` for the electronic CI back
 * (TD1, 3 lines, `mrzRaw[]`) and `parsePassportMrz` for passports (TD3, 2
 * lines, `mrz.{line1,line2}`). Mutates and returns the same OCRResult. No-op
 * when the CNP is already valid or the MRZ holds no valid CNP (foreign doc).
 */
function applyMrzCnpFallback(result: OCRResult): OCRResult {
  const data = result.extractedData as ExtractedPersonalData & {
    mrz?: { line1?: string | null; line2?: string | null; line3?: string | null };
    mrzRaw?: string[];
  };

  if (data.cnp && validateCNP(data.cnp).valid) return result;

  // Gather MRZ lines from whichever shape the extractor used: `mrzRaw[]` (eCI
  // back) or the `mrz` object (passport / old CI front).
  const lines: string[] = (
    data.mrzRaw?.length
      ? data.mrzRaw
      : [data.mrz?.line1, data.mrz?.line2, data.mrz?.line3]
  ).filter((l): l is string => !!l && l.trim().length > 0);

  if (lines.length === 0) return result;

  // Try both POSITION-BASED parsers — each only matches its own MRZ format
  // (TD1 eCI/old-CI vs TD3 passport), so passing the same lines to both is safe.
  let cnp: string | undefined;
  const eci = parseRomanianEciMrz(lines);
  if (eci.cnp && validateCNP(eci.cnp).valid) cnp = eci.cnp;
  if (!cnp) {
    const pp = parsePassportMrz(lines);
    if (pp.cnp) cnp = pp.cnp; // already validated inside parsePassportMrz
  }

  if (cnp) {
    data.cnp = cnp;
    // Drop any "CNP not found" style noise now that we recovered it.
    result.issues = (result.issues ?? []).filter(
      (i) => !/cnp|cod numeric/i.test(i),
    );
  }
  return result;
}

export function crossValidateExtractedData(scans: {
  ci_front?: ExtractedPersonalData;
  ci_nou_back?: ExtractedCINouBack;
  ro_cei_reader_pdf?: ExtractedROCEIReader;
}): CrossValidationWarning[] {
  const warnings: CrossValidationWarning[] = [];

  const normalize = (s: string | undefined): string =>
    (s ?? '').trim().toLowerCase();

  // Romanian compound given names appear inconsistently across scans:
  //   CI front OCR → "GHEORGHE - CONSTANTIN" (spaces around hyphen)
  //   RO CEI Reader PDF → "GHEORGHE-CONSTANTIN" (no spaces)
  //   MRZ → "GHEORGHE<CONSTANTIN" (parsed to "GHEORGHE CONSTANTIN")
  // All three are the SAME person. Strict whitespace-collapse only wasn't
  // enough — we need to normalize the separator entirely. Approach:
  // 1. strip diacritics + force lowercase (handled by `normalize`)
  // 2. normalize ș/ț that escaped the combining-mark strip
  // 3. replace any run of hyphens/dashes/spaces/punct with a single space
  // 4. collapse remaining whitespace
  // After this, all three variants above flatten to "gheorghe constantin".
  const normalizeName = (s: string | undefined): string =>
    normalize(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // strip combining marks
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .replace(/[-–—_.,]+/g, ' ') // separators → space (handles all dash variants)
      .replace(/\s+/g, ' ')
      .trim();

  // Prefer values parsed FROM the raw MRZ over Gemini's attempted
  // structured extraction. mrzDocumentNumber / mrzCnp from Gemini have
  // been observed concatenated or off-by-segment; the deterministic TS
  // parser on mrzRaw is the source of truth when MRZ lines exist.
  const mrzParsed = parseRomanianEciMrz(scans.ci_nou_back?.mrzRaw);
  const backDocNumber = mrzParsed.documentNumber ?? scans.ci_nou_back?.mrzDocumentNumber;
  const backCnp = mrzParsed.cnp ?? scans.ci_nou_back?.mrzCnp;

  // CI front document number vs MRZ on eCI back. Compare the FULL document
  // identifier (series + number, e.g. "MB1139128"), not just the digits.
  // Front returns `series: 'MB'` and `number: '1139128'` separately; MRZ
  // has them concatenated. Equalize before comparing.
  const frontFullDocNumber = scans.ci_front?.series && scans.ci_front?.number
    ? `${scans.ci_front.series}${scans.ci_front.number}`
    : scans.ci_front?.number;
  if (frontFullDocNumber && backDocNumber) {
    const front = normalize(frontFullDocNumber);
    const back = normalize(backDocNumber);
    if (front !== back) {
      warnings.push({
        field: 'documentNumber',
        values: { ci_front: frontFullDocNumber, ci_nou_back: backDocNumber },
        message: `Numărul documentului de pe față (${frontFullDocNumber}) diferă de cel din MRZ-ul de pe spate (${backDocNumber}).`,
        severity: 'warning',
      });
    }
  }

  // CI front CNP vs MRZ CNP on eCI back
  if (scans.ci_front?.cnp && backCnp) {
    const front = normalize(scans.ci_front.cnp);
    const back = normalize(backCnp);
    if (front !== back) {
      warnings.push({
        field: 'cnp',
        values: { ci_front: scans.ci_front.cnp, ci_nou_back: backCnp },
        message: `CNP-ul de pe față (${scans.ci_front.cnp}) diferă de CNP-ul din MRZ-ul de pe spate (${backCnp}).`,
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

  // CI front document number vs PDF number. Use full doc number
  // (series + number) since PDF reports it as one string like "MB1139128".
  if (frontFullDocNumber && scans.ro_cei_reader_pdf?.number) {
    const front = normalize(frontFullDocNumber);
    const pdf = normalize(scans.ro_cei_reader_pdf.number);
    if (front !== pdf) {
      warnings.push({
        field: 'documentNumber',
        values: { ci_front: frontFullDocNumber, ro_cei_reader_pdf: scans.ro_cei_reader_pdf.number },
        message: `Numărul documentului de pe față (${frontFullDocNumber}) diferă de cel din PDF-ul RO CEI Reader (${scans.ro_cei_reader_pdf.number}).`,
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

ORIENTAREA IMAGINII: Poza poate fi rotită sau RĂSTURNATĂ (cu susul în jos). Analizează conținutul ca și cum ar fi orientat corect, indiferent de cum apare. NU rata câmpuri din cauza orientării.

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
- CNP — 13 cifre, OBLIGATORIU pentru pașaport ROMÂNESC (cetățenie "ROU")

⚠️ CNP (pașaport ROMÂNESC): caută-l în AMBELE locuri:
  1. Câmpul "5. Cod Numeric Personal / Personal No. / Nr. personal".
  2. MRZ rândul 2 — ultimul grup lung de cifre (câmpul "personal number").
Cetățenie "ROU" → CNP-ul NU poate fi null. Pașaport STRĂIN (non-ROU) → CNP null.

Extrage MRZ-ul (Machine Readable Zone, 2 rânduri de la baza paginii cu foto) EXACT cum apare, complet.

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
    "issuedBy": "string sau null",
    "mrz": {
      "line1": "primul rând MRZ sau null",
      "line2": "al doilea rând MRZ sau null"
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
    return applyMrzCnpFallback(parseGeminiOCRResponse(text, 'passport'));
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
