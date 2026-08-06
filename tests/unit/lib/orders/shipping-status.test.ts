/**
 * AWB manual (DHL/Poșta) trebuie să treacă comanda pe „expediată", la fel ca
 * generarea automată Fan/Sameday — raportat de echipă 06.08.2026.
 */
import { describe, it, expect } from 'vitest';
import { shouldMarkShippedOnAwb } from '@/lib/orders/shipping-status';

describe('shouldMarkShippedOnAwb', () => {
  it('trece pe shipped din stările de lucru', () => {
    for (const s of [
      'paid',
      'processing',
      'documents_generated',
      'submitted_to_institution',
      'document_received',
      'document_ready',
      'extras_in_progress',
      'standby',
    ]) {
      expect(shouldMarkShippedOnAwb(s), s).toBe(true);
    }
  });

  it('NU atinge stările moarte', () => {
    for (const s of ['draft', 'abandoned', 'cancelled', 'refunded']) {
      expect(shouldMarkShippedOnAwb(s), s).toBe(false);
    }
  });

  it('NU retrogradează o comandă deja expediată sau finalizată', () => {
    expect(shouldMarkShippedOnAwb('shipped')).toBe(false);
    expect(shouldMarkShippedOnAwb('completed')).toBe(false);
  });

  it('fără status → nicio schimbare', () => {
    expect(shouldMarkShippedOnAwb(null)).toBe(false);
    expect(shouldMarkShippedOnAwb(undefined)).toBe(false);
    expect(shouldMarkShippedOnAwb('')).toBe(false);
  });
});
