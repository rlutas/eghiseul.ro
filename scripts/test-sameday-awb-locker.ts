/**
 * Test REAL de emitere AWB Sameday către easybox, pe contul live.
 *
 * Rulează exact drumul de cod al rutei din admin (`SamedayProvider.createShipment`)
 * cu datele reale ale unei comenzi, ca să validăm payload-ul end-to-end. NU scrie
 * nimic în baza de date și NU trimite emailuri — dacă AWB-ul iese bine, echipa îl
 * generează normal din admin.
 *
 * ⚠️ Creează o expediere REALĂ pe contul Sameday. Se poate șterge după verificare:
 *   npx tsx --env-file=.env.local scripts/test-sameday-awb-locker.ts --delete <AWB>
 *
 *   npx tsx --env-file=.env.local scripts/test-sameday-awb-locker.ts <NR_COMANDA> [--emit]
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { SamedayProvider } from '@/lib/services/courier/sameday';
import type { ShipmentRequest } from '@/lib/services/courier/types';

const args = process.argv.slice(2);
const DELETE_IDX = args.indexOf('--delete');

async function deleteAwb(awb: string) {
  const auth = await fetch('https://api.sameday.ro/api/authenticate', {
    method: 'POST',
    headers: {
      'X-AUTH-USERNAME': process.env.SAMEDAY_USERNAME ?? '',
      'X-AUTH-PASSWORD': process.env.SAMEDAY_PASSWORD ?? '',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'remember_me=1&_format=json',
  });
  const { token } = (await auth.json()) as { token: string };
  const res = await fetch(`https://api.sameday.ro/api/awb/${awb}`, {
    method: 'DELETE',
    headers: { 'X-AUTH-TOKEN': token },
  });
  console.log(`DELETE ${awb} → ${res.status} ${(await res.text()).slice(0, 200)}`);
}

async function main() {
  if (DELETE_IDX >= 0) {
    const awb = args[DELETE_IDX + 1];
    if (!awb) throw new Error('lipsește numărul AWB de șters');
    await deleteAwb(awb);
    return;
  }

  const orderNumber = args.find((a) => !a.startsWith('--'));
  if (!orderNumber) throw new Error('usage: … scripts/test-sameday-awb-locker.ts <NR_COMANDA> [--emit]');
  const EMIT = args.includes('--emit');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: order } = await db
    .from('orders')
    .select('*, services(name)')
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (!order) throw new Error(`comanda ${orderNumber} negăsită`);

  const cd = order.customer_data || {};
  const contact = cd.contact || {};
  const personal = cd.personal || {};
  const addr = order.delivery_address || {};
  const quote = order.courier_quote || {};

  const recipientName =
    order.delivery_address?.recipientName ||
    [personal.lastName, personal.firstName].filter(Boolean).join(' ') ||
    contact.name ||
    '';

  const request: ShipmentRequest = {
    sender: {
      name: 'EDIGITALIZARE SRL',
      phone: '0740000000',
      email: 'contact@eghiseul.ro',
      street: 'Str. Test',
      streetNo: '1',
      city: 'Satu Mare',
      county: 'Satu Mare',
      postalCode: '440000',
      country: 'RO',
    },
    recipient: {
      name: recipientName,
      phone: order.delivery_address?.recipientPhone || contact.phone || '',
      email: contact.email || '',
      street: addr.street || '',
      streetNo: addr.number || '',
      city: addr.city || '',
      county: addr.county || '',
      postalCode: addr.postalCode || '',
      country: 'RO',
    },
    packages: [{ weight: 0.3, length: 30, width: 22, height: 1, quantity: 1 }],
    content: { description: `TEST integrare — ${orderNumber}`, isDocument: true },
    service: quote.service || order.courier_service || 'LOCKER_NEXTDAY',
    lockerId: quote.lockerId,
    paymentBy: 'sender',
    orderReference: `TEST-${orderNumber}`,
  };

  console.log('Comandă :', orderNumber, '|', order.services?.name);
  console.log('Serviciu:', request.service, '| locker:', quote.lockerId, `(${quote.lockerName})`);
  console.log('Dest.   :', request.recipient.name, request.recipient.phone, request.recipient.email);
  console.log('Adresă  :', `${addr.street} ${addr.number}, ${addr.city}, ${addr.county}`);

  if (!EMIT) {
    console.log('\n(dry-run — rulează cu --emit ca să emiți AWB REAL pe contul live)');
    return;
  }

  const provider = new SamedayProvider();
  const result = await provider.createShipment(request);
  console.log('\nRezultat:', JSON.stringify(result, null, 1));
  if (result.success) {
    console.log(`\n✅ AWB REAL emis: ${result.awb}`);
    console.log(`   Șterge-l cu: npx tsx --env-file=.env.local scripts/test-sameday-awb-locker.ts --delete ${result.awb}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('EȘEC:', e?.message || e);
    process.exit(1);
  });
