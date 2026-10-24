import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStream, metricsOf, endsWithQuestion } from "../evals/bank/runner/lib/stream.mjs";

const lines = [
  { type: "system", subtype: "init", mcp_servers: [], tools: ["Read", "Bash"], cwd: "/w", claude_code_version: "9.9.9" },
  { type: "assistant", message: { content: [{ type: "text", text: "Voy a leer" }, { type: "tool_use", name: "Read", input: { file_path: "a" } }] } },
  { type: "assistant", parent_tool_use_id: "t1", message: { content: [{ type: "tool_use", name: "Bash", input: { command: "ls" } }] } },
  { type: "result", subtype: "success", is_error: false, num_turns: 3, duration_ms: 1200, total_cost_usd: 0.01,
    usage: { input_tokens: 5, cache_creation_input_tokens: 10, cache_read_input_tokens: 20, output_tokens: 7 }, permission_denials: [{}] },
].map((e) => JSON.stringify(e)).join("\n") + "\n{linea parcial";

test("extrae init, secuencia de herramientas (con padre) y resultado", () => {
  const s = parseStream(lines);
  assert.equal(s.init.claude_code_version, "9.9.9");
  assert.deepEqual(s.toolCalls.map((t) => [t.name, t.parent]), [["Read", null], ["Bash", "t1"]]);
  assert.equal(s.texts[0], "Voy a leer");
});
test("métricas", () => {
  const m = metricsOf(parseStream(lines));
  assert.deepEqual([m.costUsd, m.turns, m.permissionDenials, m.toolCalls, m.cacheReadTokens], [0.01, 3, 1, 2, 20]);
});
test("sin resultado se marca como error", () => {
  assert.equal(metricsOf(parseStream("")).isError, true);
});
test("heurística de pregunta final", () => {
  assert.ok(endsWithQuestion("Hecho.\n¿Quieres que lo cambie?"));
  assert.ok(!endsWithQuestion("Hecho. Añadí el atributo."));
  assert.ok(!endsWithQuestion(""));
});
