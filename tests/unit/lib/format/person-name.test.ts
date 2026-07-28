import { describe, expect, it } from 'vitest';
import { cleanNamePart, formatPersonName, formatPersonNameFrom } from '@/lib/format/person-name';

describe('cleanNamePart — separatori MRZ', () => {
  it('cazul real E-260728-YFHH2: prenumele din pașaport venea „ADRIAN<MIHAIL"', () => {
    expect(cleanNamePart('ADRIAN<MIHAIL')).toBe('ADRIAN MIHAIL');
  });

  it('umplutura MRZ multiplă se colapsează într-un singur spațiu', () => {
    expect(cleanNamePart('PEROUPOPA<<ADRIAN<MIHAIL')).toBe('PEROUPOPA ADRIAN MIHAIL');
  });

  it('taie separatorii rămași la capete', () => {
    expect(cleanNamePart('<<POPESCU<<')).toBe('POPESCU');
  });

  it('nu atinge literele: diacriticele și majusculele rămân', () => {
    expect(cleanNamePart('Gheorghiță Ștefănescu')).toBe('Gheorghiță Ștefănescu');
  });

  it('null/undefined/gol → string gol', () => {
    expect(cleanNamePart(null)).toBe('');
    expect(cleanNamePart(undefined)).toBe('');
    expect(cleanNamePart('   ')).toBe('');
  });
});

describe('formatPersonName — ordinea românească', () => {
  it('numele de familie stă primul', () => {
    expect(formatPersonName('PEROUPOPA', 'ADRIAN<MIHAIL')).toBe('PEROUPOPA ADRIAN MIHAIL');
  });

  it('merge și cu un singur câmp completat', () => {
    expect(formatPersonName('POPESCU', '')).toBe('POPESCU');
    expect(formatPersonName('', 'Ion')).toBe('Ion');
  });

  it('fără nume structurat, folosește forma compusă — curățată, dar NEreordonată', () => {
    // Nu putem ști unde se termină numele de familie într-un singur șir liber.
    expect(formatPersonName(null, null, 'Ion Popescu<')).toBe('Ion Popescu');
  });

  it('forma compusă e ignorată când avem câmpuri structurate', () => {
    expect(formatPersonName('POPESCU', 'Ion', 'Altceva Total')).toBe('POPESCU Ion');
  });
});

describe('formatPersonNameFrom — prima sursă completată câștigă', () => {
  it('sare peste sursele goale', () => {
    expect(
      formatPersonNameFrom({}, { firstName: 'Ion', lastName: 'POPESCU' }, { name: 'ignorat' })
    ).toBe('POPESCU Ion');
  });

  it('cade pe `name` când nu există câmpuri structurate nicăieri', () => {
    expect(formatPersonNameFrom(null, {}, { name: 'SC Ceva SRL' })).toBe('SC Ceva SRL');
  });

  it('toate goale → string gol', () => {
    expect(formatPersonNameFrom(null, undefined, {})).toBe('');
  });
});
