import { test, expect } from '@playwright/test';

/**
 * Smoke test for the public order-status page (/comanda/status).
 *
 * Touched 2026-06-10: HelpContactCard now takes an `orderCode` prop and the
 * support phone moved to a hardcoded +40 757 708 181. This test just confirms
 * the page renders its search form without errors (the help card + phone only
 * appear after a successful order lookup, which needs real data).
 */

test.describe('Order status page', () => {
  test('renders the search form (code + email + submit)', async ({ page }) => {
    const res = await page.goto('/comanda/status');
    expect(res?.status(), 'status page must not 500').toBeLessThan(500);

    // Heading
    await expect(
      page.getByRole('heading', { name: /Verific[ăa] Statusul Comenzii/i })
    ).toBeVisible();

    // Order code input
    await expect(page.locator('#orderCode')).toBeVisible();

    // Email input
    await expect(page.getByRole('textbox', { name: /email/i }).first()).toBeVisible();

    // Submit button
    await expect(
      page.getByRole('button', { name: /Caut[ăa] Comanda/i })
    ).toBeVisible();
  });

  test('searching a non-existent order shows a friendly error (no crash)', async ({
    page,
  }) => {
    await page.goto('/comanda/status');
    await page.locator('#orderCode').fill('E-000000-XXXXX');
    await page.getByRole('textbox', { name: /email/i }).first().fill('nobody@example.com');
    await page.getByRole('button', { name: /Caut[ăa] Comanda/i }).click();

    // The page must stay alive and not throw — some error/empty state appears.
    // We don't assert exact copy (depends on API), just that the form is still
    // usable afterwards.
    await expect(page.locator('#orderCode')).toBeVisible();
  });
});
