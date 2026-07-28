/**
 * Recuperează ID-ul lockerului pentru comenzile cu livrare în easybox/fanbox la
 * care lockerul ales nu s-a salvat niciodată (toate comenzile Sameday din iulie
 * 2026 — vezi docs/changelog/2026-07-28-sameday-locker-awb.md).
 *
 * Numele lockerului a supraviețuit în denumirea afișată a metodei de livrare:
 *   „Livrare România · Sameday - EasyBox (easybox Kripton)"
 * Îl căutăm în lista de lockere a Sameday și scriem `courier_quote` cu id-ul
 * real, ca AWB-ul să se poată emite din admin.
 *
 * Potrivirea se face pe nume EXACT (fără diacritice, case-insensitive). Dacă
 * numele apare la mai multe lockere, comanda e raportată și lăsată neatinsă —
 * un colet livrat la alt locker e mai rău decât un AWB emis manual.
 *
 *   npx tsx --env-file=.env.local scripts/backfill-sameday-locker-ids.ts [--apply]
 */
import { createAdminClient } from '@/lib/supabase/admin';

const APPLY = process.argv.includes('--apply');
const API = 'https://api.sameday.ro';

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[şșŞȘ]/g, 's')
    .replace(/[ţțŢȚ]/g, 't')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

type Locker = { name: string; lockerId: number; city: string; county: string; address: string };

async function fetchLockers(): Promise<Locker[]> {
  const auth = await fetch(`${API}/api/authenticate`, {
    method: 'POST',
    headers: {
      'X-AUTH-USERNAME': process.env.SAMEDAY_USERNAME ?? '',
      'X-AUTH-PASSWORD': process.env.SAMEDAY_PASSWORD ?? '',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'remember_me=1&_format=json',
  });
  if (!auth.ok) throw new Error(`Sameday auth ${auth.status}`);
  const token = ((await auth.json()) as { token: string }).token;

  const all: Locker[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${API}/api/client/lockers?countPerPage=500&page=${page}`, {
      headers: { 'X-AUTH-TOKEN': token },
    });
    if (!res.ok) throw new Error(`lockers ${res.status}`);
    const json = (await res.json()) as { data: Locker[]; pages: number };
    all.push(...json.data);
    if (page >= json.pages) break;
  }
  return all;
}

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const { data: orders } = await db
    .from('orders')
    .select('id, order_number, status, delivery_method, courier_quote, delivery_tracking_number')
    .not('delivery_method', 'is', null)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candidates = (orders ?? []).filter((o: any) => {
    const name: string = o.delivery_method?.name ?? '';
    const isLocker = /box|locker/i.test(name);
    return isLocker && !o.courier_quote?.lockerId && !o.delivery_tracking_number;
  });

  if (!candidates.length) {
    console.log('Nicio comandă de recuperat.');
    return;
  }
  console.log(`${candidates.length} comenzi cu locker fără ID. Descarc lista de lockere…`);
  const lockers = await fetchLockers();
  console.log(`${lockers.length} lockere Sameday.\n`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const o of candidates as any[]) {
    const name: string = o.delivery_method?.name ?? '';
    const lockerName = name.match(/\(([^)]+)\)\s*$/)?.[1]?.trim();
    if (!lockerName) {
      console.log(`⏭  ${o.order_number}: nu pot extrage numele lockerului din „${name}"`);
      continue;
    }
    const matches = lockers.filter((l) => norm(l.name) === norm(lockerName));
    if (matches.length !== 1) {
      console.log(
        `⚠️  ${o.order_number}: „${lockerName}" → ${matches.length} potriviri — lăsat neatins` +
          (matches.length > 1 ? ` (${matches.map((m) => `${m.lockerId}/${m.city}`).join(', ')})` : '')
      );
      continue;
    }
    const l = matches[0];
    console.log(
      `✓ ${o.order_number} (${o.status}): „${lockerName}" → lockerId ${l.lockerId} · ${l.address}, ${l.city}`
    );
    if (!APPLY) continue;

    await db
      .from('orders')
      .update({
        courier_quote: {
          ...(o.courier_quote || {}),
          lockerId: String(l.lockerId),
          lockerName: l.name,
          lockerAddress: `${l.address}, ${l.city}`,
          service: o.delivery_method?.service ?? null,
          provider: o.delivery_method?.provider ?? null,
          recovered_at: new Date().toISOString(),
          recovered_from: 'nume locker din delivery_method.name',
        },
        courier_provider: o.delivery_method?.provider ?? null,
        courier_service: o.delivery_method?.service ?? null,
      })
      .eq('id', o.id);
    console.log('   ↳ salvat în courier_quote');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
