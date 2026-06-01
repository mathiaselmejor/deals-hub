#!/usr/bin/env node
/**
 * Crea un Deploy Hook en Vercel y muestra la URL para GitHub secret VERCEL_DEPLOY_HOOK.
 * Requiere: VERCEL_TOKEN (https://vercel.com/account/tokens) o sesión vercel login.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

let projectId;
let teamId;

try {
  const link = JSON.parse(
    execSync("type .vercel\\project.json", { cwd: root, encoding: "utf-8", shell: true }),
  );
  projectId = link.projectId;
  orgId = link.orgId;
} catch {
  console.error("Ejecuta primero: npx vercel link");
  process.exit(1);
}

const token = process.env.VERCEL_TOKEN;
const headers = { "Content-Type": "application/json" };
if (token) headers.Authorization = `Bearer ${token}`;

const res = await fetch(`https://api.vercel.com/v1/integrations/deploy/${projectId}/${orgId}`, {
  method: "POST",
  headers,
  body: JSON.stringify({ name: "github-catalog-refresh", ref: "main" }),
});

if (!res.ok) {
  const t = await res.text();
  console.log("API deploy hook falló. Crea manualmente:");
  console.log("  Vercel → Project deals-hub → Settings → Git → Deploy Hooks");
  console.log("  Nombre: github-catalog-refresh, Branch: main");
  console.log("  Copia la URL en GitHub → Settings → Secrets → VERCEL_DEPLOY_HOOK");
  console.error(res.status, t.slice(0, 500));
  process.exit(1);
}

const data = await res.json();
console.log("\n✅ Deploy Hook URL (añade como secret VERCEL_DEPLOY_HOOK en GitHub):\n");
console.log(data.url || data.link?.url || JSON.stringify(data));
