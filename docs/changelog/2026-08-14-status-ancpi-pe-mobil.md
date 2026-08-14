# 2026-08-14 — Starea portalului ANCPI se vede și pe telefon (și la checkout)

Semnalat de echipă: clienții comandă servicii de cadastru și abia apoi scriu ca
să întrebe de ce întârzie — badge-ul „Funcționare cu întârzieri · Portal ANCPI
indisponibil" **nu apărea pe telefon**.

## Cauza

În wizard, `<SystemStatus>` era randat din `PriceSidebarModular` sub condiția
`variant === 'full'` — adică **doar** în sidebarul de desktop. Pe mobil sidebarul
nu se randează deloc: acolo se folosesc `variant="extras"` (în formular) și
`variant="summary"` (dropdown-ul din bara sticky), niciunul incluzând badge-ul.
Deci pe telefon informația lipsea complet, pe toate serviciile.

În plus, pagina de **checkout** — ultimul ecran înainte de plată — nu-l afișa
nici pe desktop, nici pe mobil.

## Fix

- **Wizard, mobil**: badge-ul se randează acum deasupra formularului
  (`lg:hidden`, imediat sub bara de progres), în varianta completă din
  screenshot. Pe desktop rămâne în sidebar — un singur badge vizibil în fiecare
  caz, verificat la 390px și 1440px.
- **Checkout**: badge-ul apare în coloana de sumar, care pe mobil e prima, deci
  se vede fără derulare, chiar deasupra butonului de plată.

Serviciile acoperite sunt cele din `PLATFORM_DEPENDENT_SERVICES` +
`INSTANT_PLATFORM_SERVICES` (`src/lib/services/platform-services.ts`): toate cele
14 servicii prin topograf, plus extras CF, extras plan cadastral, identificare
imobil / imobile după proprietar și constatatorul ONRC. Lista era deja completă —
nu lipsea niciun serviciu de cadastru, lipsea afișarea.

Badge-ul dispare singur când portalul e funcțional (componenta nu randează nimic
în starea „operațional"), deci nu rămâne un banner mort după revenirea e-Terra.

## Verificat

- 390×844 (iPhone): badge vizibil pe `/comanda/copie-carte-funciara` și pe
  checkout, deasupra rezumatului.
- 1440×900: un singur badge (cel din sidebar), fără dublare.
- `/comanda/cazier-judiciar-persoana-fizica`: niciun badge — serviciile care nu
  depind de o platformă rămân neatinse.
