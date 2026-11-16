/**
 * Estimare pensie pentru limită de vârstă — Legea 360/2023.
 * Pensie = (puncte de contributivitate + puncte de stabilitate) × VPR.
 * O singură sursă pentru calculator și pentru tabelul din pagină.
 */

/** Valoarea punctului de referință în 2026 (înghețată, Legea 141/2025). */
export const VPR = 81;
/** Câștigul salarial mediu brut folosit de calculator pentru 2026 (lei). */
export const SAL_MEDIU = 9192;

/** Puncte de stabilitate: 0,50/an pentru anii 26–30, 0,75/an pentru 31–35, 1,00/an peste 35. */
export function puncteStabilitate(ani: number): number {
  return 0.5 * Math.min(Math.max(ani - 25, 0), 5) + 0.75 * Math.min(Math.max(ani - 30, 0), 5) + 1.0 * Math.max(ani - 35, 0);
}

export interface EstimarePensie {
  puncteContributivitate: number;
  puncteStabilitate: number;
  totalPuncte: number;
  /** Lei pe lună, nerotunjit. */
  pensie: number;
}

/** `raport` = salariul tău brut împărțit la câștigul salarial mediu brut (1 = la medie). */
export function estimeazaPensia(ani: number, raport: number): EstimarePensie {
  const puncteContributivitate = raport * ani;
  const stab = puncteStabilitate(ani);
  const totalPuncte = puncteContributivitate + stab;
  return { puncteContributivitate, puncteStabilitate: stab, totalPuncte, pensie: totalPuncte * VPR };
}
