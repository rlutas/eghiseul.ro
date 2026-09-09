// Extract rendered text from Next.js prerendered HTML files.
// Method: strip <script>/<style>/<noscript>/<svg>/<template>, isolate <main>,
// strip remaining tags, decode entities, collapse whitespace, count words.
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/raul/Projects/eghiseul.ro/.next/server/app';
const OUT = process.argv[2];

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const ENT = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&#x27;': "'", '&nbsp;': ' ', '&#160;': ' ', '&hellip;': '…',
  '&mdash;': '—', '&ndash;': '–', '&laquo;': '«', '&raquo;': '»',
  '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”',
};

function decode(s) {
  return s
    .replace(/&(amp|lt|gt|quot|#39|#x27|nbsp|#160|hellip|mdash|ndash|laquo|raquo|rsquo|lsquo|ldquo|rdquo);/g, (m) => ENT[m] || ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-zA-Z]+;/g, ' ');
}

function clean(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function toText(frag) {
  // Insert separators at block-level tag boundaries so words don't fuse.
  const withSep = frag.replace(/<[^>]+>/g, ' ');
  return decode(withSep).replace(/\s+/g, ' ').trim();
}

function words(t) {
  if (!t) return 0;
  return t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

const files = walk(ROOT).sort();
const rows = [];
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const c = clean(raw);
  const mStart = c.indexOf('<main');
  const mEnd = c.lastIndexOf('</main>');
  let mainFrag = mStart >= 0 && mEnd > mStart ? c.slice(mStart, mEnd) : '';
  // whole body
  const bStart = c.indexOf('<body');
  const bEnd = c.lastIndexOf('</body>');
  const bodyFrag = bStart >= 0 && bEnd > bStart ? c.slice(bStart, bEnd) : c;

  const mainText = toText(mainFrag);
  const bodyText = toText(bodyFrag);

  // route from filepath
  let route = '/' + path.relative(ROOT, f).replace(/\.html$/, '');
  if (route === '/index') route = '/';
  route = route.replace(/\/page$/, '/');

  // title
  const tm = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const dm = raw.match(/<meta name="description" content="([^"]*)"/i);
  // count JSON-LD blocks + types
  const ld = [...raw.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const ldTypes = [];
  for (const block of ld) {
    for (const t of block.matchAll(/"@type"\s*:\s*"([^"]+)"/g)) ldTypes.push(t[1]);
  }

  rows.push({
    route,
    file: path.relative(ROOT, f),
    mainWords: words(mainText),
    bodyWords: words(bodyText),
    title: tm ? decode(tm[1]).trim() : '',
    description: dm ? decode(dm[1]).trim() : '',
    ldBlocks: ld.length,
    ldTypes: [...new Set(ldTypes)].join('|'),
    mainText,
  });
}

fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
console.log('files:', rows.length);
console.log('no-main:', rows.filter((r) => r.mainWords === 0).length);
