import { describe, expect, it } from 'vitest';
import { isInternalPath } from '@/lib/consent';

describe('isInternalPath', () => {
  it('flags admin and collaborator areas', () => {
    expect(isInternalPath('/admin')).toBe(true);
    expect(isInternalPath('/admin/orders/')).toBe(true);
    expect(isInternalPath('/colaborator/orders/abc')).toBe(true);
  });
  it('keeps public pages tracked', () => {
    expect(isInternalPath('/')).toBe(false);
    expect(isInternalPath('/administrare-firma')).toBe(false);
    expect(isInternalPath('/comanda/extras-carte-funciara/')).toBe(false);
    expect(isInternalPath(null)).toBe(false);
  });
});
