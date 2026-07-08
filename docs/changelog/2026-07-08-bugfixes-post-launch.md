# 2026-07-08 — Bugfix-uri post-lansare (raportate de echipă) + Extras Multilingv standalone

Prima zi întreagă LIVE. Bugurile au venit din utilizare reală (echipă + clienți).
Fiecare secțiune: **ce era stricat → ce s-a făcut → ce rămâne de verificat**.

---

## 1. 🔴 Facturile nu se emiteau pe comenzile plătite

- **Stricat:** comenzile reale plătite (mariacercel 376.50) rămâneau fără factură.
  Trei piste false (webhook secret, seria Oblio, semnătura) — toate erau corecte.
- **Cauza reală:** kill-switch-ul `admin_settings.invoicing.oblio_enabled=false`,
  rămas OPRIT de la testare. `ensureInvoiceForPaidOrder` ieșea cu `status:'disabled'`.
- **Făcut:** pornit cu acordul userului → backfill → **EGH-0001** emisă (prima
  factură reală pe seria nouă). Confirmate apoi automat EGH-0003, EGH-0004 fără
  nicio intervenție.
- **De verificat:** nimic — pipeline-ul se auto-confirmă la fiecare comandă nouă.
  ⚠️ La debugging viitor de facturi: verifică ÎNTÂI kill-switch-ul (Admin → Setări → Plăți).

## 2. 🔴 Notele echipă nu se salvau, apoi nu se afișau

- **Stricat:** „Adaugă notă" → eroare `invalid input syntax for type uuid`; după
  fix-ul de salvare, notele tot nu apăreau („nu se întâmplă nimic").
- **Cauza:** (a) `order_history.changed_by` era `uuid` FK dar tot ecosistemul
  scrie/afișează text (email, `system-cron`); (b) GET-ul comenzii selecta coloane
  INEXISTENTE `from_status/to_status` → query-ul de istoric pica silențios →
  timeline + note nu se randau NICIODATĂ; (c) ruta `/status` insera în aceleași
  coloane inexistente → schimbările de status nu se logau.
- **Făcut:** migrarea **094** (`changed_by` → text); GET + `/status` folosesc
  `old_value/new_value` (jsonb) cu derivare `from/to_status` pt. UI. Testat în
  browser: notă salvată + afișată; status `processing→la_tradus` logat cu autor+notă.
- **De verificat:** —

## 3. 🔴 Client cazier fiscal a trecut FĂRĂ selfie (bypass KYC)

- **Stricat:** `E-260708-AJ5M8` a ajuns la checkout doar cu `ci_front`, fără
  selfie, deși `selfieRequired: true`.
- **Cauza:** validarea documentelor era DOAR client-side; linkuri directe de
  checkout / resume / back-navigation ocoleau pasul KYC.
- **Făcut:** guard server-side în `POST /api/orders/[id]/submit`: act de
  identitate (scan sau manual față+spate) + selfie unde e cerut; străini:
  pașaport + selfie + permis rezidență. Bypass legitim doar pt. cont cu KYC
  verificat. Fail-open DOAR pe erori de infrastructură.
- **De verificat:** dacă AJ5M8 plătește → echipa folosește „Cere poză nouă
  (selfie)" din comanda ei. Test end-to-end al guard-ului la următoarea comandă reală.

## 4. 🔴 Butonul „Marchează documente generate" era mort

- **Stricat:** acțiunea `mark_documents_generated` din UI nu exista în
  `ACTION_STATUS_MAP` (API știa doar `generate_cerere`) → 400, pasul blocat.
- **Făcut:** alias adăugat în `/process`.
- **De verificat:** click real pe buton la o comandă în `processing`.

## 5. Identificare imobil: datele nu apăreau + nume N/A

- **Stricat:** comenzile reale (F2TN7, XKS8C) aveau totul în
  `customer_data.property` dar NIMIC nu se afișa în admin (echipa nu putea face
  identificarea); numele apărea N/A (există doar la facturare pt. serviciile fără
  pas KYC personal).
- **Făcut:** card nou **„Date imobil"** (județ/localitate/adresă/proprietar/CF/
  motiv, fallback pt. chei noi); `getCustomerName`/`getCustomerDisplayName` cad
  acum pe `billing.firstName/lastName/name`.
