import { describe, it, expect } from 'vitest';
import { cereriForOrder } from '@/lib/ancpi/cereri-for-order';

const DATE = '21.08.2026';

describe('cereriForOrder', () => {
  it('builds one cerere per imobil — never one cerere with several CFs', () => {
    const cereri = cereriForOrder({
      friendly_order_id: 'E-260821-AAA',
      customer_data: {
        property: {
          county: 'Vâlcea',
          locality: 'Baile Govora',
          carteFunciara: '101010',
          additionalImobile: [
            { locality: 'Alunu', carteFunciara: '2002', cadastral: '2002-C1-U1' },
          ],
        },
      },
    }, DATE);

    expect(cereri).toHaveLength(2);
    expect(cereri[0].name).toBe('cf 101010 - Baile Govora-Valcea.pdf');
    expect(cereri[1].name).toBe('cf 2002 - Alunu-Valcea.pdf');
  });

  it('carries the order county over to additional imobile (the wizard only asks once)', () => {
    const [, second] = cereriForOrder({
      friendly_order_id: 'E-1',
      customer_data: {
        property: {
          county: 'Cluj',
          locality: 'Cluj-Napoca',
          carteFunciara: '1',
          additionalImobile: [{ locality: 'Florești', carteFunciara: '2' }],
        },
      },
    }, DATE);

    expect(second.data.uat).toBe('Florești');
    expect(second.name).toBe('cf 2 - Floresti-Cluj.pdf');
  });

  it('falls back to the order locality when an additional imobil has none', () => {
    const [, second] = cereriForOrder({
      friendly_order_id: 'E-1',
      customer_data: {
        property: {
          county: 'Cluj',
          locality: 'Cluj-Napoca',
          carteFunciara: '1',
          additionalImobile: [{ carteFunciara: '2' }],
        },
      },
    }, DATE);

    expect(second.data.uat).toBe('Cluj-Napoca');
  });

  it('printează pe cerere exact numărul din denumire, normalizat la fel', () => {
    const [only] = cereriForOrder({
      friendly_order_id: 'E-260717-JA6NT',
      customer_data: {
        property: { county: 'Timiș', locality: 'Timisoara', carteFunciara: '431001 C1 U2' },
      },
    }, DATE);

    expect(only.data.carteFunciara).toBe('431001-C1-U2');
    expect(only.name).toBe('cf 431001-C1-U2 - Timisoara-Timis.pdf');
  });

  it('uses the topografic number when there is no cadastral one', () => {
    const [only] = cereriForOrder({
      friendly_order_id: 'E-1',
      customer_data: {
        property: { county: 'Cluj', locality: 'Cluj-Napoca', carteFunciara: '1', topografic: '4567/2' },
      },
    }, DATE);

    expect(only.data.cadastral).toBe('4567/2');
  });

  it('stamps every cerere with the given date', () => {
    const [only] = cereriForOrder({
      friendly_order_id: 'E-1',
      customer_data: { property: { county: 'Cluj', locality: 'Cluj-Napoca', carteFunciara: '1' } },
    }, DATE);

    expect(only.data.date).toBe(DATE);
  });

  it('returns nothing when the order carries no property data at all', () => {
    expect(cereriForOrder({ friendly_order_id: 'E-1', customer_data: {} }, DATE)).toEqual([]);
    expect(cereriForOrder({ friendly_order_id: 'E-1', customer_data: null }, DATE)).toEqual([]);
  });

  it('skips an additional row the client left empty', () => {
    const cereri = cereriForOrder({
      friendly_order_id: 'E-1',
      customer_data: {
        property: {
          county: 'Cluj',
          locality: 'Cluj-Napoca',
          carteFunciara: '1',
          additionalImobile: [{ locality: 'Florești', carteFunciara: '', cadastral: '' }],
        },
      },
    }, DATE);

    expect(cereri).toHaveLength(1);
  });

  it('indexes the cereri so a download link can address one of them', () => {
    const cereri = cereriForOrder({
      friendly_order_id: 'E-1',
      customer_data: {
        property: {
          county: 'Cluj',
          locality: 'Cluj-Napoca',
          carteFunciara: '1',
          additionalImobile: [{ carteFunciara: '2' }],
        },
      },
    }, DATE);

    expect(cereri.map(c => c.index)).toEqual([0, 1]);
  });
});
