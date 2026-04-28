import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the oblio HTTP client + config so we can verify the invoice payload
// without hitting Oblio's real API. `getOblioConfig` is also mocked so
// missing env vars don't abort the import.
const { oblioRequest, getOblioConfig } = vi.hoisted(() => ({
  oblioRequest: vi.fn(),
  getOblioConfig: vi.fn(() => ({
    apiEmail: 'test@example.com',
    secretKey: 'secret',
    companyCif: '12345678',
    seriesName: 'EGH',
  })),
}));

vi.mock('@/lib/oblio/client', () => ({ oblioRequest, getOblioConfig }));

import { createInvoiceFromOrder, formatInvoiceNumber } from '@/lib/oblio/invoice';

const successResp = {
  seriesName: 'EGH',
  number: '00042',
  link: 'https://oblio.eu/invoices/EGH-00042.pdf',
};

beforeEach(() => {
  oblioRequest.mockReset();
  oblioRequest.mockResolvedValue(successResp);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('formatInvoiceNumber', () => {
  it('joins series + number with dash', () => {
    expect(formatInvoiceNumber('EGH', '42')).toBe('EGH-0042');
  });

  it('left-pads number to 4 digits', () => {
    expect(formatInvoiceNumber('EGH', '1')).toBe('EGH-0001');
    expect(formatInvoiceNumber('EGH', '99')).toBe('EGH-0099');
  });

  it('does not truncate numbers wider than 4 digits', () => {
    expect(formatInvoiceNumber('EGH', '12345')).toBe('EGH-12345');
  });
});

describe('createInvoiceFromOrder — PF (individual)', () => {
  const baseOrder = {
    id: 'order-1',
    friendly_order_id: 'E-260427-AT52E',
    service_name: 'Cazier Judiciar',
    base_price: 250,
    total_price: 302.5,
    customer_data: {
      contact: { firstName: 'Ion', lastName: 'Popescu', email: 'ion@example.com', phone: '+40712345678' },
      billing: {
        type: 'individual' as const,
        firstName: 'Ion',
        lastName: 'Popescu',
        cnp: '1820507211209',
        address: 'Str. Test 1',
        city: 'București',
        county: 'București',
      },
    },
  };

  it('builds PF client with name from firstName + lastName, CNP as cif', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card');

    const payload = oblioRequest.mock.calls[0][0].body;
    expect(payload.client.name).toBe('Ion Popescu');
    expect(payload.client.cif).toBe('1820507211209');
    expect(payload.client.vatPayer).toBe(false);
    expect(payload.client.save).toBe(false); // PF clients are NOT saved in Oblio
  });

  it('forwards email + phone + city + state + country to Oblio', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card');

    const payload = oblioRequest.mock.calls[0][0].body;
    expect(payload.client.email).toBe('ion@example.com');
    expect(payload.client.phone).toBe('+40712345678');
    expect(payload.client.city).toBe('București');
    expect(payload.client.state).toBe('București');
    expect(payload.client.country).toBe('Romania'); // default when not set
  });

  it('falls back to "N/A" when no name available', async () => {
    const order = {
      ...baseOrder,
      customer_data: {
        ...baseOrder.customer_data,
        billing: { ...baseOrder.customer_data.billing, firstName: '', lastName: '' },
        contact: { email: 'x@x.com' },
      },
    };
    await createInvoiceFromOrder(order, 'Card');

    expect(oblioRequest.mock.calls[0][0].body.client.name).toBe('N/A');
  });
});

describe('createInvoiceFromOrder — PJ (company)', () => {
  const baseOrder = {
    id: 'order-pj-1',
    friendly_order_id: 'E-260427-PJ001',
    service_name: 'Cazier Judiciar PJ',
    base_price: 350,
    total_price: 423.5,
    customer_data: {
      contact: { email: 'office@acme.ro', phone: '+40212345678' },
      billing: {
        type: 'company' as const,
        companyName: 'ACME SRL',
        cui: 'RO12345678',
        regCom: 'J40/1234/2020',
        address: 'Str. Sediu 1',
        city: 'București',
        county: 'București',
      },
    },
  };

  it('builds PJ client with companyName, CUI as cif, regCom as rc', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card');

    const payload = oblioRequest.mock.calls[0][0].body;
    expect(payload.client.name).toBe('ACME SRL');
    expect(payload.client.cif).toBe('RO12345678');
    expect(payload.client.rc).toBe('J40/1234/2020');
    expect(payload.client.save).toBe(true); // PJ clients are saved for reuse
  });

  it('marks vatPayer=true when CUI starts with "RO" (VAT-registered company)', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card');
    expect(oblioRequest.mock.calls[0][0].body.client.vatPayer).toBe(true);
  });

  it('marks vatPayer=false when CUI does NOT start with "RO" (non-VAT-payer or foreign)', async () => {
    const order = {
      ...baseOrder,
      customer_data: {
        ...baseOrder.customer_data,
        billing: { ...baseOrder.customer_data.billing, cui: '12345678' }, // no RO prefix
      },
    };
    await createInvoiceFromOrder(order, 'Card');
    expect(oblioRequest.mock.calls[0][0].body.client.vatPayer).toBe(false);
  });
});

