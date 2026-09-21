import { describe, expect, it } from 'vitest';
import { etapaOf, filterCollabOrders, type FilterableOrder } from '@/lib/collaborator/orders-filter';

const mk = (over: Partial<FilterableOrder>): FilterableOrder => ({
  friendly_order_id: 'E-260101-AAAAA',
  status: 'paid',
  customer_data: { property: { locality: 'Cluj-Napoca', county: 'Cluj' } },
  services: { name: 'Extras CF', slug: 'extras-carte-funciara' },
  ...over,
});

describe('etapaOf', () => {
  it('maps statuses to tabs', () => {
    expect(etapaOf('paid')).toBe('de_depus');
    expect(etapaOf('submitted_to_institution')).toBe('depuse');
    expect(etapaOf('standby')).toBe('blocate');
    expect(etapaOf('on_hold_institution')).toBe('blocate');
    expect(etapaOf('completed')).toBe('livrate');
  });
});

describe('filterCollabOrders', () => {
  const standby = mk({ friendly_order_id: 'E-260728-VWFTT', status: 'standby',
    customer_data: { property: { locality: 'București Sectorul 3', county: 'București' } },
    services: { name: 'Identificare imobil', slug: 'identificare-imobil' } });
  const deDepus = mk({ friendly_order_id: 'E-260901-BBBBB', status: 'paid' });
  const orders = [standby, deDepus];

  it('without search, the tab decides', () => {
    expect(filterCollabOrders(orders, { etapa: 'de_depus', judet: '', cauta: '' })).toEqual([deDepus]);
    expect(filterCollabOrders(orders, { etapa: 'blocate', judet: '', cauta: '' })).toEqual([standby]);
  });

  it('search by order number finds the order in ANY tab (E-260728-VWFTT was standby, tab was de_depus)', () => {
    expect(filterCollabOrders(orders, { etapa: 'de_depus', judet: '', cauta: 'E-260728-VWFTT' })).toEqual([standby]);
    expect(filterCollabOrders(orders, { etapa: 'livrate', judet: '', cauta: 'vwftt' })).toEqual([standby]);
  });

  it('search ignores diacritics and case', () => {
    expect(filterCollabOrders(orders, { etapa: 'de_depus', judet: '', cauta: 'bucuresti sectorul' })).toEqual([standby]);
  });

  it('county filter still applies on top of search', () => {
    expect(filterCollabOrders(orders, { etapa: 'toate', judet: 'Cluj', cauta: 'E-26' })).toEqual([deDepus]);
  });

  it('search matches OCPI registration number and CF', () => {
    const o = mk({ status: 'submitted_to_institution',
      customer_data: { property: { carteFunciara: '123456', cadastral: '7890' }, ocpi_submission: { registration_number: '55123' } } });
    expect(filterCollabOrders([o, deDepus], { etapa: 'de_depus', judet: '', cauta: '55123' })).toEqual([o]);
    expect(filterCollabOrders([o, deDepus], { etapa: 'de_depus', judet: '', cauta: '123456' })).toEqual([o]);
  });
});
