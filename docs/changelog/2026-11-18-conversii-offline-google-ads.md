# 18.11.2026 — Clicul pe reclamă rămâne pe comandă; conversii Google Ads de încărcat manual
<!-- categorie: clienti -->

## Pentru echipă

Pe pagina comenzii, la „Proveniență client”, apare de acum un rând nou când clientul a venit dintr-o reclamă: „Clic pe reclamă: Google Ads”. La comenzile plătite scrie și dacă Google a aflat de vânzare („conversie raportată de etichetă”) sau nu („conversie neraportată”). A doua situație apare când clientul nu a acceptat cookie-urile de marketing.

Pentru Raul, în Marketing e un card nou, „Conversii Google Ads de încărcat”. Alegi site-ul, vezi comenzile plătite venite din reclamă și descarci fișierul cu cele neraportate. Fișierul se încarcă în contul Google Ads al acelui site, la Obiective → Conversii → Încărcări. Echipa de comenzi nu are nimic de făcut.

---

## De ce

Eticheta Google Ads se încarcă doar după acordul de cookie-uri. Pe certificat-constatator-express.ro, între 11 și 17.11, au fost 45 de clicuri plătite de pe telefoane și doar 15 sesiuni măsurate. O comandă plătită de cineva care ignoră bannerul nu ajunge la Google, deci campania nu poate învăța din ea.

## Ce am schimbat

- `src/lib/analytics/attribution.ts`: câmp nou `ad_click` (id, parametru, platformă, pagină de aterizare, oră), scris la fiecare clic plătit Google sau Microsoft. Nu e înlocuit de o vizită ulterioară din email sau din căutare, cum se întâmplă cu `last`.
- `src/lib/analytics/offline-conversions.ts` (nou): `adClickOf()` alege clicul plătit al comenzii (și pentru comenzile vechi, din `first` / `last`); `googleOfflineRows()` și `buildGoogleOfflineCsv()` construiesc fișierul în formatul Google „conversii din clicuri”, cu fusul orar `Europe/Bucharest` și numărul comenzii ca `Order ID`. Identificatorii de test sunt respinși.
- `POST /api/orders/[id]/ads-conversion` (nou): pagina de succes o apelează imediat după ce eticheta a trimis conversia; ruta scrie `attribution.ads_tag_sent_at`, o singură dată, doar pe comenzi plătite. Așa exportul nu trimite a doua oară o vânzare pe care Google o are deja.
- `GET /api/admin/marketing/offline-conversions?platform=…&days=…` (nou, `settings.manage`): JSON cu rândurile, sau `format=csv&name=<acțiunea de conversie>` pentru fișier. `platform` e obligatoriu, fiindcă fiecare site are contul lui de Google Ads.
- Admin: cardul din `/admin/marketing` și rândul „Clic pe reclamă” din pagina comenzii.
- Teste: `offline-conversions.test.ts` (7), două cazuri noi în `attribution-capture.test.ts`.

## Înainte de prima încărcare

1. În contul Google Ads al site-ului trebuie creată o acțiune de conversie de tip „Import → conversii din clicuri”. Numele ei se scrie în card, identic. Nu se poate încărca în acțiunea „Purchase” existentă, care e de tip site web.
2. Fișierul conține doar clicuri `gclid`. Clicurile `gbraid` / `wbraid` (iPhone, fără acord de urmărire) apar în tabelul din card, dar au alt format de încărcare; se tratează separat dacă apar.
3. Comenzile plătite înainte de 18.11 nu au marcajul „raportată de etichetă”, deci apar toate ca neraportate. Pentru ele se verifică de mână în cont înainte de încărcare.
4. Încărcarea trimite la Google identificatorul de clic al unui client care nu și-a dat acordul în banner. Decizia de a o face aparține lui Raul.
