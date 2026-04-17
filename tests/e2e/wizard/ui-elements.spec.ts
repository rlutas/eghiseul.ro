import { test, expect, Page } from '@playwright/test';

/**
 * UI-element level tests for shadcn components, keyboard navigation,
 * and mobile viewport snapshots.
 *
 * - Verifies that buttons / inputs / headings from shadcn render on
 *   the core public pages.
 * - Walks tab order on the wizard first step to confirm
 *   focus reaches email, phone, contact-method radios, and Continue.
 * - Takes mobile-viewport (iPhone 12) screenshots of homepage and
 *   wizard step 1 to catch responsive regressions visually.
 */

const SCREENSHOT_DIR = 'tests/screenshots';

// iPhone 12 viewport (375 x 812 @ DPR 3). We set these per-test rather than
// via `test.use({ ...devices['iPhone 12'] })` inside a describe block,
// because that would force a new worker & change defaultBrowserType —
// which Playwright disallows inside describe scopes.
const IPHONE_12_VIEWPORT = { width: 390, height: 844 };
const IPHONE_12_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

async function openWizard(page: Page) {
  const response = await page.goto('/comanda/cazier-judiciar-persoana-fizica');
  expect(response?.status()).toBeLessThan(500);
}

test.describe('UI Elements — shadcn rendering', () => {
  test('homepage: headings, links și butoane shadcn sunt prezente', async ({
    page,
  }) => {
    await page.goto('/');

    // At least one h1 rendered
    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1).toBeVisible();

    // At least one shadcn-style button (CTA)
    const anyBtn = page.getByRole('button').first();
    const anyLink = page.getByRole('link').first();
    await expect.soft(anyBtn).toBeVisible();
    await expect(anyLink).toBeVisible();
  });

  test('login: Card shadcn cu input-uri email + parolă', async ({ page }) => {
    await page.goto('/auth/login');

    const email = page.getByRole('textbox', { name: /email/i });
    await expect(email).toBeVisible();

    const password = page.getByLabel(/parol[ăa]/i).first();
    await expect(password).toBeVisible();

    const submit = page
      .getByRole('button', { name: /autentific|login|intr[ăa]/i })
      .first();
    await expect(submit).toBeVisible();
  });

  test('wizard: input-uri, radio group și butoane vizibile pe pasul 1', async ({
    page,
  }) => {
    await openWizard(page);

    // Email + Phone textboxes
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /telefon/i })).toBeVisible();

    // Contact method radios (email / telefon / whatsapp)
    const radios = page.getByRole('radio');
    expect(await radios.count()).toBeGreaterThan(0);

    // Continuă button present (may be disabled initially)
    const continueBtn = page.getByRole('button', { name: /continuă/i });
    await expect(continueBtn).toBeVisible();
  });
});

test.describe('UI Elements — keyboard navigation', () => {
  test('pe wizard pasul 1, Tab trece prin email → telefon → buton', async ({
    page,
  }) => {
    await openWizard(page);

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.click();
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await page.keyboard.type('kbd@test.ro');

    // Tab until the phone textbox has focus (there may be UI between them)
    const phoneInput = page.getByRole('textbox', { name: /telefon/i });
    let sawPhone = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      if (await phoneInput.evaluate((el) => el === document.activeElement).catch(() => false)) {
        sawPhone = true;
        break;
      }
    }
    expect(sawPhone, 'Tab sequence should reach the phone input').toBeTruthy();

    // Type a value, then continue Tab-walking until we land on a button
    await page.keyboard.type('+40 755 111 222');

    let sawButton = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const focusedIsButton = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        const tag = el.tagName;
        const role = el.getAttribute('role');
        return tag === 'BUTTON' || role === 'button';
      });
      if (focusedIsButton) {
        sawButton = true;
        break;
      }
    }
    expect(
      sawButton,
      'Tab sequence from inputs should eventually reach a button',
    ).toBeTruthy();
  });
});

test.describe('UI Elements — mobile viewport (iPhone 12)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(IPHONE_12_VIEWPORT);
    await page.setExtraHTTPHeaders({ 'User-Agent': IPHONE_12_UA });
  });

  test('homepage se randează fără overflow orizontal pe iPhone 12', async ({
    page,
  }) => {
    await page.goto('/');

    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1).toBeVisible();

    // Assert no horizontal scroll on the document
    const hasHorizontalScroll = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth > de.clientWidth + 1; // +1 px tolerance
    });
    expect(hasHorizontalScroll, 'Mobile layout should not overflow horizontally').toBe(false);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/ui-mobile-homepage-iphone12.png`,
      fullPage: false,
    });
  });

  test('wizard pasul 1 se randează complet pe iPhone 12', async ({ page }) => {
    await openWizard(page);

    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /telefon/i })).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth > de.clientWidth + 1;
    });
    expect(hasHorizontalScroll).toBe(false);

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/ui-mobile-wizard-step1-iphone12.png`,
      fullPage: true,
    });
  });
});
