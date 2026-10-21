import { describe, it, expect } from 'vitest';
import { findDuplicateUpload } from '@/lib/kyc/duplicate-upload';

describe('findDuplicateUpload', () => {
  it('flags a selfie whose bytes equal an in-memory ID', () => {
    const docs = [{ type: 'act_identitate_back', fileSize: 10, base64: 'data:image/jpeg;base64,QUJD' }];
    expect(findDuplicateUpload('selfie', 'QUJD', 10, docs)).toBe(docs[0]);
  });

  it('accepts a different picture held in memory, even with the same size', () => {
    const docs = [{ type: 'act_identitate', fileSize: 10, base64: 'QUJD' }];
    expect(findDuplicateUpload('selfie', 'WFla', 10, docs)).toBeNull();
  });

  it('falls back to byte size for documents already saved to S3', () => {
    const docs = [{ type: 'act_identitate_back', fileSize: 168832 }];
    expect(findDuplicateUpload('selfie', 'QUJD', 168832, docs)).toBe(docs[0]);
    expect(findDuplicateUpload('selfie', 'QUJD', 168833, docs)).toBeNull();
  });

  it('ignores the slot being replaced', () => {
    const docs = [{ type: 'selfie', fileSize: 10, base64: 'QUJD' }];
    expect(findDuplicateUpload('selfie', 'QUJD', 10, docs)).toBeNull();
  });
});
