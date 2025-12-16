# Database Quick Reference - Sprint 2

Quick reference for common database operations in Sprint 2.

---

## Common Queries

### Services

```sql
-- Get all active services
SELECT * FROM services WHERE is_active = TRUE ORDER BY display_order;

-- Get service by slug
SELECT * FROM services WHERE slug = 'cazier-fiscal';

-- Get service with options
SELECT
  s.*,
  jsonb_agg(so.*) as options
FROM services s
LEFT JOIN service_options so ON so.service_id = s.id AND so.is_active = TRUE
WHERE s.slug = 'cazier-fiscal'
GROUP BY s.id;

-- Get featured services
SELECT * FROM services WHERE is_featured = TRUE AND is_active = TRUE;
```

### Orders

```sql
-- Get user's orders
SELECT * FROM orders
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Get order with service details
SELECT
  o.*,
  s.name as service_name,
  s.code as service_code,
  p.first_name || ' ' || p.last_name as customer_name
FROM orders o
JOIN services s ON s.id = o.service_id
JOIN profiles p ON p.id = o.user_id
WHERE o.id = 'order-uuid';

-- Get orders pending KYC
SELECT * FROM orders
WHERE status = 'kyc_pending'
ORDER BY created_at ASC;

-- Get today's orders
SELECT * FROM orders
WHERE created_at::DATE = CURRENT_DATE
ORDER BY created_at DESC;

-- Search by CNP (using JSONB)
SELECT * FROM orders
WHERE customer_data @> '{"personal": {"cnp": "1850101123456"}}';

-- Search by email
SELECT * FROM orders
WHERE customer_data @> '{"contact": {"email": "email@example.com"}}';

-- Orders with specific option
SELECT * FROM orders
WHERE selected_options ? 'urgenta';
```

### Order History

```sql
-- Get order timeline
SELECT
  oh.*,
  p.first_name || ' ' || p.last_name as changed_by_name
FROM order_history oh
LEFT JOIN profiles p ON p.id = oh.changed_by
WHERE oh.order_id = 'order-uuid'
ORDER BY oh.created_at ASC;

-- Get recent status changes
SELECT * FROM order_history
WHERE event_type = 'status_changed'
ORDER BY created_at DESC
LIMIT 20;
```

### Statistics

```sql
-- Today's statistics
SELECT * FROM get_order_statistics(
  CURRENT_DATE,
  CURRENT_DATE
);

-- This month's statistics
SELECT * FROM get_order_statistics(
  date_trunc('month', CURRENT_DATE)::DATE,
  CURRENT_DATE
);

-- This year's statistics
SELECT * FROM get_order_statistics(
  date_trunc('year', CURRENT_DATE)::DATE,
  CURRENT_DATE
);

-- Manual statistics
SELECT
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status IN ('pending', 'processing')) as active,
  SUM(total_price) FILTER (WHERE payment_status = 'paid') as revenue,
  AVG(total_price) FILTER (WHERE payment_status = 'paid') as avg_value
FROM orders
WHERE created_at >= date_trunc('month', CURRENT_DATE);
```

---

## Common Operations

### Create Order

```sql
INSERT INTO orders (
  user_id,
  service_id,
  customer_data,
  selected_options,
  delivery_method,
  base_price,
  options_price,
  delivery_price,
  total_price
) VALUES (
  'user-uuid',
  (SELECT id FROM services WHERE slug = 'cazier-fiscal'),
  '{
    "personal": {
      "cnp": "1850101123456",
      "first_name": "Ion",
      "last_name": "Popescu",
      "birth_date": "1985-01-01",
      "address": "Str. Example nr. 1"
    },
    "contact": {
      "email": "ion@example.com",
      "phone": "+40712345678"
    }
  }',
  '{
    "urgenta": {"quantity": 1, "price": 100.00}
  }',
  'email',
  149.00,
  100.00,
  0.00,
  249.00
) RETURNING *;
```

### Update Order Status

```sql
UPDATE orders
SET
  status = 'kyc_approved',
  kyc_verified_at = NOW(),
  kyc_verified_by = 'admin-uuid'
WHERE id = 'order-uuid'
RETURNING *;

-- Status change is automatically logged to order_history
```

### Update Payment Status

```sql
UPDATE orders
SET
  payment_status = 'paid',
  paid_at = NOW(),
  stripe_charge_id = 'ch_xxxxx'
WHERE stripe_payment_intent_id = 'pi_xxxxx'
RETURNING *;
```

### Add KYC Documents

```sql
UPDATE orders
SET kyc_documents = '{
  "identity_card_front": "s3://bucket/path/ci_front.jpg",
  "identity_card_back": "s3://bucket/path/ci_back.jpg",
  "selfie": "s3://bucket/path/selfie.jpg",
  "signature": "data:image/png;base64,...",
  "ocr_data": {
    "cnp": "1850101123456",
    "name": "ION POPESCU",
    "confidence": 0.98
  }
}'
WHERE id = 'order-uuid'
RETURNING *;
```

