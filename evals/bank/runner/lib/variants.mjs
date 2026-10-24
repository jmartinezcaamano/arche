import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

/** Equivale a: find arche -type f | LC_ALL=C sort | xargs sha256sum | sha256sum  (hash «de árbol» fijado en la Fase 0). */
export function sourceTreeHash(dir, prefix = "arche") {
  const files = [];
  const walk = (d, rel) => { for (const n of readdirSync(d)) { const p = join(d, n); const r = `${rel}/${n}`; statSync(p).isDirectory() ? walk(p, r) : files.push([r, p]); } };
  walk(dir, prefix);
  files.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const lines = files.map(([r, p]) => `${createHash("sha256").update(readFileSync(p)).digest("hex")}  ${r}\n`).join("");
  return createHash("sha256").update(lines).digest("hex");
}

/** V0 = control sin skill; V1 = ĀRCHE 2.9.1 fijada por hash. V2 se añadirá cuando exista la candidata. */
export function loadVariant(bankDir, id) {
  if (id === "V0") return { id, dir: null, prefix: "", hash: null };
  if (id === "V1") {
    const base = join(bankDir, "variants", "v1-2.9.1");
    const dir = join(base, "arche");
    const pinned = readFileSync(join(base, "SOURCE-HASH"), "utf8").trim();
    const actual = sourceTreeHash(dir);
    if (actual !== pinned) throw new Error(`V1 no coincide con el hash fijado (esperado ${pinned}, actual ${actual}): la línea base fue modificada`);
    return { id, dir, prefix: "Usa ĀRCHE para: ", hash: pinned };
  }
  throw new Error(`variante desconocida: ${id}`);
}
export const hasVariantDir = (d) => existsSync(d);
