import { describe, expect, it } from 'vitest';
import { groupBySupplier, posMerchant, supplierFor } from '@/lib/accounting/supplier-invoices';

const pos = (merchant: string, amount: string) =>
  `EPOS 01/09/2026 273707000580423 TID:99999999 ${merchant}  cc@x.com IE 42440827 valoare tranzactie: ${amount} RRN:624440417294 comision tranzactie 0.00 RON; EDIGITALIZARE S R L;`;

describe('supplierFor', () => {
  it('catches RON-billed ad platforms the old foreign-currency rule missed', () => {
    expect(supplierFor({ description: pos('FACEBK *95TKU2SB34', '34.00 RON'), debit_bani: 3400 })?.key).toBe('meta');
    expect(supplierFor({ description: pos('GOOGLE *ADS6779955005', '465.64 RON'), debit_bani: 46564 })?.key).toBe('google_ads');
    expect(supplierFor({ description: pos('TikTok Ads', '13.00 RON'), debit_bani: 1300 })?.key).toBe('tiktok');
  });

  it('leaves DHL paid through MyBill out: its invoice arrives in SPV', () => {
    const d = 'EPOS 31/08/2026 498750000374349 TID:99999999 Wallet payment from MyBil  BUCURESTI RO 42440827 valoare tranzactie: 797.43 RON RRN:624306345275';
    expect(supplierFor({ description: d, debit_bani: 79743 })).toBeNull();
  });

  it('separates Google Cloud from Google Ads', () => {
    expect(supplierFor({ description: pos('GOOGLE*CLOUD LCBZXD', '2.39 USD'), debit_bani: 1109 })?.key).toBe('google_cloud');
  });

  it('groups unknown foreign POS merchants by name', () => {
    expect(supplierFor({ description: pos('SOME SAAS INC', '10.00 USD'), debit_bani: 4600 })).toMatchObject({
      key: 'pos:SOME SAAS INC',
      label: 'SOME SAAS INC',
    });
  });

  it('ignores credits and Romanian suppliers paid by OP (their invoice is in SPV)', () => {
    expect(supplierFor({ description: pos('OPENAI', '20.00 USD'), debit_bani: 0 })).toBeNull();
    expect(supplierFor({ description: '270500117549;218;DELIVERY SOLUTIONS S.A.;RO23BTRL...', debit_bani: 9347 })).toBeNull();
    expect(supplierFor({ description: pos('OMV 1947', '500.00 RON'), debit_bani: 50000 })).toBeNull();
  });
});

describe('posMerchant', () => {
  it('reads the merchant between TID and the double space', () => {
    expect(posMerchant(pos('ANTHROPIC* CLAUDE SUB', '100.00 USD'))).toBe('ANTHROPIC* CLAUDE SUB');
  });
});

describe('groupBySupplier', () => {
  it('sums payments per supplier, biggest first', () => {
    const groups = groupBySupplier([
      { reference: 'a', tx_date: '2026-09-01', description: pos('FACEBK *A', '10.00 RON'), debit_bani: 1000 },
      { reference: 'b', tx_date: '2026-09-02', description: pos('FACEBK *B', '20.00 RON'), debit_bani: 2000 },
      { reference: 'c', tx_date: '2026-09-03', description: pos('OPENAI', '100.00 USD'), debit_bani: 46000 },
      { reference: 'd', tx_date: '2026-09-03', description: 'Pachet PJ', debit_bani: 2900 },
    ]);
    expect(groups.map((g) => [g.key, g.count, g.total_bani])).toEqual([
      ['openai', 1, 46000],
      ['meta', 2, 3000],
    ]);
  });
});
