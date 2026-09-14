/**
 * Helper comun pentru trimiterile de marketing către clienți: găsește rândul
 * din `contacts` (token de dezabonare, prenume, status) pentru un email; dacă
 * lipsește (comandă plătită înainte de migrarea 110 sau sync eșuat), îl
 * creează prin `upsertContactForPaidOrder`.
 */

import { upsertContactForPaidOrder } from '@/lib/contacts/upsert';

export interface MarketingContact {
  id: string;
  email: string;
  first_name: string | null;
  marketing_status: string;
  unsubscribe_token: string;
  services: string[];
}

const SELECT = 'id, email, first_name, marketing_status, unsubscribe_token, services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadContactsByEmail(admin: any, emails: string[]): Promise<Map<string, MarketingContact>> {
  const map = new Map<string, MarketingContact>();
  const unique = Array.from(new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)));
  for (let i = 0; i < unique.length; i += 200) {
    const { data } = await admin.from('contacts').select(SELECT).in('email', unique.slice(i, i + 200));
    for (const c of data ?? []) map.set(String(c.email).toLowerCase(), c as MarketingContact);
  }
  return map;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ensureContactForOrder(admin: any, orderId: string, email: string): Promise<MarketingContact | null> {
  await upsertContactForPaidOrder(orderId);
  const { data } = await admin.from('contacts').select(SELECT).eq('email', email.trim().toLowerCase()).maybeSingle();
  return (data as MarketingContact | null) ?? null;
}

export function canReceiveMarketing(contact: MarketingContact | null | undefined): boolean {
  return !!contact && contact.marketing_status !== 'unsubscribed' && contact.marketing_status !== 'suppressed';
}

export function appBase(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
}

export function unsubscribeUrlFor(contact: MarketingContact): string {
  return `${appBase()}/api/contacts/unsubscribe?token=${contact.unsubscribe_token}`;
}
