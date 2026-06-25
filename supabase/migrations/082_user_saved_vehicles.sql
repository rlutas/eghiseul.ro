-- Migration 082: mașini salvate per user (reutilizare în wizard + reminder expirări)
--
-- Clientul își poate salva mașinile (nr înmatriculare + date) + termenele ITP /
-- asigurare (RCA) / rovinietă, ca să le refolosească la comandă (cazier auto,
-- rovinietă) și să primească reminder când expiră.

CREATE TABLE IF NOT EXISTS user_saved_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label VARCHAR(100),                 -- ex. „Golf alb", „Mașina de serviciu"
  plate_number VARCHAR(20) NOT NULL,  -- nr înmatriculare (ex. „SM 12 ABC")
  vin VARCHAR(20),                    -- serie șasiu (VIN, 17)
  brand VARCHAR(60),
  model VARCHAR(60),
  year INTEGER,
  driving_license VARCHAR(40),        -- nr permis conducere
  itp_expiry DATE,                    -- expirare ITP
  insurance_expiry DATE,              -- expirare asigurare RCA
  rovinieta_expiry DATE,              -- expirare rovinietă
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_vehicles_user ON user_saved_vehicles(user_id);
-- O singură mașină „default" per user.
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_vehicles_default
  ON user_saved_vehicles(user_id) WHERE is_default = TRUE;

ALTER TABLE user_saved_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles"
  ON user_saved_vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles"
  ON user_saved_vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles"
  ON user_saved_vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles"
  ON user_saved_vehicles FOR DELETE USING (auth.uid() = user_id);
