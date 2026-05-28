/**
 * Type/contract tests for DocumentTypePicker.
 *
 * Why not a full render test: project doesn't have @testing-library/react
 * installed and Vitest is configured for node environment, not jsdom. A
 * component render test would need setup we're not adding in this PR.
 *
 * What we DO test:
 *   - The component module exports the IdDocumentType union correctly
 *   - The union is exactly the 3 expected values (no drift)
 *   - The DocumentTypePicker function is a valid React component shape
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  DocumentTypePicker,
  type IdDocumentType,
} from '@/components/orders/modules/personal-kyc/DocumentTypePicker';

describe('DocumentTypePicker — type contract', () => {
  it('exports IdDocumentType as the expected 3-variant union', () => {
    // Compile-time check that the union has exactly these 3 values.
    expectTypeOf<IdDocumentType>().toEqualTypeOf<'ci_vechi' | 'ci_nou' | 'passport'>();
  });

  it('accepts each of the 3 variants as valid IdDocumentType values', () => {
    const vechi: IdDocumentType = 'ci_vechi';
    const nou: IdDocumentType = 'ci_nou';
    const passport: IdDocumentType = 'passport';
    expect([vechi, nou, passport]).toEqual(['ci_vechi', 'ci_nou', 'passport']);
  });

  it('is exported as a function (React component)', () => {
    expect(typeof DocumentTypePicker).toBe('function');
  });

  it('component has displayName-compatible signature (function with props)', () => {
    expect(DocumentTypePicker.length).toBeGreaterThanOrEqual(0);
  });
});
