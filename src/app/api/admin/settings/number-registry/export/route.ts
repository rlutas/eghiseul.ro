import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { getRegistryClient } from '@/lib/registry/client';

// The registry lives in the CENTRAL Supabase project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// GET /api/admin/settings/number-registry/export
// Export CSV pentru control/Barou — GRUPAT pe client/comandă:
// un rând per delegație (client + dată + nr. contract repetate),
// cele mai recente primele.
// ──────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  platform: 'Platforma',
  manual: 'Manual',
  reserved: 'Rezervat',
  voided: 'Anulat',
};

function formatDateRO(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape fields containing commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// „Pentru ce" / „Serviciu" — aceleași etichete ca în jurnalul din admin.
function prettyService(s: string | null | undefined): string {
  if (!s) return '';
  if (s.startsWith('apostila-haga')) return 'Apostilă Haga';
  if (s.startsWith('bundled:')) return s.split(':').pop() || s;
  return s;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'registry.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    // Parse query params (same filters as list endpoint, minus pagination)
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!, 10)
      : new Date().getFullYear();
    const source = searchParams.get('source');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search');
    const orderRef = searchParams.get('order_ref');

    const registryClient: AnyClient = getRegistryClient();

    // Fetch ALL matching entries. Supabase taie la 1000 de rânduri per query —
    // exportul pentru control trebuie să fie COMPLET, deci paginăm în chunks.
    // Ambele TIPURI se aduc mereu: exportul e grupat pe client/comandă
    // (contract + delegațiile lui pe aceleași rânduri); filtrul `type` se
    // aplică la final, pe rândurile generate.
    const CHUNK = 1000;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: any[] = [];
    for (let offset = 0; ; offset += CHUNK) {
      let query = registryClient
        .from('number_registry')
        .select('*')
        .eq('year', year)
        .order('number', { ascending: true })
        .range(offset, offset + CHUNK - 1);

      if (source && ['platform', 'manual', 'reserved', 'voided'].includes(source)) {
        query = query.eq('source', source);
      }
      if (dateFrom) query = query.gte('date', dateFrom);
      if (dateTo) query = query.lte('date', dateTo);
      if (orderRef) query = query.eq('order_ref', orderRef);
      if (search) {
        const searchFilter = `client_name.ilike.%${search}%,client_email.ilike.%${search}%,client_cnp.ilike.%${search}%,client_cui.ilike.%${search}%`;
        query = query.or(searchFilter);
      }

      const { data: chunk, error } = await query;
      if (error) {
        console.error('Failed to fetch registry entries for export:', error);
        return NextResponse.json(
          { success: false, error: 'Eroare la exportul registrului de numere' },
          { status: 500 }
        );
      }
      entries.push(...(chunk ?? []));
      if (!chunk || chunk.length < CHUNK) break;
    }

    // ── Grupare pe client/comandă ─────────────────────────────
    // Un grup = contractul + delegațiile lui (aceeași cheie platform:order_ref,
    // inclusiv ref-urile sintetice SHEET-/MANUAL-). Intrările fără order_ref
    // rămân grupuri de un singur număr.
    interface ExportGroup {
      client: string;
      cnp: string;
      cui: string;
      email: string;
      date: string;
      contractNumber: string;
      contractVoided: boolean;
      contractVoidReason: string;
      delegations: { number: string; series: string; forWhat: string; voided: boolean; voidReason: string }[];
      serviceType: string;
      amount: number | null;
      source: string;
      avocatClient: boolean;
      platform: string;
      orderRef: string;
      createdBy: string;
      /** Cel mai mare număr din grup — tiebreaker la „recente primele". */
      maxNumber: number;
    }

    const groups = new Map<string, ExportGroup>();
    for (const e of entries as AnyClient[]) {
      const key = e.order_ref ? `${e.platform ?? ''}:${e.order_ref}` : `single:${e.id}`;
      if (!groups.has(key)) {
        groups.set(key, {
          client: e.client_name || '',
          cnp: e.client_cnp || '',
          cui: e.client_cui || '',
          email: e.client_email || '',
          date: e.date,
          contractNumber: '',
          contractVoided: false,
          contractVoidReason: '',
          delegations: [],
          serviceType: e.service_type || '',
          amount: e.amount ?? null,
          source: e.source,
          avocatClient: false,
          platform: e.platform || '',
          // SHEET-/MANUAL- sunt ref-uri sintetice de grupare, nu comenzi reale.
          orderRef: /^(SHEET|MANUAL)-/.test(e.order_ref || '') ? '' : (e.order_ref || ''),
          createdBy: e.created_by || '',
          maxNumber: 0,
        });
      }
      const g = groups.get(key)!;
      if ((e.description || '').startsWith('Client avocat')) g.avocatClient = true;
      if (!g.client && e.client_name) g.client = e.client_name;
      if (!g.cnp && e.client_cnp) g.cnp = e.client_cnp;
      if (!g.serviceType && e.service_type) g.serviceType = e.service_type;
      if (e.date > g.date) g.date = e.date;
      if (e.number > g.maxNumber) g.maxNumber = e.number;
      if (e.type === 'contract') {
        g.contractNumber = String(e.number).padStart(6, '0');
        g.contractVoided = !!e.voided_at;
        g.contractVoidReason = e.void_reason || '';
      } else {
        g.delegations.push({
          number: String(e.number).padStart(6, '0'),
          series: e.series || 'SM',
          forWhat: prettyService(e.service_type) || e.description || '',
          voided: !!e.voided_at,
          voidReason: e.void_reason || '',
        });
      }
    }

    // Delegații fără contract în grup (ex. „Doar Delegatie" legată prin
    // descriere „Pentru contract NNNNNN") — completează nr. contractului.
    const descContract = new Map<string, string>();
    for (const e of entries as AnyClient[]) {
      if (e.type !== 'delegation') continue;
      const m = (e.description || '').match(/Pentru contract (\d+)/);
      if (m) descContract.set(String(e.number).padStart(6, '0'), m[1].padStart(6, '0'));
    }
    for (const g of groups.values()) {
      if (!g.contractNumber && g.delegations.length > 0) {
        g.contractNumber = descContract.get(g.delegations[0].number) || '';
      }
    }

    // Recente primele: după dată desc, apoi după cel mai mare număr desc.
    const sortedGroups = [...groups.values()].sort(
      (a, b) => (a.date === b.date ? b.maxNumber - a.maxNumber : (a.date < b.date ? 1 : -1))
    );

    // CSV — coloanele în ordinea cerută pentru control:
    // client → dată → nr contract → serie → nr delegație → pentru ce.
    const CSV_HEADERS = [
      'Client',
      'CNP',
      'CUI',
      'Data',
      'Nr Contract Asistenta',
      'Serie',
      'Nr Delegatie',
      'Pentru ce',
      'Serviciu',
      'Suma',
      'Sursa',
      'Platforma',
      'Comanda',
      'Email',
      'Anulat',
      'Motiv Anulare',
      'Creat de',
    ];

    const rows: string[][] = [];
    for (const g of sortedGroups) {
      const sourceLabel = g.avocatClient ? 'Client avocat' : (SOURCE_LABELS[g.source] || g.source);
      const makeRow = (deleg: ExportGroup['delegations'][number] | null): string[] => {
        const voidedParts: string[] = [];
        if (g.contractVoided) voidedParts.push('contract');
        if (deleg?.voided) voidedParts.push('delegatie');
        return [
          escapeCsvField(g.client),
          escapeCsvField(g.cnp),
          escapeCsvField(g.cui),
          escapeCsvField(formatDateRO(g.date)),
          escapeCsvField(g.contractNumber),
          escapeCsvField(deleg?.series || 'SM'),
          escapeCsvField(deleg?.number || ''),
          escapeCsvField(deleg?.forWhat || ''),
          escapeCsvField(prettyService(g.serviceType)),
          escapeCsvField(g.amount),
          escapeCsvField(sourceLabel),
          escapeCsvField(g.platform),
          escapeCsvField(g.orderRef),
          escapeCsvField(g.email),
          escapeCsvField(voidedParts.length ? `Da (${voidedParts.join(' + ')})` : ''),
          escapeCsvField(deleg?.voidReason || g.contractVoidReason),
          escapeCsvField(g.createdBy),
        ];
      };
      if (g.delegations.length === 0) {
        // Grup doar cu contract — un rând, coloana de delegație goală.
        if (type !== 'delegation') rows.push(makeRow(null));
      } else {
        const sorted = [...g.delegations].sort((a, b) => a.number.localeCompare(b.number));
        for (const d of sorted) {
          if (type === 'contract' && !g.contractNumber) continue;
          rows.push(makeRow(d));
        }
      }
    }

    // UTF-8 BOM for Excel compatibility + header + data rows
    const csvContent =
      '\uFEFF' +
      CSV_HEADERS.join(',') +
      '\n' +
      rows.map((row: string[]) => row.join(',')).join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="registru-${year}.csv"`,
      },
    });
  } catch (error) {
    console.error('Number registry export error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
