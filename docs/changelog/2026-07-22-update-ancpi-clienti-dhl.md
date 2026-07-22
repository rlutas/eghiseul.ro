# 2026-07-22 — Email update ANCPI către clienți + negociere DHL (status)

## Email update ANCPI — TRIMIS (24/24, zero eșecuri)
Către TOȚI clienții cu comenzi ANCPI plătite și nelivrate (16 extras CF +
4 identificare imobil + 1 identificare proprietar + 3 plan cadastral, comenzi
10–22 iul). Conținut per client: nr. comandă + situația e-Terra (atac
cibernetic, ANCPI fără dată oficială de revenire, nu e problema noastră) +
promisiunea eliberării automate cu prioritate la revenire + **link-ul de status
al comenzii lui** (progres live + primește email automat la eliberare) + link
articol https://eghiseul.ro/ancpi-nu-functioneaza/. Trimis prin Resend
(idempotent `ancpi-update-2207-<nr>`), notat în order_history pe fiecare
comandă (echipa vede cine a fost anunțat).

### ⚠️ DE FĂCUT PE VIITOR (cerință Raul): template branduit pt email-uri de update
Email-urile de azi au fost HTML simplu, fără designul brandului. Următoarea
campanie de update trebuie să folosească un TEMPLATE reutilizabil pe stilul
email-urilor existente (vezi src/lib/email/templates/branded-layout +
order-confirmation). De construit: `update-notice.ts` (titlu, corp, CTA buton,
footer standard) + folosit la orice anunț în masă.

## DHL — negociere (status la zi)
Oferta lui Adrian (22.07, 13:42): **~-18%** (Italia 200,75→165, Moldova
225→183, Luxemburg 209→170) ≈ 900–1.000 lei/lună economie. Raul a trimis
răspunsul cu 3 clarificări (toate destinațiile? contractual? fuel+TVA incluse?)
+ întrebare de serviciu NOU explorat: **colectare DHL de la adresa clientului
din străinătate pe contul nostru** (import/pickup, ex. Germania→Satu Mare,
pentru flux dus-întors documente originale) — ton sobru, fără angajamente de
volum. Așteptăm răspunsul lui Adrian → decizie finală.
Detalii complete: docs/operations/dhl-livrare-analiza-cost-negociere.md
