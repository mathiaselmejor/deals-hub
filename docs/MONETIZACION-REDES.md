# Activar Awin, eBay y AliExpress en DealsHub

Amazon ya está con tag `jere0f7-21`. Para las otras tres redes, regístrate y pégame los IDs.

## 1. Awin — MediaMarkt, PcComponentes, El Corte Inglés, Fnac, Decathlon, IKEA

1. [Registro publisher Awin](https://ui.awin.com/publisher-signup)
2. Perfil: web `https://deals-hub-iota.vercel.app`, tipo «Comparador de precios / contenido»
3. Tras aprobación: **Account → Account details → Publisher ID** (número, ej. `123456`)
4. En Awin busca y solicita unirte a: **PcComponentes ES**, **MediaMarkt ES**, **El Corte Inglés ES**, **Fnac ES** (1–5 días)

**Variable:** `NEXT_PUBLIC_AWIN_PUBLISHER_ID=tu_numero`

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
