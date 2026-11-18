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
- `src/lib/analytics/offline-conversions.ts` (nou): `adClickOf()` alege clicul plătit al comenzii (și pentru comenzile vechi, din `first` / `last`); `googleOfflineRows()` și `buildGoogleOfflineCsv()` construiesc fișierul după modelul Google „conversii din clicuri” (antetul nu a fost comparat cu șablonul descărcat din cont; de făcut la prima încărcare), cu fusul orar `Europe/Bucharest` și numărul comenzii ca `Order ID`. Identificatorii de test sunt respinși.
- `POST /api/orders/[id]/ads-conversion` (nou): pagina de succes o apelează imediat după ce eticheta a trimis conversia; ruta scrie `attribution.ads_tag_sent_at`, o singură dată, doar pe comenzi plătite. Apelul pleacă doar cu acord de marketing (`adsTagReportsSale()`): funcția `gtag` există și după un refuz, dar atunci conversia nu ajunge la Google. Așa exportul nu trimite a doua oară o vânzare pe care Google o are deja.
- `GET /api/admin/marketing/offline-conversions?platform=…&days=…` (nou, `settings.manage`): JSON cu rândurile, sau `format=csv&name=<acțiunea de conversie>` pentru fișier. `platform` e obligatoriu, fiindcă fiecare site are contul lui de Google Ads.
- Admin: cardul din `/admin/marketing` și rândul „Clic pe reclamă” din pagina comenzii.
- Teste: `offline-conversions.test.ts` (7), două cazuri noi în `attribution-capture.test.ts`.

## Verificat în cont și în documentația Google, 18.11 (după-amiaza)

- **Antetul fișierului** corespunde paginii de ajutor Google: `Google Click ID`, `Conversion Name`, `Conversion Time`, `Conversion Value`, `Conversion Currency`, `Order ID`, rândul `Parameters:TimeZone=…` și formatul de oră `yyyy-MM-dd HH:mm:ss`. Am adăugat coloanele `Ad User Data` și `Ad Personalization`, cu `Granted` doar pentru cumpărătorii care au acceptat cookie-urile de marketing și `Denied` pentru ceilalți.
- **Încărcarea s-a mutat.** Pagina „Încărcări” din cont trimite acum la „Managerul de date”; sursele sunt Google Sheets sau un fișier de la o adresă, nu un fișier încărcat de mână. Conținutul fișierului nostru se lipește într-o foaie Google.
- **Blocaj de conformitate.** La adăugarea sursei de date offline, Google cere bifa „Aceste date au fost colectate și sunt trimise la Google în conformitate cu Politica Google privind consimțământul utilizatorilor din UE”. Pentru cumpărătorii care nu au acceptat cookie-urile de marketing, bifa nu ar fi adevărată. Am oprit crearea acțiunii de conversie înainte de bifă; în cont nu s-a salvat nimic.
- **Ce face Google cu rândurile `Denied`** la conversiile din clicuri nu e scris în documentație.

Concluzie: încărcarea offline nu e o cale curată de a raporta vânzările celor care refuză cookie-urile. Cumpărătorii care acceptă sunt deja raportați de etichetă. Cardul rămâne util ca evidență proprie: arată câte vânzări a adus reclama în total, inclusiv cele pe care Google nu le vede.

## Dacă Raul hotărăște totuși să încarce

1. Acțiunea de conversie se creează din Obiective → Rezumat → „Creați o acțiune de conversie” → „Conversii offline”; bifa de conformitate o pune Raul. Numele ei se scrie în card, identic. După creare se așteaptă 4–6 ore.
2. Fișierul conține doar clicuri `gclid`. Clicurile `gbraid` / `wbraid` apar în tabelul din card, dar au alt format.
3. Comenzile plătite înainte de 18.11 nu au marcajul „raportată de etichetă”, deci apar toate ca neraportate.
