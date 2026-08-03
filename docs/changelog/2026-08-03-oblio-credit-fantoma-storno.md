# 2026-08-03 — Credit client fantomă în Oblio după storno + refund parțial

## Simptom

Clienta Iuliana-Vica Tamaduianu (anulare comandă `E-260802-TDXDU`, 198 RON)
apărea în Oblio cu **„credit nefolosit 396 RON"**, deși nu avea niciun credit
real. Facturile arătau corect: EGH0239 stornată, EGH0245 (storno −198),
EGH0246 (59,40, încasată) — toate cu rest de încasat 0.

## Cauza

**Stornarea unei facturi ÎNCASATE nu șterge încasarea — o detașează.**
Aplicația emite orice factură plătită cu încasarea de card atașată
(`ensure-invoice` trimite blocul `collect`). La stornarea EGH0239, Oblio a
păstrat încasarea de 198 ca „încasare nealocată" pe clientă. A doua încasare de
198 („Alta incasare numerar", 03.08) fusese adăugată manual — de aici 2×198=396.

Refundul Stripe (parțial, 70% = 138,60; reținut 30% = 59,40 = exact EGH0246)
**nu se propagă în Oblio** — Oblio vedea în continuare 396 RON „primiți și
necheltuiți".

Confirmat prin API: `collects=[]` pe factura stornată (încasarea inițială
detașată), încasarea de 59,40 alocată corect pe EGH0246.

## Rezolvare (aplicată 03.08 de Raul, din UI — API-ul Oblio nu poate șterge încasări)

Fișa clientei → Încasări → șterse cele 2 încasări de 198 nealocate
(CARD 02.08 + NUMERAR 03.08). Păstrată încasarea de 59,40 (EGH0246).
Rezultat: încasări totale = 59,40 = banii chiar reținuți; credit nefolosit = 0.

## Procedură pe viitor — la ORICE anulare cu storno

1. Stornezi factura → **încasarea originală rămâne detașată pe client**.
2. Faci refundul în Stripe (integral sau parțial cu reținere taxă).
3. Dacă reții o taxă → factură nouă pe suma reținută, cu încasarea ei.
4. **Intră în fișa clientului din Oblio și șterge încasările rămase nealocate**
   — banii nu mai sunt la noi. Creditul clientului trebuie să ajungă la 0.

Regula de verificare: `total încasări client în Oblio = banii efectiv păstrați`.
