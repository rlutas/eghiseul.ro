import { describe, expect, it } from 'vitest';
import {
  REPORT_GUIDES,
  canPrefill,
  hasOrderCode,
  reportWarnings,
  strippedReportText,
  unfilledTemplateLines,
} from '@/lib/knowledge/report-template';

const P = REPORT_GUIDES.problema.template;
const fill = (map: Record<string, string>) =>
  P.split('\n')
    .map((l) => {
      const label = l.slice(0, l.indexOf(':') + 1);
      return map[label] !== undefined ? `${label} ${map[label]}` : l;
    })
    .join('\n');

describe('report template', () => {
  it('prefills only an empty box or an untouched template', () => {
    expect(canPrefill('')).toBe(true);
    expect(canPrefill(P)).toBe(true);
    expect(canPrefill(REPORT_GUIDES.sugestie.template)).toBe(true);
    expect(canPrefill(`${P}\nceva`)).toBe(false);
  });

  it('strips the labels so an untouched template counts as empty', () => {
    expect(strippedReportText(P)).toBe('');
    expect(strippedReportText(fill({ 'Cod comandă:': 'E-261102-ABCDE' }))).toBe('E-261102-ABCDE');
  });

  it('recognises order codes on every platform format', () => {
    expect(hasOrderCode('la E-261102-AB12C nu merge')).toBe(true);
    expect(hasOrderCode('CJO-20260804-15831')).toBe(true);
    expect(hasOrderCode('', 'e-261102-abcde')).toBe(true);
    expect(hasOrderCode('comanda de ieri')).toBe(false);
  });

  it('lists unfilled lines but not the screenshot instruction', () => {
    const msg = fill({ 'Cod comandă:': 'E-261102-ABCDE', 'Ce ai făcut (pașii):': 'am apăsat Generează AWB' });
    expect(unfilledTemplateLines(msg, 'problema')).toEqual([
      'Ce s-a întâmplat (mesajul exact de pe ecran)',
      'Ce te așteptai să se întâmple',
    ]);
  });
});

describe('reportWarnings', () => {
  it('flags an untouched template', () => {
    expect(reportWarnings({ kind: 'problema', message: P, screenshots: 0 })).toEqual([
      'Ai lăsat șablonul necompletat: scrie ce s-a întâmplat.',
    ]);
  });

  it('problem without order code / error message / screenshot', () => {
    const w = reportWarnings({ kind: 'problema', message: 'Nu merge AWB-ul deloc azi', screenshots: 0 });
    expect(w.join(' ')).toContain('codul comenzii');
    expect(w.join(' ')).toContain('captură');
  });

  it('order code in the separate field counts', () => {
    const msg = fill({
      'Ce ai făcut (pașii):': 'Generează AWB',
      'Ce s-a întâmplat (mesajul exact de pe ecran):': 'Locker indisponibil',
      'Ce te așteptai să se întâmple:': 'AWB emis',
    });
    expect(reportWarnings({ kind: 'problema', message: msg, orderNumber: 'E-261102-ABCDE', screenshots: 1 })).toEqual([]);
  });

  it('missing error message is called out by name', () => {
    const msg = fill({ 'Cod comandă:': 'E-261102-ABCDE', 'Ce ai făcut (pașii):': 'Generează AWB', 'Ce te așteptai să se întâmple:': 'AWB' });
    expect(reportWarnings({ kind: 'problema', message: msg, screenshots: 1 })).toEqual([
      'Lipsește mesajul erorii (ce scrie exact pe ecran).',
    ]);
  });

  it('suggestions do not need an order code or screenshot', () => {
    expect(reportWarnings({ kind: 'sugestie', message: 'Vreau un buton de export în lista de comenzi', screenshots: 0 })).toEqual([]);
  });
});
