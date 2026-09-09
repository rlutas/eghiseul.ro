import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * „Paginile private" ale portalului de colaborator (Decont lunar, Serviciile
 * mele — tot ce ține de prețuri și decont) pot fi încuiate cu o parolă
 * suplimentară, separată de login.
 *
 * De ce: colaboratorul își împarte contul cu un angajat care lucrează comenzile.
 * Angajatul trebuie să vadă comenzile, dar NU decontul și nici prețurile.
 * Parola o știe doar titularul.
 *
 * Cum: adminul setează parola din Admin → Colaboratori (hash scrypt în
 * `admin_settings.collaborator_private_passwords`, cheiat pe id-ul
 * colaboratorului). Titularul o introduce o dată în portal; primește un cookie
 * httpOnly semnat HMAC, valabil PRIVATE_UNLOCK_TTL_MS. API-urile private cer
 * cookie-ul, deci gardul e pe server, nu doar în pagină — un URL de API deschis
 * direct primește 403.
 *
 * Fără parolă setată pentru colaborator = fără gard (comportamentul de dinainte).
 */

export const PRIVATE_UNLOCK_COOKIE = 'collab_private_unlock';
export const PRIVATE_UNLOCK_TTL_MS = 8 * 60 * 60 * 1000;
const SETTINGS_KEY = 'collaborator_private_passwords';

interface StoredPassword {
  salt: string;
  hash: string;
  updated_at: string;
}

type PasswordMap = Record<string, StoredPassword>;

function hmacKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing (needed to sign unlock cookies)');
  return key;
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password.normalize('NFKC'), salt, 32).toString('hex');
  return { salt, hash };
}

function verifyPassword(password: string, stored: StoredPassword): boolean {
  const candidate = scryptSync(password.normalize('NFKC'), stored.salt, 32);
  const expected = Buffer.from(stored.hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function readPasswordMap(): Promise<PasswordMap> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data } = await admin.from('admin_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
  const value = data?.value;
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as PasswordMap) : {};
}

async function writePasswordMap(map: PasswordMap): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { error } = await admin
    .from('admin_settings')
    .upsert({ key: SETTINGS_KEY, value: map, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(`admin_settings upsert failed: ${error.message}`);
}

/** Există parolă setată pentru colaboratorul ăsta? */
export async function hasPrivatePassword(collaboratorId: string): Promise<boolean> {
  const map = await readPasswordMap();
  return !!map[collaboratorId];
}

/** Id-urile colaboratorilor cu parolă setată (pentru lista din admin). */
export async function collaboratorsWithPrivatePassword(): Promise<Set<string>> {
  return new Set(Object.keys(await readPasswordMap()));
}

export async function setPrivatePassword(collaboratorId: string, password: string): Promise<void> {
  const map = await readPasswordMap();
  map[collaboratorId] = { ...hashPassword(password), updated_at: new Date().toISOString() };
  await writePasswordMap(map);
}

export async function clearPrivatePassword(collaboratorId: string): Promise<void> {
  const map = await readPasswordMap();
  delete map[collaboratorId];
  await writePasswordMap(map);
}

export async function checkPrivatePassword(collaboratorId: string, password: string): Promise<boolean> {
  const map = await readPasswordMap();
  const stored = map[collaboratorId];
  if (!stored) return false;
  return verifyPassword(password, stored);
}

// ── Cookie semnat ──────────────────────────────────────────────────────────

function sign(payload: string): string {
  return createHmac('sha256', hmacKey()).update(payload).digest('base64url');
}

export function makeUnlockToken(collaboratorId: string, now = Date.now()): string {
  const exp = now + PRIVATE_UNLOCK_TTL_MS;
  const payload = `${collaboratorId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyUnlockToken(token: string | undefined, collaboratorId: string, now = Date.now()): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [id, expRaw, sig] = parts as [string, string, string];
  if (id !== collaboratorId) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = sign(`${id}.${expRaw}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unlockCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * Starea gardului pentru colaboratorul curent: dacă e cerută parola și dacă
 * cookie-ul de deblocare e valid.
 */
export async function privateGateState(collaboratorId: string): Promise<{ required: boolean; unlocked: boolean }> {
  const required = await hasPrivatePassword(collaboratorId);
  if (!required) return { required: false, unlocked: true };
  const jar = await cookies();
  const unlocked = verifyUnlockToken(jar.get(PRIVATE_UNLOCK_COOKIE)?.value, collaboratorId);
  return { required, unlocked };
}

/**
 * Pentru rutele API private (earnings, services): aruncă 403 cu
 * `code: 'PRIVATE_LOCKED'` dacă parola e setată și cookie-ul lipsește sau a
 * expirat. Aceeași convenție ca `requirePermission` (throw Response).
 */
export async function requirePrivateUnlock(collaboratorId: string): Promise<void> {
  const { unlocked } = await privateGateState(collaboratorId);
  if (unlocked) return;
  throw new Response(
    JSON.stringify({ success: false, error: 'Pagină protejată — introdu parola internă.', code: 'PRIVATE_LOCKED' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } }
  );
}
