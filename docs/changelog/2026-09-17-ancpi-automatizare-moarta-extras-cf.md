# 17.09.2026 — Extrasul de carte funciară: robotul ANCPI e oprit, iar pagina promite altceva
<!-- categorie: automatizari -->

## Pentru echipă

Robotul care lua singur extrasele de carte funciară de la ANCPI nu mai funcționează din
20 august. Voi știți deja, fiindcă le luați manual de o lună.

Ce nu știați: nu e o defecțiune de-a noastră și nu se repară repornind ceva. ANCPI a scos
de pe internet adresele portalului lor. Pur și simplu nu mai există unde să se conecteze
robotul. Nici pagina unde clientul își verifica singur documentul nu mai există.

Problema pentru noi: pagina de vânzare încă promite clientului că primește extrasul „în
câteva minute, automat, 24/7". Nu e adevărat. Cine plătește seara primește documentul a
doua zi dimineață, când ajungeți voi la el.

Dacă un client vă reproșează întârzierea, aveți dreptate să îi explicați că portalul ANCPI
e picat și că lucrăm manual. Nu promiteți minute la telefon.

Textul de pe pagină urmează să fie corectat. Până atunci, nu pornim reclamă plătită pe
serviciul ăsta, ca să nu plătim bani pe o promisiune pe care n-o putem ține.

---

## Ce s-a găsit

| Semnal | Valoare |
|---|---|
| Ultimul job ANCPI creat | 20.08.2026, 20:37 |
| Joburi noi de atunci | 0 |
| Comenzi de extras CF plătite după 21.08 | 27, toate manuale |
| Joburi în ultimele 30 de zile | 11, toate `NEEDS_OPERATOR` |
| Joburi `DONE` în tot istoricul | 7 din 116, toate în iulie |
| ONRC, pentru comparație | 11 `DONE` în septembrie — sănătos |

Eroarea repetată în `ancpi_job_events`:

```
page.goto: net::ERR_NAME_NOT_RESOLVED at https://oassl.ancpi.ro/openam/UI/Login?module=SelfRegistration
```

## Cauza

Gazdele ANCPI nu mai există în DNS. Verificat cu resolverele publice Cloudflare (1.1.1.1) și
Google (8.8.8.8):

| Gazdă | Rezultat |
|---|---|
| `oassl.ancpi.ro` | NXDOMAIN |
| `epay.ancpi.ro` | NXDOMAIN |
| `myeterra.ancpi.ro` | NXDOMAIN |
| `ancpi.ro` | rezolvă normal |

Deci nu e un bug de worker și nu se repară cu `railway up`. Avaria e înregistrată la noi din
13.07.2026 și `/api/status/?service=ancpi` o raportează corect, cu `operational: false`.
Componenta `SystemStatus` de pe pagina de serviciu o arată vizitatorului înainte de plată.

## Ce e de corectat pe site

1. Eroul și FAQ-ul de pe `/servicii/extras-de-carte-funciara/` promit „în câteva minute,
   automat, 24/7". Timpul real, măsurat pe comenzile de după 14.09: 53–123 de minute dacă
   plata vine dimineața, 946–1176 de minute dacă vine seara.
2. Pagina trimite clientul la `epay.ancpi.ro` pentru verificarea autenticității și descrie
   varianta gratuită „prin platforma MyeTerra (myeterra.ancpi.ro)". Ambele domenii sunt moarte.
   Apar și în `/extras-carte-funciara-gratuit/`.

## Ce s-a livrat acum

- FAQ-ul spunea „**Eliberăm** extrase de carte funciară". Noi obținem, instituția eliberează.
  Corectat în „Obținem".
- Planul complet al campaniei de extras CF pe ChatGPT Ads, cu anunțuri scrise deliberat fără
  nicio promisiune de timp, ca să fie valabile și după corectarea paginii:
  `docs/ads/chatgpt/09-campanie-extras-carte-funciara.md`. Campania **nu** s-a pornit.
