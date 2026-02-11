import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Header } from "@/components/shared/header";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "eGhiseul.ro - Documente Oficiale Online",
    template: "%s | eGhiseul.ro",
  },
  description:
    "Obtine cazier fiscal, extras carte funciara, certificat constatator si alte documente oficiale online, rapid si legal. Livrare in 24-48 ore.",
  keywords: [
    "cazier fiscal",
    "extras carte funciara",
    "certificat constatator",
    "documente oficiale",
    "acte online",
    "Romania",
  ],
  authors: [{ name: "eGhiseul.ro" }],
  creator: "eGhiseul.ro",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://eghiseul.ro",
    siteName: "eGhiseul.ro",
    title: "eGhiseul.ro - Documente Oficiale Online",
    description:
      "Obtine cazier fiscal, extras carte funciara, certificat constatator si alte documente oficiale online, rapid si legal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "eGhiseul.ro - Documente Oficiale Online",
    description:
      "Obtine documente oficiale online, rapid si legal. Livrare in 24-48 ore.",
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
      <head>
        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <Header />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
