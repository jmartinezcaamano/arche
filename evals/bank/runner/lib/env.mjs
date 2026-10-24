// Saneado del entorno del proceso `claude` por LISTA DE PERMITIDOS.
// Solo se devuelven nombres de variables, nunca valores, para los informes.
const CRED = /(TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL|API_?KEY|ACCESS_?KEY|PRIVATE|_KEY$|^KEY$|SESSION|COOKIE|AUTH)/i;
const CRED_PREFIX = /^(GH_|GITHUB_|SUPABASE_|VERCEL_|AWS_|AZURE_|GOOGLE_|GCLOUD|CLOUDSDK_|SNYK_|NPM_|E2E_|OPENAI_|STRIPE_|RESEND_|SENTRY_|GIT_CONFIG)/i;

export const DEFAULT_ALLOW = [
  "PATH", "LANG", "LC_ALL", "TERM", "TZ",
  "HTTPS_PROXY", "HTTP_PROXY", "NO_PROXY", "https_proxy", "http_proxy", "no_proxy",
  "SSL_CERT_FILE", "SSL_CERT_DIR", "NODE_EXTRA_CA_CERTS", "REQUESTS_CA_BUNDLE", "CURL_CA_BUNDLE",
  "ANTHROPIC_BASE_URL",
];

export function isCredentialLike(name) {
  return CRED.test(name) || CRED_PREFIX.test(name);
}

/**
 * @param parent  process.env (o equivalente)
 * @param opts.passEnv  nombres EXTRA que el usuario decide pasar (p. ej. ANTHROPIC_API_KEY si su
 *                      autenticación no es por proxy). Se registran como «declarados»: el agente puede leerlos.
 * @param opts.extra    variables fijas que impone el runner (HOME temporal, git sin credenciales).
 */
export function sanitizeEnv(parent, { passEnv = [], extra = {} } = {}) {
  const allow = new Set([...DEFAULT_ALLOW, ...passEnv]);
  const env = {};
  const kept = [];
  const removedCredentialLike = [];
  let removedOther = 0;
  for (const [k, v] of Object.entries(parent)) {
    if (allow.has(k)) { env[k] = v; kept.push(k); }
    else if (isCredentialLike(k)) removedCredentialLike.push(k);
    else removedOther++;
  }
  Object.assign(env, extra);
  const declaredExposed = passEnv.filter((k) => k in parent && isCredentialLike(k));
  // Una variable de DEFAULT_ALLOW con nombre de credencial sería un error de configuración.
  const unexpectedCredentialLike = kept.filter((k) => isCredentialLike(k) && !passEnv.includes(k));
  return { env, kept, removedCredentialLike, removedOther, declaredExposed, unexpectedCredentialLike };
}