### Upload Final Document

```sql
UPDATE orders
SET
  status = 'document_ready',
  final_document_url = 's3://bucket/final-docs/order-id/document.pdf',
  final_document_uploaded_at = NOW()
WHERE id = 'order-uuid'
RETURNING *;
```

---

## TypeScript Types

### Service Type

```typescript
interface Service {
  id: string;
  slug: string;
  code: string;
  name: string;
  description: string;
  short_description: string;
  category: 'fiscale' | 'juridice' | 'imobiliare' | 'comerciale' | 'auto' | 'personale';
  base_price: number;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  requires_kyc: boolean;
  estimated_days: number;
  urgent_available: boolean;
  urgent_days: number;
  config: ServiceConfig;
  display_order: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface ServiceConfig {
  required_fields: string[];
  optional_fields: string[];
  delivery_methods: string[];
  validation_rules: Record<string, ValidationRule>;
  document_templates: {
    contract: string;
    instructions: string;
  };
  kyc_requirements: {
    identity_card: boolean;
    selfie: boolean;
    signature: boolean;
  };
  processing_steps: string[];
}

interface ValidationRule {
  type: 'regex' | 'anaf_api' | 'custom';
  pattern?: string;
  message: string;
  validate_online?: boolean;
}
```

### Service Option Type

```typescript
interface ServiceOption {
  id: string;
  service_id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'percentage';
  is_active: boolean;
  is_required: boolean;
  max_quantity: number;
  config: OptionConfig;
  display_order: number;
  icon?: string;
  created_at: string;
  updated_at: string;
}

interface OptionConfig {
  affects_delivery_time?: boolean;
  delivery_days_reduction?: number;
  processing_days_add?: number;
  additional_fields?: string[];
  dependencies?: string[];
  conflicts_with?: string[];
  per_item?: boolean;
  requires_original?: boolean;
}
```

### Order Type

```typescript
type OrderStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'kyc_pending'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'in_progress'
  | 'document_ready'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded';

type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

type DeliveryMethod = 'email' | 'registered_mail' | 'courier';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  service_id: string;
  partner_id?: string;
  status: OrderStatus;

  customer_data: CustomerData;
  selected_options: Record<string, SelectedOption>;

  delivery_method: DeliveryMethod;
  delivery_address?: Address;
  delivery_tracking_number?: string;
  delivery_tracking_url?: string;

  base_price: number;
  options_price: number;
  delivery_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
  currency: string;

  payment_status: PaymentStatus;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  paid_at?: string;

  kyc_documents?: KYCDocuments;
  kyc_verified_at?: string;
  kyc_verified_by?: string;
  kyc_rejection_reason?: string;

  contract_url?: string;
  contract_signed_at?: string;
  final_document_url?: string;
  final_document_uploaded_at?: string;

  invoice_number?: string;
  invoice_url?: string;
  invoice_issued_at?: string;

  admin_notes?: string;
  internal_status_notes: StatusNote[];
  assigned_to?: string;

  estimated_completion_date?: string;
  actual_completion_date?: string;

  created_at: string;
  updated_at: string;
  submitted_at?: string;
  cancelled_at?: string;
  refunded_at?: string;
}

interface CustomerData {
  personal: {
    cnp: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    birth_place?: string;
    address: string;
  };
  contact: {
    email: string;
    phone: string;
    preferred_contact: 'email' | 'phone';
  };
  purpose?: string;
  company?: {
    name: string;
    cui: string;
  };
}

interface SelectedOption {
  quantity: number;
  price: number;
  [key: string]: any; // Additional option-specific fields
}

interface Address {
  street: string;
  number: string;
  building?: string;
  apartment?: string;
  city: string;
  county: string;
  postal_code: string;
  country: string;
}

interface KYCDocuments {
  identity_card_front?: string;
  identity_card_back?: string;
  selfie?: string;
  signature?: string;
  ocr_data?: {
    cnp: string;
    name: string;
    birth_date?: string;
    confidence: number;
    verified?: boolean;
  };
  face_match?: {
    confidence: number;
    matched: boolean;
  };
}

interface StatusNote {
  timestamp: string;
  note: string;
  created_by: string;
}
```

### Order History Type

```typescript
type OrderEventType =
  | 'created'
  | 'status_changed'
  | 'payment_received'
  | 'kyc_submitted'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'document_uploaded'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'note_added'
  | 'assigned';

interface OrderHistory {
  id: string;
  order_id: string;
  changed_by?: string;
  event_type: OrderEventType;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  notes?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
```

---

## Supabase Client Examples

