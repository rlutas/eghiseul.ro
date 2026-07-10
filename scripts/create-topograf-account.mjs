/**
 * Creates the REAL topograf collaborator account (mirceadumitrean@yahoo.com,
 * shared by 2 people) and deletes the old weak-password test account
 * (mircea@yahoo.com). Run ONCE:
 *
 *   node --env-file=.env.local scripts/create-topograf-account.mjs
 *
 * Steps:
 *  1. auth user (email confirmed, strong generated password — printed at the end)
 *  2. profiles.role = 'collaborator'
 *  3. collaborator_service_assignments for ALL services with category='imobiliare'
 *  4. deletes the test account + its assignments
 */
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const EMAIL = 'mirceadumitrean@yahoo.com';
const TEST_ACCOUNT_ID = '0a62c0d9-6dcf-4bec-b945-bd53ce26bb2e'; // mircea@yahoo.com

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

function strongPassword() {
  // 16 chars, unambiguous alphabet, guaranteed digit+upper+lower.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(16);
  let p = '';
  for (const b of bytes) p += alphabet[b % alphabet.length];
  return `Tg-${p}`;
}

const password = strongPassword();

// 1. Create (or find) the auth user.
let userId;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password,
  email_confirm: true,
});
if (createErr) {
  if (/already/i.test(createErr.message)) {
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL);
    if (!existing) throw new Error(`User exists but not found: ${createErr.message}`);
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
    console.log('User already existed — password reset.');
  } else {
    throw createErr;
  }
} else {
  userId = created.user.id;
  console.log('Auth user created:', userId);
}

// 2. Role.
const { error: profErr } = await admin
  .from('profiles')
  .upsert({ id: userId, role: 'collaborator' }, { onConflict: 'id' });
if (profErr) throw profErr;
console.log('profiles.role = collaborator');

// 3. Assign all MANUAL imobiliare services. extras-carte-funciara is excluded:
//    it's fulfilled automatically by the ANCPI worker — the topograph must not
//    see/deliver those orders (double-delivery risk).
const { data: services, error: svcErr } = await admin
  .from('services')
  .select('id, slug')
  .eq('category', 'imobiliare')
  .neq('slug', 'extras-carte-funciara');
if (svcErr) throw svcErr;
for (const s of services ?? []) {
  const { error } = await admin
    .from('collaborator_service_assignments')
    .upsert(
      { collaborator_id: userId, service_id: s.id, can_upload_pdf: true },
      { onConflict: 'collaborator_id,service_id' }
    );
  if (error) throw error;
}
console.log(`Assigned ${services?.length ?? 0} imobiliare services.`);

// 4. Delete the old test account.
const { error: delAssignErr } = await admin
  .from('collaborator_service_assignments')
  .delete()
  .eq('collaborator_id', TEST_ACCOUNT_ID);
if (delAssignErr) console.warn('test assignments delete:', delAssignErr.message);
const { error: delErr } = await admin.auth.admin.deleteUser(TEST_ACCOUNT_ID);
if (delErr) console.warn('test user delete:', delErr.message);
else console.log('Test account mircea@yahoo.com deleted.');

console.log('\n──────────────────────────────────────────');
console.log('CONT TOPOGRAF CREAT');
console.log('URL:     https://eghiseul.ro/colaborator');
console.log('Email:  ', EMAIL);
console.log('Parolă: ', password);
console.log('──────────────────────────────────────────');
