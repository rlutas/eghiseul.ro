# 18.11.2026 — Comenzile venite din reclamă apăreau ca „Căutare organică”
<!-- categorie: clienti -->

## Pentru echipă

În pagina comenzii și în raportul de marketing, canalul „Google Ads” apărea greșit ca „Căutare organică” la clienții care dădeau clic pe reclamă și apoi treceau pe formularul de comandă. De aceea părea că reclama nu aduce nimic, iar site-ul nou de constatator părea să aibă trafic organic pe care nu îl are.

De azi canalul e corect, inclusiv pe comenzile deja salvate (E-261116-4VKDT și E-261117-TCLAS apar acum la Google Ads). Nu aveți nimic de făcut.

Ce arată cifrele corectate pe certificat-constatator-express.ro, 11–17.11: 61 de clicuri plătite (328 lei), două comenzi începute din reclamă, niciuna plătită. Singura comandă plătită de pe site e cea de test din 16.11. Reclama de cazier fiscal (cazierfiscal.com) e încă pe pauză, deci nu a adus nimic.

---

## Cauza

`captureAttribution()` rulează la fiecare schimbare de rută. `document.referrer` aparține documentului și nu se schimbă la navigarea în interiorul site-ului. Vizitatorul venit din reclamă avea la aterizare `gclid` și referrer `google.com`; pe pagina următoare URL-ul nu mai avea `gclid`, dar referrerul era același, deci atingerea părea o vizită nouă din Google și înlocuia `last`. `classifyAttribution()` citește întâi `last`, așa că rezultatul era `organic_search`.

## Ce am schimbat

- `src/lib/analytics/attribution.ts`: referrerul documentului se citește o singură dată pe document (`referrerConsumed`). Navigările ulterioare din același tab nu mai produc o atingere cu sursă.
- `src/lib/analytics/attribution-channel.ts`: `isEchoOfPaidClick()`. Dacă `last` are doar referrer de motor de căutare, iar `first` e un clic plătit pe același motor cu cel mult 7 zile înainte, canalul rămâne cel plătit. Asta corectează la citire comenzile salvate înainte de reparație.
- Teste: `tests/unit/lib/analytics/attribution-capture.test.ts` (3, nou), 5 cazuri noi în `attribution-channel.test.ts`.

Raportul de marketing și pagina comenzii clasifică la citire, deci nu a fost nevoie de modificări în baza de date.

## De făcut separat

- Același tipar de captură există în repo-ul cazierjudiciaronline.com (`src/lib/analytics/attribution-capture.ts`), iar clasificatorul e o copie a celui de aici. Neportat în această sesiune.
- Verificarea completă a reclamelor: [`../ads/2026-11-12-google-ads-jurnal-incercari.md`](../ads/2026-11-12-google-ads-jurnal-incercari.md), secțiunea din 18.11.
