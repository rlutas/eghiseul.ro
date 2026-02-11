# Stripe Payment + Oblio Invoicing Integration

**Version:** 1.0
**Date:** 2026-01-12
**Status:** Planning
**Author:** Development Team

---

## Overview

Acest document detaliază implementarea completă a fluxului de plată Stripe și facturare automată Oblio pentru eGhiseul.ro.

### Obiective

1. **Finalizare checkout Stripe** - UI pentru plată, success/failure pages
2. **Integrare Oblio** - Generare automată factură după plată confirmată
3. **e-Factura compliance** - Trimitere automată în SPV (opțional)

---

## Metode de Plată

| Metodă | Flux | Verificare | Facturare |
|--------|------|------------|-----------|
| **Card (Stripe)** | Instant, automat | Webhook | Automată |
| **Transfer Bancar (IBAN)** | Manual, 1-3 zile | Admin verifică | După confirmare |
| **Apple Pay / Google Pay** | Instant, via Stripe | Webhook | Automată |

---

## Arhitectură Flow

### Flow 1: Plată Card (Stripe)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STRIPE PAYMENT FLOW (INSTANT)                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Review     │────▶│   Checkout   │────▶│   Stripe     │────▶│   Webhook    │
│    Step      │     │    Page      │     │   Payment    │     │   Handler    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                       │
                                                                       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Email      │◀────│   Success    │◀────│   Oblio      │◀────│   Create     │
│   Sent       │     │    Page      │     │   Invoice    │     │   Invoice    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Flow 2: Transfer Bancar (IBAN)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BANK TRANSFER FLOW (MANUAL VERIFICATION)                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Review     │────▶│  Select IBAN │────▶│  Show Bank   │────▶│   Upload     │
│    Step      │     │   Payment    │     │   Details    │     │   Proof      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                       │
                                                                       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Email      │◀────│   Oblio      │◀────│   Admin      │◀────│  Pending     │
│   Sent       │     │   Invoice    │     │   Confirms   │     │   Review     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘

Status Flow: pending_payment → awaiting_verification → paid → processing
```

### Detalii Flow

1. **Review Step** → User acceptă Terms & Conditions
2. **Click "Plătește"** → Redirect la `/comanda/checkout/[orderId]`
3. **Checkout Page** → Stripe Elements form (card, Apple Pay, Google Pay)
4. **Stripe Payment** → 3D Secure dacă necesar
5. **Webhook** → `payment_intent.succeeded` primit de server
6. **Create Invoice** → Oblio API generează factură
7. **Success Page** → User vede confirmarea + link descărcare factură
8. **Email** → Factură PDF trimisă pe email

---

## Partea 1: Stripe Checkout Completion

### 1.1 Ce avem deja implementat ✅

| Component | File | Status |
|-----------|------|--------|
| Stripe client | `src/lib/stripe.ts` | ✅ Done |
| Payment Intent creation | `src/app/api/orders/[id]/payment/route.ts` | ✅ Done |
| Webhook handler | `src/app/api/webhooks/stripe/route.ts` | ✅ Done |
| Order status update | Webhook updates `payment_status` | ✅ Done |

### 1.2 Ce trebuie implementat ⏳

| Component | File | Priority |
|-----------|------|----------|
| Checkout Page UI | `src/app/comanda/checkout/[orderId]/page.tsx` | P0 |
| Stripe Elements | `src/components/payment/StripeCheckoutForm.tsx` | P0 |
| Success Page | `src/app/comanda/success/[orderId]/page.tsx` | P0 |
| Failure/Retry Page | `src/app/comanda/checkout/[orderId]/page.tsx` (error state) | P0 |
| Payment Status Component | `src/components/payment/PaymentStatus.tsx` | P1 |

### 1.3 Checkout Page Structure

```
/comanda/checkout/[orderId]
├── Order Summary (readonly)
├── Stripe Elements Form
│   ├── Card Element (sau PaymentElement pentru toate metodele)
│   ├── Billing Address (opțional, dacă nu avem din wizard)
│   └── Submit Button
├── Security Badges (SSL, Stripe, etc.)
└── Back to Review link
```

### 1.4 Stripe Elements Implementation

```typescript
// src/components/payment/StripeCheckoutForm.tsx
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripeCheckoutFormProps {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  amount: number;
}

