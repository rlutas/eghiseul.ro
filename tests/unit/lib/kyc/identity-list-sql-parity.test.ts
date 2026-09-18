import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isIdentityFrontType } from '@/lib/kyc/identity-documents';

/**
 * Migration 177 (which replaced 172's function) hard-codes the list of identity document types inside
 * `migrate_order_to_profile()`, because plpgsql cannot call the TypeScript
 * predicate. Two copies of a security rule drift; this test is what stops them.
 *
 * The flag the SQL sets, `profiles.kyc_verified`, is honoured by
 * `POST /api/orders/[id]/submit` as a bypass of the identity step. A type
 * wrongly present in the SQL list is a cazier ordered with no document on file.
 */
const MIGRATION = join(
  process.cwd(),
  'supabase/migrations/177_kyc_front_only_coupon_redeem.sql'
);

function sqlIdentityTypes(sql: string): string[][] {
  // Every `IN ( 'a', 'b', ... )` list in the migration: one in the function,
  // one in the backfill. Both must agree with the TypeScript predicate.
  const lists = [...sql.matchAll(/IN \(\s*((?:'[a-z_]+',?\s*)+)\)/gi)];
  // Migration 177 also lists the selfie types; only the identity lists (the
  // ones naming a CI front) are the subject here.
  return lists
    .map(m => [...m[1].matchAll(/'([a-z_]+)'/g)].map(t => t[1]))
    .filter(list => list.includes('ci_front'));
}

describe('the SQL copy of the identity-document list', () => {
  const sql = readFileSync(MIGRATION, 'utf8');
  const lists = sqlIdentityTypes(sql);

  it('is present in both the function and the backfill', () => {
    expect(lists).toHaveLength(2);
    expect(lists[0]).toEqual(lists[1]);
  });

  it('contains only types TypeScript also treats as proof of identity', () => {
    // Front sides only (migration 177): the back of a new CI carries the
    // address and must not complete a KYC set.
    for (const type of lists.flat()) {
      expect(isIdentityFrontType(type), type).toBe(true);
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
    for (const type of ['ci_front', 'ci_nou_front', 'act_identitate', 'passport', 'passport_opened']) {
      expect(lists[0], type).toContain(type);
    }
    for (const back of ['ci_nou_back', 'act_identitate_back']) {
      expect(lists[0], back).not.toContain(back);
    }
  });
});
