import { describe, expect, it } from 'vitest';
import { canAllocateBarouNumbers } from '@/lib/documents/barou-allocation-gate';

// 15.09.2026: după „Dovadă verificată — pornește lucrul" (E-260912-5SNRM),
// butonul manual „Generează împuternicire" răspundea „Numerele Barou se alocă
// doar după plată" — ruta de generare verifica doar payment_status='paid'.
// Gardă pură, partajată de ruta manuală și de alocarea automată.

describe('canAllocateBarouNumbers', () => {
  it('permite pe comanda plătită', () => {
    expect(canAllocateBarouNumbers({ payment_status: 'paid', proof_verified_at: null })).toBe(true);
  });

  it('permite pe transfer bancar cu dovada verificată, chiar dacă banii nu au intrat', () => {
    expect(
      canAllocateBarouNumbers({
        payment_status: 'awaiting_verification',
        proof_verified_at: '2026-09-15T05:36:34.585Z',
      })
    ).toBe(true);
  });

  it('refuză comanda neplătită fără dovadă verificată', () => {
    for (const payment_status of ['pending', 'awaiting_verification', 'failed', null, undefined]) {
      expect(canAllocateBarouNumbers({ payment_status, proof_verified_at: null })).toBe(false);
      expect(canAllocateBarouNumbers({ payment_status, proof_verified_at: undefined })).toBe(false);
    }
  });
});
