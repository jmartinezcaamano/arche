// Preflight de aislamiento: comprueba barreras OBSERVABLES, ejecutando las pruebas COMO EL USUARIO DEL AGENTE.
// Estados: verified | residual (riesgo real, exige --accept-residual-risk) | unverified (se declara) | failed.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync, rmSync, accessSync, constants, chmodSync, copyFileSync, mkdirSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { sanitizeEnv } from "./env.mjs";
import { GIT_ENV } from "./fixture.mjs";
import { agentSpawn } from "./exec.mjs";

// Credenciales típicas del host. Se buscan en el HOME del usuario real y en /root.
const SENSITIVE = [".claude/.credentials.json", ".ssh", ".aws", ".config/gh", ".config/gcloud", ".netrc", ".npmrc", ".docker/config.json", ".boto"];

export function hostCredentialPaths() {
  const homes = new Set(["/root", userInfo().homedir]);
  const found = [];
  for (const h of homes) for (const s of SENSITIVE) { const p = join(h, s); if (existsSync(p)) found.push(p); }
  return found;
}

export function agentCanRead(agent, path) {
  if (!agent?.user) { try { accessSync(path, constants.R_OK); return true; } catch { return false; } }
  return spawnSync("runuser", ["-u", agent.user, "--", "test", "-r", path]).status === 0;
}

/** Copia a `destDir` los certificados de proxy que el agente no podría leer (son públicos). Devuelve variables reescritas. */
export function relocateCerts(env, destDir, agent) {
  const out = {};
  const names = ["SSL_CERT_FILE", "NODE_EXTRA_CA_CERTS", "REQUESTS_CA_BUNDLE", "CURL_CA_BUNDLE"];
  for (const n of names) {
    const f = env[n];
    if (!f || !existsSync(f)) continue;
    if (agentCanRead(agent, f)) continue;
    const dst = join(destDir, "ca-bundle.crt");
    copyFileSync(f, dst); chmodSync(dst, 0o644);
    out[n] = dst;
  }
  return out;
}

