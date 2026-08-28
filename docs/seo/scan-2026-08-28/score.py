#!/usr/bin/env python3
"""AI-pattern scorer for eghiseul.ro pages (RO lexicon), reconstructed from the
24.08 methodology: counts promo/hedging/filler/false-range patterns per 1,000
words of main content. Relative ranking is what matters."""
import re, sys, json, html, urllib.request, concurrent.futures as cf

PATTERNS = {
    'promo': [
        r'\besen[țt]ial', r'\bcrucial', r'\bvital', r'\bindispensabil',
        r'rol important', r'deosebit de important', r'extrem de important',
        r'joac[ăa] un rol', r'reprezint[ăa] (un|o|prima|cea)', r'\bcheia\b',
        r'solu[țt]ia ideal[ăa]', r'\bperfect[ăa]? pentru', r'\bf[ăa]r[ăa] b[ăa]t[ăa]i de cap',
    ],
    'hedging': [
        r'este important (s[ăa]|de|ca)', r'trebuie (men[țt]ionat|precizat|re[țt]inut)',
        r'de re[țt]inut (este|c[ăa])', r'nu uita[țt]?i? (c[ăa]|s[ăa])',
        r'merit[ăa] (men[țt]ionat|precizat|amintit)', r'v[ăa] recomand[ăa]m',
        r'[îi]n general,', r'de regul[ăa],', r'[îi]n principiu,',
    ],
    'false_range': [
        r'de la \S+ p[âa]n[ăa] la', r'fie c[ăa] .{3,40} fie c[ăa]',
        r'indiferent (dac[ăa]|de)', r'at[âa]t .{3,40} c[âa]t [șs]i',
    ],
    'filler': [
        r'[îi]n concluzie', r'\bconcluzi[ei]\b', r'a[șs]adar,', r'cu alte cuvinte',
        r'pe scurt,', r'[îi]n esen[țt][ăa]', r'nu [îi]n ultimul r[âa]nd',
        r'[îi]n zilele noastre', r'[îi]n era digital[ăa]', r'proces (simplu|rapid) [șs]i',
    ],
    'struct': [
        r'<strong>[^<:]{2,40}:</strong>',   # liste cu **Termen:**
        r'—',                                # em-dash density
    ],
}
COMPILED = {k: [re.compile(p, re.I) for p in v] for k, v in PATTERNS.items()}
TAG = re.compile(r'<(script|style|nav|header|footer|svg)[^>]*>.*?</\1>', re.S | re.I)
MAIN = re.compile(r'<main[^>]*>(.*?)</main>', re.S | re.I)

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (audit-intern)'})
        return url, urllib.request.urlopen(req, timeout=20).read().decode('utf-8', 'replace')
    except Exception as e:
        return url, None

def score(html_src):
    # Next.js emits a loading-shell <main> before the real one — take the
    # longest <main> block; fall back to the whole document.
    mains = MAIN.findall(html_src)
    body = max(mains, key=len) if mains else html_src
    body = TAG.sub(' ', body)
    counts = {}
    total = 0
    for cat, pats in COMPILED.items():
        n = sum(len(p.findall(body)) for p in pats)
        counts[cat] = n
        total += n
    text = html.unescape(re.sub(r'<[^>]+>', ' ', body))
    words = len(re.findall(r'\w+', text))
    per1k = (total / words * 1000) if words else 0
    return round(per1k, 1), words, counts

urls = [u.strip() for u in open(sys.argv[1]) if u.strip()]
rows = []
with cf.ThreadPoolExecutor(max_workers=10) as ex:
    for url, src in ex.map(fetch, urls):
        if not src:
            rows.append((None, 0, url, {}))
            continue
        s, w, c = score(src)
        rows.append((s, w, url, c))

rows.sort(key=lambda r: (r[0] is None, -(r[0] or 0)))
print(f"{'scor/1k':>8} {'cuvinte':>8}  url")
for s, w, url, c in rows:
    path = url.replace('https://eghiseul.ro', '') or '/'
    if s is None:
        print(f"{'FETCH-ERR':>8} {'':>8}  {path}")
    else:
        print(f"{s:>8} {w:>8}  {path}")