describe('createInvoiceFromOrder — products / line items', () => {
  const baseOrder = {
    id: 'o',
    friendly_order_id: 'E-260427-X',
    service_name: 'Cazier Judiciar',
    base_price: 250,
    total_price: 480,
    customer_data: {
      contact: { firstName: 'X', lastName: 'Y', email: 'x@y.com' },
      billing: { type: 'individual' as const, firstName: 'X', lastName: 'Y', cnp: '1820507211209' },
    },
  };

  it('first product is the main service with friendly_order_id as code', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card');

    const products = oblioRequest.mock.calls[0][0].body.products;
    expect(products[0]).toMatchObject({
      name: 'Cazier Judiciar',
      code: 'E-260427-X',
      price: 250,
      measuringUnit: 'buc',
      currency: 'RON',
      vatPercentage: 19,
      vatIncluded: true,
      quantity: 1,
      productType: 'Serviciu',
    });
  });

  it('falls back to total_price when base_price missing', async () => {
    const order = { ...baseOrder, base_price: undefined };
    await createInvoiceFromOrder(order, 'Card');

    expect(oblioRequest.mock.calls[0][0].body.products[0].price).toBe(480);
  });

  it('appends each option as a separate line item', async () => {
    const order = {
      ...baseOrder,
      selected_options: [
        { code: 'urgent', name: 'Urgentă', price: 50 },
        { code: 'apostila', name: 'Apostila Haga', price: 100 },
      ],
    };
    await createInvoiceFromOrder(order, 'Card');

    const products = oblioRequest.mock.calls[0][0].body.products;
    expect(products).toHaveLength(3); // service + 2 options
    expect(products[1]).toMatchObject({ name: 'Urgentă', code: 'urgent', price: 50 });
    expect(products[2]).toMatchObject({ name: 'Apostila Haga', code: 'apostila', price: 100 });
  });

  it('adds delivery as line item when delivery_price > 0', async () => {
    const order = {
      ...baseOrder,
      delivery_method: 'Sameday EasyBox',
      delivery_price: 18.61,
    };
    await createInvoiceFromOrder(order, 'Card');

    const products = oblioRequest.mock.calls[0][0].body.products;
    const deliveryLine = products.find((p: { name?: string }) => p.name?.startsWith('Livrare:'));
    expect(deliveryLine).toBeDefined();
    expect(deliveryLine.name).toBe('Livrare: Sameday EasyBox');
    expect(deliveryLine.price).toBe(18.61);
  });

  it('skips delivery line when delivery_price is 0', async () => {
    const order = { ...baseOrder, delivery_price: 0 };
    await createInvoiceFromOrder(order, 'Card');

    const products = oblioRequest.mock.calls[0][0].body.products;
    expect(products.find((p: { name?: string }) => p.name?.startsWith('Livrare:'))).toBeUndefined();
  });

  it('skips delivery line when delivery_price undefined (ridicare personală)', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card'); // no delivery_price set

    const products = oblioRequest.mock.calls[0][0].body.products;
    expect(products.find((p: { name?: string }) => p.name?.startsWith('Livrare:'))).toBeUndefined();
  });
});

describe('createInvoiceFromOrder — payment + return shape', () => {
  const baseOrder = {
    id: 'o',
    friendly_order_id: 'E-260427-Z',
    service_name: 'Cazier',
    base_price: 250,
    total_price: 302.5,
    customer_data: {
      contact: { email: 'a@b.com' },
      billing: { type: 'individual' as const, firstName: 'A', lastName: 'B', cnp: '1820507211209' },
    },
  };

  it('passes payment method to Oblio collect block', async () => {
    await createInvoiceFromOrder(baseOrder, 'Transfer bancar');

    const collect = oblioRequest.mock.calls[0][0].body.collect;
    expect(collect.type).toBe('Transfer bancar');
    expect(collect.value).toBe(302.5);
  });

  it('uses Card as default payment method', async () => {
    await createInvoiceFromOrder(baseOrder); // no second arg

    expect(oblioRequest.mock.calls[0][0].body.collect.type).toBe('Card');
  });

  it('returns StoredInvoice with combined invoiceNumber + PDF link', async () => {
    const result = await createInvoiceFromOrder(baseOrder, 'Card');

    expect(result.orderId).toBe('o');
    expect(result.seriesName).toBe('EGH');
    expect(result.number).toBe('00042');
    expect(result.invoiceNumber).toBe('EGH-00042');
    expect(result.pdfUrl).toBe('https://oblio.eu/invoices/EGH-00042.pdf');
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO timestamp
  });

  it('forwards seriesName + cif from config to invoice input', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card');

    const payload = oblioRequest.mock.calls[0][0].body;
    expect(payload.cif).toBe('12345678');
    expect(payload.seriesName).toBe('EGH');
    expect(payload.language).toBe('RO');
    expect(payload.currency).toBe('RON');
  });

  it('hits the correct Oblio endpoint with POST', async () => {
    await createInvoiceFromOrder(baseOrder, 'Card');

    expect(oblioRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/docs/invoice',
        method: 'POST',
      })
    );
  });
});
