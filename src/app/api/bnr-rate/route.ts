import { NextResponse } from 'next/server';

export const revalidate = 3600; // curs BNR se schimbă o dată/zi

/**
 * Cursul BNR EUR→RON pentru toggle-ul €/Lei din calculatoare.
 * Sursă: feed-ul oficial bnr.ro/nbrfxrates.xml. Cache 1h, fallback la o
 * valoare rezonabilă dacă feed-ul e indisponibil.
 */
export async function GET() {
  const FALLBACK = 5.07;
  try {
    const res = await fetch('https://www.bnr.ro/nbrfxrates.xml', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`bnr ${res.status}`);
    const xml = await res.text();
    const rate = xml.match(/<Rate currency="EUR">([\d.]+)<\/Rate>/);
    const date = xml.match(/<Cube date="([\d-]+)">/);
    const eur = rate ? parseFloat(rate[1]) : FALLBACK;
    return NextResponse.json({ eur, date: date?.[1] ?? null });
  } catch {
    return NextResponse.json({ eur: FALLBACK, date: null });
  }
}
