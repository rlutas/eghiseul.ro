# Servicii ANCPI extinse (colaborare topograf Mircea) — plan de implementare

**Status:** plan / așteaptă decizii produs. Bazat pe analiza concurentului: `docs/services/ancpi-servicii.md` + tabelul cost/profit `ancpi-servicii-costuri.csv`.

## Context
Avem 3 servicii ANCPI automate (extras CF 89, plan cadastral 79.99, identificare imobil 198 — worker ANCPI A→Z). Concurentul (cfunciara) are 24. Vrem să adăugăm din cele 21 lipsă, în colaborare cu **Mircea (topograf)** care poate obține documentele ce cer topograf autorizat / depunere OCPI / primărie.

## Două categorii de fulfillment
1. **Automat (worker ANCPI existent)** — servicii care se pot obține prin portalul ANCPI ca cele 3 actuale: **Extras CF după adresă**, **Extras CF Colectivă**. Necesită extindere `worker-ancpi` (repo separat) pt noile tipuri.
2. **Manual / backoffice (Mircea)** — restul (PAD, copii arhivă OCPI, certificat sarcini, certificate urbanism, pachete). Flux: comandă → notificare Mircea → Mircea obține documentul → încarcă în admin → livrare client. NU necesită worker; necesită flux de „fulfillment manual cu partener".

## Ce trebuie construit (repo eghiseul)
1. **DB — servicii noi** (per serviciu ales): rând în `services` (slug, name, base_price, category, `verification_config`), `service_options` dacă e cazul. Migrație nouă.
2. **Wizard config** — `verification_config` per serviciu: ce date cere (ex. nr cadastral / adresă / CF / nume proprietar / CNP), KYC dacă e nevoie, livrare (digital/email). Refolosim modulul `property` existent.
3. **SEO pages** `/servicii/<slug>` (multe au deja pagini la cfunciara — facem similar).
4. **Fulfillment manual (partener)** — în admin:
   - status nou tip „trimis la partener" / „în lucru topograf";
   - notificare Mircea (email/WhatsApp) cu datele comenzii;
   - Mircea (sau admin în numele lui) încarcă documentul final → `order_documents` (visible_to_client) → email client.
   - (Opțional) cont/portal separat pt Mircea cu lista comenzilor lui.
5. **Pricing/comision** — preț client (din tabelul cost/profit) + cost Mircea + marja. Eventual câmp `partner_cost` pe comandă pt contabilitate.

## Decizii necesare (de la tine + Mircea)
1. **Care servicii întâi?** (recomandare: start cu cele 2 automate — Extras CF după adresă + Colectivă — dacă worker-ul le suportă; apoi 2-3 manuale cu cerere mare: PAD, Copie CF in extenso, Certificat de sarcini).
2. **Fluxul Mircea:** primește comanda cum (email/WhatsApp/portal)? Încarcă el documentul sau ni-l trimite și-l urcăm noi?
3. **Preț + comision** per serviciu (completați `ancpi-servicii-costuri.csv` cu costul lui Mircea → vedem marja).
4. **worker-ancpi** poate face Extras CF după adresă / Colectivă? (dacă da → automate; dacă nu → tot manual deocamdată).

## Sugestie faze
- **Faza A (rapid):** flux generic „fulfillment manual cu partener" în admin (status + notificare + upload document partener) — refolosibil pt ORICE serviciu manual. + 1-2 servicii pilot (ex. Certificat de sarcini, PAD).
- **Faza B:** extindere worker-ANCPI pt Extras CF după adresă + Colectivă (automate).
- **Faza C:** restul serviciilor + pagini SEO + (opțional) portal Mircea.

Spune-mi deciziile (mai ales 1 și 2) și pornesc Faza A.
