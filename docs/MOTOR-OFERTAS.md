# Motor de ofertas DealsHub

## Enlaces directos (no búsqueda)

Los clics deben ir a la **ficha del producto**, no a `/s?k=...`.

1. Mapa completo en `data/direct-asins.json` (508 ASINs).
2. Para rellenar nuevos productos: `npm run resolve-asins` (Playwright + Amazon.es).
3. `npm run apply-direct-links` — escribe `/dp/ASIN` en todos los JSON.
4. `npm run offer-engine` — precios en vivo + rotación homepage.
3. En la web, las ofertas con badge **「Ficha producto」** son directas.

## Actualización de precios

```bash
npm run offer-engine
```

- Revisa hasta 45 productos con ASIN en `direct-asins.json` (scraping Amazon.es).
- Guarda snapshot en `data/catalog-live.json`.
- Rota trending / destacados / oferta del día en `data/rotation-state.json`.

**Producción:** tras el motor, haz deploy (`npx vercel --prod`).

**Cron Vercel:** cada 6 h llama `/api/cron/refresh-catalog` (define `CRON_SECRET` en Vercel).

> En serverless los JSON no persisten en disco. Usa **GitHub Actions** (`.github/workflows/refresh-catalog.yml`): cada 6 h ejecuta el motor, hace commit de `data/` y empuja — Vercel redespliega automáticamente si tienes deploy on push.

El motor valida precios scrapeados (rechaza valores fuera de ±65% del precio de referencia) para evitar precios absurdos en la web.

## Programa referidos

1. Ejecuta `supabase/referrals.sql`.
2. Página: `/referidos` — premio tras **3 ventas**, máximo **50%** de comisión real.
