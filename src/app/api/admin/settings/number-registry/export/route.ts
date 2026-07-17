import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getRegistryClient } from '@/lib/registry/client';

// The registry lives in the CENTRAL Supabase project. Local adminClient is
// kept only for enriching eghiseul rows with document file names.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

// ──────────────────────────────────────────────────────────────
// GET /api/admin/settings/number-registry/export
// Export registry entries as CSV
// ──────────────────────────────────────────────────────────────

// Mapping helpers
const SOURCE_LABELS: Record<string, string> = {
  platform: 'Platforma',
  manual: 'Manual',
  reserved: 'Rezervat',
  voided: 'Anulat',
};

const TYPE_LABELS: Record<string, string> = {
  contract: 'Contract',
  delegation: 'Delegatie',
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
    const adminClient: AnyClient = createAdminClient();

    // Fetch ALL matching entries. Supabase taie la 1000 de rânduri per query —
    // exportul pentru control trebuie să fie COMPLET, deci paginăm în chunks.
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

      if (type && (type === 'contract' || type === 'delegation')) {
        query = query.eq('type', type);
      }
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

    // Enrich EGHISEUL rows with local document file names (order_document_ref
    // is a local order_documents.id stored as text).
    const docIds = (entries || [])
      .filter((e: AnyClient) => e.platform === 'eghiseul' && e.order_document_ref)
      .map((e: AnyClient) => e.order_document_ref);

    let docMap: Record<string, string> = {};
    if (docIds.length > 0) {
      const uniqueDocIds = [...new Set(docIds)];
      const { data: docs } = await adminClient
        .from('order_documents')
        .select('id, file_name')
        .in('id', uniqueDocIds);
      if (docs) {
        docMap = Object.fromEntries(
          docs.map((d: AnyClient) => [d.id, d.file_name])
        );
      }
    }

    // „Nr Contract" pe rândurile de DELEGAȚIE — la control se vede imediat de
    // ce contract ține fiecare împuternicire. Sursa: contractul din același
    // grup (order_ref, inclusiv SHEET-/MANUAL-), altfel trimiterea din
    // descriere („Pentru contract 005771").
    const contractByRef: Record<string, string> = {};
    for (const e of entries as AnyClient[]) {
      if (e.type === 'contract' && e.order_ref && !e.voided_at) {
        contractByRef[`${e.platform ?? ''}:${e.order_ref}`] = String(e.number).padStart(6, '0');
      }
    }
    // Filtrele (ex. „doar delegații", căutare) pot exclude contractele-frate
    // din setul exportat — le aducem separat ca să nu rămână coloana goală.
    const missingRefs = [
      ...new Set(
        (entries as AnyClient[])
          .filter((e) => e.type === 'delegation' && e.order_ref && !contractByRef[`${e.platform ?? ''}:${e.order_ref}`])
          .map((e) => e.order_ref as string)
      ),
    ];
    for (let i = 0; i < missingRefs.length; i += 200) {
      const { data: siblingContracts } = await registryClient
        .from('number_registry')
        .select('platform, order_ref, number, voided_at')
        .eq('year', year)
        .eq('type', 'contract')
        .in('order_ref', missingRefs.slice(i, i + 200));
      for (const c of (siblingContracts ?? []) as AnyClient[]) {
        if (!c.voided_at) {
          contractByRef[`${c.platform ?? ''}:${c.order_ref}`] = String(c.number).padStart(6, '0');
        }
      }
    }
    const linkedContract = (entry: AnyClient): string => {
      if (entry.type !== 'delegation') return '';
      if (entry.order_ref) {
        const fromGroup = contractByRef[`${entry.platform ?? ''}:${entry.order_ref}`];
        if (fromGroup) return fromGroup;
      }
      const m = (entry.description || '').match(/Pentru contract (\d+)/);
      return m ? m[1].padStart(6, '0') : '';
    };

    // Generate CSV
    const CSV_HEADERS = [
      'Nr',
      'Tip',
      'Serie',
      'Nr Contract',
      'Data',
      'Client',
      'Email',
      'CNP',
      'CUI',
      'Serviciu',
      'Descriere',
      'Suma',
      'Sursa',
      'Platforma',
      'Comanda',
      'Anulat',
      'Motiv Anulare',
      'Document',
      'Creat de',
    ];

    const rows = (entries || []).map((entry: AnyClient) => [
      // Padded ca pe documente (005771) — evidența pentru control identică cu actele.
      escapeCsvField(String(entry.number).padStart(6, '0')),
      escapeCsvField(TYPE_LABELS[entry.type] || entry.type),
      escapeCsvField(entry.series),
      escapeCsvField(linkedContract(entry)),
      escapeCsvField(formatDateRO(entry.date)),
      escapeCsvField(entry.client_name),
      escapeCsvField(entry.client_email),
      escapeCsvField(entry.client_cnp),
      escapeCsvField(entry.client_cui),
      escapeCsvField(entry.service_type),
      escapeCsvField(entry.description),
      escapeCsvField(entry.amount),
      escapeCsvField(SOURCE_LABELS[entry.source] || entry.source),
      escapeCsvField(entry.platform || ''),
      // SHEET-/MANUAL- sunt ref-uri sintetice de grupare, nu comenzi reale.
      escapeCsvField(/^(SHEET|MANUAL)-/.test(entry.order_ref || '') ? '' : (entry.order_ref || '')),
      escapeCsvField(entry.voided_at ? 'Da' : ''),
      escapeCsvField(entry.void_reason),
      escapeCsvField(
        entry.platform === 'eghiseul' && entry.order_document_ref
          ? (docMap[entry.order_document_ref] || '')
          : ''
      ),
      escapeCsvField(entry.created_by || ''),
    ]);

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
        'Content-Disposition': `attachment; filename="registru-${type === 'contract' ? 'contracte' : type === 'delegation' ? 'delegatii' : 'numere'}-${year}.csv"`,
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
