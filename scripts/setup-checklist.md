# Checklist rápido — Auth + Admin (5 min)

## ✅ Ya hecho
- [x] Código subido a GitHub (`main`)
- [x] Vercel despliega automáticamente desde GitHub

## Paso 1 — Supabase (2 min)

1. Entra en [supabase.com/dashboard](https://supabase.com/dashboard) (pestaña abierta en el navegador).
2. **New project** → nombre: `deals-hub`, región: **West EU (Ireland)**.
3. Cuando esté listo: **SQL Editor** → pega todo el archivo `supabase/schema.sql` → **Run**.
4. **Settings → API** → copia:
   - Project URL
   - anon public
   - service_role (secreto)

## Paso 2 — Variables en Vercel (1 min)

En [vercel.com/dashboard](https://vercel.com/dashboard) → proyecto **deals-hub** → **Settings → Environment Variables**:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del paso 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `ADMIN_EMAILS` | tu email de Google (ej. `mathias@gmail.com`) |

Marca **Production**, **Preview** y **Development** → Save → **Redeploy** el último deployment.

## Paso 3 — OAuth en Supabase (2 min)

**Authentication → URL Configuration:**
- Site URL: `https://deals-hub-iota.vercel.app`
- Redirect URLs: `https://deals-hub-iota.vercel.app/auth/callback`

**Authentication → Providers:**
- **Google**: activar (Client ID + Secret de [Google Cloud Console](https://console.cloud.google.com/))
- **Facebook**: activar (App ID + Secret de [Meta Developers](https://developers.facebook.com/))

Redirect URI en Google y Meta (ambos):
```
https://TU-PROYECTO-ID.supabase.co/auth/v1/callback
```

## Paso 4 — Primer login

1. Ve a https://deals-hub-iota.vercel.app/login
2. Entra con Google
3. En Supabase **SQL Editor**:
```sql
update public.profiles set is_admin = true where email = 'TU-EMAIL@gmail.com';
```
4. Abre https://deals-hub-iota.vercel.app/admin

---

Guía detallada: `docs/SUPABASE-AUTH.md`
