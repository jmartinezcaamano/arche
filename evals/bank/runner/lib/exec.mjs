// Ejecución como el usuario del agente. Si hay usuario dedicado (runner como root) se baja de privilegios con
// `runuser -u` PASANDO EL ENTORNO COMO ENTORNO (no en argv, que otros procesos podrían ver con ps).
import { spawnSync } from "node:child_process";

export function agentSpawn(agent, cmd, args, opts = {}) {
  if (!agent?.user) return spawnSync(cmd, args, opts);
  return spawnSync("runuser", ["-u", agent.user, "--", cmd, ...args], opts);
}
