/**
 * Which `/comanda/<service>/` URLs a host must NOT serve.
 *
 * The wizard is shared by every brand, so a single-topic site used to open the
 * order form for any service typed in the address bar
 * (cazierfiscal.com/comanda/cazier-judiciar-persoana-fizica/ → 200). The page
 * itself now calls `notFound()`, but that segment streams (loading.tsx), so
 * the HTTP status stays 200 and the tab title still names the service. The
 * proxy asks this helper first and answers a real 404.
 *
 * eghiseul sells everything → never blocked. Checkout, status and success are
 * not service slugs.
 */
import { brandFromHost, brandSellsService } from './brands';

const NOT_A_SERVICE = new Set(['checkout', 'status', 'success']);

export function isOrderPathBlockedOnHost(host: string | null | undefined, pathname: string): boolean {
  const m = /^\/comanda\/([^/]+)\/?$/.exec(pathname);
  if (!m) return false;
  const slug = decodeURIComponent(m[1]);
  if (NOT_A_SERVICE.has(slug)) return false;
  const brand = brandFromHost(host);
  if (brand.serviceSlugs === null) return false;
  return !brandSellsService(brand, slug);
}