export function preflight({ env = process.env, passEnv = [], authFile = null, agentUser = null, claudeBin = "claude",
  skipAuthProbe = false, acceptResidualRisk = false, model = "haiku" } = {}) {
  const barriers = [];
  const add = (id, status, detail) => barriers.push({ id, status, detail });
  const isRoot = process.getuid?.() === 0;
  const custom = claudeBin !== "claude";
  const agent = { user: agentUser ?? (isRoot ? "arche-eval" : null) };
  let probeCostUsd = 0;

  const ver = spawnSync(claudeBin, ["--version"], { encoding: "utf8" });
  const claudeVersion = ver.status === 0 ? ver.stdout.trim() : null;
  add("claude-disponible", claudeVersion ? "verified" : "failed", claudeVersion ?? `no se puede ejecutar ${claudeBin}`);

  // 1) Identidad del agente
  if (agent.user) {
    const id = spawnSync("id", ["-u", agent.user], { encoding: "utf8" });
    const uid = id.status === 0 ? Number(id.stdout.trim()) : null;
    if (uid === null) add("usuario-sin-privilegios", "failed", `el usuario ${agent.user} no existe (créalo: useradd -m ${agent.user})`);
    else if (uid === 0) add("usuario-sin-privilegios", "failed", `${agent.user} tiene uid 0`);
    else add("usuario-sin-privilegios", "verified", `el agente corre como ${agent.user} (uid ${uid}), no como root`);
  } else if (isRoot) add("usuario-sin-privilegios", "failed", "el agente correría como root");
  else add("usuario-sin-privilegios", "residual", `el agente correría como tu propio usuario (${userInfo().username}): ve todo lo que ves tú. Usa --agent-user con un usuario dedicado`);

  // 2) Credenciales del host ilegibles PARA EL USUARIO DEL AGENTE (prueba real, no declaración)
  const creds = hostCredentialPaths();
  const readable = creds.filter((p) => agentCanRead(agent, p));
  if (agent.user === null && isRoot) add("credenciales-del-host-ilegibles", "failed", `legibles por el agente: ${readable.join(", ") || "(ninguna existente)"}`);
  else if (readable.length) add("credenciales-del-host-ilegibles", "failed", `LEGIBLES por el agente: ${readable.join(", ")}`);
  else add("credenciales-del-host-ilegibles", "verified", creds.length ? `${creds.length} rutas de credenciales existentes y ninguna legible por el agente` : "no existen rutas de credenciales conocidas en este host");

  // 3) Entorno saneado
  const san = sanitizeEnv(env, { passEnv });
  add("entorno-saneado", san.unexpectedCredentialLike.length ? "failed" : "verified",
    `retiradas ${san.removedCredentialLike.length} variables con nombre de credencial y ${san.removedOther} más; conservadas ${san.kept.length}` +
    (san.unexpectedCredentialLike.length ? `; INESPERADAS: ${san.unexpectedCredentialLike.join(", ")}` : ""));

  // 4) Credencial de inferencia: es inevitable; se DECLARA qué ve el agente
  const exposed = [...san.declaredExposed.map((n) => `variable ${n}`), ...(authFile ? [`archivo de credenciales copiado a su HOME (${authFile})`] : [])];
  if (custom) add("credencial-de-inferencia", "unverified", "binario de prueba: no se usa credencial real");
  else if (exposed.length) add("credencial-de-inferencia", "residual", `el agente PUEDE LEER: ${exposed.join("; ")}. Recomendado: una API key dedicada con límite de gasto`);
  else add("credencial-de-inferencia", "failed", "el usuario del agente no tiene credencial de inferencia: usa --pass-env ANTHROPIC_API_KEY (recomendado, clave dedicada con tope de gasto) o --auth-file");

  add("git-sin-credenciales", "verified", "GIT_CONFIG_GLOBAL=/dev/null, sin helper ni prompts; remotos = repos bare locales creados por el runner");
  const inGit = spawnSync("git", ["-C", tmpdir(), "rev-parse", "--is-inside-work-tree"], { encoding: "utf8", env: { ...GIT_ENV, HOME: tmpdir() } });
  add("tmp-fuera-de-repos-git", inGit.status === 0 ? "failed" : "verified", inGit.status === 0 ? `${tmpdir()} está dentro de un repo git` : `${tmpdir()} no está dentro de ningún repo`);

  // 5) Red, desde el entorno del agente
  const net = agentSpawn(agent, "curl", ["-sS", "-m", "6", "-o", "/dev/null", "-w", "%{http_code}", "https://example.org"], { encoding: "utf8", env: san.env });
  const code = (net.stdout ?? "").trim();
  if (/^[23]/.test(code)) add("egreso-de-red", "residual", `example.org alcanzable (HTTP ${code}): hay salida a Internet desde este entorno`);
  else add("egreso-de-red", "verified", `example.org no alcanzable (${code || net.stderr?.trim().slice(0, 80) || "sin respuesta"})`);

  add("sandbox-del-so", "unverified", "sin namespace/seccomp comprobado: el usuario del agente puede leer lo que sea legible para todos (p. ej. repos del contenedor con permisos abiertos)");
  add("pool-sin-conectores", "verified", "se exige --strict-mcp-config con config vacía y se re-comprueba en el evento init de cada ejecución");

  // 6) Sonda de autenticación como el agente (coste ≈ 0,003 USD). Con binario de prueba se omite.
  if (!skipAuthProbe && !custom && barriers.every((b) => b.status !== "failed" || b.id === "credencial-de-inferencia")) {
    // la credencial se aporta como en una ejecución real
    const h = mkdtempSync(join(tmpdir(), "arche-probe-"));
    chmodSync(h, 0o755);
    const home = join(h, "home"); mkdirSync(home, { recursive: true });
    const mcp = join(h, "mcp.json"); writeFileSync(mcp, '{"mcpServers":{}}');
    if (authFile) { mkdirSync(join(home, ".claude")); copyFileSync(authFile, join(home, ".claude", ".credentials.json")); }
    const certs = relocateCerts(san.env, h, agent);
    if (agent.user) spawnSync("chown", ["-R", `${agent.user}:`, h]);
    const r = agentSpawn(agent, claudeBin, ["-p", "Responde solo: ok", "--model", model, "--max-turns", "1", "--max-budget-usd", "0.05", "--output-format", "json",
      "--setting-sources", "project,local", "--no-session-persistence", "--strict-mcp-config", "--mcp-config", mcp],
      { cwd: h, env: { ...san.env, ...certs, HOME: home }, encoding: "utf8", timeout: 90000, input: "" });
    rmSync(h, { recursive: true, force: true });
    let ok = false, detail = "";
    try { const d = JSON.parse(r.stdout); ok = !d.is_error; probeCostUsd = d.total_cost_usd ?? 0; detail = d.is_error ? String(d.result).slice(0, 80) : ""; } catch { detail = (r.stderr ?? "").slice(0, 80); }
    add("autenticacion-del-agente", ok ? "verified" : "failed", ok ? "el usuario del agente autentica con lo declarado arriba" : `el agente no puede autenticarse: ${detail}`);
  } else add("autenticacion-del-agente", "unverified", custom ? "binario de prueba" : "sonda omitida");

  const failed = barriers.filter((b) => b.status === "failed");
  const residual = barriers.filter((b) => b.status === "residual");
  const ok = failed.length === 0 && (residual.length === 0 || acceptResidualRisk);
  return { ok, barriers, failed, residual, claudeVersion, san, agent, probeCostUsd, acceptedResidual: residual.length > 0 && acceptResidualRisk };
}
