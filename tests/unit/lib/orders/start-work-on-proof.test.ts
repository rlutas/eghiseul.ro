import { describe, expect, it } from 'vitest';
import { assessStartWorkOnProof } from '@/lib/orders/start-work-on-proof';

// „Dovadă verificată — pornește lucrul" (14.09.2026, E-260912-5SNRM): echipa
// începe documentele pe o comandă plătită prin IBAN înainte să intre banii.
// Gardă pură — ruta o aplică server-side, panoul din admin o citește ca să
// ascundă butonul.

const eligible = {
  status: 'awaiting_payment',
  payment_status: 'awaiting_verification',
  payment_method: 'bank_transfer',
  proof_verified_at: null,
};

describe('assessStartWorkOnProof', () => {
  it('permite pe comanda IBAN care așteaptă banii', () => {
    expect(assessStartWorkOnProof(eligible)).toEqual({ ok: true });
  });

  it('refuză o comandă deja plătită', () => {
    const r = assessStartWorkOnProof({ ...eligible, payment_status: 'paid', status: 'paid' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/plătită/i);
  });

  it('refuză dacă lucrul a pornit deja pe dovadă (idempotență)', () => {
    const r = assessStartWorkOnProof({
      ...eligible,
      status: 'processing',
      proof_verified_at: '2026-09-14T10:00:00Z',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/deja/i);
  });

  it('refuză statusuri care nu sunt „Așteptare plată" (draft, pending, abandoned, processing)', () => {
    for (const status of ['draft', 'pending', 'abandoned', 'processing', 'completed']) {
      expect(assessStartWorkOnProof({ ...eligible, status }).ok).toBe(false);
    }
  });

  it('refuză plata cu cardul (Stripe) — acolo confirmarea e automată', () => {
    const r = assessStartWorkOnProof({
      ...eligible,
      payment_method: 'stripe',
      payment_status: 'pending',
    });
    expect(r.ok).toBe(false);
  });

  it('NU cere dovadă încărcată — dovada poate veni pe email/WhatsApp', () => {
    // E-260912-5SNRM avea payment_proof_url NULL; ordinul de plată a venit pe
    // alt canal. Decizia e a operatorului, nu a unui câmp din DB.
    expect(assessStartWorkOnProof({ ...eligible, payment_proof_url: null }).ok).toBe(true);
  });
});
