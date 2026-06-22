import { NextResponse } from 'next/server';
import { getBnrRates } from '@/lib/bnr';

export const revalidate = 3600; // curs BNR se schimbă o dată/zi

/**
 * Cursul BNR pentru toggle-ul €/Lei din calculatoare + pagina /curs-valutar.
 * Întoarce shortcut-ul `eur` (lei/EUR) + lista completă de valute.
 */
export async function GET() {
  const { eur, date, rates } = await getBnrRates();
  return NextResponse.json({ eur, date, rates });
}
