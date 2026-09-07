# 07.09.2026 — Ce oferă CFunciara vs. ce oferim noi

Verificat direct pe paginile lor de serviciu și pe `service_options` din DB-ul nostru.
Concluzia scurtă: **prețurile de bază sunt identice, iar urgența o avem și noi** (chiar mai
scumpă decât la ei). Singurele diferențe reale rămân formularul și acoperirea pe localități.

## Comparația, serviciu cu serviciu

| Serviciu | CFunciara | eGhiseul | Verdict |
|---|---|---|---|
| Extras de carte funciară | 79 + TVA = **95,59** | **89,00** | ✅ suntem mai ieftini |
| Plan de amplasament (PAD) | 179 + TVA = **216,59** · 4 zile | **216,59** · 4 zile | = identic |
| Copie inventar coordonate Stereo 70 | 179 + TVA = **216,59** · 4 zile | **216,59** · 4 zile | = identic |

Prețurile de bază sunt aliniate la leu — grila noastră a fost construită după a lor
(vezi memoria `preturi-imobiliare-cfunciara`).

## Urgența — o avem, pe 11 servicii

Opțiunea „Procesare Prioritară” e **activă** la noi (coloana `price` din `service_options`,
nu `price_modifier` — de asta pare că lipsește dacă interoghezi greșit):

| Serviciu (slug) | Bază | Urgență | Total urgent | Termen |
|---|---|---|---|---|
| copie-inventar-coordonate, copie-releveu, copie-arhiva-ocpi | 216,59 | +134,31 | **350,90** | 2 zile în loc de 4 |
| plan-amplasament-delimitare, copie-plan-cadastral, copie-intabulare, copie-contract-vanzare, copie-plan-incadrare | 216,59 | +255,31 | **471,90** | 2 zile în loc de 4 |
| copie-carte-funciara, extras-cf-colectiv | 168,19 | +182,71 | **350,90** | 2 zile |
| actualizare-adresa-cf | 302,50 | +423,50 | **726,00** | 5 zile în loc de 15 |
| extras-carte-funciara | 89,00 | — (rândul de urgență e INACTIV) | — | doar „extras suplimentar” +49,99 |

Comparativ cu ei:

| Serviciu | CFunciara urgent | eGhiseul urgent | Verdict |
|---|---|---|---|
| PAD | 179 + 211 = **427,59** | **471,90** | ⚠️ suntem cu 44,31 mai scumpi |
| Copie inventar coordonate | 179 + 111 = **327,59** | **350,90** | ⚠️ suntem cu 23,31 mai scumpi |

Deci nu lipsește urgența — e doar puțin peste a lor. De discutat cu Mircea dacă coborâm PAD-ul
urgent sub 427,59, sau dacă rămânem sus și vindem pe termen (ambii promitem 2 zile).

**De activat:** urgența pe `extras-carte-funciara` (rândul există, e dezactivat) — e serviciul
cu cel mai mare volum și singurul unde chiar n-avem ce vinde în plus.

## Ce au ei și noi nu

### 1. Formular fără CNP

Datele cerute de ei la comandă: județ, localitate, nr. carte funciară, nr. cadastral, nr.
topografic (opțional), nume, telefon, email, adresă de facturare, CUI opțional.

**Nu cer CNP-ul și nici cartea de identitate a proprietarului.** Noi le cerem obligatoriu,
înainte de plată (vezi `2026-09-07-test-formular-imobiliare.md`) — pentru că cererea la OCPI
și împuternicirea le cer efectiv. **Decizie Raul 07.09: rămâne așa, avem nevoie de date.**
Compensăm prin explicarea motivului în formular și prin viteză, nu prin scurtarea lui.

### 2. Livrare pe WhatsApp

Ei livrează „pe email și pe WhatsApp (dacă e selectat)”. Noi doar pe email. Detaliu mic, dar apare
în anunțurile lor ca argument („direct pe telefonul tău”).

### 3. Pagini pe localitate

Au pagini separate per oraș și județ pentru fiecare serviciu:
`/servicii/plan-de-amplasament-si-delimitare/brasov`, `/bucuresti`, `/pitesti`, `/carei`,
`/gura-humorului`, `/arges`… Astea alimentează cele ~300 de anunțuri și le dau și organic pe
căutări locale. Noi avem pagini de locație doar pe cazier și carte funciară
(vezi `docs/seo/`), nu pe serviciile cadastrale.

## Ce facem, în ordinea banilor

1. **Pornim campaniile noi** (certificat urbanism + coordonate Stereo 70) — avem preț identic
   la bază și urgență pe raft, deci nu mai e nimic de așteptat. Vezi
   `2026-09-07-campanii-noi-imobiliare.md`.
2. **Activăm urgența pe extras-carte-funciară** și reevaluăm +255,31 la PAD față de +211 al lor.
3. **Livrare pe WhatsApp** ca opțiune bifabilă — avem deja numărul clientului.
4. **Pagini pe localitate** pentru serviciile cadastrale, ca bază pentru campanii pe „OCPI +
   județ”. Etapa a doua.
