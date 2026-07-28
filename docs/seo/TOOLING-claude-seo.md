# Tooling SEO — claude-seo (date reale: GSC, CrUX, PageSpeed)

**Instalat:** 28.07.2026 · **Versiune:** `claude-seo v2.2.4` ([AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), MIT)

Până acum analiza SEO se făcea pe exporturi GSC descărcate manual (`docs/seo/gsc-data/`) și pe verificări în SERP. Tool-ul ăsta aduce **măsurare automată**: Search Console prin API, date de câmp CrUX (utilizatori reali, 25 de săptămâni), PageSpeed/Lighthouse, plus audituri de schema/conținut/performanță.

> Skill-urile v1 (doar prompturi) existau din 24.02.2026. v2 aduce partea care contează: **53 de scripturi Python** care cheamă API-uri reale, 25 sub-skill-uri, 18 agenți.

---

## 1. Unde e instalat

| Ce | Unde |
|---|---|
| Skill principal + scripturi | `~/.claude/skills/seo/` (`scripts/`, `bin/claude-seo`, `.venv/`) |
| Sub-skill-uri (25) | `~/.claude/skills/seo-*` |
| Agenți (18) | `~/.claude/agents/seo-*.md` |
| Backup pre-upgrade (v1) | `~/.claude/backups/claude-seo-v1-20260728-1112/` |

Nu e în repo — e tooling local, per-mașină. Documentul ăsta există ca să se poată reface setarea pe alt laptop.

## 2. ⚠️ Python — capcana #1

macOS vine cu **Python 3.9.6**, iar claude-seo cere **3.10+**. Fără fix, orice script răspunde
`Claude SEO requires Python 3.10 or newer`.

Rezolvat cu Python-ul din `uv`, indicat explicit în `~/.claude/settings.json`:

```json
"env": { "CLAUDE_SEO_PYTHON": "/Users/raul/.local/bin/python3.12" }
```

Runtime-ul propriu (venv 3.12 + Chromium pentru Playwright) se creează o singură dată:
`~/.claude/skills/seo/bin/claude-seo setup` · verificare: `... doctor` → trebuie „Runtime: ready".

## 3. Credențiale Google

Toate în `~/.config/claude-seo/`, cu `chmod 600`. **Nu ajung niciodată în repo.**

| Fișier | Ce conține |
|---|---|
| `google-api.json` | `api_key` (PageSpeed + CrUX), `service_account_path`, `default_property` |
| `gsc-service-account.json` | cheia service account-ului (conține private key) |

- **Cheia API** e restricționată la exact 2 API-uri: PageSpeed Insights + Chrome UX Report. Fără restricții pe aplicație (apelurile pleacă din CLI, nu din browser).
- **Service account:** `claude-seo@caziere.iam.gserviceaccount.com` (proiect GCP `caziere`). Ales în locul OAuth-ului de browser ca să meargă neinteractiv (viitor: cron).

Ca să funcționeze Search Console sunt necesare **două** lucruri separate — le-am nimerit pe amândouă:

1. Emailul service account-ului adăugat în **Search Console → Setări → Utilizatori și permisiuni** (permisiune Completă, pentru inspecția URL-urilor).
2. **Search Console API activat** în proiectul GCP: `console.cloud.google.com/apis/library/searchconsole.googleapis.com?project=caziere`.
   ⚠️ Dacă lipsește pasul 2, scriptul raportează înșelător *„Permission denied for property"* — deși cauza reală e API dezactivat (403 `accessNotConfigured`). Verifică cu `gsc_query.py sites`, care arată eroarea brută.

⚠️ **Proprietatea e URL-prefix, nu Domain.** `gsc_query.py sites` a arătat `https://eghiseul.ro/` (siteFullUser).
`sc-domain:eghiseul.ro` întoarce „Permission denied" chiar cu toate drepturile puse. `default_property` din
`google-api.json` e setat pe forma corectă — dacă cineva creează în viitor o proprietate Domain, trebuie schimbat acolo.

Verificare stare: `~/.claude/skills/seo/bin/claude-seo run google_auth.py --check`
→ „Credential Tier: 1 -- Authenticated" = tot ce ne trebuie (GA4 rămâne opțional, cere `ga4_property_id`).

## 4. Comenzi utile

Toate au forma `~/.claude/skills/seo/bin/claude-seo run <script> <args>`:

