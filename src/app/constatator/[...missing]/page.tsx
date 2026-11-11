import { notFound } from 'next/navigation';

/**
 * Unknown paths on certificat-constatator-express.ro land here (host rewrite →
 * /constatator/x) so the 404 renders inside the constatator layout and metadata, not the root
 * eghiseul ones. Static routes in this folder always win over the catch-all.
 */
export default function Missing() {
  notFound();
}
