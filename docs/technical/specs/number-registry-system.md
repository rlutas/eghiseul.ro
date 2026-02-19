# Sistemul de Registru Numere (Number Registry System)

**Version:** 1.0
**Date:** 18 Februarie 2026
**Status:** Implemented
**Scope:** Number ranges from Bar Association, number registry journal, manual allocations, voided numbers, admin UI, document generation integration, migration from legacy counter system

---

## Table of Contents

1. [Overview](#1-overview)
2. [Sistem Actual (Legacy)](#2-sistem-actual-legacy)
3. [Distinctia Critica: Tipuri de Contracte](#3-distinctia-critica-tipuri-de-contracte)
4. [Intervale de Numere (Number Ranges)](#4-intervale-de-numere-number-ranges)
5. [Registru Numere (Number Registry Journal)](#5-registru-numere-number-registry-journal)
6. [Baza de Date -- Schema Propusa](#6-baza-de-date----schema-propusa)
7. [Functii RPC PostgreSQL](#7-functii-rpc-postgresql)
8. [TypeScript Interfaces](#8-typescript-interfaces)
9. [API Endpoints](#9-api-endpoints)
10. [Integrare cu Generarea Documentelor](#10-integrare-cu-generarea-documentelor)
11. [Admin UI Design](#11-admin-ui-design)
12. [Cazuri Speciale (Edge Cases)](#12-cazuri-speciale-edge-cases)
13. [Plan de Migrare](#13-plan-de-migrare)
14. [Evolutie Viitoare](#14-evolutie-viitoare)
15. [Key Files Reference](#15-key-files-reference)

---

## 1. Overview

### Problema

Avocatul colaborator (Cabinet de Avocat Tarta Ana-Gabriela) primeste de la Baroul Satu Mare **intervale finite de numere** pe an calendaristic -- separate pentru contracte de asistenta juridica si imputerniciri avocatiale. Aceste numere sunt resurse limitate si reglementate de Barou.

Sistemul actual foloseste un simplu counter JSONB in `admin_settings` care incrementeaza fara limita, fara constiinta anului, fara validare de interval, si fara un jurnal de evidenta. Acest lucru genereaza mai multe probleme:

- **Risipa de numere**: Regenerarea unui document consuma un numar nou in loc sa il reutilizeze pe cel existent.
- **Lipsa vizibilitatii**: Nu exista un registru centralizat (momentan se tine manual in Google Sheets).
- **Fara limita de interval**: Cand intervalul se epuizeaza, sistemul continua sa incrementeze dincolo de limita.
- **Fara suport pentru an calendaristic**: Intervalele sunt valabile doar pe anul in curs.
- **Lipsa suportului pentru utilizare personala**: Avocatul nu poate aloca numere pentru cazuri proprii (in afara platformei).
- **Bug de stocare**: Numarul de imputernicire nu se salveaza corect in `order_documents`.

### Solutia

Un sistem complet de gestionare a intervalelor de numere si registru, care:

1. Defineste intervale finite (start-end) per tip si an calendaristic.
2. Aloca numere atomic cu locking si validare de interval.
3. Tine un registru complet (jurnal) cu toate alocatiile -- platforma, manuale, anulate.
4. Previne risipa prin reutilizarea numerelor la regenerare.
5. Ofera export CSV pentru raportarea catre Barou.
6. Include alerte cand intervalele se apropie de epuizare.

---

## 2. Sistem Actual (Legacy)

### Stocare Counter

Tabelul `admin_settings` contine o intrare cu `key = 'document_counters'`:

```json
{
  "contract_number": 4271,
  "imputernicire_number": 5757
}
```

### Functia RPC `increment_document_counter`

```sql
CREATE OR REPLACE FUNCTION increment_document_counter(counter_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_val INTEGER;
  new_val INTEGER;
BEGIN
  SELECT (value->>counter_key)::INTEGER INTO current_val
  FROM admin_settings
  WHERE key = 'document_counters'
  FOR UPDATE;

  new_val := COALESCE(current_val, 0) + 1;

  UPDATE admin_settings
  SET value = jsonb_set(value, ARRAY[counter_key], to_jsonb(new_val)),
      updated_at = NOW()
  WHERE key = 'document_counters';

  RETURN new_val;
END;
$$ LANGUAGE plpgsql;
```

### Unde se consuma numerele

| Location | File | When | Counter Key |
|----------|------|------|-------------|
| Auto-generate la submit | `src/lib/documents/auto-generate.ts` | Order submission | `contract_number` (for `contract-prestari`) |
| Manual generate in admin | `src/app/api/admin/orders/[id]/generate-document/route.ts` | Admin clicks "Genereaza" | `contract_number` (for contract templates) or `imputernicire_number` (for imputernicire) |

### Probleme Cunoscute

| Bug | Detalii | Impact |
|-----|---------|--------|
| Regenerarea consuma numar nou | La fiecare regenerare se apeleaza `increment_document_counter`, consumand un numar suplimentar din interval | Risipa de numere finite |
| Numar gresit salvat in DB | Pentru imputernicire, `document_number` in `order_documents` salveaza `contract_number` in loc de `imputernicire_number` | Numarul afisat in admin este incorect |
| Fara limita superioara | Counter-ul creste indefinit, fara verificare daca a depasit intervalul alocat | Risc de numere invalide |
| Fara suport multi-interval | Un singur counter liniar per tip, fara posibilitatea de intervale non-contigue | Nu se poate trece la un interval nou |
| `contract-prestari` si `contract-asistenta` partajeaza counter | Ambele incrementeaza `contract_number`, dar `contract-prestari` nu ar trebui sa consume numere Barou | Numere Barou consumate inutil |

---

## 3. Distinctia Critica: Tipuri de Contracte

Aceasta distinctie este **fundamentala** pentru intregul sistem:

| Document | Parti Contractante | Identificator | Consuma Nr. Barou? |
|----------|-------------------|---------------|-------------------|
| **Contract Prestari Servicii** | EDIGITALIZARE S.R.L. (firma) si clientul | `friendly_order_id` (ex: `E-260218-7YTZJ`) | **NU** |
| **Contract Asistenta Juridica** | Cabinet Avocat Tarta Ana-Gabriela si clientul | Numar din interval Barou (ex: `004271`) | **DA** -- tip `contract` |
| **Imputernicire Avocatiala** | Avocatul, in numele clientului | Numar + serie din interval Barou (ex: `SM005757`) | **DA** -- tip `delegation` |

### Reguli de Numerotare

- **Contract Prestari Servicii**: Foloseste `{{NRCOMANDA}}` = `friendly_order_id`. Placeholder-ul `{{NRCONTRACT}}` din acest template se refera la numarul comenzii, NU la un numar Barou.
- **Contract Asistenta Juridica**: Apeleaza `allocate_number('contract', ...)`. Numarul alocat se foloseste ca `{{NRCONTRACT}}` in template.
- **Imputernicire Avocatiala**: Apeleaza `allocate_number('delegation', ...)`. Numarul alocat se foloseste ca `{{NRDELEGATIE}}` / `{{IMPUTERNICIRE_NR}}`, iar seria ca `{{SERIE}}` / `{{IMPUTERNICIRE_SERIA}}`.

### Relatia Contract - Imputernicire

Un client poate avea:
- **1 contract de asistenta juridica** per comanda (un singur numar de contract Barou).
- **Multiple imputerniciri** per comanda (cate una per serviciu solicitat). Exemplu: comanda cu cazier judiciar + apostila = 1 contract asistenta + 2 imputerniciri separate.

Fiecare imputernicire **refera** numarul contractului de asistenta asociat (placeholder `{{NRCONTRACT}}` in template-ul de imputernicire).

---

## 4. Intervale de Numere (Number Ranges)

### Cum Functioneaza Intervalele Barou

Baroul Satu Mare aloca avocatului intervale pe an calendaristic:

```
Anul 2026:
  Contracte asistenta: 4256 - 5256  (1001 numere disponibile)
  Imputerniciri:       5738 - 7738  (2001 numere disponibile)
```

### Caracteristici ale intervalelor

| Proprietate | Detalii |
|-------------|---------|
| **Valabilitate** | Strict pe an calendaristic (1 ian -- 31 dec) |
| **Finitude** | Intervalul are un start si un end fix; cand se epuizeaza, trebuie solicitat un nou interval |
| **Non-contiguitate** | Un interval nou poate incepe de la un numar diferit (ex: dupa 4256-5256 vine 10000-12000) |
| **Multiplicitate** | Pot exista mai multe intervale active simultan pentru acelasi tip si an |
| **Seria** | Imputernicirile au o serie (ex: `SM` = Satu Mare); contractele nu au serie |

### Lifecycle-ul unui Interval

```
         ┌───────────┐
         │  created   │ ── Admin adauga interval nou
         └─────┬─────┘
               │
               v
         ┌───────────┐
         │  active    │ ── Numerele se aloca secvential din next_number
         └─────┬─────┘
               │ (next_number > range_end)
               v
         ┌───────────┐
         │ exhausted  │ ── Intervalul este epuizat; se trece la urmatorul
         └─────┬─────┘
               │ (la sfarsit de an sau manual)
               v
         ┌───────────┐
         │ archived   │ ── Intervalul este arhivat (read-only, pastrat pentru audit)
         └───────────┘
```

---

## 5. Registru Numere (Number Registry Journal)

### Scopul Registrului

Registrul tine evidenta **fiecarui numar** consumat, indiferent de sursa. Acesta inlocuieste Google Sheets-ul pe care avocatul il tine manual in prezent.

### Informatii Inregistrate per Numar

| Camp | Descriere | Obligatoriu |
|------|-----------|-------------|
| Numar | Numarul alocat (ex: 4271) | Da |
| Tip | `contract` sau `delegation` | Da |
| Serie | `SM` (doar pentru imputerniciri) | Doar delegation |
| An | Anul calendaristic | Da |
| Data | Data alocarii | Da |
| Client | Numele complet al clientului | Da |
| Email | Email-ul clientului | Nu |
| CNP / CUI | Identificator client | Da |
| Serviciu | Tipul serviciului (ex: "Cazier Judiciar PF") | Da |
| Suma | Onorariul avocatului | Nu |
| Sursa | `platform` / `manual` / `reserved` / `voided` | Da |
| Comanda | Link la comanda platforma (daca exista) | Nu |
| Document | Link la documentul generat (daca exista) | Nu |

### Surse de Alocare

| Sursa | Descriere | Cine |
|-------|-----------|------|
| `platform` | Alocat automat la generarea documentelor prin platforma | Sistem |
| `manual` | Alocat manual de avocat pentru cazuri personale (fara comanda) | Avocat / Admin |
| `reserved` | Rezervat (placeholder pentru utilizare ulterioara) | Admin |
| `voided` | Numar anulat (comanda anulata, eroare) -- numarul nu poate fi reutilizat | Admin |

---

## 6. Baza de Date -- Schema Propusa

### 6.1 Tabelul `number_ranges`

```sql
-- =============================================
-- Table: number_ranges
-- Stores finite number ranges assigned by the Bar Association per year
-- =============================================
CREATE TABLE number_ranges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('contract', 'delegation')),
  year          INTEGER NOT NULL CHECK (year >= 2024 AND year <= 2100),
  range_start   INTEGER NOT NULL CHECK (range_start > 0),
  range_end     INTEGER NOT NULL CHECK (range_end > 0),
  next_number   INTEGER NOT NULL,
  series        TEXT,              -- e.g., 'SM' for Satu Mare delegations; NULL for contracts
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'exhausted', 'archived')),
  notes         TEXT,              -- free-text notes (e.g., "Interval primit 15.01.2026")
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT range_start_lte_end CHECK (range_start <= range_end),
  CONSTRAINT next_number_in_range CHECK (
    next_number >= range_start AND next_number <= range_end + 1
    -- next_number = range_end + 1 means range is exhausted
  )
);

-- Indexes
CREATE INDEX idx_number_ranges_type_year_status
  ON number_ranges(type, year, status)
  WHERE status = 'active';

CREATE INDEX idx_number_ranges_year
  ON number_ranges(year);

-- RLS
ALTER TABLE number_ranges ENABLE ROW LEVEL SECURITY;

-- Admin roles can manage ranges
CREATE POLICY "Admin roles can manage number ranges"
  ON number_ranges FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'manager', 'avocat', 'employee')
    )
  );

COMMENT ON TABLE number_ranges IS
  'Finite number ranges assigned by the Bar Association (Baroul Satu Mare) per year for contracts and delegations.';
COMMENT ON COLUMN number_ranges.type IS
  'contract = Contract Asistenta Juridica numbers, delegation = Imputernicire Avocatiala numbers';
COMMENT ON COLUMN number_ranges.next_number IS
  'Next number to be allocated. When next_number > range_end, range is exhausted.';
COMMENT ON COLUMN number_ranges.series IS
  'Series prefix for delegations (e.g., SM = Satu Mare). NULL for contracts.';
```

### 6.2 Tabelul `number_registry`

```sql
-- =============================================
-- Table: number_registry
-- Journal of every consumed number (platform, manual, voided)
-- Mirrors the lawyer's Google Sheets register for Bar reporting
-- =============================================
CREATE TABLE number_registry (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Number identification
  range_id          UUID REFERENCES number_ranges(id) ON DELETE SET NULL,
  number            INTEGER NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('contract', 'delegation')),
  series            TEXT,              -- e.g., 'SM'
  year              INTEGER NOT NULL,

  -- Order link (nullable for manual/personal use entries)
  order_id          UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_document_id UUID REFERENCES order_documents(id) ON DELETE SET NULL,

  -- Client information (denormalized for registry export)
  client_name       TEXT NOT NULL,
  client_email      TEXT,
  client_cnp        TEXT,              -- CNP for PF
  client_cui        TEXT,              -- CUI for PJ

  -- Service and financial information
  service_type      TEXT,              -- e.g., "Cazier Judiciar PF", "Apostila"
  description       TEXT,              -- free-text description
  amount            DECIMAL(10,2),     -- lawyer fee amount

  -- Allocation metadata
  source            TEXT NOT NULL DEFAULT 'platform'
                    CHECK (source IN ('platform', 'manual', 'reserved', 'voided')),
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Voiding
  voided_at         TIMESTAMPTZ,
  voided_by         UUID REFERENCES profiles(id),
  void_reason       TEXT,

  -- Uniqueness: one number per type per year
  CONSTRAINT unique_number_per_type_year UNIQUE (type, year, number)
);

-- Indexes
CREATE INDEX idx_number_registry_type_year
  ON number_registry(type, year);

CREATE INDEX idx_number_registry_order_id
  ON number_registry(order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX idx_number_registry_source
  ON number_registry(source);

CREATE INDEX idx_number_registry_date
  ON number_registry(date);

CREATE INDEX idx_number_registry_client_search
  ON number_registry USING gin (
    (client_name || ' ' || COALESCE(client_email, '') || ' ' || COALESCE(client_cnp, '') || ' ' || COALESCE(client_cui, ''))
    gin_trgm_ops
  );

-- RLS
ALTER TABLE number_registry ENABLE ROW LEVEL SECURITY;

-- Admin roles can manage registry entries
CREATE POLICY "Admin roles can manage number registry"
  ON number_registry FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'manager', 'avocat', 'employee')
    )
  );

COMMENT ON TABLE number_registry IS
  'Complete journal of every Bar Association number consumed, voided, or manually allocated. Used for reporting and audit.';
COMMENT ON COLUMN number_registry.source IS
  'platform = auto-allocated by system, manual = lawyer personal use, reserved = placeholder, voided = cancelled (number cannot be reused)';
```

### 6.3 Relatia intre Tabele

```
┌──────────────────┐       ┌───────────────────┐       ┌──────────────────┐
│  number_ranges   │       │  number_registry   │       │  order_documents │
│                  │       │                    │       │                  │
│  id (PK)         │◄──────│  range_id (FK)     │       │  id (PK)         │
│  type             │       │  number            │       │  order_id (FK)   │
│  year             │       │  type              │       │  type            │
│  range_start      │       │  series            │       │  document_number │
│  range_end        │       │  year              │       │  s3_key          │
│  next_number      │       │  order_id (FK) ────│──────►│                  │
│  series           │       │  order_document_id │───────│                  │
│  status           │       │  client_name       │       └──────────────────┘
│                  │       │  client_cnp/cui    │
│                  │       │  service_type      │       ┌──────────────────┐
│                  │       │  source            │       │      orders      │
│                  │       │  voided_at         │       │                  │
│                  │       │  ...               │       │  id (PK)         │
└──────────────────┘       └───────────────────┘       │  friendly_order_id│
                                    │                   │  customer_data   │
                                    └──────────────────►│                  │
                                       order_id (FK)    └──────────────────┘
```

---

## 7. Functii RPC PostgreSQL

### 7.1 `allocate_number` -- Alocare atomica de numar

```sql
-- =============================================
-- Function: allocate_number
-- Atomically allocates the next available number from an active range.
-- Uses FOR UPDATE locking to handle concurrent requests.
-- Returns the allocated number, or raises an exception if no range is available.
-- =============================================
CREATE OR REPLACE FUNCTION allocate_number(
  p_type          TEXT,           -- 'contract' or 'delegation'
  p_year          INTEGER DEFAULT NULL,
  p_order_id      UUID DEFAULT NULL,
  p_order_doc_id  UUID DEFAULT NULL,
  p_client_name   TEXT DEFAULT '',
  p_client_email  TEXT DEFAULT NULL,
  p_client_cnp    TEXT DEFAULT NULL,
  p_client_cui    TEXT DEFAULT NULL,
  p_service_type  TEXT DEFAULT NULL,
  p_description   TEXT DEFAULT NULL,
  p_amount        DECIMAL DEFAULT NULL,
  p_source        TEXT DEFAULT 'platform',
  p_date          DATE DEFAULT CURRENT_DATE,
  p_created_by    UUID DEFAULT NULL
)
RETURNS TABLE (
  allocated_number  INTEGER,
  allocated_series  TEXT,
  allocated_year    INTEGER,
  range_id          UUID,
  registry_id       UUID
) AS $$
DECLARE
  v_year          INTEGER;
  v_range         RECORD;
  v_number        INTEGER;
  v_registry_id   UUID;
BEGIN
  -- Default to current year
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

  -- Find the first active range for this type and year, ordered by range_start
  -- Lock the row to prevent concurrent allocations
  SELECT r.*
  INTO v_range
  FROM number_ranges r
  WHERE r.type = p_type
    AND r.year = v_year
    AND r.status = 'active'
    AND r.next_number <= r.range_end
  ORDER BY r.range_start ASC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active number range available for type=% year=%', p_type, v_year
      USING ERRCODE = 'P0002'; -- no_data_found
  END IF;

  -- Claim the next number
  v_number := v_range.next_number;

  -- Advance the counter
  UPDATE number_ranges
  SET next_number = v_range.next_number + 1,
      updated_at = NOW(),
      -- Auto-mark as exhausted when we've used the last number
      status = CASE
        WHEN v_range.next_number + 1 > v_range.range_end THEN 'exhausted'
        ELSE status
      END
  WHERE id = v_range.id;

  -- Insert into the registry journal
  INSERT INTO number_registry (
    range_id, number, type, series, year,
    order_id, order_document_id,
    client_name, client_email, client_cnp, client_cui,
    service_type, description, amount,
    source, date, created_by
  ) VALUES (
    v_range.id, v_number, p_type, v_range.series, v_year,
    p_order_id, p_order_doc_id,
    p_client_name, p_client_email, p_client_cnp, p_client_cui,
    p_service_type, p_description, p_amount,
    p_source, p_date, p_created_by
  )
  RETURNING id INTO v_registry_id;

  -- Return the result
  RETURN QUERY SELECT
    v_number,
    v_range.series,
    v_year,
    v_range.id,
    v_registry_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION allocate_number IS
  'Atomically allocates the next available number from an active range for the given type and year. '
  'Inserts a registry entry and auto-marks the range as exhausted when full. '
  'Raises P0002 if no active range is available.';
```

### 7.2 `void_number` -- Anularea unui numar

```sql
-- =============================================
-- Function: void_number
-- Marks a registry entry as voided. The number cannot be reused.
-- =============================================
CREATE OR REPLACE FUNCTION void_number(
  p_registry_id   UUID,
  p_voided_by     UUID,
  p_void_reason   TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_entry RECORD;
BEGIN
  -- Lock and fetch the entry
  SELECT *
  INTO v_entry
  FROM number_registry
  WHERE id = p_registry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registry entry % not found', p_registry_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Cannot void an already voided entry
  IF v_entry.voided_at IS NOT NULL THEN
    RAISE EXCEPTION 'Registry entry % is already voided', p_registry_id
      USING ERRCODE = 'P0003';
  END IF;

  -- Mark as voided
  UPDATE number_registry
  SET voided_at = NOW(),
      voided_by = p_voided_by,
      void_reason = p_void_reason,
      source = 'voided'
  WHERE id = p_registry_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION void_number IS
  'Marks a number registry entry as voided. Voided numbers cannot be reused or re-voided.';
```

### 7.3 `find_existing_number` -- Cautare numar existent pentru refolosire

```sql
-- =============================================
-- Function: find_existing_number
-- Checks if a number has already been allocated for a given order, type,
-- and (optionally) document type. Used to prevent wasting numbers on regeneration.
-- =============================================
CREATE OR REPLACE FUNCTION find_existing_number(
  p_order_id  UUID,
  p_type      TEXT   -- 'contract' or 'delegation'
)
RETURNS TABLE (
  registry_id       UUID,
  existing_number   INTEGER,
  existing_series   TEXT,
  existing_year     INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nr.id,
    nr.number,
    nr.series,
    nr.year
  FROM number_registry nr
  WHERE nr.order_id = p_order_id
    AND nr.type = p_type
    AND nr.voided_at IS NULL
  ORDER BY nr.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_existing_number IS
  'Looks up an existing non-voided number allocation for an order and type. '
  'Used to reuse numbers during document regeneration instead of wasting new ones.';
```

---

## 8. TypeScript Interfaces

### 8.1 Database Types

```typescript
// src/types/number-registry.ts

/**
 * Number range assigned by the Bar Association.
 * Stored in `number_ranges` table.
 */
export interface NumberRange {
  id: string;
  type: 'contract' | 'delegation';
  year: number;
  range_start: number;
  range_end: number;
  next_number: number;
  series: string | null;
  status: 'active' | 'exhausted' | 'archived';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Computed stats for a number range (used in admin UI).
 */
export interface NumberRangeWithStats extends NumberRange {
  total: number;          // range_end - range_start + 1
  used: number;           // next_number - range_start
  available: number;      // range_end - next_number + 1 (0 if exhausted)
  usage_percent: number;  // (used / total) * 100
}

/**
 * Number registry entry (journal row).
 * Stored in `number_registry` table.
 */
export interface NumberRegistryEntry {
  id: string;
  range_id: string | null;
  number: number;
  type: 'contract' | 'delegation';
  series: string | null;
  year: number;
  order_id: string | null;
  order_document_id: string | null;
  client_name: string;
  client_email: string | null;
  client_cnp: string | null;
  client_cui: string | null;
  service_type: string | null;
  description: string | null;
  amount: number | null;
  source: 'platform' | 'manual' | 'reserved' | 'voided';
  date: string;
  created_by: string | null;
  created_at: string;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
}

/**
 * Result from the allocate_number RPC function.
 */
export interface AllocateNumberResult {
  allocated_number: number;
  allocated_series: string | null;
  allocated_year: number;
  range_id: string;
  registry_id: string;
}

/**
 * Result from the find_existing_number RPC function.
 */
export interface FindExistingNumberResult {
  registry_id: string;
  existing_number: number;
  existing_series: string | null;
  existing_year: number;
}

/**
 * Params for creating a new number range (admin form).
 */
export interface CreateNumberRangeParams {
  type: 'contract' | 'delegation';
  year: number;
  range_start: number;
  range_end: number;
  series?: string;
  notes?: string;
}

/**
 * Params for manual number entry (lawyer personal use).
 */
export interface ManualNumberEntryParams {
  type: 'contract' | 'delegation';
  client_name: string;
  client_email?: string;
  client_cnp?: string;
  client_cui?: string;
  service_type?: string;
  description?: string;
  amount?: number;
  date?: string;  // ISO date
}

/**
 * Registry filter params (admin list/search).
 */
export interface NumberRegistryFilters {
  type?: 'contract' | 'delegation';
  year?: number;
  source?: 'platform' | 'manual' | 'reserved' | 'voided';
  date_from?: string;
  date_to?: string;
  search?: string;    // client name, email, CNP, CUI
  page?: number;
  per_page?: number;
}
```

### 8.2 Updated DocumentContext

The existing `DocumentContext` interface in `src/lib/documents/generator.ts` will be extended:

```typescript
// Changes to existing DocumentContext.document_numbers
export interface DocumentContext {
  // ... existing fields unchanged ...
  document_numbers?: {
    contract_number?: number;           // Barou contract number (for contract-asistenta)
    contract_series?: string | null;    // NEW: Series (null for contracts)
    imputernicire_number?: number;
    imputernicire_series?: string;      // Already exists: 'SM'
    registry_ids?: {                    // NEW: References to registry entries
      contract?: string;               // UUID of number_registry entry
      delegation?: string;             // UUID of number_registry entry
    };
  };
}
```

---

## 9. API Endpoints

All endpoints require authentication and `settings.manage` permission (or `documents.generate` for number allocation during document generation).

### 9.1 `GET /api/admin/settings/number-ranges`

List all number ranges, optionally filtered.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | integer | current year | Filter by year |
| `type` | string | - | `contract` or `delegation` |
| `status` | string | - | `active`, `exhausted`, or `archived` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "type": "contract",
      "year": 2026,
      "range_start": 4256,
      "range_end": 5256,
      "next_number": 4272,
      "series": null,
      "status": "active",
      "notes": "Interval primit ianuarie 2026",
      "total": 1001,
      "used": 16,
      "available": 985,
      "usage_percent": 1.6,
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": "uuid-2",
      "type": "delegation",
      "year": 2026,
      "range_start": 5738,
      "range_end": 7738,
      "next_number": 5758,
      "series": "SM",
      "status": "active",
      "notes": null,
      "total": 2001,
      "used": 20,
      "available": 1981,
      "usage_percent": 1.0,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### 9.2 `POST /api/admin/settings/number-ranges`

Create a new number range.

**Request Body:**

```json
{
  "type": "contract",
  "year": 2026,
  "range_start": 10000,
  "range_end": 12000,
  "series": null,
  "notes": "Al doilea interval - primit dupa epuizare"
}
```

**Validation Rules:**

- `range_start` must be > 0
- `range_end` must be >= `range_start`
- `type` must be `contract` or `delegation`
- `year` must be >= current year - 1 (can add for last year for backfill)
- `series` is required when `type` is `delegation`
- No overlapping ranges for same type+year (check that new range [start, end] does not overlap with existing active/exhausted ranges)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-3",
    "type": "contract",
    "year": 2026,
    "range_start": 10000,
    "range_end": 12000,
    "next_number": 10000,
    "series": null,
    "status": "active",
    "notes": "Al doilea interval - primit dupa epuizare"
  }
}
```

### 9.3 `PATCH /api/admin/settings/number-ranges/[id]`

Update or archive a number range.

**Request Body (update notes):**

```json
{
  "notes": "Updated notes"
}
```

**Request Body (archive):**

```json
{
  "status": "archived"
}
```

**Rules:**
- Cannot change `range_start`, `range_end`, `type`, or `year` after creation (immutable once numbers have been allocated).
- Can change `notes`, `status` (only to `archived`), and `series`.
- Cannot archive if status is `active` and numbers have been allocated (must exhaust or void remaining first -- or admin confirms forced archive).

**Response:**

```json
{
  "success": true,
  "data": { "...updated range..." }
}
```

### 9.4 `GET /api/admin/settings/number-registry`

List registry entries with filtering and pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | - | `contract` or `delegation` |
| `year` | integer | current year | Filter by year |
| `source` | string | - | `platform`, `manual`, `reserved`, `voided` |
| `date_from` | string (ISO date) | - | Start date filter |
| `date_to` | string (ISO date) | - | End date filter |
| `search` | string | - | Search in client_name, client_email, client_cnp, client_cui |
| `order_id` | string (UUID) | - | Filter by specific order |
| `page` | integer | 1 | Page number |
| `per_page` | integer | 50 | Items per page (max 200) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "reg-uuid-1",
      "number": 4271,
      "type": "contract",
      "series": null,
      "year": 2026,
      "client_name": "Popescu Ion",
      "client_email": "ion@email.com",
      "client_cnp": "1901234567890",
      "client_cui": null,
      "service_type": "Cazier Judiciar PF",
      "amount": 15.00,
      "source": "platform",
      "date": "2026-02-18",
      "order_id": "order-uuid",
      "voided_at": null,
      "void_reason": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 142,
    "total_pages": 3
  }
}
```

### 9.5 `POST /api/admin/settings/number-registry`

Create a manual registry entry (for lawyer's personal use / non-platform cases).

**Request Body:**

```json
{
  "type": "contract",
  "client_name": "Ionescu Maria",
  "client_email": "maria@email.com",
  "client_cnp": "2860101123456",
  "client_cui": null,
  "service_type": "Consultanta juridica",
  "description": "Caz personal - drept civil",
  "amount": 200.00,
  "date": "2026-02-18"
}
```

**Behavior:**
- Calls `allocate_number()` RPC with `source = 'manual'`.
- The number is allocated from the next available active range for the type and current year.
- If no active range exists, returns 400 error.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "reg-uuid-new",
    "number": 4272,
    "type": "contract",
    "series": null,
    "year": 2026,
    "client_name": "Ionescu Maria",
    "source": "manual"
  }
}
```

### 9.6 `POST /api/admin/settings/number-registry/[id]/void`

Void a registry entry (cancelled order, error, etc.).

**Request Body:**

```json
{
  "reason": "Comanda anulata de client"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "reg-uuid-1",
    "number": 4271,
    "voided_at": "2026-02-18T14:30:00Z",
    "void_reason": "Comanda anulata de client"
  }
}
```

### 9.7 `GET /api/admin/settings/number-registry/export`

Export registry as CSV for the lawyer's records and Bar reporting.

**Query Parameters:** Same as `GET /api/admin/settings/number-registry` (minus pagination).

**Response:**

HTTP 200 with `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="registru-numere-2026.csv"`.

**CSV Columns:**

```csv
Nr,Tip,Serie,Data,Client,Email,CNP,CUI,Serviciu,Descriere,Suma,Sursa,Comanda,Document,Anulat,Motiv Anulare
4271,contract,,18.02.2026,Popescu Ion,ion@email.com,1901234567890,,Cazier Judiciar PF,,15.00,platform,E-260218-7YTZJ,contract-asistenta-004271.docx,,
4272,contract,,18.02.2026,Ionescu Maria,maria@email.com,2860101123456,,Consultanta juridica,Caz personal,200.00,manual,,,,
5757,delegation,SM,18.02.2026,Popescu Ion,ion@email.com,1901234567890,,Cazier Judiciar PF,,15.00,platform,E-260218-7YTZJ,imputernicire-SM005757.docx,,
4260,contract,,05.01.2026,Radu Ana,,,,,,,voided,,,Da,Eroare generare
```

**Note:** The "Document" column shows the filename of the linked `order_document` (if `order_document_id` is set on the registry entry). This is populated when documents are generated through the platform. Manual entries and voided entries typically have no linked document.

---

## 10. Integrare cu Generarea Documentelor

### 10.1 Fluxul Actualizat de Generare

The core change is replacing `increment_document_counter` with `allocate_number` (with reuse logic).

```
Document generation request
       │
       v
  ┌─────────────────────────────────┐
  │  Is this a regeneration?        │
  │  (same order + same doc type    │
  │  already has an order_document) │
  └──────────┬──────────────────────┘
             │
        ┌────┴────┐
        │         │
       YES        NO
        │         │
        v         v
  ┌───────────┐  ┌────────────────────────────┐
  │ REUSE     │  │ ALLOCATE NEW               │
  │           │  │                            │
  │ Call      │  │ Call allocate_number()     │
  │ find_     │  │ with order data            │
  │ existing_ │  │                            │
  │ number()  │  │ Returns: number, series,   │
  │           │  │ year, registry_id          │
  │ Returns   │  │                            │
  │ existing  │  │ Insert into order_documents│
  │ number    │  │ with new registry ref      │
  └─────┬─────┘  └──────────┬─────────────────┘
        │                   │
        └────────┬──────────┘
                 │
                 v
          Use number in template
          {{NRCONTRACT}} or {{NRDELEGATIE}}
```

### 10.2 Template-to-Number Mapping (Updated)

| Template | Consuma Nr. Barou? | Allocation Type | Template Placeholders |
|----------|-------------------|-----------------|----------------------|
| `contract-prestari` | **NU** | Uses `friendly_order_id` | `{{NRCOMANDA}}` = friendly_order_id |
| `contract-asistenta` | **DA** | `allocate_number('contract')` | `{{NRCONTRACT}}` = allocated number (zero-padded 6 digits) |
| `imputernicire` | **DA** | `allocate_number('delegation')` | `{{NRDELEGATIE}}` / `{{IMPUTERNICIRE_NR}}` = number, `{{SERIE}}` / `{{IMPUTERNICIRE_SERIA}}` = series |
| `contract-complet` | **NU** | Preview only | `{{NRCONTRACT}}` = `000000` (draft) |
| `cerere-eliberare-pf` | **NU** | No numbering | N/A |
| `cerere-eliberare-pj` | **NU** | No numbering | N/A |

### 10.3 Code Changes in `auto-generate.ts`

```typescript
// BEFORE (legacy):
const { data: counterResult } = await adminClient.rpc(
  'increment_document_counter',
  { counter_key: 'contract_number' }
);
documentNumbers.contract_number = counterResult;

// AFTER (new system):
// For contract-prestari: NO Barou number needed
if (template === 'contract-prestari') {
  // Uses friendly_order_id as contract identifier
  // No allocate_number call
}

// For contract-asistenta: allocate Barou contract number
if (template === 'contract-asistenta') {
  // Check for existing number (regeneration reuse)
  const { data: existing } = await adminClient.rpc('find_existing_number', {
    p_order_id: orderId,
    p_type: 'contract',
  });

  if (existing && existing.length > 0) {
    // Reuse existing number
    documentNumbers.contract_number = existing[0].existing_number;
    documentNumbers.contract_series = existing[0].existing_series;
  } else {
    // Allocate new number
    const { data: allocated, error: allocError } = await adminClient.rpc('allocate_number', {
      p_type: 'contract',
      p_order_id: orderId,
      p_client_name: clientData.name,
      p_client_email: clientData.email,
      p_client_cnp: clientData.cnp || null,
      p_client_cui: clientData.cui || null,
      p_service_type: order.services?.name || '',
      p_amount: lawyerData.fee || null,
      p_created_by: generatedBy,
    });

    if (allocError) {
      console.error('Failed to allocate contract number:', allocError);
      throw new Error(`Nu s-a putut aloca numar de contract: ${allocError.message}`);
    }

    documentNumbers.contract_number = allocated[0].allocated_number;
    documentNumbers.contract_series = allocated[0].allocated_series;
    documentNumbers.registry_ids = {
      ...documentNumbers.registry_ids,
      contract: allocated[0].registry_id,
    };
  }
}
```

### 10.4 Code Changes in `generate-document/route.ts`

```typescript
// For imputernicire: allocate Barou delegation number
if (template === 'imputernicire') {
  // Check for existing number (regeneration reuse)
  const { data: existing } = await adminClient.rpc('find_existing_number', {
    p_order_id: orderId,
    p_type: 'delegation',
  });

  if (existing && existing.length > 0) {
    // Reuse existing number
    documentNumbers.imputernicire_number = existing[0].existing_number;
    documentNumbers.imputernicire_series = existing[0].existing_series || 'SM';
  } else {
    // Allocate new delegation number
    const { data: allocated, error: allocError } = await adminClient.rpc('allocate_number', {
      p_type: 'delegation',
      p_order_id: orderId,
      p_client_name: clientData.name,
      p_client_email: clientData.email,
      p_client_cnp: clientData.cnp || null,
      p_client_cui: clientData.cui || null,
      p_service_type: order.services?.name || '',
      p_amount: lawyerData.fee || null,
      p_created_by: user.id,
    });

    if (allocError) {
      console.error('Failed to allocate delegation number:', allocError);
      return NextResponse.json(
        { success: false, error: 'Nu s-a putut aloca numar de imputernicire. Verificati intervalele disponibile.' },
        { status: 400 }
      );
    }

    documentNumbers.imputernicire_number = allocated[0].allocated_number;
    documentNumbers.imputernicire_series = allocated[0].allocated_series || 'SM';
    documentNumbers.registry_ids = {
      ...documentNumbers.registry_ids,
      delegation: allocated[0].registry_id,
    };
  }

  // Also fetch the contract number from this order (for cross-reference in template)
  const { data: contractEntry } = await adminClient.rpc('find_existing_number', {
    p_order_id: orderId,
    p_type: 'contract',
  });

  if (contractEntry && contractEntry.length > 0) {
    documentNumbers.contract_number = contractEntry[0].existing_number;
  }
}
```

### 10.5 Updated `order_documents` Insert

When inserting into `order_documents`, the `document_number` field should now correctly store:

```typescript
// For contract-asistenta: store the Barou contract number
const docNumber = documentNumbers.contract_number
  ? String(documentNumbers.contract_number).padStart(6, '0')
  : null;

// For imputernicire: store the Barou delegation number (NOT the contract number)
const docNumber = documentNumbers.imputernicire_number
  ? `${documentNumbers.imputernicire_series || 'SM'}${String(documentNumbers.imputernicire_number).padStart(6, '0')}`
  : null;

// For contract-prestari: store the friendly_order_id (not a Barou number)
const docNumber = order.friendly_order_id;
```

### 10.6 Updated `order_documents` metadata

```typescript
await adminClient.from('order_documents').insert({
  order_id: orderId,
  type: docType,
  s3_key: s3Key,
  file_name: fileName,
  file_size: buffer.length,
  mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  document_number: docNumber,
  visible_to_client: true,
  generated_by: user.id,
  metadata: {
    template,
    document_numbers: documentNumbers,
    auto_generated: true,
    // NEW: registry references
    registry_id: documentNumbers.registry_ids?.contract || documentNumbers.registry_ids?.delegation || null,
  },
});
```

### 10.7 Linking `order_document_id` Back to Registry

After the `order_documents` insert succeeds, update the registry entry with the document reference:

```typescript
// After successful order_documents insert, link back to registry
if (documentNumbers.registry_ids?.contract && insertedDocId) {
  await adminClient
    .from('number_registry')
    .update({ order_document_id: insertedDocId })
    .eq('id', documentNumbers.registry_ids.contract);
}
```

**Important (Fixed 2026-02-18):** When a number is *reused* during document regeneration (via `find_existing_number`), the `order_document_id` on the registry entry must also be updated to point to the newly generated document. Previously, reused numbers retained the old `order_document_id` (which may have been deleted), causing broken links in the registry. The fix ensures that after regenerating a document for a reused number, the registry entry's `order_document_id` is updated to the new `order_documents.id`.

---

## 11. Admin UI Design

### 11.1 Locatie in Admin Panel

The number registry has its own dedicated page at **`/admin/registru`**, accessible from the admin sidebar navigation (BookOpen icon). It was initially implemented as a tab in admin Settings but was moved to its own page for better visibility and organization.

### 11.2 Page Structure: `/admin/registru`

```
┌─────────────────────────────────────────────────────────────────────┐
│  Registru Numere                                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ALERTE (Section E)                                         │   │
│  │  ⚠ Interval imputerniciri 2026: 93% utilizat (ramase: 140) │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  INTERVALE ACTIVE (Section A)                  [+ Adauga]   │   │
│  │                                                             │   │
│  │  Contracte Asistenta 2026                                   │   │
│  │  ┌──────────────────────────────────────────────────┐      │   │
│  │  │ 4256 - 5256  │  ████████░░░░░░░░░░░  16/1001   │      │   │
│  │  │ Status: Activ │  1.6% utilizat                   │      │   │
│  │  │               │  Urmatorul: 4272                 │ [Arh]│   │
│  │  └──────────────────────────────────────────────────┘      │   │
│  │                                                             │   │
│  │  Imputerniciri 2026 (Seria SM)                             │   │
│  │  ┌──────────────────────────────────────────────────┐      │   │
│  │  │ 5738 - 7738  │  ████░░░░░░░░░░░░░░░  20/2001   │      │   │
│  │  │ Status: Activ │  1.0% utilizat                   │      │   │
│  │  │               │  Urmatorul: 5758                 │ [Arh]│   │
│  │  └──────────────────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  JURNAL NUMERE (Section C)             [+ Manual] [Export]  │   │
│  │                                                             │   │
│  │  Filtre: [Tip ▾] [An ▾] [Sursa ▾] [De la] [Pana la] [Q]  │   │
│  │                                                             │   │
│  │  Nr   │ Tip      │ Serie│ Data       │ Client        │ ... │   │
│  │  ─────┼──────────┼──────┼────────────┼───────────────┼─────│   │
│  │  4271 │ Contract │  -   │ 18.02.2026 │ Popescu Ion   │     │   │
│  │  4272 │ Contract │  -   │ 18.02.2026 │ Ionescu Maria │     │   │
│  │  5757 │ Delegatie│  SM  │ 18.02.2026 │ Popescu Ion   │     │   │
│  │  5758 │ Delegatie│  SM  │ 18.02.2026 │ Radu Ana      │     │   │
│  │  4260 │ Contract │  -   │ 05.01.2026 │ Radu Ana      │ ANU │   │
│  │                                                             │   │
│  │  Pagina 1 din 3  [< Prev] [Next >]                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.3 Section A: Intervale Active

A card-based layout grouped by type and year.

**Per-range card contents:**

| Element | Display |
|---------|---------|
| Range label | "Contracte Asistenta 2026" or "Imputerniciri 2026 (Seria SM)" |
| Range values | "4256 - 5256" |
| Progress bar | Color-coded: green (<70%), yellow (70-90%), red (>90%) |
| Stats | "16/1001 utilizate (1.6%)" |
| Next number | "Urmatorul: 4272" |
| Status badge | `Activ` (green), `Epuizat` (red), `Arhivat` (gray) |
| Actions | Archive button (if active), Edit notes |

**Progress bar color coding:**

```typescript
function getProgressColor(percent: number): string {
  if (percent < 70) return 'bg-green-500';
  if (percent < 90) return 'bg-yellow-500';
  return 'bg-red-500';
}
```

### 11.4 Section B: Adauga Interval (Dialog)

Triggered by the "+ Adauga" button in Section A. Opens a Dialog component.

**Form fields:**

| Field | Type | Validation | Default |
|-------|------|------------|---------|
| Tip | Select: "Contract" / "Imputernicire" | Required | - |
| An | Number input | Required, >= current year | Current year |
| Numar start | Number input | Required, > 0 | - |
| Numar sfarsit | Number input | Required, >= start | - |
| Seria | Text input | Required if type = delegation | `SM` |
| Note | Textarea | Optional | - |

**Validation on submit:**
- Check no overlapping ranges for same type+year.
- Display total available count: "Interval: {start} - {end} ({total} numere)".

### 11.5 Section C: Jurnal Numere (Registry Table)

A full-featured data table with:

**Columns:**

| Column | Width | Sortable | Notes |
|--------|-------|----------|-------|
| Nr | 80px | Yes | The allocated number. If `order_document_id` is set, a FileDown icon is shown next to the number to download the linked document. |
| Tip | 100px | Yes | "Contract" or "Delegatie" badge |
| Serie | 60px | No | "SM" or "-" |
| Data | 100px | Yes | DD.MM.YYYY format |
| Client | 200px | Yes | Client name |
| CNP/CUI | 140px | No | CNP or CUI |
| Serviciu | 180px | No | Service type name |
| Suma | 80px | Yes | Amount in RON |
| Sursa | 100px | No | Badge: Platform (blue), Manual (purple), Rezervat (gray), Anulat (red) |
| Comanda | 120px | No | Link to order (if exists) |
| Actiuni | 80px | No | Void button (if not already voided) |

**Filters (above table):**

| Filter | Type | Options |
|--------|------|---------|
| Tip | Dropdown | Toate / Contract / Delegatie |
| An | Dropdown | 2026, 2025, ... (from available years) |
| Sursa | Dropdown | Toate / Platforma / Manual / Rezervat / Anulat |
| De la | Date picker | Start date |
| Pana la | Date picker | End date |
| Cautare | Text input | Search by client name, email, CNP, CUI |

**Voided rows** are displayed with strikethrough text and a red background tint.

### 11.6 Section D: Adauga Numar Manual (Dialog)

Triggered by the "+ Manual" button in Section C. Opens a Dialog for the lawyer's personal cases.

**Form fields:**

| Field | Type | Validation | Default |
|-------|------|------------|---------|
| Tip | Select: "Contract" / "Imputernicire" | Required | - |
| Nume client | Text input | Required | - |
| CNP | Text input (13 digits) | Optional | - |
| CUI | Text input | Optional | - |
| Email | Email input | Optional | - |
| Serviciu / Descriere | Text input | Optional | - |
| Suma (RON) | Number input | Optional | - |
| Data | Date picker | Required | Today |

**On submit:**
- Calls `POST /api/admin/settings/number-registry` with `source: 'manual'`.
- Shows allocated number in success toast: "Numar alocat: 4273 (Contract Asistenta 2026)".

### 11.7 Section E: Alerte

Alert banners displayed at the top of the tab when ranges are running low or exhausted.

**Alert levels:**

| Condition | Level | Message | Icon |
|-----------|-------|---------|------|
| Available < 10% of total | Warning (yellow) | "Interval {type} {year}: {percent}% utilizat ({available} ramase)" | AlertTriangle |
| Available = 0 (exhausted) | Error (red) | "Interval {type} {year} EPUIZAT! Adaugati un interval nou." | ShieldAlert |
| No active range for current year | Error (red) | "Nu exista interval activ pentru {type} {year}!" | ShieldAlert |

**Alerts are also shown** in the order detail page when generating documents:
- If generating contract-asistenta and no active contract range, show error and prevent generation.
- If generating imputernicire and no active delegation range, show error and prevent generation.

---

## 12. Cazuri Speciale (Edge Cases)

### 12.1 Granita de An (Year Boundary)

**Scenario:** Comanda plasata pe 31 decembrie 2026, documentele generate pe 2 ianuarie 2027.

**Regula:** Numarul se aloca pentru **anul datei de generare**, nu anul comenzii. Motivul: intervalele sunt pe an calendaristic, iar avocatul trebuie sa raporteze numerele in anul in care au fost efectiv folosite.

```typescript
// In allocate_number(): default year = current year at generation time
v_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
```

**Implicatie:** Admin-ul trebuie sa aiba intervale active configurate pentru anul 2027 inainte de generarea documentelor din ianuarie.

### 12.2 Epuizare Interval in Mijlocul Comenzii

**Scenario:** O comanda necesita 1 contract + 2 imputerniciri. Contractul se aloca cu succes, dar la a doua imputernicire intervalul se epuizeaza.

**Regula:** Nu se face rollback la numerele deja alocate. Contractul si prima imputernicire raman valide. Sistemul returneaza eroare pentru a doua imputernicire, iar admin-ul trebuie sa adauge un nou interval si sa regenereze documentul.

```
1. allocate_number('contract')       → 4271 ✓  (success)
2. allocate_number('delegation')     → 7738 ✓  (success, last number in range)
3. allocate_number('delegation')     → ERROR    (no active range available)
   → Admin adds new range 10000-12000
4. allocate_number('delegation')     → 10000 ✓ (success, from new range)
```

### 12.3 Concurenta (Concurrent Access)

**Scenario:** Doi operatori genereaza documente simultan.

**Solutie:** `FOR UPDATE` locking in `allocate_number()` serializes access to the same range row. The second transaction waits until the first commits or rolls back.

```sql
SELECT r.* INTO v_range
FROM number_ranges r
WHERE r.type = p_type AND r.year = v_year AND r.status = 'active'
ORDER BY r.range_start ASC
LIMIT 1
FOR UPDATE;  -- << Row-level lock
```

### 12.4 Numere Manuale si Gaps

**Scenario:** Avocatul aloca numere manual (4271, 4272, 4273), apoi platforma incearca sa aloce 4271.

**Solutie:** Numerele manuale sunt alocate prin aceeasi functie `allocate_number()`, deci `next_number` este incrementat secvential. Nu exista gap-uri la alocare.

**Dar daca avocatul vrea sa introduca un numar care a fost deja alocat in afara platformei (de mana)?** In acest caz, trebuie o functie `insert_manual_number` care:
1. Verifica ca numarul nu exista deja in `number_registry`.
2. Insereaza direct in registry fara a incrementa `next_number`.
3. Daca numarul este mai mic decat `next_number`, este un numar deja "trecut" -- se accepta.
4. Daca numarul este intre `next_number` si `range_end`, avanseaza `next_number` pana dupa el (sare peste).

Aceasta complexitate poate fi adaugata intr-o versiune ulterioara. Initial, alocarea manuala merge secvential (la fel ca platforma).

### 12.5 Regenerare Document

**Scenario:** Admin regenereaza un contract-asistenta pentru o comanda. Documentul vechi are numarul 4271.

**Regula:** Sistemul cauta mai intai `find_existing_number(order_id, 'contract')`. Daca gaseste numarul 4271 (non-voided), il reutilizeaza fara a aloca un nou numar.

```
1. find_existing_number(order_id, 'contract') → 4271
2. Use 4271 in template → no new allocation
3. Generate document, upload to S3, update order_documents
4. Delete old S3 object and old order_documents row
```

### 12.6 Tranzitie Non-Contigua

**Scenario:** Intervalul 4256-5256 este epuizat. Noul interval este 10000-12000.

**Comportament:** `allocate_number()` cauta prima range `active` ordonata dupa `range_start`. Dupa epuizarea primului interval (care devine `exhausted`), urmatoarea alocare gaseste automat intervalul 10000-12000.

```sql
WHERE r.type = p_type
  AND r.year = v_year
  AND r.status = 'active'
  AND r.next_number <= r.range_end
ORDER BY r.range_start ASC
LIMIT 1
```

### 12.7 Multiple Imputerniciri per Comanda

**Scenario:** O comanda de "Cazier Judiciar + Apostila" necesita 2 imputerniciri separate (una pentru cazier, una pentru apostila), dar un singur contract de asistenta.

**Abordare:** La generarea fiecarei imputerniciri, `find_existing_number` cauta numere existente de tip `delegation` pentru acea comanda. Daca exista deja una, trebuie sa verifice **cate** imputerniciri exista vs. cate sunt necesare.

**Implementare practica:** Functia `find_existing_number` se poate extinde cu un parametru `p_service_type` sau `p_description` care sa permita distinctia intre mai multe imputerniciri. Alternativ, se poate face count pe numere existente vs. cate trebuie generate.

**Decizie de design:** Pentru simplitate, fiecare apel `generate-document` cu template `imputernicire` primeste un parametru `purpose` (ex: "Cazier Judiciar", "Apostila"). `find_existing_number` se extinde:

```sql
CREATE OR REPLACE FUNCTION find_existing_number(
  p_order_id  UUID,
  p_type      TEXT,
  p_service_type TEXT DEFAULT NULL  -- optional: distinguish multiple delegations
)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT ...
  FROM number_registry nr
  WHERE nr.order_id = p_order_id
    AND nr.type = p_type
    AND nr.voided_at IS NULL
    AND (p_service_type IS NULL OR nr.service_type = p_service_type)
  ORDER BY nr.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### 12.8 Multi-Lawyer (Viitor)

**Situatie actuala:** Un singur avocat (Tarta Ana-Gabriela). Intervalele si registrul sunt implicite pentru acest avocat.

**Pregatire pentru viitor:** Schema include `created_by` pe ambele tabele. In viitor, se poate adauga o coloana `lawyer_id UUID REFERENCES profiles(id)` pe `number_ranges` si `number_registry` fara a modifica logica existenta.

---

## 13. Plan de Migrare

### Faza 1: Creare Tabele si Functii

Migration file: `supabase/migrations/027_number_registry.sql`

```sql
-- Full DDL for number_ranges and number_registry tables (from Section 6)
-- Full DDL for allocate_number, void_number, find_existing_number functions (from Section 7)
-- See sections 6 and 7 above for complete SQL
```

### Faza 2: Seed Intervale Initiale

Bazat pe valorile curente din `admin_settings.document_counters`:

```sql
-- Current state: contract_number = 4271, imputernicire_number = 5757
-- This means 4271 contracts and 5757 delegations have been issued so far
-- The ranges started at 4256 (contracts) and 5738 (delegations)

-- Seed contract range for 2026
INSERT INTO number_ranges (type, year, range_start, range_end, next_number, series, status, notes)
VALUES (
  'contract', 2026, 4256, 5256,
  (SELECT (value->>'contract_number')::INTEGER + 1 FROM admin_settings WHERE key = 'document_counters'),
  NULL, 'active',
  'Migrat din sistemul legacy. Counter la momentul migrarii: ' ||
  (SELECT value->>'contract_number' FROM admin_settings WHERE key = 'document_counters')
);

-- Seed delegation range for 2026
INSERT INTO number_ranges (type, year, range_start, range_end, next_number, series, status, notes)
VALUES (
  'delegation', 2026, 5738, 7738,
  (SELECT (value->>'imputernicire_number')::INTEGER + 1 FROM admin_settings WHERE key = 'document_counters'),
  'SM', 'active',
  'Migrat din sistemul legacy. Counter la momentul migrarii: ' ||
  (SELECT value->>'imputernicire_number' FROM admin_settings WHERE key = 'document_counters')
);
```

### Faza 3: Backfill Registru din `order_documents`

Populate `number_registry` from existing order_documents that have document numbers:

```sql
-- Backfill contract entries from existing order_documents
INSERT INTO number_registry (
  number, type, series, year,
  order_id, order_document_id,
  client_name, client_email, client_cnp, client_cui,
  service_type, source, date, created_at
)
SELECT
  CASE
    WHEN od.type IN ('contract_prestari', 'contract_asistenta', 'contract_complet')
    THEN NULLIF(REGEXP_REPLACE(od.document_number, '[^0-9]', '', 'g'), '')::INTEGER
    ELSE NULL
  END AS number,
  'contract' AS type,
  NULL AS series,
  EXTRACT(YEAR FROM od.created_at)::INTEGER AS year,
  od.order_id,
  od.id AS order_document_id,
  COALESCE(
    o.customer_data->'personalData'->>'firstName' || ' ' ||
    o.customer_data->'personalData'->>'lastName',
    o.customer_data->'companyData'->>'companyName',
    'N/A'
  ) AS client_name,
  o.customer_data->'contact'->>'email' AS client_email,
  o.customer_data->'personalData'->>'cnp' AS client_cnp,
  o.customer_data->'companyData'->>'cui' AS client_cui,
  s.name AS service_type,
  'platform' AS source,
  od.created_at::DATE AS date,
  od.created_at
FROM order_documents od
JOIN orders o ON o.id = od.order_id
LEFT JOIN services s ON s.id = o.service_id
WHERE od.type IN ('contract_asistenta', 'contract_complet')
  AND od.document_number IS NOT NULL
  AND od.document_number != ''
  AND REGEXP_REPLACE(od.document_number, '[^0-9]', '', 'g') != ''
ON CONFLICT (type, year, number) DO NOTHING;

-- Note: contract_prestari is excluded because it does not consume Barou numbers.
-- Backfill for imputerniciri would follow a similar pattern, but the current
-- system has a bug where imputernicire document_number stores the contract number.
-- Manual review may be needed for imputernicire backfill.
```

### Faza 4: Actualizare Cod

1. Update `src/lib/documents/auto-generate.ts`:
   - Replace `increment_document_counter('contract_number')` with `find_existing_number` + `allocate_number('contract')` (only for `contract-asistenta`).
   - Remove counter call for `contract-prestari`.

2. Update `src/app/api/admin/orders/[id]/generate-document/route.ts`:
   - Replace `increment_document_counter` calls with `allocate_number`.
   - Add reuse logic via `find_existing_number`.
   - Fix imputernicire `document_number` bug (store delegation number, not contract number).

3. Update `src/lib/documents/generator.ts`:
   - Update `DocumentContext.document_numbers` type to include `registry_ids`.

4. Create new files:
   - `src/types/number-registry.ts` -- TypeScript interfaces.
   - `src/app/api/admin/settings/number-ranges/route.ts` -- GET, POST.
   - `src/app/api/admin/settings/number-ranges/[id]/route.ts` -- PATCH.
   - `src/app/api/admin/settings/number-registry/route.ts` -- GET, POST.
   - `src/app/api/admin/settings/number-registry/[id]/void/route.ts` -- POST.
   - `src/app/api/admin/settings/number-registry/export/route.ts` -- GET (CSV).

5. Create admin registry page:
   - ~~Add "Registru Numere" tab to `src/app/admin/settings/page.tsx`.~~ (Originally planned as settings tab)
   - **Actual:** Created as standalone page `src/app/admin/registru/page.tsx` with sidebar navigation.

### Faza 5: Deprecare Sistem Vechi

```typescript
// In increment_document_counter RPC: add a deprecation notice
// but keep functional as fallback during transition

// Mark as deprecated in migration:
COMMENT ON FUNCTION increment_document_counter IS
  '@deprecated Use allocate_number() instead. Kept for backwards compatibility during migration.';
```

### Faza 6: Curatare

After verification (1-2 weeks of parallel operation):

1. Remove `increment_document_counter` function.
2. Remove `document_counters` entry from `admin_settings`.
3. Remove all references to `increment_document_counter` in TypeScript code.
4. Update `admin-document-system.md` Section 8 to reference this spec.

### Ordinea de Implementare

| Step | Description | Estimated Effort |
|------|-------------|-----------------|
| 1 | Create migration with tables + functions | 1 hour |
| 2 | Seed initial ranges from current counters | 30 min |
| 3 | Create TypeScript types | 30 min |
| 4 | Create API endpoints (7 routes) | 3 hours |
| 5 | Update auto-generate.ts + generate-document route | 2 hours |
| 6 | Build admin UI tab (settings page) | 4 hours |
| 7 | Backfill registry from existing data | 1 hour |
| 8 | Testing + edge case verification | 2 hours |
| 9 | Deprecate and remove old system | 30 min |
| **Total** | | **~14.5 hours** |

---

## 14. Evolutie Viitoare

### 14.1 Multi-Lawyer Support

Add `lawyer_id UUID REFERENCES profiles(id)` to both `number_ranges` and `number_registry`. Update `allocate_number()` to accept a `p_lawyer_id` parameter and filter ranges accordingly.

### 14.2 Automatic Range Request

When a range drops below a configurable threshold (e.g., 50 remaining), automatically send an email notification to the admin/lawyer reminding them to request new ranges from the Bar Association.

### 14.3 Cross-Year Number Audit

An annual audit report that shows:
- Total numbers allocated per year.
- Numbers voided per year.
- Gaps (numbers within ranges that were never allocated -- should not exist with sequential allocation).
- Comparison with Bar Association records.

### 14.4 Number Reservation System

Allow admins to reserve a block of numbers (e.g., 5 numbers) for upcoming orders before documents are generated. Useful for batch processing.

### 14.5 Integration with Oblio Invoicing

When Oblio invoicing is implemented, the invoice number could also be linked to the registry entry for complete financial tracking.

---

## 15. Key Files Reference

### New Files (to be created)

| File | Purpose |
|------|---------|
| `supabase/migrations/027_number_registry.sql` | Database migration: tables, functions, indexes, RLS policies, seed data |
| `src/types/number-registry.ts` | TypeScript type definitions for NumberRange, NumberRegistryEntry, etc. |
| `src/app/api/admin/settings/number-ranges/route.ts` | GET (list ranges) + POST (create range) |
| `src/app/api/admin/settings/number-ranges/[id]/route.ts` | PATCH (update/archive range) |
| `src/app/api/admin/settings/number-registry/route.ts` | GET (list registry) + POST (manual entry) |
| `src/app/api/admin/settings/number-registry/[id]/void/route.ts` | POST (void a number) |
| `src/app/api/admin/settings/number-registry/export/route.ts` | GET (CSV export) |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/documents/auto-generate.ts` | Replace `increment_document_counter` with `allocate_number` + reuse logic |
| `src/app/api/admin/orders/[id]/generate-document/route.ts` | Same replacement + fix imputernicire number bug |
| `src/lib/documents/generator.ts` | Extend `DocumentContext.document_numbers` type |
| `src/app/admin/registru/page.tsx` | **NEW:** Standalone registry page (moved from settings tab) with ranges, journal, manual entry, void, CSV export, document download icons |
| `src/app/admin/layout.tsx` | Added "Registru" sidebar navigation item with BookOpen icon |
| `docs/technical/specs/admin-document-system.md` | Update Section 8 to reference this spec |
| `docs/README.md` | Add link to this spec |
| `CLAUDE.md` | Add navigation entry for this spec |

### Related Documentation

| Document | Location |
|----------|----------|
| Admin Document System | `docs/technical/specs/admin-document-system.md` |
| Admin Panel Architecture | `docs/admin/architecture.md` |
| RBAC Permissions | `docs/admin/rbac-permissions.md` |
| Database Migrations Guide | `docs/deployment/DATABASE_MIGRATIONS.md` |
| Development Master Plan | `docs/DEVELOPMENT_MASTER_PLAN.md` |

---

**Last Updated:** 2026-02-18
