#!/usr/bin/env node
/**
 * Sincroniza variables de .env.local → Vercel (production, preview, development).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

const SYNC_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAILS",
  "NEXT_PUBLIC_AMAZON_TAG",
  "NEXT_PUBLIC_AWIN_PUBLISHER_ID",
  "NEXT_PUBLIC_EBAY_CAMPAIGN_ID",
  "NEXT_PUBLIC_ALIEXPRESS_TRACKING_ID",
  "NEXT_PUBLIC_ALIEXPRESS_TRACKING_NAME",
  "NEXT_PUBLIC_SITE_URL",
  "CRON_SECRET",
];

const ENV_TARGETS = ["production", "preview", "development"];

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

const NPX =
  process.platform === "win32"
    ? `"${process.env.ProgramFiles}\\nodejs\\npx.cmd"`
    : "npx";

function sh(cmd) {
  return execSync(cmd, { cwd: root, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], shell: true });
}

function addEnv(name, value, target) {
  const escaped = value.replace(/"/g, '\\"');
  sh(`${NPX} vercel env add ${name} ${target} --value "${escaped}" --yes --force`);
}

const env = loadEnvFile(envPath);

if (!env.CRON_SECRET) {
  env.CRON_SECRET = crypto.randomBytes(32).toString("hex");
  let lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
  lines = lines.includes("CRON_SECRET=")
    ? lines.replace(/CRON_SECRET=.*/g, `CRON_SECRET=${env.CRON_SECRET}`)
    : `${lines.trimEnd()}\n\nCRON_SECRET=${env.CRON_SECRET}\n`;
  fs.writeFileSync(envPath, lines.endsWith("\n") ? lines : `${lines}\n`);
  console.log("🔑 CRON_SECRET generado → .env.local");
}

if (!env.NEXT_PUBLIC_SITE_URL) {
  env.NEXT_PUBLIC_SITE_URL = "https://deals-hub-iota.vercel.app";
}

let ok = 0;
for (const key of SYNC_KEYS) {
  const value = env[key];
  if (!value) continue;
  for (const target of ENV_TARGETS) {
    try {
      addEnv(key, value, target);
      console.log(`  ✓ ${key} → ${target}`);
      ok++;
    } catch (e) {
      const msg = String(e.stderr || e.stdout || e.message);
      if (/already exists|Updated|Overwrote/i.test(msg)) {
        console.log(`  ≈ ${key} → ${target} (actualizado)`);
        ok++;
      } else {
        console.error(`  ✗ ${key}@${target}:`, msg.slice(0, 180));
      }
    }
  }
}

console.log(`\n✅ Vercel: ${ok} variables sincronizadas.`);
