/**
 * Cross-service contact handoff („Nu știu" on Extras/Copie CF → Identificare
 * imobil, collective-CF button → Extras CF Colectiv).
 *
 * The property step writes `wizard_contact_handoff` in sessionStorage and
 * replaces the route with `/comanda/<slug>?step=2`; the wizard provider on the
 * new service consumes it once. Pure — the provider only dispatches what this
 * returns, so the rules (10-minute TTL, email required, friendly id assigned)
 * are unit-testable without React.
 *
 * Incident E-260914-B8SM9 (14.09.2026): the handoff carried the contact over
 * but never assigned a friendly order id. That id is normally generated when
 * the client leaves step 1 — which the handoff skips — and the autosave gate
 * refuses to run without it, so the new service never got a server draft and
 * „Plătește" stayed on „Comanda se salvează încă…" forever.
 */

export const HANDOFF_STORAGE_KEY = 'wizard_contact_handoff';
export const HANDOFF_MAX_AGE_MS = 10 * 60_000;

export type HandoffProperty = {
  county?: string;
  locality?: string;
  carteFunciara?: string;
  cadastral?: string;
  topografic?: string;
};

export type ContactHandoff = {
  email?: string;
  phone?: string;
  preferredContact?: 'email' | 'phone' | 'whatsapp';
  ts?: number;
  property?: HandoffProperty;
};

export type HandoffAction =
  | {
      type: 'UPDATE_CONTACT';
      payload: { email: string; phone: string; preferredContact?: 'email' | 'phone' | 'whatsapp' };
    }
  | { type: 'UPDATE_PROPERTY'; payload: HandoffProperty }
  | { type: 'SET_FRIENDLY_ORDER_ID'; payload: string }
  | { type: 'MARK_INITIALIZED' };

/**
 * Turns the raw sessionStorage value into the wizard actions to dispatch.
 * Empty array = no (valid) handoff, the caller continues with its normal
 * restore path.
 */
export function handoffActions(
  raw: string | null,
  now: number,
  generateFriendlyOrderId: () => string,
): HandoffAction[] {
  if (!raw) return [];

  let handoff: ContactHandoff;
  try {
    handoff = JSON.parse(raw) as ContactHandoff;
  } catch {
    return [];
  }
  if (!handoff || typeof handoff !== 'object') return [];
  if (!handoff.ts || now - handoff.ts >= HANDOFF_MAX_AGE_MS || !handoff.email) return [];

  const actions: HandoffAction[] = [
    {
      type: 'UPDATE_CONTACT',
      payload: {
        email: handoff.email,
        phone: handoff.phone || '',
        ...(handoff.preferredContact ? { preferredContact: handoff.preferredContact } : {}),
      },
    },
  ];

  if (handoff.property && typeof handoff.property === 'object') {
    actions.push({ type: 'UPDATE_PROPERTY', payload: handoff.property });
  }

  // Fresh order on the new service: the id is what lets the autosave create
  // the server draft (and what the URL / support box show the client).
  actions.push({ type: 'SET_FRIENDLY_ORDER_ID', payload: generateFriendlyOrderId() });
  actions.push({ type: 'MARK_INITIALIZED' });
  return actions;
}
