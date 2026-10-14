import { describe, expect, it } from 'vitest';
import { slimCustomerData } from '@/lib/admin/slim-customer-data';

describe('slimCustomerData', () => {
  it('replaces inline files but keeps names, contact and document types', () => {
    const big = 'A'.repeat(600_000);
    const out = slimCustomerData({
      contact: { email: 'a@b.ro', phone: '+40712345678' },
      personal: {
        firstName: 'Ion',
        lastName: 'Popescu',
        uploadedDocuments: [{ type: 'ci_front', base64: 'abc', fileName: 'ci.jpg' }, { type: 'selfie', s3Key: 'kyc/x.jpg' }],
        note: big,
      },
    });
    expect(out.contact).toEqual({ email: 'a@b.ro', phone: '+40712345678' });
    expect(out.personal.firstName).toBe('Ion');
    expect(out.personal.uploadedDocuments[0]).toEqual({ type: 'ci_front', base64: '[fișier]', fileName: 'ci.jpg' });
    expect(out.personal.uploadedDocuments[1]).toEqual({ type: 'selfie', s3Key: 'kyc/x.jpg' });
    expect(out.personal.note).toBe('[fișier]');
  });

  it('passes through primitives and null', () => {
    expect(slimCustomerData(null)).toBeNull();
    expect(slimCustomerData(5)).toBe(5);
  });
});
