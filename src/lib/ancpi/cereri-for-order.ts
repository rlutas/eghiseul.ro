/**
 * Maps a paid extras-CF order to the cereri the topograph has to file.
 *
 * ONE IMOBIL PER CERERE — the collaborator's rule. An order can carry several
 * properties (`additionalImobile` in the wizard), and each of them becomes its
 * own cerere with its own filename.
 *
 * Pure (no fs, no S3) so it can be unit-tested and reused by both the
 * single-order download and the bulk ZIP.
 */
import type { CerereExtrasCfData, CerereTemplate } from '@/lib/documents/cerere-extras-cf-pdf';
import { buildCerereFilename, normalizeCfForCerere } from '@/lib/ancpi/cerere-filename';
import { uatWithCounty } from '@/lib/ancpi/uat-label';
import { ocpiName, bcpiName } from '@/lib/ancpi/ocpi-header';
import { CERERE_SLUGS, IDENTIFICARE_SLUGS } from '@/lib/ancpi/cerere-scope';

interface AdditionalImobil {
  locality?: string | null;
  carteFunciara?: string | null;
  cadastral?: string | null;
  topografic?: string | null;
}

/** The slice of PropertyState (wizard) this needs. */
export interface PropertyLike {
  county?: string | null;
  locality?: string | null;
  carteFunciara?: string | null;
  cadastral?: string | null;
  topografic?: string | null;
  additionalImobile?: AdditionalImobil[] | null;
}

export interface OrderForCereri {
  friendly_order_id: string;
  customer_data?: {
    property?: PropertyLike | null;
    /**
     * On identificare services the client gives an address/owner, not a CF —
     * the collaborator reports what he identified here (POST …/identificare),
     * and the extras-CF cerere is generated from THIS, never from the client's
     * empty property fields.
     */
    identified_property?: PropertyLike | null;
  } | null;
}

export interface CerereForOrder {
  /** Position within the order — the `?imobil=` index of the download link. */
  index: number;
  /** Filename in the collaborator's convention, before collision handling. */
  name: string;
  orderRef: string;
  /** Which frozen base the PDF renders on (Anexa 6 vs plan cadastral). */
  template: CerereTemplate;
  data: CerereExtrasCfData;
}

export function cereriForOrder(
  order: OrderForCereri,
  date: string,
  opts?: {
    /** 'plan' renders + names the cerere as an ortofotoplan request. */
    template?: CerereTemplate;
    /** Read the collaborator-identified property instead of the client's. */
    source?: 'property' | 'identified_property';
  },
): CerereForOrder[] {
  const template = opts?.template ?? 'cf';
  const property = opts?.source === 'identified_property'
    ? order.customer_data?.identified_property
    : order.customer_data?.property;
  if (!property) return [];

  const county = (property.county ?? '').trim();
  const mainUat = (property.locality ?? '').trim();

  const imobile: AdditionalImobil[] = [
    {
      locality: mainUat,
      carteFunciara: property.carteFunciara,
      cadastral: property.cadastral,
      topografic: property.topografic,
    },
    ...(property.additionalImobile ?? []),
  ];

  return imobile
    .map((imobil, index): CerereForOrder | null => {
      // Normalized the same way for the filename AND the printed cerere —
      // the two must never say different numbers.
      const carteFunciara = normalizeCfForCerere(imobil.carteFunciara);
      const cadastral = normalizeCfForCerere(imobil.cadastral) || normalizeCfForCerere(imobil.topografic);
      // An empty extra row the client added and never filled in is not a job.
      if (!carteFunciara && !cadastral) return null;

      const uat = (imobil.locality ?? '').trim() || mainUat;

      return {
        index,
        orderRef: order.friendly_order_id,
        template,
        name: buildCerereFilename({ carteFunciara, cadastral, uat, county, kind: template }),
        data: {
          // Antetul urmează județul imobilului, nu biroul unde depune el.
          ocpi: ocpiName(county),
          bcpi: bcpiName(county, uat),
          // Anexa 6 has no county field for the imobil, so it rides along with
          // the locality — otherwise a cerere filed at Satu Mare for Otopeni
          // never names Ilfov, and UAT names repeat across counties.
          uat: uatWithCounty(uat, county),
          carteFunciara,
          // The wizard only knows the UAT, not the village a CF may belong to.
          cfLocalitate: uat,
          cadastral,
          date,
        },
      };
    })
    .filter((c): c is CerereForOrder => c !== null);
}

/**
 * The cereri to file for an order of ANY collaborator service — the single
 * place that knows which slug reads which data on which template:
 *
 * - extras CF / extras plan cadastral → the client's property, on the slug's
 *   template;
 * - identificare (după adresă / proprietar) → the property the COLLABORATOR
 *   identified (empty list until he reports it), always on the Anexa 6
 *   template — after identification he needs a CF extract to deliver;
 * - anything else → no cereri (other services use forms we do not have).
 */
export function cereriForOrderSlug(
  order: OrderForCereri,
  slug: string | undefined,
  date: string,
): CerereForOrder[] {
  if (!slug) return [];
  const template = CERERE_SLUGS[slug];
  if (template) return cereriForOrder(order, date, { template });
  if ((IDENTIFICARE_SLUGS as readonly string[]).includes(slug)) {
    return cereriForOrder(order, date, { template: 'cf', source: 'identified_property' });
  }
  return [];
}