- **De verificat:** vizual pe F2TN7 după deploy (card + nume în listă).

## 6. Date stare civilă invizibile în admin

- **Stricat:** istoric căsătorie (căsătorită anterior, divorț, nume la naștere,
  părinți, scop) stocat dar nerandat nicăieri.
- **Făcut:** card **„Date stare civilă"** pe detaliu (labeluri RO + fallback).
  Verificat pe comanda annushka.

## 7. Comanda annushka (import WP) — completată integral

- **Făcut:** toate datele mapate din `wp_import.raw_fields` → personal (CNP,
  născută 17.07.1984), civil_status complet, facturare PF Italia, livrare DHL
  internațional 250 RON + `delivery_address` (coloană); actul + selfie + semnătura
  descărcate de pe hostul WP vechi → **S3** → atașate comenzii.
- **De verificat:** factura ei se emite pe partea WP (a plătit acolo, 1049).

## 8. Livrare internațională (DHL) — operațional pt. echipă

- **Făcut:** adresa de livrare afișează acum și țara/destinatar/telefon + buton
  **„Copiază adresa"** (etichetă format internațional: nume / stradă / cod+oraș /
  regiune / țară / telefon). **„Generează AWB" apare doar la Fan/Sameday** —
  la DHL & alți curieri: notă „AWB manual" (integrare API doar Fan/Sameday).
- **De verificat:** primul AWB DHL făcut manual de echipă cu adresa copiată.

## 9. Butonul WhatsApp apărea în admin

- **Făcut:** `WhatsAppFloat` ascuns pe `/admin/*` + `/colaborator/*`.

## 10. 🟣 Extras Multilingv — servicii standalone (paritate WP)

- **Problema:** paginile multilingv nu aveau NICIUN buton de comandă; pe WP era
  produs separat la **799** (formular propriu) — pe site-ul nou era doar add-on
  (+399 peste 998 = 1397, model diferit și mai scump).
- **Făcut:** migrarea **096** — 2 servicii standalone
  (`extras-multilingv-certificat-nastere/-casatorie`, 799 RON, fără urgență,
  config verificare/procesare clonat de la serviciul-părinte → wizard complet
  funcțional imediat: KYC + date stare civilă + livrare). Pagini: CTA în hero +
  box „Cum comanzi" (3 pași), copy actualizat la 799; slug-urile adăugate în
  `DB_SLUGS_WITH_HARDCODED_PAGE` (anti-duplicare SEO). `/comanda/…` verificat 200.
- **De verificat:** o comandă de test cap-coadă pe noul wizard; eventual
  specimen/imagine dedicată.
- **Decizie (user, 08.07):** add-on-ul `extras_multilingv` (+399) RĂMÂNE pe
  certificat naștere/căsătorie — două căi valide: cumperi certificatul + extrasul
  ca add-on (997+399) SAU doar extrasul standalone (799).

## Alte îmbunătățiri din aceeași zi

- Newsletter GDPR complet (migrarea 095; opt-in + unsubscribe token + Admin →
  Marketing + CSV) — testat E2E live.
- T&C extins la 18 secțiuni cu conținutul operațional de pe WP.
- Status-uri granulare add-on (093): La traducere / La legalizare / Apostilă
  Notari / Apostilă Haga — dropdown + badge-uri + chips Stadiu pe listă.
- Coloană note (icon+contor, ca sora) + search după nume/telefon + link-uri
  Stripe în Plata + Note Echipă sus + Procesare jos (paritate layout).

## 11. Cazier fiscal — termen 1-3 + fără prelungire pentru străini (migrarea 098)

- **Semnalat de echipă:** pagina afișa „2-4 zile lucrătoare" (real: 1-3) și
  wizard-ul spunea că cetățenii străini au „procesare 7-15 zile" — NEVALABIL la
  fiscal (ANAF nu prelungește).
