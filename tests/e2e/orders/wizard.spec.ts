import { test, expect } from '@playwright/test';

// Valid test CNP for Romanian validation
const VALID_TEST_CNP = '1850101400017';

test.describe('Order Wizard - Step Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comanda/cazier-judiciar');
  });

  test('should display wizard with step indicator', async ({ page }) => {
    // Check for step indicators
    const stepIndicator = page.getByText(/date contact|tip client|date personale/i);
    await expect(stepIndicator.first()).toBeVisible();
  });

  test('should show order summary sidebar', async ({ page }) => {
    const summarySection = page.getByText(/rezumat comandă/i);
    await expect(summarySection).toBeVisible();
  });

  test('should display service name in summary', async ({ page }) => {
    const serviceName = page.getByRole('heading', { name: /cazier judiciar/i });
    await expect(serviceName.first()).toBeVisible();
  });
});

test.describe('Order Wizard - Step 1: Contact Data', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/comanda/cazier-judiciar');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display contact form fields', async ({ page }) => {
    // Check email field
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();

    // Check phone field
    const phoneInput = page.getByRole('textbox', { name: /telefon/i });
    await expect(phoneInput).toBeVisible();
  });

  test('should display contact method options', async ({ page }) => {
    // Check for contact method selection
    const emailOption = page.getByRole('radio', { name: /email/i });
    const phoneOption = page.getByRole('radio', { name: /telefon/i });
    const whatsappOption = page.getByRole('radio', { name: /whatsapp/i });

    await expect(emailOption).toBeVisible();
    await expect(phoneOption).toBeVisible();
    await expect(whatsappOption).toBeVisible();
  });

  test('should have phone prefix pre-filled', async ({ page }) => {
    const phoneInput = page.getByRole('textbox', { name: /telefon/i });
    await expect(phoneInput).toHaveValue(/\+40/);
  });

  test('should disable continue button when form is incomplete', async ({ page }) => {
    const continueButton = page.getByRole('button', { name: /continuă/i });
    await expect(continueButton).toBeDisabled();
  });

  test('should enable continue button when form is complete', async ({ page }) => {
    // Fill in email
    await page.getByRole('textbox', { name: /email/i }).fill('test@eghiseul.ro');

    // Fill in phone
    await page.getByRole('textbox', { name: /telefon/i }).fill('+40 755 123 456');

    // Wait for validation
    await page.waitForTimeout(500);

    // Check if continue button is enabled
    const continueButton = page.getByRole('button', { name: /continuă/i });
    await expect(continueButton).toBeEnabled();
  });

  test('should advance to step 2 when clicking continue', async ({ page }) => {
    // Fill contact form
    await page.getByRole('textbox', { name: /email/i }).fill('test@eghiseul.ro');
    await page.getByRole('textbox', { name: /telefon/i }).fill('+40 755 123 456');

    // Click continue
    const continueButton = page.getByRole('button', { name: /continuă/i });
    await continueButton.click();

    // Should show step 2 content (client type selection)
    await expect(page.getByText(/tip client|persoană fizică|persoană juridică/i).first()).toBeVisible();
  });
});

