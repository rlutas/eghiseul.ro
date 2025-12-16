-- =============================================
-- Migration: 002_services
-- Description: Create services, orders, and service_options tables with RLS
-- Date: 2025-12-16
-- Sprint: Sprint 2 - Services Core
-- =============================================

-- =============================================
-- SERVICES TABLE
-- =============================================
-- Stores service definitions with configuration JSON
-- Supports: Cazier Fiscal, Extras CF, Certificat Constatator (MVP services)

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,  -- e.g., SRV-001, SRV-030, SRV-031
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category VARCHAR(100) NOT NULL CHECK (category IN ('fiscale', 'juridice', 'imobiliare', 'comerciale', 'auto', 'personale')),

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  currency VARCHAR(3) DEFAULT 'RON',

  -- Status and availability
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  requires_kyc BOOLEAN DEFAULT TRUE,

  -- Processing time
  estimated_days INTEGER DEFAULT 5,  -- normal processing time
  urgent_available BOOLEAN DEFAULT TRUE,
  urgent_days INTEGER DEFAULT 2,

  -- Configuration JSON structure:
  -- {
  --   "required_fields": ["cnp", "first_name", "last_name", "birth_date"],
  --   "optional_fields": ["company_name", "cui"],
  --   "delivery_methods": ["email", "registered_mail", "courier"],
  --   "validation_rules": {
  --     "cnp": {"type": "regex", "pattern": "^[1-9]\\d{12}$"},
  --     "cui": {"type": "anaf_api", "validate_online": true}
  --   },
  --   "document_templates": {
  --     "contract": "contracts/cazier-fiscal-contract.pdf",
  --     "instructions": "instructions/cazier-fiscal.md"
  --   },
  --   "kyc_requirements": {
  --     "identity_card": true,
  --     "selfie": true,
  --     "signature": true
  --   }
  -- }
  config JSONB NOT NULL DEFAULT '{}',

  -- Metadata
  display_order INTEGER DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_code ON services(code);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_services_config ON services USING GIN (config);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view active services
CREATE POLICY "Public can view active services"
  ON services
  FOR SELECT
  USING (is_active = TRUE);

-- RLS Policy: Admins can view all services
CREATE POLICY "Admins can view all services"
  ON services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Admins can insert services
CREATE POLICY "Admins can insert services"
  ON services
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Admins can update services
CREATE POLICY "Admins can update services"
  ON services
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Admins can delete services
CREATE POLICY "Admins can delete services"
  ON services
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- SERVICE_OPTIONS TABLE
-- =============================================
-- Stores optional add-ons for services (urgenta, traducere, apostila, etc.)

CREATE TABLE IF NOT EXISTS service_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,  -- e.g., 'urgenta', 'traducere_en', 'apostila'
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  price_type VARCHAR(20) DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'percentage')),

  -- Configuration
  is_active BOOLEAN DEFAULT TRUE,
  is_required BOOLEAN DEFAULT FALSE,  -- some options may be mandatory
  max_quantity INTEGER DEFAULT 1,     -- e.g., multiple copies

  -- Configuration JSON:
  -- {
  --   "affects_delivery_time": true,
  --   "delivery_days_reduction": 3,
  --   "additional_fields": ["target_language"],
  --   "dependencies": ["apostila_requires_traducere"],
  --   "conflicts_with": ["standard_delivery"]
  -- }
  config JSONB DEFAULT '{}',

  -- Display
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(100),  -- icon name for UI

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one option code per service
  UNIQUE(service_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_options_service_id ON service_options(service_id);
CREATE INDEX IF NOT EXISTS idx_service_options_active ON service_options(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_service_options_code ON service_options(code);

-- Enable Row Level Security
ALTER TABLE service_options ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view active options for active services
CREATE POLICY "Public can view active service options"
  ON service_options
  FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_options.service_id
      AND services.is_active = TRUE
    )
  );

