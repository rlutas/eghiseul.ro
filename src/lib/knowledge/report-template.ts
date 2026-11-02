/**
 * Șabloanele formularului „Raportează" din Ghid (echipă + colaborator).
 *
 * Problema reală: rapoarte de tipul „nu merge" fără cod de comandă, fără
 * mesajul erorii și cu o captură de ecran care nu arată eroarea. Formularul
 * pune în casetă un șablon (doar când e goală), arată un exemplu bun și unul
 * slab, iar la trimitere avertizează (nu blochează) când lipsesc lucrurile
 * esențiale. API-ul și stocarea rămân neschimbate.
 */

export type ReportFormKind = 'problema' | 'sugestie';

export interface ReportGuide {
  /** Rândul scurt de deasupra casetei. */
  hint: string;
  /** Textul pus în casetă când e goală. Fiecare rând = o etichetă. */
  template: string;
  good: string;
  bad: string;
}

export const REPORT_GUIDES: Record<ReportFormKind, ReportGuide> = {
  problema: {
    hint: 'Completează fiecare rând. Fără cod de comandă și mesajul exact, Raul nu poate reproduce problema.',
    template: [
      'Cod comandă: ',
      'Ce ai făcut (pașii): ',
      'Ce s-a întâmplat (mesajul exact de pe ecran): ',
      'Ce te așteptai să se întâmple: ',
      'Captură de ecran: atașează poza cu eroarea, nu alta',
    ].join('\n'),
    good: 'Cod comandă: E-260921-ABCDE. Am apăsat „Generează AWB” (easybox Satu Mare). După 5 secunde apare roșu „Locker indisponibil”. Mă așteptam să iasă AWB-ul. Poza arată mesajul roșu.',
    bad: '„Nu merge AWB-ul.” (fără comandă, fără mesaj, poza cu altă pagină)',
  },
  sugestie: {
    hint: 'Spune ce vrei să poți face și unde. Un exemplu concret ajută cel mai mult.',
    template: [
      'Ce vrei să poți face: ',
      'Unde (pagina / butonul): ',
      'De ce / cât de des apare: ',
      'Exemplu concret (cod comandă): ',
    ].join('\n'),
    good: 'Vreau să pot schimba serviciul unei comenzi plătite. Unde: pagina comenzii, lângă „Modifică”. Apare de 2–3 ori pe săptămână. Exemplu: E-261007-ABCDE (plătit cazier judiciar, voia cazier fiscal).',
    bad: '„Ar trebui să fie mai simplu.”',
  },
};

const TEMPLATES = Object.values(REPORT_GUIDES).map((g) => g.template);

/** Etichetele șablonului (textul de dinainte de „:"), pentru a le scoate la verificare. */
function templateLabels(): string[] {
  const out = new Set<string>();
  for (const t of TEMPLATES) {
    for (const line of t.split('\n')) out.add(line.trim());
    for (const line of t.split('\n')) {
      const i = line.indexOf(':');
      if (i > 0) out.add(line.slice(0, i + 1).trim());
    }
  }
  // Cele mai lungi întâi, ca rândul întreg să fie scos înaintea etichetei.
  return [...out].sort((a, b) => b.length - a.length);
}
const LABELS = templateLabels();

/** Caseta e goală sau conține doar un șablon neatins → se poate (re)completa. */
export function canPrefill(message: string): boolean {
  const m = message.trim();
  return m === '' || TEMPLATES.some((t) => t.trim() === m);
}

/** Textul scris de om, fără etichetele șablonului. */
export function strippedReportText(message: string): string {
  let s = message;
  for (const l of LABELS) s = s.split(l).join(' ');
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Câte rânduri din șablon au rămas necompletate (eticheta urmată de nimic).
 * Rândul cu captura nu se numără: e o instrucțiune, nu o întrebare.
 */
export function unfilledTemplateLines(message: string, kind: ReportFormKind): string[] {
  const lines = message.split('\n');
  const missing: string[] = [];
  for (const tLine of REPORT_GUIDES[kind].template.split('\n')) {
    const label = tLine.slice(0, tLine.indexOf(':') + 1).trim();
    if (!label || label.startsWith('Captură')) continue;
    const line = lines.find((l) => l.trim().startsWith(label));
    if (!line) continue; // rândul a fost rescris liber — nu-l mai urmărim
    if (line.trim().slice(label.length).trim() === '') missing.push(label.replace(/:$/, ''));
  }
  return missing;
}

/** Cod de comandă: eghiseul/documentero `E-YYMMDD-XXXXX`, CJO `CJO-YYYYMMDD-N`, alte prefixe la fel. */
const ORDER_CODE_RE = /\b(?:E-\d{6}-[A-Z0-9]{5}|CJO-\d{6,8}-[A-Z0-9]+|[A-Z]{2,4}-\d{6,8}-[A-Z0-9]{4,6})\b/i;

export function hasOrderCode(...texts: Array<string | null | undefined>): boolean {
  return texts.some((t) => !!t && ORDER_CODE_RE.test(t));
}

export interface ReportCheckInput {
  kind: ReportFormKind;
  message: string;
  orderNumber?: string;
  screenshots: number;
}

/**
 * Avertismente înainte de trimitere. Nu blochează: echipa poate trimite oricum
 * (ex. o problemă care nu ține de o comandă).
 */
export function reportWarnings(input: ReportCheckInput): string[] {
  const warnings: string[] = [];
  const own = strippedReportText(input.message);
  if (own.length < 10) {
    warnings.push('Ai lăsat șablonul necompletat: scrie ce s-a întâmplat.');
    return warnings;
  }
  if (input.kind === 'problema') {
    if (!hasOrderCode(input.message, input.orderNumber)) {
      warnings.push('Lipsește codul comenzii (ex. E-261102-ABCDE sau CJO-…).');
    }
    const unfilled = unfilledTemplateLines(input.message, 'problema');
    if (unfilled.some((l) => l.startsWith('Ce s-a întâmplat'))) {
      warnings.push('Lipsește mesajul erorii (ce scrie exact pe ecran).');
    }
    const other = unfilled.filter((l) => !l.startsWith('Ce s-a întâmplat') && !l.startsWith('Cod comandă'));
    if (other.length) warnings.push(`Rânduri necompletate: ${other.join(', ')}.`);
    if (input.screenshots === 0) {
      warnings.push('Nu ai atașat nicio captură: o poză cu eroarea economisește un drum.');
    }
  } else {
    const unfilled = unfilledTemplateLines(input.message, 'sugestie');
    if (unfilled.length) warnings.push(`Rânduri necompletate: ${unfilled.join(', ')}.`);
  }
  return warnings;
}
