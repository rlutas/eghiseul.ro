import { describe, it, expect } from 'vitest';
import { handoffActions } from '@/lib/orders/wizard-handoff';

const NOW = 1_800_000_000_000;
const newId = () => 'E-260914-TEST1';

function raw(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    email: 'client@example.com',
    phone: '+40712345678',
    preferredContact: 'email',
    ts: NOW - 1_000,
    ...overrides,
  });
}

describe('handoffActions', () => {
  it('returns no actions when there is no handoff', () => {
    expect(handoffActions(null, NOW, newId)).toEqual([]);
    expect(handoffActions('not json', NOW, newId)).toEqual([]);
  });

  it('ignores a handoff older than 10 minutes or without email', () => {
    expect(handoffActions(raw({ ts: NOW - 11 * 60_000 }), NOW, newId)).toEqual([]);
    expect(handoffActions(raw({ email: '' }), NOW, newId)).toEqual([]);
  });

  it('carries the contact over and assigns a friendly order id', () => {
    // Regression: the „Nu știu" jump landed on step 2 of the new service
    // without ever generating a friendly order id, so the autosave gate
    // (`!state.friendlyOrderId`) never let the draft reach the server and
    // „Plătește" stayed dead („Comanda se salvează încă…"). E-260914-B8SM9.
    const actions = handoffActions(raw(), NOW, newId);

    expect(actions).toEqual([
      {
        type: 'UPDATE_CONTACT',
        payload: { email: 'client@example.com', phone: '+40712345678', preferredContact: 'email' },
      },
      { type: 'SET_FRIENDLY_ORDER_ID', payload: 'E-260914-TEST1' },
      { type: 'MARK_INITIALIZED' },
    ]);
  });

  it('also carries the property block when present', () => {
    const actions = handoffActions(
      raw({ property: { county: 'Cluj', locality: 'Cluj-Napoca', carteFunciara: '123456' } }),
      NOW,
      newId,
    );

    expect(actions[1]).toEqual({
      type: 'UPDATE_PROPERTY',
      payload: { county: 'Cluj', locality: 'Cluj-Napoca', carteFunciara: '123456' },
    });
    expect(actions.map((a) => a.type)).toEqual([
      'UPDATE_CONTACT',
      'UPDATE_PROPERTY',
      'SET_FRIENDLY_ORDER_ID',
      'MARK_INITIALIZED',
    ]);
  });

  it('omits preferredContact when the handoff has none', () => {
    const actions = handoffActions(raw({ preferredContact: undefined, phone: undefined }), NOW, newId);
    expect(actions[0]).toEqual({
      type: 'UPDATE_CONTACT',
      payload: { email: 'client@example.com', phone: '' },
    });
  });
});
