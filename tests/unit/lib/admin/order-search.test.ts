import { describe, expect, it } from 'vitest';
import { applyOrderSearch, orderSearchTerms, ORDER_SEARCH_FIELDS } from '@/lib/admin/order-search';

describe('orderSearchTerms', () => {
  it('desparte fraza în cuvinte', () => {
    expect(orderSearchTerms('  Popescu   Ion ')).toEqual(['Popescu', 'Ion']);
  });

  it('codul de comandă și emailul rămân întregi', () => {
    expect(orderSearchTerms('E-261028-LJ9V3')).toEqual(['E-261028-LJ9V3']);
    expect(orderSearchTerms('ion.pop_1@gmail.com')).toEqual(['ion.pop_1@gmail.com']);
  });

  it('scoate caracterele care rup filtrul PostgREST', () => {
    expect(orderSearchTerms('Pop, Ion (SRL) "x" 50%')).toEqual(['Pop', 'Ion', 'SRL', 'x', '50']);
  });

  it('gol → fără termeni; cel mult 5 cuvinte', () => {
    expect(orderSearchTerms('')).toEqual([]);
    expect(orderSearchTerms(' , ( ) ')).toEqual([]);
    expect(orderSearchTerms('a b c d e f g')).toHaveLength(5);
  });
});

describe('applyOrderSearch', () => {
  const recorder = () => {
    const calls: string[] = [];
    const q = { or(f: string) { calls.push(f); return q; } };
    return { q, calls };
  };

  it('un grup or() pe cuvânt: fiecare cuvânt trebuie să se potrivească undeva', () => {
    const { q, calls } = recorder();
    applyOrderSearch(q, 'Popescu Ion');
    expect(calls).toHaveLength(2);
    expect(calls[0]).toContain('customer_data->personal->>lastName.ilike.%Popescu%');
    expect(calls[1]).toContain('customer_data->personal->>firstName.ilike.%Ion%');
  });

  it('caută numele și în facturare și la firmă (comenzi imobiliare, PJ)', () => {
    const { q, calls } = recorder();
    applyOrderSearch(q, 'Ionescu');
    for (const f of ['billing->>lastName', 'billing->>companyName', 'company->>companyName', 'friendly_order_id', 'contact->>phone']) {
      expect(calls[0]).toContain(f);
    }
    expect(calls[0].split(',')).toHaveLength(ORDER_SEARCH_FIELDS.length);
  });

  it('fără text → interogarea rămâne neatinsă', () => {
    const { q, calls } = recorder();
    expect(applyOrderSearch(q, '   ')).toBe(q);
    expect(calls).toEqual([]);
  });
});
