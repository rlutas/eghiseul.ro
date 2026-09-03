const { chromium } = require('playwright');
(async () => {
  const outDir = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 540, height: 675 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    recordVideo: { dir: outDir, size: { width: 1080, height: 1350 } },
    locale: 'ro-RO',
  });
  const page = await ctx.newPage();
  // accept cookie banner quickly if present
  await page.goto('https://eghiseul.ro/servicii/certificat-constatator-online/', { waitUntil: 'networkidle' });
  const btn = page.getByRole('button', { name: /accept|acceptă|toate/i }).first();
  try { await btn.click({ timeout: 2000 }); } catch {}
  await page.waitForTimeout(2500);
  // slow scroll to steps
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 90); await page.waitForTimeout(140); }
  await page.waitForTimeout(1200);
  // go to wizard
  await page.goto('https://eghiseul.ro/comanda/certificat-constatator/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const cui = page.locator('#cui');
  try {
    await cui.scrollIntoViewIfNeeded({ timeout: 4000 });
    await cui.click();
    await cui.pressSequentially('47829135', { delay: 160 });
    await page.waitForTimeout(2500);
  } catch (e) { console.error('cui field not found', e.message); await page.waitForTimeout(3000); }
  await ctx.close();
  await browser.close();
})();
