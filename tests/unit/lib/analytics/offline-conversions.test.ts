import { describe, expect, it } from 'vitest';
import {
  adClickOf,
  adsTagReportsSale,
  bucharestTime,
  buildGoogleOfflineCsv,
  googleOfflineRows,
} from '@/lib/analytics/offline-conversions';

const GCLID = 'Cj0KCQiA8OrXBhDEARIsAECtlx4fraOee3-7zWV1BZj53CJnO1cOTqZLf96';

describe('adClickOf', () => {
  it('reads the click from the first touch when a later touch replaced `last`', () => {
    const click = adClickOf({
      first: { click_id: GCLID, click_platform: 'google', click_param: 'gclid', at: '2026-11-16T10:26:42Z', landing: '/' },
      last: { at: '2026-11-16T12:35:25Z' },
    });
    expect(click).toMatchObject({ id: GCLID, param: 'gclid', platform: 'google' });
  });

  it('prefers the most recent paid click', () => {
    const newer = GCLID.replace('Cj0', 'EAI');
    const click = adClickOf({
      first: { click_id: GCLID, click_platform: 'google', click_param: 'gclid', at: '2026-11-10T10:00:00Z' },
      ad_click: { id: newer, platform: 'google', param: 'gclid', at: '2026-11-16T10:00:00Z' },
    });
    expect(click?.id).toBe(newer);
  });

  it('ignores social click ids, test ids and missing attribution', () => {
    expect(adClickOf({ first: { click_id: 'fb.1.123456789012345678901', click_platform: 'meta' } })).toBeNull();
    expect(adClickOf({ last: { click_id: 'TEST-claude-check2', click_platform: 'google', at: '2026-11-16T09:04:02Z' } })).toBeNull();
    expect(adClickOf(null)).toBeNull();
    expect(adClickOf({ first: { at: '2026-11-16T09:04:02Z' } })).toBeNull();
  });

  it('assumes gclid for touches saved before the parameter name was stored', () => {
    expect(adClickOf({ first: { click_id: GCLID, click_platform: 'google', at: '2026-11-01T10:00:00Z' } })?.param).toBe('gclid');
  });
});

describe('bucharestTime', () => {
  it('converts UTC to Romanian local time, winter and summer', () => {
    expect(bucharestTime('2026-11-16T09:15:07Z')).toBe('2026-11-16 11:15:07');
    expect(bucharestTime('2026-07-11T22:30:00Z')).toBe('2026-07-12 01:30:00');
  });
});

describe('googleOfflineRows + buildGoogleOfflineCsv', () => {
  const orders = [
    {
      orderNumber: 'E-261120-AAAAA',
      paidAt: '2026-11-20T08:00:00Z',
      totalRon: 89,
      attribution: { first: { click_id: GCLID, click_platform: 'google', click_param: 'gclid', at: '2026-11-20T07:50:00Z' } },
    },
    {
      orderNumber: 'E-261120-BBBBB',
      paidAt: '2026-11-20T09:00:00Z',
      totalRon: 89,
      attribution: {
        first: { click_id: `${GCLID}x`, click_platform: 'google', click_param: 'gclid', at: '2026-11-20T08:50:00Z' },
        ads_tag_sent_at: '2026-11-20T09:00:05Z',
      },
    },
    { orderNumber: 'E-261120-CCCCC', paidAt: '2026-11-20T10:00:00Z', totalRon: 89, attribution: { first: { at: '2026-11-20T09:50:00Z' } } },
    {
      orderNumber: 'E-261120-DDDDD',
      paidAt: '2026-11-20T11:00:00Z',
      totalRon: 198,
      attribution: { first: { click_id: GCLID.slice(0, 40), click_platform: 'google', click_param: 'gbraid', at: '2026-11-20T10:50:00Z' } },
    },
  ];

  it('keeps only orders with a Google click and flags the ones the tag already reported', () => {
    const rows = googleOfflineRows(orders);
    expect(rows.map((r) => r.orderNumber)).toEqual(['E-261120-AAAAA', 'E-261120-BBBBB', 'E-261120-DDDDD']);
    expect(rows.map((r) => r.tagAlreadySent)).toEqual([false, true, false]);
    expect(rows[0]).toMatchObject({ conversionTime: '2026-11-20 10:00:00', value: '89.00' });
  });

  it('writes the Google Ads upload file with gclid rows only', () => {
    const csv = buildGoogleOfflineCsv(googleOfflineRows(orders).filter((r) => !r.tagAlreadySent), 'Purchase offline');
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('Parameters:TimeZone=Europe/Bucharest');
    expect(lines[1]).toBe(
      'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency,Order ID,Ad User Data,Ad Personalization',
    );
    expect(lines).toHaveLength(3);
    expect(lines[2]).toBe(`${GCLID},Purchase offline,2026-11-20 10:00:00,89.00,RON,E-261120-AAAAA,Denied,Denied`);
  });

  it('states consent truthfully: Granted only when the buyer accepted marketing cookies', () => {
    const csv = buildGoogleOfflineCsv(googleOfflineRows(orders), 'Purchase offline');
    const byOrder = Object.fromEntries(csv.trim().split('\n').slice(2).map((l) => [l.split(',')[5], l.split(',').slice(6).join(',')]));
    expect(byOrder['E-261120-AAAAA']).toBe('Denied,Denied');
    expect(byOrder['E-261120-BBBBB']).toBe('Granted,Granted');
  });
});

describe('adsTagReportsSale', () => {
  it('is true only with marketing consent', () => {
    expect(adsTagReportsSale({ marketing: true })).toBe(true);
    expect(adsTagReportsSale({ marketing: false })).toBe(false); // refused, or analytics only
    expect(adsTagReportsSale(null)).toBe(false); // banner never answered
  });
});
