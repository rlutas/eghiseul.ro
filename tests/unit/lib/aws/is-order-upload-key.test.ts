import { describe, it, expect } from 'vitest';
import { isOrderUploadKey } from '@/lib/aws/s3';

describe('isOrderUploadKey', () => {
  const id = 'e0a5b3f2-1111-4222-8333-444455556666';
  it("accepts only this order's upload namespace", () => {
    expect(isOrderUploadKey(`orders/2026/09/${id}/uploads/proof.jpg`, id)).toBe(true);
    expect(isOrderUploadKey(`orders/2026/09/other-order/uploads/proof.jpg`, id)).toBe(false);
    expect(isOrderUploadKey(`orders/2026/09/${id}/signature/sig.png`, id)).toBe(false);
    expect(isOrderUploadKey(`kyc/${id}/ci_front.jpg`, id)).toBe(false);
    expect(isOrderUploadKey(`orders/2026/09/${id}/uploads/../../x/uploads/y.jpg`, id)).toBe(false);
  });
  it('rejects an order id that is not a plain identifier', () => {
    expect(isOrderUploadKey('orders/2026/09/a.*/uploads/x.jpg', 'a.*')).toBe(false);
  });
});
