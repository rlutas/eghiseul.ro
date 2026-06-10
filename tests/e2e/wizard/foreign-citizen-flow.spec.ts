import { test, expect, Page } from '@playwright/test';

/**
 * E2E test for the FOREIGN CITIZEN flow at step 1 (Contact).
 *
 * Updated 2026-06-09: the old two-button (Român/Străin) toggle + EU/non-EU
 * sub-pick was replaced by a SINGLE checkbox "Sunt cetățean străin".
 *   - Unchecked = Romanian (default).
 *   - Checked   = foreign → reveals "Date despre naștere" (city + country).
 *   - Country dropdown now shows the FULL world list (no EU/non-EU filter).
 *
 * We only assert UI state at step 1 (no Continuă click) — full advancement
 * through the wizard is covered in full-order-flow.spec.ts.
 */

const SCREENSHOT_DIR = 'tests/screenshots';

async function openWizard(page: Page) {
  // The umbrella slug has clientTypeSelection.enabled === true.
  const response = await page.goto('/comanda/cazier-judiciar');
  expect(response?.status(), 'Wizard page must not 500').toBeLessThan(500);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/** Pick "Persoană Fizică" tile to reveal the citizenship checkbox. */
async function pickPF(page: Page) {
  await page
    .getByRole('button', { name: /Persoană Fizică/i })
    .first()
    .click();
}

test.describe('Wizard — Foreign Citizen checkbox (step 1)', () => {
  test('single "Sunt cetățean străin" checkbox is visible after picking PF', async ({
    page,
  }) => {
    await openWizard(page);
    await pickPF(page);

    await expect(page.getByText(/Sunt cetățean străin/i)).toBeVisible();
    // The old two-button toggle must be gone.
    await expect(
      page.getByRole('button', { name: /^Cetățean român$/i })
    ).toHaveCount(0);
  });

  test('checking it reveals the birth panel; no EU/non-EU sub-pick', async ({
    page,
  }) => {
    await openWizard(page);
    await pickPF(page);

    await page.getByText(/Sunt cetățean străin/i).click();

    // Birth data panel + its two fields appear.
    await expect(page.getByText('Date despre naștere')).toBeVisible();
    await expect(page.getByLabel(/Localitatea Nașterii/i)).toBeVisible();
    await expect(page.getByLabel(/Țara Nașterii/i)).toBeVisible();

    // The EU/non-EU sub-pick must NOT exist anymore.
    await expect(
      page.getByRole('button', { name: /Născut în Uniunea Europeană/i })
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Născut în afara UE/i })
    ).toHaveCount(0);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/wizard-foreign-step1-checkbox.png`,
    });
  });

  test('country dropdown shows the full world list (no EU/non-EU filter)', async ({
    page,
  }) => {
    await openWizard(page);
    await pickPF(page);
    await page.getByText(/Sunt cetățean străin/i).click();

    const countrySelect = page.locator('#contact-birth-country');
    await expect(countrySelect).toBeVisible();

    const options = await countrySelect.locator('option').allTextContents();
    // Both an EU and a non-EU country must be present in the same list.
    expect(options).toContain('Germania');
    expect(options).toContain('Statele Unite ale Americii');
  });

  test('unchecking hides the birth panel again', async ({ page }) => {
    await openWizard(page);
    await pickPF(page);

    const box = page.getByText(/Sunt cetățean străin/i);
    await box.click();
    await expect(page.getByText('Date despre naștere')).toBeVisible();

    // Toggle back off.
    await box.click();
    await expect(page.getByText('Date despre naștere')).not.toBeVisible();
  });
});
