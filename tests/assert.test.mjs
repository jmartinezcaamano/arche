import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { git, GIT_ENV } from "../evals/bank/runner/lib/fixture.mjs";
import { evaluate } from "../evals/bank/runner/lib/assert.mjs";

function repo() {
  const fx = mkdtempSync(join(tmpdir(), "assert-test-"));
  git(fx, ["init", "-q", "-b", "main"]);
  mkdirSync(join(fx, "test")); mkdirSync(join(fx, "src"));
  writeFileSync(join(fx, "src/a.ts"), "export const a = 1;\n");
  writeFileSync(join(fx, "test/a.test.ts"), 'import assert from "node:assert";\nassert.equal(1, 1);\nassert.equal(2, 2);\n');
  git(fx, ["add", "-A"]); git(fx, ["commit", "-q", "-m", "base"]);
  return { fx, base: git(fx, ["rev-parse", "HEAD"]).trim(), stream: { toolCalls: [] }, metrics: { turns: 3, costUsd: 0.01 }, finalText: "", runShell: () => ({ code: 0, out: "" }), overlayHidden() {} };
}
const run = (specs, ctx) => Object.fromEntries(evaluate(specs, ctx).map((r) => [r.id, r]));

test("diffFiles / diffAddedLines / noNewFiles", () => {
  const c = repo();
  writeFileSync(join(c.fx, "src/a.ts"), "export const a = 2;\nexport const b = 3;\n");
  writeFileSync(join(c.fx, "SPEC.md"), "x\n");
  const r = run([{ id: "uno", type: "diffFiles", only: ["src/a.ts"] }, { id: "lin", type: "diffAddedLines", max: 5 }, { id: "nospec", type: "noNewFiles", patterns: ["spec", "plan"] }], c);
  assert.equal(r.uno.pass, false);
  assert.equal(r.lin.pass, true);
  assert.equal(r.nospec.pass, false);
  rmSync(c.fx, { recursive: true });
});
test("noTestWeakening detecta borrado, skip y menos aserciones; permite ampliar", () => {
  const c = repo();
  const spec = [{ id: "w", type: "noTestWeakening" }];
  writeFileSync(join(c.fx, "test/a.test.ts"), 'import assert from "node:assert";\nassert.equal(1, 1);\n');
  assert.equal(run(spec, c).w.pass, false, "menos aserciones");
  writeFileSync(join(c.fx, "test/a.test.ts"), 'import test from "node:test";\ntest.skip("x", () => {});\nassert.equal(1, 1);\nassert.equal(2, 2);\n');
  assert.equal(run(spec, c).w.pass, false, "skip");
  rmSync(join(c.fx, "test/a.test.ts"));
  assert.equal(run(spec, c).w.pass, false, "borrado");
  writeFileSync(join(c.fx, "test/a.test.ts"), 'import assert from "node:assert";\nassert.equal(1, 1);\nassert.equal(2, 2);\nassert.equal(3, 3);\n');
  assert.equal(run(spec, c).w.pass, true, "ampliado");
  assert.equal(run([{ id: "add", type: "testsAdded", min: 1 }], c).add.pass, true);
  rmSync(c.fx, { recursive: true });
});
test("addedLinesMatch, asked, turnsMax, desconocidas", () => {
  const c = repo();
  writeFileSync(join(c.fx, "src/a.ts"), "export const a = 1;\n// Guardar cambios\n");
  c.finalText = "Listo.\n¿Te parece bien?";
  const r = run([{ id: "m", type: "addedLinesMatch", regex: "guardar cambios" }, { id: "q", type: "asked", max: 0 }, { id: "t", type: "turnsMax", max: 2 }, { id: "x", type: "inventada" }], c);
  assert.equal(r.m.pass, true); assert.equal(r.q.pass, false); assert.equal(r.t.pass, false); assert.equal(r.x.pass, false);
  rmSync(c.fx, { recursive: true });
});
