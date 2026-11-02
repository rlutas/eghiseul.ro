#!/usr/bin/env python3
"""Monitorizare SEO lunara: eghiseul.ro, documentero.ro, cazierjudiciaronline.com, ecazier.ro.

Trage din Google Search Console (API, cont de serviciu, doar citire) ultimele 28 de
zile fata de cele 28 de dinainte si scrie:

    docs/seo/monitorizare/YYYY-MM.md   raport in romana (ce a urcat / coborat, top 10)
    docs/seo/monitorizare/YYYY-MM.csv  aceleasi cifre, format lung

Pozitiile concurentilor NU vin din GSC si nu le scoatem automat din Google
(ToS + detectie de boti): raportul are o lista de verificat de mana, cu URL-uri
`&pws=0&gl=ro&hl=ro`, plus linkul Ads Transparency pentru infocazier.

Rulare (din radacina repo-ului):

    ~/.claude/skills/seo/.venv/bin/python -I scripts/seo/monitor-lunar.py

Optiuni: --month 2026-11 (eticheta fisierului), --end-date YYYY-MM-DD (implicit
azi minus 3 zile, intarzierea GSC), --force (suprascrie un raport existent;
implicit refuza, ca sa nu pierzi ce ai completat de mana), --out-dir.

Credentiale: fisierul contului de serviciu din ~/.config/claude-seo/ (sau
variabila de mediu GSC_SERVICE_ACCOUNT). Scriptul nu afiseaza si nu copiaza
continutul lui.

Metodologia si pragurile de actiune: docs/seo/monitorizare/README.md.
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import time
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import quote_plus

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:  # pragma: no cover
    sys.exit(
        "Lipsesc google-api-python-client / google-auth. Ruleaza cu venv-ul skill-ului seo:\n"
        "  ~/.claude/skills/seo/.venv/bin/python -I scripts/seo/monitor-lunar.py"
    )

# --------------------------------------------------------------------------- config

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
DEFAULT_SA = "~/.config/claude-seo/gsc-service-account.json"
GSC_LAG_DAYS = 3
WINDOW = 28

SITES = [
    # (cheie scurta, nume afisat, proprietate GSC, origine pentru paginile cheie)
    ("eghiseul", "eghiseul.ro", "https://eghiseul.ro/", "https://eghiseul.ro"),
    ("documentero", "documentero.ro", "sc-domain:documentero.ro", "https://documentero.ro"),
    ("cjo", "cazierjudiciaronline.com", "sc-domain:cazierjudiciaronline.com", "https://cazierjudiciaronline.com"),
    ("ecazier", "ecazier.ro", "sc-domain:ecazier.ro", "https://ecazier.ro"),
]

# Interogari urmarite. Potrivirea e exacta pe toata interogarea, dar tolereaza
# diacriticele (ă/â/î/ș/ț) si un „de" lipsa ("certificat nastere pierdut").
TRACKED_QUERIES = [
    "cazier judiciar online",
    "cazier judiciar",
    "certificat de nastere online",
    "certificat de nastere online pret",
    "duplicat certificat de nastere",
    "duplicat certificat de nastere online",
    "certificat de nastere pierdut",
    "certificat de casatorie duplicat",
    "duplicat certificat de casatorie online",
    "extras de carte funciara",
    "certificat constatator",
    "cazier fiscal",
    # orase mari (CJO are pagini pe ele)
    "cazier judiciar bucuresti",
    "cazier judiciar cluj",
    "cazier judiciar iasi",
    "cazier judiciar timisoara",
    "cazier judiciar constanta",
    "cazier judiciar brasov",
    "cazier judiciar craiova",
    # comunele din analiza infocazier (02.11.2026, §1.4): supravietuiesc paginile lor?
    "cazier judiciar zlatna",
    "cazier judiciar albac",
    "cazier judiciar campeni",
]

# Clustere: orice interogare care CONTINE fragmentul (regex RE2, fara diacritice-sensibil).
CLUSTERS = [
    ("cazier (toate)", "cazier"),
    ("nastere (toate)", "nastere"),
    ("casatorie (toate)", "casatorie"),
    ("carte funciara (toate)", "carte funciara"),
    ("constatator (toate)", "constatator"),
]

KEY_PAGES = {
    "eghiseul": [
        "/",
        "/servicii/cazier-judiciar-online/",
        "/servicii/eliberare-certificat-de-nastere/",
        "/servicii/eliberare-certificat-de-casatorie/",
        "/servicii/eliberare-certificat-de-celibat/",
        "/servicii/extras-multilingv-certificat-nastere/",
        "/servicii/extras-de-carte-funciara/",
        "/servicii/certificat-constatator-online/",
        "/servicii/cazier-fiscal-online/",
        "/servicii/cazier-auto-online/",
    ],
    "documentero": [
        "/",
        "/certificat-de-nastere/",
        "/certificat-de-casatorie/",
        "/certificat-de-celibat/",
        "/extras-multilingv/",
        "/ghiduri/certificat-de-nastere-pierdut/",
        "/ghiduri/acte-necesare-duplicat-certificat-de-nastere/",
        "/ghiduri/certificat-de-nastere-vechi-tipizat/",
    ],
    "cjo": [
        "/",
        "/eliberare-cazier-judiciar-online",
        "/cazier-auto-online",
        "/cerere-cazier-judiciar-model",
        "/cazier-judiciar-online/iasi",
        "/cazier-judiciar-online/cluj",
        "/cazier-judiciar-online/timisoara",
        "/cazier-judiciar-online/brasov",
        "/cazier-judiciar-online/constanta",
        "/cazier-judiciar-online/craiova",
    ],
    "ecazier": [
        "/",
        "/cazier-auto",
        "/cazier-fiscal",
        "/cazier-auto-uber-bolt",
        "/ghid-alegere-tip-cazier",
    ],
}

INFOCAZIER_ADVERTISER = "AR04106916843048927233"
COMPETITOR_COLUMNS = ["infocazier", "eghiseul", "CJO", "documentero", "ecazier"]

# Praguri de semnalare (aceleasi ca in README).
MIN_IMPR_FOR_FLAG = 100       # sub atat, zgomot
POS_DROP_FLAG = 3.0           # pozitie mai slaba cu >= 3 locuri
CLICK_DROP_PCT_FLAG = 30.0    # clicuri -30% ...
CLICK_DROP_ABS_FLAG = 20      # ... si cel putin 20 de clicuri pierdute
SITE_DROP_PCT_FLAG = 20.0     # total site -20% clicuri
TOP_N = 10
TOP_MIN_IMPR = 50             # interogari/pagini in top-10 doar cu >= 50 afisari intr-o perioada

# --------------------------------------------------------------------------- helpers

_DIACR = {"a": "[aăâ]", "i": "[iî]", "s": "[sșş]", "t": "[tțţ]"}


def fuzzy(text: str) -> str:
    """Regex RE2 care tolereaza diacriticele si spatiile multiple."""
    out = []
    for ch in text.lower():
        if ch in _DIACR:
            out.append(_DIACR[ch])
        elif ch == " ":
            out.append(r"\s+")
        else:
            out.append(re.escape(ch))
    return "".join(out)


def exact_query_regex(q: str) -> str:
    words = q.split()
    parts = []
    for i, w in enumerate(words):
        if w == "de" and 0 < i < len(words) - 1:
            parts.append(r"(de\s+)?")
            continue
        parts.append(fuzzy(w) + (r"\s+" if i < len(words) - 1 else ""))
    return "^" + "".join(parts) + "$"


def pct(cur: float, prev: float) -> float | None:
    if prev == 0:
        return None
    return (cur - prev) / prev * 100.0


def fmt_int(n: float) -> str:
    return f"{int(round(n)):,}".replace(",", ".")


def fmt_pos(p: float | None) -> str:
    return "—" if p is None else f"{p:.1f}".replace(".", ",")


def fmt_delta_int(cur: float, prev: float) -> str:
    d = int(round(cur - prev))
    p = pct(cur, prev)
    sign = "+" if d > 0 else ""
    ps = "" if p is None else f" ({'+' if p > 0 else ''}{p:.0f}%)"
    return f"{sign}{fmt_int(d) if d >= 0 else '-' + fmt_int(-d)}{ps}"


def fmt_delta_pos(cur: float | None, prev: float | None) -> str:
    """Pozitia: numar mai mic = mai bine. Afisam cate locuri a urcat (+) sau a coborat (-)."""
    if cur is None or prev is None:
        return "—"
    gain = prev - cur
    if abs(gain) < 0.05:
        return "0"
    s = f"{abs(gain):.1f}".replace(".", ",")
    return f"urcat {s}" if gain > 0 else f"coborât {s}"


class Metrics:
    __slots__ = ("clicks", "impressions", "position")

    def __init__(self, clicks=0.0, impressions=0.0, position=None):
        self.clicks = clicks
        self.impressions = impressions
        self.position = position

    @classmethod
    def from_row(cls, row: dict | None) -> "Metrics":
        if not row:
            return cls()
        impr = row.get("impressions", 0.0)
        return cls(row.get("clicks", 0.0), impr, row.get("position") if impr else None)


# --------------------------------------------------------------------------- GSC

class GSC:
    def __init__(self, sa_path: str):
        path = os.path.expanduser(sa_path)
        if not os.path.isfile(path):
            sys.exit(
                "Nu gasesc fisierul contului de serviciu (vezi ~/.config/claude-seo/ "
                "sau variabila GSC_SERVICE_ACCOUNT)."
            )
        creds = service_account.Credentials.from_service_account_file(path, scopes=SCOPES)
        self.svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
        self.calls = 0

    def query(self, site: str, start: date, end: date, dimensions=None, filters=None,
              row_limit=25000) -> list[dict]:
        body = {
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "dimensions": dimensions or [],
            "rowLimit": row_limit,
            "dataState": "final",
        }
        if filters:
            body["dimensionFilterGroups"] = [{"filters": filters}]
        rows: list[dict] = []
        start_row = 0
        while True:
            body["startRow"] = start_row
            for attempt in range(4):
                try:
                    self.calls += 1
                    resp = self.svc.searchanalytics().query(siteUrl=site, body=body).execute()
                    break
                except HttpError as e:  # quota / 5xx: retry with backoff
                    status = getattr(e.resp, "status", 0)
                    if status in (429, 500, 503) and attempt < 3:
                        time.sleep(2 ** attempt * 2)
                        continue
                    raise
            batch = resp.get("rows", [])
            rows.extend(batch)
            if not dimensions or len(batch) < row_limit:
                return rows
            start_row += row_limit

    def total(self, site, start, end, filters=None) -> Metrics:
        rows = self.query(site, start, end, dimensions=[], filters=filters)
        return Metrics.from_row(rows[0] if rows else None)

    def by_dim(self, site, start, end, dim: str) -> dict[str, Metrics]:
        return {r["keys"][0]: Metrics.from_row(r) for r in self.query(site, start, end, [dim])}


# --------------------------------------------------------------------------- collect

def collect(gsc: GSC, cur: tuple[date, date], prev: tuple[date, date]) -> list[dict]:
    """Returneaza randuri in format lung (o linie per sectiune/site/cheie)."""
    out: list[dict] = []

    def add(section, site_key, key, mc: Metrics, mp: Metrics, url=""):
        out.append({
            "section": section, "site": site_key, "key": key, "url": url,
            "clicks_cur": round(mc.clicks), "clicks_prev": round(mp.clicks),
            "impr_cur": round(mc.impressions), "impr_prev": round(mp.impressions),
            "pos_cur": None if mc.position is None else round(mc.position, 2),
            "pos_prev": None if mp.position is None else round(mp.position, 2),
        })

    for key, name, prop, origin in SITES:
        print(f"  {name}: total, interogari, pagini...", file=sys.stderr)
        add("site_total", key, name, gsc.total(prop, *cur), gsc.total(prop, *prev))
        # zile cu date in fiecare perioada (proprietati adaugate recent au istoric scurt)
        out[-1]["days_cur"] = len(gsc.query(prop, *cur, dimensions=["date"]))
        out[-1]["days_prev"] = len(gsc.query(prop, *prev, dimensions=["date"]))

        for q in TRACKED_QUERIES:
            f = [{"dimension": "query", "operator": "includingRegex",
                  "expression": exact_query_regex(q)}]
            add("tracked_query", key, q, gsc.total(prop, *cur, filters=f),
                gsc.total(prop, *prev, filters=f))

        for label, frag in CLUSTERS:
            f = [{"dimension": "query", "operator": "includingRegex", "expression": fuzzy(frag)}]
            add("cluster", key, label, gsc.total(prop, *cur, filters=f),
                gsc.total(prop, *prev, filters=f))

        pages_cur = gsc.by_dim(prop, *cur, "page")
        pages_prev = gsc.by_dim(prop, *prev, "page")
        for path in KEY_PAGES[key]:
            url = origin + path
            add("key_page", key, path, pages_cur.get(url, Metrics()),
                pages_prev.get(url, Metrics()), url)
        for url in set(pages_cur) | set(pages_prev):
            mc, mp = pages_cur.get(url, Metrics()), pages_prev.get(url, Metrics())
            if max(mc.impressions, mp.impressions) >= TOP_MIN_IMPR:
                add("page", key, url.replace(origin, "") or "/", mc, mp, url)

        q_cur = gsc.by_dim(prop, *cur, "query")
        q_prev = gsc.by_dim(prop, *prev, "query")
        for q in set(q_cur) | set(q_prev):
            mc, mp = q_cur.get(q, Metrics()), q_prev.get(q, Metrics())
            if max(mc.impressions, mp.impressions) >= TOP_MIN_IMPR:
                add("query", key, q, mc, mp)
    return out


# --------------------------------------------------------------------------- flags

def flags_for(r: dict) -> list[str]:
    f = []
    impr = max(r["impr_cur"], r["impr_prev"])
    if impr < MIN_IMPR_FOR_FLAG and r["section"] != "site_total":
        return f
    if r["pos_cur"] is not None and r["pos_prev"] is not None \
            and r["pos_cur"] - r["pos_prev"] >= POS_DROP_FLAG:
        f.append(f"poziție −{r['pos_cur'] - r['pos_prev']:.1f}".replace(".", ","))
    lost = r["clicks_prev"] - r["clicks_cur"]
    p = pct(r["clicks_cur"], r["clicks_prev"])
    limit = SITE_DROP_PCT_FLAG if r["section"] == "site_total" else CLICK_DROP_PCT_FLAG
    if p is not None and -p >= limit and (r["section"] == "site_total" or lost >= CLICK_DROP_ABS_FLAG):
        f.append(f"clicuri {p:.0f}%")
    if r["impr_prev"] >= MIN_IMPR_FOR_FLAG and r["impr_cur"] == 0:
        f.append("dispărută")
    return f


# --------------------------------------------------------------------------- report

SITE_NAME = {k: n for k, n, _, _ in SITES}


def row_line(r: dict, label: str) -> str:
    fl = flags_for(r)
    return (f"| {label} | {fmt_int(r['clicks_cur'])} | {fmt_delta_int(r['clicks_cur'], r['clicks_prev'])} "
            f"| {fmt_int(r['impr_cur'])} | {fmt_delta_int(r['impr_cur'], r['impr_prev'])} "
            f"| {fmt_pos(r['pos_cur'])} | {fmt_delta_pos(r['pos_cur'], r['pos_prev'])} "
            f"| {'**' + '; '.join(fl) + '**' if fl else ''} |")


TABLE_HEAD = ("| {k} | Clicuri | Δ clicuri | Afișări | Δ afișări | Poziție | Δ poziție | Semnal |\n"
              "|---|---:|---:|---:|---:|---:|---:|---|")


def serp_url(q: str) -> str:
    return f"https://www.google.com/search?q={quote_plus(q)}&pws=0&gl=ro&hl=ro&num=20"


def render(rows: list[dict], month: str, cur, prev, generated: date) -> str:
    by = lambda sec: [r for r in rows if r["section"] == sec]
    L: list[str] = []
    L.append(f"# Monitorizare SEO {month} — eghiseul, documentero, CJO, ecazier")
    L.append("")
    L.append(f"Generat {generated.strftime('%d.%m.%Y')} cu `scripts/seo/monitor-lunar.py`. "
             f"Perioada curentă: **{cur[0].strftime('%d.%m')}–{cur[1].strftime('%d.%m.%Y')}** (28 de zile), "
             f"comparată cu **{prev[0].strftime('%d.%m')}–{prev[1].strftime('%d.%m.%Y')}**. "
             "Sursa: Google Search Console (API). Poziția = medie ponderată cu afișările; "
             "„urcat” = mai sus în Google. Cum se citește și când acționăm: [README](README.md).")
    L.append("")

    # ---- pe scurt
    L.append("## Pe scurt")
    L.append("")
    def vs(c, p):
        q = pct(c, p)
        return f"față de {fmt_int(p)}" + ("" if q is None else f", {'+' if q > 0 else ''}{q:.0f}%")

    partial = []
    for r in by("site_total"):
        fl = flags_for(r)
        L.append(f"- **{SITE_NAME[r['site']]}**: {fmt_int(r['clicks_cur'])} clicuri "
                 f"({vs(r['clicks_cur'], r['clicks_prev'])}), "
                 f"{fmt_int(r['impr_cur'])} afișări ({vs(r['impr_cur'], r['impr_prev'])}), "
                 f"poziție medie {fmt_pos(r['pos_cur'])} ({fmt_delta_pos(r['pos_cur'], r['pos_prev'])})"
                 + (f" — **{'; '.join(fl)}**" if fl else "") + ".")
        if r.get("days_prev", WINDOW) < WINDOW or r.get("days_cur", WINDOW) < WINDOW:
            dc, dp = max(r.get("days_cur") or 1, 1), max(r.get("days_prev") or 1, 1)
            pc_, pp_ = r["clicks_cur"] / dc, r["clicks_prev"] / dp
            q = pct(pc_, pp_)
            partial.append(f"{SITE_NAME[r['site']]}: perioada anterioară are doar {r.get('days_prev')} zile cu date "
                           f"(curenta {r.get('days_cur')}); **pe zi: {pc_:.0f} clicuri față de {pp_:.0f}"
                           + ("" if q is None else f", {'+' if q > 0 else ''}{q:.0f}%") + "**")
    if partial:
        L.append("- **Atenție, comparație incompletă:** " + "; ".join(partial)
                 + ". Proprietatea are istoric scurt în GSC, deci totalul pe 28 de zile "
                 "nu se compară direct; cifra pe zi e cea corectă.")
    flagged = [r for r in rows if r["section"] in ("tracked_query", "cluster", "key_page") and flags_for(r)]
    L.append(f"- Semnale pe interogări urmărite, clustere și pagini-cheie: **{len(flagged)}**"
             + (" (lista mai jos, secțiunea „Semnale”)." if flagged else "."))
    L.append("")

    # ---- semnale
    L.append("## Semnale (pragurile din README)")
    L.append("")
    if partial:
        L.append("Pe site-urile cu comparație incompletă (vezi mai sus), diferențele de clicuri și afișări "
                 "nu sunt pe perioade egale; pozițiile se compară corect.")
        L.append("")
    if not flagged:
        L.append("Nimic peste prag luna aceasta.")
    else:
        L.append("| Site | Ce | Clicuri | Afișări | Poziție | Semnal |")
        L.append("|---|---|---:|---:|---:|---|")
        for r in flagged:
            L.append(f"| {SITE_NAME[r['site']]} | {r['key']} | "
                     f"{fmt_int(r['clicks_prev'])} → {fmt_int(r['clicks_cur'])} | "
                     f"{fmt_int(r['impr_prev'])} → {fmt_int(r['impr_cur'])} | "
                     f"{fmt_pos(r['pos_prev'])} → {fmt_pos(r['pos_cur'])} | {'; '.join(flags_for(r))} |")
    L.append("")

    # ---- top 10
    def top(section: str, title: str):
        cand = [r for r in by(section) if r["clicks_cur"] != r["clicks_prev"]]
        cand.sort(key=lambda r: abs(r["clicks_cur"] - r["clicks_prev"]), reverse=True)
        L.append(f"### {title}")
        L.append("")
        L.append("| | Site | " + ("Interogare" if section == "query" else "Pagina")
                 + " | Clicuri | Afișări | Poziție |")
        L.append("|---|---|---|---:|---:|---:|")
        for r in cand[:TOP_N]:
            arrow = "▲" if r["clicks_cur"] > r["clicks_prev"] else "▼"
            L.append(f"| {arrow} | {SITE_NAME[r['site']]} | {r['key']} | "
                     f"{fmt_int(r['clicks_prev'])} → {fmt_int(r['clicks_cur'])} | "
                     f"{fmt_int(r['impr_prev'])} → {fmt_int(r['impr_cur'])} | "
                     f"{fmt_pos(r['pos_prev'])} → {fmt_pos(r['pos_cur'])} |")
        L.append("")

    L.append("## Top 10 schimbări (după diferența de clicuri, toate cele 4 site-uri)")
    L.append("")
    L.append(f"Doar interogări/pagini cu cel puțin {TOP_MIN_IMPR} de afișări într-una din perioade. "
             "▲ = mai multe clicuri, ▼ = mai puține.")
    L.append("")
    top("query", "Interogări")
    top("page", "Pagini")

    L.append("### Pe fiecare site: top 5 pagini")
    L.append("")
    L.append("Clasamentul de mai sus e dominat de site-ul cu cel mai mult trafic; aici fiecare site separat.")
    L.append("")
    for key, name, _, _ in SITES:
        cand = [r for r in by("page") if r["site"] == key and r["clicks_cur"] != r["clicks_prev"]]
        cand.sort(key=lambda r: abs(r["clicks_cur"] - r["clicks_prev"]), reverse=True)
        if not cand:
            continue
        L.append(f"**{name}:** " + "; ".join(
            f"{'▲' if r['clicks_cur'] > r['clicks_prev'] else '▼'} `{r['key']}` "
            f"{fmt_int(r['clicks_prev'])} → {fmt_int(r['clicks_cur'])}" for r in cand[:5]) + ".")
        L.append("")

    # ---- tracked queries
    L.append("## Interogările urmărite")
    L.append("")
    L.append("Potrivire exactă pe interogare (cu sau fără diacritice, cu sau fără „de”). "
             "Un site lipsește din tabel dacă n-a avut nicio afișare în ambele perioade.")
    L.append("")
    seen = {r["key"] for r in by("tracked_query") if r["impr_cur"] or r["impr_prev"]}
    missing = [q for q in TRACKED_QUERIES if q not in seen]
    if missing:
        L.append("Fără nicio afișare pe niciun site, în ambele perioade: "
                 + ", ".join(f"„{q}”" for q in missing) + ". Pe acestea urmărim doar SERP-ul (secțiunea Concurenți).")
        L.append("")
    for key, name, _, _ in SITES:
        rs = [r for r in by("tracked_query") if r["site"] == key and (r["impr_cur"] or r["impr_prev"])]
        L.append(f"### {name}")
        L.append("")
        if not rs:
            L.append("Nicio afișare pe interogările urmărite.")
            L.append("")
            continue
        L.append(TABLE_HEAD.format(k="Interogare"))
        for r in rs:
            L.append(row_line(r, r["key"]))
        L.append("")

    # ---- clusters
    L.append("## Clustere (toate interogările care conțin cuvântul)")
    L.append("")
    L.append("| Site | Cluster | Clicuri | Δ clicuri | Afișări | Δ afișări | Poziție | Δ poziție | Semnal |")
    L.append("|---|---|---:|---:|---:|---:|---:|---:|---|")
    for r in by("cluster"):
        if r["impr_cur"] or r["impr_prev"]:
            L.append(f"| {SITE_NAME[r['site']]} " + row_line(r, r["key"]))
    L.append("")

    # ---- key pages
    L.append("## Pagini-cheie")
    L.append("")
    for key, name, _, _ in SITES:
        L.append(f"### {name}")
        L.append("")
        L.append(TABLE_HEAD.format(k="Pagina"))
        for r in by("key_page"):
            if r["site"] == key:
                L.append(row_line(r, f"`{r['key']}`"))
        L.append("")

    # ---- competitors (manual)
    L.append("## Concurenți: de completat de mână")
    L.append("")
    L.append("GSC nu dă pozițiile altor site-uri, iar SERP-ul Google nu îl scoatem automat "
             "(termenii Google interzic scraping-ul). Deschide fiecare link într-o fereastră "
             "privată, fără cont Google logat, și trece poziția organică (1–20, „—” dacă nu apare) "
             "și cine are reclamă. Linkurile au deja `pws=0&gl=ro&hl=ro`.")
    L.append("")
    L.append("| Interogare | " + " | ".join(COMPETITOR_COLUMNS) + " | Reclame (cine) |")
    L.append("|---|" + "---|" * (len(COMPETITOR_COLUMNS) + 1))
    for q in TRACKED_QUERIES:
        L.append(f"| [{q}]({serp_url(q)}) | " + " | ".join(" " for _ in COMPETITOR_COLUMNS) + " |   |")
    L.append("")
    L.append("**Reclamele infocazier** (advertiser „Cabinet Avocat Grosu Alexandru”):")
    L.append("")
    L.append(f"- [ ] [Ads Transparency — advertiser](https://adstransparency.google.com/advertiser/"
             f"{INFOCAZIER_ADVERTISER}?region=RO): mai rulează? data „Ultima afișare” a celui mai nou "
             "anunț: ____ ; număr de anunțuri: ____")
    L.append("- [ ] [Ads Transparency — după domeniu](https://adstransparency.google.com/"
             "?region=RO&domain=infocazier.ro): apare alt advertiser pe domeniu? ____")
    L.append("- [ ] Au început reclame pe naștere/căsătorie (până la 02.11.2026: niciuna)? ____")
    L.append("")
    L.append("Dacă infocazier nu mai rulează reclame, ipoteza „cabinetul vinde” din "
             "`docs/seo/2026-11-02-audit-4-site-uri/` trebuie revăzută. Dacă paginile lor de comună "
             "(Zlatna, Albac, Câmpeni) ies din top 10, Google a început să le trateze ca doorway.")
    L.append("")
    return "\n".join(L)


CSV_FIELDS = ["section", "site", "key", "url", "clicks_cur", "clicks_prev", "impr_cur", "impr_prev",
              "pos_cur", "pos_prev", "days_cur", "days_prev", "period_cur", "period_prev"]


def write_csv(path: Path, rows: list[dict], cur, prev):
    pc = f"{cur[0].isoformat()}..{cur[1].isoformat()}"
    pp = f"{prev[0].isoformat()}..{prev[1].isoformat()}"
    order = {"site_total": 0, "tracked_query": 1, "cluster": 2, "key_page": 3, "query": 4, "page": 5}
    with path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=CSV_FIELDS)
        w.writeheader()
        for r in sorted(rows, key=lambda r: (order[r["section"]], r["site"], -r["clicks_cur"], r["key"])):
            w.writerow({"days_cur": "", "days_prev": "", **r, "period_cur": pc, "period_prev": pp})


# --------------------------------------------------------------------------- main

def main():
    repo = Path(__file__).resolve().parents[2]
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--month", help="eticheta raportului, YYYY-MM (implicit luna de azi)")
    ap.add_argument("--end-date", help="ultima zi inclusa, YYYY-MM-DD (implicit azi - 3 zile)")
    ap.add_argument("--out-dir", default=str(repo / "docs" / "seo" / "monitorizare"))
    ap.add_argument("--force", action="store_true", help="suprascrie raportul existent")
    a = ap.parse_args()

    today = date.today()
    month = a.month or today.strftime("%Y-%m")
    if not re.fullmatch(r"\d{4}-\d{2}", month):
        sys.exit("--month trebuie sa fie YYYY-MM")
    end = date.fromisoformat(a.end_date) if a.end_date else today - timedelta(days=GSC_LAG_DAYS)
    cur = (end - timedelta(days=WINDOW - 1), end)
    prev = (cur[0] - timedelta(days=WINDOW), cur[0] - timedelta(days=1))

    out_dir = Path(a.out_dir)
    md_path, csv_path = out_dir / f"{month}.md", out_dir / f"{month}.csv"
    if md_path.exists() and not a.force:
        sys.exit(f"{md_path} exista deja (poate are completari de mana). Foloseste --force ca sa-l suprascrii.")

    gsc = GSC(os.environ.get("GSC_SERVICE_ACCOUNT", DEFAULT_SA))
    print(f"GSC {cur[0]}..{cur[1]} vs {prev[0]}..{prev[1]}", file=sys.stderr)
    rows = collect(gsc, cur, prev)

    out_dir.mkdir(parents=True, exist_ok=True)
    md_path.write_text(render(rows, month, cur, prev, today), encoding="utf-8")
    write_csv(csv_path, rows, cur, prev)
    print(f"Scris: {md_path}\nScris: {csv_path}\n({gsc.calls} apeluri GSC)", file=sys.stderr)


if __name__ == "__main__":
    main()