- **Făcut:** migrarea 098 — `estimated_days_display` → „1-3 zile lucrătoare",
  `extraDays` foreign/european → 0 la cazier-fiscal. Textul de la bifă
  („Sunt cetățean străin") din wizard e acum **condiționat de config**
  (`citizenshipFlows.*.extraDays`): dacă extraDays=0 nu mai apare nicio
  mențiune de prelungire; dacă >0 afișează valoarea reală per serviciu
  (nu mai e hardcodat 7-15 pt. toate). T&C §6 corectat (fiscal exceptat de
  la prelungirea de 15 zile).
- **De verificat:** wizard cazier fiscal cu bifa de străin (fără mențiune de
  prelungire) + pagina serviciului afișează 1-3.

## 12. Copy Sheet 1/2 + Motivul în admin (registrul manual al avocatei)

- **Făcut:** butoane „Copy Sheet 1" (clienți: Nume/Email/CNP-CUI/Serviciu/
  Link/Preț) + „Copy Sheet 2" (instituții: Nume/Email/Preț/Serviciu/-/
  Instituție/Motiv) pe cardul Date personale din detaliul comenzii — TSV
  gata de paste în coloana D din Google Sheets (paritate cazierjudiciaronline;
  soluție temporară până la registrul cross-platform). Preț = bază+urgență,
  instituția dedusă din slug (ANAF/IPJ/Stare civilă). „Motivul solicitarii"
  afișat și în cardul Serviciu și opțiuni.

## 13. Multilingv — pagini full-service + email confirmare comenzi

- Pagini extras-multilingv rebuild complet ca pagini de serviciu (hero preț
  DB 798, pachet +498, FAQ 8, JSON-LD 2 Offers) + internal linking
  bidirecțional cu certificat naștere/căsătorie/celibat/blog.
