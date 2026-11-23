import { describe, expect, it } from 'vitest';
import { clientTypeFromServerDraft, flippedCompanyClientType } from '@/lib/wizard/restored-client-type';

// The combined cazier flow saves an empty `company` object for every client,
// PF included. Reopening the draft from the server used to read that object
// as „PJ" (E-261118-X6FMM and three other paid PF orders, 18.11.2026).
const emptyCompany = { cui: '', companyName: '', validationStatus: 'pending', uploadedDocuments: [] };

describe('clientTypeFromServerDraft', () => {
  it('keeps PF when the draft saved clientType pf next to an empty company', () => {
    expect(clientTypeFromServerDraft({ clientType: 'pf', company: emptyCompany, contact: {}, personal: {} })).toBe('PF');
  });

  it('keeps PJ when the draft saved clientType pj', () => {
    expect(clientTypeFromServerDraft({ clientType: 'pj', company: { ...emptyCompany, cui: '123' } })).toBe('PJ');
  });

  it('accepts the uppercase shape too', () => {
    expect(clientTypeFromServerDraft({ clientType: 'PF', company: emptyCompany })).toBe('PF');
  });

  it('falls back to the old inference when no clientType was saved', () => {
    expect(clientTypeFromServerDraft({ company: emptyCompany })).toBe('PJ');
    expect(clientTypeFromServerDraft({ contact: { email: 'a@b.ro' } })).toBe('PF');
    expect(clientTypeFromServerDraft({})).toBeNull();
  });
});

describe('flippedCompanyClientType', () => {
  it('turns an empty-company PJ back into PF on a picker service', () => {
    expect(flippedCompanyClientType({ clientType: 'pj', company: emptyCompany }, true)).toBe('pf');
    expect(flippedCompanyClientType({ clientType: 'pj' }, true)).toBe('pf');
  });

  it('leaves a real company alone', () => {
    expect(flippedCompanyClientType({ clientType: 'pj', company: { ...emptyCompany, cui: '123' } }, true)).toBeNull();
    expect(flippedCompanyClientType({ clientType: 'pj', company: { ...emptyCompany, companyName: 'X SRL' } }, true)).toBeNull();
  });

  it('does nothing on services without the picker or on PF', () => {
    expect(flippedCompanyClientType({ clientType: 'pj', company: emptyCompany }, false)).toBeNull();
    expect(flippedCompanyClientType({ clientType: 'pf', company: emptyCompany }, true)).toBeNull();
  });
});
