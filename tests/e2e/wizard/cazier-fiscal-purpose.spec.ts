import { test, expect } from '@playwright/test';

/**
 * Regression: cazier-fiscal is a PF-locked service (no client-type picker).
 * clientType used to stay null, which hid the "Motivul solicitării" dropdown
 * at step 1 (it requires clientType === 'PF'). The wizard now defaults
 * clientType to 'PF' for PF-locked services, so the purpose must appear.
 */

test.describe('Cazier Fiscal — step 1 purpose', () => {
  test('the "Motivul solicitării" dropdown appears for cazier-fiscal', async ({
    page,
  }) => {
    const res = await page.goto('/comanda/cazier-fiscal');
    expect(res?.status(), 'wizard must not 500').toBeLessThan(500);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // PF-locked → no client-type tiles, purpose shown directly.
    await expect(page.getByText(/Motivul solicit[ăa]rii/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('order header shows the PF-labelled service name', async ({ page }) => {
    await page.goto('/comanda/cazier-fiscal');
    await expect(
      page.getByRole('heading', { name: /Cazier Fiscal Persoan[ăa] Fizic[ăa]/i })
    ).toBeVisible({ timeout: 10_000 });
  });
});