- Email de confirmare către client la TOATE comenzile plătite (buton
  „Verifică statusul" pre-completat) — o dată per comandă, migrarea 097.

## 14. 🎨 Reorganizare completă pagina de comandă din admin (după feedback echipă)

Layout nou, în ordinea fluxului de lucru (paritate + îmbunătățiri față de sora):

- **Header:** nr comandă → status → Persoana Fizică/Juridică → „Vezi ca
  clientul ↗" → buton „📋 Link status" (copiază URL-ul de urmărire
  pre-completat cu order+email — cardul mare de link a fost eliminat, ocupa
  loc). **Termen estimat** afișat portocaliu sus, sub numărul comenzii.
- **Note Echipă (50%) + Actualizează Status (50%)** — sus, pe aceeași linie,
  fără scroll. Note Echipă arată DOAR notele adăugate manual (cele de status
  rămân în Istoric — nu se mai dublează).
- **Informatii Client** — un singur card (contact + date personale fuzionate):
  Tip persoana primul rând, **Copy Sheet 1/2 sub titlu**, apoi toate datele.
  🆕 **„Corectează contact"** — echipa poate corecta telefonul/emailul greșit
  al clientului direct din card (formular inline; modificarea se scrie automat
  ca notă de audit „vechi → nou").
- **Detalii Serviciu** — Urgenta (⚡/Standard) + Metoda livrare sus, apoi
  „SERVICII COMANDATE" cu Motivul solicitării; sub el **Livrare** apoi
  **Facturare** (mutat din rândul de jos — umplea golul).
- **Contract semnat (50%) + Plata (50%)** — aceeași linie.
- **Procesare comanda** (butoane workflow + documente generate) →
  **deasupra Istoricului**; **Istoric comandă = ultimul**.

## 15. Feedback echipă (10:23-10:35) — reparat imediat

- **„Depus la instituție" rămâne în tab-ul În procesare** — grupul include
  acum TOATE statusurile active (regula: cât mai e vreo acțiune pe comandă,
  stă în În procesare): depus, document primit, extras în lucru, la
  traducere/legalizare/apostile, KYC, gata de expediere.
- **Generarea împuternicirii/cererii nu mai „dă refresh"** — fetchOrder are
  mod silent: acțiunile inline reîmprospătează datele fără să arunce pagina
  pe spinner (care te trimitea înapoi sus).

## 16. 🚨 INCIDENT: workerii ONRC + ANCPI morți ~19h (rezolvat)

- **Simptom:** constatator plătit (E-260708-QFVFY) stătea PENDING, nepreluat.
  Heartbeat-urile ambilor workeri opriseră pe 07.07 ~17:00.
- **Cauza:** workerii aveau în Railway `SOURCE_API_URL=https://eghiseul-ro.vercel.app`
  (singura adresă a app-ului când au fost construiți, în iunie). La lansare,
  vercel.app a fost pus pe **preview + SSO** (corect, anti-indexare) → SSO
  blochează și API-ul → workerii primeau login wall în loc de joburi.
  NU au fost de vină headerele de securitate sau RLS-ul.
- **Fix:** `railway variables --set SOURCE_API_URL=https://eghiseul.ro` la
  AMBII workeri (onrc + ancpi) → restart automat → jobul preluat și livrat
  cap-coadă în ~10 min (RC 2714634, comandă completed, PDF la client).
  ANCPI: zero joburi afectate (nu au intrat comenzi CF în fereastra moartă).
- **Lecție (debugging viitor):** joburi ONRC/ANCPI care stau PENDING →
  verifică ÎNTÂI `system_heartbeats`. Workerii depind de domeniul PUBLIC
  (eghiseul.ro) — orice protecție pusă pe URL-ul din `SOURCE_API_URL` îi omoară.
- **De făcut (propus):** alertă automată în cron-ul de health-check când un
  heartbeat tace >10 min.

## 17. UX admin: buton Reîncarcă pe Cozi ONRC/ANCPI

- Soft refresh (`router.refresh()`) — reîmprospătează statusul joburilor fără
  reload complet de pagină; echipa nu pierde poziția.

## 18. 🚨 Cazier PJ: comandă fără buletin administrator + selfie (E-260708-VC4GH)

- **Simptom:** E-260708-VC4GH (BLU IT SECURITY SRL, cazier PJ, plătit urgent)
  a finalizat wizard-ul doar cu certificat de înmatriculare + semnătură —
  fără CI-ul administratorului și fără selfie.
- **NU e bypass de client** (diferit de E-260708-AJ5M8 de dimineață): serviciul
  `cazier-judiciar-persoana-juridica` avea în DB
  `verification_config.personalKyc.enabled=false` + `acceptedDocuments=[]` →
  wizard-ul nu construia deloc pașii Date Personale / Documente KYC, iar
  guard-ul server-side din `/submit` (commit 7192d5e, gate pe
  `personalKyc.enabled`) sărea complet peste comandă.
- **Regresie de config nedocumentată:** migrarea 012 (design original) avea
  personalKyc ACTIV pe PJ (CI + selfie reprezentant); a fost dezactivat direct
  în DB înainte de 2026-05-28 (migrarea 046 îl nota deja ca disabled), fără
  migrare. Legacy `config.kyc_requirements` încă cerea
  `representative_id + selfie = true`.
- **Fix (migrarea 100, data-only, aplicată direct — fără deploy):** re-enable
  `personalKyc` pe PJ cu fluxul simplificat (ca la cazier-auto: selfie
  obligatoriu, fără date părinți, fără certificat adresă). Verificat live:
  wizard-ul PJ are acum 9 pași, cu **Date Personale (4)** și
  **Documente KYC (6)**; guard-ul din `/submit` se aplică automat.
- **Ops:** clientul E-260708-VC4GH (adrian.bucur@bluit.ro / +40747064855)
  trebuie contactat pentru buletinul administratorului + selfie.

## Rămase în coadă (nefăcute)

- Email confirmare comandă către client (nu se trimite — port din sister).
- Registru numere cross-platform (ecazier + cazierjudiciaronline din registrul
  eghiseul) — design + API.
- Rotire `sk_live` (expusă în chat) + storno facturi test Oblio (CID-0002).
- Import restul comenzilor WP plătite din tranziție.
- Opt-in newsletter în wizard; preselect add-on prin URL.
