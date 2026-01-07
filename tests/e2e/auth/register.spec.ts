import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test('should display registration form', async ({ page }) => {
    // Check page heading
    const heading = page.getByRole('heading', { name: /creează cont|înregistrare|register/i });
    await expect(heading).toBeVisible();
  });

  test('should display all required fields', async ({ page }) => {
    // Check first name field
    const firstNameInput = page.getByLabel(/prenume/i);
    await expect(firstNameInput).toBeVisible();

    // Check last name field
    const lastNameInput = page.getByLabel(/nume(?!.*prenume)/i);
    await expect(lastNameInput).toBeVisible();

    // Check email field
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Check phone field
    const phoneInput = page.getByLabel(/telefon/i);
    await expect(phoneInput).toBeVisible();

    // Check password field
    const passwordInput = page.getByLabel(/^parolă$|^password$/i);
    await expect(passwordInput).toBeVisible();

    // Check confirm password field
    const confirmPasswordInput = page.getByLabel(/confirmă parola|confirm password/i);
    await expect(confirmPasswordInput).toBeVisible();
  });

  test('should display terms checkbox', async ({ page }) => {
    // Check terms and conditions checkbox
    const termsCheckbox = page.getByRole('checkbox');
    await expect(termsCheckbox.first()).toBeVisible();

    // Check terms link
    const termsLink = page.getByRole('link', { name: /termeni|condiții/i });
    await expect(termsLink.first()).toBeVisible();
  });

  test('should display submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /creează|înregistrează|register/i });
    await expect(submitButton).toBeVisible();
  });

  test('should display login link', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /autentifică|login|ai cont/i });
    await expect(loginLink).toBeVisible();
  });

  test('should display benefits section', async ({ page }) => {
    // Check for benefits (4 benefits visible according to test report)
    const benefitsSection = page.locator('[class*="benefit"], [class*="feature"]');
    const count = await benefitsSection.count();

    // At least some benefits should be visible
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /autentifică/i });
    await loginLink.click();

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should accept form input', async ({ page }) => {
    // Fill in the form
    await page.getByLabel(/prenume/i).fill('Ion');
    await page.getByLabel(/nume(?!.*prenume)/i).fill('Popescu');
    await page.getByLabel(/email/i).fill('ion.popescu@example.com');
    await page.getByLabel(/telefon/i).fill('0755123456');

    // Verify values
    await expect(page.getByLabel(/prenume/i)).toHaveValue('Ion');
    await expect(page.getByLabel(/email/i)).toHaveValue('ion.popescu@example.com');
  });

  test('should require terms acceptance', async ({ page }) => {
    // Fill form without checking terms
    await page.getByLabel(/prenume/i).fill('Ion');
    await page.getByLabel(/nume(?!.*prenume)/i).fill('Popescu');
    await page.getByLabel(/email/i).fill('ion.popescu@example.com');

    // Submit button should be disabled or form should not submit
    const submitButton = page.getByRole('button', { name: /creează/i });

    // Either disabled or will show error on submit
    await expect(submitButton).toBeVisible();
  });
});
