# Admin Orders List — paritate cu cazierjudiciaronline.com

**Data:** 2026-07-07
**Scop:** Lista de comenzi din `/admin/orders` a fost aliniată la admin-ul de pe
`cazierjudiciaronline.com` (sister project) pentru ca echipa operațională
(obișnuită cu acel layout) să lucreze la fel pe ambele platforme.

> Referință: `/Users/raul/Projects/cazierjudiciaronline.com` (single-tenant,
> cazier-only). Filtrele de „Stadiu" au fost **adaptate**, nu copiate — eghiseul
> e multi-serviciu cu alt model de status-uri.

---

## Ce s-a adăugat

### Tab-uri status (neschimbate)
`Toate · Plătite · În procesare · Expediate · Finalizate · Neplătite` (cu contoare).
`Neplătite` = draft + pending + abandoned (include plățile eșuate — vizibile pt. follow-up).

### Chips „Filtre rapide" (cross-status)
| Chip | Filtru | Ancoră |
|------|--------|--------|
| **Expirate** (roșu) | `estimated_completion_date < now` + status activ | termen depășit |
| **Deadline < 48h** (galben) | termen în următoarele 48h + status activ | termen apropiat |
| **Cu cupon** | `coupon_code IS NOT NULL` | comenzi cu reducere |

### Chips „Stadiu" (pipeline eghiseul, exclusive)
`Documente generate` (`documents_generated`) · `Depus la instituție`
(`submitted_to_institution`) · `Document primit` (`document_received`) ·
`Gata de livrare` (`document_ready`).

### Coloane noi / modificate
- **Termen** — `estimated_completion_date` cu cod de culoare (roșu=expirat,
  galben=<48h) + „în Xz" / „expirat de Xz".
- **Badge „⚠ Fără factură"** — pe comenzi `payment_status=paid` fără
  `invoice_number` (semnal operațional critic).
- **Icon cupon** (Ticket) pe coloana Total când există `coupon_code`.
- **Indicator note echipă** (StickyNote) pe nr. comandă când există `admin_notes`.
- **Coloană Acțiuni** — buton **„Detalii"** (quick-view dialog).

### Dialog „Detalii" (preview comandă)
Deschis din butonul Detalii (fără să navighezi). Arată: Client, Email, Telefon,
Serviciu, Status, Plată, Sumă, Termen, Factură (link Oblio dacă există), Cupon,
Note echipă (preview). Butoane: Închide · **Deschide comanda →** (sare la
`/admin/orders/{id}#notes-echipa`).

### Search extins
Caută acum și după **nume client** (first/last), **telefon** și **nume facturare**
— nu doar nr. comandă / email / AWB.

---

## Fișiere

| Fișier | Rol |
|--------|-----|
| `src/lib/admin/order-quick-filters.ts` | helper filtre quick+stage (partajat list+counts) + teste |
| `src/lib/admin/orders-tabs.ts` | `OrdersCounts` extins cu contoare chips |
| `src/app/api/admin/orders/list/route.ts` | param `quick` + search nume/telefon + câmpuri noi în select |
| `src/app/api/admin/orders/counts/route.ts` | contoare per chip |
| `src/app/admin/orders/page.tsx` | UI: chips, coloana Termen, badge fără-factură, dialog Detalii |

## Deschis (nefăcut)
- Editare note direct din dialog (acum doar preview + link la detaliu).
- „Copy pentru Sheet" per rând (eghiseul are Export TSV global).
- Export TSV nu propagă încă filtrul `quick` (propagă status/service/search/test).
