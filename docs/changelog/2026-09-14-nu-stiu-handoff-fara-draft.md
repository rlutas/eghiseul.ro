# 14.09.2026 (partea a treia) — „Nu știu" din pasul Date imobil lăsa clientul fără comandă pe server

Echipa a semnalat `E-260914-B8SM9` (și `E-260913-2UHT9`, același client,
`m_trifu@…`, telefon UK): „nu îl lasă să plătească". Capturile clientului
arătau pasul **3 din 3, Facturare, 198 lei** cu datele completate și butonul
„Plătește 198.00 RON" — adică **Identificare imobil după adresă**, nu Copie CF.

## Ce s-a întâmplat

1. Clientul a intrat pe **Copie carte funciară** (din Facebook, pe telefon),
   a trecut de contact (draftul `E-260914-B8SM9` s-a creat), a ales județul
   Constanța și, neavând numărul de carte funciară, a apăsat **„Nu știu" →
   „Știu adresa imobilului"**.
2. Saltul duce pe `/comanda/identificare-imobil?step=2` cu contactul purtat
   prin `sessionStorage` (`wizard_contact_handoff`). Clientul a completat
   adresa, proprietarul, facturarea — totul DOAR în browser.
3. La „Plătește": `handleSubmitOrder` n-are `state.orderId` → toast „Comanda se
   salvează încă — așteaptă o secundă și apasă din nou." La nesfârșit.

**Cauza.** Codul comenzii (`friendlyOrderId`) se generează **doar** când
clientul iese din pasul 1 (`nextStep()` pe `contact`). Handoff-ul aterizează
direct pe pasul 2, deci sare peste generare. Auto-save-ul are poarta
`!state.friendlyOrderId → return`, deci pe serviciul nou **nu s-a creat
niciodată un draft pe server** (în DB nu există nicio comandă de identificare
pentru acest email, deși clientul era la pasul 3 cu facturarea completată).
Reprodus pe producție cu un draft de test: după „Nu știu" → identificare
imobil, fără cod de comandă în antet, fără „Salvat acum", fără `?order=` în
URL, fără rând în DB după ce am tastat adresa.

Cele trei drafturi de Copie CF ale clientului (02.08, 13.09, 14.09) sunt toate
la `property-data` cu CF gol — de fiecare dată a luat calea „Nu știu" și a
ajuns în același loc mort. Bug-ul afectează **orice** client care folosește
„Nu știu" (→ identificare imobil / identificare după proprietar) sau butonul
„Comandă Extras CF Colectiv cu numărul introdus" (același handoff).

## Fixul

- `src/lib/orders/wizard-handoff.ts` (nou, pur): `handoffActions(raw, now,
  generateId)` aplică regulile (TTL 10 min, email obligatoriu, blocul
  `property` purtat mai departe) **și emite `SET_FRIENDLY_ORDER_ID`** cu un
  cod nou. Provider-ul doar dispatch-uiește ce întoarce helperul. 5 teste în
  `tests/unit/lib/orders/wizard-handoff.test.ts` (regresia = codul e alocat).
- Cu codul alocat, auto-save-ul face `POST /api/orders/draft` la prima
  modificare pe serviciul nou → `orderId` → „Plătește" funcționează.

## Două schimbări de UX cerute de Raul (din aceleași capturi)

- **Caseta roșie „Funcționare cu întârzieri" (portal ANCPI) nu se mai
  afișează pe ultimul pas** (facturare + „Plătește") pe mobil — clientul a
  decis deja, caseta îl făcea să ezite. Rămâne pe pașii 1–2 și în sidebarul de
  desktop.
- **Butonul plutitor WhatsApp dispare de pe wizard** (`/comanda/<serviciu>`):
  pe telefon stătea peste „Plătește" și peste bara de rezumat. În loc, caseta
  „Ai nevoie de ajutor?" de sub formular are acum buton **„Scrie-ne pe
  WhatsApp"** (mesaj pre-completat cu codul comenzii) și se afișează pe toți
  pașii, nu doar după ce există cod. Pe checkout/status/success butonul
  plutitor rămâne.

## Pentru echipă (clientul din B8SM9)

Clientul nu are nicio comandă de identificare pe server — datele tastate
(adresă, facturare) au rămas doar în telefonul lui. După deploy: îi trimiteți
linkul `https://eghiseul.ro/comanda/identificare-imobil/` și reia comanda de la
contact (2 minute). Alternativ, comandă telefonică din admin cu datele din
capturi (Radu Ssndica, Constanța).
