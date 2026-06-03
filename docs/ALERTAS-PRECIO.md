# Alertas de precio

## Instalación Supabase

Ejecuta en el SQL Editor (o `node scripts/apply-user-features.mjs` con `SB_ACCESS_TOKEN`):

`supabase/user-features.sql`

Tablas: `price_alerts`, `price_alert_leads`, `favorites`.

## Email (Resend)

1. Cuenta en [resend.com](https://resend.com) y dominio verificado.
2. Vercel:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (ej. `DealsHub <alertas@tudominio.com>`)

Sin Resend, las alertas funcionan en el panel `/cuenta` (comprobación en vivo + cron).

## Cron

Vercel ejecuta cada **2 h**: `GET /api/cron/check-price-alerts` (ver `vercel.json`).

Prueba manual:

```powershell
node scripts/check-price-alerts.mjs
```

## Flujo usuario

1. Ficha producto → **🔔 Alerta de precio** → chips −5/10/15% o precio manual.
2. Con cuenta: guardado en `price_alerts`.
3. Sin cuenta: email en `price_alert_leads`.
4. `/cuenta` → progreso y chollos activados.
5. Cuando precio ≤ objetivo → email (si Resend) + `notified_at`.

Si el precio sube >3% sobre el objetivo, se resetea `notified_at` para avisar en la próxima bajada.
