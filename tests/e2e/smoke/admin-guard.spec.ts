import { test, expect } from '@playwright/test';

/**
 * Smoke tests for admin route guards.
 *
 * An unauthenticated request to any /admin/* page must be either:
 *   - redirected to /login (or /auth/login), OR
 *   - rejected with 401/403.
 *
 * In either case the server must stay healthy (no 500).
 */

const ADMIN_ROUTES = [
  '/admin',
  '/admin/orders',
  '/admin/users',
  '/admin/settings',
  '/admin/registru',
];

test.describe('Smoke: admin guard — redirect spre login pentru useri neautentificați', () => {
  for (const route of ADMIN_ROUTES) {
    test(`GET ${route} nu permite acces anonim`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Server must stay healthy
      expect(response).not.toBeNull();
      const status = response!.status();
      expect(status, `Admin route ${route} returned a server error`).toBeLessThan(
        500,
      );

      // Accepted outcomes: 401/403 OR a redirect landing on a login page.
      const finalUrl = page.url();
      const landedOnLogin = /\/(auth\/)?login/.test(finalUrl);
      const isAuthError = status === 401 || status === 403;

      expect(
        landedOnLogin || isAuthError,
        `Expected ${route} to redirect to /login or return 401/403. Got status=${status} url=${finalUrl}`,
      ).toBeTruthy();
    });
  }

  test('redirectul preservă query param-ul `redirect` cu calea originală', async ({
    page,
  }) => {
    await page.goto('/admin/orders', { waitUntil: 'domcontentloaded' });

    const finalUrl = page.url();
    // If we were redirected to login, the path we tried should be in the URL
    // (standard Next.js middleware pattern: ?redirect=/admin/orders).
    if (/\/(auth\/)?login/.test(finalUrl)) {
      expect(finalUrl).toMatch(/redirect=.*admin(%2F|\/)orders/i);
    }
  });
});

test.describe('Smoke: admin API — protected endpoints', () => {
  // API endpoints must respond with 401/403 for unauthenticated requests,
  // never 500, and never leak data.
  const ADMIN_API = [
    '/api/admin/dashboard/stats',
    '/api/admin/orders/list',
    '/api/admin/users/employees',
    '/api/admin/settings',
  ];

  for (const endpoint of ADMIN_API) {
    test(`GET ${endpoint} blochează accesul anonim`, async ({ request }) => {
      const response = await request.get(endpoint);
      const status = response.status();

      expect(status, `${endpoint} returned a server error`).toBeLessThan(500);
      expect([401, 403]).toContain(status);
    });
  }
});
