import { describe, it, expect } from 'vitest';
import { ocpiName, bcpiName, ocpiHeaderLine, bcpiHeaderLine } from '@/lib/ancpi/ocpi-header';

describe('antetul cererii', () => {
  it('adresează OCPI-ul județului imobilului', () => {
    expect(ocpiName('Ilfov')).toBe('ILFOV');
    expect(ocpiName('Caraș-Severin')).toBe('CARAȘ-SEVERIN');
    expect(ocpiHeaderLine('Vâlcea')).toBe('OFICIUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ VÂLCEA');
  });

  it('la București numește sectorul — acolo BCPI-urile CHIAR sunt sectoarele', () => {
    expect(bcpiName('București', 'București Sectorul 3')).toBe('SECTORUL 3');
    expect(bcpiHeaderLine('București', 'București Sectorul 6'))
      .toBe('BIROUL DE CADASTRU ȘI PUBLICITATE IMOBILIARĂ SECTORUL 6');
  });

  it('cade pe județ când sectorul lipsește din numele UAT-ului', () => {
    expect(bcpiName('București', 'București')).toBe('BUCUREȘTI');
  });

  it('în rest adresează biroul județean (nu avem maparea UAT → BCPI)', () => {
    expect(bcpiName('Cluj', 'Turda')).toBe('CLUJ');
    expect(bcpiName('Satu Mare', 'Odoreu')).toBe('SATU MARE');
  });

  it('nu se sperie de valori lipsă', () => {
    expect(ocpiName(null)).toBe('');
    expect(bcpiName(undefined, undefined)).toBe('');
  });
});