export function StripeCheckoutForm({
  clientSecret,
  orderId,
  orderNumber,
  amount
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/comanda/success/${orderId}`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'A apărut o eroare la plată');
      setIsProcessing(false);
    }
    // If successful, Stripe redirects to return_url
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="text-red-600 mt-4">{error}</div>}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-6"
      >
        {isProcessing ? 'Se procesează...' : `Plătește ${amount} RON`}
      </Button>
    </form>
  );
}
```

### 1.5 Success Page

```typescript
// src/app/comanda/success/[orderId]/page.tsx

// URL: /comanda/success/[orderId]?payment_intent=pi_xxx&payment_intent_client_secret=xxx&redirect_status=succeeded

export default async function SuccessPage({ params, searchParams }) {
  const { orderId } = await params;
  const { payment_intent, redirect_status } = await searchParams;

  // Verify payment status
  if (redirect_status !== 'succeeded') {
    redirect(`/comanda/checkout/${orderId}?error=payment_failed`);
  }

  // Fetch order details + invoice
  const order = await getOrder(orderId);
  const invoice = await getInvoice(orderId);

  return (
    <div>
      <CheckCircle className="text-green-500" />
      <h1>Plată confirmată!</h1>
      <p>Comanda #{order.order_number} a fost plasată cu succes.</p>

      {/* Invoice Download */}
      {invoice && (
        <Button href={invoice.downloadUrl}>
          Descarcă Factura
        </Button>
      )}

      {/* Next Steps */}
      <div>
        <h2>Ce urmează?</h2>
        <ol>
          <li>Vei primi factura pe email</li>
          <li>Vom procesa documentul în 2-5 zile lucrătoare</li>
          <li>Te notificăm când este gata</li>
        </ol>
      </div>

      {/* Order Status Link */}
      <Button href={`/comanda/status?order=${order.order_number}`}>
        Vezi Status Comandă
      </Button>
    </div>
  );
}
```

### 1.6 Environment Variables (Stripe)

```env
# Already configured
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Needs to be configured
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe Dashboard > Webhooks
```

---

## Partea 1b: Transfer Bancar (IBAN) Flow

### 1b.1 Overview

Pentru clienții care preferă transfer bancar:
1. Selectează "Transfer Bancar" ca metodă de plată
2. Vede detaliile contului bancar + referința unică
3. Face transferul din banca lor
4. Încarcă dovada plății (screenshot/PDF)
5. Așteaptă verificarea de către admin
6. Primește factura după confirmare

### 1b.2 Payment Method Selection UI

```typescript
// src/components/payment/PaymentMethodSelector.tsx

type PaymentMethod = 'card' | 'bank_transfer';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  amount: number;
}

export function PaymentMethodSelector({
  selected,
  onChange,
  amount
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Alege metoda de plată</h3>

      {/* Card Payment Option */}
      <label className={cn(
        "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer",
        selected === 'card' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
      )}>
        <input
          type="radio"
          name="payment_method"
          value="card"
          checked={selected === 'card'}
          onChange={() => onChange('card')}
          className="sr-only"
        />
        <CreditCard className="h-6 w-6" />
        <div className="flex-1">
          <p className="font-medium">Card Bancar</p>
          <p className="text-sm text-neutral-500">
            Visa, Mastercard, Apple Pay, Google Pay
          </p>
        </div>
        <Badge>Instant</Badge>
      </label>

      {/* Bank Transfer Option */}
      <label className={cn(
        "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer",
        selected === 'bank_transfer' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
      )}>
        <input
          type="radio"
          name="payment_method"
          value="bank_transfer"
          checked={selected === 'bank_transfer'}
          onChange={() => onChange('bank_transfer')}
          className="sr-only"
        />
        <Building2 className="h-6 w-6" />
        <div className="flex-1">
          <p className="font-medium">Transfer Bancar</p>
          <p className="text-sm text-neutral-500">
            IBAN · Verificare în 1-3 zile lucrătoare
          </p>
        </div>
      </label>
    </div>
  );
}
```

### 1b.3 Bank Details Display

```typescript
// src/components/payment/BankTransferDetails.tsx

interface BankTransferDetailsProps {
  orderNumber: string;
  amount: number;
}

// Company bank details (from env or config)
const BANK_DETAILS = {
  beneficiary: 'SC EGHISEUL SRL',
  iban: 'RO49 AAAA 1B31 0075 9384 0000',
  bank: 'Banca Transilvania',
  swift: 'BTRLRO22',
};

export function BankTransferDetails({
  orderNumber,
  amount
}: BankTransferDetailsProps) {
  const paymentReference = `${orderNumber}`; // e.g., ORD-20260112-00001

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiat!`);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          Transferul bancar necesită verificare manuală.
          Comanda va fi procesată după confirmarea plății (1-3 zile lucrătoare).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalii pentru transfer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Beneficiary */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Beneficiar</p>
              <p className="font-medium">{BANK_DETAILS.beneficiary}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(BANK_DETAILS.beneficiary, 'Beneficiar')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* IBAN */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">IBAN</p>
              <p className="font-mono font-medium">{BANK_DETAILS.iban}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(BANK_DETAILS.iban.replace(/\s/g, ''), 'IBAN')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Bank */}
          <div>
            <p className="text-sm text-neutral-500">Bancă</p>
            <p className="font-medium">{BANK_DETAILS.bank}</p>
          </div>

          <Separator />

          {/* Payment Reference - IMPORTANT */}
          <div className="flex justify-between items-center bg-primary-50 p-3 rounded-lg">
            <div>
              <p className="text-sm text-primary-600 font-medium">Referință plată (OBLIGATORIU)</p>
              <p className="font-mono font-bold text-lg">{paymentReference}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(paymentReference, 'Referință')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Amount */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-neutral-500">Sumă de plată</p>
              <p className="font-bold text-xl">{amount.toFixed(2)} RON</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(amount.toFixed(2), 'Sumă')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-neutral-500 text-center">
        Trebuie să incluzi referința <strong>{paymentReference}</strong> în detaliile transferului
        pentru a putea identifica plata.
      </p>
    </div>
  );
}
```

### 1b.4 Proof Upload Component

```typescript
// src/components/payment/PaymentProofUpload.tsx

