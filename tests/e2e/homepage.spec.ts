import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display header with logo and navigation', async ({ page }) => {
    // Check header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check logo link in header (the main logo, not email links)
    const logo = page.locator('header a[href="/"]').first();
    await expect(logo).toBeVisible();

    // Check navigation links
    const servicesLink = page.getByRole('link', { name: /servicii/i }).first();
    await expect(servicesLink).toBeVisible();
  });

  test('should display top bar with contact info', async ({ page }) => {
    // Check for phone number anywhere on page
    const phoneNumber = page.getByText(/0[0-9]{3}.*[0-9]{3}.*[0-9]{3}|\+40/);
    await expect(phoneNumber.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display hero section with title and CTA', async ({ page }) => {
    // Check hero title
    const heroTitle = page.getByRole('heading', { level: 1 });
    await expect(heroTitle).toBeVisible();

    // Check CTA buttons
    const ctaButton = page.getByRole('link', { name: /începe acum|comandă/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should display services grid', async ({ page }) => {
    // Check services section exists
    const servicesSection = page.locator('section').filter({ hasText: /servicii/i }).first();
    await expect(servicesSection).toBeVisible();

    // Check at least some service cards are visible
    const serviceCards = page.locator('[class*="card"], [class*="service"]');
    await expect(serviceCards.first()).toBeVisible();
  });

  test('should display Google Reviews badge', async ({ page }) => {
    // Check for reviews badge (4.9/5 or similar)
    const reviewsBadge = page.getByText(/4\.[0-9]\/5|google reviews/i);
    await expect(reviewsBadge.first()).toBeVisible();
  });

  test('should display social proof statistics', async ({ page }) => {
    // Check for statistics (200k+ documents)
    const statsSection = page.getByText(/documente|clienți|ani/i).first();
    await expect(statsSection).toBeVisible();
  });

  test('should display "How it works" section', async ({ page }) => {
    // Scroll to how it works section
    const howItWorks = page.getByText(/cum funcționează/i).first();
    await howItWorks.scrollIntoViewIfNeeded();
    await expect(howItWorks).toBeVisible();
  });

  test('should display pricing section', async ({ page }) => {
    // Check for pricing options
    const pricingSection = page.getByText(/standard|urgent|express/i).first();
    await pricingSection.scrollIntoViewIfNeeded();
    await expect(pricingSection).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    // Check for FAQ
    const faqSection = page.getByText(/întrebări frecvente|faq/i).first();
    await faqSection.scrollIntoViewIfNeeded();
    await expect(faqSection).toBeVisible();
  });

  test('should display footer with links', async ({ page }) => {
    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();

    // Check for important links
    await expect(page.getByRole('link', { name: /termeni|confidențialitate/i }).first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check page still renders
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check hero is visible
    const heroTitle = page.getByRole('heading', { level: 1 });
    await expect(heroTitle).toBeVisible();
  });
});

test.describe('Homepage Navigation', () => {
  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');

    // Find and click a service link
    const serviceLink = page.getByRole('link', { name: /cazier|certificat|extras/i }).first();
    await serviceLink.click();

    // Should be on a service page
    await expect(page).toHaveURL(/\/services\//);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /autentificare/i }).first();
    await loginLink.click();

    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
