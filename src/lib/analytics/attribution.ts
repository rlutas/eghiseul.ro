/**
 * Atribuire marketing — de unde a venit clientul.
 *
 * Capturăm la prima vizită și la fiecare vizită nouă din altă sursă, apoi
 * atașăm la comandă. Two-touch:
 *   - `first` — ce ne-a descoperit clientul (nu se suprascrie niciodată)
 *   - `last`  — ce a închis vânzarea (se actualizează la fiecare sursă nouă)
 *
 * Ambele contează: un articol poate aduce omul, iar pagina de serviciu îl
 * convertește peste trei zile. Un singur model de atribuire ar minți.
 *
 * Stocare în localStorage, nu cookie: nu se trimite la fiecare request (nu
 * umflă headerele) și e vizibil pentru utilizator. Nu conține date personale —
 * doar sursa traficului.
 *
 * GDPR: sunt date de atribuire proprie, fără profilare cross-site și fără terți.
 * Nu depinde de consimțământul pentru cookies de marketing (spre deosebire de
 * GA4), fiind strict necesar pentru a ști ce canal aduce comenzi.
 */

const STORAGE_KEY = 'eg_attribution';
/** O vizită din altă sursă după atâta timp = sesiune nouă → actualizăm `last`. */
const SESSION_GAP_MS = 30 * 60 * 1000;

export interface TouchPoint {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  /** Click ID-uri de platformă: Google (gclid/gbraid/wbraid), Meta (fbclid). */
  click_id?: string;
  click_platform?: string;
  referrer?: string;
  /** Pagina pe care a aterizat. */
  landing?: string;
  at: string;
}

export interface Attribution {
  first: TouchPoint;
  last: TouchPoint;
  /** Momentul ultimei actualizări — folosit ca să detectăm sesiune nouă. */
  updated: string;
}

const CLICK_IDS: Array<[string, string]> = [
  ['gclid', 'google'],
  ['gbraid', 'google'],
  ['wbraid', 'google'],
  ['fbclid', 'meta'],
  ['ttclid', 'tiktok'],
  ['msclkid', 'microsoft'],
];

function readCurrentTouch(): TouchPoint {
  const params = new URLSearchParams(window.location.search);
  const touch: TouchPoint = { at: new Date().toISOString() };

  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const) {
    const v = params.get(key);
    if (v) touch[key] = v.slice(0, 120);
  }

  for (const [param, platform] of CLICK_IDS) {
    const v = params.get(param);
    if (v) {
      touch.click_id = v.slice(0, 200);
      touch.click_platform = platform;
      break;
    }
  }

  // Referrer intern nu e o sursă nouă — ne interesează doar de unde a venit
  // în site, nu cum navighează prin el.
  const ref = document.referrer;
  if (ref && !ref.includes(window.location.host)) {
    touch.referrer = ref.slice(0, 300);
  }

  touch.landing = window.location.pathname.slice(0, 200);
  return touch;
}

/** True dacă touch-ul poartă o sursă reală (nu doar navigare directă). */
function hasSource(t: TouchPoint): boolean {
  return Boolean(t.utm_source || t.click_id || t.referrer);
}

function read(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    return parsed?.first && parsed?.last ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Se apelează o dată per încărcare de pagină. Idempotent și tăcut la erori —
 * atribuirea nu are voie să rupă navigarea.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    const current = readCurrentTouch();
    const stored = read();

    if (!stored) {
      const fresh: Attribution = {
        first: current,
        last: current,
        updated: current.at,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return;
    }

    // `last` se schimbă doar la o sursă nouă reală, sau după o pauză de
    // sesiune. Altfel, o navigare internă ar suprascrie sursa care a adus
    // clientul cu „direct".
    const gap = Date.now() - new Date(stored.updated).getTime();
    const isNewSession = gap > SESSION_GAP_MS;
    if (hasSource(current) || isNewSession) {
      stored.last = current;
    }
    stored.updated = current.at;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage indisponibil (mod privat, cote depășite) — mergem mai departe
  }
}

/** Payload-ul de atașat la crearea comenzii. `null` dacă nu avem nimic. */
export function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  return read();
}
