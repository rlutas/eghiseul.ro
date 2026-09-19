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

## Stare (19.09.2026)

- Fundația tehnică e pe `main` din 19.09 (rutare, brand, migrarea 181, emailuri,
  admin). `documentero.ro` răspunde cu placeholder `noindex` până se scriu paginile.
- Designul e complet în canvas (12 artboard-uri): acasă, trei pagini de serviciu,
  formular (3 ecrane + mobil), ghiduri, ghid, despre, contact, mobil, logo.
  Paleta C1 și logo-ul „d cu colț îndoit” sunt alese de Raul.
- Nu e lansat. Lista de blocaje: [`lansare.md`](lansare.md).

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
