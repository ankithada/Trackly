function sanitizeLogValue(value, key = "") {
  const normalizedKey = String(key || "").toLowerCase();
  if (value == null) return value;
  if (normalizedKey.includes("password")) return "[REDACTED]";
  if (normalizedKey.includes("dataurl")) return "[DATA_URL_REDACTED]";
  if (Array.isArray(value)) return value.map((item) => sanitizeLogValue(item, key));
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, sanitizeLogValue(childValue, childKey)]));
  }
  if (typeof value === "string" && value.length > 1000) return `${value.slice(0, 1000)}...[truncated]`;
  return value;
}

function safeParseRequestBody(body) {
  if (!body || typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    return body.length > 1000 ? `${body.slice(0, 1000)}...[truncated]` : body;
  }
}

function logApiResponse(path, options, response, data, durationMs) {
  const method = options.method || "GET";
  const payload = {
    type: "api-response",
    timestamp: new Date().toISOString(),
    method,
    path,
    status: response.status,
    ok: response.ok,
    durationMs,
    requestBody: sanitizeLogValue(safeParseRequestBody(options.body)),
    responseBody: sanitizeLogValue(data)
  };
  const logger = response.ok ? console.log : console.error;
  logger(JSON.stringify(payload));
}

async function api(path, options = {}) {
  const startedAt = Date.now();
  const isFormData = options.body instanceof FormData;
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: isFormData ? (options.headers || {}) : {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  logApiResponse(path, options, response, data, Date.now() - startedAt);
  if (!response.ok) {
    const message = typeof data === "object" ? data.error || response.statusText : String(data || response.statusText || "Request failed");
    throw new Error(message);
  }
  return data;
}

export { api };
