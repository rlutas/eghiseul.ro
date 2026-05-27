# Documente pentru servicii secundare (bundled add-ons)

**Status:** 🟡 Gap identificat 2026-05-27, plan documentat aici, implementare pendinte după Storno.

## Context

Când un client adaugă **Certificat Integritate** ca **serviciu secundar** la o comandă de **Cazier Judiciar** (sau invers), avem nevoie de **DOUĂ seturi de documente** legale — unul pentru fiecare autoritate care eliberează documentul.

Sister project (`cazierjudiciaronline.com`) implementează asta cu **flag-uri boolean** pe rândul orderului (`order.cazier_judiciar` + `order.certificat_integritate`) și **coloane separate** pentru fiecare delegație:
- `delegation_pdf_path` — delegația pentru Cazier (autoritate: IGPR)
- `delegation_integritate_pdf_path` — delegația pentru Integritate (autoritate: tot IGPR dar document diferit)

Plus **2 butoane separate** în admin („Delegatie Cazier" / „Delegatie Integritate") și **2 cereri** (cerere PF/PJ pentru cazier + cerere integritate).

## Modelul nostru (umbrella platform)

La eghiseul.ro folosim **JSONB `selected_options`** generic. O comandă Cazier Judiciar PF cu add-on Certificat Integritate arată așa:

```json
{
  "service_id": "...cazier-judiciar...",
  "selected_options": [
    { "code": "urgenta", "option_id": "...", "price_modifier": 80 },
    { "code": "apostila_haga", "option_id": "...", "price_modifier": 198 },
    {
      "code": "addon_certificat_integritate",
      "option_id": "d00f881f-...",
      "option_name": "Certificat Integritate (adaugă în aceeași comandă)",
      "price_modifier": 100
    },
    {
      "option_id": "bundled:d00f881f-...:8a84a70d-...",
      "option_name": "Apostilă de la Haga (Certificat Integritate (...))",
      "price_modifier": 198,
      "bundled_for": {
        "parent_option_id": "d00f881f-...",
        "bundled_service_slug": "certificat-integritate-comportamentala",
        "bundled_option_code": "apostila_haga"
      }
    }
    // ... bundled traducere/legalizare/notari for Integritate
  ]
}
```

**Avantaj:** un singur model funcționează pentru orice combinație de servicii viitoare (cazier-fiscal cu add-on, certificate stare civilă cu add-on, etc.) fără migrations.
**Dezavantaj:** trebuie să **scanăm `selected_options`** ca să detectăm secondary services și să generăm setul lor de documente.

## Ce trebuie generat per service

| Service principal | Cerere | Contract | Împuternicire | Autoritate |
|-------------------|--------|----------|---------------|------------|
| `cazier-judiciar` PF | `cerere-eliberare-pf.docx` | `contract-prestari` + `contract-asistenta` | `imputernicire.docx` | IGPR (Cazier Judiciar) |
| `cazier-judiciar` PJ | `cerere-eliberare-pj.docx` | idem | idem | idem |
| `cazier-fiscal` PF/PJ | (template pendent) | idem | (pendent) | ANAF |
| `cazier-auto` | (template pendent) | idem | (pendent) | DRPCIV (Direcția Permise) |
| `certificat-integritate-comportamentala` | (template pendent — copy din sister) | idem | (pendent) | IGPR (Integritate) |
| `certificat-nastere/casatorie/celibat` | (template pendent) | idem | (pendent) | Oficiul Stare Civilă |
| `extras-carte-funciara` | (pendent) | idem | (pendent) | OCPI |
| `certificat-constatator` | (pendent) | idem | (pendent) | ONRC |

**Status azi:** avem doar templates pentru `cazier-judiciar`. Toate celelalte folosesc fallback la `shared/` dacă există, altfel nu se generează.

## Detection rules (cum identificăm secondary services)

În `selected_options`:

1. **Direct add-on** (e.g. `urgenta`, `apostila_haga`) — NU este secondary service, e doar opțiune pe serviciul principal. Nu generăm documente suplimentare.
2. **Secondary service marker** — opțiune cu `code` care începe cu `addon_<service_slug>` (e.g. `addon_certificat_integritate`, `addon_cazier_judiciar`). ACEASTA cere set complet de documente.
3. **Bundled child** — opțiune cu `bundled_for.bundled_service_slug` set. Aparține secondary service-ului identificat în (2).

**Detection helper de scris** (pseudo-code):

