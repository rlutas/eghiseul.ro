import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Header } from "@/components/shared/header";
import { WhatsAppFloat } from "@/components/shared/whatsapp-float";
import { CookieConsent } from "@/components/consent/cookie-consent";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eghiseul.ro"),
  title: {
    default: "eGhișeul.ro — Documente Online: Cazier, Carte Funciară",
    template: "%s | eGhiseul.ro",
  },
  description:
    "Obține cazier judiciar, cazier fiscal, certificat constatator, extras de carte funciară și alte documente online — rapid, legal, fără cozi. Livrare pe email sau curier în 24-48 ore.",
  keywords: [
    "cazier judiciar online",
    "cazier fiscal",
    "certificat constatator",
    "extras carte funciară",
    "certificat de integritate comportamentală",
    "documente online",
    "acte online România",
  ],
  authors: [{ name: "eGhiseul.ro" }],
  creator: "eGhiseul.ro",
  alternates: { canonical: "https://eghiseul.ro/" },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://eghiseul.ro/",
    siteName: "eGhiseul.ro",
    title: "eGhișeul.ro — Documente Online: Cazier, Carte Funciară",
    description:
      "Obține documente online — cazier judiciar, cazier fiscal, certificat constatator, extras de carte funciară — rapid, legal, fără cozi. Livrare 24-48 ore.",
    images: [
      { url: "/og/default.png", width: 1200, height: 630, alt: "eGhiseul.ro — documente online" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "eGhișeul.ro — Documente Online: Cazier, Carte Funciară",
    description:
      "Documente online, rapid și legal. Livrare pe email sau curier în 24-48 ore.",
    images: ["/og/default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      {/* Google Analytics NU se mai încarcă necondiționat — gtag.js e injectat
          de CookieConsent DOAR după opt-in analitice (Consent Mode v2, default
          denied). Vezi docs/plans/2026-07-14-cookie-consent-gdpr.md. */}
      <head />
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Skip-to-content link for keyboard / screen-reader users. Hidden until focused. */}
        <a href="#main-content" className="skip-to-content">
          Sari la conținut
        </a>
        <QueryProvider>
          <Header />
          {children}
          <WhatsAppFloat />
          <CookieConsent />
        </QueryProvider>
      </body>
    </html>
  );
}
