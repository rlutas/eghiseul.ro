import { describe, expect, it } from 'vitest';
import {
  paymentMethodKind,
  paymentMethodLabel,
  paymentMethodShortLabel,
} from '@/lib/admin/payment-method';

// `orders.payment_method` primește valori din trei locuri: checkout-ul scrie
// „bank_transfer", confirmarea manuală o SUPRASCRIE cu „transfer"/„cash", iar
// webhook-ul Stripe nu atinge coloana deloc. Lista de comenzi testa doar
// `=== 'bank_transfer'`, deci un transfer confirmat apărea drept „Card"
// (10.09.2026, E-260905-DMUZA).

describe('paymentMethodKind', () => {
  it('tratează bank_transfer și transfer ca aceeași metodă', () => {
    expect(paymentMethodKind({ method: 'bank_transfer' })).toBe('transfer');
    expect(paymentMethodKind({ method: 'transfer' })).toBe('transfer');
  });

  it('recunoaște cash-ul sub ambele denumiri', () => {
    expect(paymentMethodKind({ method: 'cash' })).toBe('cash');
    expect(paymentMethodKind({ method: 'numerar' })).toBe('cash');
  });

  it('card și stripe = card', () => {
    expect(paymentMethodKind({ method: 'card' })).toBe('card');
    expect(paymentMethodKind({ method: 'stripe' })).toBe('card');
  });

  it('coloană goală + identificatori Stripe = card', () => {
    expect(paymentMethodKind({ method: null, hasStripeIds: true })).toBe('card');
  });

  it('coloană goală pe o comandă plătită = card (lista de comenzi)', () => {
    expect(paymentMethodKind({ method: null, paidWithoutMethod: true })).toBe('card');
  });

  it('coloană goală fără niciun indiciu NU se ghicește', () => {
    expect(paymentMethodKind({ method: null })).toBe('unknown');
    expect(paymentMethodKind({ method: '' })).toBe('unknown');
  });

  it('e insensibil la majuscule', () => {
    expect(paymentMethodKind({ method: 'BANK_TRANSFER' })).toBe('transfer');
  });
});

describe('etichete', () => {
  it('transferul confirmat NU mai apare drept Card', () => {
    expect(paymentMethodShortLabel({ method: 'transfer', paidWithoutMethod: true })).toBe('Transfer');
    expect(paymentMethodLabel({ method: 'transfer' })).toBe('Transfer bancar');
  });

  it('cash-ul are etichetă proprie, nu Card', () => {
    expect(paymentMethodShortLabel({ method: 'cash', paidWithoutMethod: true })).toBe('Cash');
  });

  it('necunoscutul arată o liniuță, nu o metodă inventată', () => {
    expect(paymentMethodShortLabel({ method: null })).toBe('—');
  });
});
