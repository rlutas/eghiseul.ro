import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Predarea coletelor Sameday în easybox („primul kilometru OOH").
 *
 * Când e activată, AWB-urile Sameday se emit cu `oohFirstMile` = easybox-ul
 * ales aici: noi ducem plicul la locker, curierul nu mai vine să-l ridice de la
 * birou. NU are legătură cu ce alege clientul la livrare — el poate primi în
 * continuare acasă sau în easybox, cum a ales în comandă.
 *
 * Setarea stă în `admin_settings` sub cheia `sameday_dropoff`.
 */
export interface SamedayDropoffSetting {
  enabled: boolean;
  /** ID-ul easybox-ului (Sameday `oohId`). */
  oohId: string;
  /** Denumirea, doar pentru afișare/observații pe AWB. */
  name: string;
}

export const SAMEDAY_DROPOFF_KEY = 'sameday_dropoff';

/**
 * Citește setarea. Întoarce `null` dacă nu e configurată sau e dezactivată,
 * ca apelantul să emită AWB-ul normal (cu ridicare de la birou).
 */
export async function getSamedayDropoff(): Promise<SamedayDropoffSetting | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data } = await admin
      .from('admin_settings')
      .select('value')
      .eq('key', SAMEDAY_DROPOFF_KEY)
      .maybeSingle();

    const value = data?.value as Partial<SamedayDropoffSetting> | null;
    if (!value?.enabled || !value.oohId) return null;

    return {
      enabled: true,
      oohId: String(value.oohId),
      name: value.name || '',
    };
  } catch (error) {
    console.error('[sameday-dropoff] read setting failed:', error);
    return null;
  }
}
