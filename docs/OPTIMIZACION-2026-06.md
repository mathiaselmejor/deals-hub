# Optimización DealsHub (jun 2026)

## Seguridad (P0)
- Cron `/api/cron/refresh-catalog`: exige `CRON_SECRET` (503 si falta).
- OAuth callback: rutas `next`/`redirect` validadas (`safe-redirect.ts`).
- Middleware: rutas protegidas redirigen a login si Supabase no está configurado en producción.
- APIs públicas: rate limit por IP en analytics, interactions, referral clicks, search suggest.

## Catálogo
- 507 ASINs en `direct-asins.json` — 498 ofertas Amazon con ficha `/dp/`.
- Duplicados eliminados (`nintendo-switch-oled`, `thermomix-tm6`).
- Colisiones ASIN corregidas (un producto por ASIN).
- `mergeCatalog()` deduplica por ID (prioridad: `products.json` > extras > monetized).
- Scripts: `dedupe-catalog-files.mjs`, `fix-asin-collisions.mjs`, `generate-search-index.mjs`.

## UX / rendimiento
- `ProductGrid` carga diferida en homepage (`dynamic import`).
- Búsqueda del header vía `/api/search/suggest` (sin cargar catálogo en cliente).
- `ProductCard` usa `next/image`.
- `formatPrice(0)` → «Ver oferta».
- Referidos: captura `?ref=` en todas las páginas (`GlobalReferralCapture`).

## SEO
- `metadataBase`, Open Graph, Twitter cards en layout.
- OG por producto con imagen.
- Sitemap: `/referidos`, `/privacidad`, `/aviso-legal`.
- JSON-LD producto sin `aggregateRating` si no hay datos.

## Errores
- `error.tsx`, `not-found.tsx`, `global-error.tsx`.

## Pendiente manual
1. `CRON_SECRET` en Vercel.
2. `supabase/referrals.sql` en panel SQL.
3. GitHub Actions para refresh cada 6 h.
4. Revisar ASINs de productos liberados tras colisiones (muestra aleatoria en Amazon).
