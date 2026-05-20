import { test, expect, Page } from '@playwright/test';

/**
 * E2E test for the FOREIGN CITIZEN flow added in 2026-04-29.
 *
 * Verifies the new wizard behavior at step 1 (Contact):
 *   - Picking "Cetățean străin" reveals:
 *       a) helper hint about residence permit
 *       b) EU vs non-EU sub-pick
 *       c) "Date despre naștere" with city + country dropdown
 *   - Country dropdown is filtered: ~27 EU countries when EU picked,
 *     non-EU list when "Născut în afara UE" picked
 *
 * Note on phone field: PhoneInput uses react-international-phone which
 * doesn't expose the standard textbox/name pattern Playwright queries.
 * We bypass full form validation in this spec by NOT clicking Continuă —
 * we only assert UI visibility/state at step 1 with the citizenship picker.
 * End-to-end advancement through the wizard (with Stripe) is covered in
 * full-order-flow.spec.ts instead.
 */

const SCREENSHOT_DIR = 'tests/screenshots';

async function openWizard(page: Page) {
  // The umbrella slug has clientTypeSelection.enabled === true.
  // The /-persoana-fizica variant is locked to PF (no Tip Client picker).
  const response = await page.goto('/comanda/cazier-judiciar');
  expect(response?.status(), 'Wizard page must not 500').toBeLessThan(500);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/** Pick "Persoană Fizică" tile to reveal Citizenship section. */
async function pickPF(page: Page) {
  await page
    .getByRole('button', { name: /Persoană Fizică/i })
    .first()
    .click();
}

test.describe('Wizard — Foreign Citizen UI (step 1)', () => {
  test('Cetățean Străin tile is visible after picking PF', async ({ page }) => {
    await openWizard(page);
    await pickPF(page);

    const foreignBtn = page.getByRole('button', { name: /cetățean străin/i });
    await expect(foreignBtn).toBeVisible();
  });

  test('Picking "Cetățean străin" reveals helper hint + EU/non-EU + birth panel', async ({
    page,
  }) => {
    await openWizard(page);
    await pickPF(page);
    await page.getByRole('button', { name: /cetățean străin/i }).click();

    // Helper hint
    await expect(
      page.getByText(/Marchează această opțiune dacă nu ești născut în România/i)
    ).toBeVisible();

    // EU vs non-EU sub-pick
    await expect(
      page.getByRole('button', { name: /Născut în Uniunea Europeană/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Născut în afara UE/i })
    ).toBeVisible();

    // "Date despre naștere" panel + 2 fields
    await expect(page.getByText('Date despre naștere')).toBeVisible();
    await expect(page.getByLabel(/Localitatea Nașterii/i)).toBeVisible();
    await expect(page.getByLabel(/Țara Nașterii/i)).toBeVisible();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/wizard-foreign-step1-eu-revealed.png`,
    });
  });

  test('Country dropdown filters by EU vs non-EU pick', async ({ page }) => {
    await openWizard(page);
    await pickPF(page);
    await page.getByRole('button', { name: /cetățean străin/i }).click();

    // Default is "eu" — should show EU member states only.
    const countrySelect = page.locator('#contact-birth-country');
    await expect(countrySelect).toBeVisible();

    let options = await countrySelect.locator('option').allTextContents();
    expect(options).toContain('Germania');
    expect(options).toContain('Franța');
    expect(options).toContain('Țările de Jos'); // post-2020 official RO name
    // Brexit — UK should not be in the EU list
    expect(options).not.toContain('Marea Britanie');
    // Non-EU country — must not appear
    expect(options).not.toContain('Statele Unite ale Americii');

    // Switch to non-EU
    await page.getByRole('button', { name: /Născut în afara UE/i }).click();

    options = await countrySelect.locator('option').allTextContents();
    expect(options).toContain('Statele Unite ale Americii');
    expect(options).toContain('Marea Britanie');
    expect(options).toContain('Turcia');
    // EU country — must not appear
    expect(options).not.toContain('Germania');
  });

  test('Step 1 wraps the foreign panel with amber border (visual signal)', async ({
    page,
  }) => {
    await openWizard(page);
    await pickPF(page);
    await page.getByRole('button', { name: /cetățean străin/i }).click();

    // The "Date despre naștere" container has the amber-tinted border class.
    const panel = page
      .getByText('Date despre naștere')
      .locator('xpath=ancestor::div[contains(@class, "border-amber-200")]')
      .first();
    await expect(panel).toBeVisible();
  });

  test('Helper hint disappears when switching back to Cetățean Român', async ({
    page,
  }) => {
    await openWizard(page);
    await pickPF(page);
    await page.getByRole('button', { name: /cetățean străin/i }).click();
    // Hint visible
    await expect(
      page.getByText(/Marchează această opțiune dacă nu ești născut în România/i)
    ).toBeVisible();

    // Switch back
    await page.getByRole('button', { name: /cetățean român/i }).click();
    await expect(
      page.getByText(/Marchează această opțiune dacă nu ești născut în România/i)
    ).not.toBeVisible();
    await expect(page.getByText('Date despre naștere')).not.toBeVisible();
  });
});
