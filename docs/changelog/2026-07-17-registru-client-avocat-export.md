# 2026-07-17 — Registru: alocare simplă „Client avocat" + export cu Nr Contract per delegație

**Cerință Raul:** (1) când doamna avocat (Tarta) alocă numere pentru clienții EI personali, formularul să fie simplu — doar nume + CNP, fără „caută comanda" (clientul ei nu are legătură cu platformele) — și intrarea să apară marcat „Client avocat"; (2) exporturile să fie complete și la zi, cu nr. contract + numerele de delegații alocate și pentru ce, per client — pentru control.

## Alocare manuală — mod „Client avocat (personal)"

- `admin/registru/page.tsx`: toggle „Pentru cine" în dialogul de alocare — **Client avocat (personal)** vs **Client platformă (comandă)**. Rolul `avocat` intră implicit pe personal; echipa poate comuta oricând.
- Modul personal arată doar: Tip (implicit Contract + Delegație legate), **Nume client**, **CNP**, **Pentru ce (serviciu/scop)**, Data. Fără căutare comandă, email, CUI, sumă, platformă/nr. comandă.
- `POST number-registry`: flag `avocat_client` → forțează platform/order_ref null + prefixează descrierea cu **„Client avocat"** pe toate numerele alocării. Jurnalul afișează badge „Client avocat" în loc de „Manual" (grupuri + rânduri individuale).
- **Combo-urile manuale fără comandă** primesc ref sintetic `MANUAL-XXXX` (analog `SHEET-` de la import) → contractul + delegația stau GRUPATE pe un singur rând în jurnal (înainte apăreau ca două rânduri separate, împrăștiate de sortarea pe număr). Indexul de idempotență cere `platform NOT NULL`, deci ref-ul sintetic (platform null) nu se ciocnește de nimic.

## Export CSV v2 (același zi, format cerut de Raul)

Înlocuiește formatul „un rând per număr" cu **grupare pe client/comandă**: un singur buton „Export CSV" (în loc de Export Contracte/Delegatii separate), un rând per delegație cu coloanele: **Client, CNP, CUI, Data, Nr Contract Asistenta, Serie (mereu SM), Nr Delegatie, Pentru ce**, Serviciu, Suma, Sursa („Client avocat" unde e cazul), Platforma, Comanda, Email, Anulat, Motiv, Creat de. Sortare **recente primele**. Grupurile doar-contract au rând propriu; delegațiile „Doar Delegatie" iau contractul din descriere. Verificat pe dev: 2335 rânduri/2026, primul rând = alocarea de azi, ultimul = 05.01.2026.

**Decizie Raul (follow-up):** 2026 se exportă **doar din 1 iulie** — ianuarie–iunie e în fișierele vechi de pe Drive (era Sheets), nu se dublează. Butonul trimite `date_from=2026-07-01` doar pentru anul 2026; anii următori se exportă complet. Verificat: 274 rânduri, 01.07→17.07, nimic înainte de iulie.

## Export CSV v1 (înlocuit de v2 mai sus — istoric)

- Coloană nouă **„Nr Contract"**: pe fiecare rând de delegație apare contractul de care ține (din același grup `order_ref`; fallback: trimiterea „Pentru contract NNNNNN" din descriere). La export filtrat „doar delegații", contractele-frate se aduc printr-un fetch suplimentar (altfel coloana rămânea goală).
- Coloană nouă **„Creat de"** (cine a făcut alocarea — util la control).
- Ref-urile sintetice `SHEET-`/`MANUAL-` nu se mai exportă în coloana Comanda (nu sunt comenzi reale).
- Exportul era deja complet + la zi (citește direct registrul central, chunked la 1000) — verificat: 4399 rânduri pe 2026, 2140/2316 delegații cu contract legat (restul = delegații istorice fără contract înregistrat).

**Verificat manual pe dev** (Playwright, user temporar rol `avocat`, șters după): dialog implicit pe personal cu formularul redus, toggle-ul restaurează formularul complet, export cu antetul nou + „Nr Contract" completat identic și pe exportul filtrat. **Fără alocare de test** — numerele Barou sunt reale și finite.
