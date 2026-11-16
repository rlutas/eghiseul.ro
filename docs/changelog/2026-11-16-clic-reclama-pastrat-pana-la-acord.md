# 16.11.2026 — Clicul din reclama Google se păstrează până la acordul de cookie-uri
<!-- categorie: automatizari -->

## Pentru echipă

Nu se schimbă nimic în lucrul de zi cu zi. Schimbarea e în felul în care numărăm vânzările aduse de reclamele Google.

Până acum, un client care venea dintr-o reclamă, se plimba prin site și apăsa „Accept” pe bannerul de cookie-uri abia pe a doua sau a treia pagină nu mai era legat de reclamă: vânzarea lui apărea în Google Ads ca și cum n-ar fi existat. De azi, clicul se ține minte și se predă către Google în momentul în care clientul își dă acordul.

Cine refuză cookie-urile de marketing rămâne nenumărat, ca înainte. Asta e corect și rămâne așa.

---

## Ce era

`gtag.js` se încarcă doar după acordul de marketing și citește `gclid` din adresa paginii pe care se încarcă. Dacă acordul venea pe altă pagină decât cea de aterizare, `gclid` nu mai era în adresă, cookie-ul `_gcl_aw` nu se scria, iar conversia „Purchase” pleca fără legătură cu clicul.

Găsit la verificarea campaniei de constatator (cont 881-388-1795), 16.11.2026: 25 de clicuri, 0 conversii, acțiunea de conversie „Inactiv”.

## Ce am schimbat

- `src/lib/analytics/attribution.ts`: atingerea salvată reține și parametrul care a adus clicul (`click_param`: `gclid`, `gbraid`, `fbclid`…).
- `src/lib/analytics/gclid-restore.ts` (nou): `buildGclAwCookie()` construiește cookie-ul `_gcl_aw` din atribuirea proprie (`eg_attribution`), în formatul pe care îl scrie Google (`GCL.<secunde>.<gclid>`).
- `src/components/consent/cookie-consent.tsx`: `loadAds()` scrie cookie-ul înainte să injecteze `gtag.js`.

Reguli: rulează doar după acordul de marketing; nu suprascrie un `_gcl_aw` existent; nu face nimic dacă `gclid` e deja în adresă; doar `gclid` (nu `gbraid`/`wbraid`, care au alt cookie); clicuri de cel mult 90 de zile; un click id cu alte caractere decât litere, cifre, `_` și `-` e respins.

Se aplică pe toate brandurile care au cont Google Ads.

## Limite

- Vizitatorii veniți înainte de 16.11 nu au `click_param` salvat, deci pentru ei nu se reface nimic.
- Conversia de pe pagina de succes rămâne de dovedit cu o comandă plătită; vezi `docs/ads/2026-11-12-google-ads-jurnal-incercari.md`.

## Teste

`tests/unit/lib/analytics/gclid-restore.test.ts` (5 teste).
