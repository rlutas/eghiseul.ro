# 03.11.2026 — De ce scad comenzile din octombrie: diagnostic și urmărire săptămânală
<!-- categorie: seo -->

## Pentru echipă

- Comenzile scad lună de lună: august 320, septembrie 202, octombrie 150. Începutul lui noiembrie e mai slab decât sfârșitul lui octombrie. Pe cazierjudiciaronline.com n-a intrat nicio comandă plătită între 30.10 și 02.11. Site-ul merge.
- Cauza: din 16–19 octombrie vin mult mai puțini oameni din Google, cu −68% pe cazierjudiciaronline.com și −44% pe eghiseul.
- La căutările de cazier, Google arată acum sus serviciul GRATUIT de la MAI, iar concurenții (infocazier, caziere.ro, roghiseul, obtinecazier) au reclame deasupra noastră. Noi încă nu avem voie la reclame pe caziere.
- Ce facem: insistăm la Google pentru reclame, schimbăm titlurile paginilor de oraș ca să spună cui îi folosim (cei din străinătate, fără card românesc, cu apostilă sau traducere), testăm reclame pe Bing.
- Urmărim în fiecare luni comenzile și traficul din săptămâna trecută. Dacă un client vă spune că a încercat pe site-ul MAI și nu a mers, notați de ce: e exact argumentul nostru.

---

## Tehnic

- Doc: [`docs/seo/2026-11-03-cadere-mijloc-octombrie-urmarire.md`](../seo/2026-11-03-cadere-mijloc-octombrie-urmarire.md): cifre GSC (zile lucrătoare 5–9.10 față de 26–30.10), pagini de oraș CJO, SERP `pws=0` pe 6 interogări, plan în 4 puncte, tabel de urmărire săptămânală cu praguri de revenire și de alarmă.
- Comenzile plătite (fără `is_test`, fără cancelled/refunded) pe zi, în fusul `Europe/Bucharest`, din ambele baze. Atenție: `::date` din `pg` vine ca `Date` la miezul nopții local și `toISOString()` îl mută cu o zi; se citește `::date::text`.
