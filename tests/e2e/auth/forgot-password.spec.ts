import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password');
  });

  test('should display forgot password form', async ({ page }) => {
    // Check page heading
    const heading = page.getByRole('heading', { name: /resetare|ai uitat|forgot|parolă/i });
    await expect(heading).toBeVisible();
  });

  test('should display email field', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test('should display submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /trimite|resetare|reset/i });
    await expect(submitButton).toBeVisible();
  });

  test('should display back to login link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /înapoi|autentificare|login/i });
    await expect(backLink).toBeVisible();
  });

  test('should navigate back to login', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /înapoi|autentificare/i });
    await backLink.click();

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should accept email input', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    const submitButton = page.getByRole('button', { name: /trimite|reset/i });

    // Fill with invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();

    // Should show validation error or not navigate
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });
});
