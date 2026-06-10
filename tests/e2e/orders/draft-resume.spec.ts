import { test, expect, Page } from '@playwright/test';

/**
 * Regression test for the draft-resume bug (2026-06-10): opening the wizard
 * with `?order=<code>&email=<email>` must restore the saved draft from the
 * SERVER (works cross-device), prefilling the contact email — even when
 * localStorage is empty (fresh device / different browser).
 *
 * Self-contained: it creates its own draft, then simulates a fresh device by
 * clearing localStorage and re-opening with the resume params.
 */

const TEST_EMAIL = 'resume-e2e@eghiseul.ro';

async function fillContact(page: Page) {
  await page.getByRole('textbox', { name: /email/i }).fill(TEST_EMAIL);
  const phone = page.getByRole('textbox', { name: /telefon/i });
  await phone.click();
  await phone.pressSequentially('755123456', { delay: 20 });
  await page.waitForTimeout(700);
}

test.describe('Draft resume from server', () => {
  test('?order=&email= prefills the contact email after clearing localStorage', async ({
    page,
  }) => {
    // 1. Create a draft and advance to step 2 so the URL gets ?order=&email=.
    await page.goto('/comanda/cazier-judiciar-persoana-fizica');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await fillContact(page);
    await page.getByRole('button', { name: /continuă/i }).click();
    // Wait for the debounced autosave to create the server draft + URL update.
    await page.waitForTimeout(2000);

    const url = new URL(page.url());
    const order = url.searchParams.get('order');
    const email = url.searchParams.get('email');
    expect(order, 'URL should carry ?order= after advancing').toBeTruthy();
    expect(email, 'URL should carry ?email= for guest resume').toBe(TEST_EMAIL);

    // 2. Simulate a fresh device: wipe localStorage, then open step 1 with the
    //    resume params. The contact MUST come from the server draft.
    await page.evaluate(() => localStorage.clear());
    await page.goto(
      `/comanda/cazier-judiciar-persoana-fizica?step=1&order=${order}&email=${encodeURIComponent(
        email!
      )}`
    );

    // 3. The email field is prefilled from the server-restored draft.
    await expect(page.getByRole('textbox', { name: /email/i })).toHaveValue(
      TEST_EMAIL,
      { timeout: 15_000 }
    );
  });
});
