import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

/**
 * Mask CNP for privacy - show only first 4 and last 3 digits
 * Example: 2920220303478 → 2920******478
 */
function maskCnp(cnp: string): string {
  if (!cnp || cnp.length < 7) return cnp
  return `${cnp.slice(0, 4)}******${cnp.slice(-3)}`
}

export interface CustomerData {
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  // For companies
  companyName?: string;
  cui?: string;
  // For individuals
  cnp?: string;
}

export interface PaymentIntentOptions {
  amount: number;
  description: string;
  metadata: Record<string, string>;
  customer?: CustomerData;
  receiptEmail?: string;
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer(customerData: CustomerData): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: customerData.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    // Update existing customer with latest info
    const customer = existingCustomers.data[0];
    return stripe.customers.update(customer.id, {
      name: customerData.companyName || customerData.name,
      phone: customerData.phone,
      address: customerData.address ? {
        line1: customerData.address.line1 || '',
        line2: customerData.address.line2,
        city: customerData.address.city,
        state: customerData.address.state,
        postal_code: customerData.address.postal_code,
        country: customerData.address.country || 'RO',
      } : undefined,
      metadata: {
        ...(customerData.cui && { cui: customerData.cui }),
        ...(customerData.cnp && { cnp: maskCnp(customerData.cnp) }),
        ...(customerData.companyName && { company_name: customerData.companyName }),
      },
    });
  }

  // Create new customer
  return stripe.customers.create({
    email: customerData.email,
    name: customerData.companyName || customerData.name,
    phone: customerData.phone,
    address: customerData.address ? {
      line1: customerData.address.line1 || '',
      line2: customerData.address.line2,
      city: customerData.address.city,
      state: customerData.address.state,
      postal_code: customerData.address.postal_code,
      country: customerData.address.country || 'RO',
    } : undefined,
    metadata: {
      ...(customerData.cui && { cui: customerData.cui }),
      ...(customerData.cnp && { cnp: maskCnp(customerData.cnp) }),
      ...(customerData.companyName && { company_name: customerData.companyName }),
    },
  });
}

/**
 * Create a payment intent with full customer details
 */
export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>,
  options?: {
    description?: string;
    customer?: CustomerData;
    receiptEmail?: string;
  }
): Promise<Stripe.PaymentIntent> {
  let customerId: string | undefined;

  // Create or get customer if data provided
  if (options?.customer) {
    const customer = await getOrCreateCustomer(options.customer);
    customerId = customer.id;
  }

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'ron',
    description: options?.description,
    metadata,
    customer: customerId,
    receipt_email: options?.receiptEmail || options?.customer?.email,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}
