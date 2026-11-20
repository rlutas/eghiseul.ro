import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';

/**
 * Typed signature for services where the client does not draw one.
 *
 * Services without a signature step (extras CF, identificare imobil,
 * certificat constatator…) conclude the contract by ticking the terms box.
 * The contract's client cell used to show only the bare name in bold, which a
 * client read as "someone signed for me" (E-261109-754AK, 20.11.2026).
 *
 * We now render the name in a handwriting font with a caption that says what
 * it is: an electronic acceptance, with the date and the IP we recorded. The
 * image goes through the same SIG_CLIENT marker as a drawn signature, so it
 * survives the DOCX→PDF conversion without depending on installed fonts.
 *
 * Only call this when `signature_metadata.consent.terms_accepted === true`:
 * the caption states that the client accepted, so it must not be printed on
 * an order where that was not recorded (see `resolveClientSignature`).
 */

// Same 20:7 ratio as TYPED_SIGNATURE_SIZE (signature-inserter.ts).
const WIDTH = 640;
const HEIGHT = 224;


let fontCache: { script: Buffer; caption: Buffer } | null = null;

function loadFonts() {
  if (!fontCache) {
    const base = join(process.cwd(), 'src', 'templates');
    fontCache = {
      script: readFileSync(join(base, 'fonts', 'Allura-Regular.ttf')),
      caption: readFileSync(join(base, 'cazier-fiscal', 'LiberationSans-Regular.ttf')),
    };
  }
  return fontCache;
}

/** "09.11.2026, 12:50" in Bucharest time; empty when the date is unusable. */
export function formatSignedAt(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Caption lines printed under the typed name. Exported for tests. */
export function typedSignatureCaption(signedAt?: string | null, ip?: string | null): string[] {
  const when = formatSignedAt(signedAt);
  const cleanIp = ip && ip !== 'N/A' && ip !== 'unknown' ? ip : '';
  const second = [when, cleanIp ? `IP ${cleanIp}` : ''].filter(Boolean).join(' · ');
  return ['Semnat electronic prin acceptare online', ...(second ? [second] : [])];
}

/**
 * Render the typed signature as a transparent PNG, base64 without prefix.
 */
export async function renderTypedSignaturePng(input: {
  name: string;
  signedAt?: string | null;
  ip?: string | null;
}): Promise<string> {
  const { script, caption } = loadFonts();
  const name = input.name.trim().replace(/\s+/g, ' ');
  // Long names (two surnames, three given names) shrink instead of clipping.
  // Allura averages ~0.42 em per character; fit the line into the image.
  const nameSize = Math.max(28, Math.min(72, Math.floor((WIDTH - 30) / (0.42 * Math.max(name.length, 1)))));
  const lines = typedSignatureCaption(input.signedAt, input.ip);

  const response = new ImageResponse(
    (
      <div
        style={{
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1f2a44',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Signature',
            fontSize: `${nameSize}px`,
            lineHeight: 1.15,
            paddingBottom: '6px',
            borderBottom: '2px solid #9aa3b2',
            maxWidth: `${WIDTH - 20}px`,
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              display: 'flex',
              fontFamily: 'Caption',
              fontSize: '22px',
              color: '#4b5563',
              marginTop: '6px',
            }}
          >
            {line}
          </div>
        ))}
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Signature', data: script, style: 'normal', weight: 400 },
        { name: 'Caption', data: caption, style: 'normal', weight: 400 },
      ],
    }
  );

  const buf = Buffer.from(await response.arrayBuffer());
  return buf.toString('base64');
}

/**
 * The client signature to embed in generated documents:
 *   1. the drawn signature, when the order has one;
 *   2. otherwise the typed signature, but ONLY when the order recorded that
 *      the client accepted the terms (`terms_accepted === true`);
 *   3. otherwise nothing — the cell keeps just the name, as before.
 */
export async function resolveClientSignature(input: {
  drawnBase64?: string;
  clientName: string;
  signatureMetadata?: {
    signed_at?: string;
    ip_address?: string;
    consent?: { terms_accepted?: boolean };
  } | null;
}): Promise<{ base64: string; typed: boolean } | undefined> {
  if (input.drawnBase64) return { base64: input.drawnBase64, typed: false };
  const meta = input.signatureMetadata;
  if (meta?.consent?.terms_accepted !== true) return undefined;
  if (!input.clientName.trim()) return undefined;
  try {
    const base64 = await renderTypedSignaturePng({
      name: input.clientName,
      signedAt: meta.signed_at,
      ip: meta.ip_address,
    });
    return { base64, typed: true };
  } catch (e) {
    console.error('Typed signature render failed:', e);
    return undefined;
  }
}
