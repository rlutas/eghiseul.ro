# 2026-06-26 — Termeni și Condiții complet + anulare 30 min per serviciu

## Termeni și Condiții rescris
`/termeni-si-conditii` era subțire (6 secțiuni). Rescris complet (15 secțiuni) după modelul
cazierjudiciaronline.com, adaptat la eGhișeul (multi-serviciu): Definiții, Servicii (caziere /
stare civilă / cadastru ANCPI-OCPI / firme ONRC / rovinietă), Proces comandă, Prețuri+plată,
Termene, **Anulare/rambursare** (30 min, 70%, doar servicii eligibile), Semnătură electronică
(eIDAS + Legea 214/2024), Contract + **onorariu avocat 15 RON ȘI onorariu topograf 15 RON**,
Obligații, GDPR, Limitarea răspunderii, Proprietate intelectuală, Litigii (ANPC/SOL), Contact.
+ BreadcrumbList schema. Date firmă: eDigitalizare SRL, CUI RO49278701.
> A se trece printr-o verificare juridică înainte de go-live.

## Anulare 30 min — configurabilă per serviciu
Înainte: self-cancel-ul (30 min, 70%) era activ pe ORICE comandă plătită. Acum e per serviciu:
- **Flag** `processing_config.allow_self_cancel` (migrare 089). Default ON; OFF pe serviciile
  instant-automate (extras-carte-funciara, certificat-constatator) — nu există fereastră de anulare.
- **Admin** `/admin/settings → Servicii → Edit`: toggle „Anulare 30 min de către client".
- **Client** `/comanda/status`: cardul de anulare apare DOAR dacă serviciul e eligibil
  (`selfCancelAllowed` din API) + în fereastra de 30 min.
- **Server**: ruta `/api/orders/cancel` respinge anularea dacă serviciul nu e eligibil (enforcement).
- T&C reflectă: anularea se aplică „serviciilor eligibile".

## Verificat
Build OK, lint curat, 1100 teste verzi. Migrare 089 aplicată (28 servicii: 26 ON, 2 OFF).
