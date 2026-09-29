/**
 * Constante pentru rapoartele din Ghid, fără importuri de server: le folosesc
 * și formularul din browser (`ghid-ask.tsx`) și rutele.
 */

/** Site-urile la care se poate referi un raport (aceeași echipă lucrează pe toate). */
export const REPORT_SITES = ['eghiseul', 'cazierjudiciaronline', 'ecazier', 'documentero'] as const;
export type ReportSite = (typeof REPORT_SITES)[number];
export const REPORT_SITE_LABEL: Record<ReportSite, string> = {
  eghiseul: 'eghiseul.ro',
  cazierjudiciaronline: 'cazierjudiciaronline.com',
  ecazier: 'ecazier.ro',
  documentero: 'documentero.ro',
};
export function isReportSite(v: unknown): v is ReportSite {
  return typeof v === 'string' && (REPORT_SITES as readonly string[]).includes(v);
}

/** Capturi de ecran atașate: S3, sub `knowledge-reports/<reporterId>/`. */
export const REPORT_SHOT_MAX = 5;
export const REPORT_SHOT_MAX_BYTES = 8 * 1024 * 1024;
export const REPORT_SHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export function reportShotPrefix(reporterId: string): string {
  return `knowledge-reports/${reporterId}/`;
}
export interface ReportAttachment {
  key: string;
  name: string;
  mimeType: string;
  size: number;
}
