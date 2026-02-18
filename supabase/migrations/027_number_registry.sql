-- =============================================
-- Migration: 027_number_registry
-- Description: Number ranges and registry system for Bar Association numbers.
--              Replaces the simple counter in admin_settings with a proper
--              range-based allocation system with atomic locking, registry
--              journal, and reuse support.
-- Date: 2026-02-18
-- =============================================

-- =============================================
-- 0. ENABLE pg_trgm EXTENSION (for client search index)
-- =============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- 1. TABLE: number_ranges
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

-- Partial index for fast lookup of active ranges
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

-- =============================================
-- 2. TABLE: number_registry
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

-- Trigram search index on client fields for fast text search
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

-- =============================================
-- 3. FUNCTION: allocate_number
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

-- =============================================
-- 4. FUNCTION: void_number
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

-- =============================================
-- 5. FUNCTION: find_existing_number
-- Checks if a number has already been allocated for a given order, type,
-- and (optionally) service type. Used to prevent wasting numbers on regeneration.
-- =============================================
CREATE OR REPLACE FUNCTION find_existing_number(
  p_order_id      UUID,
  p_type          TEXT,          -- 'contract' or 'delegation'
  p_service_type  TEXT DEFAULT NULL  -- optional: distinguish multiple delegations per order
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
    AND (p_service_type IS NULL OR nr.service_type = p_service_type)
  ORDER BY nr.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_existing_number IS
  'Looks up an existing non-voided number allocation for an order and type. '
  'Used to reuse numbers during document regeneration instead of wasting new ones. '
  'Optional p_service_type parameter distinguishes multiple delegations per order.';

-- =============================================
-- 6. SEED INITIAL RANGES from current legacy counters
-- Contract range: 4256-5256 for 2026
-- Delegation range: 5738-7738 for 2026, series='SM'
-- next_number is set to current counter + 1 (the next number to allocate)
-- =============================================
INSERT INTO number_ranges (type, year, range_start, range_end, next_number, series, status, notes)
VALUES (
  'contract', 2026, 4256, 5256,
  (SELECT COALESCE((value->>'contract_number')::INTEGER, 4256) + 1
   FROM admin_settings WHERE key = 'document_counters'),
  NULL, 'active',
  'Migrat din sistemul legacy. Counter la momentul migrarii: ' ||
  (SELECT COALESCE(value->>'contract_number', '4256')
   FROM admin_settings WHERE key = 'document_counters')
);

INSERT INTO number_ranges (type, year, range_start, range_end, next_number, series, status, notes)
VALUES (
  'delegation', 2026, 5738, 7738,
  (SELECT COALESCE((value->>'imputernicire_number')::INTEGER, 5738) + 1
   FROM admin_settings WHERE key = 'document_counters'),
  'SM', 'active',
  'Migrat din sistemul legacy. Counter la momentul migrarii: ' ||
  (SELECT COALESCE(value->>'imputernicire_number', '5738')
   FROM admin_settings WHERE key = 'document_counters')
);

-- =============================================
-- 7. DEPRECATION COMMENT on legacy increment_document_counter function
-- =============================================
COMMENT ON FUNCTION increment_document_counter IS
  '@deprecated Use allocate_number() instead. This function is kept for backwards '
  'compatibility during the transition to the number_ranges/number_registry system. '
  'See migration 027_number_registry.sql and docs/technical/specs/number-registry-system.md.';

-- =============================================
-- Verification queries (run after migration):
-- SELECT tablename FROM pg_tables WHERE tablename IN ('number_ranges', 'number_registry');
-- SELECT * FROM number_ranges;
-- SELECT proname FROM pg_proc WHERE proname IN ('allocate_number', 'void_number', 'find_existing_number');
-- SELECT obj_description('increment_document_counter'::regproc);
-- =============================================