-- RLS Policy: Admins can manage all options
CREATE POLICY "Admins can view all service options"
  ON service_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert service options"
  ON service_options
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update service options"
  ON service_options
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete service options"
  ON service_options
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- ORDERS TABLE
-- =============================================
-- Stores customer orders with complete order lifecycle

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,  -- Format: YYYY-NNNNNN (e.g., 2025-000001)

  -- References
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- for future partner orders

  -- Order status
  -- Lifecycle: draft -> pending -> processing -> kyc_pending -> kyc_approved ->
  --            in_progress -> document_ready -> shipped -> delivered -> completed
  -- Alternative paths: kyc_rejected, cancelled, refunded
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
    'draft',           -- Order being created
    'pending',         -- Payment pending
    'processing',      -- Payment received, order processing
    'kyc_pending',     -- Waiting for KYC documents
    'kyc_approved',    -- KYC approved, can proceed
    'kyc_rejected',    -- KYC rejected, needs resubmission
    'in_progress',     -- Document being obtained
    'document_ready',  -- Document ready for delivery
    'shipped',         -- Document shipped to customer
    'delivered',       -- Document delivered
    'completed',       -- Order completed successfully
    'cancelled',       -- Order cancelled
    'refunded'         -- Order refunded
  )),

  -- Customer data (collected during order flow)
  -- Structure depends on service.config.required_fields
  -- Example for Cazier Fiscal:
  -- {
  --   "personal": {
  --     "cnp": "1850101123456",
  --     "first_name": "Ion",
  --     "last_name": "Popescu",
  --     "birth_date": "1985-01-01",
  --     "birth_place": "Bucuresti",
  --     "address": "Str. Example nr. 1, Sector 1, Bucuresti"
  --   },
  --   "contact": {
  --     "email": "ion.popescu@example.com",
  --     "phone": "+40712345678",
  --     "preferred_contact": "email"
  --   },
  --   "purpose": "Obținere loc de muncă"
  -- }
  customer_data JSONB NOT NULL DEFAULT '{}',

  -- Selected options
  -- {
  --   "urgenta": {"quantity": 1, "price": 100.00},
  --   "traducere_en": {"quantity": 1, "price": 50.00}
  -- }
  selected_options JSONB DEFAULT '{}',

  -- Delivery information
  delivery_method VARCHAR(50) CHECK (delivery_method IN ('email', 'registered_mail', 'courier')),
  delivery_address JSONB,  -- Full address for physical delivery
  delivery_tracking_number VARCHAR(255),
  delivery_tracking_url TEXT,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  options_price DECIMAL(10,2) DEFAULT 0.00,
  delivery_price DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RON',

  -- Payment information
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  )),
  payment_method VARCHAR(50),  -- 'card', 'apple_pay', 'google_pay'
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  paid_at TIMESTAMPTZ,

  -- KYC documents (S3 URLs)
  kyc_documents JSONB DEFAULT '{}',
  -- {
  --   "identity_card_front": "s3://bucket/kyc/user_id/order_id/ci_front.jpg",
  --   "identity_card_back": "s3://bucket/kyc/user_id/order_id/ci_back.jpg",
  --   "selfie": "s3://bucket/kyc/user_id/order_id/selfie.jpg",
  --   "signature": "base64_signature_data",
  --   "ocr_data": {
  --     "cnp": "1850101123456",
  --     "name": "ION POPESCU",
  --     "confidence": 0.98
  --   }
  -- }
  kyc_verified_at TIMESTAMPTZ,
  kyc_verified_by UUID REFERENCES profiles(id),
  kyc_rejection_reason TEXT,

  -- Contract and documents
  contract_url TEXT,
  contract_signed_at TIMESTAMPTZ,
  final_document_url TEXT,
  final_document_uploaded_at TIMESTAMPTZ,

  -- Invoicing
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  invoice_issued_at TIMESTAMPTZ,

  -- Admin notes and internal tracking
  admin_notes TEXT,
  internal_status_notes JSONB DEFAULT '[]',  -- Array of timestamped notes
  assigned_to UUID REFERENCES profiles(id),  -- Admin assigned to this order

  -- Estimated dates
  estimated_completion_date DATE,
  actual_completion_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,  -- When customer submitted the order
  cancelled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_number INTEGER;
  new_order_number TEXT;
BEGIN
  -- Get current year
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM '\d{6}$') AS INTEGER)
  ), 0) + 1 INTO seq_number
  FROM orders
  WHERE order_number LIKE year_part || '-%';

  -- Format: YYYY-NNNNNN (e.g., 2025-000001)
  new_order_number := year_part || '-' || LPAD(seq_number::TEXT, 6, '0');

  NEW.order_number := new_order_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate order number
