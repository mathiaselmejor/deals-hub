import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/products";

export const metadata: Metadata = {
  title: "Panel privado — Guiones de vídeo",
  robots: { index: false, follow: false },
};

export default function VideosPage() {
  const catalog = getCatalog();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Guiones para vídeos promocionales</h1>
      <p className="mt-4 text-lg text-slate-300">
        Scripts listos para grabar en TikTok, Instagram Reels o YouTube Shorts. Usa herramientas
        de IA como CapCut, Runway, Pika o HeyGen para generar vídeos automáticamente.
      </p>

      <div className="mt-8 rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">
        <p className="font-semibold text-purple-300">🤖 Cómo crear vídeos con IA</p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-slate-300">
          <li>
            <strong>CapCut</strong> (gratis): Pega el guión → Texto a voz → Añade clips de stock
            del producto
          </li>
          <li>
            <strong>Runway / Pika</strong>: Genera clips visuales a partir de la descripción del
            producto
          </li>
          <li>
            <strong>HeyGen / Synthesia</strong>: Avatar IA que lee el guión (ideal para reviews)
          </li>
          <li>
            Publica en TikTok/Reels con link en bio apuntando a tu DealsHub
          </li>
        </ol>
      </div>

      <div className="mt-8 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-6">
        <p className="text-lg font-bold text-indigo-200">🎬 Anuncio DealsHub (marca) — humor TikTok</p>
        <p className="mt-2 text-sm text-slate-300">
          Vídeo animado vertical (~19 s) listo para grabar pantalla o publicar. Abre en el móvil a
          pantalla completa y graba con la cámara nativa, o usa OBS en el PC.
        </p>
        <a
          href="/promo/tiktok-dealshub.html"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold shadow-lg shadow-indigo-500/25 transition hover:opacity-90"
        >
          Abrir anuncio animado →
        </a>

        <div className="mt-6 rounded-xl bg-black/30 p-4 text-sm leading-relaxed text-slate-400">
          <p className="font-medium text-slate-300">Guión con humor (voz en off / subtítulos)</p>
          <p className="mt-3">
            <strong className="text-white">[0–3 s]</strong> «POV: buscas el mismo producto en 12
            pestañas. Tu cerebro dice &ldquo;solo un precio más&rdquo;. Tu WiFi dice no.»
          </p>
          <p className="mt-2">
            <strong className="text-white">[3–7 s]</strong> «Amazon: 349 €. Otra tienda: &ldquo;OFERTA&rdquo;
            sin decir cuánto. Tu cuenta bancaria: 📉»
          </p>
          <p className="mt-2">
            <strong className="text-white">[7–12 s]</strong> «DealsHub España: comparas Amazon,
            MediaMarkt, PcComponentes, Fnac y más… en un solo sitio. Sin drama.»
          </p>
          <p className="mt-2">
            <strong className="text-white">[12–16 s]</strong> «Es como Tinder pero con precios.
            Haces match con tu cartera y ghosteas los precios inflados.»
          </p>
          <p className="mt-2">
            <strong className="text-white">[16–19 s]</strong> «Link en bio. No pagues de más. Chollos
            reales en España.»
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Hashtags: #chollos #ofertas #ahorro #españa #tiktokmademebuyit #comprasinteligentes
            #dealshub
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Música sugerida en CapCut: tendencia &ldquo;oh no&rdquo; / beat viral suave (sin
            copyright) + sonido de caja registradora al final.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {catalog.products.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border border-white/10 bg-card overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row">
              <img
                src={product.image}
                alt=""
                className="h-48 w-full object-cover sm:h-auto sm:w-48"
              />
              <div className="flex-1 p-6">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="mt-1 text-sm text-indigo-400">Hook: &ldquo;{product.videoHook}&rdquo;</p>

                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-300">📱 Guión TikTok/Reels (25 seg)</p>
                    <div className="mt-2 rounded-lg bg-black/30 p-4 leading-relaxed text-slate-400">
                      <p>
                        <strong className="text-white">[0-3s]</strong> {product.videoHook}
                      </p>
                      <p className="mt-2">
                        <strong className="text-white">[3-10s]</strong> Muestra el producto.
                        &ldquo;{product.description}&rdquo;
                      </p>
                      <p className="mt-2">
                        <strong className="text-white">[10-18s]</strong> &ldquo;Tiene{" "}
                        {product.rating} estrellas con{" "}
                        {product.reviews.toLocaleString("es-ES")} opiniones. Ahora con{" "}
                        {product.discount > 0 ? `${product.discount}% de descuento` : "oferta especial"}
                        .&rdquo;
                      </p>
                      <p className="mt-2">
                        <strong className="text-white">[18-25s]</strong> &ldquo;Link en bio para
                        comparar precios en Amazon, MediaMarkt y más. ¡No pagues de más!&rdquo;
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-slate-300">🎬 Prompt para IA de vídeo</p>
                    <div className="mt-2 rounded-lg bg-black/30 p-4 text-xs text-slate-400">
                      Product showcase video, {product.name}, modern lifestyle setting, smooth
                      camera movement, warm lighting, vertical 9:16 format, professional commercial
                      style, text overlay showing &ldquo;-{product.discount}%&rdquo; and price tag
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-slate-300">🏷️ Hashtags sugeridos</p>
                    <p className="mt-1 text-slate-500">
                      {product.keywords.map((k) => `#${k.replace(/\s/g, "")}`).join(" ")}{" "}
                      #ofertas #chollos #españa #amazon #ahorro
                    </p>
                  </div>
                </div>

                <Link
                  href={`/producto/${product.id}`}
                  className="mt-4 inline-block text-sm text-indigo-400 hover:underline"
                >
                  Ver producto y enlaces →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
