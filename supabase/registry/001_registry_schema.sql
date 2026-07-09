-- =============================================================================
-- CENTRAL NUMBER REGISTRY — dedicated Supabase project
-- =============================================================================
-- Single source of truth for Bar Association (Baroul Satu Mare) numbers used
-- by ALL platforms: eghiseul.ro, cazierjudiciaronline.com, ecazier.ro.
-- Ported from eghiseul.ro migration 027_number_registry.sql with adaptations:
--   * no cross-DB FKs: order_id/order_document_id (UUID FK) → platform +
--     order_ref + order_document_ref (TEXT)
--   * created_by/voided_by → TEXT (no profiles table here)
--   * allocate_number is IDEMPOTENT per (platform, order_ref, type,
--     service_type) — safe to call from Stripe webhooks that fire repeatedly
--   * RLS enabled with ZERO policies: only the service_role key (used
--     server-side by the platforms) can touch these tables
--
-- Numbers are allocated ONLY after successful payment (enforced by callers).
-- Ranges are COMMON across platforms (one shared sequence, user decision).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- 1. TABLE: number_ranges
-- =============================================
CREATE TABLE number_ranges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('contract', 'delegation')),
  year          INTEGER NOT NULL CHECK (year >= 2024 AND year <= 2100),
  range_start   INTEGER NOT NULL CHECK (range_start > 0),
  range_end     INTEGER NOT NULL CHECK (range_end > 0),
  next_number   INTEGER NOT NULL,
  series        TEXT,              -- e.g. 'SM' for delegations; NULL for contracts
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'exhausted', 'archived')),
  notes         TEXT,
  created_by    TEXT,              -- admin email or 'migrated'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT range_start_lte_end CHECK (range_start <= range_end),
  CONSTRAINT next_number_in_range CHECK (
    next_number >= range_start AND next_number <= range_end + 1
  )
);

CREATE INDEX idx_number_ranges_type_year_status
  ON number_ranges(type, year, status)
  WHERE status = 'active';

CREATE INDEX idx_number_ranges_year ON number_ranges(year);

ALTER TABLE number_ranges ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only service_role (bypasses RLS) has access.

COMMENT ON TABLE number_ranges IS
  'Finite number ranges assigned by the Bar Association (Baroul Satu Mare) per year. Shared across eghiseul.ro / cazierjudiciaronline.com / ecazier.ro.';
COMMENT ON COLUMN number_ranges.next_number IS
  'Next number to be allocated. When next_number > range_end, range is exhausted.';

-- =============================================
-- 2. TABLE: number_registry (journal)
-- =============================================
CREATE TABLE number_registry (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Number identification
  range_id           UUID REFERENCES number_ranges(id) ON DELETE SET NULL,
  number             INTEGER NOT NULL,
  type               TEXT NOT NULL CHECK (type IN ('contract', 'delegation')),
  series             TEXT,
  year               INTEGER NOT NULL,

  -- Cross-platform order link (nullable for manual/personal entries)
  platform           TEXT CHECK (platform IN ('eghiseul', 'cazierjudiciaronline', 'ecazier')),
  order_ref          TEXT,          -- eghiseul: friendly_order_id (E-XXXXXX-YYYYY); CJO/ecazier: order_number (CJO-/EJC-...)
  order_document_ref TEXT,          -- platform-local document id (free text, no FK)

  -- Client information (denormalized for registry export)
  client_name        TEXT NOT NULL,
  client_email       TEXT,
  client_cnp         TEXT,
  client_cui         TEXT,

  -- Service and financial information
  service_type       TEXT,
  description        TEXT,
  amount             DECIMAL(10,2),

  -- Allocation metadata
  source             TEXT NOT NULL DEFAULT 'platform'
                     CHECK (source IN ('platform', 'manual', 'reserved', 'voided')),
  date               DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by         TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),

  -- Voiding
  voided_at          TIMESTAMPTZ,
  voided_by          TEXT,
  void_reason        TEXT,

  CONSTRAINT unique_number_per_type_year UNIQUE (type, year, number)
);

CREATE INDEX idx_number_registry_type_year ON number_registry(type, year);
CREATE INDEX idx_number_registry_platform_order
  ON number_registry(platform, order_ref)
  WHERE platform IS NOT NULL;
CREATE INDEX idx_number_registry_source ON number_registry(source);
CREATE INDEX idx_number_registry_date ON number_registry(date);

