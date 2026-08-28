/**
 * Regression: E-260723-VJ39N — AWB easybox pica pe rezolvarea adresei.
 *
 * Livrarea în locker nu poartă adresă de domiciliu (destinatarul e doar
 * nume/telefon/email + `oohLastMile`), dar createShipment rezolva întâi
 * județ/oraș din delivery_address. Pentru București pica mereu: Sameday
 * n-are orașul „Bucuresti", doar „Sectorul 1..6" — deci arunca
 * „Could not resolve location" deși adresa era irelevantă pentru AWB.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SamedayProvider } from '@/lib/services/courier/sameday';
import type { ShipmentRequest } from '@/lib/services/courier/types';

const SENDER = {
  name: 'eGhiseul.ro',
  phone: '0740000000',
  email: 'comenzi@eghiseul.ro',
  street: 'Strada Mihai Eminescu',
  streetNo: '1',
  city: 'Satu Mare',
  county: 'Satu Mare',
  postalCode: '440014',
  country: 'RO',
};

const BUCHAREST_RECIPIENT = {
  name: 'Test Client',
  phone: '0722000000',
  email: 'client@example.com',
  street: 'Str Drumul Taberei',
  streetNo: '55',
  city: 'Bucuresti',
  county: 'București',
  postalCode: '061363',
  country: 'RO',
};

const PACKAGE = { weight: 0.5, quantity: 1, type: 'envelope' as const };

function stubSamedayApi(fetchCalls: Array<{ url: string; body?: string }>) {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    fetchCalls.push({ url, body: typeof init?.body === 'string' ? init.body : undefined });

    const json = (data: unknown) =>
      new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

    if (url.includes('/api/authenticate')) {
      return json({ token: 'test-token', expire_at_utc: '2099-01-01 00:00' });
    }
    if (url.includes('/api/client/pickup-points')) {
      return json({ data: [{ id: 9, defaultPickupPoint: true, contactPersons: [{ id: 90, default: true }] }] });
    }
    if (url.includes('/api/geolocation/county')) {
      return json({ data: [{ id: 1, name: 'Bucuresti', code: 'B' }, { id: 30, name: 'Satu Mare', code: 'SM' }] });
    }
    if (url.includes('/api/geolocation/city')) {
      return json({
        total: 6,
        pages: 1,
        data: [1, 2, 3, 4, 5, 6].map((n) => ({
          id: 100 + n,
          name: `Sectorul ${n}`,
          county: { id: 1, name: 'Bucuresti' },
        })),
      });
    }
    if (url.includes('/api/awb')) {
      return json({ awbNumber: 'TESTAWB123', awbCost: 15, parcels: [{ position: 1, awbNumber: 'TESTAWB123' }] });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }));
}

describe('SamedayProvider.createShipment — locker (OOH)', () => {
  let fetchCalls: Array<{ url: string; body?: string }>;

  beforeEach(() => {
    vi.stubEnv('SAMEDAY_USERNAME', 'test-user');
    vi.stubEnv('SAMEDAY_PASSWORD', 'test-pass');
    vi.stubEnv('SAMEDAY_USE_DEMO', 'false');
    fetchCalls = [];
    stubSamedayApi(fetchCalls);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('emite AWB pentru easybox fără să rezolve adresa de domiciliu (București)', async () => {
    const provider = new SamedayProvider();
    const request: ShipmentRequest = {
      sender: SENDER,
      recipient: BUCHAREST_RECIPIENT,
      packages: [PACKAGE],
      content: { description: 'Documente', isDocument: true },
      service: 'LOCKER_NEXTDAY',
      paymentBy: 'sender',
      lockerId: '6245',
      orderReference: 'E-260723-VJ39N',
    };

    const result = await provider.createShipment(request);

    expect(result.success).toBe(true);
    expect(result.awb).toBe('TESTAWB123');

    // Rezolvarea geo nu trebuie apelată deloc la locker
    const geoCalls = fetchCalls.filter((c) => c.url.includes('/api/geolocation'));
    expect(geoCalls).toHaveLength(0);

    const awbCall = fetchCalls.find((c) => c.url.endsWith('/api/awb') && c.body);
    expect(awbCall).toBeDefined();
    const payload = JSON.parse(awbCall!.body!);
    expect(payload.oohLastMile).toBe('6245');
    expect(payload.oohType).toBe(0);
    expect(payload.service).toBe('15');
    // Destinatar locker: fără county/city/address
    expect(payload.awbRecipient.county).toBeUndefined();
    expect(payload.awbRecipient.city).toBeUndefined();
    expect(payload.awbRecipient.name).toBe('Test Client');
  });

  it('predarea în easybox (dropoffLockerId) pune oohFirstMile pe AWB', async () => {
    const provider = new SamedayProvider();
    const request: ShipmentRequest = {
      sender: SENDER,
      recipient: { ...BUCHAREST_RECIPIENT, city: 'Sector 6' },
      packages: [PACKAGE],
      content: { description: 'Documente', isDocument: true },
      service: 'STANDARD_24H',
      paymentBy: 'sender',
      dropoffLockerId: '2556',
      orderReference: 'E-TEST-DROPOFF',
    };

    const result = await provider.createShipment(request);

    expect(result.success).toBe(true);
    const awbCall = fetchCalls.find((c) => c.url.endsWith('/api/awb') && c.body);
    const payload = JSON.parse(awbCall!.body!);
    expect(payload.oohFirstMile).toBe('2556');
  });

  it('livrare la domiciliu în București cu „Sector 6" se mapează pe „Sectorul 6"', async () => {
    const provider = new SamedayProvider();
    const request: ShipmentRequest = {
      sender: SENDER,
      recipient: { ...BUCHAREST_RECIPIENT, city: 'Sector 6' },
      packages: [PACKAGE],
      content: { description: 'Documente', isDocument: true },
      service: 'STANDARD_24H',
      paymentBy: 'sender',
      orderReference: 'E-TEST-HOME',
    };

    const result = await provider.createShipment(request);

    expect(result.success).toBe(true);
    const awbCall = fetchCalls.find((c) => c.url.endsWith('/api/awb') && c.body);
    const payload = JSON.parse(awbCall!.body!);
    expect(payload.awbRecipient.county).toBe('1');
    expect(payload.awbRecipient.city).toBe('106'); // Sectorul 6
  });
});
