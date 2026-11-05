import { describe, it, expect, vi } from 'vitest';
import {
  classifyCompanyDocumentKey,
  finalCompanyDocumentKey,
  settleCompanyDocuments,
  type CompanyDocumentRecord,
} from '@/lib/orders/company-documents';

const ORDER = '11111111-2222-3333-4444-555555555555';
const OTHER = '99999999-2222-3333-4444-555555555555';

describe('classifyCompanyDocumentKey', () => {
  it('recognises a document already stored for this order', () => {
    expect(classifyCompanyDocumentKey(ORDER, `kyc/${ORDER}/company_company_statement_cert.pdf`)).toBe('final');
  });

  it('recognises a PDF the browser uploaded for this order', () => {
    expect(classifyCompanyDocumentKey(ORDER, `orders/${ORDER}/acte-client/abc.pdf`)).toBe('staged');
  });

  it("refuses another order's document, whichever namespace it is in", () => {
    expect(classifyCompanyDocumentKey(ORDER, `kyc/${OTHER}/company_x.pdf`)).toBe('foreign');
    expect(classifyCompanyDocumentKey(ORDER, `orders/${OTHER}/acte-client/abc.pdf`)).toBe('foreign');
    expect(classifyCompanyDocumentKey(ORDER, 'contracts/2026/x.pdf')).toBe('foreign');
  });

  it('refuses a key that climbs out of the namespace', () => {
    expect(classifyCompanyDocumentKey(ORDER, `kyc/${ORDER}/../${OTHER}/x.pdf`)).toBe('foreign');
    expect(classifyCompanyDocumentKey(ORDER, `orders/${ORDER}/acte-client/../../${OTHER}/x.pdf`)).toBe('foreign');
  });

  it('refuses anything that is not a string', () => {
    expect(classifyCompanyDocumentKey(ORDER, undefined)).toBe('foreign');
    expect(classifyCompanyDocumentKey(ORDER, 42)).toBe('foreign');
  });
});

describe('finalCompanyDocumentKey', () => {
  it('keeps the key shape the admin page already reads', () => {
    expect(finalCompanyDocumentKey(ORDER, 'company_statement_cert', 'application/pdf')).toBe(
      `kyc/${ORDER}/company_company_statement_cert.pdf`
    );
    expect(finalCompanyDocumentKey(ORDER, 'company_registration_cert', 'image/png')).toBe(
      `kyc/${ORDER}/company_company_registration_cert.png`
    );
    expect(finalCompanyDocumentKey(ORDER, 'company_registration_cert', 'image/jpeg')).toBe(
      `kyc/${ORDER}/company_company_registration_cert.jpg`
    );
  });

  it('strips path characters from a client-written document type', () => {
    expect(finalCompanyDocumentKey(ORDER, '../../evil', 'application/pdf')).toBe(`kyc/${ORDER}/company_evil.pdf`);
  });

  it('falls back to a generic name when the type is missing', () => {
    expect(finalCompanyDocumentKey(ORDER, undefined, undefined)).toBe(`kyc/${ORDER}/company_document.jpg`);
  });
});

describe('settleCompanyDocuments', () => {
  const deps = () => ({
    copyFile: vi.fn(async (_from: string, to: string) => to),
    uploadBase64: vi.fn(async () => undefined),
  });

  it('moves a PDF uploaded from the browser to its final key', async () => {
    const d = deps();
    const [doc] = await settleCompanyDocuments(
      ORDER,
      [{ type: 'company_statement_cert', mimeType: 'application/pdf', s3Key: `orders/${ORDER}/acte-client/a.pdf` }],
      d
    );
    expect(d.copyFile).toHaveBeenCalledWith(
      `orders/${ORDER}/acte-client/a.pdf`,
      `kyc/${ORDER}/company_company_statement_cert.pdf`
    );
    expect(doc.s3Key).toBe(`kyc/${ORDER}/company_company_statement_cert.pdf`);
  });

  it('drops a document that points at another order, without touching S3', async () => {
    const d = deps();
    const docs = await settleCompanyDocuments(ORDER, [{ type: 'x', s3Key: `kyc/${OTHER}/company_x.pdf` }], d);
    expect(docs).toEqual([]);
    expect(d.copyFile).not.toHaveBeenCalled();
  });

  it('uploads an inline photo and removes the base64', async () => {
    const d = deps();
    const [doc] = await settleCompanyDocuments<CompanyDocumentRecord>(
      ORDER,
      [{ type: 'company_registration_cert', mimeType: 'image/jpeg', base64: 'AAAA' }],
      d
    );
    expect(d.uploadBase64).toHaveBeenCalledTimes(1);
    expect(doc.s3Key).toBe(`kyc/${ORDER}/company_company_registration_cert.jpg`);
    expect(doc.base64).toBeUndefined();
  });

  it('leaves a document already at its final key alone, so a repeated submit changes nothing', async () => {
    const d = deps();
    const key = `kyc/${ORDER}/company_company_statement_cert.pdf`;
    const [doc] = await settleCompanyDocuments(ORDER, [{ type: 'company_statement_cert', s3Key: key }], d);
    expect(doc.s3Key).toBe(key);
    expect(d.copyFile).not.toHaveBeenCalled();
    expect(d.uploadBase64).not.toHaveBeenCalled();
  });

  it('keeps the uploaded file when the copy fails', async () => {
    const d = deps();
    d.copyFile.mockRejectedValueOnce(new Error('S3 down'));
    const key = `orders/${ORDER}/acte-client/a.pdf`;
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const [doc] = await settleCompanyDocuments(ORDER, [{ type: 'x', s3Key: key }], d);
    spy.mockRestore();
    expect(doc.s3Key).toBe(key);
  });
});
