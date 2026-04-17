import { test, expect } from '@playwright/test';

/**
 * Smoke tests for all publicly accessible routes.
 *
 * These assert that anonymous users can reach the main entry points of the
 * application (homepage, catalog, wizard, auth pages, public status lookup)
 * and that the first meaningful UI element renders without a 500.
 */

const SCREENSHOT_DIR = 'tests/screenshots';

test.describe('Smoke: rute publice', () => {
  test('homepage se încarcă și titlul conține brandul eGhișeul', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);

    // Title check — "eGhiseul.ro" / "eGhișeul" / "gHiseul" all acceptable
    await expect(page).toHaveTitle(/eghi[sș]eul|gHiseul/i);

    // Hero heading should render
    const heroHeading = page.getByRole('heading', { level: 1 });
    await expect(heroHeading.first()).toBeVisible();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/smoke-homepage.png`,
      fullPage: false,
    });
  });

  test('pagina /servicii afișează catalogul cu cel puțin un serviciu', async ({ page }) => {
    const response = await page.goto('/servicii');
    expect(response?.status()).toBeLessThan(500);

    // At least one card/link towards a service should be visible.
    // We look for a link pointing to a service page OR a "Comandă" CTA.
    const serviceLink = page
      .getByRole('link', { name: /cazier|certificat|extras|rovinieta|comand/i })
      .first();
    await expect(serviceLink).toBeVisible({ timeout: 10_000 });

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/smoke-servicii.png`,
      fullPage: false,
    });
  });

  test('wizardul /comanda/cazier-judiciar-persoana-fizica se deschide', async ({
    page,
  }) => {
    const response = await page.goto('/comanda/cazier-judiciar-persoana-fizica');
    expect(response?.status()).toBeLessThan(500);

    // First step of the wizard (contact) should show email input
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible({ timeout: 15_000 });

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/smoke-wizard-step1.png`,
      fullPage: false,
    });
  });

  test('pagina de login randează formularul', async ({ page }) => {
    // App mounts auth pages under /auth/* — /login is not a public alias yet.
    const response = await page.goto('/auth/login');
    expect(response?.status()).toBeLessThan(500);

    const emailInput = page.getByRole('textbox', { name: /email/i });
    const passwordInput = page.getByLabel(/parol[ăa]/i).first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/smoke-login.png`,
      fullPage: false,
    });
  });

  test('pagina de register randează formularul', async ({ page }) => {
    const response = await page.goto('/auth/register');
    expect(response?.status()).toBeLessThan(500);

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/smoke-register.png`,
      fullPage: false,
    });
  });

  test('pagina de forgot-password randează formularul', async ({ page }) => {
    const response = await page.goto('/auth/forgot-password');
    expect(response?.status()).toBeLessThan(500);

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();

    // Button should mention recovery/reset
    const submitBtn = page
      .getByRole('button', { name: /trimite|reset|recuper|link/i })
      .first();
    await expect(submitBtn).toBeVisible();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/smoke-forgot-password.png`,
      fullPage: false,
    });
  });

  test('pagina publică /comanda/status afișează formularul de căutare', async ({
    page,
  }) => {
    const response = await page.goto('/comanda/status');
    expect(response?.status()).toBeLessThan(500);

    // Public lookup form — should have an input for order code or email
    const anyInput = page.getByRole('textbox').first();
    await expect(anyInput).toBeVisible({ timeout: 10_000 });

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/smoke-order-status.png`,
      fullPage: false,
    });
  });
});
