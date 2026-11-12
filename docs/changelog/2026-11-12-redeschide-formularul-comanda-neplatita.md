# 12.11.2026 — „Redeschide formularul” pe comenzile trimise și neplătite
<!-- categorie: comenzi -->

## Pentru echipă

Când clientul apasă „Plătește” și nu plătește, formularul lui se închide: nu
mai poate merge înapoi, iar „Copiază link continuare” dădea doar linkul de
plată. Dacă uitase o opțiune (traducere, legalizare, apostilă), nu aveați cum
să o adăugați înainte de plată.

Acum, pe bannerul galben „Comandă neterminată”, la comenzile **În așteptare**
și **Abandonate** aveți butonul **„Redeschide formularul (schimbă opțiuni)”**:

- comanda revine pe **Ciornă** și linkul de continuare (48 de ore) se copiază singur;
- trimiteți linkul clientului sau îl deschideți voi; mergeți înapoi la opțiuni și bifați ce lipsea;
- clientul semnează și apasă din nou „Plătește”; prețul se recalculează;
- nu mai trimiteți linkul de plată vechi: pe el clientul ar plăti suma veche, fără opțiunile noi. Dacă se întâmplă, le adăugați după plată cu „Modifică comandă”.

Butonul nu apare la comenzile plătite (acolo folosiți „Modifică comandă”), la
cele cu transfer bancar în așteptare și la comenzile telefonice.

Tot de azi, linkurile copiate din pagina comenzii (plată, status) se deschid
pe site-ul de pe care a venit comanda: documentero.ro pentru comenzile
documentero, nu eghiseul.ro.

În capul paginii comenzii apare acum **„Site: documentero.ro”** sau **„Site:
eghiseul.ro”**: site-ul pe care a comandat clientul. Adminul e același pentru
ambele, deci până acum nu se vedea. Linkurile se fac singure pe site-ul
comenzii; nu alegeți voi.

Procedura: [Client blocat](../admin/ghid-echipa-ajutare-client-blocat.md).

---

## Tehnic

**Cauza (E-261111-EMRB4, documentero, certificat de celibat).** `/submit` trece
comanda pe `pending`; de acolo wizardul, `GET/POST/PATCH /api/orders/draft` și
`resume-link` servesc doar `status = 'draft'`, iar `modify` cere
`payment_status = 'paid'`. O comandă trimisă și neplătită nu avea nicio cale de
schimbare a opțiunilor.

**Ce s-a livrat**

- `src/lib/orders/reopen-draft.ts`: `reopenRefusal()` (reguli) și
  `reopenOrderAsDraft()`: `status → draft`, `submitted_at` și
  `contract_signed_at` golite, `stripe_checkout_session_id` golit după
  `checkout.sessions.expire` (best-effort), token de continuare nou (48h),
  rând `admin_action` în `order_history`. Scrierea e condiționată de
  `status in (pending, abandoned)`, `payment_status != paid`, `paid_at is null`:
  o plată sosită între citire și scriere câștigă.
- `POST /api/admin/orders/[id]/reopen-draft` (`orders.manage`).
- Buton în `StuckClientBanner` (pagina comenzii din admin).
- Teste: `tests/unit/lib/orders/reopen-draft.test.ts`.

Rândurile `contract_prestari` / `conventie` din `order_documents` se șterg la
redeschidere: `/submit` inserează unul nou la a doua trimitere (altfel comanda
ar avea două contracte). Tot atunci recalculează prețul pe server și
suprascrie `signature_metadata`.

**Limită cunoscută:** `/comanda/checkout/<id>` și `/api/orders/[id]/payment` nu
verifică statusul, doar `payment_status`. O ciornă redeschisă poate fi încă
plătită pe linkul de checkout vechi, la totalul vechi. Sesiunea Stripe deja
deschisă e expirată, dar pagina creează alta la fiecare vizită.

**Comanda de la care a pornit** a fost redeschisă pe 12.11 cu aceeași funcție,
rulată local. Sesiunea Stripe veche nu a putut fi expirată de acolo (cheia
locală e de test); expiră singură.

**Linkuri pe brandul comenzii (reparat în aceeași zi).** „Copiază link
continuare” pe comenzile trimise și „Copiază linkul de status” construiau
linkul din `window.location.origin` (adminul rulează pe eghiseul.ro), deci o
comandă documentero primea link pe eghiseul.ro. Acum folosesc
`appBaseForOrder(order)`.

Cronul `auto-abandon` (număra de la `created_at`) a fost reparat în aceeași zi:
[auto-abandon de la trimitere](2026-11-12-auto-abandon-de-la-trimitere.md).
