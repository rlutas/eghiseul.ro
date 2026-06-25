import { createPublicClient } from '@/lib/supabase/public';

export interface SwitcherService {
  slug: string;
  name: string;
}

/**
 * Active services in the `imobiliare` category (topograph/ANCPI/OCPI), ordered
 * for display. Used by the ServiceSwitcher dropdown so a customer can jump
 * between cadastral documents without leaving the flow (cfunciara-style).
 */
export async function getImobiliareServices(): Promise<SwitcherService[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('services')
    .select('slug, name, display_order')
    .eq('category', 'imobiliare')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return ((data as { slug: string; name: string }[] | null) || []).map((s) => ({
    slug: s.slug,
    name: s.name,
  }));
}
