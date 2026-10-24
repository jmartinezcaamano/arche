import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeEnv, isCredentialLike } from "../evals/bank/runner/lib/env.mjs";

const parent = {
  PATH: "/usr/bin", HOME: "/root", ANTHROPIC_BASE_URL: "https://x", HTTPS_PROXY: "http://p:1",
  GH_TOKEN: "s", GITHUB_TOKEN: "s", AWS_SECRET_ACCESS_KEY: "s", E2E_PASSWORD: "s",
  CLAUDE_CODE_MESSAGING_TOKEN: "s", GIT_CONFIG_KEY_0: "url.x.insteadOf", FOO: "bar",
};

test("conserva solo la lista de permitidos y no deja pasar credenciales", () => {
  const r = sanitizeEnv(parent, { extra: { HOME: "/tmp/h" } });
  assert.deepEqual(Object.keys(r.env).sort(), ["ANTHROPIC_BASE_URL", "HOME", "HTTPS_PROXY", "PATH"]);
  assert.equal(r.env.HOME, "/tmp/h");
  for (const k of ["GH_TOKEN", "GITHUB_TOKEN", "AWS_SECRET_ACCESS_KEY", "E2E_PASSWORD", "CLAUDE_CODE_MESSAGING_TOKEN", "GIT_CONFIG_KEY_0"])
    assert.ok(r.removedCredentialLike.includes(k), k);
  assert.equal(r.removedOther, 2); // HOME del padre y FOO: no son credenciales ni están permitidas
  assert.deepEqual(r.unexpectedCredentialLike, []);
});
test("passEnv declara explícitamente lo que el agente podrá leer", () => {
  const r = sanitizeEnv({ ...parent, ANTHROPIC_API_KEY: "k" }, { passEnv: ["ANTHROPIC_API_KEY"] });
  assert.equal(r.env.ANTHROPIC_API_KEY, "k");
  assert.deepEqual(r.declaredExposed, ["ANTHROPIC_API_KEY"]);
});
test("el informe contiene nombres, nunca valores", () => {
  const r = sanitizeEnv(parent);
  assert.ok(!JSON.stringify({ ...r, env: undefined }).includes('"s"'));
});
test("detección de nombres de credencial", () => {
  for (const n of ["GH_TOKEN", "MY_SECRET", "DB_PASSWORD", "SOME_API_KEY", "SUPABASE_URL", "SESSION_ID"]) assert.ok(isCredentialLike(n), n);
  for (const n of ["PATH", "HOME", "LANG", "ANTHROPIC_BASE_URL", "TERM", "NO_PROXY"]) assert.ok(!isCredentialLike(n), n);
});
