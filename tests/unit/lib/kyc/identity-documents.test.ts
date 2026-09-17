import { describe, it, expect } from 'vitest';
import {
  requiredDocumentsFor,
  identityDocumentsFor,
  missingDocumentsFor,
  isCompleteFor,
  detectIdDocumentType,
  hasDocument,
  ocrDocumentTypeFor,
  isOcrResultUsable,
  isStorableKycDocumentType,
  isCompanyDocumentType,
  isIdentityDocumentType,
  fillsProfileFromOcr,
  OPTIONAL_DOCUMENT_TYPES,
  STORABLE_KYC_DOCUMENT_TYPES,
} from '@/lib/kyc/identity-documents';

describe('requiredDocumentsFor', () => {
  it('asks only for the front of an old CI — the back carries no data', () => {
    expect(requiredDocumentsFor('ci_vechi')).toEqual(['ci_front', 'selfie']);
    expect(identityDocumentsFor('ci_vechi')).toEqual(['ci_front']);
  });

  it('asks for both sides of the new electronic CI', () => {
    expect(requiredDocumentsFor('ci_nou')).toEqual(['ci_front', 'ci_nou_back', 'selfie']);
  });

  it('asks for the passport data page', () => {
    expect(requiredDocumentsFor('passport')).toEqual(['passport_opened', 'selfie']);
  });

  it('always includes the selfie — it is the check that the person is the customer', () => {
    for (const choice of ['ci_vechi', 'ci_nou', 'passport'] as const) {
      expect(requiredDocumentsFor(choice)).toContain('selfie');
    }
  });

  it('never requires an optional document', () => {
    for (const choice of ['ci_vechi', 'ci_nou', 'passport'] as const) {
      for (const optional of OPTIONAL_DOCUMENT_TYPES) {
        expect(requiredDocumentsFor(choice)).not.toContain(optional);
      }
    }
  });
});

describe('missingDocumentsFor', () => {
  it('lists what is left, in the order it is asked for', () => {
    expect(missingDocumentsFor('ci_nou', ['ci_front'])).toEqual(['ci_nou_back', 'selfie']);
  });

  it('accepts the wizard and legacy names for the same physical document', () => {
    // A CI scanned during an order is stored as `ci_nou_front`; the manual
    // route stores `act_identitate`. Both are the front of the same card.
    expect(missingDocumentsFor('ci_vechi', ['ci_nou_front', 'selfie'])).toEqual([]);
    expect(missingDocumentsFor('ci_vechi', ['act_identitate', 'selfie_with_id'])).toEqual([]);
    expect(missingDocumentsFor('ci_nou', ['ci_front', 'ci_back', 'selfie'])).toEqual([]);
    expect(missingDocumentsFor('passport', ['passport', 'selfie'])).toEqual([]);
  });

  it('does not accept a passport as a CI, or a CI as a passport', () => {
    expect(missingDocumentsFor('passport', ['ci_front', 'selfie'])).toEqual(['passport_opened']);
    expect(missingDocumentsFor('ci_vechi', ['passport_opened', 'selfie'])).toEqual(['ci_front']);
  });

  it('a buletin holder is complete with front + selfie, with no back on file', () => {
    expect(isCompleteFor('ci_vechi', ['ci_front', 'selfie'])).toBe(true);
    expect(isCompleteFor('ci_nou', ['ci_front', 'selfie'])).toBe(false);
  });
});

describe('detectIdDocumentType', () => {
  it('returns null when nothing identity-shaped is on file', () => {
    expect(detectIdDocumentType([])).toBeNull();
    expect(detectIdDocumentType(['permis_fata', 'certificat_domiciliu'])).toBeNull();
  });

  it('recognises the passport, which is only ever uploaded deliberately', () => {
    expect(detectIdDocumentType(['passport_opened', 'selfie'])).toBe('passport');
    expect(detectIdDocumentType(['ci_front', 'passport_opened'])).toBe('passport');
  });

  it('a new-CI back means the new CI', () => {
    expect(detectIdDocumentType(['ci_front', 'ci_nou_back'])).toBe('ci_nou');
  });

  it('a lone front means the old CI', () => {
    expect(detectIdDocumentType(['ci_front'])).toBe('ci_vechi');
  });
});

describe('hasDocument', () => {
  it('matches on aliases, not on the exact stored string', () => {
    expect(hasDocument('certificat_domiciliu', ['address_certificate'])).toBe(true);
    expect(hasDocument('selfie', ['selfie_with_id'])).toBe(true);
    expect(hasDocument('permis_fata', ['permis_verso'])).toBe(false);
  });
});

