import Link from "next/link";
import affiliatePrograms from "../../../data/affiliate-programs.json";

const programs = [
  {
    name: "Amazon Afiliados",
    url: "https://afiliados.amazon.es/",
    commission: "1% – 12% según categoría",
    cookie: "24 horas",
    difficulty: "Fácil",
    steps: [
      "Entra en afiliados.amazon.es y pulsa «Regístrate».",
      "Inicia sesión con tu cuenta de Amazon normal.",
      "Rellena tu web (puedes poner la URL de DealsHub cuando la publiques).",
      "Indica tu IBAN español para recibir pagos.",
      "Amazon revisará tu solicitud (suelen aprobar en 1-3 días si tienes contenido).",
      "Cuando te aprueben, copia tu «Store ID» (tag) — algo como «tunombre-21».",
      "Pégalo en el archivo .env.local como NEXT_PUBLIC_AMAZON_TAG=tunombre-21",
    ],
    note: "⚠️ Importante: debes generar al menos 3 ventas en los primeros 180 días o te cierran la cuenta.",
  },
  {
    name: "Awin (PcComponentes, MediaMarkt, El Corte Inglés, Fnac, Decathlon, IKEA…)",
    url: "https://www.awin.com/es",
    commission: "0,75% – 7% según tienda y categoría",
    cookie: "7-30 días",
    difficulty: "Media",
    steps: [
      "Regístrate gratis en awin.com/es como «Publisher» (afiliado).",
      "Completa tu perfil: describe tu web/redes y tráfico estimado.",
      "Busca las tiendas que quieres (ej: «PcComponentes ES», «MediaMarkt ES»).",
      "Solicita unirte a cada programa — la mayoría aprueban en 1-5 días.",
      "Copia tu Publisher ID de Awin.",
      "Pégalo en .env.local como NEXT_PUBLIC_AWIN_PUBLISHER_ID=123456",
    ],
    note: "Awin es la red más grande en España. Una sola cuenta te da acceso a cientos de tiendas.",
  },
  {
    name: "Admitad",
    url: "https://www.admitad.com/es/",
    commission: "Variable (AliExpress, Shein, tiendas internacionales)",
    cookie: "Variable",
    difficulty: "Media",
    steps: [
      "Regístrate en admitad.com/es.",
      "Añade tu sitio web o canal de redes sociales.",
      "Explora campañas disponibles en España.",
      "Solicita acceso a las que te interesen.",
    ],
    note: "Buena opción para AliExpress, Shein y marcas internacionales.",
  },
  {
    name: "TradeTracker",
    url: "https://tradetracker.com/es/",
    commission: "Variable",
    cookie: "Variable",
    difficulty: "Media",
    steps: [
      "Regístrate en tradetracker.com/es.",
      "Añade tu web y espera validación.",
      "Únete a campañas de tiendas españolas.",
    ],
    note: "Red europea con sede en España, buena para marcas locales.",
  },
  {
    name: "eBay Partner Network",
    url: "https://partnernetwork.ebay.es/",
    commission: "50-70% de la comisión de eBay",
    cookie: "24 horas",
    difficulty: "Fácil",
    steps: [
      "Regístrate en partnernetwork.ebay.es.",
      "Crea una campaña y obtén tu Campaign ID.",
      "Configura NEXT_PUBLIC_EBAY_CAMPAIGN_ID en .env.local",
    ],
    note: "Ideal para productos de segunda mano, outlet y coleccionables.",
  },
  {
    name: "Booking.com Afiliados",
    url: "https://www.booking.com/affiliate-program/v2/index.html",
    commission: "25-40% de la comisión de Booking",
    cookie: "Session",
    difficulty: "Media",
    steps: [
      "Regístrate en el programa de afiliados de Booking.",
      "Espera aprobación (pueden tardar unos días).",
      "Obtén tu Affiliate ID y configúralo en .env.local",
    ],
    note: "Perfecto para contenido de viajes y escapadas — no necesitas vender productos físicos.",
  },
];

const affiliateData = affiliatePrograms as {
  networks: Array<{
    id: string;
    name: string;
    signupUrl: string;
    commission: string;
    payment: string;
    stores: string[];
    bestFor: string;
    priority: number;
  }>;
  directPrograms: Array<{ store: string; note: string; url: string | null }>;
  recommendedOrder: string[];
};

