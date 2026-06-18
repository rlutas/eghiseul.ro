# Sesiune 2026-06-18 — Identificare imobil ANCPI + alinieri cazier PF/PJ + ghid SEO AI

Rezumat al lucrărilor din această sesiune, pe 3 fronturi + 3 ramuri.

---

## 1. Identificare imobil ANCPI (ramura `fix/ancpi-locality-validation`, PR #4)

Endpoint: `src/app/api/ancpi/lookup/route.ts` (geocode Esri → query spațial pe geoportalul ANCPI). Unealtă: `/admin/identifica-imobil`; panou nou în comandă: `src/components/admin/IdentificareImobilPanel.tsx`.

**Fixuri & îmbunătățiri (testate live pe adrese reale):**
- **Validare localitate (anti-fals-pozitiv):** Esri potrivea aceeași stradă în altă localitate (ex. „Strada Pârâului 100, Agăș" → Târgu Ocna) și ANCPI întorcea o parcelă reală dar GREȘITĂ. Acum cerem `maxLocations=5` + `City/Subregion/Region` și acceptăm doar candidatul a cărui localitate se potrivește pe **tokeni distinctivi** (diacritice normalizate; ignorăm „sectorul/comuna/nr" + numere → „București Sectorul 6" rămâne valid). La nepotrivire: `reason='locality_mismatch'`.
- **Retry ANCPI 6 → 10** (geoportalul dă 502 în valuri; testele au cerut 7-8 încercări).
- **Link Google Maps satelit:** convertim punctul Stereo70 (EPSG:3844) → WGS84 cu `proj4` (dep nouă, verificat <1m vs Esri) și afișăm „🛰️ vezi pe Google Maps (satelit)" direct la punct.
- **Deep-link geoportal:** pagina ANCPI `imobile_lookup.html` acceptă `?immovableid=` → link „vezi parcela în geoportal ANCPI" (în loc de pagina goală). Înlocuiește vechiul link confuz.
- **Încredere prin point-in-polygon:** query cu `returnGeometry=true`; calculăm local dacă punctul e ÎN parcelă (`contains`) sau doar prins prin buffer (`viaBufferOnly` = posibil vecinul).

**Wizard client — 2 metode** (`PropertyDataStep`, doar `identificare-imobil`):
- „📍 După adresă" (adresă obligatorie + nume opțional) → admin rulează lookup-ul on-demand.
- „👤 După nume" (nume obligatoriu + CNP/CUI opțional) → procesare manuală.
- Metoda în `customer_data.property.searchMethod` (JSONB, fără migrare).

**Descoperire importantă (caz real Salcâmilor 21, Odoreu):** geocoderul (și Esri ȘI Google dau același punct, la ~1,5m) plasează imobilul rural lângă casa reală, iar bufferul prinde **vecinul** (nr. 17 = CF 108663), nu nr. 21 (CF 100015 din extrasul oficial). Concluzie: **numărul din geoportal e un INDICIU, nu CF-ul oficial garantat** — operatorul confirmă vizual (Maps + geoportal) și NU emitem automat. UI re-etichetat „Nr. CF / referință geoportal (de confirmat)".

**Notă infra:** serviciul **Imobile MapServer al ANCPI** poate fi jos ore întregi (HTTP 000 timeout) în timp ce restul geoportalului (pagina statică, catalog REST, Ortofoto) merge 200 — defecțiune izolată pe acel serviciu, nu rate-limiting de partea noastră. Test de validare (pin vs CF 100015) rămas în așteptarea revenirii serviciului.

## 2. Cazier judiciar PF/PJ (ramura `main`, deploy prod)

`src/app/servicii/cazier-judiciar-online/{page,persoana-fizica,persoana-juridica}.tsx`:
1. **CTA direct la formular:** cardurile „Alege tipul" + CTA-urile finale PF/PJ duceau la paginile-landing (click în plus) → acum link direct la `/comanda/cazier-judiciar-persoana-{fizica,juridica}`.
2. **Termen urgent consistent:** afișa `service.urgent_days` brut (PF „2 zile", PJ „3 zile" greșit) → hardcodat „1-2 zile" ca pe pagina principală (standardul „2-4 zile" era deja OK via `processing_config.estimated_days_display`).
3. **Aliniere design la template CF** (`extras-de-carte-funciara`, vezi `docs/design/SERVICE-PAGE-DESIGN-GUIDE.md`): secțiunea „Opțiuni" (grid plat) → „Preț & opțiuni" cu **3 carduri** (bază *featured* + urgență *Recomandat* +80 RON — NU gratis ca la CF — + add-on-uri dinamice); adăugat **tabel comparativ** „eGhișeul vs alți operatori vs ghișeu Poliție". PF în temă aurie, **PJ în temă albastră** (excepția istorică din ghid). Verificat vizual (Playwright).

## 2b. Navigare — Cazier Judiciar cu sub-itemi PF/PJ (ramura `main`, deploy prod)

`src/config/services-nav.ts` + `src/components/shared/{services-mega-menu,header}.tsx`:
- Adăugat `children?: ServiceNavItem[]` la `ServiceNavItem`.
- „Cazier Judiciar" (categoria Juridice) devine **părinte** cu sub-itemi indentați
  **„Persoană Fizică"** și **„Persoană Juridică"** (link-uri canonice via `serviceUrl`).
- Randat în **mega-meniul desktop** (sub-listă cu bară verticală) ȘI în **meniul mobil**.
- Verificat vizual (Playwright) + build OK.

## 3. Ghid SEO AI Search / GEO (ramura `docs/ai-seo-content-guide`)

`docs/seo/ai-content-optimization-guide.md` — sinteză din ghidul oficial Google („AI search = SEO"), research cross-platform (Search Engine Land/Journal, Ahrefs/Semrush/BrightEdge, lucrarea Princeton GEO) + audit pe conținutul nostru. Concluzii: contează conținutul unic first-hand + citate/statistici/surse (singura tactică dovedită cauzal); `llms.txt`/markup AI/chunking/keyword-stuffing sunt inutile/dăunătoare. Audit: paginile de servicii sunt puternice; blogul e veriga slabă (thin, fără autor). Indexat în `docs/README.md`.
