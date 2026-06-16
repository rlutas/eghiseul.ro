/**
 * GET /api/ancpi/lookup?address=...&judet=...&localitate=...
 *
 * Identifies an immovable from a free-text address using public ANCPI/Esri
 * endpoints: Esri World geocoder (address → Stereo70 coords) → ANCPI geoportal
 * `identify` (coords → cadastral parcel). Returns the matched parcel's national
 * cadastral reference + immovable id + the geocoded address, so the client can
 * confirm and an operator can verify before issuing the extras.
 *
 * Both upstreams are public but FLAKY (the ANCPI MapServer 502s intermittently),
 * so identify is retried. Esri World geocoder is used anonymously (display use);
 * for heavy volume consider an API key or a self-hosted geocoder.
 *
 * NOTE: a point identifies the PARCEL/building, not a specific apartment — so for
 * blocks this finds the building; the unit still needs the CF/cadastral number.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

async function fetchJson(url: string, tries = 1): Promise<unknown | null> {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': UA, Referer: 'https://geoportal.ancpi.ro/imobile_lookup.html', Accept: 'application/json' },
        cache: 'no-store',
      });
      const t = await r.text();
      if (r.ok && t.trim().startsWith('{')) return JSON.parse(t);
    } catch {
      /* retry */
    }
    if (i < tries - 1) await new Promise((s) => setTimeout(s, 1200));
  }
  return null;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const address = (sp.get('address') || '').trim();
  const judet = (sp.get('judet') || '').trim();
  const localitate = (sp.get('localitate') || '').trim();
  if (!address && !localitate) {
    return NextResponse.json({ success: false, error: 'Adresă sau localitate necesară.' }, { status: 400 });
  }

  // 1) Geocode (Esri World) → Stereo70 (EPSG:3844).
  const singleLine = [address, localitate, judet, 'Romania'].filter(Boolean).join(', ');
  const geoUrl =
    'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates' +
    `?f=json&maxLocations=1&outFields=Match_addr,Addr_type&outSR=%7B%22wkid%22%3A3844%7D&SingleLine=${encodeURIComponent(singleLine)}`;
  const geo = (await fetchJson(geoUrl, 2)) as { candidates?: Array<{ location: { x: number; y: number }; score: number; address: string; attributes?: { Addr_type?: string } }> } | null;
  const c = geo?.candidates?.[0];
  if (!c) {
    return NextResponse.json({ success: true, data: { found: false, reason: 'geocode_failed' } });
  }

  // 2) Identify the parcel at the geocoded point (ANCPI geoportal, retried).
  const { x, y } = c.location;
  const d = 40;
  const idUrl =
    'https://geoportal.ancpi.ro/maps/rest/services/imobile/Imobile/MapServer/identify' +
    `?geometry=${x},${y}&geometryType=esriGeometryPoint&sr=3844&layers=all&tolerance=6` +
    `&mapExtent=${x - d},${y - d},${x + d},${y + d}&imageDisplay=400,400,96&returnGeometry=false&f=json`;
  const id = (await fetchJson(idUrl, 4)) as { results?: Array<{ attributes: Record<string, string> }> } | null;
  if (id === null) {
    return NextResponse.json({ success: true, data: { found: false, reason: 'ancpi_unavailable', geocoded: { address: c.address, score: c.score } } });
  }
  const parcels = (id.results || [])
    .filter((r) => r.attributes?.NATIONAL_CADASTRAL_REFERENCE || r.attributes?.IMMOVABLE_ID)
    .map((r) => ({
      cadastral: r.attributes.NATIONAL_CADASTRAL_REFERENCE || null,
      immovableId: r.attributes.IMMOVABLE_ID || null,
      inspireId: r.attributes.INSPIRE_ID || null,
    }));

  return NextResponse.json({
    success: true,
    data: {
      found: parcels.length > 0,
      geocoded: { address: c.address, score: c.score, type: c.attributes?.Addr_type ?? null, x, y },
      parcels,
    },
  });
}
