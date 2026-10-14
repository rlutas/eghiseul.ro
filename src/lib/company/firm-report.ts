import 'server-only';

/**
 * Free company check ("Verifică firma după CUI") from two public ANAF sources:
 *   - PlatitorTvaRest v9: identity, registration state, VAT, VAT on receipt,
 *     split VAT, inactive register, RO e-Factura register, addresses;
 *   - bilant: balance-sheet indicators per year (turnover, profit/loss,
 *     average employees), matched by label because indicator codes differ by
 *     company type and year.
 * Owners, administrators and share capital are NOT in these sources — they
 * are in the ONRC certificat constatator, which is what the tool points to.
 */

const TVA_URL = 'https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva';
const BILANT_URL = 'https://webservicesp.anaf.ro/bilant';

export interface FirmFinancialYear {
  year: number;
  turnover: number | null;
  netProfit: number | null;
  netLoss: number | null;
  employees: number | null;
}

export interface FirmReport {
  cui: string;
  name: string;
  regCom: string;
  registeredOn: string | null;
  legalForm: string;
  caen: string;
  caenLabel: string | null;
  address: string;
  county: string;
  registrationState: string;
  inactive: boolean;
  inactiveSince: string | null;
  deregisteredOn: string | null;
  vatPayer: boolean;
  vatSince: string | null;
  vatOnReceipt: boolean;
  splitVat: boolean;
  eFactura: boolean;
  taxOffice: string;
  financials: FirmFinancialYear[];
  checkedAt: string;
}

type AnafTvaFound = {
  date_generale?: Record<string, unknown>;
  inregistrare_scop_Tva?: { scpTVA?: boolean; perioade_TVA?: Array<{ data_inceput_ScpTVA?: string; data_sfarsit_ScpTVA?: string }> };
  inregistrare_RTVAI?: { statusTvaIncasare?: boolean };
  stare_inactiv?: { statusInactivi?: boolean; dataInactivare?: string; dataRadiere?: string };
  inregistrare_SplitTVA?: { statusSplitTVA?: boolean };
  adresa_sediu_social?: { sdenumire_Judet?: string };
};

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v));

function pickIndicator(items: Array<{ val_den_indicator?: string; val_indicator?: number }>, re: RegExp): number | null {
  const hit = items.find((i) => re.test((i.val_den_indicator ?? '').trim()));
  return hit && typeof hit.val_indicator === 'number' ? hit.val_indicator : null;
}

async function fetchBilant(cui: string, year: number): Promise<(FirmFinancialYear & { caenLabel: string | null }) | null> {
  try {
    const res = await fetch(`${BILANT_URL}?an=${year}&cui=${cui}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { i?: Array<{ val_den_indicator?: string; val_indicator?: number }>; den_caen?: string };
    const items = data.i ?? [];
    if (items.length === 0) return null;
    return {
      year,
      turnover: pickIndicator(items, /^cifra de afaceri/i),
      netProfit: pickIndicator(items, /^profit net/i),
      netLoss: pickIndicator(items, /^pierdere net/i),
      employees: pickIndicator(items, /salariati/i),
      caenLabel: data.den_caen?.trim() || null,
    };
  } catch {
    return null;
  }
}

export async function fetchFirmReport(cui: string): Promise<FirmReport | null> {
  const today = new Date().toISOString().slice(0, 10);
  const res = await fetch(TVA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ cui: Number(cui), data: today }]),
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`ANAF TVA ${res.status}`);
  const json = (await res.json()) as { found?: AnafTvaFound[] };
  const f = json.found?.[0];
  if (!f?.date_generale) return null;

  const g = f.date_generale;
  // Balance sheets for year-1 are filed by the end of May; try the two most recent years.
  const y = new Date().getFullYear();
  const years = await Promise.all([fetchBilant(cui, y - 1), fetchBilant(cui, y - 2)]);
  const fin = years.filter((x): x is NonNullable<typeof x> => x !== null);

  const periods = f.inregistrare_scop_Tva?.perioade_TVA ?? [];
  const openPeriod = periods.find((p) => !str(p.data_sfarsit_ScpTVA));

  return {
    cui,
    name: str(g.denumire),
    regCom: str(g.nrRegCom),
    registeredOn: str(g.data_inregistrare) || null,
    legalForm: str(g.forma_juridica) || str(g.forma_organizare),
    caen: str(g.cod_CAEN),
    caenLabel: fin[0]?.caenLabel ?? null,
    address: str(g.adresa),
    county: str(f.adresa_sediu_social?.sdenumire_Judet),
    registrationState: str(g.stare_inregistrare),
    inactive: f.stare_inactiv?.statusInactivi === true,
    inactiveSince: str(f.stare_inactiv?.dataInactivare) || null,
    deregisteredOn: str(f.stare_inactiv?.dataRadiere) || null,
    vatPayer: f.inregistrare_scop_Tva?.scpTVA === true,
    vatSince: openPeriod ? str(openPeriod.data_inceput_ScpTVA) || null : null,
    vatOnReceipt: f.inregistrare_RTVAI?.statusTvaIncasare === true,
    splitVat: f.inregistrare_SplitTVA?.statusSplitTVA === true,
    eFactura: g.statusRO_e_Factura === true,
    taxOffice: str(g.organFiscalCompetent),
    financials: fin.map((f) => ({ year: f.year, turnover: f.turnover, netProfit: f.netProfit, netLoss: f.netLoss, employees: f.employees })),
    checkedAt: today,
  };
}
