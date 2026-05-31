# Configurar login y panel admin (Supabase)

DealsHub usa **Supabase Auth** para Google y Facebook, más un panel `/admin` para monitorizar visitas y clics afiliados.

## 1. Crear proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto (región EU recomendada).
2. En **Settings → API**, copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, nunca en el cliente)

## 2. Ejecutar el schema SQL

En **SQL Editor**, pega y ejecuta el contenido de `supabase/schema.sql`.

## 3. Configurar OAuth

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → Crear proyecto → APIs → OAuth consent screen.
2. Credentials → OAuth 2.0 Client ID → Web application.
3. **Authorized redirect URI:**  
   `https://TU-PROYECTO.supabase.co/auth/v1/callback`
4. En Supabase → **Authentication → Providers → Google**: activar y pegar Client ID + Secret.

### Facebook (incluye cuentas Meta vinculadas a Instagram)

1. [Meta for Developers](https://developers.facebook.com/) → Crear app → tipo Consumer.
2. Añade producto **Facebook Login**.
3. **Valid OAuth Redirect URIs:**  
   `https://TU-PROYECTO.supabase.co/auth/v1/callback`
4. En Supabase → **Authentication → Providers → Facebook**: activar App ID + Secret.

> **Instagram:** Meta no ofrece login directo con Instagram para webs pequeñas. Los usuarios entran con **Facebook**; si su Instagram está vinculado a la misma cuenta Meta, es la misma identidad.

## 4. URLs en Supabase

**Authentication → URL Configuration:**

| Campo | Valor |
|-------|--------|
| Site URL | `https://deals-hub-iota.vercel.app` |
| Redirect URLs | `https://deals-hub-iota.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

## 5. Variables en Vercel

Añade en **Project → Settings → Environment Variables** las mismas que en `.env.local` (incluido `ADMIN_EMAILS` y `SUPABASE_SERVICE_ROLE_KEY`).

## 6. Hacerte administrador

Tras tu primer login con Google/Facebook:

```sql
update public.profiles set is_admin = true where email = 'tu-email@gmail.com';
```

O define tu email en `ADMIN_EMAILS` en Vercel.

## 7. Rutas protegidas

| Ruta | Quién puede entrar |
|------|---------------------|
| `/login` | Público |
| `/cuenta` | Usuario logueado |
| `/admin` | Solo admins |
| `/guia-afiliados`, `/videos` | Usuario logueado |

## 8. Probar en local

```bash
cp .env.example .env.local
# Rellena las variables Supabase
npm run dev
```

Abre `http://localhost:3000/login` y prueba el flujo OAuth.
