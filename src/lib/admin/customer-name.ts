/**
 * Customer display name from orders.customer_data — SINGLE SOURCE, shared by
 * the admin dashboard and the orders list. Extracted 30.07.2026: the dashboard
 * carried a simplified copy that only read `customer_data.personalData`, but
 * the current wizard writes the person under `personal` (and company orders
 * keep the name in company/billing), so the whole "Client" column showed N/A.
 */

import { formatPersonName, cleanNamePart } from '@/lib/format/person-name';

export interface CustomerNameData {
  contact?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  personalData?: { firstName?: string; lastName?: string };
  personal?: { firstName?: string; lastName?: string };
  companyData?: { companyName?: string };
  company?: { companyName?: string };
  billing?: {
    type?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
}

export function getCustomerName(cd: CustomerNameData | null | undefined): string {
  const contact = cd?.contact;
  const personal = cd?.personalData || cd?.personal;
  const company = cd?.companyData || cd?.company;
  const billing = cd?.billing;

  // Clientul afișat = BENEFICIARUL serviciului, nu entitatea de facturare.
  // O comandă PF (cazier pe persoană) poate avea factura pe angajator
  // (billing PJ) — afișam greșit firma (ex. E-260709-V9G9M: comanda Biancăi,
  // factura pe INTERTEK). Firma e clientul DOAR când serviciul e pe firmă
  // (există company KYC).
  if (company?.companyName) return company.companyName;
  if (contact?.name) return cleanNamePart(contact.name);
  // Ordinea românească: familie întâi (vezi src/lib/format/person-name.ts).
  const name = formatPersonName(
    contact?.lastName || personal?.lastName || billing?.lastName,
    contact?.firstName || personal?.firstName || billing?.firstName,
  );
  if (name) return name;
  // Fallback final — servicii fără pas personal (ex. constatator pe firmă,
  // identificare imobil): numele există doar la facturare.
  if (billing?.type === 'persoana_juridica' && billing?.companyName) return billing.companyName;
  if (billing?.name) return billing.name;
  return 'N/A';
}
