# 12.11.2026 — CJO și ecazier: Google Analytics nu mai numără paginile de admin
<!-- categorie: infrastructura -->

## Pentru echipă

În rapoartele Google Analytics de la cazierjudiciaronline.com și ecazier.ro
apăreau și vizitele voastre din admin, ca pe eghiseul înainte de 02.11. De
acum paginile de admin nu mai trimit nimic în Analytics pe niciunul dintre
site-uri. Nu aveți nimic de făcut; cifrele de trafic vor arăta doar clienții.

Vizitele din admin deja înregistrate rămân în rapoartele vechi.

---

## Tehnic

Repo `cazierjudiciaronline.com`, commit `a1e4f7f7`:

- `src/lib/consent.ts`: `isInternalPath()` cu prefixul `/admin`.
- `src/components/consent/cookie-consent.tsx`: `window['ga-disable-<gaId>']`
  setat din `usePathname()`, înainte de efectul de consimțământ. Componenta e
  în layout-ul rădăcină, deci acoperă ambele site-uri (CJO și ecazier).

Pe platforma eghiseul regula exista deja și se aplică tuturor brandurilor
(eghiseul, documentero, cazierfiscal, constatator): `isInternalPath` în
`src/lib/consent.ts`, prefixele `/admin` și `/colaborator`.

Verificat prin typecheck și lint; nu în GA4 Realtime.
