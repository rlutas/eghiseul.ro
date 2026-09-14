/**
 * „Dovadă verificată — pornește lucrul" (14.09.2026, E-260912-5SNRM).
 *
 * Clientul care plătește prin IBAN trimite ordinul de plată imediat, dar banii
 * ajung în cont a doua zi lucrătoare, uneori la două zile. Până acum comanda
 * stătea pe `awaiting_payment` și echipa nu putea face nimic: fluxul de
 * procesare pornește din `paid`, iar documentele Barou se generau doar după
 * plată. La un certificat de căsătorie de 1.248 lei, două zile pierdute.
 *
 * Operatorul verifică dovada (upload, email, WhatsApp — decizia e a lui, nu a
 * unui câmp din DB) și pornește lucrul:
 *   - status → `processing` (intră în fluxul normal de procesare);
 *   - numerele de Barou + contract asistență + împuterniciri se generează
 *     acum (în registrul central numerele se ELIBEREAZĂ dacă banii nu vin —
 *     vezi memoria registru-anulare-vs-eliberare);
 *   - `payment_status` RĂMÂNE `awaiting_verification`.
 *
 * NU face: factura Oblio, emailul de confirmare a plății, joburile ONRC/ANCPI
 * (acelea costă bani reali la instituție). Toate pleacă la „Confirmă plata",
 * prin `fulfilManuallyPaidOrder`, care păstrează statusul de lucru.
 *
 * Fișierul e PUR (fără Supabase) — îl importă și panoul din admin (client).
 * Acțiunea server-side e în `start-work-on-proof-run.ts`.
 */

export interface StartWorkCandidate {
  status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  proof_verified_at?: string | null;
  payment_proof_url?: string | null;
}

export type StartWorkAssessment = { ok: true } | { ok: false; error: string };

/** Gardă pură — folosită de rută (server) și de panoul din admin (ascunde butonul). */
export function assessStartWorkOnProof(order: StartWorkCandidate): StartWorkAssessment {
  if (order.payment_status === 'paid') {
    return { ok: false, error: 'Comanda e deja plătită — folosește fluxul normal de procesare.' };
  }
  if (order.proof_verified_at) {
    return { ok: false, error: 'Lucrul a pornit deja pe dovada de plată.' };
  }
  if (order.payment_method !== 'bank_transfer' || order.payment_status !== 'awaiting_verification') {
    return { ok: false, error: 'Doar comenzile cu transfer bancar în așteptarea încasării pot porni pe dovadă.' };
  }
  if (order.status !== 'awaiting_payment') {
    return { ok: false, error: `Comanda nu e pe „Așteptare plată" (status curent: ${order.status ?? 'necunoscut'}).` };
  }
  return { ok: true };
}
