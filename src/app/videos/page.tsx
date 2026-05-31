import Link from "next/link";
import { getCatalog } from "@/lib/products";

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
