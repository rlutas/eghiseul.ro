# documentero.ro — dosarul site-ului

Al doilea brand al eDigitalizare: doar acte de stare civilă (naștere, căsătorie,
celibat, extrase multilingve), obținute prin avocat și livrate prin curier.
Servit de același repo, același deploy Vercel, aceeași bază de date și același
admin ca eghiseul.ro. Aici stă tot ce ține de el: de ce există, cum e legat
tehnic, cum arată, ce conținut are și ce mai e de făcut până la lansare.

| Întrebare | Document |
|---|---|
| De ce un al doilea site și de ce documentero.ro | [`../seo/2026-09-19-site-satelit-stare-civila.md`](../seo/2026-09-19-site-satelit-stare-civila.md) |
| Cum e legat tehnic (rutare pe host, `orders.platform`, grupuri de rute, brand pe comandă) | [`../technical/specs/multi-brand.md`](../technical/specs/multi-brand.md) |
| Design: paletă, logo, tipografie, componente, canvasul cu machetele | [`design.md`](design.md) |
| Conținut și SEO: ce pagină pe ce cuvinte, titluri, linking, sitemap, cadență | [`continut-si-seo.md`](continut-si-seo.md) |
| Formularul de comandă: pașii, ce diferă față de eghiseul, ce rămâne comun | [`formular.md`](formular.md) |
| Lansare: ce lipsește, în ordine, cine face | [`lansare.md`](lansare.md) |
| Prompturile pentru pozele care lipsesc (le generează Raul) | [`prompturi-poze.md`](prompturi-poze.md) |

## Stare (19.09.2026, seara)

- Fundația tehnică e pe `main` (rutare, brand, migrarea 181, emailuri, admin,
  registrul `003`). `documentero.ro` e live cu DNS pe Vercel, HTTPS, favicon
  propriu; toate paginile sunt încă `noindex` (`DOCUMENTERO_INDEXABLE`).
- Paginile publice sunt implementate: acasă (hub cu toate actele), naștere,
  căsătorie, celibat, extras multilingv, ghiduri + primul ghid, despre, contact.
  Header cu mega-meniu „Servicii”, footer cu ANPC, recenzii Google reale cu
  poze, animații light, ritm de spațiere unificat.
- Comanda de test `E-260919-ADXE7` a trecut wizardul și e în checkout
  (`pending`, `platform='documentero'`); plata și verificările de după plată
  sunt la Raul (vezi [`lansare.md`](lansare.md)).
- Nu e lansat. Lista de blocaje, bifată: [`lansare.md`](lansare.md).
  Jurnal: [`../changelog/`](../changelog/README.md) (intrările din 19.09).

## Reguli scurte

- Conținutul se scrie de la zero, nu se adaptează din eghiseul. Testul de
  similaritate din `.claude/rules/content-and-seo.md` §1 se aplică și între
  paginile documentero și surorile lor de pe eghiseul.
- O pagină intră în `src/config/documentero-sitemap.ts` doar când e gata.
  Maximum 1–2 pagini publice noi pe săptămână.
- Zero pagini pe orașe sau județe. Sub-intenții, nu localități.
- Nicio poză generată nu reprezintă o persoană reală din echipă. Pozele echipei,
  avocatei și autorului sunt fotografii reale sau nu sunt deloc.
- Fără redirect spre eghiseul pentru comandă: wizardul, plata și statusul stau
  pe documentero.ro. Legătura cu eghiseul e declarată în footer și în „Despre”.
