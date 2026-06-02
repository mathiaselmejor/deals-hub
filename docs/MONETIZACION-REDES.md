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

## 3. AliExpress Portals ✅ ACTIVO

1. [portals.aliexpress.com](https://portals.aliexpress.com/) → cuenta aprobada
2. **Herramientas → Generador de enlaces** → copia el código (ej. `_c3iyuOdJ`)
3. Tracking ID en portal: normalmente `default`

**Variables:**
```
NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID=_c3iyuOdJ
NEXT_PUBLIC_ALIEXPRESS_TRACKING_NAME=default
```

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
