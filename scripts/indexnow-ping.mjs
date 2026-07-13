/**
 * IndexNow ping — submits all sitemap URLs to api.indexnow.org (Bing, Seznam,
 * Naver, Yandex share the endpoint). Bing indexing is a prerequisite for
 * ChatGPT search and Copilot citations (both retrieve from the Bing index).
 *
 * Run AFTER deploy (the key file must be live at https://eghiseul.ro/<key>.txt):
 *   node scripts/indexnow-ping.mjs             # all sitemap URLs
 *   node scripts/indexnow-ping.mjs url1 url2   # specific URLs only
 *
 * Docs: https://www.indexnow.org/documentation
 */

const HOST = 'eghiseul.ro';
const KEY = '73975f21070e43bc6ecac26b917d8cf1';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function getSitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = args.length > 0 ? args : await getSitemapUrls();
console.log(`Submitting ${urlList.length} URLs to IndexNow...`);

// IndexNow accepts up to 10,000 URLs per POST — one request suffices.
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});
console.log(`IndexNow response: ${res.status} ${res.statusText}`);
if (!res.ok) console.log(await res.text());
