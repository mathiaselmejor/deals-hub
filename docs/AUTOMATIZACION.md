# Automatización DealsHub

## Ya configurado (sin que hagas nada)

| Qué | Cómo |
|-----|------|
| **CRON_SECRET** en Vercel | `scripts/vercel-env-api.mjs` (production + preview + development) |
| **NEXT_PUBLIC_SITE_URL** | `https://deals-hub-iota.vercel.app` en Vercel |
| **Cron Vercel cada 6 h** | `vercel.json` → `/api/cron/refresh-catalog` |
| **GitHub: refresh catálogo** | `.github/workflows/refresh-catalog.yml` (cada 6 h + manual) |
| **Código en GitHub** | `main` actualizado |

## Un solo paso para referidos (Supabase SQL)

1. Crea un token: [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) → **Generate new token**
2. En GitHub: [Settings → Secrets → Actions](https://github.com/mathiaselmejor/deals-hub/settings/secrets/actions) → **New secret**  
   - Name: `SUPABASE_ACCESS_TOKEN`  
   - Value: el token `sbp_...`
3. Ejecuta el workflow: [Actions → Setup Supabase (SQL) → Run workflow](https://github.com/mathiaselmejor/deals-hub/actions/workflows/setup-database.yml)

Alternativa local (misma máquina):

```powershell
$env:SB_ACCESS_TOKEN = "sbp_..."
npm run setup:sql supabase/referrals.sql
```

## Comandos útiles

```bash
npm run setup:automate    # Vercel env + índice + deploy
npm run setup:vercel      # Solo variables Vercel
npm run catalog:maintain  # Precios + rotación + enlaces directos
```

## Opcional: deploy hook tras GitHub

En Vercel → Project → Settings → Git → **Deploy Hooks** → crear hook `main`  
Copia la URL en GitHub secret `VERCEL_DEPLOY_HOOK` (el workflow de catálogo la usará tras cada refresh).
