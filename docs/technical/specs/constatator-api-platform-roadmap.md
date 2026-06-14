# Certificat Constatator — API platform & roadmap

Forward-looking notes after the constatator flow became **fully automated A→Z via
the ONRC REST API** (submit + plată + emitere + livrare; vezi `onrc-automation-plan.md`
+ `worker-onrc/ONRC-API-SUBMIT.md`). Acest doc = viziunea de produs/arhitectură + follow-ups.

## 1. API-as-a-service (multi-tenant reseller) — VIITOR

Pentru că emiterea e 100% prin API, putem expune capacitatea și **altor platforme**:
ele își fac un **cont**, **încarcă credit**, și **emit certificate constatator prin noi** (white-label).

- **Model:** tenant (platformă parteneră) → cont + wallet de credit la noi → API key →
  apelează un endpoint al nostru (`POST /api/partner/constatator`) cu CUI + scop → noi
  cream jobul în coada `onrc_jobs`, botul emite, livrăm PDF-ul înapoi (webhook/URL).
- **Necesită:** tabel `partners` (api_key, credit_balance, webhook_url), autentificare per-key,
  debitare credit la fiecare emitere, rate-limit, webhook de livrare, facturare către partener.
- **Reutilizează:** întreaga coadă + worker (`submitViaApi` + retrieve) — doar sursa jobului diferă.
- Status: **idee documentată**, neimplementat. Arhitectura actuală o permite direct.

## 2. A doua platformă proprie (constatator-only) — VIITOR

O platformă separată a noastră, **conectată prin același API**, care emite **doar constatator**.
E un caz particular al (1) — un „partener" intern. Aceeași coadă + worker; doar alt frontend.

## 3. Analiză competitor — constatator-online.ro

`https://constatator-online.ro/certificat-constatator-online` (de aprofundat — pagină JS-rendered):
- Mesaj cheie: **„eliberare pe loc"** (instant) + legitimitate ONRC.
- Au **pagină „stare sistem"** (system status) + alte elemente de încredere → de adoptat și noi.
- **Prețuri competitor (14.06.2026):** Certificat de bază **64,9 RON + TVA**; cu istoric **399 RON + TVA**.
  (Noi acum: de bază/PF 119,99; istoric 499,99.)

## 4. Follow-ups (DUPĂ un test de confirmare end-to-end)

- **Pagină „Stare sistem"** (status ONRC API + worker) — ca la competitor, semnal de încredere.
- **Reducere preț** „de bază" către zona competitorului (64,9+TVA) — marja permite, totul e automat.
  Decizie de business; de aplicat după ce confirmăm câteva emiteri reale OK.
- **Mesaj pe pagină:** „Eliberare în ~5 minute, 24/7, automat" — de adăugat pe pagina serviciului
  + pe formular, **după** ce validăm că emiterea automată e stabilă pe mai multe comenzi.
- Scope curent automat: **firma / de bază**. **Istoric** = manual (mai scump) deocamdată;
  **persoană fizică** = flux diferit (solicitantul trebuie să fi fost administrator) — de implementat ulterior.