```ts
function detectSecondaryServices(selectedOptions: SelectedOption[]): SecondaryService[] {
  return selectedOptions
    .filter(o => o.code?.startsWith('addon_'))
    .map(o => ({
      slug: o.code.replace('addon_', '').replace(/_/g, '-'),
      parentOptionId: o.option_id,
      // collect bundled children whose parent_option_id matches:
      addons: selectedOptions
        .filter(c => c.bundled_for?.parent_option_id === o.option_id)
        .map(c => ({
          code: c.bundled_for?.bundled_option_code,
          name: c.option_name,
          price: c.price_modifier ?? 0,
        })),
    }));
}
```

## Plan implementare (FAZA 2 — după Storno)

### 2.1 DB schema (no migration nouă — folosim ce avem)

`order_documents` table (deja există) — fiecare doc generat e un rând cu:
- `order_id`, `template_name`, `service_slug`, `s3_key`, `created_at`

Adăugăm convenție: pentru documente legate de un secondary service, `template_name` se prefix-uiește cu slug-ul (ex. `certificat-integritate-comportamentala/cerere-eliberare-pf`).

### 2.2 Templates de adăugat

Copy din `cazierjudiciaronline.com/templates/` (când le obținem) sau commission-uite manual:
- `src/templates/certificat-integritate-comportamentala/cerere-eliberare-pf.docx`
- `src/templates/certificat-integritate-comportamentala/imputernicire.docx`
- Restul serviciilor — pendent

### 2.3 Auto-generate la submit (extensie)

`src/lib/documents/auto-generate.ts`:

```ts
const secondaryServices = detectSecondaryServices(order.selected_options);
const templatesToGenerate = [
  'contract-prestari',
  'contract-asistenta',
  // Add-ons: per secondary service
  ...secondaryServices.flatMap(s => [
    `${s.slug}/cerere-eliberare-pf`,
    `${s.slug}/imputernicire`,
  ]),
];
```

Trebuie să:
- Trecem `secondary_service_slug` și `secondary_service_addons` în `DocumentContext` ca template-ul să poată afișa nume + prețuri pentru secondary service în contract.
- Stocam un singur `contract-prestari` care include AMBELE servicii ca line items (contract combinat — același pattern ca sister).
- Generăm cereri SEPARATE pentru fiecare autoritate.

### 2.4 Admin UI

Pe `/admin/orders/[id]`:
- Card „Documente principale" — cerere + imputernicire pentru main service
- Card „Documente serviciu secundar" — cerere + imputernicire pentru fiecare secondary service detected
- Buton „Regenerează" individual pe fiecare
- Audit trail în `order_history` cu `template_name` exact

### 2.5 Tests

- `tests/unit/lib/documents/detect-secondary-services.test.ts` — pure function pe selected_options
- `tests/unit/lib/documents/template-list-builder.test.ts` — câte template-uri se cer per combo (cazier only, cazier+integritate, fiscal+cazier, etc.)

### 2.6 Estimare

- Detection helper + tests: 4h
- Template Integritate (copy din sister + adapt): 2h
- Auto-generate extension: 4h
- Admin UI cu 2 sets de butoane: 4h
- Tests + docs: 2h
- **Total: ~2 zile**

## Limitări curente (până la FAZA 2)

Astăzi, când admin pe `/admin/orders/[id]` apasă butonul „Generează cerere":
- Pentru ordere normale (doar Cazier sau doar Integritate) → funcționează (folosește template-ul service-ului)
- Pentru ordere combo Cazier+Integritate → generează DOAR cerere pentru main service. Pentru secondary trebuie să compun manual (sau să folosim sister project ca workaround temporar)

**Workaround până la FAZA 2:**
1. Admin notează în notițele comenzii că e combo (Cazier + Integritate)
2. Generează manual cerere a doua + imputernicire a doua de pe `cazierjudiciaronline.com` (sau template Word manual)
3. Upload manual ca document atașat orderului

Nu e ideal dar nu blochează cutover-ul pentru first launch — ordere combo sunt rare în early stage.

## Referințe sister project

- `cazierjudiciaronline.com/src/app/api/admin/delegation/route.ts` — endpoint cu `isIntegritate` flag, scrie în `delegation_integritate_pdf_path`
- `cazierjudiciaronline.com/src/app/(admin)/admin/orders/[id]/page.tsx:1659-1719` — UI cu butoane duale „Delegatie Cazier" / „Delegatie Integritate"
- `cazierjudiciaronline.com/src/lib/delegation-generator.ts` — `getAuthorityForService(serviceType)` returnează autoritatea corectă (IGPR pentru cazier + integritate, ANAF pentru fiscal, etc.)
- `cazierjudiciaronline.com/src/lib/cerere-generator.ts` — `generateCererePF` / `generateCererePJ` / `generateCerereFiscal` (3 funcții, NU 1 generică)
