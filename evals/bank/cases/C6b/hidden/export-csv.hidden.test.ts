import { test } from "node:test";
import assert from "node:assert/strict";

// La convención del repo es `export<Formato>` en src/export.ts. Se acepta también un módulo hermano.
async function load(): Promise<(items: unknown[]) => string> {
  for (const m of ["../src/export.ts", "../src/export-csv.ts", "../src/csv.ts", "../src/exportCsv.ts"]) {
    try {
      const mod = await import(m);
      if (typeof mod.exportCsv === "function") return mod.exportCsv;
    } catch {}
  }
  throw new Error("no se encontró exportCsv");
}
const items = [
  { id: 1, title: "Gotera", status: "abierta", reportedBy: "Ana" },
  { id: 2, title: "Ascensor, planta 3", status: "cerrada", reportedBy: "Luis" },
];

test("hay cabecera y una fila por incidencia", async () => {
  const lines = (await load())(items).trim().split(/\r?\n/);
  assert.equal(lines.length, 3);
  assert.match(lines[0], /id/i);
  assert.match(lines[0], /title|t[ií]tulo/i);
});
test("un título con coma queda entrecomillado", async () => {
  const out = (await load())(items);
  assert.match(out, /"Ascensor, planta 3"/);
});
