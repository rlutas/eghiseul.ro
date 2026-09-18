/**
 * Everything the order wizard can fill in from a customer's account, built
 * on the server. One function for two callers: `GET /api/user/prefill-data`
 * (the client fetch) and the order page itself, which passes the result into
 * the wizard so a signed-in customer sees their data at first paint instead
 * of an empty form that fills in a second later (feedback 18.09.2026, #3).
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { AddressState } from '@/types/verification-modules';
import { hasCompleteKyc } from '@/lib/kyc/identity-documents';

export interface UserPrefillData {
  personal: {
    cnp: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    phone: string;
    address: AddressState | null;
    // Document info from KYC
    documentSeries?: string;
    documentNumber?: string;
    documentExpiry?: string;
    documentType?: string | null;
  };
  contact: {
    email: string;
    phone: string;
    preferredContact: string;
  };
  // Company data from profile
  company?: {
    cui: string;
    name: string;
    type: string;
    registrationNumber: string;
    address: string;
    isActive: boolean;
    vatPayer: boolean;
    verified: boolean;
  } | null;
  kyc_documents: Record<string, {
    id: string;
    file_url: string;
    verified_at: string;
    expires_at: string | null;
    is_expiring_soon: boolean;
    is_expired: boolean;
  }>;
  billing_profiles: Array<{
    id: string;
    type: string;
    label: string;
    billing_data: Record<string, unknown>;
    is_default: boolean;
  }>;
  kyc_verified: boolean;
  has_valid_kyc: boolean;
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildUserPrefillData(supabase: SupabaseClient<any>, user: User): Promise<UserPrefillData & Record<string, unknown>> {
// Fetch profile data
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (profileError && profileError.code !== 'PGRST116') {
  console.error('Profile fetch error:', profileError);
}

// Fetch saved data (addresses, contacts)
// Table not yet in generated types - TODO: regenerate Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: savedData, error: savedDataError } = await (supabase as any)
  .from('user_saved_data')
  .select('*')
  .eq('user_id', user.id)
  .order('is_default', { ascending: false });

if (savedDataError && savedDataError.code !== 'PGRST116') {
  console.error('Saved data fetch error:', savedDataError);
}

// Fetch active KYC documents
// Table not yet in generated types - TODO: regenerate Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: kycDocs, error: kycError } = await (supabase as any)
  .from('kyc_verifications')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .order('verified_at', { ascending: false });

if (kycError && kycError.code !== 'PGRST116') {
  console.error('KYC fetch error:', kycError);
}

// Fetch billing profiles
// Table not yet in generated types - TODO: regenerate Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: billingProfiles, error: billingError } = await (supabase as any)
  .from('billing_profiles')
  .select('*')
  .eq('user_id', user.id)
  .order('is_default', { ascending: false });

if (billingError && billingError.code !== 'PGRST116') {
  console.error('Billing profiles fetch error:', billingError);
}

// Check for expiring documents (within 30 days)
const now = new Date();
const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

// Build KYC documents map with expiry status
const kycDocuments: Record<
  string,
  {
    id: string;
    file_url: string;
    verified_at: string;
    expires_at: string | null;
    is_expiring_soon: boolean;
    is_expired: boolean;
    validation_result: Record<string, unknown> | null;
    extracted_data: Record<string, unknown> | null;
  }
> = {};

if (kycDocs && kycDocs.length > 0) {
  for (const doc of kycDocs) {
    const expiresAt = doc.expires_at ? new Date(doc.expires_at) : null;
    const isExpiringSoon = expiresAt ? expiresAt <= thirtyDaysFromNow : false;
    const isExpired = expiresAt ? expiresAt <= now : false;

    kycDocuments[doc.document_type] = {
      id: doc.id,
      file_url: doc.file_url,
      verified_at: doc.verified_at,
      expires_at: doc.expires_at,
      is_expiring_soon: isExpiringSoon,
      is_expired: isExpired,
      validation_result: doc.validation_result,
      extracted_data: doc.extracted_data,
    };
  }
}

// Find default address and contact from saved data
 
const defaultAddress = savedData?.find(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (d: any) => d.data_type === 'address' && d.is_default
);
 
const defaultContact = savedData?.find(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (d: any) => d.data_type === 'contact' && d.is_default
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allAddresses = savedData?.filter((d: any) => d.data_type === 'address') || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allContacts = savedData?.filter((d: any) => d.data_type === 'contact') || [];

// Extract document info from KYC (series, number, expiry)
let documentSeries = '';
let documentNumber = '';
let documentExpiry = '';
let documentType: string | null = null;

// Find the front ID document (ci_front or ci_nou_front)
// `passport_opened` is what the account and the wizard actually store for a
// passport; without it, a passport-only account prefilled no document
// series or number.
const frontIdDoc =
  kycDocuments['ci_front'] ||
  kycDocuments['ci_nou_front'] ||
  kycDocuments['passport_opened'] ||
  kycDocuments['passport'];
if (frontIdDoc && frontIdDoc.extracted_data) {
  const extracted = frontIdDoc.extracted_data as Record<string, unknown>;
  documentSeries = (extracted.series as string) || '';
  documentNumber = (extracted.number as string) || '';
  documentExpiry = (extracted.expiryDate as string) || '';
  documentType = (extracted.documentType as string) || Object.keys(kycDocuments).find(k => k.includes('ci')) || null;
}

// Build response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const profileAny = profile as any;
const data: UserPrefillData & Record<string, unknown> = {
    // Personal data from profile
    personal: {
      cnp: profileAny?.cnp || '',
      firstName: profileAny?.first_name || '',
      lastName: profileAny?.last_name || '',
      birthDate: profileAny?.birth_date || '',
      birthPlace: profileAny?.birth_place || '',
      phone: profileAny?.phone || '',
      // Default address
      address: defaultAddress?.data || null,
      // Document info from KYC
      documentSeries,
      documentNumber,
      documentExpiry,
      documentType,
    },
    // Company data from profile (for PJ orders)
    company: profileAny?.company_cui ? {
      cui: profileAny.company_cui,
      name: profileAny.company_name || '',
      type: profileAny.company_type || '',
      registrationNumber: profileAny.company_registration_number || '',
      address: profileAny.company_address || '',
      isActive: profileAny.company_is_active || false,
      vatPayer: profileAny.company_vat_payer || false,
      verified: profileAny.company_verified || false,
    } : null,
    // Contact data
    contact: {
      email: profileAny?.email || user.email || '',
      phone: profileAny?.phone || '',
      // The stored key is camelCase — `preferred_contact` was read here and
      // always came back undefined, so the customer's choice never left the
      // account. Snake_case kept as a fallback for any legacy row.
      preferredContact:
        defaultContact?.data?.preferredContact ||
        defaultContact?.data?.preferred_contact ||
        'email',
    },
    // All saved addresses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    savedAddresses: allAddresses.map((a: any) => ({
      id: a.id,
      label: a.label,
      data: a.data,
      is_default: a.is_default,
    })),
    // All saved contacts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    savedContacts: allContacts.map((c: any) => ({
      id: c.id,
      label: c.label,
      data: c.data,
      is_default: c.is_default,
    })),
    // KYC documents
    kyc_documents: kycDocuments,
    kyc_verified: profileAny?.kyc_verified || false,
    // Only an IDENTITY document counts. This used to be "anything that is
    // not a selfie", which was harmless while the account could store just
    // three types — but the account now accepts a driving licence, a
    // residence permit and an address certificate too, and any of those
    // would have flipped this to true. The wizard reads it to skip its KYC
    // step (KYCDocumentsStep.tsx) and the server honours the same bypass via
    // profiles.kyc_verified, so a customer could have ordered a cazier with
    // no identity document on file at all.
    // Document AND selfie, both unexpired — the same predicate as
    // `profiles.kyc_verified` and the submit bypass.
    has_valid_kyc: hasCompleteKyc(
      Object.entries(kycDocuments)
        .filter(([, doc]) => !doc.is_expired)
        .map(([docType]) => docType)
    ),
    // Billing profiles
     
    billing_profiles:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      billingProfiles?.map((bp: any) => ({
        id: bp.id,
        type: bp.type,
        label: bp.label,
        billing_data: bp.billing_data,
        is_default: bp.is_default,
      })) || [],
    // Metadata
    profile_created_at: profileAny?.created_at,
    profile_updated_at: profileAny?.updated_at,
};


  return data;
}
