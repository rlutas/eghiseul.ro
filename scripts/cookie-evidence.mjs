// Collects evidence of tracking before cookie consent, for ANSPDCP complaints.
// Each site opens in a fresh browser context (no cookies, like incognito), with
// no interaction with the banner; after 8 s we record every request to a
// tracker and every cookie set, plus a screenshot.
//
// Also writes <site>-raport.pdf: screenshot + request and cookie tables, the
// attachment for the complaint.
//
// Usage: node scripts/cookie-evidence.mjs <out-dir> <url> [<url> ...]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, ...urls] = process.argv.slice(2);
if (!outDir || urls.length === 0) {
  console.error('Usage: node scripts/cookie-evidence.mjs <out-dir> <url> [<url> ...]');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const TRACKERS =
  /google-analytics\.com|googletagmanager\.com|analytics\.google\.com|doubleclick\.net|google\.com\/(ccm|pagead)|googlesyndication\.com|facebook|clarity\.ms|inspectlet|hotjar|tiktok|bat\.bing/;
const TRACKING_COOKIE = /^(_ga|_gid|_gcl|_fbp|_fbc|_clck|_clsk|_uet|MUID|IDE|_tt|__insp_|_hj)/;

const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ro = (iso) => new Date(iso).toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' });

async function writePdfReport(ctx, name, record, pngPath, pdfPath) {
  const img = fs.readFileSync(pngPath).toString('base64');
  const tracking = record.cookies.filter((c) => TRACKING_COOKIE.test(c.name));
  const rows = (list, cols) => list.map((r) => `<tr>${cols.map((c) => `<td>${esc(c(r))}</td>`).join('')}</tr>`).join('');
  const html = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;font-size:10pt;color:#111;margin:0}h1{font-size:15pt;margin:0 0 2mm}
    table{border-collapse:collapse;width:100%;margin:2mm 0 5mm;font-size:8.5pt}td,th{border:1px solid #ccc;padding:1.2mm 2mm;text-align:left;vertical-align:top;word-break:break-all}
    th{background:#f2f2f2}img{width:100%;border:1px solid #999;margin:2mm 0 5mm}.m{color:#444}</style></head><body>
    <h1>Raport tehnic: ${esc(name)}</h1>
    <p class="m">Data și ora începerii testului: <b>${esc(ro(record.testStartUtc))}</b> (ora României) · ${esc(record.testStartUtc)} UTC<br>
    Site: ${esc(record.site)}<br>Metodă: ${esc(record.method)}.</p>
    <p><b>Rezultat:</b> ${record.trackerRequests.length} cereri către servicii de urmărire/reclame și ${tracking.length} cookie-uri de urmărire, toate înainte de orice alegere în bannerul de cookie-uri.</p>
    <h2 style="font-size:11pt">Captura paginii la momentul testului (banner neatins)</h2><img src="data:image/png;base64,${img}">
    <h2 style="font-size:11pt">Cookie-uri stocate în browser</h2><table><tr><th>Nume</th><th>Domeniu</th><th>Expiră</th></tr>${rows(record.cookies, [(c) => c.name, (c) => c.domain, (c) => (c.expires === 'session' ? 'la închiderea browserului' : ro(c.expires))])}</table>
    <h2 style="font-size:11pt">Cereri către servicii de urmărire/reclame</h2><table><tr><th>Ora</th><th>Adresa cererii</th></tr>${rows(record.trackerRequests, [(r) => ro(r.t), (r) => r.url])}</table>
    <p class="m">Verificare realizată de Raul Luțaș.</p></body></html>`;
  const p = await ctx.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.pdf({ path: pdfPath, format: 'A4', margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }, printBackground: true });
  await p.close();
}

const browser = await chromium.launch();
const summary = [];
for (const url of urls) {
  const name = new URL(url).hostname.replace(/^www\./, '');
  const ctx = await browser.newContext({ locale: 'ro-RO', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const requests = [];
  page.on('request', (r) => {
    if (TRACKERS.test(r.url())) requests.push({ t: new Date().toISOString(), url: r.url().slice(0, 400) });
  });
  const testStartUtc = new Date().toISOString();
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(8000);
  const cookies = (await ctx.cookies()).map((c) => ({
    name: c.name,
    domain: c.domain,
    expires: c.expires > 0 ? new Date(c.expires * 1000).toISOString() : 'session',
  }));
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  const record = {
    site: url,
    testStartUtc,
    method: 'Chromium, context nou fără cookie-uri (echivalent incognito), nicio interacțiune cu bannerul, 8 secunde după încărcare',
    trackerRequests: requests,
    cookies,
  };
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(record, null, 2));
  await writePdfReport(ctx, name, record, path.join(outDir, `${name}.png`), path.join(outDir, `${name}-raport.pdf`));
  summary.push({
    site: name,
    trackerRequests: requests.length,
    trackingCookies: cookies.filter((c) => TRACKING_COOKIE.test(c.name)).map((c) => c.name).join(' '),
  });
  await ctx.close();
}
await browser.close();
console.table(summary);