interface PaymentProofUploadProps {
  orderId: string;
  onUploadComplete: (fileUrl: string) => void;
}

export function PaymentProofUpload({
  orderId,
  onUploadComplete
}: PaymentProofUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tip de fișier invalid. Acceptăm: JPG, PNG, WebP, PDF');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fișierul este prea mare. Maxim 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to S3 via presigned URL
      const { key, url } = await uploadToS3({
        category: 'orders',
        file,
        documentType: 'payment_proof',
        orderId,
      });

      setUploadedFile(url);
      onUploadComplete(key);
      toast.success('Dovada plății a fost încărcată!');
    } catch (error) {
      toast.error('Eroare la încărcare. Încearcă din nou.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Încarcă dovada plății</h4>
      <p className="text-sm text-neutral-500">
        După ce ai efectuat transferul, încarcă un screenshot sau PDF cu confirmarea.
      </p>

      {!uploadedFile ? (
        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="sr-only"
          />
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <p className="mt-2 text-sm text-neutral-500">Se încarcă...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-neutral-400" />
              <p className="mt-2 text-sm text-neutral-500">
                Click pentru a încărca sau trage fișierul aici
              </p>
              <p className="text-xs text-neutral-400">
                JPG, PNG, WebP sau PDF (max 10MB)
              </p>
            </>
          )}
        </label>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div className="flex-1">
            <p className="font-medium text-green-800">Dovada încărcată cu succes</p>
            <p className="text-sm text-green-600">Vom verifica plata în 1-3 zile lucrătoare.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUploadedFile(null)}
          >
            Schimbă
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 1b.5 API: Submit Bank Transfer

```typescript
// src/app/api/orders/[id]/bank-transfer/route.ts

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { paymentProofKey } = body;

  const supabase = await createClient();

  // Auth check (can be guest with order email)
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Verify ownership
  if (user && order.user_id && order.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Update order with bank transfer info
  const { error } = await supabase
    .from('orders')
    .update({
      payment_method: 'bank_transfer',
      payment_status: 'awaiting_verification',
      payment_proof_url: paymentProofKey,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  // TODO: Notify admin about pending verification

  return NextResponse.json({
    success: true,
    message: 'Plata a fost înregistrată și așteaptă verificare.',
  });
}
```

### 1b.6 Admin: Verify Payment

```typescript
// src/app/api/admin/orders/[id]/confirm-payment/route.ts

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  // Admin auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch order
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*, services(name)')
    .eq('id', id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'Already paid' }, { status: 400 });
  }

  // Update order to paid
  await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      paid_at: new Date().toISOString(),
      verified_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  // Create Oblio invoice
  try {
    const invoice = await createInvoiceFromOrder(order, 'Transfer bancar');

    await supabaseAdmin
      .from('orders')
      .update({
        invoice_number: `${invoice.seriesName}${invoice.number}`,
        invoice_url: invoice.link,
      })
      .eq('id', id);

    // TODO: Send confirmation email to customer
  } catch (invoiceError) {
    console.error('Failed to create invoice:', invoiceError);
  }

  return NextResponse.json({
    success: true,
    message: 'Plata confirmată și factura generată.',
  });
}
```

### 1b.7 Database: Additional Fields

```sql
-- Migration: Bank transfer fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);

-- Add index for admin queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update payment_status enum options
-- 'pending' | 'awaiting_verification' | 'paid' | 'refunded' | 'failed'
```

### 1b.8 Waiting Verification Page

După ce clientul încarcă dovada plății, vede o pagină de așteptare:

```typescript
// In success page, check payment method

if (order.payment_method === 'bank_transfer' && order.payment_status === 'awaiting_verification') {
  return (
    <div className="text-center">
      <Clock className="h-16 w-16 text-amber-500 mx-auto" />
      <h1 className="text-2xl font-bold mt-4">Plată în așteptare</h1>
      <p className="text-neutral-600 mt-2">
        Comanda #{order.order_number} a fost înregistrată.
        Vom verifica transferul în 1-3 zile lucrătoare.
      </p>
      <p className="text-sm text-neutral-500 mt-4">
        Vei primi un email de confirmare când plata este verificată.
      </p>
    </div>
  );
}
```

---

## Partea 2: Oblio Integration

### 2.1 Oblio API Overview

| Aspect | Details |
|--------|---------|
| **Base URL** | `https://www.oblio.eu/api` |
| **Auth** | OAuth 2.0 (client_id + client_secret → access_token) |
| **Token Validity** | 3600 seconds (1 hour) |
| **Rate Limits** | 30 req/100s (docs), 30 req/10s (other) |
| **SDK** | `@obliosoftware/oblioapi` (NodeJS) |

**Sources:**
- [Oblio API Documentation](https://www.oblio.eu/api)
- [Oblio NodeJS SDK](https://github.com/OblioSoftware/OblioApiJs)

### 2.2 Files to Create

| File | Purpose |
|------|---------|
| `src/lib/oblio/client.ts` | Oblio API client with auth |
| `src/lib/oblio/invoice.ts` | Invoice creation helper |
| `src/lib/oblio/types.ts` | TypeScript interfaces |
| `src/app/api/invoices/[orderId]/route.ts` | Get invoice for order |
| `src/app/api/webhooks/oblio/route.ts` | Oblio webhook handler (optional) |

### 2.3 Oblio Client Implementation

```typescript
// src/lib/oblio/client.ts

interface OblioToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: OblioToken | null = null;

export async function getOblioToken(): Promise<string> {
  // Check if cached token is still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expires_at > Date.now() + 300000) {
    return cachedToken.access_token;
  }

  const response = await fetch('https://www.oblio.eu/api/authorize/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.OBLIO_CLIENT_ID,      // email
      client_secret: process.env.OBLIO_CLIENT_SECRET, // API token from Settings
    }),
  });

  if (!response.ok) {
    throw new Error(`Oblio auth failed: ${response.statusText}`);
  }

  const data = await response.json();

  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };

  return cachedToken.access_token;
}

export async function oblioRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object
): Promise<T> {
  const token = await getOblioToken();

  const response = await fetch(`https://www.oblio.eu/api${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (data.status !== 200) {
    throw new Error(`Oblio error: ${data.statusMessage}`);
  }

  return data.data;
}
```

### 2.4 Invoice Creation

```typescript
// src/lib/oblio/invoice.ts

import { oblioRequest } from './client';

export interface OblioInvoiceInput {
  // Company (eGhiseul)
  cif: string;           // CIF eGhiseul.ro
  seriesName: string;    // e.g., "EGH"

  // Client
  client: {
    name: string;
    cif?: string;        // For PJ
    vatPayer?: boolean;
    address?: string;
    city?: string;
    county?: string;
    country?: string;
    email?: string;
    phone?: string;
  };

  // Products/Services
  products: Array<{
    name: string;
    price: number;
    quantity: number;
    measuringUnit?: string;
    vatPercentage?: number;
    vatIncluded?: boolean;
    productType?: 'Serviciu' | 'Marfa';
  }>;

  // Payment info
  collect?: {
    type: string;        // 'Card', 'Transfer bancar', etc.
    documentNumber?: string;
    value: number;
  };

  // Optional
  mentions?: string;
  issueDate?: string;    // YYYY-MM-DD
  dueDate?: string;
  language?: 'RO' | 'EN';
}

export interface OblioInvoiceResponse {
  seriesName: string;
  number: string;
  link: string;          // PDF download link
}

export async function createInvoice(
  input: OblioInvoiceInput
): Promise<OblioInvoiceResponse> {
  return oblioRequest<OblioInvoiceResponse>('/docs/invoice', 'POST', input);
}

// Helper to create invoice from order
export async function createInvoiceFromOrder(
  order: Order,
  paymentMethod: string = 'Card'
): Promise<OblioInvoiceResponse> {
  const billing = order.customer_data?.billing;
  const isPJ = billing?.type === 'company';

  // Build client object
  const client: OblioInvoiceInput['client'] = isPJ ? {
    name: billing.companyName,
    cif: billing.cui,
    vatPayer: billing.isVatPayer || false,
    address: billing.address,
    city: billing.city,
    county: billing.county,
    country: 'Romania',
    email: order.customer_data?.contact?.email,
  } : {
    name: `${order.customer_data?.personal?.lastName} ${order.customer_data?.personal?.firstName}`,
    address: formatAddress(order.customer_data?.personal?.address),
    city: order.customer_data?.personal?.address?.city,
    county: order.customer_data?.personal?.address?.county,
    country: 'Romania',
    email: order.customer_data?.contact?.email,
  };

  // Build products array
  const products: OblioInvoiceInput['products'] = [
    {
      name: order.service_name,
      price: order.base_price,
      quantity: 1,
      measuringUnit: 'buc',
      vatPercentage: 19,
      vatIncluded: true,
      productType: 'Serviciu',
    },
  ];

  // Add options as separate line items
  if (order.selected_options?.length) {
    for (const option of order.selected_options) {
      products.push({
        name: option.name,
        price: option.price,
        quantity: 1,
        measuringUnit: 'buc',
        vatPercentage: 19,
        vatIncluded: true,
        productType: 'Serviciu',
      });
    }
  }

  // Add delivery if applicable
  if (order.delivery_price > 0) {
    products.push({
      name: `Livrare ${order.delivery_method}`,
      price: order.delivery_price,
      quantity: 1,
      measuringUnit: 'buc',
      vatPercentage: 19,
      vatIncluded: true,
      productType: 'Serviciu',
    });
  }

  return createInvoice({
    cif: process.env.OBLIO_COMPANY_CIF!,
    seriesName: process.env.OBLIO_SERIES_NAME || 'EGH',
    client,
    products,
    collect: {
      type: paymentMethod,
      value: order.total_price,
    },
    mentions: `Comanda: ${order.order_number}`,
    language: 'RO',
  });
}
```

### 2.5 Types

```typescript
// src/lib/oblio/types.ts

export interface OblioCompany {
  cif: string;
  name: string;
  useStock: boolean;
}

export interface OblioClient {
  cif: string;
  name: string;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  vatPayer?: boolean;
}

export interface OblioProduct {
  name: string;
  code?: string;
  price: number;
  currency?: string;
  vatPercentage?: number;
  vatIncluded?: boolean;
  productType?: 'Serviciu' | 'Marfa' | 'Piese' | 'Semifabricat' | 'Produs' | 'Materie prima' | 'Obiecte de inventar' | 'Alte materiale';
  measuringUnit?: string;
}

export interface OblioInvoice {
  seriesName: string;
  number: string;
  link: string;
  total: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'final';
}
```

### 2.6 Environment Variables (Oblio)

```env
# Oblio Configuration
OBLIO_CLIENT_ID=email@company.ro      # Oblio account email
OBLIO_CLIENT_SECRET=xxx               # API token from Oblio Settings
OBLIO_COMPANY_CIF=RO12345678          # Company CIF for invoices
OBLIO_SERIES_NAME=EGH                 # Invoice series name
```

---

## Partea 3: Integration Flow

### 3.1 Updated Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts (updated)

import { createInvoiceFromOrder } from '@/lib/oblio/invoice';

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    console.error('No orderId in payment intent metadata');
    return;
  }

  // 1. Update order status
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, services(name)')
    .single();

  if (error || !order) {
    console.error('Failed to update order after payment:', error);
    throw error;
  }

  console.log(`Order ${orderId} marked as paid`);

  // 2. Create Oblio invoice
  try {
    const invoice = await createInvoiceFromOrder(order, 'Card');

    // Save invoice reference to order
    await supabaseAdmin
      .from('orders')
      .update({
        invoice_number: `${invoice.seriesName}${invoice.number}`,
        invoice_url: invoice.link,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    console.log(`Invoice ${invoice.seriesName}${invoice.number} created for order ${orderId}`);
  } catch (invoiceError) {
    // Log but don't fail - invoice can be created manually
    console.error('Failed to create invoice:', invoiceError);

    // TODO: Add to retry queue or notify admin
  }

  // 3. Send confirmation email (Phase 2)
  // await sendOrderConfirmationEmail(order);
}
```

### 3.2 Database Updates

```sql
-- Migration: Add invoice fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
```

### 3.3 API: Get Invoice

```typescript
// src/app/api/invoices/[orderId]/route.ts

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { orderId } = await params;
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get order with invoice info
  const { data: order } = await supabase
    .from('orders')
    .select('id, user_id, invoice_number, invoice_url, payment_status')
    .eq('id', orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!order.invoice_url) {
    return NextResponse.json({ error: 'Invoice not ready' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      invoiceNumber: order.invoice_number,
      downloadUrl: order.invoice_url,
    }
  });
}
```

---

## Partea 4: UI Components

### 4.1 Component List

| Component | Description |
|-----------|-------------|
| `PaymentProviders.tsx` | Stripe Elements provider wrapper |
| `StripeCheckoutForm.tsx` | Payment form with PaymentElement |
| `OrderSummaryCard.tsx` | Readonly order summary |
| `PaymentSuccessCard.tsx` | Success confirmation UI |
| `InvoiceDownload.tsx` | Invoice download button |
| `PaymentErrorAlert.tsx` | Error display with retry |

### 4.2 Page Structure

```
src/app/comanda/
├── [service]/page.tsx          # Wizard (existing)
├── checkout/
│   └── [orderId]/
│       └── page.tsx            # Checkout page (NEW)
└── success/
    └── [orderId]/
        └── page.tsx            # Success page (NEW)
```

---

## Partea 5: Testing Plan

### 5.1 Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0025 0000 3155 | 3D Secure required |
| 4000 0000 0000 9995 | Declined |
| 4000 0000 0000 0077 | Declined (insufficient funds) |

### 5.2 Test Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Successful card payment | Order → paid, Invoice created |
| 2 | 3D Secure flow | Redirect → auth → success |
| 3 | Card declined | Error message, retry option |
| 4 | Webhook retry | Idempotent (no duplicate invoices) |
| 5 | Oblio API down | Order paid, invoice queued |
| 6 | Back button from checkout | Return to review step |

### 5.3 Oblio Test Mode

Oblio oferă cont de test - verifică dacă există sau folosește contul live cu facturi de test marcate pentru ștergere.

---

## Partea 6: Implementation Checklist

### Phase 1: Payment Method Selection (P0) ✅ COMPLETED

- [x] Create `PaymentMethodSelector.tsx` component
- [x] Update checkout page to show method selection
- [x] Store selected method in order state

### Phase 2: Stripe Checkout UI (P0) ✅ COMPLETED

- [x] Create `/comanda/checkout/[orderId]/page.tsx`
- [x] Create `StripeProvider.tsx` wrapper
- [x] Create `StripeCheckoutForm.tsx`
- [x] Create `OrderSummaryCard.tsx`
- [x] Add loading states
- [x] Handle errors and retry
- [x] Test with Stripe test cards

### Phase 3: Bank Transfer Flow (P0) ✅ COMPLETED

- [x] Create `BankTransferDetails.tsx` component
- [x] Create `PaymentProofUpload.tsx` component
- [x] Create `/api/orders/[id]/bank-transfer/route.ts`
- [x] Add database migration for new fields
- [x] Create waiting verification page state

### Phase 4: Admin Payment Verification (P0) ✅ COMPLETED

- [x] Create `/api/admin/orders/[id]/verify-payment/route.ts`
- [ ] Add admin orders list with pending verification filter
- [ ] Add "Confirm Payment" button in admin UI
- [ ] View payment proof image/PDF

### Phase 5: Success Page (P0) ✅ COMPLETED

- [x] Create `/comanda/success/[orderId]/page.tsx`
- [x] Verify payment status from URL params
- [x] Display order confirmation (card payment)
- [x] Display waiting verification (bank transfer)
- [x] Link to order status page

### Phase 6: Oblio Integration (P0) ✅ COMPLETED

- [x] Configure Oblio credentials in `.env`
- [x] Create `src/lib/oblio/client.ts`
- [x] Create `src/lib/oblio/invoice.ts`
- [x] Create `src/lib/oblio/types.ts`
- [x] Update Stripe webhook to create invoice
- [x] Update admin verify-payment to create invoice
- [x] Invoice fields already exist in orders table
- [ ] Create `/api/invoices/[orderId]` endpoint (optional)

### Phase 7: Invoice in Success Page (P1) - Partial

- [ ] Add `InvoiceDownload.tsx` component
- [x] Show invoice URL in success page (after payment confirmed)
- [ ] Add invoice to user orders list

### Phase 8: Email Notifications (P1) - Pending

- [ ] Order confirmation email (card - immediate)
- [ ] Order pending verification email (bank transfer)
- [ ] Payment confirmed email (bank transfer - after admin approval)
- [ ] Include invoice PDF attachment
- [ ] Use Resend for delivery

### Phase 9: e-Factura SPV (P2 - Optional)

- [ ] Configure Oblio e-Factura auto-send
- [ ] Add SPV status tracking
- [ ] Handle SPV errors

---

## Security Considerations

1. **Webhook Verification** - Always verify Stripe webhook signatures in production
2. **Idempotency** - Check if invoice already exists before creating
3. **Error Handling** - Don't fail order if invoice creation fails
4. **PII in Invoices** - Oblio stores client data, ensure GDPR compliance
5. **Access Control** - Only order owner can view invoice

---

## Rollback Plan

1. **Stripe Issues** → Orders remain in `pending_payment`, users can retry
2. **Oblio Issues** → Orders marked paid, invoices created manually later
3. **Database Issues** → Webhook returns 500, Stripe retries

---

## References

- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Oblio API Documentation](https://www.oblio.eu/api)
- [Oblio NodeJS SDK](https://github.com/OblioSoftware/OblioApiJs)
- [e-Factura Integration](https://www.oblio.eu/integrari/e-factura)

---

**Document Status:** Ready for Review
**Next Step:** User approval, then implementation