DROP TRIGGER IF EXISTS orders_generate_number ON orders;
CREATE TRIGGER orders_generate_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_partner_id ON orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_submitted_at ON orders(submitted_at DESC) WHERE submitted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON orders(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- GIN indexes for JSONB columns (fast querying)
CREATE INDEX IF NOT EXISTS idx_orders_customer_data ON orders USING GIN (customer_data);
CREATE INDEX IF NOT EXISTS idx_orders_selected_options ON orders USING GIN (selected_options);
CREATE INDEX IF NOT EXISTS idx_orders_kyc_documents ON orders USING GIN (kyc_documents);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own draft orders
CREATE POLICY "Users can update own draft orders"
  ON orders
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status IN ('draft', 'kyc_pending')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('draft', 'kyc_pending')
  );

-- RLS Policy: Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Partners can view their orders
CREATE POLICY "Partners can view their orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'partner'
      AND auth.uid() = orders.partner_id
    )
  );

-- Trigger: Auto-update updated_at timestamp
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger: Set submitted_at when status changes from draft
CREATE OR REPLACE FUNCTION set_order_submitted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'draft' AND NEW.status != 'draft' AND NEW.submitted_at IS NULL THEN
    NEW.submitted_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_set_submitted_at ON orders;
CREATE TRIGGER orders_set_submitted_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_submitted_at();

-- Trigger: Calculate estimated completion date
CREATE OR REPLACE FUNCTION calculate_estimated_completion()
RETURNS TRIGGER AS $$
DECLARE
  service_days INTEGER;
  is_urgent BOOLEAN;
BEGIN
  -- Only calculate if service_id is set and estimated date is not set
  IF NEW.service_id IS NOT NULL AND NEW.estimated_completion_date IS NULL THEN
    -- Check if urgenta option is selected
    is_urgent := (NEW.selected_options ? 'urgenta');

    -- Get estimated days from service
    IF is_urgent THEN
      SELECT urgent_days INTO service_days
      FROM services
      WHERE id = NEW.service_id;
    ELSE
      SELECT estimated_days INTO service_days
      FROM services
      WHERE id = NEW.service_id;
    END IF;

    -- Calculate estimated date (exclude weekends)
    NEW.estimated_completion_date := (
      CURRENT_DATE + (service_days || ' days')::INTERVAL +
      (service_days / 5 * 2 || ' days')::INTERVAL  -- Add weekends
    )::DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_calculate_estimated_completion ON orders;
CREATE TRIGGER orders_calculate_estimated_completion
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION calculate_estimated_completion();

-- =============================================
-- ORDER HISTORY TABLE (Audit Log)
-- =============================================
-- Track all status changes and important events

CREATE TABLE IF NOT EXISTS order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id),

  -- What changed
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'created', 'status_changed', 'payment_received', 'kyc_submitted',
    'kyc_approved', 'kyc_rejected', 'document_uploaded', 'shipped',
    'delivered', 'cancelled', 'refunded', 'note_added', 'assigned'
  )),

  old_value JSONB,
  new_value JSONB,

  -- Additional context
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- IP and user agent for security
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_created_at ON order_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_event_type ON order_history(event_type);

-- Enable Row Level Security
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view history of their own orders
CREATE POLICY "Users can view own order history"
  ON order_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can view all history
CREATE POLICY "Admins can view all order history"
  ON order_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: System can insert history
CREATE POLICY "System can insert order history"
  ON order_history
  FOR INSERT
  WITH CHECK (true);

