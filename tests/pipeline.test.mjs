// Pruebas de integración del runner con un `claude` simulado: sin coste, sin credenciales.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const fake = join(root, "tests", "fake-claude.mjs");

function run(scenario, cases, extra = []) {
  const results = mkdtempSync(join(tmpdir(), "pipeline-res-"));
  const r = spawnSync("node", [join(root, "evals/bank/runner/run.mjs"), "--claude-bin", fake, "--variants", "V1", "--cases", cases,
    "--unfrozen", "--accept-residual-risk", "--pass-env", "FAKE_SCENARIO", "--results-dir", results, "--cap", "1", "--label", "t", ...extra],
    { encoding: "utf8", env: { ...process.env, FAKE_SCENARIO: scenario } });
  const f = readdirSync(results).find((n) => n.endsWith(".jsonl"));
  const recs = f ? readFileSync(join(results, f), "utf8").trim().split("\n").map((l) => JSON.parse(l)) : [];
  rmSync(results, { recursive: true, force: true });
  return { code: r.status, out: r.stdout + r.stderr, recs };
}
const failedIds = (rec) => [...rec.assertions, ...rec.containment].filter((a) => !a.pass && !a.weak).map((a) => a.id);

test("C1 bien resuelto: éxito a la primera, sin fallos de contención", () => {
  const { code, recs, out } = run("good", "C1");
  assert.equal(code, 0, out);
  assert.equal(recs[0].success, true, JSON.stringify(failedIds(recs[0])));
  assert.equal(recs[0].firstPass, true);
  assert.equal(recs[0].totals.costUsd, 0.01);
});
test("C3 y C3py (dos pilas) bien resueltos pasan las pruebas ocultas", () => {
  const { code, recs, out } = run("good", "C3,C3py");
  assert.equal(code, 0, out);
  assert.deepEqual(recs.map((r) => [r.case, r.success]), [["C3", true], ["C3py", true]], recs.map(failedIds).join("|"));
});
test("C3 con test borrado: falla por debilitar los tests", () => {
  const { recs } = run("weaken", "C3");
  assert.equal(recs[0].success, false);
  assert.ok(failedIds(recs[0]).includes("ningun-test-debilitado"));
});
test("C3 con arreglo incompleto: retrabajo y coste acumulado", () => {
  const { recs } = run("rework", "C3");
  assert.equal(recs[0].attempts.length, 2);
  assert.equal(recs[0].firstPass, false);
  assert.equal(recs[0].success, true, JSON.stringify(failedIds(recs[0])));
  assert.equal(recs[0].totals.costUsd, 0.02);
});
test("C6b: preguntar en vez de hacer falla la aserción de no preguntar", () => {
  const { recs } = run("ask", "C6b");
  assert.ok(failedIds(recs[0]).includes("sin-preguntas"));
  assert.ok(failedIds(recs[0]).includes("hay-cambios"));
});
test("C6b bien resuelto pasa las ocultas (comillas CSV)", () => {
  const { recs } = run("good", "C6b");
  assert.equal(recs[0].success, true, JSON.stringify(failedIds(recs[0])));
});
test("escritura fuera del fixture: fallo de contención y se detiene el lote (exit 4)", () => {
  const { code, recs } = run("escape", "C1,C3");
  assert.equal(code, 4);
  assert.equal(recs.length, 1);
  assert.ok(failedIds(recs[0]).includes("señuelos-intactos"));
  assert.ok(failedIds(recs[0]).includes("escrituras-dentro-del-fixture"));
});
test("el tope global detiene el lote", () => {
  const { out, recs } = run("good", "C1", ["--n", "5", "--cap", "0.03"]);
  assert.ok(recs.length < 5, out);
});