describe('ocrDocumentTypeFor', () => {
  it('routes each identity document to an extractor the OCR API knows', () => {
    expect(ocrDocumentTypeFor('ci_front')).toBe('ci_front');
    expect(ocrDocumentTypeFor('ci_nou_back')).toBe('ci_nou_back');
    expect(ocrDocumentTypeFor('passport_opened')).toBe('passport_opened');
  });

  it('does not OCR a selfie or the optional documents', () => {
    expect(ocrDocumentTypeFor('selfie')).toBeNull();
    for (const optional of OPTIONAL_DOCUMENT_TYPES) {
      expect(ocrDocumentTypeFor(optional)).toBeNull();
    }
  });
});

describe('isOcrResultUsable', () => {
  it('rejects a failed read', () => {
    expect(isOcrResultUsable(null)).toBe(false);
    expect(isOcrResultUsable({ success: false, confidence: 99 })).toBe(false);
  });

  it('accepts a confident read', () => {
    expect(isOcrResultUsable({ success: true, confidence: 80, extractedData: {} })).toBe(true);
  });

  it('accepts a zero-confidence read whose data is usable — Gemini under-reports', () => {
    expect(
      isOcrResultUsable({ success: true, confidence: 0, extractedData: { cnp: '1960910123456' } })
    ).toBe(true);
    expect(
      isOcrResultUsable({ success: true, confidence: 0, extractedData: { firstName: 'Ion', lastName: 'Popescu' } })
    ).toBe(true);
    // The back of a new CI carries only the address.
    expect(
      isOcrResultUsable({ success: true, confidence: 0, extractedData: { address: { city: 'Cluj-Napoca' } } })
    ).toBe(true);
  });

  it('rejects a zero-confidence read that returned nothing usable', () => {
    expect(isOcrResultUsable({ success: true, confidence: 10, extractedData: { firstName: 'Ion' } })).toBe(false);
    expect(isOcrResultUsable({ success: true, confidence: 0, extractedData: {} })).toBe(false);
  });
});

describe('document type classification', () => {
  it('accepts every type the account and the wizard can produce', () => {
    const produced = [
      'ci_front', 'ci_nou_back', 'passport_opened', 'selfie',
      'certificat_domiciliu', 'residence_permit', 'permis_fata', 'permis_verso',
      'act_identitate', 'act_identitate_back', 'ro_cei_reader_pdf', 'ci_vechi',
    ];
    for (const type of produced) {
      expect(isStorableKycDocumentType(type)).toBe(true);
    }
    expect(isStorableKycDocumentType('nu_exista')).toBe(false);
  });

  it('keeps the legacy names alive for rows already stored under them', () => {
    expect(isStorableKycDocumentType('ci_back')).toBe(true);
    expect(isStorableKycDocumentType('ci_nou_front')).toBe(true);
    expect(isStorableKycDocumentType('address_certificate')).toBe(true);
    expect(isStorableKycDocumentType('passport')).toBe(true);
  });

  it('has no duplicates', () => {
    expect(new Set(STORABLE_KYC_DOCUMENT_TYPES).size).toBe(STORABLE_KYC_DOCUMENT_TYPES.length);
  });

  it('separates company documents from personal ones', () => {
    expect(isCompanyDocumentType('company_registration_cert')).toBe(true);
    expect(isCompanyDocumentType('ci_front')).toBe(false);
  });

  it('only an identity document may flip kyc_verified', () => {
    expect(isIdentityDocumentType('ci_front')).toBe(true);
    expect(isIdentityDocumentType('passport_opened')).toBe(true);
    // NOT the selfie. It is the check that the holder matches the document; on
    // its own a face identifies nobody, and this predicate gates the KYC bypass
    // in both api/user/kyc/save and api/user/prefill-data — so counting a selfie
    // would let someone order a cazier with no document on file.
    expect(isIdentityDocumentType('selfie')).toBe(false);
    // A driving licence or a residence permit says nothing about the identity check.
    expect(isIdentityDocumentType('permis_fata')).toBe(false);
    expect(isIdentityDocumentType('residence_permit')).toBe(false);
    expect(isIdentityDocumentType('certificat_domiciliu')).toBe(false);
    expect(isIdentityDocumentType('company_registration_cert')).toBe(false);
  });

  it('only a document carrying personal data fills the profile', () => {
    expect(fillsProfileFromOcr('ci_front')).toBe(true);
    expect(fillsProfileFromOcr('ci_nou_front')).toBe(true);
    expect(fillsProfileFromOcr('ci_nou_back')).toBe(true);
    expect(fillsProfileFromOcr('passport_opened')).toBe(true);
    expect(fillsProfileFromOcr('selfie')).toBe(false);
    expect(fillsProfileFromOcr('permis_fata')).toBe(false);
  });
});
