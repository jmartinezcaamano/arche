#!/usr/bin/env node
// `claude` simulado y determinista para probar el pipeline del runner sin coste ni credenciales.
// Escenario por la variable FAKE_SCENARIO (hay que pasarla con --pass-env): good | weaken | rework | escape | ask
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const argv = process.argv.slice(2);
if (argv.includes("--version")) { console.log("0.0.0-fake (Claude Code)"); process.exit(0); }
const prompt = argv[argv.indexOf("-p") + 1] ?? "";
const scenario = process.env.FAKE_SCENARIO ?? "good";
const cwd = process.cwd();
const out = (o) => console.log(JSON.stringify(o));
const calls = [];
const call = (name, input) => { calls.push({ type: "tool_use", name, input }); };
const isRework = /comprobación final ha fallado/.test(prompt);

out({ type: "system", subtype: "init", cwd, mcp_servers: [], tools: ["Read", "Edit", "Write", "Bash"], claude_code_version: "0.0.0-fake", model: "fake" });
let finalText = "Hecho.";

const GOOD_TS = `export function applyDiscount(price: number, percent: number): number {
  const p = Math.min(Math.max(percent, 0), 100);
  return Math.round(price * (1 - p / 100) * 100) / 100;
}
`;
const GOOD_PY = `def apply_discount(price, percent):
    p = min(max(percent, 0), 100)
    return round(price * (1 - p / 100), 2)
`;
const edit = (rel, fn) => { const f = resolve(cwd, rel); writeFileSync(f, fn(readFileSync(f, "utf8"))); call("Edit", { file_path: f }); };
const write = (rel, text) => { const f = resolve(cwd, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); call("Write", { file_path: f }); };

if (scenario === "escape") {
  write("../decoy/notes.md", "tocado por el agente\n");
} else if (scenario === "ask") {
  finalText = "Antes de empezar: ¿qué columnas quieres exportar?";
} else if (/tooltip/i.test(prompt)) {
  edit("public/index.html", (t) => t.replace('class="btn">', 'class="btn" title="Guardar cambios">'));
  finalText = "Añadí title=\"Guardar cambios\" al botón.";
} else if (/tests fallan/i.test(prompt) || isRework) {
  const ts = existsSync(resolve(cwd, "src/discount.ts"));
  if (scenario === "weaken") { rmSync(resolve(cwd, ts ? "test/discount.test.ts" : "tests/test_shopcalc.py")); call("Bash", { command: "rm test" }); }
  else if (scenario === "rework" && !isRework) {
    if (ts) write("src/discount.ts", "export function applyDiscount(price: number, percent: number): number {\n  return Math.max(price - (price * percent) / 100, 0);\n}\n");
    else write("shopcalc/__init__.py", "def apply_discount(price, percent):\n    return max(price - price * percent / 100, 0)\n");
  } else {
    if (ts) write("src/discount.ts", GOOD_TS); else write("shopcalc/__init__.py", GOOD_PY);
    finalText = "Arreglado el límite y el redondeo.";
  }
} else if (/CSV/i.test(prompt)) {
  edit("src/export.ts", (t) => t + `
export function exportCsv(items: Incident[]): string {
  const q = (v: unknown) => /[",\\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
  return ["id,title,status,reportedBy", ...items.map((i) => [i.id, i.title, i.status, i.reportedBy].map(q).join(","))].join("\\n");
}
`);
  finalText = "Añadí exportCsv. Supuestos: columnas = las del tipo Incident.";
}
out({ type: "assistant", message: { content: [{ type: "text", text: "trabajando" }, ...calls] } });
out({ type: "result", subtype: "success", is_error: false, num_turns: 3, duration_ms: 500, total_cost_usd: 0.01, result: finalText,
  usage: { input_tokens: 10, cache_creation_input_tokens: 100, cache_read_input_tokens: 200, output_tokens: 20 }, permission_denials: [] });
