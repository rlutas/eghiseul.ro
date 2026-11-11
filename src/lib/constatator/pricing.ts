/**
 * Prices for certificat-constatator-express.ro, read from the SAME
 * `certificat-constatator` service row eghiseul uses: the document types and
 * their VAT-inclusive prices live in `verification_config.constatator
 * .documentTypes` (migration 054). One price list for both sites.
 */
import { createPublicClient } from '@/lib/supabase/public';

export interface ConstatatorPrices {
  firma: number;
  pf: number;
  istoric: number;
}

/** DB values on 11.11.2026, so a DB hiccup never renders "0 lei". */
const FALLBACK: ConstatatorPrices = { firma: 89, pf: 89, istoric: 487 };

export async function getConstatatorPrices(): Promise<ConstatatorPrices> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from('services')
      .select('base_price, verification_config')
      .eq('slug', 'certificat-constatator')
      .eq('is_active', true)
      .single();
    if (!data) return FALLBACK;
    const types = ((data.verification_config as { constatator?: { documentTypes?: Array<{ value: string; price: number }> } } | null)
      ?.constatator?.documentTypes ?? []);
    const price = (v: string, fb: number) => Number(types.find((t) => t.value === v)?.price) || fb;
    const base = Number(data.base_price) || FALLBACK.firma;
    return { firma: price('firma', base), pf: price('pf', base), istoric: price('istoric', FALLBACK.istoric) };
  } catch {
    return FALLBACK;
  }
}
