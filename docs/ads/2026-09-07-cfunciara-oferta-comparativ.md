# 07.09.2026 — Ce oferă CFunciara vs. ce oferim noi

Verificat direct pe paginile lor de serviciu. Concluzia scurtă: **prețurile de bază sunt
identice**, dar ei au două lucruri pe care noi nu le avem — **opțiunea de urgență** (bani lăsați
pe masă) și un **formular fără CNP**.

## Comparația, serviciu cu serviciu

| Serviciu | CFunciara | eGhiseul | Verdict |
|---|---|---|---|
| Extras de carte funciară | 79 + TVA = **95,59** | **89,00** | ✅ suntem mai ieftini |
| Plan de amplasament (PAD) | 179 + TVA = **216,59** · 4 zile | **216,59** · 4 zile | = identic |
| Copie inventar coordonate Stereo 70 | 179 + TVA = **216,59** · 4 zile | **216,59** · 4 zile | = identic |

Prețurile de bază sunt aliniate la leu — grila noastră a fost construită după a lor
(vezi memoria `preturi-imobiliare-cfunciara`).

## Ce au ei și noi nu

### 1. Urgență plătită — și e scumpă

| Serviciu | Standard | Prioritate (2 zile) | Total cu urgență |
|---|---|---|---|
| PAD | 4 zile | **+211 lei** | 427,59 lei |
| Copie inventar coordonate | 4 zile | **+111 lei** | 327,59 lei |

**Noi nu avem nicio opțiune de urgență pe niciunul dintre cele 18 servicii imobiliare.** La ei,
urgența aproape dublează prețul PAD-ului. Cine are nevoie de un document pentru o tranzacție care
se semnează săptămâna asta plătește fără să clipească — și pleacă la ei, pentru că la noi nu are
ce alege.

### 2. Formular fără CNP

Datele cerute de ei la comandă: județ, localitate, nr. carte funciară, nr. cadastral, nr.
topografic (opțional), nume, telefon, email, adresă de facturare, CUI opțional.

**Nu cer CNP-ul și nici cartea de identitate a proprietarului.** Noi le cerem obligatoriu, înainte
de plată (vezi `2026-09-07-test-formular-imobiliare.md`). Ăsta e dezavantajul nostru cel mai scump.

### 3. Livrare pe WhatsApp

Ei livrează „pe email și pe WhatsApp (dacă e selectat)”. Noi doar pe email. Detaliu mic, dar apare
în anunțurile lor ca argument („direct pe telefonul tău”).

### 4. Pagini pe localitate

Au pagini separate per oraș și județ pentru fiecare serviciu:
`/servicii/plan-de-amplasament-si-delimitare/brasov`, `/bucuresti`, `/pitesti`, `/carei`,
`/gura-humorului`, `/arges`… Astea alimentează cele ~300 de anunțuri și le dau și organic pe
căutări locale. Noi avem pagini de locație doar pe cazier și carte funciară
(vezi `docs/seo/`), nu pe serviciile cadastrale.

## Ce facem, în ordinea banilor

1. **Adăugăm urgență pe serviciile cadastrale.** E cea mai rapidă sursă de venit: nu costă
   dezvoltare (mecanismul de opțiuni există deja pe cazier), nu cere nimic de la client în plus, și
   se aplică pe 12 servicii care acum au un singur termen. Preț sugerat, sub ei ca să fim
   competitivi: **+150 lei pentru 2 zile** la serviciile de 216,59 (ei cer +211 la PAD, +111 la
   coordonate — deci undeva la mijloc), **+90 lei** la extras CF pentru 24h. De confirmat cu Mircea
   dacă poate ține termenul.
2. **Scoatem CNP/CI din pasul dinainte de plată** (vezi documentul de test). Ei nu le cer, noi da —
   iar la același preț, câștigă formularul mai scurt.
3. **Livrare pe WhatsApp** ca opțiune bifabilă — avem deja numărul clientului.
4. **Pagini pe localitate** pentru serviciile cadastrale, ca bază pentru campanii pe „OCPI +
   județ”. Etapa a doua, după ce primele trei sunt făcute.

**Abia după 1 și 2 pornim bugetul pe campaniile noi** — altfel plătim clicuri ca să trimitem
oamenii la un formular mai lung, la același preț, fără opțiunea de urgență pe care o caută.