export default function GuiaAfiliadosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Cómo ganar dinero con DealsHub</h1>
      <p className="mt-4 text-lg text-slate-300">
        No puedo crear cuentas de afiliado por ti — requieren tu DNI/NIF, datos bancarios y
        verificación personal. Pero aquí tienes la guía completa para registrarte en todas las
        redes y empezar a cobrar comisiones.
      </p>

      <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
        <p className="font-semibold text-amber-300">📋 Lo que necesitas antes de empezar</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-300">
          <li>Una web publicada (puedes usar Vercel gratis — te explico abajo)</li>
          <li>Tu NIF/DNI y cuenta bancaria española (IBAN)</li>
          <li>Perfil en redes sociales (TikTok, Instagram, YouTube) para promocionar</li>
          <li>30 minutos para registrarte en cada red</li>
        </ul>
      </div>

      {/* Mapa completo de empresas */}
      <h2 className="mt-16 text-2xl font-bold">🏪 Todas las empresas donde puedes ganar dinero</h2>
      <p className="mt-2 text-slate-400">
        Igual que Amazon, estas tiendas y servicios pagan comisión por cada venta que refieras.
        La mayoría se gestionan desde <strong className="text-white">1–3 cuentas</strong> (Awin + Admitad + Amazon).
      </p>

      <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <p className="font-semibold text-emerald-300">✅ Orden recomendado para registrarte</p>
        <ol className="mt-3 space-y-2 text-sm text-slate-300">
          {affiliateData.recommendedOrder.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="mt-8 space-y-6">
        {affiliateData.networks
          .sort((a, b) => a.priority - b.priority)
          .map((net) => (
            <div key={net.id} className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{net.name}</h3>
                  <p className="mt-1 text-sm text-indigo-400">{net.bestFor}</p>
                </div>
                <a
                  href={net.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
                >
                  Registrarme →
                </a>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>💰 {net.commission}</span>
                <span>💳 {net.payment}</span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tiendas incluidas ({net.stores.length})
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {net.stores.map((store) => (
                    <span
                      key={store}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300"
                    >
                      {store}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold">Tiendas con programa propio o especial</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left">
              <th className="p-4 font-semibold">Empresa</th>
              <th className="p-4 font-semibold">Cómo acceder</th>
              <th className="p-4 font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {affiliateData.directPrograms.map((d) => (
              <tr key={d.store} className="border-b border-white/5">
                <td className="p-4 font-medium">{d.store}</td>
                <td className="p-4 text-slate-400">{d.note}</td>
                <td className="p-4">
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      Ir →
                    </a>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-slate-300">
        <p className="font-semibold text-rose-300">❌ Empresas SIN programa afiliado (de momento)</p>
        <p className="mt-2">
          Zara, Bershka, Pull&Bear, Primark, Mercadona, Lidl — no tienen afiliados públicos en España.
          Para moda low-cost usa <strong>Shein/Temu via Admitad</strong> o promociona marcas en Amazon/Awin.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-bold">Redes de afiliados — guía paso a paso</h2>
      <div className="mt-6 space-y-6">
        {programs.map((prog) => (
          <div
            key={prog.name}
            className="rounded-2xl border border-white/10 bg-card p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h3 className="text-xl font-semibold">{prog.name}</h3>
              <a
                href={prog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
              >
                Registrarme →
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
              <span>💰 {prog.commission}</span>
              <span>🍪 Cookie: {prog.cookie}</span>
              <span>📊 Dificultad: {prog.difficulty}</span>
            </div>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-slate-300">
              {prog.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-amber-300/80">{prog.note}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold">Publicar tu web (gratis)</h2>
      <div className="mt-4 rounded-2xl border border-white/10 bg-card p-6 text-sm text-slate-300">
        <ol className="list-inside list-decimal space-y-3">
          <li>
            Crea cuenta en{" "}
            <a href="https://vercel.com" className="text-indigo-400 hover:underline">
              vercel.com
            </a>{" "}
            (gratis)
          </li>
          <li>Conecta tu repositorio de GitHub con el proyecto deals-hub</li>
          <li>
            En Vercel → Settings → Environment Variables, añade tus tags de afiliado:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs">
              {`NEXT_PUBLIC_AMAZON_TAG=tunombre-21
NEXT_PUBLIC_AWIN_PUBLISHER_ID=123456`}
            </pre>
          </li>
          <li>Vercel te dará una URL tipo deals-hub.vercel.app — úsala para registrarte en Amazon/Awin</li>
        </ol>
      </div>

      <h2 className="mt-12 text-2xl font-bold">Estrategia para ganar dinero</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          {
            t: "TikTok / Reels",
            d: "Vídeos cortos de 15-30s con el gancho del producto. Enlaza en bio a DealsHub.",
          },
          {
            t: "SEO Google",
            d: "Cada producto tiene keywords. Posiciona para «mejor air fryer 2026» etc.",
          },
          {
            t: "Comparador de precios",
            d: "La gente busca «X más barato». Tu web compara 3-4 tiendas al instante.",
          },
          {
            t: "Temporadas",
            d: "Black Friday, Prime Day, Reyes, verano — actualiza ofertas en esas fechas.",
          },
        ].map((item) => (
          <div key={item.t} className="rounded-xl border border-white/10 bg-card p-5">
            <p className="font-semibold">{item.t}</p>
            <p className="mt-2 text-sm text-slate-400">{item.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/videos"
          className="inline-block rounded-xl bg-purple-500 px-6 py-3 font-semibold hover:bg-purple-400"
        >
          Ver guiones de vídeo promocional →
        </Link>
      </div>
    </div>
  );
}
