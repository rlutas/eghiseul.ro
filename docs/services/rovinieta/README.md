# Verificare Rovinietă Online (Tool gratuit)

| | |
|---|---|
| **Slug DB** | `rovinieta` (preț `0` = tool gratuit, nu comandă plătită) |
| **URL** | `/tools/verificare-rovinieta-online/` |
| **Preț / Tip** | Gratuit · instrument informativ (WebApplication), nu flux de checkout |
| **Categorie** | Instrumente (Tools) — verificare auto |

Instrument gratuit de verificare a valabilității rovinietei (vinietei) pentru vehiculele înmatriculate în România, **după numărul de înmatriculare, fără serie de șasiu**. Arată instant dacă mașina are rovinietă validă și data de expirare. Datele provin din evidența oficială CNAIR (prin widget-ul erovinieta.net).

## SEO

- **URL:** `/tools/verificare-rovinieta-online/` (instrument, nu serviciu plătit). Mega-meniul „Verificare Rovinietă" trimite către acest tool.
- **Volum GSC:** ~294k clicks — unul dintre cele mai puternice active de trafic ale site-ului (moștenit de la WP).
- **Clustere țintă:** `verificare rovinietă online`, `verificare rovinietă după număr` (de înmatriculare), `verificare rovinietă fără serie șasiu`, `valabilitate rovinietă`, `amendă lipsă rovinietă`.
- **Schema:** `WebApplication` (`applicationCategory: UtilitiesApplication`, `offers.price: 0 RON`, `inLanguage: ro-RO`) în `@graph` (Organization + WebSite + BreadcrumbList + WebApplication). Meta via `buildPageMetadata` (canonical + OG `/og/verificare-rovinieta.png`).
- Proză indexabilă: „ce este rovinieta / de ce o verifici", 3 carduri (cum verifici / valabilitate / date CNAIR), bloc avertizare amendă, FAQ 6×.

## Flux (widget embed)

Nu există flux de comandă — pagina **embed-ează widget-ul erovinieta.net**, același widget folosit pe site-ul WordPress actual:

- Component: `src/components/tools/erovinieta-embed.tsx`.
- **Sursă (iframe):** `https://erovinieta.net/embed/verificare-rovinieta` (origin `https://erovinieta.net`).
- **Auto-resize via postMessage:** widget-ul trimite înălțimea conținutului prin `window.postMessage` (`{ type: 'erovinieta-embed', height }`); listener-ul verifică `e.origin === EMBED_ORIGIN`, apoi setează înălțimea iframe-ului, **clamp 360–1100px**, ca să nu existe scrollbar intern.
- `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`. Utilizatorul introduce numărul de înmatriculare în widget; verificarea se face contra evidenței oficiale CNAIR (prin erovinieta.net).

## Status & rămas

- ✅ **Widget live** — embed funcțional cu auto-resize postMessage, oglindește exact embed-ul de pe WP.
- Rămas: imagine OG `/og/verificare-rovinieta.png` de generat; widget dependent de disponibilitatea erovinieta.net (terț).

## Fișiere cheie

- `src/app/tools/verificare-rovinieta-online/page.tsx` — pagina tool + SEO + schema WebApplication.
- `src/components/tools/erovinieta-embed.tsx` — iframe embed + auto-resize postMessage.
