import { describe, it, expect } from 'vitest';
import {
  classifyTouch,
  classifyAttribution,
  referrerHost,
  isIgnoredReferrer,
} from '@/lib/analytics/attribution-channel';

const at = '2026-10-06T10:00:00Z';

describe('referrerHost', () => {
  it('handles urls, android apps and junk', () => {
    expect(referrerHost('https://www.google.com/')).toBe('google.com');
    expect(referrerHost('android-app://com.google.android.googlequicksearchbox/')).toBe('com.google.android.googlequicksearchbox');
    expect(referrerHost('android-app://com.google.android.gm')).toBe('com.google.android.gm');
    expect(referrerHost('')).toBeNull();
    expect(referrerHost(undefined)).toBeNull();
  });
});

describe('classifyTouch', () => {
  const ref = (referrer: string) => classifyTouch({ referrer });

  it('paid platforms by click id', () => {
    expect(classifyTouch({ click_platform: 'google', click_id: 'x' })).toEqual({ channel: 'google_ads', source: 'google' });
    expect(classifyTouch({ click_platform: 'microsoft', click_id: 'x' })).toEqual({ channel: 'microsoft_ads', source: 'bing' });
    expect(classifyTouch({ oppref: 'abc' })).toEqual({ channel: 'chatgpt_ads', source: 'chatgpt' });
  });

  it('fbclid alone is social, with paid medium it is Meta Ads', () => {
    expect(classifyTouch({ click_platform: 'meta' })).toEqual({ channel: 'social', source: 'facebook' });
    expect(classifyTouch({ click_platform: 'meta', utm_source: 'facebook', utm_medium: 'paid_social' })).toEqual({ channel: 'meta_ads', source: 'facebook' });
  });

  it('paid UTM without click id', () => {
    expect(classifyTouch({ utm_source: 'google', utm_medium: 'cpc' })?.channel).toBe('google_ads');
    expect(classifyTouch({ utm_source: 'bing', utm_medium: 'cpc' })?.channel).toBe('microsoft_ads');
    expect(classifyTouch({ utm_source: 'chatgpt', utm_medium: 'cpc' })?.channel).toBe('chatgpt_ads');
  });

  it('our email UTMs win over the Gmail referrer', () => {
    expect(classifyTouch({ utm_source: 'email', utm_medium: 'lifecycle', utm_campaign: 'expiry', referrer: 'android-app://com.google.android.gm' }))
      .toEqual({ channel: 'email', source: 'expiry' });
    expect(classifyTouch({ utm_medium: 'warmup' })?.channel).toBe('email');
    expect(ref('android-app://com.google.android.gm')).toEqual({ channel: 'email', source: 'gmail' });
  });

  it('organic search engines', () => {
    expect(ref('https://www.google.com/')).toEqual({ channel: 'organic_search', source: 'google' });
    expect(ref('https://www.google.ro/')).toEqual({ channel: 'organic_search', source: 'google' });
    expect(ref('android-app://com.google.android.googlequicksearchbox/')).toEqual({ channel: 'organic_search', source: 'google' });
    expect(ref('https://www.bing.com/')).toEqual({ channel: 'organic_search', source: 'bing' });
    expect(ref('https://duckduckgo.com/')?.source).toBe('duckduckgo');
    expect(ref('https://uk.search.yahoo.com/')?.source).toBe('yahoo');
    expect(ref('https://search.brave.com/')?.source).toBe('brave');
  });

  it('AI assistants by referrer and by their own utm_source', () => {
    expect(ref('https://chatgpt.com/')).toEqual({ channel: 'ai_assistant', source: 'chatgpt' });
    expect(ref('https://www.perplexity.ai/')?.source).toBe('perplexity');
    expect(ref('https://copilot.microsoft.com/')?.source).toBe('copilot');
    expect(ref('https://gemini.google.com/')).toEqual({ channel: 'ai_assistant', source: 'gemini' });
    expect(ref('https://claude.ai/')?.source).toBe('claude');
    expect(classifyTouch({ utm_source: 'chatgpt.com' })).toEqual({ channel: 'ai_assistant', source: 'chatgpt' });
    expect(classifyTouch({ utm_source: 'perplexity' })).toEqual({ channel: 'ai_assistant', source: 'perplexity' });
  });

  it('social', () => {
    expect(ref('https://m.facebook.com/')).toEqual({ channel: 'social', source: 'facebook' });
    expect(ref('https://l.facebook.com/')?.source).toBe('facebook');
    expect(ref('https://lm.facebook.com/')?.source).toBe('facebook');
    expect(ref('https://t.co/abc')?.source).toBe('x');
    expect(ref('https://www.tiktok.com/')?.source).toBe('tiktok');
    expect(ref('https://www.linkedin.com/')?.source).toBe('linkedin');
    expect(ref('https://web.whatsapp.com/')?.source).toBe('whatsapp');
    expect(classifyTouch({ utm_source: 'fb' })).toEqual({ channel: 'social', source: 'facebook' });
  });

  it('own network and other referrals', () => {
    expect(ref('https://eghiseul.ro/blog/')).toEqual({ channel: 'network', source: 'eghiseul' });
    expect(ref('https://www.avocat-tarta.ro/')).toEqual({ channel: 'network', source: 'avocat-tarta' });
    expect(ref('https://m.ziare.com/x')).toEqual({ channel: 'referral', source: 'm.ziare.com' });
  });

  it('payment returns are not a source', () => {
    expect(ref('https://checkout.stripe.com/c/pay/x')).toBeNull();
    expect(isIgnoredReferrer('https://checkout.stripe.com/')).toBe(true);
    expect(isIgnoredReferrer('https://www.google.com/')).toBe(false);
  });

  it('nothing = null', () => {
    expect(classifyTouch({})).toBeNull();
    expect(classifyTouch(null)).toBeNull();
  });
});

describe('classifyAttribution', () => {
  it('last touch with a source wins', () => {
    expect(classifyAttribution({ first: { referrer: 'https://www.bing.com/' }, last: { click_platform: 'google' } }).channel).toBe('google_ads');
  });
  it('falls back to first when last is direct', () => {
    expect(classifyAttribution({ first: { referrer: 'https://www.google.com/' }, last: {} })).toEqual({ channel: 'organic_search', source: 'google' });
  });
  it('direct when nothing is known', () => {
    expect(classifyAttribution(null)).toEqual({ channel: 'direct', source: 'direct' });
    expect(classifyAttribution({ first: { }, last: { } })).toEqual({ channel: 'direct', source: 'direct' });
  });
  void at;
});

describe('youtube utm', () => {
  it('classifies our YouTube video links as social', () => {
    expect(classifyTouch({ utm_source: 'youtube', utm_medium: 'video' } as never)).toEqual({ channel: 'social', source: 'youtube' });
  });
});
