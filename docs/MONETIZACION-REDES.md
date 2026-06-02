# Activar Awin, eBay y AliExpress en DealsHub

Amazon ya está con tag `jere0f7-21`. Para las otras tres redes, regístrate y pégame los IDs.

## 1. Awin ✅ ACTIVO — MediaMarkt, PcComponentes, El Corte Inglés, Fnac, Decathlon, IKEA

Cuenta aprobada. **Publisher ID:** `2917459`

1. Panel: [ui.awin.com](https://ui.awin.com/)
2. **Paso pendiente:** en *Advertisers* solicita unirte a cada tienda (PcComponentes ES, MediaMarkt ES, Fnac ES, El Corte Inglés ES, Decathlon ES, IKEA ES). Sin eso los enlaces no generan comisión aunque funcionen.
3. Los clics llevan `clickref=dealshub_{producto}` para ver qué producto convierte.

**Variable:** `NEXT_PUBLIC_AWIN_PUBLISHER_ID=2917459` (ya en Vercel producción)

---

## 2. eBay Partner Network

1. [partnernetwork.ebay.es](https://partnernetwork.ebay.es/) → Registrarse
2. Crea una **campaña** (nombre: DealsHub, URL: deals-hub-iota.vercel.app)
3. Copia el **Campaign ID** (número largo en la campaña)

**Variable:** `NEXT_PUBLIC_EBAY_CAMPAIGN_ID=tu_campaign_id`

---

## 3. AliExpress Portals ✅ ACTIVO — listo para monetizar

1. [portals.aliexpress.com](https://portals.aliexpress.com/) → cuenta aprobada
2. **Herramientas → Generador de enlaces** → código `_c3iyuOdJ`
3. Tracking name en portal: `default`

**Variables (Vercel producción):**
```
NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID=_c3iyuOdJ
NEXT_PUBLIC_ALIEXPRESS_TRACKING_NAME=default
```

**En el sitio:**
- Página dedicada: `/aliexpress` (12 productos con botón afiliado)
- Enlaces envueltos en `s.click.aliexpress.com/deep_link.htm` + `aff_trace_key=dealshub_{producto}`
- Mapa de URLs: `data/aliexpress-links.json` (actualizar con `/item/ID.html` desde Portals cuando tengas el enlace exacto)
- Script: `node scripts/apply-aliexpress-links.mjs`

**Comprobar:** `GET /api/health` → `affiliate.aliexpress: true`, `monetization.coreNetworksReady: true`

---

## Cuando tengas los IDs

Escríbeme algo como:

```
Awin: 123456
eBay: 5337723456
AliExpress: abc123
```

Los añado en Vercel + redeploy (igual que Amazon).

Guía extendida: `/guia-afiliados`
