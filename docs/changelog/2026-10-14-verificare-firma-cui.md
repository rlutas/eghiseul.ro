# 14.10.2026 — Unealtă gratuită „Verificare firmă după CUI”; popup-ul de newsletter scos
<!-- categorie: seo -->

## Pentru echipă

- Pagină nouă: **eghiseul.ro/tools/verificare-firma-cui/**. Clientul scrie CUI-ul și vede gratuit dacă firma e activă, inactivă sau radiată, dacă plătește TVA (și TVA la încasare), codul CAEN, sediul și bilanțul pe ultimii doi ani (cifră de afaceri, profit sau pierdere, angajați).
- Sub rezultat îi explicăm că asociații și administratorii nu apar la ANAF și îl trimitem la **certificatul constatator**. Dacă un client vrea doar să știe „dacă firma e OK”, îi puteți trimite linkul.
- Pagina a fost refăcută în aceeași zi: totul e pe alb sub formular, cu secțiunile „Ce afli despre o firmă”, „Activă, inactivă sau radiată: ce înseamnă pentru tine”, pașii de verificare și banda cu certificatul constatator. Butonul „Vezi un exemplu” arată un rezultat fără să știi un CUI, iar linkul cu rezultatul se poate trimite (de exemplu `?cui=19`).
- **Instrumentele apar acum în meniul „Calculatoare”** (grupul „Instrumente gratuite” + linkul „Toate instrumentele”), pe calculator și pe telefon, și în subsol, la „Firme & auto”.
- **Popup-ul „Alerte fiscale + ghiduri pe email” nu mai apare** pe calculatoare și pe verificarea rovinietei: acoperea jumătate de ecran pe telefon.

---

## Tehnic

- `src/lib/company/firm-report.ts` (`server-only`): ANAF `PlatitorTvaRest/v9/tva` + `bilant?an=&cui=` pe ultimii 2 ani, indicatori potriviți după denumire (codurile I13/I18… diferă pe an/tip). Fetch cu `revalidate` 1 h / 24 h.
- `GET /api/tools/verificare-firma/?cui=` (public): CUI validat cu cifra de control (`validateCUIFormat`), limită 10/min/IP în memorie, 404/503 cu mesaje în română.
- `src/components/tools/firm-check.tsx` + `src/app/(eghiseul)/tools/verificare-firma-cui/page.tsx` (WebApplication + FAQPage). Câmpul „registrul RO e-Factura” NU e afișat: arăta „neînscrisă” la firme mari (registrul voluntar de dinainte de obligativitate) — ar fi indus în eroare.
- CTA spre constatator = `TrackedLink` `placement="tool"` → apare în /admin/marketing („rezultatul uneltei”).
- Înregistrată în `HARDCODED_TOOL_SLUGS`, `last-modified.ts`, `/tools/`; linkuri din pagina constatator (paragraf corectat: platforma ONRC cere doar taxa de 30 lei, fără semnătură electronică) și din „Cele 4 tipuri de certificat constatator”.
- Regula de ritm: a doua pagină nouă a săptămânii 12–18.10 (după `/cadastru-sistematic/`), deci limita e atinsă.
- Redesign (ui-ux-pro-max, identitatea eghiseul păstrată): secțiuni albe cu `border-t`, carduri de stare cu icon + text (nu doar culoare), schelet la încărcare, stare goală cu ce afli + exemplu, deep link `?cui=` (`history.replaceState`, canonical neschimbat), banda `ArticleServiceCards` (constatator + 3 linkuri). Placeholder scurtat pe mobil, carduri 2×2.
- Navigare: `TOOLS_NAV` + `HEADER_TOOLS_NAV` în `src/config/calculators-nav.ts`, folosite de `calculators-mega-menu.tsx` și meniul mobil din `header.tsx`; directorul de calculatoare rămâne doar cu calculatoare. Footer: 2 linkuri în „Firme & auto”.
- `NewsletterPopup` scos din `CalculatorLayout` și din `/tools/verificare-rovinieta-online/` (componenta rămâne în repo, nefolosită).
