#!/usr/bin/env node
// Runner del banco mínimo de ĀRCHE. Sin dependencias. Ver ../README.md.
//   node run.mjs --variants V0,V1 --cases C1,C3 --n 1 --model haiku --cap 0.5 --label humo --unfrozen
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync, readdirSync, rmSync, realpathSync, copyFileSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { materialize } from "./lib/fixture.mjs";
import { parseStream, metricsOf } from "./lib/stream.mjs";
import { evaluate, containment } from "./lib/assert.mjs";
import { loadVariant } from "./lib/variants.mjs";
import { preflight, relocateCerts } from "./lib/isolation.mjs";
import { agentSpawn } from "./lib/exec.mjs";
import { overlayHidden } from "./lib/fixture.mjs";
import { bankHash } from "./freeze.mjs";

const bank = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const k = argv[i].slice(2);
    if (argv[i + 1] === undefined || argv[i + 1].startsWith("--")) o[k] = true; else o[k] = argv[++i];
  }
  return o;
}
const a = parseArgs(process.argv.slice(2));
const variants = String(a.variants ?? "V1").split(",");
const caseIds = String(a.cases ?? "C1").split(",");
const reps = Number(a.n ?? 1);
const model = String(a.model ?? "haiku");
const cap = Number(a.cap ?? 0.5);
const label = String(a.label ?? "run");
const profile = a.profile && a.profile !== "H0" ? String(a.profile) : null;
const passEnv = a["pass-env"] ? String(a["pass-env"]).split(",") : [];
const claudeBin = String(a["claude-bin"] ?? "claude");
const authFile = a["auth-file"] ? String(a["auth-file"]) : null;

if (!(cap > 0)) { console.error("--cap debe ser > 0"); process.exit(2); }

// --- Pre-registro
const preregPath = join(bank, "PREREG.json");
const currentHash = bankHash();
let frozen = false;
if (existsSync(preregPath)) {
  const pre = JSON.parse(readFileSync(preregPath, "utf8"));
  frozen = pre.bankHash === currentHash;
  if (!frozen && !a.unfrozen) { console.error("El banco cambió desde el pre-registro (PREREG.json). Ejecuta con --unfrozen para desarrollo; no vale como resultado oficial."); process.exit(2); }
} else if (!a.unfrozen) { console.error("No hay PREREG.json. Ejecuta con --unfrozen (desarrollo) o congela con `node runner/freeze.mjs`."); process.exit(2); }

// --- Preflight de aislamiento (barreras comprobadas, no declaradas)
const pf = preflight({ passEnv, authFile, agentUser: a["agent-user"] ? String(a["agent-user"]) : null, claudeBin,
  skipAuthProbe: !!a["dry-run"], acceptResidualRisk: !!a["accept-residual-risk"], model });
console.log("== Aislamiento");
for (const b of pf.barriers) console.log(`  [${b.status.padEnd(10)}] ${b.id}: ${b.detail}`);
if (!pf.ok) {
  console.error(pf.failed.length ? "\nBarrera FALLIDA: no se ejecuta nada." : "\nHay riesgo residual real; repite con --accept-residual-risk si lo aceptas conscientemente (queda anotado en cada resultado).");
  process.exit(2);
}
let spent = pf.probeCostUsd;
console.log(`  coste de la sonda de autenticación: ${spent.toFixed(4)} USD\n`);

const batch = `${new Date().toISOString().replace(/[:.]/g, "-")}-${label}`;
const resultsDir = a["results-dir"] ? String(a["results-dir"]) : join(bank, "results");
mkdirSync(resultsDir, { recursive: true });
const jsonl = join(resultsDir, `${batch}.jsonl`);
const records = [];

function agentEnv(ws) {
  const certs = relocateCerts(pf.san.env, ws.root, pf.agent);
  return { ...pf.san.env, ...certs, HOME: ws.home, GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0",
    GIT_AUTHOR_NAME: "agent", GIT_AUTHOR_EMAIL: "agent@example.invalid", GIT_COMMITTER_NAME: "agent", GIT_COMMITTER_EMAIL: "agent@example.invalid" };
}

function runClaude(ws, prompt, budget, maxTurns) {
  const args = ["-p", prompt, "--model", model, "--max-turns", String(maxTurns), "--max-budget-usd", budget.toFixed(3),
    "--output-format", "stream-json", "--verbose", "--setting-sources", "project,local", "--no-session-persistence",
    "--permission-mode", "bypassPermissions", "--strict-mcp-config", "--mcp-config", join(ws.root, "mcp-empty.json")];
  const r = agentSpawn(pf.agent, claudeBin, args, { cwd: ws.fx, env: ws.env, encoding: "utf8", timeout: 900000, maxBuffer: 1 << 28, input: "" });
  const stream = parseStream(r.stdout ?? "");
  return { stream, metrics: metricsOf(stream), stderr: (r.stderr ?? "").slice(-400), timedOut: r.error?.code === "ETIMEDOUT" };
}

