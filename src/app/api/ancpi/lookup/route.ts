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
import proj4 from 'proj4';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // ANCPI is flaky → allow time for retries

// Romanian national projection (EPSG:3844, Stereo70) → WGS84, so we can hand the
// operator a Google Maps link to eyeball the exact building. Verified <1m vs Esri.
const STEREO70 =
  '+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass ' +
  '+towgs84=2.329,-147.042,-92.08,-0.309,0.325,0.497,5.69 +units=m +no_defs';
function toLatLon(x: number, y: number): { lat: number; lon: number } {
  const [lon, lat] = proj4(STEREO70, 'WGS84', [x, y]);
  return { lat, lon };
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

// Lowercase + strip Romanian diacritics so "Agăș" matches "Agas" etc.
function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks (ă â î ș ț → a a i s t)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Administrative noise words + pure numbers are dropped so we compare on the
// DISTINCTIVE part of a locality name. This keeps Bucharest sectors working
// ("Bucuresti Sectorul 6" -> just "bucuresti", which Esri returns) while still
// rejecting a same-street match in another town ("Agas" -> "agas").
const LOC_STOPWORDS = new Set([
  'sectorul', 'sector', 'municipiul', 'municipiu', 'orasul', 'oras',
  'comuna', 'com', 'satul', 'sat', 'judetul', 'judet', 'nr',
]);
function localityTokens(loc: string): string[] {
  return norm(loc)
    .split(' ')
    .filter((t) => t && !LOC_STOPWORDS.has(t) && !/^\d+$/.test(t));
}

async function fetchJson(url: string, tries = 1): Promise<unknown | null> {
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000); // bound each attempt
      const r = await fetch(url, {
        headers: { 'User-Agent': UA, Referer: 'https://geoportal.ancpi.ro/imobile_lookup.html', Accept: 'application/json' },
        cache: 'no-store',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const body = await r.text();
      if (r.ok && body.trim().startsWith('{')) return JSON.parse(body);
    } catch {
      /* retry */
    }
    if (i < tries - 1) await new Promise((s) => setTimeout(s, 700));
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

  // 1) Geocode (Esri World) → Stereo70 (EPSG:3844). Ask for several candidates +
  //    locality fields so we can REJECT a same-street-name match in the wrong town
  //    (e.g. "Strada Pârâului 100, Agăș" wrongly geocodes to Târgu Ocna). Without
  //    this guard ANCPI happily returns a real-but-wrong parcel → false positive.
  const singleLine = [address, localitate, judet, 'Romania'].filter(Boolean).join(', ');
  const geoUrl =
    'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates' +
    `?f=json&maxLocations=5&outFields=Match_addr,Addr_type,City,Subregion,Region&outSR=%7B%22wkid%22%3A3844%7D&SingleLine=${encodeURIComponent(singleLine)}`;
  type Candidate = {
    location: { x: number; y: number };
    score: number;
    address: string;
    attributes?: { Addr_type?: string; City?: string; Subregion?: string; Region?: string };
  };
  const geo = (await fetchJson(geoUrl, 2)) as { candidates?: Candidate[] } | null;
  const candidates = geo?.candidates ?? [];
  if (!candidates.length) {
    return NextResponse.json({ success: true, data: { found: false, reason: 'geocode_failed' } });
  }

  // Pick the best candidate whose locality matches the requested one. When a
  // `localitate` was given, a mismatch is a HARD reject — we'd rather return
  // nothing than a confident parcel in the wrong town.
  const wantToks = localityTokens(localitate);
  const inLocality = (cand: Candidate): boolean => {
    if (!wantToks.length) return true; // nothing distinctive to check → accept best match
    const hay = norm([cand.address, cand.attributes?.City, cand.attributes?.Subregion, cand.attributes?.Region].filter(Boolean).join(' '));
    return wantToks.every((t) => hay.includes(t));
  };
  const c = candidates.find(inLocality);
  if (!c) {
    // Esri found something, but not in the requested locality → wrong-town match.
    return NextResponse.json({
      success: true,
      data: {
        found: false,
        reason: 'locality_mismatch',
        requestedLocality: localitate || null,
        geocodedElsewhere: candidates.slice(0, 3).map((x) => ({ address: x.address, score: x.score })),
      },
    });
  }
  // Approximate matches (street-level, not an exact building point) are riskier —
  // flag so the operator double-checks before issuing the extras.
  const addrType = c.attributes?.Addr_type ?? null;
  const approximate = addrType != null && !['PointAddress', 'StreetAddress'].includes(addrType);

  // 2) Find the cadastral parcel at the geocoded point. We use the layer-1
  //    SPATIAL QUERY (intersects) rather than `identify` — same data, but a more
  //    reliable first-hit code path. The ANCPI MapServer 502s intermittently, so
  //    we retry generously.
  const { x, y } = c.location;
  const { lat, lon } = toLatLon(x, y); // WGS84 for the Google Maps verification link
  const geom = encodeURIComponent(JSON.stringify({ x, y, spatialReference: { wkid: 3844 } }));
  // `distance` buffers the point ~25m so a slightly-off geocode (common for
  // apartments/blocks) still catches the parcel.
  const qUrl =
    'https://geoportal.ancpi.ro/maps/rest/services/imobile/Imobile/MapServer/1/query' +
    `?geometry=${geom}&geometryType=esriGeometryPoint&inSR=3844&spatialRel=esriSpatialRelIntersects` +
    '&distance=25&units=esriSRUnit_Meter' +
    '&outFields=NATIONAL_CADASTRAL_REFERENCE,IMMOVABLE_ID,INSPIRE_ID&returnGeometry=false&f=json';
  const q = (await fetchJson(qUrl, 10)) as { features?: Array<{ attributes: Record<string, string | number> }> } | null;
  if (q === null) {
    return NextResponse.json({ success: true, data: { found: false, reason: 'ancpi_unavailable', geocoded: { address: c.address, score: c.score, lat, lon } } });
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
      geocoded: { address: c.address, score: c.score, type: addrType, approximate, x, y, lat, lon },
      parcels,
    },
  });
}
