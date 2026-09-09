const fs = require('fs');
const path = require('path');
const SP = '/private/tmp/claude-501/-Users-raul-Projects-eghiseul-ro/d91d3358-09c5-4529-974f-27cee32d5a1d/scratchpad';
const pages = require(path.join(SP, 'pages.json'));
const byRoute = new Map(pages.map((p) => [p.route.replace(/\/$/, '') || '/', p]));

const inv = require(path.join(SP, 'inventory.json'));

function norm(t) {
  return t.toLowerCase()
    .replace(/[„”“"«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function shingles(t, k = 5) {
  const w = norm(t).split(' ').filter(Boolean);
  const s = new Set();
  for (let i = 0; i + k <= w.length; i++) s.add(w.slice(i, i + k).join(' '));
  return s;
}
function jac(a, b) {
  let inter = 0;
  const small = a.size < b.size ? a : b;
  const big = a.size < b.size ? b : a;
  for (const x of small) if (big.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
function med(a) { const s = a.slice().sort((x, y) => x - y); if (!s.length) return null; const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

// sentence split (Romanian-ish)
function sentences(t) {
  return t.split(/(?<=[.!?])\s+(?=[A-ZĂÂÎȘȚ0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 5);
}

const SETS = {
  'cazier oraș (48)': inv.filter((r) => r.class === 'location: cazier oraș').map((r) => r.route),
  'CF județ (42)': inv.filter((r) => r.class === 'location: CF județ').map((r) => r.route),
  'servicii cadastrale topograf (14)': [
    '/servicii/certificat-sarcini', '/servicii/copie-carte-funciara', '/servicii/copie-plan-cadastral',
    '/servicii/copie-inventar-coordonate', '/servicii/copie-intabulare', '/servicii/copie-releveu',
    '/servicii/copie-arhiva-ocpi', '/servicii/copie-contract-vanzare', '/servicii/plan-amplasament-delimitare',
    '/servicii/copie-plan-incadrare', '/servicii/extras-cf-colectiv', '/servicii/actualizare-adresa-cf',
    '/servicii/identificare-imobile-proprietar', '/servicii/certificat-detineri-imobile',
  ],
  'articole constatator use-case (4)': [
    '/certificat-constatator-pentru-banca', '/certificat-constatator-pentru-licitatie',
    '/certificat-constatator-pentru-notar', '/certificat-constatator-pentru-fonduri-europene',
  ],
  'articole constatator tip (4)': [
    '/certificat-constatator-de-baza', '/certificat-constatator-insolventa',
    '/certificat-constatator-pfa', '/certificat-constatator-cu-istoric',
  ],
  'articole celibat (3)': [
    '/certificat-de-celibat', '/valabilitate-certificat-de-celibat',
    '/certificat-de-celibat-pentru-casatorie-in-strainatate',
  ],
  'articole certificat naștere (6)': [
    '/acte-necesare-certificat-de-nastere', '/certificat-de-nastere-pierdut',
    '/duplicat-certificat-de-nastere', '/schimbare-certificat-de-nastere-vechi',
    '/certificat-de-nastere-din-strainatate', '/certificat-de-nastere-pentru-buletin-pasaport',
  ],
  'pagini servicii stare civilă (3)': [
    '/servicii/eliberare-certificat-de-nastere', '/servicii/eliberare-certificat-de-casatorie',
    '/servicii/eliberare-certificat-de-celibat',
  ],
  'calculatoare (42)': inv.filter((r) => r.class === 'calculator/tool').map((r) => r.route),
};

const out = {};
const lines = [];
lines.push('set\tn\tmedianJaccard\tmin\tmax\tp25\tp75\tmedianWords\tshared_sentences_all\tsharedWords\tsharedPctOfMedian');
for (const [name, routes] of Object.entries(SETS)) {
  const texts = routes.map((r) => (byRoute.get(r) || {}).mainText).filter(Boolean);
  if (texts.length < 2) continue;
  const shs = texts.map((t) => shingles(t));
  const pair = [];
  for (let i = 0; i < shs.length; i++) for (let j = i + 1; j < shs.length; j++) pair.push(jac(shs[i], shs[j]));
  pair.sort((a, b) => a - b);
  const wc = texts.map((t) => norm(t).split(' ').length);

  // sentences present in ALL pages of set
  const sentSets = texts.map((t) => new Set(sentences(t).map(norm)));
  let common = [...sentSets[0]];
  for (let i = 1; i < sentSets.length; i++) common = common.filter((s) => sentSets[i].has(s));
  const sharedWords = common.reduce((a, s) => a + s.split(' ').length, 0);
  const mw = med(wc);

  out[name] = {
    n: texts.length,
    medianJaccard: +med(pair).toFixed(4),
    min: +pair[0].toFixed(4),
    max: +pair[pair.length - 1].toFixed(4),
    p25: +pair[Math.floor(pair.length * 0.25)].toFixed(4),
    p75: +pair[Math.floor(pair.length * 0.75)].toFixed(4),
    medianWords: mw,
    commonSentences: common.length,
    sharedWords,
    sharedPctOfMedian: +(100 * sharedWords / mw).toFixed(1),
    commonSample: common.slice(0, 60),
  };
  lines.push([name, texts.length, out[name].medianJaccard, out[name].min, out[name].max, out[name].p25, out[name].p75, mw, common.length, sharedWords, out[name].sharedPctOfMedian].join('\t'));
}
console.log(lines.join('\n'));
fs.writeFileSync(path.join(SP, 'similarity.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(SP, 'similarity.tsv'), lines.join('\n'));