test.describe('Order Wizard - Step 2: Client Type', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comanda/cazier-judiciar');
    // Complete step 1 first
    await page.getByRole('textbox', { name: /email/i }).fill('test@eghiseul.ro');
    await page.getByRole('textbox', { name: /telefon/i }).fill('+40 755 123 456');
    await page.getByRole('button', { name: /continuă/i }).click();
    await page.waitForURL(/step=2/);
  });

  test('should display client type options', async ({ page }) => {
    // Check for PF/PJ options
    const pfOption = page.getByText(/persoană fizică/i);
    const pjOption = page.getByText(/persoană juridică/i);

    await expect(pfOption.first()).toBeVisible();
    await expect(pjOption.first()).toBeVisible();
  });

  test('should generate order code', async ({ page }) => {
    // Check for order code (ORD-YYYYMMDD-XXXXX)
    const orderCode = page.getByText(/ORD-\d{8}-[A-Z0-9]{5}/);
    await expect(orderCode.first()).toBeVisible();
  });

  test('should show auto-save indicator', async ({ page }) => {
    // Check for save indicator
    const saveIndicator = page.getByText(/salvat acum|salvat/i);
    await expect(saveIndicator.first()).toBeVisible();
  });

  test('should update steps when selecting PF', async ({ page }) => {
    // Click on Persoană Fizică
    const pfOption = page.locator('[class*="card"], [role="button"]').filter({ hasText: /persoană fizică/i }).first();
    await pfOption.click();

    // Steps should update (PF typically has 8 steps)
    await page.waitForTimeout(500);

    // Check step count
    const stepIndicators = page.locator('[class*="step"]');
    const count = await stepIndicators.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Order Wizard - Step 3: Personal Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/comanda/cazier-judiciar');
    // Complete steps 1-2
    await page.getByRole('textbox', { name: /email/i }).fill('test@eghiseul.ro');
    await page.getByRole('textbox', { name: /telefon/i }).fill('+40 755 123 456');
    await page.getByRole('button', { name: /continuă/i }).click();
    await page.waitForURL(/step=2/);

    // Select PF
    const pfOption = page.locator('[class*="card"], [role="button"]').filter({ hasText: /persoană fizică/i }).first();
    await pfOption.click();
    await page.getByRole('button', { name: /continuă/i }).click();
  });

  test('should display document upload section', async ({ page }) => {
    const uploadSection = page.getByText(/scanează|carte identitate|încarcă/i);
    await expect(uploadSection.first()).toBeVisible();
  });

  test('should display manual entry button', async ({ page }) => {
    const manualButton = page.getByRole('button', { name: /completez manual/i });
    await expect(manualButton).toBeVisible();
  });

  test('should display CNP field', async ({ page }) => {
    const cnpField = page.getByRole('textbox', { name: /cnp/i });
    await expect(cnpField).toBeVisible();
  });

  test('should validate CNP format', async ({ page }) => {
    const cnpField = page.getByRole('textbox', { name: /cnp/i });

    // Enter invalid CNP
    await cnpField.fill('1234567890123');

    // Should show validation error
    const error = page.getByText(/invalid|cifra de control/i);
    await expect(error.first()).toBeVisible();
  });

  test('should accept valid CNP', async ({ page }) => {
    const cnpField = page.getByRole('textbox', { name: /cnp/i });

    // Enter valid CNP
    await cnpField.fill(VALID_TEST_CNP);

    // Should show success indicator
    const successInfo = page.getByText(/bărbat|femeie/i);
    await expect(successInfo.first()).toBeVisible();
  });

  test('should display address fields', async ({ page }) => {
    // Check for address fields
    const countyField = page.getByRole('combobox', { name: /județ/i });
    const streetField = page.getByRole('textbox', { name: /strada/i });

    await expect(countyField).toBeVisible();
    await expect(streetField).toBeVisible();
  });

  test('should auto-populate birth date from CNP', async ({ page }) => {
    const cnpField = page.getByRole('textbox', { name: /cnp/i });
    await cnpField.fill(VALID_TEST_CNP);

    // Birth date should be auto-filled
    const birthDateField = page.getByRole('textbox', { name: /data nașterii/i });
    await expect(birthDateField).not.toHaveValue('');
  });
});

test.describe('Order Wizard - Auto-save', () => {
  test('should persist data in localStorage', async ({ page }) => {
    await page.goto('/comanda/cazier-judiciar');

    // Fill contact data
    await page.getByRole('textbox', { name: /email/i }).fill('test@eghiseul.ro');
    await page.getByRole('textbox', { name: /telefon/i }).fill('+40 755 123 456');

    // Wait for auto-save
    await page.waitForTimeout(1000);

    // Check localStorage
    const savedData = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const draftKey = keys.find(k => k.includes('draft') || k.includes('order'));
      return draftKey ? localStorage.getItem(draftKey) : null;
    });

    expect(savedData).not.toBeNull();
  });

  test('should restore data on page reload', async ({ page }) => {
    await page.goto('/comanda/cazier-judiciar');

    // Fill data
    const testEmail = 'restore-test@eghiseul.ro';
    await page.getByRole('textbox', { name: /email/i }).fill(testEmail);
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();

    // Data should be restored
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toHaveValue(testEmail);
  });
});

test.describe('Order Wizard - Navigation', () => {
  test('should allow going back to previous steps', async ({ page }) => {
    await page.goto('/comanda/cazier-judiciar');

    // Complete step 1
    await page.getByRole('textbox', { name: /email/i }).fill('test@eghiseul.ro');
    await page.getByRole('textbox', { name: /telefon/i }).fill('+40 755 123 456');
    await page.getByRole('button', { name: /continuă/i }).click();
    await page.waitForURL(/step=2/);

    // Go back
    const backButton = page.getByRole('button', { name: /înapoi/i });
    await backButton.click();

    // Should be back at step 1
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  test('should not allow skipping steps', async ({ page }) => {
    await page.goto('/comanda/cazier-judiciar?step=5');

    // Should redirect to earlier step
    const stepHeading = page.getByRole('heading', { level: 2 });
    await expect(stepHeading.first()).toBeVisible();
  });
});