CREATE INDEX idx_number_registry_client_search
  ON number_registry USING gin (
    (client_name || ' ' || COALESCE(client_email, '') || ' ' || COALESCE(client_cnp, '') || ' ' || COALESCE(client_cui, ''))
    gin_trgm_ops
  );

-- Idempotency backstop: at most ONE live (non-voided) allocation per
-- (platform, order, type, service_type). Webhook double-fire cannot allocate
-- twice even if two transactions race past the in-function checks.
CREATE UNIQUE INDEX uniq_platform_order_allocation
  ON number_registry (platform, order_ref, type, COALESCE(service_type, ''))
  WHERE platform IS NOT NULL AND order_ref IS NOT NULL AND voided_at IS NULL;

ALTER TABLE number_registry ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only service_role (bypasses RLS) has access.

COMMENT ON TABLE number_registry IS
  'Complete journal of every Bar number consumed, voided, or manually allocated — across all platforms. Used for reporting and audit.';
COMMENT ON COLUMN number_registry.platform IS
  'Which platform consumed the number. NULL for manual/personal-use entries.';
COMMENT ON COLUMN number_registry.order_ref IS
  'Platform-local order reference: eghiseul friendly_order_id, CJO/ecazier order_number.';

-- =============================================
-- 3. FUNCTION: allocate_number (IDEMPOTENT)
-- =============================================
-- Returns the existing live allocation for (platform, order_ref, type,
-- service_type) when there is one (reused = TRUE), otherwise atomically
-- allocates the next number from the first active range (FOR UPDATE lock).
-- Raises P0002 when no active range exists.
CREATE OR REPLACE FUNCTION allocate_number(
  p_type            TEXT,                -- 'contract' | 'delegation'
  p_year            INTEGER DEFAULT NULL,
  p_platform        TEXT DEFAULT NULL,   -- 'eghiseul' | 'cazierjudiciaronline' | 'ecazier'
  p_order_ref       TEXT DEFAULT NULL,
  p_order_doc_ref   TEXT DEFAULT NULL,
  p_client_name     TEXT DEFAULT '',
  p_client_email    TEXT DEFAULT NULL,
  p_client_cnp      TEXT DEFAULT NULL,
  p_client_cui      TEXT DEFAULT NULL,
  p_service_type    TEXT DEFAULT NULL,
  p_description     TEXT DEFAULT NULL,
  p_amount          DECIMAL DEFAULT NULL,
  p_source          TEXT DEFAULT 'platform',
  p_date            DATE DEFAULT CURRENT_DATE,
  p_created_by      TEXT DEFAULT NULL
)
RETURNS TABLE (
  allocated_number  INTEGER,
  allocated_series  TEXT,
  allocated_year    INTEGER,
  range_id          UUID,
  registry_id       UUID,
  reused            BOOLEAN
) AS $$
DECLARE
  v_year        INTEGER;
  v_existing    RECORD;
  v_range       RECORD;
  v_number      INTEGER;
  v_registry_id UUID;
