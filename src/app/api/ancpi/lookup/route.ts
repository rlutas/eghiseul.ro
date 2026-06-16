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

  // 2) Find the cadastral parcel at the geocoded point. We use the layer-1
  //    SPATIAL QUERY (intersects) rather than `identify` — same data, but a more
  //    reliable first-hit code path. The ANCPI MapServer 502s intermittently, so
  //    we retry generously.
  const { x, y } = c.location;
  const geom = encodeURIComponent(JSON.stringify({ x, y, spatialReference: { wkid: 3844 } }));
  const qUrl =
    'https://geoportal.ancpi.ro/maps/rest/services/imobile/Imobile/MapServer/1/query' +
    `?geometry=${geom}&geometryType=esriGeometryPoint&inSR=3844&spatialRel=esriSpatialRelIntersects` +
    '&outFields=NATIONAL_CADASTRAL_REFERENCE,IMMOVABLE_ID,INSPIRE_ID&returnGeometry=false&f=json';
  const q = (await fetchJson(qUrl, 8)) as { features?: Array<{ attributes: Record<string, string | number> }> } | null;
  if (q === null) {
    return NextResponse.json({ success: true, data: { found: false, reason: 'ancpi_unavailable', geocoded: { address: c.address, score: c.score } } });
  }
  // NB: the geoportal's NATIONAL_CADASTRAL_REFERENCE is the CARTE FUNCIARĂ number
  // (confirmed against a real extract: ref 106395 = "Carte Funciară Nr. 106395"),
  // NOT the parcel's cadastral number. So we expose it as `cf`.
  const parcels = (q.features || [])
    .filter((f) => f.attributes?.NATIONAL_CADASTRAL_REFERENCE || f.attributes?.IMMOVABLE_ID)
    .map((f) => ({
      cf: f.attributes.NATIONAL_CADASTRAL_REFERENCE != null ? String(f.attributes.NATIONAL_CADASTRAL_REFERENCE) : null,
      immovableId: f.attributes.IMMOVABLE_ID != null ? String(f.attributes.IMMOVABLE_ID) : null,
      inspireId: f.attributes.INSPIRE_ID != null ? String(f.attributes.INSPIRE_ID) : null,
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
