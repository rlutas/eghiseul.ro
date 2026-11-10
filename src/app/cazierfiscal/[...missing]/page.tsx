import { notFound } from 'next/navigation';

/**
 * Unknown paths on cazierfiscal.com land here (host rewrite → /cazierfiscal/x)
 * so the 404 renders inside the cazierfiscal layout and metadata, not the root
 * eghiseul ones. Static routes in this folder always win over the catch-all.
 */
export default function Missing() {
  notFound();
}