function oneRun(caseDef, variant, rep) {
  const ws = materialize({ bankDir: bank, caseDef, variantDir: variant.dir, settingsFile: profile });
  ws.fxReal = realpathSync(ws.fx);
  // Acceso del agente: HOME propio con la credencial DECLARADA (se borra al terminar), certificados públicos, MCP vacío.
  mkdirSync(join(ws.home, ".claude"), { recursive: true });
  writeFileSync(join(ws.root, "mcp-empty.json"), '{"mcpServers":{}}');
  if (authFile && !a["claude-bin"]) { copyFileSync(authFile, join(ws.home, ".claude", ".credentials.json")); chmodSync(join(ws.home, ".claude", ".credentials.json"), 0o600); }
  ws.env = agentEnv(ws);
  chmodSync(ws.root, 0o755);
  if (pf.agent.user) spawnSync("chown", ["-R", `${pf.agent.user}:`, ws.root]);
  const state = { lastFailOutput: "" };
  const runShell = (cmd) => {
    const r = agentSpawn(pf.agent, "bash", ["-c", cmd], { cwd: ws.fx, env: ws.env, encoding: "utf8", timeout: 60000 });
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    if (r.status !== 0) state.lastFailOutput = out.slice(-1500);
    return { code: r.status ?? 1, out };
  };
  // Integridad del fixture: la línea base debe comportarse como el caso declara.
  if (caseDef.baseline) {
    const r = runShell(caseDef.baseline.cmd);
    if ((r.code !== 0) !== !!caseDef.baseline.fails) { rmSync(ws.root, { recursive: true, force: true }); throw new Error(`fixture inválido para ${caseDef.id}: la línea base no se comporta como declara (exit ${r.code})`); }
  }
  const hiddenDir = join(bank, "cases", caseDef.id, "hidden");
  const hiddenNames = new Set(existsSync(hiddenDir) ? readdirSync(hiddenDir).map((n) => `${caseDef.hiddenTarget ?? "test"}/${n}`) : []);

  if (a["dry-run"]) { rmSync(ws.root, { recursive: true, force: true }); return null; }

  const attempts = [];
  let evals = [], cont = [], success = false, finalText = "", lastStream = null, firstPass = false;
  const maxAttempts = caseDef.rework ? 2 : 1;
  let prompt = caseDef.prompt.replace("{{PREFIX}}", variant.prefix);
  for (let at = 0; at < maxAttempts; at++) {
    const budget = Math.min(caseDef.budgetUsd, cap - spent);
    if (budget < 0.01) { console.log("  (tope global alcanzado)"); break; }
    const run = runClaude(ws, prompt, budget, caseDef.maxTurns);
    spent += run.metrics.costUsd;
    attempts.push({ ...run.metrics, timedOut: run.timedOut, stderr: run.stderr || undefined });
    lastStream = run.stream;
    finalText = run.stream.result?.result ?? run.stream.texts.at(-1) ?? "";
    let applied = false;
    const ctx = { ...ws, stream: run.stream, metrics: run.metrics, finalText, runShell, hiddenNames,
      overlayHidden: () => { if (!applied) { overlayHidden(bank, caseDef, ws.fx); applied = true; } } };
    evals = evaluate(caseDef.assertions, ctx);
    cont = containment(ctx);
    success = [...evals, ...cont].every((r) => r.pass || r.weak);
    if (at === 0) firstPass = success;
    if (success || at + 1 >= maxAttempts) break;
    // Retrabajo: se retiran las pruebas ocultas y se entrega la salida del fallo, como haría un CI rojo.
    for (const h of hiddenNames) rmSync(join(ws.fx, h), { force: true });
    prompt = `La comprobación final ha fallado. Salida (últimas líneas):\n\n${state.lastFailOutput || "(sin salida)"}\n\nCorrige el problema.`;
  }
  const sum = (k) => attempts.reduce((x, y) => x + (y[k] ?? 0), 0);
  const rec = {
    ts: new Date().toISOString(), batch, case: caseDef.id, variant: variant.id, variantHash: variant.hash, rep, model,
    claudeVersion: pf.claudeVersion, agentUser: pf.agent.user, frozen, bankHash: currentHash,
    barriers: pf.barriers.map((b) => ({ id: b.id, status: b.status })), acceptedResidualRisk: pf.acceptedResidual,
    success, firstPass, attempts,
    totals: { costUsd: sum("costUsd"), turns: sum("turns"), durationMs: sum("durationMs"), permissionDenials: sum("permissionDenials"), toolCalls: sum("toolCalls"),
      cacheReadTokens: sum("cacheReadTokens"), cacheWriteTokens: sum("cacheWriteTokens"), outputTokens: sum("outputTokens") },
    assertions: evals, containment: cont, finalTextTail: finalText.slice(-300),
    toolSequence: (lastStream?.toolCalls ?? []).map((t) => t.name),
  };
  const contained = cont.filter((c) => !c.weak).every((c) => c.pass);
  rmSync(join(ws.home, ".claude", ".credentials.json"), { force: true }); // la credencial copiada nunca se conserva
  if (contained && !a.keep) rmSync(ws.root, { recursive: true, force: true });
  else console.log(`  (espacio de trabajo conservado: ${ws.root})`);
  return rec;
}

