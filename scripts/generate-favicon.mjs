/**
 * Genera favicon.ico y PNG en public/ desde el SVG de marca.
 * node scripts/generate-favicon.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const svgSrc = path.join(root, "src/app/icon.svg");

fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(svgSrc, path.join(publicDir, "favicon.svg"));

const sizes = [
  [16, "favicon-16.png"],
  [32, "favicon-32.png"],
  [180, "apple-touch-icon.png"],
];

for (const [size, name] of sizes) {
  const out = path.join(publicDir, name);
  execSync(`npx --yes sharp-cli resize ${size} ${size} -i "${path.join(publicDir, "favicon.svg")}" -o "${out}"`, {
    stdio: "inherit",
    cwd: root,
  });
}

// ICO desde 16 y 32
try {
  execSync(
    `npx --yes to-ico "${path.join(publicDir, "favicon-16.png")}" "${path.join(publicDir, "favicon-32.png")}" > "${path.join(publicDir, "favicon.ico")}"`,
    { stdio: "inherit", shell: true, cwd: root },
  );
} catch {
  fs.copyFileSync(path.join(publicDir, "favicon-32.png"), path.join(publicDir, "favicon.ico"));
  console.warn("to-ico falló; favicon.ico es PNG renombrado");
}

fs.copyFileSync(path.join(publicDir, "favicon-32.png"), path.join(root, "src/app/icon.png"));
console.log("Favicons escritos en public/ y src/app/icon.png");
