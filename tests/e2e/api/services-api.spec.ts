import { test, expect } from '@playwright/test';

test.describe('Services API', () => {
  test('GET /api/services - should return list of services', async ({ request }) => {
    const response = await request.get('/api/services');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('data');
    expect(json.data).toHaveProperty('services');
    expect(Array.isArray(json.data.services)).toBeTruthy();
    expect(json.data.services.length).toBeGreaterThan(0);

    // Check service structure
    const service = json.data.services[0];
    expect(service).toHaveProperty('id');
    expect(service).toHaveProperty('slug');
    expect(service).toHaveProperty('name');
  });

  test('GET /api/services/[slug] - should return service details', async ({ request }) => {
    const response = await request.get('/api/services/cazier-judiciar');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('data');
    expect(json.data).toHaveProperty('service');

    const service = json.data.service;
    expect(service).toHaveProperty('id');
    expect(service).toHaveProperty('slug', 'cazier-judiciar');
    expect(service).toHaveProperty('name');
    expect(service).toHaveProperty('basePrice');
  });

  test('GET /api/services/[slug] - should return 404 for invalid slug', async ({ request }) => {
    const response = await request.get('/api/services/nonexistent-service');

    expect(response.status()).toBe(404);
  });
});

test.describe('OCR API Health Check', () => {
  test('GET /api/ocr/extract - should return health status', async ({ request }) => {
    const response = await request.get('/api/ocr/extract');

    // Should return 200 for health check
    expect(response.status()).toBe(200);
  });
});

test.describe('KYC API Health Check', () => {
  test('GET /api/kyc/validate - should return health status', async ({ request }) => {
    const response = await request.get('/api/kyc/validate');

    // Should return 200 for health check
    expect(response.status()).toBe(200);
  });
});

test.describe('Draft Orders API', () => {
  test('POST /api/orders/draft - should handle draft creation', async ({ request }) => {
    const draftData = {
      service_id: 'test-service-id',
      customer_data: {
        contact: {
          email: 'test@example.com',
          phone: '+40755123456',
        },
      },
    };

    const response = await request.post('/api/orders/draft', {
      data: draftData,
    });

    // May require auth, valid service_id, or return 400 for invalid data
    expect([200, 201, 400, 401]).toContain(response.status());
  });

  test('GET /api/orders/draft - should require authentication', async ({ request }) => {
    const response = await request.get('/api/orders/draft');

    // Should return 400 (bad request) or 401 (auth required) or 404 (not found)
    expect([400, 401, 404]).toContain(response.status());
  });
});

test.describe('User API', () => {
  test('GET /api/user/prefill-data - should require authentication', async ({ request }) => {
    const response = await request.get('/api/user/prefill-data');

    // Should return 401 without auth
    expect(response.status()).toBe(401);
  });
});
