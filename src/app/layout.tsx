import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { CookieBanner } from "@/components/CookieBanner";
import { GlobalReferralCapture } from "@/components/GlobalReferralCapture";
import { getAffiliateConfig } from "@/lib/products";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const config = getAffiliateConfig();
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://deals-hub-iota.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DealsHub España — Comparador de ofertas multi-tienda",
    template: "%s | DealsHub España",
  },
  description:
    "Compara precios en Amazon, PcComponentes, MediaMarkt, El Corte Inglés, Fnac, eBay y más. Ofertas verificadas, descuentos reales y productos trending en España.",
  keywords: [
    "ofertas españa",
    "chollos",
    "comparador precios",
    "amazon ofertas",
    "productos trending",
    "descuentos online",
  ],
  openGraph: {
    title: "DealsHub España — Las mejores ofertas",
    description: "Comparador de precios en 10+ tiendas españolas",
    locale: "es_ES",
    type: "website",
    siteName: "DealsHub España",
    url: siteUrl,
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "DealsHub España" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DealsHub España — Comparador de ofertas",
    description: "Compara precios en 10+ tiendas españolas",
    images: ["/icon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className="min-h-screen flex flex-col pb-20 md:pb-0">
        <AnalyticsTracker />
        <GlobalReferralCapture />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer disclaimer={config.disclaimer} />
        <MobileNav />
        <CookieBanner />
      </body>
    </html>
  );
}
