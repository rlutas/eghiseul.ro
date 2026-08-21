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
import type { CerereExtrasCfData } from '@/lib/documents/cerere-extras-cf-pdf';
import { buildCerereFilename, normalizeCfForCerere } from '@/lib/ancpi/cerere-filename';
import { uatWithCounty } from '@/lib/ancpi/uat-label';
import { ocpiName, bcpiName } from '@/lib/ancpi/ocpi-header';

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
  customer_data?: { property?: PropertyLike | null } | null;
}

export interface CerereForOrder {
  /** Position within the order — the `?imobil=` index of the download link. */
  index: number;
  /** Filename in the collaborator's convention, before collision handling. */
  name: string;
  orderRef: string;
  data: CerereExtrasCfData;
}

export function cereriForOrder(order: OrderForCereri, date: string): CerereForOrder[] {
  const property = order.customer_data?.property;
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
        name: buildCerereFilename({ carteFunciara, cadastral, uat, county }),
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
