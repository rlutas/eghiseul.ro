import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/payment/bank-details
 *
 * Datele bancare afișate clientului la plata prin transfer (checkout + pagina
 * comenzii). Public intenționat: sunt aceleași date care apar pe factură.
 * Sursa: `admin_settings.bank_details` (editabile din Admin → Setări → Plăți).
 */
export interface PublicBankDetails {
  accountHolder: string;
  bankName: string;
  swift: string;
  ibanRon: string;
  ibanEur: string;
}

export const revalidate = 300;

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data } = await admin
      .from('admin_settings')
      .select('value')
      .eq('key', 'bank_details')
      .maybeSingle();

    const v = (data?.value || {}) as Record<string, string>;
    const details: PublicBankDetails = {
      accountHolder: v.account_holder || '',
      bankName: v.bank_name || '',
      swift: v.swift || '',
      ibanRon: (v.iban || '').replace(/\s+/g, ''),
      ibanEur: (v.iban_eur || '').replace(/\s+/g, ''),
    };

    // Fără IBAN configurat nu avem ce afișa — clientul primește o eroare clară
    // în loc de un cont inventat (până în 2026-08-18 componenta avea un IBAN
    // hardcodat, fals, „RO49 BTRL 0000 1234 5678 9012").
    if (!details.ibanRon && !details.ibanEur) {
      return NextResponse.json(
        { success: false, error: 'Datele bancare nu sunt configurate' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: details });
  } catch (error) {
    console.error('[bank-details] error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
