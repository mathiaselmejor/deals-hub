#!/usr/bin/env node
/**
 * Ejecuta un archivo .sql en Supabase (Management API).
 * Token: SB_ACCESS_TOKEN o SUPABASE_ACCESS_TOKEN (cuenta → Access Tokens).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "xawuoysscwpkzwhkxruu";

const token = process.env.SB_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN;

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/apply-sql-file.mjs <ruta.sql>");
  process.exit(1);
}

if (!token) {
  console.error(
    "Falta SB_ACCESS_TOKEN. Crea uno en https://supabase.com/dashboard/account/tokens",
  );
  console.error("  $env:SB_ACCESS_TOKEN='sbp_...'; node scripts/apply-sql-file.mjs supabase/referrals.sql");
  process.exit(1);
}

const sqlPath = path.isAbsolute(file) ? file : path.join(root, file);
const sql = fs.readFileSync(sqlPath, "utf-8");

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error("SQL error:", res.status, body.slice(0, 2000));
  process.exit(1);
}

console.log(`✅ SQL aplicado: ${path.basename(sqlPath)}`);
