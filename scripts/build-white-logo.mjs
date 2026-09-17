/**
 * Generate the dark-background variant of the wide logo.
 *
 *   node scripts/build-white-logo.mjs
 *
 * `public/images/brand/logo-wide.webp` is the brand lockup: the gold shield
 * followed by the "eGHISEUL" wordmark in navy (11,22,43) on a transparent
 * background. On the navy auth screens the wordmark disappears, which is why
 * those pages used to show a gold square reading "eG" and later a hand-set HTML
 * wordmark — neither of which is the brand lockup (the real one is uppercase and
 * carries no diacritics).
 *
 * So: keep the shield exactly as drawn, repaint only the lettering white.
 * The wordmark is a single flat colour, so recolouring the RGB while keeping the
 * alpha channel preserves the antialiasing of every glyph edge.
 *
 * The split is measured, not guessed: scanning column occupancy shows gold
 * shield pixels up to x≈83, an empty gutter, and lettering from x≈95 on. 92 sits
 * in the gutter. Re-run this script if the source lockup is ever redrawn, and
 * re-check the gutter first.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../public/images/brand/logo-wide.webp');
const OUT = resolve(here, '../public/images/brand/logo-wide-white.webp');
// Email clients cannot be trusted with webp (Outlook in particular), and the
// auth mails put this lockup on a navy header band, so a PNG twin ships too.
const OUT_PNG = resolve(here, '../public/images/brand/logo-wide-white.png');

/** First column of the wordmark; everything left of it is the shield. */
const TEXT_STARTS_AT = 92;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

let repainted = 0;
for (let y = 0; y < height; y++) {
  for (let x = TEXT_STARTS_AT; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue; // fully transparent: leave alone
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    repainted++;
  }
}

const raw = { raw: { width, height, channels: 4 } };

await sharp(data, raw).webp({ quality: 95, alphaQuality: 100 }).toFile(OUT);
// 2x so it stays sharp on the retina screens most customers read mail on.
await sharp(data, raw).resize(width * 2, height * 2).png({ compressionLevel: 9 }).toFile(OUT_PNG);

console.log(`${width}x${height}, ${repainted} pixeli de text albiți`);
console.log(`scris: ${OUT}`);
console.log(`scris: ${OUT_PNG} (${width * 2}x${height * 2}, pentru email)`);
