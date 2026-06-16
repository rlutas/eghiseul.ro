# Extras Carte Funciară

Serviciu imobiliar pentru obținerea Extrasului de Carte Funciară (CF) de la OCPI/ANCPI, 100% online.

| Câmp | Valoare |
|---|---|
| Slug DB | `extras-carte-funciara` |
| URL SEO (canonic) | `/servicii/extras-de-carte-funciara/` |
| Preț | 79.99 RON (taxe ANCPI incluse) · Extras suplimentar +49.99 RON/imobil |
| Termen | **Câteva minute (24/7)** — automatizat prin worker; max 24h dacă sistemul ANCPI e în mentenanță |
| Categorie | Imobiliare |
| Comandă | `/comanda/extras-carte-funciara` |
| Automatizare | ✅ **LIVE** (worker `worker-ancpi`) — vezi `docs/technical/specs/ancpi-automation-plan.md` |

---

## SEO

**URL canonic + redirect.** URL-ul public este hardcodat la slug-ul WP `/servicii/extras-de-carte-funciara/`
(paritate WP — acolo e tot traficul indexat, 929k impresii). Slug-ul DB `extras-carte-funciara` face
**redirect 308** către URL-ul WP (`next.config.ts`); este adăugat în `DB_SLUGS_WITH_HARDCODED_PAGE` (exclus din
sitemap-ul dinamic), iar URL-ul WP e deja în `HARDCODED_SERVICE_SLUGS`. `serviceUrl('extras-carte-funciara')`
returnează URL-ul canonic. `/comanda/*` păstrează slug-ul DB (checkout).

**Cerere latentă (GSC).** 7.630 clicks / **929.169 impresii** / poz 8.15 / CTR 0.82% — cea mai mare cerere
latentă din tot site-ul, capturare aproape zero. Cauze: competiție (ANCPI oficial + portaluri), pagina WP
grea (Elementor), intent cadastru necaptat (mergea la blog).

**Interogări țintă (impresii):**
- Comercial CF: `extras carte funciara` 98.965 · `extras de carte funciara` 98.612 · `extras cf online` 81.396 ·
  `extras carte funciara online` 46.328 · `cf online` 34.266 · `extras cf` 20.085.
- „Carte funciară" generic: `cartea funciara` 108.792 (poz 4.62) · `carte funciara online` 42.125 · `carte funciara` 22.861.
- Intent „gratuit": `extras cf online gratuit` 10.587 — adresat onest prin blocul „gratuit/oficial vs. noi".
- Valabilitate: `valabilitate extras de carte funciara` 3.854 (poz 2.23) — secțiune „cât este valabil".

**Clusterul cadastru / „număr cadastral"** (intent „găsește imobilul" → funnel): `localizare teren dupa numar cadastral`
49.159 · `harta cadastru` 23.353 · `cadastru online` 17.865 · `numar cadastral` 10.034 · `aflare numar cadastral dupa adresa`
8.777 · `numar topografic` 1.540 · `identificator imobil` 843. Pagina atacă clusterul prin secțiunea „Cum identifici imobilul"
(număr cadastral / nr CF / nr topografic / identificator electronic + căutare după adresă / proprietar).

**Status pagină hardcodată + schema.** Pagină hand-tuned `src/app/servicii/extras-de-carte-funciara/page.tsx`,
modelată pe structura PF acceptată. Schema `@graph` completă via `buildServicePageGraph` (Breadcrumb + Service +
Offer 79.99 + AggregateRating 4.9/450 + WebPage + reviewedBy). Meta via `buildPageMetadata` (canonical + OG + twitter).
`revalidate = 3600`. Iconițe lucide (`aria-hidden`). `tsc` + `eslint` 0 erori.

---

## Flux comandă

Comanda se face la `/comanda/extras-carte-funciara` (slug DB). Pagina de serviciu este informațională; CTA-urile
trimit către wizard. Extrasul CF e un document OCPI — fluxul folosește modulul de **identificare imobil** (verificat
prin `verification_config` / property module), NU KYC de companie. Câmpuri cheie:
- **Identificator imobil** — un singur identificator: număr cadastral, număr de carte funciară, număr topografic
  sau identificator electronic ANCPI. Dacă lipsește, se poate căuta după adresă / proprietar.
