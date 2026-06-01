import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const png32 = path.join(root, "public/favicon-32.png");
const png16 = path.join(root, "public/favicon-16.png");

if (!fs.existsSync(png32)) {
  execSync("node scripts/generate-favicon.mjs", { cwd: root, stdio: "inherit" });
}

const script = `
import pngToIco from 'png-to-ico';
import fs from 'fs';
const buf = await pngToIco(['${png16.replace(/\\/g, "/")}', '${png32.replace(/\\/g, "/")}']);
fs.writeFileSync('${path.join(root, "public/favicon.ico").replace(/\\/g, "/")}', buf);
fs.writeFileSync('${path.join(root, "src/app/favicon.ico").replace(/\\/g, "/")}', buf);
console.log('ICO size:', buf.length);
`;

const tmp = path.join(root, "scripts/_ico-tmp.mjs");
fs.writeFileSync(tmp, script);
execSync(`npm install --no-save png-to-ico`, { cwd: root, stdio: "inherit" });
execSync(`node ${tmp}`, { cwd: root, stdio: "inherit" });
fs.unlinkSync(tmp);