```bash
# Search Console — interogări, pagini, țări (16 luni disponibile)
... run gsc_query.py --days 28 --dimensions query --limit 50      # folosește default_property
... run gsc_query.py --property "https://eghiseul.ro/" --days 28 --dimensions page --limit 50
... run gsc_query.py sites                      # ce proprietăți vede contul
... run gsc_inspect.py <url>                    # indexat? canonic ales de Google? crawlat când?

# Date de câmp (utilizatori reali)
... run crux_history.py https://eghiseul.ro     # trend 25 săptămâni LCP/INP/CLS/TTFB/FCP
... run pagespeed_check.py <url>                # Lighthouse mobil + desktop, oportunități

# Fără nicio cheie
... run preload_check.py <url>                  # Speculation Rules, bfcache, preload LCP
... run content_quality.py <url>                # densitate informațională, pattern-uri AI
... run fetch_page.py <url>                     # HTML randat (SPA-safe)
```

În Claude Code se pot invoca și skill-urile: `seo-audit` (audit complet, până la 500 pagini + ~15 agenți),
`seo-google`, `seo-technical`, `seo-schema`, `seo-geo`, `seo-cluster`, `seo-sxo`.

## 5. Măsurători de referință — 28.07.2026

Primele date, ca linie de bază pentru comparații viitoare.

**CrUX, eghiseul.ro, 25 de săptămâni (11.01 → 25.07):**

| Metrică | Trend | Valori |
|---|---|---|
| LCP | îmbunătățire −5,6% | 1172 → 1106 ms |
| INP | stabil −2,5% | 141 → 138 ms |
| TTFB | **degradare +19,9%** | 222 → 266 ms |
| FCP | **degradare +8,9%** | 898 → 978 ms |
| CLS | **degradare +300%** | 0,005 → 0,02 |

Niciun prag Google depășit (toate rămân „good"; CLS bun e <0,1). Semnalul e *direcția*, nu nivelul — TTFB și FCP urcă constant de 6 luni. De re-măsurat lunar.

**Search Console, 30.06 → 25.07 (28 zile), eghiseul.ro:** 54.539 clicuri · 1.596.526 afișări · CTR 3,42%.
Striking distance (poziții 4-7, volum mare): `verificare rovinieta` (poz. 4,8 · 109.820 afișări · 4.797 clicuri),
`calculator salariu net` (4,3 · 72.781 · 917), `calculator salariu` (5,2 · 30.064 · 328),
`verificare rovinieta online` (4,7 · 16.592 · 806), `cazier judiciar online` (7,2 · 15.008 · 362).
Confirmă analiza manuală din 26.07: volumul stă pe calculatoare/rovinietă, nu pe paginile care vând.

**Lighthouse mobil, `/servicii/cazier-auto-online/`:** Performance 91 · Accessibility 96 · Best practices 100 · **SEO 100 (10/10)**.
Punct slab: **LCP 3,5 s** (scor 65%) — JS nefolosit ~450 ms/67 KiB, render-blocking ~580 ms, legacy JS 14 KiB.
`preload_check`: **50/100** — zero Speculation Rules, imaginea LCP fără `fetchpriority="high"`.
Accesibilitate: contrast insuficient + elemente cu text vizibil fără nume accesibil corespunzător.

## 6. Decizii luate la instalare

- **Hook-ul `PostToolUse` NU e activat.** Repo-ul are un hook care validează JSON-LD după fiecare Edit/Write și poate **bloca** editarea (exit 2). Se activează doar la instalarea ca plugin; noi am instalat manual tocmai ca să-l evităm — ar rula în toate proiectele, nu doar pe pagini cu schema.
- **Extensiile pe API-uri plătite** (`seo-ahrefs`, `seo-dataforseo`, `seo-firecrawl`, `seo-profound`, `seo-seranking`, `seo-image-gen`) sunt instalate dar inerte, fără chei. `seo-bing` și `seo-unlighthouse` sunt gratuite.
- **Skill-ul `seo-audit` din pachetul de marketing a fost suprascris** de versiunea claude-seo (mai puternică). Originalul e în backup dacă e nevoie.

## 7. De reținut

- Datele CrUX sunt agregate pe 28 de zile și au nevoie de trafic suficient — paginile mici pot să nu apară deloc.
- PageSpeed API are cotă gratuită; audituri pe zeci de pagini se fac mai bine cu `seo-unlighthouse` (Lighthouse local, fără cotă).
- Rapoartele PDF/Excel (`google_report.py`) cer WeasyPrint, care poate avea nevoie de librării de sistem (pango/cairo).

## 8. Legături

- Analiza manuală curentă pe GSC: [`2026-07-26-analiza-organic-servicii.md`](2026-07-26-analiza-organic-servicii.md)
- Exporturi GSC (istoricul manual): [`gsc-data/`](gsc-data/)
- Workflow per-pagină SEO: `docs/seo/README.md`
