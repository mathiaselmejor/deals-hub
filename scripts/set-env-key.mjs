#!/usr/bin/env node
/**
 * Añade o actualiza una variable en .env.local y la sincroniza a Vercel.
 * Uso: node scripts/set-env-key.mjs GEMINI_API_KEY AIza...
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const [key, ...rest] = process.argv.slice(2);
const value = rest.join(" ").trim();

if (!key || !value) {
  console.error("Uso: node scripts/set-env-key.mjs NOMBRE valor");
  process.exit(1);
}

const envPath = path.join(root, ".env.local");
let lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
const re = new RegExp(`^${key}=.*$`, "m");
lines = re.test(lines)
  ? lines.replace(re, `${key}=${value}`)
  : `${lines.trimEnd()}\n${key}=${value}\n`;
fs.writeFileSync(envPath, lines.endsWith("\n") ? lines : `${lines}\n`);
console.log(`✓ ${key} guardado en .env.local`);

const sync = spawnSync(process.execPath, ["scripts/vercel-env-api.mjs"], {
  cwd: root,
  stdio: "inherit",
});
process.exit(sync.status ?? 1);