BEGIN
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);

  -- Fast path: an order-linked allocation already exists → return it.
  IF p_platform IS NOT NULL AND p_order_ref IS NOT NULL THEN
    SELECT nr.id, nr.number, nr.series, nr.year, nr.range_id AS rid
    INTO v_existing
    FROM number_registry nr
    WHERE nr.platform = p_platform
      AND nr.order_ref = p_order_ref
      AND nr.type = p_type
      AND COALESCE(nr.service_type, '') = COALESCE(p_service_type, '')
      AND nr.voided_at IS NULL
    ORDER BY nr.created_at DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN QUERY SELECT v_existing.number, v_existing.series, v_existing.year,
                          v_existing.rid, v_existing.id, TRUE;
      RETURN;
    END IF;
  END IF;

  -- Lock the first active range for this type/year.
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
      USING ERRCODE = 'P0002';
  END IF;

  -- Re-check after acquiring the lock: a concurrent webhook may have
  -- committed an allocation while we waited for the range row.
  IF p_platform IS NOT NULL AND p_order_ref IS NOT NULL THEN
    SELECT nr.id, nr.number, nr.series, nr.year, nr.range_id AS rid
    INTO v_existing
    FROM number_registry nr
    WHERE nr.platform = p_platform
      AND nr.order_ref = p_order_ref
      AND nr.type = p_type
      AND COALESCE(nr.service_type, '') = COALESCE(p_service_type, '')
      AND nr.voided_at IS NULL
    ORDER BY nr.created_at DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN QUERY SELECT v_existing.number, v_existing.series, v_existing.year,
                          v_existing.rid, v_existing.id, TRUE;
      RETURN;
    END IF;
  END IF;

  v_number := v_range.next_number;

  UPDATE number_ranges
  SET next_number = v_range.next_number + 1,
      updated_at = NOW(),
      status = CASE
        WHEN v_range.next_number + 1 > v_range.range_end THEN 'exhausted'
        ELSE status
      END
  WHERE id = v_range.id;

  BEGIN
    INSERT INTO number_registry (
      range_id, number, type, series, year,
      platform, order_ref, order_document_ref,
      client_name, client_email, client_cnp, client_cui,
      service_type, description, amount,
      source, date, created_by
    ) VALUES (
      v_range.id, v_number, p_type, v_range.series, v_year,
      p_platform, p_order_ref, p_order_doc_ref,
      p_client_name, p_client_email, p_client_cnp, p_client_cui,
      p_service_type, p_description, p_amount,
      p_source, p_date, p_created_by
    )
    RETURNING id INTO v_registry_id;
  EXCEPTION WHEN unique_violation THEN
    -- Backstop: uniq_platform_order_allocation fired — someone else won the
    -- race between our re-check and our insert. Return their allocation.
    -- (The advanced next_number stays advanced: one wasted number in an
    -- astronomically rare race beats a failed payment webhook.)
    SELECT nr.id, nr.number, nr.series, nr.year, nr.range_id AS rid
    INTO v_existing
    FROM number_registry nr
    WHERE nr.platform = p_platform
      AND nr.order_ref = p_order_ref
      AND nr.type = p_type
      AND COALESCE(nr.service_type, '') = COALESCE(p_service_type, '')
      AND nr.voided_at IS NULL
    ORDER BY nr.created_at DESC
    LIMIT 1;

    RETURN QUERY SELECT v_existing.number, v_existing.series, v_existing.year,
                        v_existing.rid, v_existing.id, TRUE;
    RETURN;
  END;

  RETURN QUERY SELECT v_number, v_range.series, v_year, v_range.id, v_registry_id, FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION allocate_number IS
  'Idempotent atomic allocation: returns the existing live allocation for (platform, order_ref, type, service_type) or allocates the next number from an active range. Raises P0002 when no active range.';

-- =============================================
-- 4. FUNCTION: void_number
-- =============================================
CREATE OR REPLACE FUNCTION void_number(
  p_registry_id   UUID,
  p_voided_by     TEXT,
  p_void_reason   TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_entry RECORD;
BEGIN
  SELECT * INTO v_entry
  FROM number_registry
  WHERE id = p_registry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registry entry % not found', p_registry_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_entry.voided_at IS NOT NULL THEN
    RAISE EXCEPTION 'Registry entry % is already voided', p_registry_id
      USING ERRCODE = 'P0003';
  END IF;

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
-- =============================================
CREATE OR REPLACE FUNCTION find_existing_number(
  p_platform      TEXT,
  p_order_ref     TEXT,
  p_type          TEXT,
  p_service_type  TEXT DEFAULT NULL
)
RETURNS TABLE (
  registry_id       UUID,
  existing_number   INTEGER,
  existing_series   TEXT,
  existing_year     INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT nr.id, nr.number, nr.series, nr.year
  FROM number_registry nr
  WHERE nr.platform = p_platform
    AND nr.order_ref = p_order_ref
    AND nr.type = p_type
    AND nr.voided_at IS NULL
    AND (p_service_type IS NULL OR nr.service_type = p_service_type)
  ORDER BY nr.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_existing_number IS
  'Looks up an existing non-voided allocation for (platform, order_ref, type[, service_type]). Used for cross-references (e.g. contract number on the împuternicire).';

-- =============================================
-- Verification (run after applying):
-- SELECT tablename FROM pg_tables WHERE tablename IN ('number_ranges','number_registry');
-- SELECT proname FROM pg_proc WHERE proname IN ('allocate_number','void_number','find_existing_number');
-- SELECT * FROM allocate_number('contract');  -- expect P0002 (no ranges yet)
-- =============================================