- **Județ + localitate** — pentru localizarea cărții funciare.
- Contact + livrare email (PDF semnat electronic OCPI, verificabil pe portalul ANCPI).

Procesare: completare identificator → confirmare județ/localitate → plată securizată (taxe ANCPI incluse) →
**emitere automată în câteva minute** (worker) → extras PDF + chitanță pe email.

**Tabs identificare (ordine):** Nr. Carte Funciară (default) → Nr. Cadastral → Adresă. CF/cadastral sunt
identificatori alternativi (oricare e suficient — `cadastral` NU e obligatoriu).

**Reguli input CF (non-blocant, `lib/ancpi/cf-format.ts`):** validează identificatorul electronic
(`12783` teren / `123456-C1-U2` apartament); avertizează la colectivă `123456-C1` (emitem pe teren `123456`),
format vechi cu `/` („CF nedigitalizat — nu se eliberează instant"), suspect. **Nu blocăm — doar avertizăm.**

**Fără KYC, fără livrare fizică, fără documente avocațiale.** Document digital → doar email PDF (pasul Livrare
e sărit). Niciun buletin scanat → partea contractantă din contractul de prestări = **datele de facturare**
(PF: nume+CNP+adresă / PJ: firmă+CUI). Fără contract de asistență juridică, fără împuternicire, fără nr. Barou.

---

## Automatizare ANCPI (worker)

✅ **LIVE & funcțional A→Z** — confirmat pe comandă reală (`E-260616-KAFEG`, imobil 100015 Odoreu/Satu Mare).
Worker-ul `worker-ancpi` (Railway, repo `github.com/rlutas/worker-ancpi`) face singur: login OpenAM → validare
imobil în e-Terra (`SearchEstate`) → coș → checkout → comandă reală ePay → poll status → descărcare PDF
(`Extras_Informare_*.pdf`) + chitanță → atașare la comandă + email. Coadă `ancpi_jobs`, API `/api/ancpi/{pending,result}`,
livrare `lib/ancpi/deliver.ts`. Admin `/admin/ancpi` (status, jurnal, Copiază log, Reîncearcă, upload manual, link ePay).
**Plan complet:** `docs/technical/specs/ancpi-automation-plan.md`.

Cazuri → operator (NEEDS_OPERATOR): imobil negăsit / CF colectivă / status≠Activă / plan cadastral / identificare.

---

## Status & rămas

✅ Pagină SEO hardcodată la slug-parity WP + schema `@graph` completă
✅ Redirect 308 slug DB → URL WP (`next.config.ts`)
✅ Exclus din sitemap dinamic (`DB_SLUGS_WITH_HARDCODED_PAGE`); URL WP în sitemap prin `HARDCODED_SERVICE_SLUGS`
✅ Conținut pe clustere: intro OCPI/ANCPI, „gratuit/oficial vs. noi", identificare imobil, use-cases, ce conține CF, valabilitate, 8 FAQ

⏳ **Articol cluster cadastru ca MDX** — migrarea `/cum-aflam-numarul-carte-functionara-si-nr-cadastral/`
(33.450 clicks, intent informațional uriaș) cu link UP către serviciul CF
⏳ Variante WP cu trafic mic: `extras-multilingv`, carte funciară colectivă (pagini separate)
⏳ Imagine OG `/og/extras-carte-funciara.png` de generat

---

## Fișiere cheie

- Pagină serviciu: `src/app/servicii/extras-de-carte-funciara/page.tsx`
- Redirect + sitemap: `next.config.ts` · `src/app/sitemap.ts`
- Constante SEO (`serviceUrl`, `DB_SLUGS_WITH_HARDCODED_PAGE`, `HARDCODED_SERVICE_SLUGS`): `src/lib/seo/constants.ts`
- Helper schema/meta: `src/lib/seo` (`buildServicePageGraph`, `buildPageMetadata`)
- Playbook SEO sursă: `docs/seo/gsc-data/SERVICE-RANKING-PLAYBOOK-2026-06-13.md` (§3)
