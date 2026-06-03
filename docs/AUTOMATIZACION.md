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

## GEMINI_API_KEY (búsqueda por imagen con IA)

Google bloquea la creación automática de claves desde el navegador del agente. Haz **un clic manual**:

1. [aistudio.google.com/app/api-keys](https://aistudio.google.com/app/api-keys) → marcar checkbox de desarrollador → **Continuar**
2. **Crear clave de API** → nombre `deals-hub` → **Crear clave** → copiar `AIza...`
3. En PowerShell (sincroniza `.env.local` + Vercel):

```powershell
node scripts/set-env-key.mjs GEMINI_API_KEY AIzaTU_CLAVE_AQUI
npx vercel --prod
```

Sin clave, `/buscar/imagen` sigue funcionando con **OCR** (tesseract en el navegador).

## Tradedoubler (MediaMarkt ES, programa 270504)

1. [publishers.tradedoubler.com/en/login](https://publishers.tradedoubler.com/en/login) → registro o login
2. Unirse al programa [MediaMarkt 270504](https://directory.tradedoubler.com/es/programs/270504-MediaMarkt)
3. Copiar tu **Site ID** (parámetro `a=` en los enlaces de tracking)

```powershell
node scripts/set-env-key.mjs NEXT_PUBLIC_TRADEDOUBLER_SITE_ID TU_SITE_ID
npx vercel --prod
```

## Awin

Programas solicitados; estado en `data/awin-program-status.json` (pendiente de aprobación). No requiere acción hasta que Awin apruebe.

## Comandos útiles

```bash
npm run setup:automate    # Vercel env + índice + deploy
npm run setup:vercel      # Solo variables Vercel
npm run catalog:maintain  # Precios + rotación + enlaces directos
node scripts/set-env-key.mjs CLAVE valor   # Una variable → Vercel
```

## Opcional: deploy hook tras GitHub

En Vercel → Project → Settings → Git → **Deploy Hooks** → crear hook `main`  
Copia la URL en GitHub secret `VERCEL_DEPLOY_HOOK` (el workflow de catálogo la usará tras cada refresh).
