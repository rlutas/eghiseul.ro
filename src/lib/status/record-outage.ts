/**
 * Records provider-portal downtime windows into `platform_outages`.
 *
 * The ONRC / ANCPI workers probe their portal on every poll tick and report the
 * result to /api/{onrc,ancpi}/pending (?portal=up|down|maintenance). We persist
 * only state TRANSITIONS: a `down`/`maintenance` report with no open window opens
 * one; an `up` report closes the open window. While a portal stays down we just
 * bump `last_checked_at` so the window's freshness is visible.
 *
 * Best-effort: any failure is logged and swallowed — never break the worker poll.
 *
 * NB (see .claude/rules/database.md): mutations use ONLY .eq/.is filters (never
 * `.or()`), and the partial unique index `one_open_per_provider` guarantees a
 * single open window per provider even if a transition is ever missed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any;

export type PortalStatus = 'up' | 'down' | 'maintenance';
export type Provider = 'onrc' | 'ancpi';

const PROVIDERS: readonly Provider[] = ['onrc', 'ancpi'];
const STATUSES: readonly PortalStatus[] = ['up', 'down', 'maintenance'];

/** Parse a raw `?portal=` query value; returns null if absent/invalid. */
export function parsePortalStatus(raw: string | null): PortalStatus | null {
  return raw && (STATUSES as readonly string[]).includes(raw) ? (raw as PortalStatus) : null;
}

export function isProvider(value: string): value is Provider {
  return (PROVIDERS as readonly string[]).includes(value);
}

export async function recordPortalStatus(
  supabase: SupabaseLike,
  provider: Provider,
  status: PortalStatus
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const { data: open } = await supabase
      .from('platform_outages')
      .select('id, cause')
      .eq('provider', provider)
      .is('ended_at', null)
      .maybeSingle();

    if (status === 'up') {
      if (open) {
        await supabase
          .from('platform_outages')
          .update({ ended_at: now, last_checked_at: now })
          .eq('id', open.id)
          .is('ended_at', null);
      }
      return;
    }

    // Portal is down — distinguish a planned maintenance window from a plain
    // unreachable/erroring portal.
    const cause = status === 'maintenance' ? 'maintenance' : 'unreachable';
    if (open) {
      const patch: Record<string, string> = { last_checked_at: now };
      if (open.cause !== cause) patch.cause = cause; // e.g. unreachable -> maintenance
      await supabase.from('platform_outages').update(patch).eq('id', open.id).is('ended_at', null);
    } else {
      await supabase
        .from('platform_outages')
        .insert({ provider, cause, started_at: now, last_checked_at: now });
    }
  } catch (err) {
    console.error(`[platform_outages] failed to record ${provider}=${status}:`, err);
  }
}
