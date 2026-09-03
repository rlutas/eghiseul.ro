'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CONSENT_OPEN_EVENT,
  deleteAnalyticsCookies,
  readConsent,
  writeConsent,
  type ConsentState,
} from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Google Ads: eticheta de conversie a contului 677-995-5005. Se încarcă DOAR
// cu consimțământ de marketing; conversia „Purchase" se declanșează din pagina
// de succes a comenzii. Lipsea complet după migrarea de pe WordPress — contul
// nu mai primea nicio conversie din iulie 2026.
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

// The success page already declares a narrower Window.gtag type — use a
// local view instead of a conflicting global declaration.
type GtagWindow = { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
const win = () => window as unknown as GtagWindow;

/** gtag stub + Consent Mode v2 defaults (denied) — set BEFORE gtag.js loads. */
function ensureGtagStub() {
  const w = win();
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

let gtagScriptLoaded = false;
/** Injectează gtag.js o singură dată, indiferent care etichetă îl cere prima. */
function loadGtagScript(firstId: string) {
  if (gtagScriptLoaded) return;
  gtagScriptLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${firstId}`;
  document.head.appendChild(s);
  win().gtag!('js', new Date());
}

let gaConfigured = false;
function loadGa() {
  if (!GA_ID || gaConfigured) return;
  gaConfigured = true;
  loadGtagScript(GA_ID);
  win().gtag!('config', GA_ID);
}

const OPENAI_PIXEL_ID = process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID;
type OaiqWindow = { oaiq?: ((...args: unknown[]) => void) & { q?: unknown[] } };

let openAiPixelLoaded = false;
/**
 * Pixelul OpenAI Ads (ChatGPT Ads) — marketing, ca eticheta Google Ads.
 * Snippet-ul oficial (developers.openai.com/ads/measurement-pixel): stub +
 * coadă, apoi SDK-ul async. Conversia `order_created` pleacă din pagina de
 * succes; serverul o trimite și prin Conversions API (dedup pe order_number).
 */
function loadOpenAiPixel() {
  if (!OPENAI_PIXEL_ID || openAiPixelLoaded) return;
  openAiPixelLoaded = true;
  const w = window as unknown as OaiqWindow;
  if (!w.oaiq) {
    const q = function oaiq(...args: unknown[]) {
      (q.q as unknown[]).push(args);
    } as OaiqWindow['oaiq'] & { q: unknown[] };
    q.q = [];
    w.oaiq = q;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js';
    document.head.appendChild(s);
  }
  w.oaiq!('init', { pixelId: OPENAI_PIXEL_ID });
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
type FbqWindow = {
  fbq?: ((...args: unknown[]) => void) & {
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[];
    loaded?: boolean;
    version?: string;
  };
  _fbq?: unknown;
};

let metaPixelLoaded = false;
/**
 * Meta Pixel (Facebook/Instagram Ads) — marketing, ca Google Ads și OpenAI.
 * Snippet-ul oficial (stub + coadă, apoi fbevents.js async). PageView aici;
 * InitiateCheckout la crearea draftului, Purchase pe pagina de succes; serverul
 * trimite Purchase și prin Conversions API (dedup pe order_number).
 */
function loadMetaPixel() {
  if (!META_PIXEL_ID || metaPixelLoaded) return;
  metaPixelLoaded = true;
  const w = window as unknown as FbqWindow;
  if (!w.fbq) {
    const n = function fbq(...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else (n.queue as unknown[]).push(args);
    } as NonNullable<FbqWindow['fbq']>;
    n.queue = [];
    n.loaded = true;
    n.version = '2.0';
    w.fbq = n;
    w._fbq = n;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
  }
  w.fbq!('init', META_PIXEL_ID);
  w.fbq!('track', 'PageView');
}

let adsConfigured = false;
function loadAds() {
  if (!ADS_ID || adsConfigured) return;
  adsConfigured = true;
  loadGtagScript(ADS_ID);
  win().gtag!('config', ADS_ID);
}

function applyConsent(state: ConsentState) {
  ensureGtagStub();
  win().gtag!('consent', 'update', {
    analytics_storage: state.analytics ? 'granted' : 'denied',
    ad_storage: state.marketing ? 'granted' : 'denied',
    ad_user_data: state.marketing ? 'granted' : 'denied',
    ad_personalization: state.marketing ? 'granted' : 'denied',
  });
  if (state.analytics) {
    loadGa();
  } else {
    deleteAnalyticsCookies();
  }
  // Eticheta Google Ads și pixelul OpenAI Ads țin de marketing, nu de analytics.
  if (state.marketing) {
    loadAds();
    loadOpenAiPixel();
    loadMetaPixel();
  }
}

/**
 * GDPR/ePrivacy cookie banner. Nothing non-essential loads before an explicit
 * choice: GA (gtag.js) is injected ONLY after analytics consent, with Google
 * Consent Mode v2 defaults denied as a second layer. The choice lives 6 months
 * in the `eg_cookie_consent` cookie; the footer "Setări cookie-uri" link
 * re-opens the banner via CONSENT_OPEN_EVENT.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    ensureGtagStub();
    const open = () => {
      const current = readConsent();
      if (current) {
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
        setCustomize(true);
      }
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);

    const existing = readConsent();
    let t: ReturnType<typeof setTimeout> | undefined;
    if (existing) {
      applyConsent(existing);
    } else {
      // Deferred so the effect doesn't set state synchronously (react-compiler rule).
      t = setTimeout(() => setVisible(true), 0);
    }
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener(CONSENT_OPEN_EVENT, open);
    };
  }, []);

  const decide = useCallback((a: boolean, m: boolean) => {
    applyConsent(writeConsent(a, m));
    setVisible(false);
    setCustomize(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Setări cookie-uri"
      className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_12px_40px_rgba(6,16,31,0.25)] sm:p-5">
        <p className="text-sm font-bold text-secondary-900">Cookie-uri pe eGhișeul.ro</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-600">
          Folosim cookie-uri strict necesare pentru funcționare (autentificare, plăți, preferința ta
          de aici) și, doar cu acordul tău, cookie-uri de analiză (Google Analytics) ca să înțelegem
          ce pagini ajută. Nu vindem date. Detalii:{' '}
          <Link href="/politica-cookies/" className="font-semibold text-primary-600 underline">
            Politica de cookie-uri
          </Link>
          . Îți poți schimba opțiunea oricând din „Setări cookie-uri” (footer).
        </p>

        {customize && (
          <div className="mt-3 space-y-2 rounded-xl bg-neutral-50 p-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-semibold text-secondary-900">Strict necesare</span>
                <span className="block text-xs text-neutral-500">Autentificare, plată, consimțământ — mereu active.</span>
              </span>
              <input type="checkbox" checked disabled className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-semibold text-secondary-900">Analiză (Google Analytics)</span>
                <span className="block text-xs text-neutral-500">Statistici anonime de utilizare.</span>
              </span>
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-semibold text-secondary-900">Marketing</span>
                <span className="block text-xs text-neutral-500">Măsurare campanii (Google Ads). Fără cookie-uri de retargetare proprii.</span>
              </span>
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="h-4 w-4" />
            </label>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => decide(true, true)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Accept toate
          </button>
          <button
            type="button"
            onClick={() => decide(false, false)}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-secondary-900 hover:bg-neutral-50"
          >
            Doar necesare
          </button>
          {customize ? (
            <button
              type="button"
              onClick={() => decide(analytics, marketing)}
              className="rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
            >
              Salvează alegerea
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCustomize(true)}
              className="px-2 py-2 text-sm font-semibold text-neutral-500 underline hover:text-secondary-900"
            >
              Personalizează
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
