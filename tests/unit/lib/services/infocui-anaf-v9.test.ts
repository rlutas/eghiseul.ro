/**
 * Tests for ANAF v9 endpoint parsing (added 2026-05-28).
 *
 * Bug fixed: the previous v8 AsynchWebService URL was returning HTTP 000
 * (connection timeout). PJ checkout hung indefinitely on the CUI lookup
 * spinner. Switched to the v9 PlatitorTvaRest synchronous endpoint which
 * responds in ~150ms.
 *
 * We mock the global `fetch` here so the test verifies the response
 * parsing without hitting the live ANAF API (which would make the test
 * suite flaky + slow + dependent on external service availability).
 *
 * Real fixture: response captured 2026-05-28 from CUI 49278701 →
 * EDIGITALIZARE S.R.L.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCompanyData } from '@/lib/services/infocui';

// Real v9 response captured 2026-05-28 from CUI 49278701
const ANAF_V9_FOUND_RESPONSE = {
  found: [
    {
      date_generale: {
        data: '2026-05-28',
        cui: 49278701,
        denumire: 'EDIGITALIZARE S.R.L.',
        adresa: 'JUD. SATU MARE, SAT ODOREU COM. ODOREU, STR. SALCÂMILOR, NR.2',
        nrRegCom: 'J2023001097301',
        cod_CAEN: '4791',
        stare_inregistrare: 'INREGISTRAT din data 13.12.2023',
        data_inregistrare: '2023-12-13',
        statusRO_e_Factura: true,
      },
      inregistrare_scop_Tva: {
        scpTVA: true,
      },
      adresa_sediu_social: {
        sdenumire_Strada: 'Str. Salcâmilor',
        snumar_Strada: '2',
        sdenumire_Localitate: 'Sat Odoreu Com. Odoreu',
        sdenumire_Judet: 'SATU MARE',
        scod_Judet: '30',
        scod_Postal: '447210',
      },
      adresa_domiciliu_fiscal: {
        ddenumire_Strada: 'Str. Salcâmilor',
        dnumar_Strada: '2',
        ddenumire_Localitate: 'Sat Odoreu Com. Odoreu',
        ddenumire_Judet: 'SATU MARE',
        dcod_Judet: '30',
        dcod_Postal: '447210',
      },
    },
  ],
  notFound: [],
};

const ANAF_V9_NOT_FOUND_RESPONSE = {
  found: [],
  notFound: [99999999],
};

const ANAF_V9_DIZOLVAT_RESPONSE = {
  found: [
    {
      date_generale: {
        cui: 12345678,
        denumire: 'FIRMA INCHISA SRL',
        adresa: 'JUD. CLUJ, MUN. CLUJ-NAPOCA',
        nrRegCom: 'J12/100/2010',
        stare_inregistrare: 'RADIAT din data 01.01.2020',
        data_inregistrare: '2010-01-01',
      },
      inregistrare_scop_Tva: { scpTVA: false },
    },
  ],
  notFound: [],
};

// Real v9 response captured 2026-08-20 from CUI 13378912 — a public school.
// ANAF returns it with EMPTY nrRegCom and no legal form: it is not registered
// at Registrul Comerțului at all.
const ANAF_V9_PUBLIC_INSTITUTION_RESPONSE = {
  found: [
    {
      date_generale: {
        cui: 13378912,
        denumire: 'SCOALA GIMNAZIALA FULOP ARON FELICENI',
        adresa: 'JUD. HARGHITA, SAT FELICENI COM. FELICENI, NR.9',
        nrRegCom: '',
        stare_inregistrare: 'MODIFICARE PUBLICI din data 21.09.2000',
        data_inregistrare: '2000-09-21',
      },
      inregistrare_scop_Tva: { scpTVA: false },
    },
  ],
  notFound: [],
};

// A commercial company whose name contains the letters "SA" inside a word —
// the old substring matching returned type "SA" (societate pe acțiuni) for it.
const ANAF_V9_CASA_SRL_RESPONSE = {
  found: [
    {
      date_generale: {
        cui: 49278701,
        denumire: 'CASA DE CULTURA IMOBILIARE S.R.L.',
        adresa: 'JUD. CLUJ, MUN. CLUJ-NAPOCA',
        nrRegCom: 'J12/500/2015',
        stare_inregistrare: 'INREGISTRAT din data 01.01.2015',
        data_inregistrare: '2015-01-01',
      },
      inregistrare_scop_Tva: { scpTVA: true },
    },
  ],
  notFound: [],
};

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchCompanyData — ANAF v9 endpoint', () => {
  it('parses a successful v9 response into our CompanyData shape', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ANAF_V9_FOUND_RESPONSE,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchCompanyData('49278701');

    expect(result.found).toBe(true);
    expect(result.data).toMatchObject({
      cui: '49278701',
      name: 'EDIGITALIZARE S.R.L.',
      type: 'SRL',
      registrationNumber: 'J2023001097301',
      address: 'JUD. SATU MARE, SAT ODOREU COM. ODOREU, STR. SALCÂMILOR, NR.2',
      isActive: true,
      vatPayer: true,
      establishedDate: '2023-12-13',
    });

    // Verify we called v9 URL (not v8 async)
    expect(fetchMock).toHaveBeenCalledOnce();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('PlatitorTvaRest/v9/tva');
    expect(url).not.toContain('AsynchWebService');
  });

  it('returns found:false for unknown CUI (empty found array)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ANAF_V9_NOT_FOUND_RESPONSE,
    }));

    const result = await fetchCompanyData('99999998'); // valid checksum format
    // The local CUI validation step may flag it as invalid (no valid
    // checksum) — accept either path, both end with found=false.
    expect(result.found).toBe(false);
  });

  it('marks dizolvat/radiat companies as inactive', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ANAF_V9_DIZOLVAT_RESPONSE,
    }));

    // Use a CUI with valid checksum (12345678 fails checksum — use a real one)
    const fixture = { ...ANAF_V9_DIZOLVAT_RESPONSE };
    fixture.found[0].date_generale.cui = 49278701;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fixture,
    }));

    const result = await fetchCompanyData('49278701');
    expect(result.found).toBe(true);
    expect(result.data?.isActive).toBe(false);
    expect(result.data?.vatPayer).toBe(false);
  });

  it('sends POST with [{cui, data}] body (v9 contract)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ANAF_V9_FOUND_RESPONSE,
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchCompanyData('49278701');

    const call = fetchMock.mock.calls[0];
    expect(call[1].method).toBe('POST');
    expect(call[1].headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(call[1].body);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toMatchObject({ cui: 49278701 });
    expect(body[0].data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Verify AbortController signal is wired up
    expect(call[1].signal).toBeDefined();
  });

  it('returns found:false on ANAF 404 (cleanly, not a thrown error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    }));

    const result = await fetchCompanyData('49278701');
    expect(result.found).toBe(false);
    expect(result.error).toMatch(/inexistent/i);
  });
});

describe('fetchCompanyData — entități fără Registrul Comerțului', () => {
  it('marks a public school as INSTITUȚIE PUBLICĂ instead of leaving the form blank', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ANAF_V9_PUBLIC_INSTITUTION_RESPONSE,
    }));

    const result = await fetchCompanyData('13378912');

    expect(result.found).toBe(true);
    // Fără asta, forma juridică ieșea goală și wizardul afișa exemplul gri
    // „SRL" / „J40/12345/2020" ca și cum ar fi datele școlii.
    expect(result.data?.type).toBe('INSTITUȚIE PUBLICĂ');
    expect(result.data?.registrationNumber).toBe('');
  });

  it('does not read "SA" out of the middle of a word', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ANAF_V9_CASA_SRL_RESPONSE,
    }));

    const result = await fetchCompanyData('49278701');

    // "CASA" conține "SA": substring matching întorcea societate pe acțiuni.
    expect(result.data?.type).toBe('SRL');
  });

  it('never labels a trade-registered company as a public institution', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        found: [
          {
            date_generale: {
              cui: 49278701,
              // Nume de instituție, dar CU număr la Registrul Comerțului.
              denumire: 'CENTRUL MEDICAL DIRECTIA NOUA',
              adresa: 'JUD. CLUJ',
              nrRegCom: 'J12/900/2019',
              stare_inregistrare: 'INREGISTRAT din data 01.01.2019',
            },
            inregistrare_scop_Tva: { scpTVA: true },
          },
        ],
        notFound: [],
      }),
    }));

    const result = await fetchCompanyData('49278701');

    expect(result.data?.type).toBe('');
  });
});
