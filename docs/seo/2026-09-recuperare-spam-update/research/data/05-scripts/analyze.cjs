const fs = require('fs');
const path = require('path');
const SP = '/private/tmp/claude-501/-Users-raul-Projects-eghiseul-ro/d91d3358-09c5-4529-974f-27cee32d5a1d/scratchpad';
const REPO = '/Users/raul/Projects/eghiseul.ro';

// ---- 1. sitemap URLs ----
const sm = fs.readFileSync(path.join(SP, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  m[1].replace('https://eghiseul.ro', '').replace(/\/$/, '') || '/'
);

// ---- 2. constants from source ----
const consts = fs.readFileSync(path.join(REPO, 'src/lib/seo/constants.ts'), 'utf8');
function arr(name) {
  const re = new RegExp(name + "[^=]*=\\s*\\[([\\s\\S]*?)\\]", 'm');
  const m = consts.match(re);
  if (!m) throw new Error('missing ' + name);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}
const SERVICE_SLUGS = arr('HARDCODED_SERVICE_SLUGS');
const SUBROUTES = arr('HARDCODED_SERVICE_SUBROUTE_PATHS');
const CALC = arr('HARDCODED_CALCULATOR_SLUGS');
const TOOLS = arr('HARDCODED_TOOL_SLUGS');
const ARTICLES = arr('HARDCODED_ARTICLE_SLUGS');

const citiesSrc = fs.readFileSync(path.join(REPO, 'src/lib/seo/locations/cities.ts'), 'utf8');
const CITY_SLUGS = [...citiesSrc.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => m[1]);
const ocpiSrc = fs.readFileSync(path.join(REPO, 'src/lib/seo/locations/ocpi.ts'), 'utf8');
const OCPI_SLUGS = [...ocpiSrc.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
const idxSrc = fs.readFileSync(path.join(REPO, 'src/lib/seo/locations/index.ts'), 'utf8');
const INDEXABLE = [...idxSrc.match(/INDEXABLE_CITY_SLUGS[^=]*=\s*\[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

// ---- 3. pages.json (rendered) ----
const pages = require(path.join(SP, 'pages.json'));
const byRoute = new Map(pages.map((p) => [p.route.replace(/\/$/, '') || '/', p]));

// ---- 4. git dates ----
const git = {};
for (const line of fs.readFileSync(path.join(SP, 'git-first.tsv'), 'utf8').trim().split('\n')) {
  const [f, first, last, n] = line.split('\t');
  git[f] = { first, last, commits: +n };
}
function routeToFile(route) {
  // try exact folder page.tsx
  const p = 'src/app' + (route === '/' ? '' : route) + '/page.tsx';
  if (git[p]) return p;
  return null;
}

// ---- 5. classify ----
const LEGAL = ['/contact', '/termeni-si-conditii', '/politica-de-confidentialitate', '/gdpr', '/politica-cookies', '/politica-de-anulare'];
const HUBS = ['/servicii', '/calculator', '/tools', '/blog'];

function classify(route) {
  if (route === '/') return 'homepage';
  if (LEGAL.includes(route)) return 'legal/trust';
  if (HUBS.includes(route)) return 'hub/index';
  if (route.startsWith('/calculator/')) return 'calculator/tool';
  if (route.startsWith('/tools/')) return 'calculator/tool';
  if (route === '/curs-valutar') return 'calculator/tool';
  const cityM = route.match(/^\/servicii\/cazier-judiciar-online\/([^/]+)$/);
  if (cityM && CITY_SLUGS.includes(cityM[1])) return 'location: cazier oraș';
  const jM = route.match(/^\/servicii\/extras-de-carte-funciara\/([^/]+)$/);
  if (jM && OCPI_SLUGS.includes(jM[1])) return 'location: CF județ';
  if (route.startsWith('/servicii/')) return 'service page';
  const slug = route.slice(1);
  if (ARTICLES.includes(slug)) return 'article/guide';
  return 'article/guide (nelistat)';
}

// ---- 6. assemble rows ----
const routesSet = new Set([...sitemapUrls]);
// also include prerendered public routes not in sitemap
const EXCLUDE = /^\/(admin|auth|colaborator|comanda|completare|reincarca-poza|_)/;
for (const p of pages) {
  const r = p.route.replace(/\/$/, '') || '/';
  if (EXCLUDE.test(r)) continue;
  if (p.mainWords === 0) continue;
  routesSet.add(r);
}

const rows = [];
for (const route of [...routesSet].sort()) {
  const p = byRoute.get(route);
  const file = routeToFile(route);
  const g = file ? git[file] : null;
  rows.push({
    route,
    class: classify(route),
    inSitemap: sitemapUrls.includes(route),
    prerendered: !!p,
    words: p ? p.mainWords : null,
    bodyWords: p ? p.bodyWords : null,
    title: p ? p.title : '',
    titleLen: p ? p.title.length : 0,
    descLen: p ? p.description.length : 0,
    ldTypes: p ? p.ldTypes : '',
    file,
    firstCommit: g ? g.first.slice(0, 10) : null,
    lastCommit: g ? g.last.slice(0, 10) : null,
    commits: g ? g.commits : null,
    indexable: route.startsWith('/servicii/cazier-judiciar-online/') && CITY_SLUGS.includes(route.split('/').pop())
      ? INDEXABLE.includes(route.split('/').pop()) : null,
  });
}

fs.writeFileSync(path.join(SP, 'inventory.json'), JSON.stringify(rows, null, 1));

// CSV
const cols = ['route', 'class', 'inSitemap', 'prerendered', 'words', 'bodyWords', 'titleLen', 'descLen', 'ldTypes', 'firstCommit', 'lastCommit', 'commits', 'indexable', 'title'];
const csv = [cols.join(',')].concat(rows.map((r) => cols.map((c) => {
  let v = r[c]; if (v === null || v === undefined) v = '';
  v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}).join(','))).join('\n');
fs.writeFileSync(path.join(SP, 'inventory.csv'), csv);

// ---- 7. summary ----
const byClass = {};
for (const r of rows) {
  (byClass[r.class] = byClass[r.class] || []).push(r);
}
function med(a) { const s = a.slice().sort((x, y) => x - y); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); }
console.log('CLASS\tN\tmedianWords\tmin\tmax\t<800\t<400');
for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1].length - a[1].length)) {
  const w = v.filter((x) => x.words != null).map((x) => x.words);
  console.log([k, v.length, med(w), Math.min(...w), Math.max(...w), w.filter((x) => x < 800).length, w.filter((x) => x < 400).length].join('\t'));
}
console.log('TOTAL', rows.length, 'sitemap', sitemapUrls.length, 'missing-render', rows.filter((r) => !r.prerendered).length);
console.log('cities', CITY_SLUGS.length, 'ocpi', OCPI_SLUGS.length, 'articles', ARTICLES.length, 'calc', CALC.length, 'svc', SERVICE_SLUGS.length);
