import { test, expect } from '@playwright/test';

test.describe('Service Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/cazier-judiciar');
  });

  test('should display service page with all sections', async ({ page }) => {
    // Check page title
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/cazier judiciar/i);
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('nav[aria-label*="breadcrumb"], [class*="breadcrumb"]');
    await expect(breadcrumb.first()).toBeVisible();
  });

  test('should display service price', async ({ page }) => {
    // Check for price display
    const price = page.getByText(/\d+\s*RON/i);
    await expect(price.first()).toBeVisible();
  });

  test('should display delivery time information', async ({ page }) => {
    // Check for delivery info
    const deliveryInfo = page.getByText(/zile|livrare|urgent/i);
    await expect(deliveryInfo.first()).toBeVisible();
  });

  test('should display service options', async ({ page }) => {
    // Check for options section
    const optionsSection = page.getByText(/opțiuni|standard|urgent|express/i);
    await expect(optionsSection.first()).toBeVisible();
  });

  test('should display order button', async ({ page }) => {
    const orderButton = page.getByRole('link', { name: /comandă|începe|solicită/i });
    await expect(orderButton.first()).toBeVisible();
  });

  test('should display "How it works" section', async ({ page }) => {
    const howItWorks = page.getByText(/cum funcționează/i);
    await howItWorks.first().scrollIntoViewIfNeeded();
    await expect(howItWorks.first()).toBeVisible();
  });

  test('should display required documents section', async ({ page }) => {
    const docs = page.getByText(/documente necesare|acte necesare/i);
    await docs.first().scrollIntoViewIfNeeded();
    await expect(docs.first()).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    const faq = page.getByText(/întrebări frecvente|faq/i);
    await faq.first().scrollIntoViewIfNeeded();
    await expect(faq.first()).toBeVisible();
  });

  test('should navigate to order wizard when clicking order button', async ({ page }) => {
    const orderButton = page.getByRole('link', { name: /comandă acum/i });
    await orderButton.first().click();

    await expect(page).toHaveURL(/\/comanda\/cazier-judiciar/);
  });
});

test.describe('Service Listing', () => {
  test('should display services on homepage', async ({ page }) => {
    await page.goto('/');

    // Check for services section
    const servicesSection = page.locator('section').filter({ hasText: /servicii/i });
    await expect(servicesSection.first()).toBeVisible();
  });

  test('should navigate to service detail from homepage', async ({ page }) => {
    await page.goto('/');

    // Click on a service card
    const serviceCard = page.getByRole('link', { name: /cazier|certificat|extras/i }).first();
    await serviceCard.click();

    // Should be on service detail page
    await expect(page).toHaveURL(/\/services\//);
  });
});
