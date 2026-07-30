function redactForLog(value, key = "") {
  const normalizedKey = String(key || "").toLowerCase();
  if (value == null) return value;
  if (normalizedKey.includes("password")) return "[REDACTED]";
  if (normalizedKey.includes("privatekey")) return "[REDACTED]";
  if (normalizedKey === "authorization" || normalizedKey === "cookie") return "[REDACTED]";
  if (normalizedKey.includes("dataurl")) return "[DATA_URL_REDACTED]";
  if (Array.isArray(value)) return value.map((item) => redactForLog(item, key));
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redactForLog(childValue, childKey)]));
  }
  if (typeof value === "string" && value.length > 2000) return `${value.slice(0, 2000)}...[truncated]`;
  return value;
}

function serializeError(error) {
  return {
    name: error?.name || "Error",
    message: error?.message || "Unknown error",
    code: error?.code || null,
    status: error?.status ?? error?.response?.status ?? null,
    statusText: error?.statusText ?? error?.response?.statusText ?? null,
    response: error?.response ?? null,
    responseText: String(error?.responseText || ""),
    stack: error?.stack || ""
  };
}

function shouldRetryGoogleTokenError(error) {
  if (!error) return false;
  const retryStatusCodes = [401, 429, 500, 502, 503, 504];
  const message = String(error.message || "").toLowerCase();
  const responseStatus = error?.response?.status || error?.status;
  return (
    retryStatusCodes.includes(responseStatus) ||
    [
      "premature close",
      "invalid response body",
      "socket hang up",
      "econnreset",
      "etimedout",
      "eai_again",
      "timeout",
      "invalid_grant",
      "unauthenticated",
      "access_token_expired"
    ].some((text) => message.includes(text))
  );
}

async function retryAsync(fn, options = {}) {
  const {
    attempts = 3,
    initialDelay = 500,
    factor = 2,
    shouldRetry = () => false
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt < attempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt >= attempts || !shouldRetry(error)) break;
      const delay = Math.round(initialDelay * Math.pow(factor, attempt - 1));
      logEvent("warn", "Retrying Google token request", {
        attempt,
        delayMs: delay,
        error: serializeError(error)
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function parseJsonSafe(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value.length > 2000 ? `${value.slice(0, 2000)}...[truncated]` : value;
  }
}

function logEvent(level, message, meta = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...redactForLog(meta)
  };
  const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  consoleMethod(JSON.stringify(record));
}

module.exports = {
  redactForLog,
  serializeError,
  shouldRetryGoogleTokenError,
  retryAsync,
  parseJsonSafe,
  logEvent
};