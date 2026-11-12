import { describe, expect, it } from 'vitest';
import { isOrderPathBlockedOnHost } from '@/lib/brand/order-guard';

describe('isOrderPathBlockedOnHost', () => {
  it('cazierfiscal.com: doar cazier fiscal', () => {
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/cazier-fiscal/')).toBe(false);
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/cazier-judiciar-persoana-fizica/')).toBe(true);
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/certificat-nastere')).toBe(true);
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/certificat-constatator/')).toBe(true);
  });

  it('constatator: doar certificat constatator', () => {
    expect(isOrderPathBlockedOnHost('certificat-constatator-express.ro', '/comanda/certificat-constatator/')).toBe(false);
    expect(isOrderPathBlockedOnHost('certificat-constatator-express.ro', '/comanda/cazier-fiscal/')).toBe(true);
  });

  it('documentero: stare civilă + cele două landinguri de cazier', () => {
    expect(isOrderPathBlockedOnHost('documentero.ro', '/comanda/certificat-celibat/')).toBe(false);
    expect(isOrderPathBlockedOnHost('documentero.ro', '/comanda/cazier-fiscal/')).toBe(false);
    expect(isOrderPathBlockedOnHost('documentero.ro', '/comanda/certificat-constatator/')).toBe(true);
  });

  it('eghiseul vinde tot; host necunoscut = eghiseul', () => {
    expect(isOrderPathBlockedOnHost('eghiseul.ro', '/comanda/certificat-constatator/')).toBe(false);
    expect(isOrderPathBlockedOnHost('localhost:3000', '/comanda/orice/')).toBe(false);
    expect(isOrderPathBlockedOnHost(null, '/comanda/cazier-fiscal/')).toBe(false);
  });

  it('plata, statusul și succesul nu sunt servicii', () => {
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/checkout/abc-123/')).toBe(false);
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/status/')).toBe(false);
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/success/abc/')).toBe(false);
    expect(isOrderPathBlockedOnHost('cazierfiscal.com', '/comanda/')).toBe(false);
  });
});
