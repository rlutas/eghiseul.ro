import { z } from 'zod';

// International shipping (DHL Express / Poșta Română International).
// Shared between the wizard delivery step and unit tests.

// International address — no county code, free-text country. Recipient name +
// phone are required: the courier customs/AWB form cannot be filled without them.
export const internationalAddressSchema = z.object({
  street: z.string().min(2, 'Strada este obligatorie'),
  city: z.string().min(2, 'Localitatea este obligatorie'),
  postalCode: z.string().min(2, 'Codul poștal este obligatoriu'),
  country: z.string().min(2, 'Țara este obligatorie'),
  recipientName: z.string().min(2, 'Numele destinatarului este obligatoriu'),
  recipientPhone: z
    .string()
    .min(8, 'Telefonul este obligatoriu')
    .regex(/^[+0-9\s\-()]+$/, 'Telefon invalid'),
});

export type InternationalAddressFormData = z.infer<typeof internationalAddressSchema>;

export type IntlProviderId = 'dhl_intl' | 'posta_intl';

/**
 * Restore the international courier selection from a saved draft.
 * Drafts saved before provider persistence stored only the display name in
 * delivery_method, so fall back to name matching when courierProvider is missing.
 */
export function deriveIntlProvider(
  courierProvider: string | null | undefined,
  methodName: string | null | undefined,
): IntlProviderId | null {
  if (courierProvider === 'dhl_intl' || courierProvider === 'posta_intl') {
    return courierProvider;
  }
  const name = (methodName || '').toLowerCase();
  if (!name.includes('internațional') && !name.includes('international')) {
    return null;
  }
  if (name.includes('dhl')) return 'dhl_intl';
  if (name.includes('poșta') || name.includes('posta')) return 'posta_intl';
  return null;
}

/**
 * Which physical delivery sub-flow a saved draft was in. Previously restore
 * hardcoded 'romania' for any courier method, losing the international
 * selection on reload/step-back (order E-260716-RAFUG got stuck this way).
 */
export function derivePhysicalRegion(
  method: string | null | undefined,
  courierProvider: string | null | undefined,
  methodName: string | null | undefined,
): 'romania' | 'international' | null {
  if (!method || method === 'email') return null;
  return deriveIntlProvider(courierProvider, methodName) ? 'international' : 'romania';
}
