import { describe, it, expect } from 'vitest';
import { customerTimeline, stageOf, timelineLabel } from '@/lib/orders/customer-timeline';

const row = (id: string, event_type: string, status?: string, notes?: string) => ({
  id,
  event_type,
  new_value: status ? { status } : null,
  notes: notes ?? null,
  created_at: `2026-09-18T10:00:0${id.length}Z`,
});

describe('customerTimeline', () => {
  it('shows one entry per stage — the trigger and the route both wrote AWAITING_PAYMENT', () => {
    const rows = [
      row('a', 'status_changed', 'awaiting_payment', 'trigger'),
      row('bb', 'status_changed', 'awaiting_payment', 'route'),
      row('ccc', 'payment_proof_submitted', 'awaiting_payment', 'Dovada urcată'),
    ];
    const out = customerTimeline(rows);
    expect(out.map((e) => e.status)).toEqual(['awaiting_payment', 'payment_proof_submitted']);
    expect(out[0].label).not.toMatch(/AWAITING/);
    expect(out[0].note).toBeNull();
    expect(out[1].note).toBe('Dovada urcată');
  });

  it('hides team-only events and cart states', () => {
    expect(stageOf(row('a', 'note_added', 'processing'))).toBeNull();
    expect(stageOf(row('a', 'admin_action', 'processing'))).toBeNull();
    expect(stageOf(row('a', 'status_changed', 'abandoned'))).toBeNull();
    expect(stageOf(row('a', 'status_changed', 'draft'))).toBeNull();
  });

  it('words the stages for the customer', () => {
    expect(stageOf(row('a', 'status_changed', 'paid'))).toBe('payment_confirmed');
    expect(timelineLabel('payment_confirmed')).toBe('Plată confirmată');
    expect(timelineLabel('payment_proof_submitted')).toMatch(/Dovadă/);
    expect(timelineLabel('no_such_stage')).toBe('Actualizare');
  });
});
