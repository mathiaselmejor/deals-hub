import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { getAffiliateConfig } from "@/lib/products";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const config = getAffiliateConfig();

export const metadata: Metadata = {
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
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className="min-h-screen flex flex-col pb-20 md:pb-0">
        <AnalyticsTracker />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer disclaimer={config.disclaimer} />
        <MobileNav />
      </body>
    </html>
  );
}
