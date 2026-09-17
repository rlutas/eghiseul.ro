import { describe, it, expect } from 'vitest';
import { isIdentityDocumentType } from '@/lib/kyc/identity-documents';

/**
 * Guard for the KYC bypass.
 *
 * `GET /api/user/prefill-data` reports `has_valid_kyc`, the wizard reads it to
 * skip its whole identity step (`KYCDocumentsStep`), and the server honours the
 * same bypass through `profiles.kyc_verified`. It used to be computed as "any
 * non-expired document whose type is not `selfie`" — harmless while the account
 * could only store three types, and a hole the moment the account started
 * accepting a driving licence, a residence permit and an address certificate.
 *
 * These assert the classification the endpoint now relies on. If a new document
 * type is added to the account, it has to be decided here first: does holding it
 * mean we know who this person is?
 */
describe('what counts as proof of identity', () => {
  it('accepts every shape of identity document the account can store', () => {
    for (const type of [
      'ci_front',
      'ci_nou_front',
      'ci_nou_back',
      'ci_vechi',
      'ci_back',
      'act_identitate',
      'act_identitate_back',
      'passport',
      'passport_opened',
    ]) {
      expect(isIdentityDocumentType(type), type).toBe(true);
    }
  });

  it('does NOT accept documents that prove something else', () => {
    // A driving licence says you may drive; an address certificate says where
    // you live; a residence permit says you may stay. None of them is the
    // identity check a cazier order needs.
    for (const type of [
      'permis_fata',
      'permis_verso',
      'certificat_domiciliu',
      'address_certificate',
      'residence_permit',
      'company_registration_cert',
      'company_statement_cert',
    ]) {
      expect(isIdentityDocumentType(type), type).toBe(false);
    }
  });

  it('does not accept a selfie on its own', () => {
    // A face with no document behind it identifies nobody.
    expect(isIdentityDocumentType('selfie')).toBe(false);
  });

  it('does not accept an unknown type', () => {
    expect(isIdentityDocumentType('ceva_nou')).toBe(false);
    expect(isIdentityDocumentType('')).toBe(false);
  });
});