-- Trigger: Auto-log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_history (
      order_id, changed_by, event_type, old_value, new_value
    ) VALUES (
      NEW.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_log_status_change ON orders;
CREATE TRIGGER orders_log_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- =============================================
-- INITIAL DATA: MVP Services
-- =============================================

-- Service 1: Cazier Fiscal
INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, display_order, is_featured
) VALUES (
  'cazier-fiscal',
  'SRV-001',
  'Cazier Fiscal',
  'Obținem pentru tine cazierul fiscal de la ANAF. Documentul atestă că nu ai datorii la bugetul de stat și este valabil 30 de zile.',
  'Document ANAF care atestă lipsa datoriilor fiscale. Valabil 30 zile.',
  'fiscale',
  149.00,
  TRUE,
  5,
  2,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "birth_date", "address", "phone", "email"],
    "optional_fields": ["company_name", "cui"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "validation_rules": {
      "cnp": {
        "type": "regex",
        "pattern": "^[1-9]\\\\d{12}$",
        "message": "CNP invalid. Trebuie să conțină 13 cifre."
      }
    },
    "document_templates": {
      "contract": "contracts/cazier-fiscal-contract.pdf",
      "instructions": "instructions/cazier-fiscal.md"
    },
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    },
    "processing_steps": [
      "Verificare documente KYC",
      "Generare procură",
      "Depunere cerere la ANAF",
      "Ridicare cazier fiscal",
      "Livrare către client"
    ]
  }',
  1,
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Service 2: Extras Carte Funciară
INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, display_order, is_featured
) VALUES (
  'extras-carte-funciara',
  'SRV-031',
  'Extras Carte Funciară',
  'Obținem extrasul de carte funciară (CF) de la OCPI. Documentul conține toate informațiile despre un imobil: proprietar, suprafață, sarcini.',
  'Document OCPI cu informații complete despre un imobil.',
  'imobiliare',
  99.00,
  TRUE,
  5,
  2,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "phone", "email", "nr_cadastral"],
    "optional_fields": ["judet", "localitate", "adresa_imobil"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "validation_rules": {
      "nr_cadastral": {
        "type": "regex",
        "pattern": "^\\\\d+$",
        "message": "Număr cadastral invalid."
      }
    },
    "document_templates": {
      "contract": "contracts/carte-funciara-contract.pdf",
      "instructions": "instructions/carte-funciara.md"
    },
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    },
    "processing_steps": [
      "Verificare documente KYC",
      "Identificare imobil în baza ANCPI",
      "Depunere cerere la OCPI",
      "Ridicare extras CF",
      "Livrare către client"
    ]
  }',
  2,
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Service 3: Certificat Constatator
INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, display_order, is_featured
) VALUES (
  'certificat-constatator',
  'SRV-030',
  'Certificat Constatator',
  'Obținem certificatul constatator de la ONRC pentru o societate comercială. Documentul confirmă datele actuale ale firmei înregistrate în Registrul Comerțului.',
  'Document ONRC cu date actuale despre o societate.',
  'comerciale',
  129.00,
  TRUE,
  5,
  2,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "phone", "email", "cui", "company_name"],
    "optional_fields": ["nr_reg_com"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "validation_rules": {
      "cui": {
        "type": "anaf_api",
        "validate_online": true,
        "message": "CUI inexistent în baza ANAF."
      }
    },
    "document_templates": {
      "contract": "contracts/certificat-constatator-contract.pdf",
      "instructions": "instructions/certificat-constatator.md"
    },
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    },
    "processing_steps": [
      "Verificare documente KYC",
      "Verificare firmă în ANAF",
      "Depunere cerere la ONRC",
      "Ridicare certificat",
      "Livrare către client"
    ]
  }',
  3,
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- INITIAL DATA: Service Options
-- =============================================

-- Option: Urgență (available for all MVP services)
DO $$
DECLARE
  service_record RECORD;
BEGIN
  FOR service_record IN SELECT id FROM services WHERE code IN ('SRV-001', 'SRV-031', 'SRV-030')
  LOOP
    INSERT INTO service_options (
      service_id, code, name, description,
      price, price_type, display_order, icon,
      config
    ) VALUES (
      service_record.id,
      'urgenta',
      'Procesare Urgentă',
      'Reducem timpul de procesare la 2 zile lucrătoare. Ideal pentru situații urgente.',
      100.00,
      'fixed',
      1,
      'zap',
      '{
        "affects_delivery_time": true,
        "delivery_days_reduction": 3
      }'
    ) ON CONFLICT (service_id, code) DO NOTHING;
  END LOOP;
END $$;

-- Option: Traducere EN (for Cazier Fiscal)
INSERT INTO service_options (
  service_id,
  code,
  name,
  description,
  price,
  price_type,
  display_order,
  icon,
  config
)
SELECT
  id,
  'traducere_en',
  'Traducere Engleză',
  'Traducere legalizată în limba engleză a cazierului fiscal.',
  150.00,
  'fixed',
  2,
  'languages',
  '{
    "additional_fields": ["target_language"],
    "processing_days_add": 2
  }'
FROM services WHERE code = 'SRV-001'
ON CONFLICT (service_id, code) DO NOTHING;

