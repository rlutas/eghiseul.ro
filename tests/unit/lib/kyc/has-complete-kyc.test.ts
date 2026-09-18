import { describe, it, expect } from 'vitest';
import { hasCompleteKyc } from '@/lib/kyc/identity-documents';

describe('hasCompleteKyc', () => {
  it('needs an identity document AND the selfie', () => {
    // A front alone let a cazier order skip its documents (E-260918-SJCQY).
    expect(hasCompleteKyc(['ci_front'])).toBe(false);
    expect(hasCompleteKyc(['passport_opened'])).toBe(false);
    expect(hasCompleteKyc(['selfie'])).toBe(false);
    expect(hasCompleteKyc(['ci_front', 'selfie'])).toBe(true);
    expect(hasCompleteKyc(['passport', 'selfie_with_id'])).toBe(true);
  });

  it('does not count documents that prove nothing about identity', () => {
    expect(hasCompleteKyc(['permis_fata', 'selfie'])).toBe(false);
    expect(hasCompleteKyc(['certificat_domiciliu', 'selfie'])).toBe(false);
    expect(hasCompleteKyc([])).toBe(false);
  });
});
