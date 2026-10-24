#!/usr/bin/env node
// Pre-registro: congela casos, fixtures, variantes fijadas y evaluadores. Una vez congelado, el runner
// rechaza ejecuciones oficiales si algo cambió. Uso: node freeze.mjs
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Tree } from "./lib/fixture.mjs";
import { createHash } from "node:crypto";

const bank = join(dirname(fileURLToPath(import.meta.url)), "..");
export function bankHash() {
  const h = createHash("sha256");
  for (const p of ["cases", "fixtures"]) h.update(sha256Tree(join(bank, p)));
  for (const f of ["lib/assert.mjs", "lib/fixture.mjs"]) h.update(readFileSync(join(bank, "runner", f)));
  h.update(readFileSync(join(bank, "variants", "v1-2.9.1", "SOURCE-HASH")));
  return h.digest("hex");
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = join(bank, "PREREG.json");
  if (existsSync(out) && !process.argv.includes("--force")) { console.error("PREREG.json ya existe (usa --force solo con aprobación y deja constancia)"); process.exit(1); }
  writeFileSync(out, JSON.stringify({ frozenAt: new Date().toISOString(), bankHash: bankHash() }, null, 2) + "\n");
  console.log("congelado", out);
}