-- Option: Apostilă (for Cazier Fiscal)
INSERT INTO service_options (
  service_id,
  code,
  name,
  description,
  price,
  price_type,
  display_order,
  icon,
  config
)
SELECT
  id,
  'apostila',
  'Apostilă',
  'Apostilare document pentru uz în străinătate (Convenția de la Haga).',
  120.00,
  'fixed',
  3,
  'stamp',
  '{
    "processing_days_add": 3,
    "requires_original": true
  }'
FROM services WHERE code = 'SRV-001'
ON CONFLICT (service_id, code) DO NOTHING;

-- Option: Copii suplimentare
DO $$
DECLARE
  service_record RECORD;
BEGIN
  FOR service_record IN SELECT id FROM services WHERE code IN ('SRV-001', 'SRV-031', 'SRV-030')
  LOOP
    INSERT INTO service_options (
      service_id, code, name, description,
      price, price_type, max_quantity, display_order, icon,
      config
    ) VALUES (
      service_record.id,
      'copii_suplimentare',
      'Copii Suplimentare',
      'Copii suplimentare legalizate ale documentului.',
      25.00,
      'fixed',
      10,
      4,
      'copy',
      '{
        "per_item": true
      }'
    ) ON CONFLICT (service_id, code) DO NOTHING;
  END LOOP;
END $$;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function: Calculate order total price
CREATE OR REPLACE FUNCTION calculate_order_total(
  p_order_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  v_base_price DECIMAL;
  v_options_price DECIMAL := 0;
  v_delivery_price DECIMAL := 0;
  v_discount DECIMAL := 0;
BEGIN
  -- Get base price from service
  SELECT base_price INTO v_base_price
  FROM orders o
  JOIN services s ON s.id = o.service_id
  WHERE o.id = p_order_id;

  -- Calculate options price from selected_options
  SELECT COALESCE(SUM(
    (value->>'price')::DECIMAL * COALESCE((value->>'quantity')::INTEGER, 1)
  ), 0) INTO v_options_price
  FROM orders,
  jsonb_each(selected_options)
  WHERE id = p_order_id;

  -- Get delivery price (if any)
  SELECT COALESCE(delivery_price, 0) INTO v_delivery_price
  FROM orders
  WHERE id = p_order_id;

  -- Get discount (if any)
  SELECT COALESCE(discount_amount, 0) INTO v_discount
  FROM orders
  WHERE id = p_order_id;

  RETURN v_base_price + v_options_price + v_delivery_price - v_discount;
END;
$$ LANGUAGE plpgsql;

-- Function: Get order statistics
CREATE OR REPLACE FUNCTION get_order_statistics(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
  total_orders BIGINT,
  completed_orders BIGINT,
  pending_orders BIGINT,
  total_revenue DECIMAL,
  avg_order_value DECIMAL,
  completion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT,
    COUNT(*) FILTER (WHERE status IN ('pending', 'processing', 'in_progress'))::BIGINT,
    COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0),
    COALESCE(AVG(total_price) FILTER (WHERE payment_status = 'paid'), 0),
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND(COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*) * 100, 2)
      ELSE 0
    END
  FROM orders
  WHERE
    (p_start_date IS NULL OR created_at::DATE >= p_start_date)
    AND (p_end_date IS NULL OR created_at::DATE <= p_end_date)
    AND status != 'draft';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE services IS 'Catalog of available services with configuration';
COMMENT ON TABLE service_options IS 'Optional add-ons for services (urgency, translation, etc)';
COMMENT ON TABLE orders IS 'Customer orders with complete lifecycle tracking';
COMMENT ON TABLE order_history IS 'Audit log for all order changes';

COMMENT ON COLUMN services.config IS 'JSON configuration: required_fields, validation_rules, kyc_requirements, etc';
COMMENT ON COLUMN orders.customer_data IS 'Customer information collected during order flow';
COMMENT ON COLUMN orders.selected_options IS 'Options selected by customer with prices';
COMMENT ON COLUMN orders.kyc_documents IS 'KYC document URLs and OCR data';
COMMENT ON COLUMN orders.internal_status_notes IS 'Array of timestamped admin notes';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the migration:
--
-- SELECT * FROM services WHERE is_active = TRUE;
-- SELECT * FROM service_options;
-- SELECT generate_order_number();
-- SELECT * FROM get_order_statistics();
--
-- =============================================

-- =============================================
-- Run this migration in Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =============================================
