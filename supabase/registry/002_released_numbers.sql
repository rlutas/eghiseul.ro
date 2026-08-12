-- =============================================================================
-- 002 — REUTILIZAREA NUMERELOR ELIBERATE (fără goluri în registru)
-- =============================================================================
-- Proiectul dedicat de registru central (Baroul Satu Mare).
--
-- Problemă: `void_number` marchează numărul consumat pentru totdeauna, deci
-- orice anulare lasă un GOL în registrul fizic al cabinetului. Când numărul a
-- fost alocat din greșeală (ex. contract de asistență generat pe un serviciu
-- fără avocat — bugul reparat 2026-08-12), golul nu are nicio justificare.
--
-- Soluție: o listă de numere ELIBERATE (`released_numbers`). `release_number()`
-- scoate intrarea greșită din jurnal și pune numărul înapoi în circulație;
-- `allocate_number()` consumă întâi cel mai mic număr eliberat și abia apoi
-- avansează `next_number`. Jurnalul rămâne curat: fiecare număr apare o
-- singură dată, pe comanda care chiar îl folosește; urma greșelii rămâne în
-- `released_numbers` (cine, când, de ce, ce alocare a fost ștearsă).
--
-- NB: `void_number` rămâne neschimbat — pentru contracte REALE anulate (numărul
-- rămâne consumat, cu mențiune, așa cum cere registrul). `release_number` se
-- folosește DOAR pentru alocări care n-ar fi trebuit să existe.
-- =============================================================================

-- =============================================
-- 1. TABLE: released_numbers (free list)
-- =============================================
CREATE TABLE IF NOT EXISTS released_numbers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  type               TEXT NOT NULL CHECK (type IN ('contract', 'delegation')),
  year               INTEGER NOT NULL,
  number             INTEGER NOT NULL,
  series             TEXT,
  range_id           UUID REFERENCES number_ranges(id) ON DELETE SET NULL,

  -- Urma alocării greșite (rândul din number_registry a fost șters).
  prev_platform      TEXT,
  prev_order_ref     TEXT,
  prev_client_name   TEXT,
  prev_created_at    TIMESTAMPTZ,

  released_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_by        TEXT,
  reason             TEXT,

  -- Reconsumare
  consumed_at        TIMESTAMPTZ,
  consumed_registry_id UUID,

  CONSTRAINT unique_released_number UNIQUE (type, year, number)
);

CREATE INDEX IF NOT EXISTS idx_released_numbers_free
  ON released_numbers (type, year, number)
  WHERE consumed_at IS NULL;

ALTER TABLE released_numbers ENABLE ROW LEVEL SECURITY;
-- Fără policies, intenționat: doar service_role (bypass RLS) are acces.

COMMENT ON TABLE released_numbers IS
  'Numere scoase din jurnal pentru că au fost alocate greșit. allocate_number le reconsumă înaintea lui next_number, ca registrul fizic să nu aibă goluri.';

-- =============================================
-- 2. FUNCTION: release_number
-- =============================================
-- Scoate o intrare din jurnal și pune numărul înapoi în circulație.
-- Idempotentă pe număr: dacă numărul e deja eliberat și neconsumat, nu face
-- nimic (returnează FALSE).
CREATE OR REPLACE FUNCTION release_number(
  p_registry_id   UUID,
  p_released_by   TEXT,
  p_reason        TEXT DEFAULT NULL
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

  INSERT INTO released_numbers (
    type, year, number, series, range_id,
    prev_platform, prev_order_ref, prev_client_name, prev_created_at,
    released_by, reason
  ) VALUES (
    v_entry.type, v_entry.year, v_entry.number, v_entry.series, v_entry.range_id,
    v_entry.platform, v_entry.order_ref, v_entry.client_name, v_entry.created_at,
    p_released_by, p_reason
  )
  ON CONFLICT (type, year, number) DO NOTHING;

  IF NOT FOUND THEN
    -- Numărul era deja în lista de eliberate (release rulat de două ori).
    RETURN FALSE;
  END IF;

  DELETE FROM number_registry WHERE id = p_registry_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION release_number IS
  'Șterge o alocare greșită din jurnal și pune numărul în released_numbers, de unde allocate_number îl reconsumă. Pentru contracte REALE anulate folosește void_number.';

-- =============================================
-- 3. FUNCTION: allocate_number (consumă întâi numerele eliberate)
-- =============================================
CREATE OR REPLACE FUNCTION allocate_number(
  p_type            TEXT,
  p_year            INTEGER DEFAULT NULL,
  p_platform        TEXT DEFAULT NULL,
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
  v_free        RECORD;
  v_number      INTEGER;
  v_series      TEXT;
  v_range_id    UUID;
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

  -- Numere ELIBERATE: se reconsumă înaintea lui next_number, cel mai mic
  -- întâi, ca registrul fizic să nu rămână cu goluri. SKIP LOCKED = două
  -- alocări concurente iau numere diferite, nu se blochează una pe alta.
  SELECT rn.* INTO v_free
  FROM released_numbers rn
  WHERE rn.type = p_type
    AND rn.year = v_year
    AND rn.consumed_at IS NULL
  ORDER BY rn.number ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF FOUND THEN
    v_number   := v_free.number;
    v_series   := v_free.series;
    v_range_id := v_free.range_id;

    INSERT INTO number_registry (
      range_id, number, type, series, year,
      platform, order_ref, order_document_ref,
      client_name, client_email, client_cnp, client_cui,
      service_type, description, amount,
      source, date, created_by
    ) VALUES (
      v_range_id, v_number, p_type, v_series, v_year,
      p_platform, p_order_ref, p_order_doc_ref,
      p_client_name, p_client_email, p_client_cnp, p_client_cui,
      p_service_type, p_description, p_amount,
      p_source, p_date, p_created_by
    )
    RETURNING id INTO v_registry_id;

    UPDATE released_numbers
    SET consumed_at = NOW(),
        consumed_registry_id = v_registry_id
    WHERE id = v_free.id;

    RETURN QUERY SELECT v_number, v_series, v_year, v_range_id, v_registry_id, FALSE;
    RETURN;
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
  'Idempotent atomic allocation: existing live allocation for (platform, order_ref, type, service_type) → altfel cel mai mic număr din released_numbers → altfel next_number din prima gamă activă. Raises P0002 când nu există gamă activă.';
