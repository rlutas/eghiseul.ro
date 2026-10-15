import { describe, expect, it } from 'vitest';
import { cancelFeeOnlyNote } from '@/lib/accounting/extra-invoice-match';

describe('cancelFeeOnlyNote', () => {
  it('charge row: the cancel-fee invoice covers 59,40 lei, not the 198 lei collected (EGH-0692)', () => {
    const note = cancelFeeOnlyNote({ type: 'charge', invoiceNumber: 'EGH-0692', totalBani: 19800, refundedBani: 13860 });
    expect(note).toBe(
      'EGH-0692 = 59,40 lei (taxa de anulare 30%), NU 198,00 lei: din 198,00 lei încasați s-au rambursat 138,60 lei; fără factură inițială'
    );
  });

  it('refund row: no storno because there was no initial invoice', () => {
    const note = cancelFeeOnlyNote({ type: 'refund', invoiceNumber: 'EGH-0681', totalBani: 19800, refundedBani: 13860 });
    expect(note).toContain('rambursare 138,60 lei (70%), fără storno');
    expect(note).toContain('EGH-0681 = 59,40 lei');
  });
});
