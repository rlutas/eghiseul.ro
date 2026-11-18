import { describe, expect, it } from 'vitest';
import { processingSectionMode } from '@/lib/admin/processing-section-mode';

// The „Procesare comanda" card holds the list of generated documents. When it
// disappears, the team loses the documents of the order.

describe('processingSectionMode', () => {
  it('hides the card on unpaid orders', () => {
    expect(processingSectionMode('draft')).toBe('hidden');
    expect(processingSectionMode('abandoned')).toBe('hidden');
    expect(processingSectionMode(null)).toBe('hidden');
    expect(processingSectionMode(undefined)).toBe('hidden');
  });

  it('keeps the documents visible, read-only, on cancelled and refunded orders', () => {
    expect(processingSectionMode('refunded')).toBe('readonly');
    expect(processingSectionMode('cancelled')).toBe('readonly');
  });

  it('shows the full card on working statuses', () => {
    for (const status of [
      'paid',
      'processing',
      'standby',
      'submitted_to_institution',
      'la_tradus',
      'shipped',
      'completed',
      'cancellation_requested',
    ]) {
      expect(processingSectionMode(status)).toBe('full');
    }
  });

  it('shows the full card on a status it has never seen', () => {
    expect(processingSectionMode('status_nou_2027')).toBe('full');
  });
});
