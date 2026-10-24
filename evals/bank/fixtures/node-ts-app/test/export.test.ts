import { test } from "node:test";
import assert from "node:assert/strict";
import { exportJson } from "../src/export.ts";

test("exportJson devuelve un array JSON con todas las incidencias", () => {
  const out = JSON.parse(exportJson([{ id: 1, title: "Gotera", status: "abierta", reportedBy: "Ana" }]));
  assert.equal(out.length, 1);
  assert.equal(out[0].title, "Gotera");
});
