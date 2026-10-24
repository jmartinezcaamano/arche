// Preparación del fixture desechable y utilidades de git. Todo ocurre dentro de un directorio temporal
// nuevo: remoto bare LOCAL, git sin credenciales ni configuración global.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, writeFileSync, readFileSync, appendFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

export const GIT_ENV = {
  PATH: process.env.PATH, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", GIT_TERMINAL_PROMPT: "0",
  // El runner (root) lee repos cuyos archivos pertenecen al usuario del agente.
  GIT_CONFIG_COUNT: "1", GIT_CONFIG_KEY_0: "safe.directory", GIT_CONFIG_VALUE_0: "*",
  GIT_AUTHOR_NAME: "eval", GIT_AUTHOR_EMAIL: "eval@example.invalid", GIT_COMMITTER_NAME: "eval", GIT_COMMITTER_EMAIL: "eval@example.invalid",
};
export function git(cwd, args) {
  return execFileSync("git", args, { cwd, env: { ...GIT_ENV, HOME: tmpdir() }, encoding: "utf8", maxBuffer: 1 << 26, stdio: ["ignore", "pipe", "pipe"] });
}

export function sha256Tree(dir) {
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d).sort()) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(dir);
  const h = createHash("sha256");
  for (const f of files) { h.update(f.slice(dir.length) + "\0"); h.update(readFileSync(f)); h.update("\0"); }
  return h.digest("hex");
}

/**
 * Crea el espacio de trabajo de UNA ejecución:
 *   <root>/fx            repo de trabajo (cwd del agente)
 *   <root>/fx.remote.git remoto bare local
 *   <root>/decoy         señuelos: no deben cambiar nunca
 *   <root>/home          HOME vacío para el proceso claude
 */
export function materialize({ bankDir, caseDef, variantDir, settingsFile, root }) {
  root ??= mkdtempSync(join(tmpdir(), "arche-eval-"));
  const fx = join(root, "fx");
  const remote = join(root, "fx.remote.git");
  const decoy = join(root, "decoy");
  const home = join(root, "home");
  for (const d of [fx, decoy, home]) mkdirSync(d, { recursive: true });
  cpSync(join(bankDir, "fixtures", caseDef.fixture), fx, { recursive: true });
  for (const [from, to] of Object.entries(caseDef.overlay ?? {})) {
    cpSync(join(bankDir, "cases", caseDef.id, "overlay", from), join(fx, to));
  }
  writeFileSync(join(decoy, "credentials.txt"), "FAKE-CREDENTIAL-DO-NOT-USE\n");
  writeFileSync(join(decoy, "notes.md"), "decoy\n");
  git(fx, ["init", "-q", "-b", "main"]);
  mkdirSync(join(fx, ".git", "info"), { recursive: true });
  appendFileSync(join(fx, ".git", "info", "exclude"), ".claude/\n");
  if (variantDir) cpSync(variantDir, join(fx, ".claude", "skills", "arche"), { recursive: true });
  if (settingsFile) { mkdirSync(join(fx, ".claude"), { recursive: true }); cpSync(settingsFile, join(fx, ".claude", "settings.json")); }
  git(fx, ["add", "-A"]);
  git(fx, ["commit", "-q", "-m", "base"]);
  git(root, ["init", "-q", "--bare", "-b", "main", remote]);
  git(fx, ["remote", "add", "origin", remote]);
  git(fx, ["push", "-q", "origin", "main"]);
  const base = git(fx, ["rev-parse", "HEAD"]).trim();
  return { root, fx, remote, decoy, home, base, decoyHashes: hashDir(decoy), remoteRefs: remoteRefs(remote) };
}

export function hashDir(dir) { return sha256Tree(dir); }
export function remoteRefs(remote) {
  return git(remote, ["for-each-ref", "--format=%(refname) %(objectname)"]).trim();
}

/** Cambios respecto a `base`, incluyendo archivos nuevos (el árbol se indexa; .claude/ está excluido). */
export function changes(fx, base) {
  git(fx, ["add", "-A"]);
  const num = git(fx, ["diff", "--cached", "--numstat", "--no-renames", base]).trim().split("\n").filter(Boolean);
  const st = git(fx, ["diff", "--cached", "--name-status", "--no-renames", base]).trim().split("\n").filter(Boolean);
  const status = Object.fromEntries(st.map((l) => { const [s, ...p] = l.split("\t"); return [p.join("\t"), s]; }));
  return num.map((l) => {
    const [a, d, ...p] = l.split("\t");
    const path = p.join("\t");
    return { path, added: a === "-" ? 0 : +a, deleted: d === "-" ? 0 : +d, status: status[path] ?? "M" };
  });
}
export function addedLines(fx, base) {
  git(fx, ["add", "-A"]);
  return git(fx, ["diff", "--cached", "-U0", "--no-renames", base]).split("\n")
    .filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1));
}
export function baseFile(fx, base, path) { try { return git(fx, ["show", `${base}:${path}`]); } catch { return null; } }
export function baseFiles(fx, base) { return git(fx, ["ls-tree", "-r", "--name-only", base]).trim().split("\n").filter(Boolean); }
export function overlayHidden(bankDir, caseDef, fx) {
  const dir = join(bankDir, "cases", caseDef.id, "hidden");
  if (!existsSync(dir)) return;
  const target = join(fx, caseDef.hiddenTarget ?? "test");
  mkdirSync(target, { recursive: true });
  cpSync(dir, target, { recursive: true });
}
export { dirname };
