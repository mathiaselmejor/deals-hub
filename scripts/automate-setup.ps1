# DealsHub — automatización completa (Vercel + Supabase + verificación)
# Uso: .\scripts\automate-setup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "`n=== DealsHub Automate Setup ===" -ForegroundColor Cyan

# 1. Vercel env (CRON_SECRET, SITE_URL, afiliados, Supabase)
Write-Host "`n[1/4] Sincronizando variables en Vercel..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\node.exe" scripts/vercel-env-api.mjs
if ($LASTEXITCODE -ne 0) { throw "vercel-env-sync falló" }

# 2. Supabase SQL (referidos + extras si hay token)
Write-Host "`n[2/4] Supabase SQL..." -ForegroundColor Yellow
$token = $env:SB_ACCESS_TOKEN
if (-not $token) {
  $tokenFile = Join-Path $env:USERPROFILE ".supabase\access-token"
  if (Test-Path $tokenFile) {
    $env:SB_ACCESS_TOKEN = (Get-Content $tokenFile -Raw).Trim()
    $token = $env:SB_ACCESS_TOKEN
  }
}

if ($token) {
  $sqlFiles = @(
    "supabase\price-alert-leads-migration.sql",
    "supabase\user-features.sql",
    "supabase\referrals.sql",
    "supabase\fix-rls.sql"
  )
  foreach ($f in $sqlFiles) {
    if (Test-Path $f) {
      & node scripts/apply-sql-file.mjs $f
      if ($LASTEXITCODE -ne 0) { Write-Host "  Aviso: $f puede requerir ejecución manual" -ForegroundColor DarkYellow }
    }
  }
} else {
  Write-Host "  Sin SB_ACCESS_TOKEN — intentando supabase login + db execute..." -ForegroundColor DarkYellow
  npx supabase login 2>$null
  if (Test-Path "$env:USERPROFILE\.supabase\access-token") {
    $env:SB_ACCESS_TOKEN = (Get-Content "$env:USERPROFILE\.supabase\access-token" -Raw).Trim()
    & node scripts/apply-sql-file.mjs supabase/referrals.sql
  } else {
    Write-Host "  Ejecuta: npx supabase login" -ForegroundColor Magenta
    Write-Host "  Luego vuelve a correr este script." -ForegroundColor Magenta
  }
}

# 3. Catálogo local (índice + enlaces)
Write-Host "`n[3/4] Mantenimiento catálogo local..." -ForegroundColor Yellow
& node scripts/generate-search-index.mjs
& node scripts/apply-direct-links.mjs

# 4. Redeploy producción
Write-Host "`n[4/4] Deploy Vercel producción..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npx.cmd" vercel --prod --yes

Write-Host "`n=== Listo ===" -ForegroundColor Green
Write-Host "GitHub Actions: haz push de .github/workflows/refresh-catalog.yml para cron cada 6h."
Write-Host "Producción: https://deals-hub-iota.vercel.app"
