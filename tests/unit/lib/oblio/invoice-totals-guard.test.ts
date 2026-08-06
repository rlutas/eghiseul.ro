/**
 * Gardă fiscală: liniile facturii trebuie să dea exact suma încasată.
 *
 * Bug real (`WP-260707-99959`, import din WordPress): comanda avea
 * `base_price` 998 și `delivery_price` 0, deși clienta plătise 1.049 (799
 * serviciu + 250 livrare DHL). Cron-ul de „heal" a emis EGI2024-24314 pe
 * 998 lei, cu încasare de 1.049 — factură greșită, needitabilă prin API.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/oblio/client', () => ({
  oblioRequest: vi.fn(),
  getOblioConfig: vi.fn(() => ({
    apiEmail: 'test@example.com',
    secretKey: 'secret',
    companyCif: '12345678',
    seriesName: 'EGH',
  })),
}));

import { findInvoiceTotalsMismatch } from '@/lib/oblio/invoice';

describe('findInvoiceTotalsMismatch', () => {
  it('prinde cazul real WP-260707-99959 (livrarea lipsă din linii)', () => {
    const msg = findInvoiceTotalsMismatch({
      friendly_order_id: 'WP-260707-99959',
      base_price: 998,
      total_price: 1049,
      delivery_price: 0,
    });
    expect(msg).toContain('998.00');
    expect(msg).toContain('1049.00');
    expect(msg).toContain('WP-260707-99959');
  });

  it('acceptă o comandă normală: serviciu + opțiuni + livrare', () => {
    expect(
      findInvoiceTotalsMismatch({
        friendly_order_id: 'E-1',
        base_price: 198,
        selected_options: [
          { code: 'urgenta', option_name: 'Urgentă', price_modifier: 80 },
          { code: 'apostila', option_name: 'Apostilă', price_modifier: 198 },
        ],
        delivery_price: 25,
        total_price: 501,
      }),
    ).toBeNull();
  });

  it('acceptă reducerea din cupon', () => {
    expect(
      findInvoiceTotalsMismatch({
        friendly_order_id: 'E-2',
        base_price: 198,
        discount_amount: 19.8,
        total_price: 178.2,
      }),
    ).toBeNull();
  });

  it('acceptă comanda fără base_price (cade pe total)', () => {
    expect(findInvoiceTotalsMismatch({ friendly_order_id: 'E-3', total_price: 198 })).toBeNull();
  });

  it('tolerează rotunjirea sub un ban', () => {
    expect(
      findInvoiceTotalsMismatch({ friendly_order_id: 'E-4', base_price: 178.2, total_price: 178.205 }),
    ).toBeNull();
  });

  it('prinde și diferența în plus (linii mai mari decât încasarea)', () => {
    const msg = findInvoiceTotalsMismatch({
      friendly_order_id: 'E-5',
      base_price: 998,
      selected_options: [{ code: 'x', option_name: 'Extra', price_modifier: 500 }],
      total_price: 998,
    });
    expect(msg).toContain('1498.00');
  });
});
