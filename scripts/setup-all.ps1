# DealsHub — setup automático Supabase + Vercel
# Uso: .\scripts\setup-all.ps1
# Requiere: haber iniciado sesión en Supabase (supabase login) y Vercel (vercel login)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "`n=== DealsHub Setup ===" -ForegroundColor Cyan

# 1. Supabase CLI login
Write-Host "`n[1/5] Supabase CLI..." -ForegroundColor Yellow
$supabaseAuth = "$env:USERPROFILE\.supabase\access-token"
if (-not (Test-Path $supabaseAuth)) {
  Write-Host "Abre el enlace que aparece y autoriza Supabase CLI."
  npx supabase login
}

# 2. Crear proyecto si no existe
Write-Host "`n[2/5] Proyecto Supabase 'deals-hub'..." -ForegroundColor Yellow
$projects = npx supabase projects list 2>&1 | Out-String
if ($projects -notmatch "deals-hub") {
  $dbPass = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
  Write-Host "Creando proyecto (region eu-west-1)..."
  npx supabase projects create deals-hub --org-id (npx supabase orgs list --output json | ConvertFrom-Json | Select-Object -First 1 -ExpandProperty id) --db-password $dbPass --region eu-west-1
  Write-Host "Guarda la contraseña DB: $dbPass" -ForegroundColor Magenta
}

$projectRef = (npx supabase projects list --output json | ConvertFrom-Json | Where-Object { $_.name -eq "deals-hub" } | Select-Object -First 1).id
if (-not $projectRef) { throw "No se encontró el proyecto deals-hub" }
Write-Host "Project ref: $projectRef"

# 3. Obtener keys API
Write-Host "`n[3/5] API keys..." -ForegroundColor Yellow
$keys = npx supabase projects api-keys --project-ref $projectRef --output json | ConvertFrom-Json
$url = "https://$projectRef.supabase.co"
$anon = ($keys | Where-Object { $_.name -eq "anon" }).api_key
$service = ($keys | Where-Object { $_.name -eq "service_role" }).api_key

# 4. Ejecutar schema SQL
Write-Host "`n[4/5] Ejecutando schema SQL..." -ForegroundColor Yellow
npx supabase db execute --project-ref $projectRef -f "$Root\supabase\schema.sql"

# 5. .env.local + Vercel
Write-Host "`n[5/5] Variables de entorno..." -ForegroundColor Yellow
$adminEmail = Read-Host "Tu email de admin (ej. tu@gmail.com)"

$envContent = @"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon
SUPABASE_SERVICE_ROLE_KEY=$service
ADMIN_EMAILS=$adminEmail

# Afiliados
NEXT_PUBLIC_AMAZON_TAG=
NEXT_PUBLIC_AWIN_PUBLISHER_ID=
"@

Set-Content -Path "$Root\.env.local" -Value $envContent -Encoding UTF8
Write-Host "`.env.local` actualizado."

Write-Host "`nAñadiendo variables a Vercel..."
npx vercel link --yes --project deals-hub 2>$null
echo $url | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
echo $anon | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
echo $service | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
echo $adminEmail | npx vercel env add ADMIN_EMAILS production --value $adminEmail --yes
echo $adminEmail | npx vercel env add ADMIN_EMAILS development --value $adminEmail --yes

Write-Host "`n=== Configura OAuth en Supabase Dashboard ===" -ForegroundColor Green
Write-Host "URL: https://supabase.com/dashboard/project/$projectRef/auth/providers"
Write-Host "Site URL: https://deals-hub-iota.vercel.app"
Write-Host "Redirect: https://deals-hub-iota.vercel.app/auth/callback"
Write-Host "`nRedeploy: npx vercel --prod"
Write-Host "`nListo. Login en /login tras configurar Google y Facebook en Supabase."
