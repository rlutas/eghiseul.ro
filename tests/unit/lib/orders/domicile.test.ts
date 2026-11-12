import { describe, it, expect } from 'vitest';
import { domicileAbroadOf, formatDomicileAbroad, resolveDomicile } from '@/lib/orders/domicile';
import { buildClientDetailsBlock } from '@/lib/documents/generator';

const romanian = { county: 'Cluj', city: 'Cluj-Napoca', street: 'Exemplu', number: '10', apartment: '3' };

describe('resolveDomicile', () => {
  it('returns the Romanian address with its parts', () => {
    const d = resolveDomicile({ address: romanian });
    expect(d.abroad).toBe(false);
    expect(d.text).toBe('Str. Exemplu, Nr. 10, Ap. 3, Cluj-Napoca, Jud. Cluj');
    expect(d.parts).toMatchObject({ county: 'Cluj', city: 'Cluj-Napoca', street: 'Exemplu' });
  });

  it('prints the address abroad with its country and drops the structured parts', () => {
    const d = resolveDomicile({ domicileAbroad: { country: 'Spania', address: 'Calle Mayor 5, 29649 Mijas' } });
    expect(d).toEqual({ abroad: true, text: 'Calle Mayor 5, 29649 Mijas, Spania' });
  });

  it('lets the domicile abroad win over a Romanian address left in the data', () => {
    // the placeholder the client of E-261112-7A93Y typed: „-", București
    const d = resolveDomicile({
      address: { county: 'București', city: 'Municipiul Bucuresti', street: '-', number: '' },
      domicileAbroad: { country: 'Spania', address: 'Calle Mayor 5, Mijas' },
    });
    expect(d.abroad).toBe(true);
    expect(d.text).not.toMatch(/Bucure/);
    expect(d.parts).toBeUndefined();
  });

  it('ignores an untouched „abroad" choice (no country, no address)', () => {
    const d = resolveDomicile({ address: romanian, domicileAbroad: { country: '', address: '  ' } });
    expect(d.abroad).toBe(false);
    expect(d.parts?.county).toBe('Cluj');
  });

  it('keeps an empty address empty, as before', () => {
    const d = resolveDomicile({ address: { county: '', city: '', street: '', number: '' } });
    expect(d).toMatchObject({ abroad: false, text: '' });
    expect(resolveDomicile({}).text).toBe('');
    expect(resolveDomicile(null).text).toBe('');
  });

  it('does not read the foreign-citizen fields', () => {
    const d = resolveDomicile({ foreignData: { hasRomanianAddress: false, foreignAddress: 'Rue 1, Paris', birthCountry: 'Franța' } });
    expect(d).toEqual({ abroad: false, text: '' });
  });
});

describe('formatDomicileAbroad', () => {
  it('does not repeat a country the client already typed', () => {
    expect(formatDomicileAbroad({ country: 'Spania', address: 'Calle Mayor 5, Mijas, Spania' })).toBe('Calle Mayor 5, Mijas, Spania');
  });

  it('copes with one of the two missing', () => {
    expect(formatDomicileAbroad({ country: 'Spania', address: '' })).toBe('Spania');
    expect(domicileAbroadOf({ domicileAbroad: null })).toBeNull();
  });
});

describe('the contract parties block', () => {
  const client = (personal: unknown) => {
    const d = resolveDomicile(personal);
    return { name: 'SPECIMEN ANA', firstName: 'ANA', lastName: 'SPECIMEN', cnp: '2900101400014', email: '', phone: '', address: d.text, address_parts: d.parts } as Parameters<typeof buildClientDetailsBlock>[0];
  };

  it('prints the domicile abroad', () => {
    const block = buildClientDetailsBlock(client({ domicileAbroad: { country: 'Spania', address: 'Calle Mayor 5, Mijas' } }));
    expect(block).toContain('cu domiciliul în Calle Mayor 5, Mijas, Spania');
  });

  it('prints the Romanian domicile as before', () => {
    expect(buildClientDetailsBlock(client({ address: romanian }))).toContain(
      'cu domiciliul în Str. Exemplu, Nr. 10, Ap. 3, Localitatea Cluj-Napoca, Jud. Cluj'
    );
  });

  it('prints no domicile when the address was left empty (unchanged behaviour)', () => {
    expect(buildClientDetailsBlock(client({ address: { county: '', city: '', street: '', number: '' } }))).not.toContain('domiciliul');
  });
});