### Get Services

```typescript
// Get all active services
const { data: services, error } = await supabase
  .from('services')
  .select('*')
  .eq('is_active', true)
  .order('display_order');

// Get service with options
const { data: service, error } = await supabase
  .from('services')
  .select(`
    *,
    service_options(*)
  `)
  .eq('slug', 'cazier-fiscal')
  .eq('service_options.is_active', true)
  .single();
```

### Create Order

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    service_id: service.id,
    customer_data: {
      personal: {
        cnp: '1850101123456',
        first_name: 'Ion',
        last_name: 'Popescu',
        birth_date: '1985-01-01',
        address: 'Str. Example nr. 1'
      },
      contact: {
        email: 'ion@example.com',
        phone: '+40712345678',
        preferred_contact: 'email'
      }
    },
    selected_options: {
      urgenta: { quantity: 1, price: 100.00 }
    },
    delivery_method: 'email',
    base_price: 149.00,
    options_price: 100.00,
    total_price: 249.00
  })
  .select()
  .single();
```

### Update Order

```typescript
// Update status
const { data, error } = await supabase
  .from('orders')
  .update({
    status: 'kyc_approved',
    kyc_verified_at: new Date().toISOString(),
    kyc_verified_by: adminId
  })
  .eq('id', orderId)
  .select()
  .single();

// Add KYC documents
const { data, error } = await supabase
  .from('orders')
  .update({
    kyc_documents: {
      identity_card_front: s3Url1,
      identity_card_back: s3Url2,
      selfie: s3Url3,
      signature: signatureData,
      ocr_data: {
        cnp: '1850101123456',
        name: 'ION POPESCU',
        confidence: 0.98
      }
    }
  })
  .eq('id', orderId)
  .select()
  .single();
```

### Query Orders

```typescript
// Get user's orders with service details
const { data: orders, error } = await supabase
  .from('orders')
  .select(`
    *,
    service:services(name, code, category)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Get orders by status
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('status', 'kyc_pending')
  .order('created_at');

// Search by CNP (JSONB query)
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .contains('customer_data', {
    personal: { cnp: '1850101123456' }
  });
```

### Get Order History

```typescript
const { data: history, error } = await supabase
  .from('order_history')
  .select(`
    *,
    changed_by_profile:profiles!changed_by(first_name, last_name)
  `)
  .eq('order_id', orderId)
  .order('created_at');
```

### Statistics

```typescript
// Using RPC function
const { data: stats, error } = await supabase
  .rpc('get_order_statistics', {
    p_start_date: '2025-01-01',
    p_end_date: '2025-12-31'
  });

// Manual aggregation
const { data, error } = await supabase
  .from('orders')
  .select('total_price, status, payment_status')
  .gte('created_at', '2025-01-01')
  .lte('created_at', '2025-12-31');

// Process results in code
const stats = {
  totalOrders: data.length,
  completedOrders: data.filter(o => o.status === 'completed').length,
  totalRevenue: data
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_price, 0)
};
```

---

## Testing Queries

```sql
-- Test order number generation
INSERT INTO orders (user_id, service_id, total_price, customer_data)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM services WHERE code = 'SRV-001'),
  149.00,
  '{}'::jsonb
)
RETURNING order_number;

-- Test estimated completion calculation
SELECT
  order_number,
  created_at,
  estimated_completion_date,
  estimated_completion_date - created_at::date as days
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- Test RLS policies (as user)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM orders; -- Should only see own orders
RESET ROLE;

-- Test statistics function
SELECT * FROM get_order_statistics(
  date_trunc('month', CURRENT_DATE)::DATE,
  CURRENT_DATE
);
```

---

## Useful JSONB Operators

```sql
-- Contains (@>)
WHERE config @> '{"kyc_requirements": {"selfie": true}}'

-- Exists (?)
WHERE selected_options ? 'urgenta'

-- Any exists (?|)
WHERE selected_options ?| array['urgenta', 'traducere_en']

-- All exist (?&)
WHERE selected_options ?& array['urgenta', 'traducere_en']

-- Extract as text (->>)
WHERE customer_data->'personal'->>'cnp' = '1850101123456'

-- Extract as JSONB (->)
WHERE customer_data->'personal'->>'first_name' ILIKE 'ion%'
```

---

## Performance Tips

1. **Use indexes** - Always filter by indexed columns first
2. **Limit results** - Use LIMIT for pagination
3. **Specific columns** - SELECT only what you need
4. **JSONB operators** - Use @>, ?, ?& for JSONB queries
5. **Avoid LIKE on JSONB** - Use GIN index operators instead
6. **Batch operations** - Use transactions for multiple updates

---

**File:** `/Users/raullutas/eghiseul.ro/docs/technical/database-quick-reference.md`
**Created:** 2025-12-16
