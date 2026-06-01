#!/usr/bin/env node
/**
 * Muestra valores para copiar a GitHub → Settings → Secrets → Actions
 * (no puede escribir secrets sin gh CLI / PAT).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf-8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1);
}

console.log(`
GitHub repo: https://github.com/mathiaselmejor/deals-hub/settings/secrets/actions

Añade estos secrets (si no existen):

  NEXT_PUBLIC_AMAZON_TAG = ${env.NEXT_PUBLIC_AMAZON_TAG || "(vacío)"}
  VERCEL_DEPLOY_HOOK     = (crear en Vercel → Settings → Git → Deploy Hooks)

Workflow activo: .github/workflows/refresh-catalog.yml (cada 6 h + manual)
`);
