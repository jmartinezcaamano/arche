// Parseo de `claude -p --output-format stream-json --verbose`.
export function parseStream(text) {
  const events = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try { events.push(JSON.parse(line)); } catch { /* línea parcial: se ignora */ }
  }
  const init = events.find((e) => e.type === "system" && e.subtype === "init") ?? null;
  const toolCalls = [];
  const texts = [];
  for (const e of events) {
    if (e.type !== "assistant") continue;
    for (const b of e.message?.content ?? []) {
      if (b.type === "tool_use") {
        toolCalls.push({ idx: toolCalls.length, name: b.name, input: b.input ?? {}, parent: e.parent_tool_use_id ?? null });
      } else if (b.type === "text") texts.push(b.text);
    }
  }
  const result = events.filter((e) => e.type === "result").at(-1) ?? null;
  return { init, toolCalls, texts, result };
}

export function metricsOf({ toolCalls, result }) {
  const u = result?.usage ?? {};
  return {
    costUsd: result?.total_cost_usd ?? 0,
    turns: result?.num_turns ?? 0,
    durationMs: result?.duration_ms ?? 0,
    inputTokens: u.input_tokens ?? 0,
    cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
    cacheReadTokens: u.cache_read_input_tokens ?? 0,
    outputTokens: u.output_tokens ?? 0,
    permissionDenials: (result?.permission_denials ?? []).length,
    toolCalls: toolCalls.length,
    subtype: result?.subtype ?? "no-result",
    isError: result?.is_error ?? true,
  };
}

// Última línea no vacía del texto final: heurística DÉBIL de «el agente terminó haciendo una pregunta».
export function endsWithQuestion(text) {
  const lines = (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 && /[?？]\s*$/.test(lines.at(-1));
}
