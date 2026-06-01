#!/usr/bin/env node
/**
 * Automatización DealsHub: Vercel env + verificación + deploy.
 * Supabase SQL: requiere SB_ACCESS_TOKEN o GitHub secret SUPABASE_ACCESS_TOKEN.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;
const npx =
  process.platform === "win32"
    ? path.join(path.dirname(node), "npx.cmd")
    : "npx";

function run(script) {
  execSync(`"${node}" "${path.join(root, "scripts", script)}"`, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
}

console.log("\n🚀 DealsHub — automatización\n");

run("vercel-env-api.mjs");

const token =
  process.env.SB_ACCESS_TOKEN ||
  process.env.SUPABASE_ACCESS_TOKEN ||
  (() => {
    const p = path.join(
      process.env.HOME || process.env.USERPROFILE || "",
      ".supabase",
      "access-token",
    );
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8").trim() : "";
  })();

if (token) {
  process.env.SB_ACCESS_TOKEN = token;
  for (const f of ["user-features.sql", "referrals.sql", "fix-rls.sql"]) {
    try {
      run(`apply-sql-file.mjs supabase/${f}`);
    } catch {
      console.warn(`⚠ No se pudo aplicar supabase/${f}`);
    }
  }
} else {
  console.log(`
⚠ Supabase SQL pendiente (tabla referidos).
  Opción A — local: npx supabase login && npm run setup:sql supabase/referrals.sql
  Opción B — GitHub: Settings → Secrets → SUPABASE_ACCESS_TOKEN
           luego Actions → "Setup Supabase (SQL)" → Run workflow
`);
}

run("generate-search-index.mjs");
run("apply-direct-links.mjs");

console.log("\n📦 Deploy Vercel...");
execSync(`"${npx}" vercel --prod --yes`, { cwd: root, stdio: "inherit", shell: true });

const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf-8").split("\n")) {
  const i = line.indexOf("=");
  if (i > 0) env[line.slice(0, i)] = line.slice(i + 1);
}

if (env.CRON_SECRET) {
  try {
    const res = await fetch("https://deals-hub-iota.vercel.app/api/setup/run-sql", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    });
    const j = await res.json();
    console.log("\n🔍 Referidos:", j.status || j);
  } catch (e) {
    console.log("\n🔍 Verificación referidos: espera 1 min al deploy", e.message);
  }
}

console.log("\n✅ Automatización completada.");
console.log("   Web: https://deals-hub-iota.vercel.app");
console.log("   GitHub Actions: push .github/workflows para cron cada 6h\n");
