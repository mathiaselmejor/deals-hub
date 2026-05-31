# DealsHub España 🔥

Comparador de ofertas multi-tienda con enlaces de afiliado. Productos trending en Amazon, PcComponentes, MediaMarkt, El Corte Inglés, Fnac, eBay, Booking y más.

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Configurar afiliados

1. Lee la guía en `/guia-afiliados` o abre `src/app/guia-afiliados/page.tsx`
2. Regístrate en Amazon Afiliados, Awin, etc. (requiere TU identidad — no se puede automatizar)
3. Copia `.env.example` → `.env.local` y pega tus IDs
4. Publica en Vercel (gratis)

## Estructura

```
data/
  products.json          # Catálogo de productos y ofertas
  affiliate-config.json  # Redes y tiendas configuradas
src/
  app/                   # Páginas (ofertas, guía, vídeos)
  components/            # UI
  lib/                   # Lógica de afiliados
scripts/
  update-products.mjs    # Actualizar catálogo
```

## Publicar (Vercel)

1. Sube a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Añade variables de entorno con tus tags de afiliado
4. Deploy automático en cada push

## Ganar dinero

1. **Regístrate** en programas de afiliados (guía incluida)
2. **Publica** la web y comparte en redes
3. **Graba vídeos** con los guiones en `/videos`
4. **Actualiza** productos regularmente con `npm run update-products`

## Aviso legal

Este sitio usa enlaces de afiliado. Como afiliado, se percibe comisión por compras cualificadas sin coste extra para el usuario. Los precios pueden variar.
