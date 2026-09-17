import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isIdentityDocumentType } from '@/lib/kyc/identity-documents';

/**
 * Migration 172 hard-codes the list of identity document types inside
 * `migrate_order_to_profile()`, because plpgsql cannot call the TypeScript
 * predicate. Two copies of a security rule drift; this test is what stops them.
 *
 * The flag the SQL sets, `profiles.kyc_verified`, is honoured by
 * `POST /api/orders/[id]/submit` as a bypass of the identity step. A type
 * wrongly present in the SQL list is a cazier ordered with no document on file.
 */
const MIGRATION = join(
  process.cwd(),
  'supabase/migrations/172_migrate_order_to_profile_kyc_flag.sql'
);

function sqlIdentityTypes(sql: string): string[][] {
  // Every `IN ( 'a', 'b', ... )` list in the migration: one in the function,
  // one in the backfill. Both must agree with the TypeScript predicate.
  const lists = [...sql.matchAll(/IN \(\s*((?:'[a-z_]+',?\s*)+)\)/gi)];
  return lists.map(m => [...m[1].matchAll(/'([a-z_]+)'/g)].map(t => t[1]));
}

describe('the SQL copy of the identity-document list', () => {
  const sql = readFileSync(MIGRATION, 'utf8');
  const lists = sqlIdentityTypes(sql);

  it('is present in both the function and the backfill', () => {
    expect(lists).toHaveLength(2);
    expect(lists[0]).toEqual(lists[1]);
  });

  it('contains only types TypeScript also treats as proof of identity', () => {
    for (const type of lists.flat()) {
      expect(isIdentityDocumentType(type), type).toBe(true);
    }
  });

  it('never contains a selfie or a document that proves something else', () => {
    for (const type of ['selfie', 'selfie_with_id', 'permis_fata', 'residence_permit', 'certificat_domiciliu']) {
      expect(lists[0]).not.toContain(type);
    }
  });

  it('covers every identity type an order can actually store', () => {
    // These are the types the wizard writes into
    // `customer_data.personal.uploadedDocuments`; production holds ci_front,
    // act_identitate, act_identitate_back, passport_opened and passport.
    for (const type of [
      'ci_front',
      'ci_nou_front',
      'ci_nou_back',
      'act_identitate',
      'act_identitate_back',
      'passport',
      'passport_opened',
    ]) {
      expect(lists[0], type).toContain(type);
    }
  });
});