console.log(`== Lote ${batch}  modelo=${model}  tope=${cap} USD  ${frozen ? "PRE-REGISTRADO" : "DESARROLLO (sin congelar)"}`);
outer: for (const caseId of caseIds) {
  const caseDef = JSON.parse(readFileSync(join(bank, "cases", caseId, "case.json"), "utf8"));
  for (const vid of variants) {
    const variant = loadVariant(bank, vid);
    for (let rep = 1; rep <= reps; rep++) {
      if (cap - spent < 0.02) { console.log("Tope global agotado: se detiene el lote."); break outer; }
      process.stdout.write(`${caseId} ${vid} #${rep} … `);
      let rec;
      try { rec = oneRun(caseDef, variant, rep); } catch (e) { console.log(`ERROR: ${e.message}`); process.exit(3); }
      if (!rec) { console.log("ok (dry-run: fixture válido)"); continue; }
      appendFileSync(jsonl, JSON.stringify(rec) + "\n");
      records.push(rec);
      const bad = [...rec.assertions, ...rec.containment].filter((r) => !r.pass);
      console.log(`${rec.success ? "ÉXITO" : "FALLO"}${rec.firstPass ? " (a la primera)" : ""}  ${rec.totals.costUsd.toFixed(4)} USD  ${rec.totals.turns} turnos  ${(rec.totals.durationMs / 1000).toFixed(0)} s` +
        (bad.length ? `\n    ${bad.map((b) => `${b.weak ? "~" : "✗"}${b.id}: ${b.detail}`).join("\n    ")}` : ""));
      if (rec.containment.some((c) => !c.pass && !c.weak)) { console.error("\nFALLO DE CONTENCIÓN: se detiene el lote."); process.exit(4); }
    }
  }
}

// --- Resumen por variante: las cuatro dimensiones, con coste por tarea terminada (CPT)
if (records.length) {
  const by = {};
  for (const r of records) (by[r.variant] ??= []).push(r);
  let md = `# Resumen ${batch}\n\nModelo \`${model}\`, Claude Code ${pf.claudeVersion}, ${frozen ? "pre-registrado" : "**desarrollo, sin congelar**"}. n=${reps} por celda.\n\n` +
    "| Variante | Ejecuciones | Éxito | A la primera | Coste total (USD) | **CPT (USD)** | Turnos med. | Tiempo med. (s) | Denegaciones |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n";
  const med = (xs) => { const s = [...xs].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  for (const [v, rs] of Object.entries(by)) {
    const ok = rs.filter((r) => r.success).length, fp = rs.filter((r) => r.firstPass).length;
    const tot = rs.reduce((x, r) => x + r.totals.costUsd, 0);
    md += `| ${v} | ${rs.length} | ${ok}/${rs.length} | ${fp}/${rs.length} | ${tot.toFixed(4)} | ${ok ? (tot / ok).toFixed(4) : "n/a"} | ${med(rs.map((r) => r.totals.turns))} | ${(med(rs.map((r) => r.totals.durationMs)) / 1000).toFixed(0)} | ${rs.reduce((x, r) => x + r.totals.permissionDenials, 0)} |\n`;
  }
  md += `\nGasto del lote (incluida la sonda de autenticación): **${spent.toFixed(4)} USD** de un tope de ${cap} USD.\n\nCPT = Σ coste de todos los intentos (incluidos retrabajo y fallos) ÷ tareas terminadas correctamente.\n`;
  writeFileSync(join(resultsDir, `${batch}.summary.md`), md);
  console.log("\n" + md);
}
