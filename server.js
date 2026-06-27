const crypto = require("crypto");
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { formidable } = require("formidable");
const { GoogleAuth } = require("google-auth-library");

loadEnvFile(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret";
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/+$/, "");
const MAX_PHOTO_SIZE_BYTES = 20 * 1024 * 1024;

const SHEETS = {
  entries: "Daily Entry Form",
  reviewedEntries: "Reviewed Entries",
  consolidatedEntries: "Consolidated Credit",
  debitEntries: "Debit Entry",
  owners: "Owner Master",
  fleet: "Owner Fleet Details",
  users: "Users",
  receiptRegistry: "Receipt Registry",
  audit: ""
};

const SITE = {
  name: "West Banas Sand Mine",
  detail: "Plot No. BJ-03/2023 - Sirohi, Rajasthan"
};

const DAILY_ENTRY_COLUMNS = [
  "Receipt No.",
  "Timestamp",
  "Need to fill this form",
  "Is Ravanna Deducted",
  "Vehicle Category",
  "Vehicle Type",
  "Vehicle No.",
  "Driver Name",
  "Phone No of Driver",
  "Driver License Number",
  "Name of Owner",
  "Entry Area",
  "Exit Area",
  "Entry Time",
  "Exit Time",
  "Tare Wight",
  "Gross Weight",
  "Net Weight",
  "Name of Destination",
  "Distance to travel",
  "Validity Time",
  "Mineral Amount",
  "Total Amount",
  "Payment Mode",
  "Created By",
  "Driver Photo",
  "Vehicle Number Plate Photo",
  "Side View Photo",
  "Front View Photo"
];

const REVIEWED_ENTRY_COLUMNS = [
  "Receipt No.",
  "Reviewed On",
  "Reviewed Status",
  "Reviewed By",
  "Total Amount",
  "Transaction Total",
  "Transaction Count",
  "Transactions",
  "Transaction Summary",
  "Reviewer Notes"
];

const CONSOLIDATED_ENTRY_COLUMNS = [
  "CreditEntryID",
  "Form Entry",
  "Total Amount",
  "Received By",
  "Payment Mode",
  "Notes",
  "Date",
  "Entry Metadata",
  "Created By",
  "Created Date"
];

const DEBIT_ENTRY_COLUMNS = [
  "DebitEntryID",
  "Date",
  "Description",
  "Amount",
  "Category",
  "Payment Mode",
  "Paid To",
  "Notes",
  "Created By",
  "Created Date"
];

const OWNER_COLUMNS = ["Owner Name", "Owner Phone No", "Owner Address"];
const FLEET_COLUMNS = ["Fleet ID", "Owner Name", "Vehicle Number", "Vehicle Category", "Vehicle Type", "Status", "Notes"];
const USER_COLUMNS = ["Full Name", "User Name", "Password", "Status", "Role"];
const RECEIPT_REGISTRY_COLUMNS = ["Receipt No.", "Reserved At", "Reserved By", "Entry ID"];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const demoStore = {
  users: [
    seededUser("Admin", process.env.ADMIN_EMAIL || "admin@trackly.local", process.env.ADMIN_PASSWORD || "admin123", "admin"),
    seededUser("Staff", "staff@trackly.local", "staff123", "staff"),
    seededUser("Reviewer", "reviewer@trackly.local", "review123", "reviewer"),
    seededUser("Analyst", "analyst@trackly.local", "analyst123", "analyst")
  ],
  owners: [],
  fleet: [],
  entries: [],
  reviewedEntries: [],
  consolidatedEntries: [],
  debitEntries: [],
  receiptRegistry: [],
  audit: []
};

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

function seededUser(name, username, password, role) {
  return {
    id: crypto.createHash("sha1").update(username).digest("hex").slice(0, 12),
    name,
    username,
    email: username,
    password: hashPassword(password),
    role,
    active: "true",
    createdAt: new Date().toISOString()
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function isPasswordHash(value) {
  return /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/i.test(String(value || ""));
}

function verifyPassword(password, storedValue) {
  const normalized = String(storedValue || "");
  if (isPasswordHash(normalized)) {
    const [, salt, expectedHash] = normalized.split("$");
    const actualHash = crypto.scryptSync(String(password || ""), salt, 64).toString("hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const actualBuffer = Buffer.from(actualHash, "hex");
    if (expectedBuffer.length !== actualBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  }
  return normalized === String(password || "");
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function resolveGoogleCredentials() {
  const configuredKey = process.env.GOOGLE_PRIVATE_KEY || "";
  const trimmedKey = configuredKey.trim();

  const applicationCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || "";
  const trimmedApplicationCredentials = applicationCredentials.trim();

  const looksLikeJsonFilePath = (value) => {
    if (!value) return false;
    return (
      path.isAbsolute(value) ||
      path.win32.isAbsolute(value) ||
      /^[A-Za-z]:[\\/]/.test(value) ||
      value.toLowerCase().endsWith(".json")
    );
  };

  const envKeyAsFile = trimmedKey && looksLikeJsonFilePath(trimmedKey)
    ? fs.existsSync(trimmedKey)
      ? trimmedKey
      : path.join(__dirname, trimmedKey)
    : "";

  const envKeyAsJson = trimmedKey && trimmedKey.startsWith("{") && trimmedKey.endsWith("}");

  const appCredentialsPath = trimmedApplicationCredentials && path.isAbsolute(trimmedApplicationCredentials)
    ? trimmedApplicationCredentials
    : trimmedApplicationCredentials ? path.join(__dirname, trimmedApplicationCredentials) : "";

  if (appCredentialsPath && fs.existsSync(appCredentialsPath)) {
    const parsed = JSON.parse(fs.readFileSync(appCredentialsPath, "utf8"));
    return {
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL || parsed.client_email || "",
      privateKey: parsed.private_key || "",
      credentialsSource: "json-file",
      credentialsFile: appCredentialsPath
    };
  }

  if (envKeyAsFile && fs.existsSync(envKeyAsFile)) {
    const parsed = JSON.parse(fs.readFileSync(envKeyAsFile, "utf8"));
    return {
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL || parsed.client_email || "",
      privateKey: parsed.private_key || "",
      credentialsSource: "json-file",
      credentialsFile: envKeyAsFile
    };
  }

  if (envKeyAsJson) {
    try {
      const parsed = JSON.parse(trimmedKey);
      return {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL || parsed.client_email || "",
        privateKey: parsed.private_key || "",
        credentialsSource: "json-json",
        credentialsFile: undefined
      };
    } catch {
      // fall through to env-value fallback
    }
  }

  // 2. Production Cloud Run Mode (Application Default Credentials)
  // K_SERVICE is automatically injected by Google Cloud Run at runtime
  if (process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT) {
    return {
      clientEmail: "",
      privateKey: "",
      credentialsSource: "adc",
      credentialsFile: undefined
    };
  }

  // 3. True Missing Fallback
  return {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL || "",
    privateKey: configuredKey.replace(/\\n/g, "\n"),
    credentialsSource: trimmedKey ? "env-value" : "missing",
    credentialsFile: undefined
  };
}

class GoogleClient {
  constructor() {
    const credentials = resolveGoogleCredentials();
    this.clientEmail = credentials.clientEmail;
    this.privateKey = credentials.privateKey;
    this.credentialsSource = credentials.credentialsSource;
    this.credentialsFile = credentials.credentialsFile;
    this.sheetId = process.env.GOOGLE_SHEET_ID;
    this.driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    this.authClient = null;

    this._cachedToken =  null;
    this._tokenExpiryTime =  0;
  }

  clearAuthCache() {
    logEvent("info", "Clearing Google auth cache", {
      credentialsSource: this.credentialsSource,
      credentialsFile: this.credentialsFile || null
    });
    this._cachedToken = null;
    this._tokenExpiryTime = 0;
    this.authClient = null;
  }

  get enabled() {
    return Boolean(
      (this.credentialsSource === "json-file" || 
       this.credentialsSource === "env-value" || 
       this.credentialsSource === "adc") && 
      this.sheetId && 
      this.driveFolderId
    );
  }

  getAuthClient() {
    if (this.authClient) return this.authClient;
    const scopes = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ];

    if (this.credentialsSource === "adc") {
      this.authClient = new GoogleAuth({ scopes });
    } else if (this.credentialsFile) {
      this.authClient = new GoogleAuth({ keyFilename: this.credentialsFile, scopes });
    } else {
      this.authClient = new GoogleAuth({
        credentials: {
          client_email: this.clientEmail,
          private_key: this.privateKey
        },
        scopes
      });
    }

    return this.authClient;
  }

  // ✨ FIXED: Clean token extractor using the updated global context scope config
  async accessToken(scopes, allowClientClear = true) {
    const now = Date.now();
    
    // Reuse the token if it exists and has more than 5 minutes of validity left
    if (this._cachedToken && this._tokenExpiryTime > now + 5 * 60 * 1000) {
      return this._cachedToken;
    }

    try {
      const incomingScopes = scopes || [];
      const finalScopes = incomingScopes.length > 0 ? incomingScopes : [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
      ];

      logEvent("info", "Token missing or expired. Fetching fresh access token from Google...", {
        scopes: finalScopes
      });

      const client = await this.getAuthClient().getClient();
      const credentials = await retryAsync(
        async () => {
          const response = await client.getAccessToken();
          if (!response || !response.token) {
            throw new Error("Empty token response from Google");
          }
          return response;
        },
        {
          attempts: 3,
          initialDelay: 500,
          factor: 2,
          shouldRetry: shouldRetryGoogleTokenError
        }
      );

      this._cachedToken = credentials.token;
      
      const resLifespan = credentials.res?.data?.expires_in || 3600;
      this._tokenExpiryTime = now + (resLifespan * 1000);

      return this._cachedToken;
    } catch (err) {
      const errorDetails = serializeError(err);
      logEvent("warn", "Google Auth Token Retrieval Failure", {
        error: errorDetails,
        credentialsSource: this.credentialsSource,
        clientEmail: this.clientEmail,
        credentialFile: this.credentialsFile,
        allowClientClear
      });

      if (allowClientClear && shouldRetryGoogleTokenError(err)) {
        this.clearAuthCache();
        return this.accessToken(scopes, false);
      }

      console.error("Google Auth Token Retrieval Failure:", err.message, errorDetails);
      throw new Error(`Authentication token failure: ${err.message}`);
    }
  }

  // Ensure your request function stays clean and relies on your cached handler
  async request(url, options = {}, retryAttempt = 0) {
    const token = await this.accessToken();
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers || {})
        }
      });
    } catch (error) {
      logEvent("error", "Google API fetch failed", {
        url,
        method: options.method || "GET",
        error: serializeError(error),
        headers: redactForLog(options.headers || {})
      });
      throw error;
    }

    if (!res.ok) {
      const responseText = await res.text();
      const responseData = parseJsonSafe(responseText);
      const details = {
        url,
        method: options.method || "GET",
        status: res.status,
        statusText: res.statusText,
        response: responseData,
        headers: redactForLog(options.headers || {})
      };
      const responseString = typeof responseData === "string"
        ? responseData
        : JSON.stringify(responseData, null, 0);
      const shouldRefreshToken = res.status === 401 && /access_token_expired|invalid.*credentials|unauthenticated|token/i.test(responseString);
      if (shouldRefreshToken && retryAttempt === 0) {
        logEvent("warn", "Google API request unauthorized; refreshing token and retrying", {
          url,
          method: options.method || "GET",
          response: responseData
        });
        this._cachedToken = null;
        this._tokenExpiryTime = 0;
        return this.request(url, options, retryAttempt + 1);
      }
      if (res.status === 429 || res.status === 403) {
        logEvent("warn", "Google API quota/rate limit error", details);
      } else {
        logEvent("error", "Google API request failed", details);
      }
      const error = new Error(`Google API request failed: ${res.status} ${res.statusText}: ${responseString}`);
      error.status = res.status;
      error.statusText = res.statusText;
      error.response = responseData;
      error.responseText = responseText;
      throw error;
    }

    return res.status === 204 ? null : res.json();
  }

  async requestBinary(url, options = {}, retryAttempt = 0) {
    const token = await this.accessToken([
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]);
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers || {})
        }
      });
    } catch (error) {
      logEvent("error", "Google API binary fetch failed", {
        url,
        method: options.method || "GET",
        error: serializeError(error),
        headers: redactForLog(options.headers || {})
      });
      throw error;
    }

    if (!res.ok) {
      const responseText = await res.text();
      const responseData = parseJsonSafe(responseText);
      const details = {
        url,
        method: options.method || "GET",
        status: res.status,
        statusText: res.statusText,
        response: responseData,
        headers: redactForLog(options.headers || {})
      };
      const responseString = typeof responseData === "string"
        ? responseData
        : JSON.stringify(responseData, null, 0);
      const shouldRefreshToken = res.status === 401 && /access_token_expired|invalid.*credentials|unauthenticated|token/i.test(responseString);
      if (shouldRefreshToken && retryAttempt === 0) {
        logEvent("warn", "Google API binary request unauthorized; refreshing token and retrying", {
          url,
          method: options.method || "GET",
          response: responseData
        });
        this.clearAuthCache();
        return this.requestBinary(url, options, retryAttempt + 1);
      }
      if (res.status === 429 || res.status === 403) {
        logEvent("warn", "Google API quota/rate limit error", details);
      } else {
        logEvent("error", "Google API binary request failed", details);
      }
      const error = new Error(`Google API request failed: ${res.status} ${res.statusText}: ${responseString}`);
      error.status = res.status;
      error.statusText = res.statusText;
      error.response = responseData;
      error.responseText = responseText;
      throw error;
    }

    return {
      contentType: res.headers.get("content-type") || "application/octet-stream",
      buffer: Buffer.from(await res.arrayBuffer())
    };
  }

  async getSheetRows(sheetName) {
    const range = encodeURIComponent(sheetRange(sheetName));
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}`;
    const data = await this.request(url);
    return data.values || [];
  }

  async createSheet(sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}:batchUpdate`;
    const body = {
      requests: [{
        addSheet: {
          properties: {
            title: sheetName
          }
        }
      }]
    };
    try {
      return await this.request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (error) {
      const message = String(error?.message || "").toLowerCase();
      const alreadyExists = (error?.status === 400 || error?.status === 409) && /already exists|duplicate|exists/.test(message);
      if (alreadyExists) {
        logEvent("warn", "Sheet already exists when creating sheet", { sheetName, error: serializeError(error) });
        return null;
      }
      throw error;
    }
  }

  async appendSheetRows(sheetName, rows) {
    const range = encodeURIComponent(`${quotedSheetName(sheetName)}!A1`);
    // Uses Google's native :append endpoint
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;
    
    return this.request(url, {
      method: "POST", // native append uses POST
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: rows })
    });
  }

  async setSheetRows(sheetName, rows) {
    const range = encodeURIComponent(sheetRange(sheetName));
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}:clear`;
    await this.request(clearUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${range}?valueInputOption=USER_ENTERED`;
    return this.request(updateUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: rows })
    });
  }

  async healthCheck() {
    if (!this.enabled) {
      return {
        googleConnected: false,
        reason: "Google integration disabled or missing required configuration",
        credentialsSource: this.credentialsSource,
        sheetId: this.sheetId || null,
        driveFolderId: this.driveFolderId || null
      };
    }

    try {
      const token = await this.accessToken();
      const registryRows = await readSheetObjects(SHEETS.receiptRegistry, RECEIPT_REGISTRY_COLUMNS, "receiptRegistry");
      const driveInfo = await this.request(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(this.driveFolderId)}?fields=id,name&supportsAllDrives=true`,
        { method: "GET" }
      );

      return {
        googleConnected: true,
        credentialsSource: this.credentialsSource,
        sheetId: this.sheetId,
        driveFolderId: this.driveFolderId,
        tokenAcquired: Boolean(token),
        receiptRegistryRowCount: Array.isArray(registryRows) ? registryRows.length : null,
        driveFolder: {
          id: driveInfo.id || null,
          name: driveInfo.name || null
        }
      };
    } catch (error) {
      return {
        googleConnected: false,
        reason: `Google health check failed: ${error?.message || "Unknown error"}`,
        credentialsSource: this.credentialsSource,
        sheetId: this.sheetId,
        driveFolderId: this.driveFolderId,
        error: serializeError(error)
      };
    }
  }

  runtimeDiagnostics() {
    return {
      enabled: this.enabled,
      credentialsSource: this.credentialsSource,
      credentialsFile: this.credentialsFile || null,
      clientEmail: this.clientEmail || null,
      hasGoogleApplicationCredentials: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || null,
      hasGooglePrivateKey: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      hasGoogleClientEmail: Boolean(process.env.GOOGLE_CLIENT_EMAIL),
      sheetId: this.sheetId || null,
      driveFolderId: this.driveFolderId || null
    };
  }

  async createFolder(name, parentId = this.driveFolderId) {
    if (!parentId) return { id: "", webViewLink: "" };
    const url = "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,webViewLink";
    return this.request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId]
      })
    });
  }

  async findFolder(name, parentId = this.driveFolderId) {
    if (!parentId) return null;
    const query = encodeURIComponent(
      `name='${String(name).replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    );
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,webViewLink)&pageSize=1`;
    const data = await this.request(url, { method: "GET" });
    return data.files && data.files[0] ? data.files[0] : null;
  }

  async ensureReceiptFolder(name) {
    const existing = await this.findFolder(name);
    if (existing) return existing;
    return this.createFolder(name);
  }

  async uploadMultipart(metadata, contentType, content, parentId = this.driveFolderId) {
    if (!parentId) return { id: "", webViewLink: "" };
    const boundary = `trackly_${crypto.randomBytes(8).toString("hex")}`;
    const chunks = [
      Buffer.from([
        `--${boundary}`,
        "Content-Type: application/json; charset=UTF-8",
        "",
        JSON.stringify({ ...metadata, parents: [parentId] }),
        `--${boundary}`,
        `Content-Type: ${contentType}`,
        "",
        ""
      ].join("\r\n")),
      Buffer.isBuffer(content) ? content : Buffer.from(String(content)),
      Buffer.from(`\r\n--${boundary}--`)
    ];
    const body = Buffer.concat(chunks);
    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink";
    return this.request(url, {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body
    });
  }

  async uploadHtml(name, html, parentId) {
    return this.uploadMultipart({ name, mimeType: "text/html" }, "text/html; charset=UTF-8", html, parentId);
  }

  async uploadDataUrl(name, dataUrl, parentId) {
    const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return { id: "", webViewLink: "" };
    const [, mimeType, base64] = match;
    return this.uploadMultipart({ name, mimeType }, mimeType, Buffer.from(base64, "base64"), parentId);
  }

  async uploadBuffer(name, mimeType, buffer, parentId) {
    return this.uploadMultipart({ name, mimeType }, mimeType, buffer, parentId);
  }

  async downloadDriveFile(fileId) {
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`;
    return this.requestBinary(url, { method: "GET" });
  }
}

const google = new GoogleClient();

const SHEET_CACHE_TTL_MS = 30 * 1000;
const sheetRowsCache = new Map();

async function getSheetRowsCached(sheetName) {
  const now = Date.now();
  const cached = sheetRowsCache.get(sheetName);
  if (cached && cached.expiresAt > now) {
    return cached.rows;
  }
  const rows = await google.getSheetRows(sheetName);
  sheetRowsCache.set(sheetName, { rows, expiresAt: now + SHEET_CACHE_TTL_MS });
  return rows;
}

function invalidateSheetRowsCache(sheetName) {
  sheetRowsCache.delete(sheetName);
}

function base64Url(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function normalizeCell(value) {
  return value == null ? "" : String(value).trim();
}

function quotedSheetName(sheetName) {
  return `'${String(sheetName).replace(/'/g, "''")}'`;
}

function sheetRange(sheetName) {
  return `${quotedSheetName(sheetName)}!A1:ZZ`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function firstNonEmptyCellIndex(row = []) {
  return row.findIndex((cell) => normalizeCell(cell));
}

function repairShiftedSheetRows(rows, header) {
  if (!rows.length) return { changed: false, rows };
  const offset = firstNonEmptyCellIndex(rows[0]);
  if (offset <= 0) return { changed: false, rows };
  const shiftedDataRows = rows
    .slice(1)
    .map((row) => row.slice(offset))
    .filter((row) => row.some((cell) => normalizeCell(cell)));
  return {
    changed: shiftedDataRows.length > 0,
    rows: [header, ...shiftedDataRows]
  };
}

function generateReceiptNumber() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(crypto.randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join("");
}

function generateCreditEntryId() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return `CC-${Array.from(crypto.randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function generateDebitEntryId() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return `DB-${Array.from(crypto.randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function generateFleetId() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return `FL-${Array.from(crypto.randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

function allocateReceiptNumber(preferred, entries) {
  const existing = new Set(entries.map((entry) => normalizeCell(entry.receiptNumber)).filter(Boolean));
  const candidate = normalizeCell(preferred).toUpperCase();
  if (candidate && /^[A-Z0-9]{8}$/.test(candidate) && !existing.has(candidate)) return candidate;
  let nextValue = generateReceiptNumber();
  while (existing.has(nextValue)) nextValue = generateReceiptNumber();
  return nextValue;
}

function duplicateReceiptNumbers(entries, ignoreEntryId = "") {
  const counts = new Map();
  for (const entry of entries) {
    if (ignoreEntryId && entry.id === ignoreEntryId) continue;
    const receiptNumber = normalizeCell(entry.receiptNumber).toUpperCase();
    if (!receiptNumber) continue;
    counts.set(receiptNumber, (counts.get(receiptNumber) || 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([receiptNumber]) => receiptNumber);
}

function ensureNoDuplicateReceiptState(entries, ignoreEntryId = "") {
  const duplicates = duplicateReceiptNumbers(entries, ignoreEntryId);
  if (!duplicates.length) return;
  throw new Error(`Duplicate receipt number already exists in Google Sheet: ${duplicates.join(", ")}`);
}

function ensureReceiptNumberAvailable(entries, receiptNumber, currentEntryId = "") {
  const normalized = normalizeCell(receiptNumber).toUpperCase();
  if (!normalized) throw new Error("Receipt number is required");
  if (!/^[A-Z0-9]{8}$/.test(normalized)) throw new Error("Receipt number must be 8 uppercase letters or numbers");
  const duplicateEntry = entries.find((entry) => {
    if (currentEntryId && entry.id === currentEntryId) return false;
    return normalizeCell(entry.receiptNumber).toUpperCase() === normalized;
  });
  if (duplicateEntry) throw new Error(`Receipt number ${normalized} already exists in Google Sheet`);
  return normalized;
}

function allocateCreditEntryId(existingEntries) {
  const existing = new Set(existingEntries.map((entry) => normalizeCell(entry.creditEntryId)).filter(Boolean));
  let nextValue = generateCreditEntryId();
  while (existing.has(nextValue)) nextValue = generateCreditEntryId();
  return nextValue;
}

function allocateDebitEntryId(existingEntries) {
  const existing = new Set(existingEntries.map((entry) => normalizeCell(entry.debitEntryId)).filter(Boolean));
  let nextValue = generateDebitEntryId();
  while (existing.has(nextValue)) nextValue = generateDebitEntryId();
  return nextValue;
}

function allocateFleetId(existingEntries) {
  const existing = new Set(existingEntries.map((entry) => normalizeCell(entry.fleetId)).filter(Boolean));
  let nextValue = generateFleetId();
  while (existing.has(nextValue)) nextValue = generateFleetId();
  return nextValue;
}

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function decodeDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Uploaded photo must be a valid base64 data URL");
  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64")
  };
}

function validatePhotoUploads(photos, requestMeta = {}) {
  const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  for (const [photoKey, photo] of Object.entries(photos || {})) {
    if (!photo) continue;
    const mimeType = String(photo.mimeType || photo.type || "").toLowerCase();
    const buffer = photo.buffer || (photo.dataUrl ? decodeDataUrl(photo.dataUrl).buffer : null);
    if (!buffer) continue;
    if (!allowedMimeTypes.has(mimeType)) {
      logEvent("warn", "Photo upload rejected because file type is not allowed", {
        ...requestMeta,
        photoKey,
        photoName: photo.name || "",
        mimeType
      });
      throw new Error(`${photoKey} must be JPG, PNG, or WEBP`);
    }
    if (buffer.length > MAX_PHOTO_SIZE_BYTES) {
      logEvent("warn", "Photo upload rejected because file exceeds size limit", {
        ...requestMeta,
        photoKey,
        photoName: photo.name || "",
        mimeType,
        bytes: buffer.length,
        maxBytes: MAX_PHOTO_SIZE_BYTES
      });
      throw new Error(`${photoKey} must be 20 MB or smaller`);
    }
  }
}

function normalizeTransaction(input, index = 0) {
  const amount = Number(input?.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return {
    id: String(input?.id || `TX-${index + 1}`),
    amount: String(amount),
    mode: String(input?.mode || "Cash"),
    notes: String(input?.notes || "").trim()
  };
}

function normalizeTransactions(inputTransactions, existingEntry = {}) {
  const source = Array.isArray(inputTransactions) && inputTransactions.length
    ? inputTransactions
    : Array.isArray(existingEntry.transactions) && existingEntry.transactions.length
      ? existingEntry.transactions
      : [{
          id: "TX-1",
          amount: existingEntry.amountPaid || 0,
          mode: existingEntry.paymentMode || "Cash",
          notes: existingEntry.notes || ""
        }];

  const transactions = source
    .map((transaction, index) => normalizeTransaction(transaction, index))
    .filter(Boolean);

  if (!transactions.length) {
    return [{
      id: "TX-1",
      amount: "0",
      mode: existingEntry.paymentMode || "Cash",
      notes: ""
    }];
  }
  return transactions;
}

function transactionTotal(transactions) {
  return transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}

function transactionSummary(transactions) {
  return transactions
    .map((transaction, index) => {
      const note = transaction.notes ? ` (${transaction.notes})` : "";
      return `T${index + 1}: Rs. ${formatMoney(transaction.amount)} via ${transaction.mode}${note}`;
    })
    .join(" | ");
}

function ensureHeaderRows(rows, header) {
  if (!rows.length) return [header];
  const firstRow = rows[0].map(normalizeCell);
  const headerMatches = header.every((cell, index) => firstRow[index] === cell);
  if (headerMatches) return rows;
  return [header, ...rows.slice(1)];
}

function mergeHeaders(existingHeader, requiredHeader) {
  const merged = existingHeader.map(normalizeCell).filter(Boolean);
  for (const columnName of requiredHeader.map(normalizeCell).filter(Boolean)) {
    if (!merged.includes(columnName)) merged.push(columnName);
  }
  return merged;
}

function rowsToObjects(rows, header) {
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => normalizeCell(cell)))
    .map((row) => Object.fromEntries(header.map((key, index) => [key, normalizeCell(row[index])])));
}

function objectsToRows(objects, header) {
  return [header, ...objects.map((object) => header.map((key) => object[key] ?? ""))];
}

async function readSheetObjects(sheetName, header, fallbackKey) {
  if (!google.enabled) return demoStore[fallbackKey];
  let rows;
  try {
    rows = await getSheetRowsCached(sheetName);
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    const notFound = (error?.status === 400 || error?.status === 404) && /unable to parse range|requested range is invalid|not found|no such sheet|cannot find/i.test(message);
    if (notFound) {
      logEvent("warn", "Sheet not found, creating missing sheet", { sheetName, error: serializeError(error) });
      await google.createSheet(sheetName);
      await google.setSheetRows(sheetName, [header]);
      invalidateSheetRowsCache(sheetName);
      return [];
    }
    throw error;
  }
  if (!rows.length) {
    await google.setSheetRows(sheetName, [header]);
    invalidateSheetRowsCache(sheetName);
    return [];
  }
  if (!rows[0] || !rows[0].length) {
    await google.setSheetRows(sheetName, [header]);
    invalidateSheetRowsCache(sheetName);
    return [];
  }
  const repaired = repairShiftedSheetRows(rows, header);
  const activeRows = repaired.rows;
  const activeHeader = mergeHeaders(activeRows[0].map(normalizeCell), header);
  const normalizedSourceHeader = activeRows[0].map(normalizeCell);
  const headerMismatch =
    normalizedSourceHeader.length !== activeHeader.length ||
    activeHeader.some((cell, index) => cell !== normalizedSourceHeader[index]);

  if (repaired.changed || headerMismatch) {
    const objects = rowsToObjects(activeRows, normalizedSourceHeader);
    const rewrittenRows = objectsToRows(objects, activeHeader);
    await google.setSheetRows(sheetName, rewrittenRows);
    invalidateSheetRowsCache(sheetName);
    return rowsToObjects(rewrittenRows, activeHeader);
  }
  return rowsToObjects(activeRows, activeHeader);
}

async function appendSheetObject(sheetName, header, object, fallbackKey) {
  if (!google.enabled) {
    demoStore[fallbackKey].push(object);
    return;
  }
  const rows = await getSheetRowsCached(sheetName);
  if (!rows.length) {
    await google.setSheetRows(sheetName, [header, header.map((key) => object[key] ?? "")]);
    invalidateSheetRowsCache(sheetName);
    return;
  }
  const repaired = repairShiftedSheetRows(rows, header);
  const activeRows = repaired.rows;
  const existingHeader = activeRows[0].map(normalizeCell);
  const targetHeader = mergeHeaders(existingHeader, [...header, ...Object.keys(object)]);
  const existingObjects = rowsToObjects(activeRows, existingHeader);
  const needsRewrite = repaired.changed || targetHeader.length !== existingHeader.length || targetHeader.some((cell, index) => cell !== existingHeader[index]);
  if (needsRewrite) {
    await google.setSheetRows(sheetName, objectsToRows([...existingObjects, object], targetHeader));
    invalidateSheetRowsCache(sheetName);
    return;
  }
  await google.appendSheetRows(sheetName, [targetHeader.map((key) => object[key] ?? "")]);
  invalidateSheetRowsCache(sheetName);
}

async function writeSheetObjects(sheetName, header, objects, fallbackKey) {
  if (!google.enabled) {
    demoStore[fallbackKey] = objects;
    return;
  }
  const rows = await getSheetRowsCached(sheetName);
  const repaired = rows.length ? repairShiftedSheetRows(rows, header) : { changed: false, rows: [] };
  const existingHeader = repaired.rows.length ? repaired.rows[0].map(normalizeCell) : [];
  const targetHeader = mergeHeaders(existingHeader, [...header, ...objects.flatMap((object) => Object.keys(object))]);
  await google.setSheetRows(sheetName, objectsToRows(objects, targetHeader.length ? targetHeader : header));
  invalidateSheetRowsCache(sheetName);
}

async function readUsers() {
  const rows = await readSheetObjects(SHEETS.users, USER_COLUMNS, "users");
  return rows.map((row) => mapSheetUser(row));
}

async function writeUsers(users) {
  const rows = users.map((user) => ({
    "Full Name": user.name,
    "User Name": user.username,
    Password: user.password,
    Status: user.active === "false" ? "Inactive" : "Active",
    Role: user.role
  }));
  await writeSheetObjects(SHEETS.users, USER_COLUMNS, rows, "users");
}

async function appendUser(user) {
  const row = {
    "Full Name": user.name,
    "User Name": user.username,
    Password: user.password,
    Status: user.active === "false" ? "Inactive" : "Active",
    Role: user.role
  };
  await appendSheetObject(SHEETS.users, USER_COLUMNS, row, "users");
}

async function readOwners() {
  const rows = await readSheetObjects(SHEETS.owners, OWNER_COLUMNS, "owners");
  return rows.map((row) => ({
    name: row["Owner Name"] || "",
    phone: row["Owner Phone No"] || "",
    address: row["Owner Address"] || ""
  }));
}

async function writeOwners(owners) {
  const rows = owners.map((owner) => ({
    "Owner Name": owner.name || "",
    "Owner Phone No": owner.phone || "",
    "Owner Address": owner.address || ""
  }));
  await writeSheetObjects(SHEETS.owners, OWNER_COLUMNS, rows, "owners");
}

async function readFleetDetails() {
  const rows = await readSheetObjects(SHEETS.fleet, FLEET_COLUMNS, "fleet");
  return rows.map((row) => {
    const ownerName = row["Owner Name"] || "";
    const vehicleNumber = row["Vehicle Number"] || row["Vehicle No."] || "";
    const derivedId = normalizeCell(`${ownerName}:${vehicleNumber}`).replace(/\s+/g, "-").toUpperCase();
    return {
      fleetId: row["Fleet ID"] || derivedId || generateFleetId(),
      ownerName,
      vehicleNumber,
      vehicleCategory: row["Vehicle Category"] || "",
      vehicleType: row["Vehicle Type"] || "",
      status: row.Status || "Active",
      notes: row.Notes || ""
    };
  });
}

async function writeFleetDetails(fleetDetails) {
  const rows = fleetDetails.map((fleet) => ({
    "Fleet ID": fleet.fleetId || "",
    "Owner Name": fleet.ownerName || "",
    "Vehicle Number": fleet.vehicleNumber || "",
    "Vehicle Category": fleet.vehicleCategory || "",
    "Vehicle Type": fleet.vehicleType || "",
    Status: fleet.status || "Active",
    Notes: fleet.notes || ""
  }));
  await writeSheetObjects(SHEETS.fleet, FLEET_COLUMNS, rows, "fleet");
}

async function readReviewedEntries() {
  const rows = await readSheetObjects(SHEETS.reviewedEntries, REVIEWED_ENTRY_COLUMNS, "reviewedEntries");
  return rows.map((row) => ({
    receiptNumber: row["Receipt No."] || "",
    reviewedAt: row["Reviewed On"] || "",
    status: row["Reviewed Status"] || "Pending Review",
    reviewedBy: row["Reviewed By"] || "",
    totalAmountInclGst: row["Total Amount"] || "",
    transactionTotal: row["Transaction Total"] || "",
    transactionCount: row["Transaction Count"] || "",
    transactions: parseJsonArray(row.Transactions),
    transactionSummary: row["Transaction Summary"] || "",
    reviewerNotes: row["Reviewer Notes"] || ""
  }));
}

async function readConsolidatedEntries() {
  const rows = await readSheetObjects(SHEETS.consolidatedEntries, CONSOLIDATED_ENTRY_COLUMNS, "consolidatedEntries");
  return rows.map((row) => ({
    creditEntryId: row.CreditEntryID || "",
    formEntry: row["Form Entry"] || "",
    totalAmount: row["Total Amount"] || "",
    receivedBy: row["Received By"] || "",
    paymentMode: row["Payment Mode"] || "",
    notes: row.Notes || "",
    date: row.Date || "",
    entryMetadata: parseJsonArray(row["Entry Metadata"]),
    createdBy: row["Created By"] || "",
    createdDate: row["Created Date"] || ""
  }));
}

async function readDebitEntries() {
  const rows = await readSheetObjects(SHEETS.debitEntries, DEBIT_ENTRY_COLUMNS, "debitEntries");
  return rows.map((row) => ({
    debitEntryId: row.DebitEntryID || "",
    date: row.Date || "",
    description: row.Description || "",
    amount: row.Amount || "",
    category: row.Category || "",
    paymentMode: row["Payment Mode"] || "",
    paidTo: row["Paid To"] || "",
    notes: row.Notes || "",
    createdBy: row["Created By"] || "",
    createdDate: row["Created Date"] || ""
  }));
}

async function readEntries() {
  if (!google.enabled) return demoStore.entries;

  const [dailyRows, reviewedRows, owners] = await Promise.all([
    readSheetObjects(SHEETS.entries, DAILY_ENTRY_COLUMNS, "entries"),
    readReviewedEntries(),
    readOwners()
  ]);
  const reviewedByReceipt = new Map(reviewedRows.map((row) => [row.receiptNumber, row]));
  const ownersByName = new Map(owners.map((owner) => [owner.name, owner]));
  return dailyRows.map((row) => {
    const entry = mapDailyEntry(row, reviewedByReceipt.get(row["Receipt No."] || ""));
    const owner = ownersByName.get(entry.ownerName);
    if (owner) {
      entry.ownerPhone = owner.phone;
      entry.ownerAddress = owner.address;
    }
    return entry;
  });
}

async function readReceiptNumbers() {
  if (!google.enabled) {
    return [
      ...demoStore.receiptRegistry.map((row) => ({ receiptNumber: row["Receipt No."] || "" })),
      ...demoStore.entries.map((entry) => ({ receiptNumber: entry.receiptNumber || "" }))
    ];
  }

  const [registryRows, entryRows] = await Promise.all([
    readSheetObjects(SHEETS.receiptRegistry, RECEIPT_REGISTRY_COLUMNS, "receiptRegistry"),
    readSheetObjects(SHEETS.entries, DAILY_ENTRY_COLUMNS, "entries")
  ]);

  const seen = new Set();
  const receipts = [];

  for (const row of [...registryRows, ...entryRows]) {
    const value = normalizeCell(row["Receipt No."] || "").toUpperCase();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    receipts.push({ receiptNumber: value });
  }

  return receipts;
}

async function reserveReceiptNumber(receiptNumber, entryId, userId) {
  const reservedAt = new Date().toISOString();
  const row = {
    "Receipt No.": receiptNumber,
    "Reserved At": reservedAt,
    "Reserved By": userId || "",
    "Entry ID": entryId || ""
  };
  await appendSheetObject(SHEETS.receiptRegistry, RECEIPT_REGISTRY_COLUMNS, row, "receiptRegistry");
}

async function suggestEntryReceiptNumber(preferred = "") {
  const normalizedPreferred = normalizeCell(preferred).toUpperCase();
  const existingEntries = await readReceiptNumbers();
  ensureNoDuplicateReceiptState(existingEntries);

  if (normalizedPreferred) {
    return ensureReceiptNumberAvailable(existingEntries, normalizedPreferred);
  }

  return allocateReceiptNumber("", existingEntries);
}

async function reserveEntryReceiptNumber(preferred = "", entryId = "", userId = "") {
  const normalizedPreferred = normalizeCell(preferred).toUpperCase();
  let existingEntries = await readReceiptNumbers();
  ensureNoDuplicateReceiptState(existingEntries);

  if (normalizedPreferred) {
    const receiptNumber = ensureReceiptNumberAvailable(existingEntries, normalizedPreferred);
    await reserveReceiptNumber(receiptNumber, entryId, userId);
    const updatedEntries = await readReceiptNumbers();
    const duplicateCount = updatedEntries.filter((entry) => entry.receiptNumber.toUpperCase() === receiptNumber.toUpperCase()).length;
    if (duplicateCount > 1) {
      throw new Error(`Receipt number ${receiptNumber} was reserved by another request; please retry.`);
    }
    return receiptNumber;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = allocateReceiptNumber("", existingEntries);
    const normalizedCandidate = normalizeCell(candidate).toUpperCase();
    if (!existingEntries.some((entry) => entry.receiptNumber.toUpperCase() === normalizedCandidate)) {
      await reserveReceiptNumber(candidate, entryId, userId);
      const updatedEntries = await readReceiptNumbers();
      const duplicateCount = updatedEntries.filter((entry) => entry.receiptNumber.toUpperCase() === normalizedCandidate).length;
      if (duplicateCount === 1) {
        return candidate;
      }
      existingEntries = updatedEntries;
      continue;
    }
    existingEntries = await readReceiptNumbers();
  }

  throw new Error("Unable to allocate a unique receipt number after several attempts; please retry.");
}

async function appendEntry(entry) {
  if (!google.enabled) {
    demoStore.entries.push(entry);
    return;
  }
  await appendSheetObject(SHEETS.entries, DAILY_ENTRY_COLUMNS, entryToDailySheetRow(entry), "entries");
}

async function writeEntries(entries) {
  if (!google.enabled) {
    demoStore.entries = entries;
    return;
  }
  await writeSheetObjects(
    SHEETS.entries,
    DAILY_ENTRY_COLUMNS,
    entries.map((entry) => entryToDailySheetRow(entry)),
    "entries"
  );
}

async function upsertReviewedEntry(entry) {
  if (!google.enabled) {
    const index = demoStore.reviewedEntries.findIndex((item) => item.receiptNumber === entry.receiptNumber);
    if (index === -1) demoStore.reviewedEntries.push(entry);
    else demoStore.reviewedEntries[index] = entry;
    return;
  }

  const reviewedEntries = await readReviewedEntries();
  const index = reviewedEntries.findIndex((item) => item.receiptNumber === entry.receiptNumber);
  if (index === -1) reviewedEntries.push(entry);
  else reviewedEntries[index] = entry;

  await writeSheetObjects(
    SHEETS.reviewedEntries,
    REVIEWED_ENTRY_COLUMNS,
    reviewedEntries.map((item) => ({
      "Receipt No.": item.receiptNumber,
      "Reviewed On": item.reviewedAt,
      "Reviewed Status": item.status,
      "Reviewed By": item.reviewedBy,
      "Total Amount": item.totalAmountInclGst,
      "Transaction Total": item.transactionTotal || "",
      "Transaction Count": item.transactionCount || "",
      Transactions: JSON.stringify(item.transactions || []),
      "Transaction Summary": item.transactionSummary || "",
      "Reviewer Notes": item.reviewerNotes || ""
    })),
    "reviewedEntries"
  );
}

async function appendConsolidatedEntry(entry) {
  const row = {
    CreditEntryID: entry.creditEntryId,
    "Form Entry": entry.formEntry,
    "Total Amount": entry.totalAmount,
    "Received By": entry.receivedBy,
    "Payment Mode": entry.paymentMode,
    Notes: entry.notes || "",
    Date: entry.date,
    "Entry Metadata": JSON.stringify(entry.entryMetadata || []),
    "Created By": entry.createdBy || "",
    "Created Date": entry.createdDate || ""
  };
  await appendSheetObject(SHEETS.consolidatedEntries, CONSOLIDATED_ENTRY_COLUMNS, row, "consolidatedEntries");
}

async function appendDebitEntry(entry) {
  const row = {
    DebitEntryID: entry.debitEntryId,
    Date: entry.date,
    Description: entry.description,
    Amount: entry.amount,
    Category: entry.category,
    "Payment Mode": entry.paymentMode,
    "Paid To": entry.paidTo || "",
    Notes: entry.notes || "",
    "Created By": entry.createdBy || "",
    "Created Date": entry.createdDate || ""
  };
  await appendSheetObject(SHEETS.debitEntries, DEBIT_ENTRY_COLUMNS, row, "debitEntries");
}

function mapSheetUser(row) {
  const username = row["User Name"] || "";
  return {
    id: crypto.createHash("sha1").update(username).digest("hex").slice(0, 12),
    name: row["Full Name"] || username,
    username,
    email: username,
    password: row.Password || "",
    role: (row.Role || "staff").toLowerCase(),
    active: /^active$/i.test(row.Status || "") ? "true" : "false",
    createdAt: ""
  };
}

function needsPasswordMigration(users) {
  return users.some((user) => user.password && !isPasswordHash(user.password));
}

async function migratePlaintextPasswords(users) {
  const nextUsers = users.map((user) => ({
    ...user,
    password: isPasswordHash(user.password) ? user.password : hashPassword(user.password)
  }));
  await writeUsers(nextUsers);
  return nextUsers;
}

function mapDailyEntry(row, reviewed = null) {
  const receiptNumber = row["Receipt No."] || "";
  const reviewedTransactions = reviewed?.transactions?.length
    ? reviewed.transactions
    : [{
        id: "TX-1",
        amount: row["Mineral Amount"] || "0",
        mode: row["Payment Mode"] || "Cash",
        notes: ""
      }];
  return {
    id: receiptNumber || `EN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    receiptNumber,
    date: extractDate(row.Timestamp),
    siteName: SITE.name,
    formReason: row["Need to fill this form"] || "",
    ravannaDeducted: row["Is Ravanna Deducted"] || "",
    vehicleCategory: row["Vehicle Category"] || "",
    vehicleType: row["Vehicle Type"] || "",
    vehicleNumber: row["Vehicle No."] || "",
    driverName: row["Driver Name"] || "",
    driverPhone: row["Phone No of Driver"] || "",
    driverLicenseNumber: row["Driver License Number"] || "",
    ownerName: row["Name of Owner"] || "",
    ownerPhone: "",
    ownerAddress: "",
    entryAreaGate: row["Entry Area"] || "",
    exitAreaGate: row["Exit Area"] || "",
    tareWeightTons: row["Tare Wight"] || "",
    grossWeightTons: row["Gross Weight"] || "",
    netWeightTons: row["Net Weight"] || "",
    entryTime: row["Entry Time"] || "",
    exitTime: row["Exit Time"] || "",
    destinationName: row["Name of Destination"] || "",
    distanceKm: row["Distance to travel"] || "",
    validityTimeHours: row["Validity Time"] || "",
    amountPaid: row["Mineral Amount"] || "",
    totalAmountInclGst: row["Total Amount"] || "",
    paymentMode: row["Payment Mode"] || "Cash",
    paymentStatus: reviewed ? reviewed.status : "Pending Review",
    sandType: "River Sand",
    notes: "",
    staffNotes: "",
    status: reviewed ? reviewed.status : "Pending Review",
    createdBy: row["Created By"] || "",
    createdAt: row.Timestamp || "",
    reviewedBy: reviewed?.reviewedBy || "",
    reviewedAt: reviewed?.reviewedAt || "",
    reviewerNotes: reviewed?.reviewerNotes || "",
    transactions: reviewedTransactions,
    transactionSummary: reviewed?.transactionSummary || transactionSummary(reviewedTransactions),
    transactionTotal: reviewed?.transactionTotal || String(transactionTotal(reviewedTransactions)),
    driverPhotoUrl: row["Driver Photo"] || "",
    numberPlatePhotoUrl: row["Vehicle Number Plate Photo"] || "",
    sideViewPhotoUrl: row["Side View Photo"] || "",
    frontViewPhotoUrl: row["Front View Photo"] || "",
    driveFileId: "",
    driveFileUrl: "",
    grossAmount: row["Mineral Amount"] || ""
  };
}

function entryToDailySheetRow(entry) {
  return {
    "Receipt No.": entry.receiptNumber,
    Timestamp: entry.createdAt || new Date().toISOString(),
    "Need to fill this form": entry.formReason,
    "Is Ravanna Deducted": entry.ravannaDeducted,
    "Vehicle Category": entry.vehicleCategory || "",
    "Vehicle Type": entry.vehicleType,
    "Vehicle No.": entry.vehicleNumber,
    "Driver Name": entry.driverName,
    "Phone No of Driver": entry.driverPhone,
    "Driver License Number": entry.driverLicenseNumber,
    "Name of Owner": entry.ownerName,
    "Entry Area": entry.entryAreaGate,
    "Exit Area": entry.exitAreaGate,
    "Entry Time": entry.entryTime,
    "Exit Time": entry.exitTime,
    "Tare Wight": entry.tareWeightTons,
    "Gross Weight": entry.grossWeightTons,
    "Net Weight": entry.netWeightTons,
    "Name of Destination": entry.destinationName,
    "Distance to travel": entry.distanceKm,
    "Validity Time": entry.validityTimeHours,
    "Mineral Amount": entry.amountPaid,
    "Total Amount": entry.totalAmountInclGst,
    "Payment Mode": entry.paymentMode,
    "Created By": entry.createdBy || "",
    "Driver Photo": entry.driverPhotoUrl,
    "Vehicle Number Plate Photo": entry.numberPlatePhotoUrl,
    "Side View Photo": entry.sideViewPhotoUrl,
    "Front View Photo": entry.frontViewPhotoUrl
  };
}

function extractDate(value) {
  const raw = normalizeCell(value);
  const match = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  if (!raw) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function makeSession(user) {
  const payload = base64Url(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 10
  }));
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function parseSession(req) {
  const cookie = (req.headers.cookie || "").split(";").map((part) => part.trim()).find((part) => part.startsWith("trackly_session="));
  if (!cookie) return null;
  const token = decodeURIComponent(cookie.split("=")[1] || "");
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  if (Buffer.byteLength(sig) !== Buffer.byteLength(expected)) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const user = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  if (user.exp < Date.now()) return null;
  return user;
}

function requireRole(user, roles) {
  return user && roles.includes(user.role);
}

const MAX_JSON_BODY_SIZE = 25 * 1024 * 1024;

async function readJson(req) {
  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength && Number.isFinite(contentLength) && contentLength > MAX_JSON_BODY_SIZE) {
    const error = new Error("Request body too large");
    error.status = 413;
    throw error;
  }

  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body, "utf8") > MAX_JSON_BODY_SIZE) {
      const error = new Error("Request body too large");
      error.status = 413;
      throw error;
    }
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (error) {
    const parseError = new Error("Invalid JSON in request body");
    parseError.status = 400;
    throw parseError;
  }
}

async function parseMultipartForm(req) {
  const form = formidable({
    multiples: false,
    maxFileSize: MAX_PHOTO_SIZE_BYTES,
    keepExtensions: false,
    filter: ({ name, originalFilename }) => Boolean(name && originalFilename)
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        const error = new Error(`Multipart form parsing failed: ${err.message}`);
        error.status = err.httpCode || 400;
        return reject(error);
      }

      const payload = {};
      for (const [key, value] of Object.entries(fields || {})) {
        payload[key] = Array.isArray(value) ? value[0] : value;
      }

      const filePromises = [];
      const photoPayload = {};

      for (const [key, fileValue] of Object.entries(files || {})) {
        const file = Array.isArray(fileValue) ? fileValue[0] : fileValue;
        if (!file || !file.filepath) continue;

        const promise = fs.promises.readFile(file.filepath).then((buffer) => {
          photoPayload[key] = {
            name: file.originalFilename || key,
            mimeType: file.mimetype || file.type || "application/octet-stream",
            buffer
          };
        });
        filePromises.push(promise);
      }

      Promise.all(filePromises)
        .then(() => {
          payload.photos = photoPayload;
          resolve(payload);
        })
        .catch(reject);
    });
  });
}

async function parseJsonOrForm(req) {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (contentType.startsWith("multipart/form-data")) {
    return parseMultipartForm(req);
  }
  return readJson(req);
}

function send(res, status, data, headers = {}) {
  const isString = typeof data === "string";
  const body = isString ? data : JSON.stringify(data);
  res.writeHead(status, {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "Content-Type": isString ? "text/html; charset=utf-8" : "application/json; charset=utf-8",
    ...headers
  });
  res.end(body);
}

function sendError(res, status, message) {
  const context = res._tracklyLogContext || {};
  logEvent(status >= 500 ? "error" : "warn", "API request failed", {
    ...context,
    status,
    errorMessage: message
  });
  send(res, status, { error: message });
}

function normalizeEntry(input, user, existing = {}) {
  const quantity = Number(input.quantityCft || existing.quantityCft || 0);
  const rate = Number(input.ratePerCft || existing.ratePerCft || 0);
  const tareWeight = Number(input.tareWeightTons || existing.tareWeightTons || 0);
  const grossWeight = Number(input.grossWeightTons || existing.grossWeightTons || 0);
  const netWeight = Number(input.netWeightTons || existing.netWeightTons || Math.max(0, grossWeight - tareWeight));
  const transactions = normalizeTransactions(input.transactions, existing);
  const paidTotal = transactionTotal(transactions);
  const amountPaid = Number(input.amountPaid || paidTotal || existing.amountPaid || 0);
  const totalAmountInclGst = Number(input.totalAmountInclGst || existing.totalAmountInclGst || amountPaid * 1.18);
  return {
    ...existing,
    id: existing.id || `EN-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
    receiptNumber: (existing.receiptNumber || input.receiptNumber || "").toUpperCase(),
    date: input.date || existing.date || new Date().toISOString().slice(0, 10),
    siteName: input.siteName || existing.siteName || SITE.name,
    formReason: input.formReason || existing.formReason || "",
    ravannaDeducted: input.ravannaDeducted || existing.ravannaDeducted || "",
    vehicleCategory: input.vehicleCategory || existing.vehicleCategory || "",
    vehicleNumber: (input.vehicleNumber || existing.vehicleNumber || "").toUpperCase(),
    vehicleType: input.vehicleType || existing.vehicleType || "",
    driverName: input.driverName || existing.driverName || "",
    driverPhone: input.driverPhone || existing.driverPhone || "",
    driverLicenseNumber: input.driverLicenseNumber || existing.driverLicenseNumber || "",
    ownerName: input.ownerName || existing.ownerName || "",
    ownerPhone: input.ownerPhone || existing.ownerPhone || "",
    ownerAddress: input.ownerAddress || existing.ownerAddress || "",
    entryAreaGate: input.entryAreaGate || existing.entryAreaGate || "",
    exitAreaGate: input.exitAreaGate || existing.exitAreaGate || "",
    tareWeightTons: String(tareWeight),
    grossWeightTons: String(grossWeight),
    netWeightTons: String(netWeight),
    entryTime: input.entryTime || existing.entryTime || "",
    exitTime: input.exitTime || existing.exitTime || "",
    destinationName: input.destinationName || existing.destinationName || "",
    distanceKm: input.distanceKm || existing.distanceKm || "",
    validityTimeHours: input.validityTimeHours || existing.validityTimeHours || "",
    amountPaid: String(amountPaid),
    totalAmountInclGst: String(totalAmountInclGst),
    customerName: input.customerName || existing.customerName || "",
    sandType: input.sandType || existing.sandType || "River Sand",
    quantityCft: String(quantity),
    ratePerCft: String(rate),
    royaltyPassNumber: input.royaltyPassNumber || existing.royaltyPassNumber || "",
    grossAmount: String(quantity * rate),
    paymentMode: transactions.length === 1 ? transactions[0].mode : (input.paymentMode || existing.paymentMode || "Multiple"),
    paymentStatus: input.paymentStatus || existing.paymentStatus || "Pending",
    notes: input.notes ?? existing.notes ?? "",
    staffNotes: input.staffNotes ?? existing.staffNotes ?? "",
    status: input.status || existing.status || "Pending Review",
    createdBy: existing.createdBy || user.name || user.username || user.email,
    createdAt: existing.createdAt || new Date().toISOString(),
    reviewedBy: existing.reviewedBy || "",
    reviewedAt: existing.reviewedAt || "",
    reviewerNotes: input.reviewerNotes ?? existing.reviewerNotes ?? "",
    transactions,
    transactionSummary: transactionSummary(transactions),
    transactionTotal: String(paidTotal),
    driverPhotoUrl: existing.driverPhotoUrl || "",
    numberPlatePhotoUrl: existing.numberPlatePhotoUrl || "",
    sideViewPhotoUrl: existing.sideViewPhotoUrl || "",
    frontViewPhotoUrl: existing.frontViewPhotoUrl || "",
    driveFileId: existing.driveFileId || "",
    driveFileUrl: existing.driveFileUrl || ""
  };
}

function publicEntry(entry) {
  return {
    ...entry,
    transactions: Array.isArray(entry.transactions) ? entry.transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount || 0)
    })) : [],
    grossAmount: Number(entry.grossAmount || 0),
    quantityCft: Number(entry.quantityCft || 0),
    ratePerCft: Number(entry.ratePerCft || 0),
    tareWeightTons: Number(entry.tareWeightTons || 0),
    grossWeightTons: Number(entry.grossWeightTons || 0),
    netWeightTons: Number(entry.netWeightTons || 0),
    amountPaid: Number(entry.amountPaid || 0),
    totalAmountInclGst: Number(entry.totalAmountInclGst || 0),
    transactionTotal: Number(entry.transactionTotal || 0)
  };
}

async function processEntryPhotos(entry, input, requestMeta = {}) {
  const photos = input.photos || {};
  validatePhotoUploads(photos, requestMeta);
  const photoMap = {
    driverPhoto: "driverPhotoUrl",
    numberPlatePhoto: "numberPlatePhotoUrl",
    sideViewPhoto: "sideViewPhotoUrl",
    frontViewPhoto: "frontViewPhotoUrl"
  };
  let driveReceiptFolderId = "";
  if (google.enabled && Object.keys(photoMap).some((key) => photos[key]?.buffer)) {
    const folder = await google.ensureReceiptFolder(entry.receiptNumber);
    driveReceiptFolderId = folder.id || "";
  }
  for (const [inputKey, entryKey] of Object.entries(photoMap)) {
    const photo = photos[inputKey];
    if (!photo || !photo.buffer) continue;
    if (!google.enabled) {
      entry[entryKey] = `Demo upload: ${photo.name || inputKey}`;
      logEvent("info", "Photo accepted in demo mode", {
        ...requestMeta,
        entryId: entry.id,
        receiptNumber: entry.receiptNumber,
        photoKey: inputKey,
        photoName: photo.name || inputKey
      });
      continue;
    }
    const safeName = (photo.name || `${inputKey}.jpg`).replace(/[^a-z0-9._-]/gi, "_");
    try {
      const uploaded = await google.uploadBuffer(
        `${entry.receiptNumber}-${inputKey}-${safeName}`,
        photo.mimeType || "application/octet-stream",
        photo.buffer,
        driveReceiptFolderId || undefined
      );
      entry[entryKey] = uploaded.webViewLink || "";
      logEvent("info", "Photo uploaded to Google Drive", {
        ...requestMeta,
        entryId: entry.id,
        receiptNumber: entry.receiptNumber,
        photoKey: inputKey,
        photoName: safeName,
        driveFolderId: driveReceiptFolderId,
        driveFileUrl: uploaded.webViewLink || ""
      });
    } catch (error) {
      logEvent("error", "Photo upload failed", {
        ...requestMeta,
        entryId: entry.id,
        receiptNumber: entry.receiptNumber,
        photoKey: inputKey,
        photoName: safeName,
        error: serializeError(error)
      });
      throw error;
    }
  }
  return entry;
}

async function audit(entryId, user, action, details = "") {
  if (google.enabled) return;
  demoStore.audit.push({
    id: crypto.randomUUID(),
    entryId,
    actorEmail: user.email,
    action,
    details,
    createdAt: new Date().toISOString()
  });
}

async function applyOwnerDetails(entry) {
  const owners = await readOwners();
  const owner = owners.find((item) => item.name === entry.ownerName);
  if (!owner) return entry;
  return {
    ...entry,
    ownerPhone: owner.phone || entry.ownerPhone || "",
    ownerAddress: owner.address || entry.ownerAddress || ""
  };
}

async function printablePhotos(entry) {
  const photos = [
    ["Driver", entry.driverPhotoUrl],
    ["Number Plate", entry.numberPlatePhotoUrl],
    ["Side View", entry.sideViewPhotoUrl],
    ["Front View", entry.frontViewPhotoUrl]
  ].filter(([, value]) => value);

  if (!google.enabled) return photos;

  const resolved = await Promise.all(photos.map(async ([label, value]) => {
    const fileId = extractDriveFileId(value);
    if (!fileId) return [label, value];
    try {
      const file = await google.downloadDriveFile(fileId);
      return [label, `data:${file.contentType};base64,${file.buffer.toString("base64")}`];
    } catch {
      return [label, value];
    }
  }));
  return resolved;
}

async function entryHtml(entry) {
  const contractLines = [
    "Marketing, Sieving & Transportation Contract",
    "of S&G Pvt. Ltd.",
    "GSTN: 08AANCA9021D1ZS"
  ];
  const photos = await printablePhotos(entry);
  const rows = [
    ["Entry ID", entry.id],
    ["Receipt Number", entry.receiptNumber],
    ["Date", entry.date],
    ["Site", `${entry.siteName} - ${SITE.detail}`],
    ["Need to fill this form", entry.formReason],
    ["Is Ravanna Deducted", entry.ravannaDeducted],
    ["Vehicle", entry.vehicleNumber],
    ["Vehicle Type", entry.vehicleType],
    ["Driver", entry.driverName],
    ["Driver Phone", entry.driverPhone],
    ["Driver License", entry.driverLicenseNumber],
    ["Owner", entry.ownerName],
    ["Owner Phone", entry.ownerPhone],
    ["Owner Address", entry.ownerAddress],
    ["Entry Area / Gate", entry.entryAreaGate],
    ["Exit Area / Gate", entry.exitAreaGate],
    ["Tare Weight (Tons)", entry.tareWeightTons],
    ["Gross Weight (Tons)", entry.grossWeightTons],
    ["Net Weight (Tons)", entry.netWeightTons],
    ["Entry Time", entry.entryTime],
    ["Exit Time", entry.exitTime],
    ["Destination", entry.destinationName],
    ["Distance (km)", entry.distanceKm],
    ["Validity Time (hrs)", entry.validityTimeHours],
    ["Amount Paid", `Rs. ${entry.amountPaid}`],
    ["Total Amount incl. GST", `Rs. ${entry.totalAmountInclGst}`],
    ["Sand Type", entry.sandType],
    ["Quantity (CFT)", entry.quantityCft],
    ["Rate / CFT", entry.ratePerCft],
    ["Gross Amount", `Rs. ${entry.grossAmount}`],
    ["Royalty Pass", entry.royaltyPassNumber],
    ["Payment", `${entry.paymentMode} - ${entry.paymentStatus}`],
    ["Transactions", entry.transactionSummary || transactionSummary(entry.transactions || [])],
    ["Notes", entry.notes],
    ["Status", entry.status],
    ["Staff Notes", entry.staffNotes],
    ["Reviewer Notes", entry.reviewerNotes],
    ["Created By", entry.createdBy],
    ["Reviewed By", entry.reviewedBy || "-"]
  ];
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(entry.id)}</title><style>
    body{font-family:Arial,sans-serif;margin:32px;color:#17202a}.brand{border-bottom:3px solid #0f766e;padding-bottom:12px;margin-bottom:20px}
    .brand-row{display:flex;gap:16px;align-items:center}.brand-row img{width:180px;height:auto;background:#fff}.brand-copy{display:grid;gap:4px}
    .brand-copy h1{margin:0;font-size:24px}.brand-copy .meta{margin-top:0}.contract{color:#475467;font-size:13px;font-weight:700}
    .contract span{display:block}
    .trackly{font-size:18px;font-weight:800;color:#0f766e;margin-bottom:6px}
    .meta{color:#566573;margin-top:4px}table{border-collapse:collapse;width:100%;margin-top:16px}
    td{border:1px solid #d5d8dc;padding:10px}td:first-child{background:#f4f6f7;font-weight:700;width:34%}.stamp{margin-top:28px;font-size:12px;color:#566573}
    .photo-section{margin-top:18px}.photo-section h2{font-size:16px;margin:0 0 10px}.photo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .photo-card{display:grid;gap:6px}.photo-card span{font-size:12px;color:#566573;font-weight:700}.photo-card img{width:100%;height:200px;object-fit:cover;border:1px solid #d5d8dc;border-radius:8px}
  </style></head><body><div class="brand"><div class="brand-row"><img src="${PUBLIC_BASE_URL}/akshay-infrasys-logo.png" alt="Akshay Infrasys"><div class="brand-copy"><div class="trackly">Trackly</div><div class="contract">${contractLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</div></div></div></div>
  <table>${rows.map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(String(value || ""))}</td></tr>`).join("")}</table>
  ${photos.length ? `<div class="photo-section"><h2>Photos</h2><div class="photo-grid">${photos.map(([label, value]) => `<div class="photo-card"><span>${escapeHtml(label)}</span><img src="${escapeHtml(toPrintablePhotoUrl(value))}" alt="${escapeHtml(label)}"></div>`).join("")}</div></div>` : ""}
  <div class="stamp">Generated on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div><script>window.print()</script></body></html>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function extractDriveFileId(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/\/file\/d\/([^/]+)\//);
  return match ? match[1] : "";
}

function toPrintablePhotoUrl(value) {
  if (String(value || "").startsWith("data:")) return String(value);
  const fileId = extractDriveFileId(value);
  return fileId ? `${PUBLIC_BASE_URL}/api/drive-image/${fileId}` : String(value || "").trim();
}

function isRevenueEligibleEntry(entry) {
  return String(entry?.status || "").trim() === "Approved";
}

function analytics(entries) {
  const approved = entries.filter(isRevenueEligibleEntry);
  const totals = approved.reduce((acc, entry) => {
    const revenue = Number(entry.totalAmountInclGst || entry.grossAmount || 0);
    acc.revenue += revenue;
    acc.quantity += Number(entry.netWeightTons || entry.quantityCft || 0);
    acc.loads += 1;
    const date = entry.date || "Unknown";
    const month = date.slice(0, 7);
    acc.daily[date] = (acc.daily[date] || 0) + revenue;
    acc.monthly[month] = (acc.monthly[month] || 0) + revenue;
    acc.bySandType[entry.sandType] = (acc.bySandType[entry.sandType] || 0) + revenue;
    return acc;
  }, { revenue: 0, quantity: 0, loads: 0, daily: {}, monthly: {}, bySandType: {} });
  return totals;
}

async function handleApi(req, res, user, pathname) {
  if (pathname === "/api/config/status") {
    return send(res, 200, {
      googleConnected: google.enabled,
      demoMode: !google.enabled,
      site: SITE,
      credentialsSource: google.credentialsSource,
      runtimeDiagnostics: google.runtimeDiagnostics(),
      sheetId: google.sheetId || null,
      driveFolderId: google.driveFolderId || null
    });
  }

  if (pathname === "/api/config/health") {
    const health = await google.healthCheck();
    return send(res, 200, health);
  }

  if (pathname === "/api/auth/me") {
    return send(res, 200, { user });
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    return send(res, 200, { ok: true }, { "Set-Cookie": "trackly_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/" });
  }

  if (pathname === "/api/auth/login" && req.method === "POST") {
    const { email, username, password } = await readJson(req);
    let users = await readUsers();
    if (google.enabled && users.length === 0) {
      const defaultUsername = (process.env.ADMIN_EMAIL || "admin").split("@")[0];
      const admin = seededUser("Admin", defaultUsername, process.env.ADMIN_PASSWORD || "admin123", "admin");
      await appendUser(admin);
      users = [admin];
    }
    const identifier = String(username || email || "").toLowerCase();
    const found = users.find((item) => item.username.toLowerCase() === identifier && verifyPassword(password, item.password) && item.active !== "false");
    if (!found) return sendError(res, 401, "Invalid email or password");
    if (needsPasswordMigration(users)) {
      users = await migratePlaintextPasswords(users);
    }
    const safeUser = { id: found.id, name: found.name, username: found.username, email: found.email, role: found.role };
    return send(res, 200, { user: safeUser }, { "Set-Cookie": `trackly_session=${encodeURIComponent(makeSession(safeUser))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=36000` });
  }

  if (!user) return sendError(res, 401, "Login required");

  if (pathname === "/api/owners" && req.method === "GET") {
    return send(res, 200, { owners: await readOwners() });
  }

  if (pathname === "/api/owners" && req.method === "POST") {
    if (!requireRole(user, ["admin", "reviewer"])) return sendError(res, 403, "Only admins can manage owners");
    const input = await readJson(req);
    const owners = await readOwners();
    const name = String(input.name || "").trim();
    const phone = String(input.phone || "").trim();
    const address = String(input.address || "").trim();
    if (!name) return sendError(res, 400, "Owner name is required");
    const duplicate = owners.find((owner) => owner.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return sendError(res, 400, "Owner already exists");
    const owner = { name, phone, address };
    owners.push(owner);
    await writeOwners(owners);
    return send(res, 201, { owner });
  }

  const ownerMatch = pathname.match(/^\/api\/owners\/(.+)$/);
  if (ownerMatch && req.method === "PATCH") {
    if (!requireRole(user, ["admin","reviewer"])) return sendError(res, 403, "Only admins can manage owners");
    const owners = await readOwners();
    const currentName = decodeURIComponent(ownerMatch[1]);
    const index = owners.findIndex((owner) => owner.name === currentName);
    if (index === -1) return sendError(res, 404, "Owner not found");
    const input = await readJson(req);
    const nextName = String(input.name || owners[index].name).trim();
    if (!nextName) return sendError(res, 400, "Owner name is required");
    const duplicate = owners.find((owner, ownerIndex) => ownerIndex !== index && owner.name.toLowerCase() === nextName.toLowerCase());
    if (duplicate) return sendError(res, 400, "Another owner already uses this name");
    owners[index] = {
      name: nextName,
      phone: String(input.phone ?? owners[index].phone).trim(),
      address: String(input.address ?? owners[index].address).trim()
    };
    await writeOwners(owners);
    if (currentName !== nextName) {
      const fleetDetails = await readFleetDetails();
      let fleetChanged = false;
      const nextFleetDetails = fleetDetails.map((fleet) => {
        if (fleet.ownerName !== currentName) return fleet;
        fleetChanged = true;
        return { ...fleet, ownerName: nextName };
      });
      if (fleetChanged) await writeFleetDetails(nextFleetDetails);
    }
    return send(res, 200, { owner: owners[index] });
  }

  if (pathname === "/api/fleet" && req.method === "GET") {
    return send(res, 200, { fleetDetails: await readFleetDetails() });
  }

  if (pathname === "/api/fleet" && req.method === "POST") {
    if (!requireRole(user, ["admin", "reviewer"])) return sendError(res, 403, "Only admins and reviewers can manage fleet details");
    const input = await readJson(req);
    const fleetDetails = await readFleetDetails();
    const ownerName = String(input.ownerName || "").trim();
    const vehicleNumber = String(input.vehicleNumber || "").trim().toUpperCase();
    if (!ownerName) return sendError(res, 400, "Owner name is required");
    if (!vehicleNumber) return sendError(res, 400, "Vehicle number is required");
    const duplicate = fleetDetails.find((fleet) => normalizeCell(fleet.vehicleNumber).toUpperCase() === vehicleNumber);
    if (duplicate) return sendError(res, 400, "Vehicle number already exists in fleet details");
    const fleet = {
      fleetId: allocateFleetId(fleetDetails),
      ownerName,
      vehicleNumber,
      vehicleCategory: String(input.vehicleCategory || "").trim(),
      vehicleType: String(input.vehicleType || "").trim(),
      status: String(input.status || "Active").trim(),
      notes: String(input.notes || "").trim()
    };
    fleetDetails.push(fleet);
    await writeFleetDetails(fleetDetails);
    return send(res, 201, { fleet });
  }

  const fleetMatch = pathname.match(/^\/api\/fleet\/([^/]+)$/);
  if (fleetMatch && req.method === "PATCH") {
    if (!requireRole(user, ["admin", "reviewer"])) return sendError(res, 403, "Only admins and reviewers can manage fleet details");
    const fleetDetails = await readFleetDetails();
    const index = fleetDetails.findIndex((fleet) => fleet.fleetId === fleetMatch[1]);
    if (index === -1) return sendError(res, 404, "Fleet record not found");
    const input = await readJson(req);
    const nextVehicleNumber = String(input.vehicleNumber ?? fleetDetails[index].vehicleNumber).trim().toUpperCase();
    if (!String(input.ownerName ?? fleetDetails[index].ownerName).trim()) return sendError(res, 400, "Owner name is required");
    if (!nextVehicleNumber) return sendError(res, 400, "Vehicle number is required");
    const duplicate = fleetDetails.find((fleet, fleetIndex) => fleetIndex !== index && normalizeCell(fleet.vehicleNumber).toUpperCase() === nextVehicleNumber);
    if (duplicate) return sendError(res, 400, "Another fleet record already uses this vehicle number");
    fleetDetails[index] = {
      ...fleetDetails[index],
      ownerName: String(input.ownerName ?? fleetDetails[index].ownerName).trim(),
      vehicleNumber: nextVehicleNumber,
      vehicleCategory: String(input.vehicleCategory ?? fleetDetails[index].vehicleCategory).trim(),
      vehicleType: String(input.vehicleType ?? fleetDetails[index].vehicleType).trim(),
      status: String(input.status ?? fleetDetails[index].status).trim(),
      notes: String(input.notes ?? fleetDetails[index].notes).trim()
    };
    await writeFleetDetails(fleetDetails);
    return send(res, 200, { fleet: fleetDetails[index] });
  }

  if (pathname === "/api/entries/next-receipt" && req.method === "GET") {
    try {
      const receiptNumber = await suggestEntryReceiptNumber();
      return send(res, 200, { receiptNumber });
    } catch (error) {
      logEvent("error", "Failed to suggest receipt number", {
        route: pathname,
        method: req.method,
        requestId: req.requestId,
        actor: user?.email || user?.username || "",
        error: serializeError(error)
      });
      return sendError(res, 500, "Unable to allocate next receipt number. Please retry.");
    }
  }

  if (pathname === "/api/entries" && req.method === "GET") {
    const entries = (await readEntries()).map(publicEntry);
    return send(res, 200, { entries });
  }

  if (pathname === "/api/entries" && req.method === "POST") {
    if (!requireRole(user, ["staff", "admin"])) return sendError(res, 403, "Only staff can create entries");
    const input = await parseJsonOrForm(req);
    const entryId = crypto.randomUUID();
    const receiptNumber = await reserveEntryReceiptNumber(input.receiptNumber || "", entryId, user?.email || user?.username || "");
    const requestMeta = {
      requestId: req.requestId,
      route: pathname,
      method: req.method,
      actor: user?.email || user?.username || "",
      receiptNumber
    };
    const entry = await applyOwnerDetails(await processEntryPhotos(
      normalizeEntry({
        ...input,
        receiptNumber,
        id: entryId
      }, user),
      input,
      requestMeta
    ));
    entry.id = entryId;
    const currentEntries = await readSheetObjects(SHEETS.entries, DAILY_ENTRY_COLUMNS, "entries");
    if (currentEntries.some((row) => normalizeCell(row["Receipt No."] || "").toUpperCase() === normalizeCell(receiptNumber).toUpperCase())) {
      throw new Error(`Receipt number ${receiptNumber} already exists; please retry.`);
    }
    await appendEntry(entry);
    await audit(entry.id, user, "created");
    logEvent("info", "Entry created", {
      ...requestMeta,
      entryId: entry.id,
      ownerName: entry.ownerName,
      vehicleNumber: entry.vehicleNumber
    });
    const nextReceiptNumber = await suggestEntryReceiptNumber();
    return send(res, 201, { entry: publicEntry(entry), nextReceiptNumber });
  }

  const driveImageMatch = pathname.match(/^\/api\/drive-image\/([^/]+)$/);
  if (driveImageMatch && req.method === "GET") {
    if (!google.enabled) return sendError(res, 404, "Drive image not available");
    const file = await google.downloadDriveFile(driveImageMatch[1]);
    res.writeHead(200, {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Type": file.contentType
    });
    res.end(file.buffer);
    return;
  }

  if (pathname === "/api/debit-entries" && req.method === "GET") {
    return send(res, 200, { debitEntries: await readDebitEntries() });
  }

  if (pathname === "/api/consolidated-entries" && req.method === "GET") {
    return send(res, 200, { consolidatedEntries: await readConsolidatedEntries() });
  }

  if (pathname === "/api/debit-entries" && req.method === "POST") {
    if (!requireRole(user, ["reviewer", "admin"])) return sendError(res, 403, "Only reviewers can create debit entries");
    const input = await readJson(req);
    const debitEntries = await readDebitEntries();
    const createdDate = new Date().toISOString().slice(0, 10);
    const debitEntry = {
      debitEntryId: allocateDebitEntryId(debitEntries),
      date: String(input.date || new Date().toISOString().slice(0, 10)),
      description: String(input.description || "").trim(),
      amount: String(Number(input.amount || 0)),
      category: String(input.category || "Miscellaneous").trim(),
      paymentMode: String(input.paymentMode || "Cash").trim(),
      paidTo: String(input.paidTo || "").trim(),
      notes: String(input.notes || "").trim(),
      createdBy: user.name || user.username || user.email,
      createdDate
    };
    if (!debitEntry.description) return sendError(res, 400, "Description is required");
    if (!Number.isFinite(Number(debitEntry.amount)) || Number(debitEntry.amount) <= 0) {
      return sendError(res, 400, "Amount must be greater than 0");
    }
    await appendDebitEntry(debitEntry);
    return send(res, 201, { debitEntry });
  }

  if (pathname === "/api/consolidated-entries" && req.method === "POST") {
    if (!requireRole(user, ["reviewer", "admin"])) return sendError(res, 403, "Only reviewers can create consolidated credits");
    const input = await readJson(req);
    const entries = await readEntries();
    const consolidatedEntries = await readConsolidatedEntries();
    const entryIds = Array.isArray(input.entryIds) ? input.entryIds.map((value) => String(value)) : [];
    const selectedEntries = entries.filter((entry) => entryIds.includes(entry.id));
    if (!selectedEntries.length) return sendError(res, 400, "Select at least one entry");

    const creditEntryId = allocateCreditEntryId(consolidatedEntries);
    const formEntry = selectedEntries.map((entry) => entry.receiptNumber || entry.id).join(", ");
    const createdDate = new Date().toISOString().slice(0, 10);
    const entryMetadata = selectedEntries.map((entry) => ({
      receiptNo: entry.receiptNumber || entry.id,
      totalAmount: Number(entry.totalAmountInclGst || entry.grossAmount || 0),
      paymentMode: entry.paymentMode || "",
      vehicleCategory: entry.vehicleCategory || "",
      ownerName: entry.ownerName || ""
    }));
    const consolidatedEntry = {
      creditEntryId,
      formEntry,
      totalAmount: String(Number(input.totalAmount || 0)),
      receivedBy: String(input.receivedBy || "").trim(),
      paymentMode: String(input.paymentMode || "Cash").trim(),
      notes: String(input.notes || "").trim(),
      date: new Date().toISOString().slice(0, 10),
      entryMetadata,
      createdBy: user.name || user.username || user.email,
      createdDate
    };
    if (!consolidatedEntry.receivedBy) return sendError(res, 400, "Received By is required");
    if (!Number.isFinite(Number(consolidatedEntry.totalAmount)) || Number(consolidatedEntry.totalAmount) <= 0) {
      return sendError(res, 400, "Total Amount must be greater than 0");
    }

    await appendConsolidatedEntry(consolidatedEntry);
    return send(res, 201, { consolidatedEntry });
  }

  const entryMatch = pathname.match(/^\/api\/entries\/([^/]+)(?:\/(review|download))?$/);
  if (entryMatch) {
    const [, entryId, action] = entryMatch;
    const entries = await readEntries();
    const index = entries.findIndex((entry) => entry.id === entryId);
    if (index === -1) return sendError(res, 404, "Entry not found");

    if (action === "download" && req.method === "GET") {
      return send(res, 200, await entryHtml(entries[index]), {
        "Content-Disposition": `inline; filename="${entries[index].id}.html"`
      });
    }

    if (action === "review" && req.method === "POST") {
      if (!requireRole(user, ["reviewer", "admin"])) return sendError(res, 403, "Only reviewers can approve entries");
      const input = await readJson(req);
      ensureNoDuplicateReceiptState(entries, entries[index].id);
      const updated = await applyOwnerDetails(normalizeEntry({ ...input, status: input.status || "Approved" }, user, entries[index]));
      updated.reviewedBy = user.email;
      updated.reviewedAt = new Date().toISOString();
      updated.status = input.status || "Approved";
      const html = await entryHtml(updated);
      if (google.enabled) {
        const file = await google.uploadHtml(`${updated.id}.html`, html);
        updated.driveFileId = file.id || "";
        updated.driveFileUrl = file.webViewLink || "";
      }
      entries[index] = updated;
      await writeEntries(entries);
      await upsertReviewedEntry({
        receiptNumber: updated.receiptNumber,
        reviewedAt: updated.reviewedAt,
        status: updated.status,
        reviewedBy: updated.reviewedBy,
        totalAmountInclGst: updated.totalAmountInclGst,
        transactionTotal: updated.transactionTotal,
        transactionCount: String((updated.transactions || []).length),
        transactions: updated.transactions || [],
        transactionSummary: updated.transactionSummary || "",
        reviewerNotes: updated.reviewerNotes || ""
      });
      await audit(updated.id, user, `reviewed:${updated.status}`, input.reviewerNotes || "");
      return send(res, 200, { entry: publicEntry(updated) });
    }

    if (req.method === "PATCH") {
      if (!requireRole(user, ["reviewer", "admin"])) return sendError(res, 403, "Only reviewers can edit entries");
      const input = await parseJsonOrForm(req);
      ensureNoDuplicateReceiptState(entries, entries[index].id);
      const nextReceiptNumber = input.receiptNumber
        ? ensureReceiptNumberAvailable(entries, input.receiptNumber, entries[index].id)
        : entries[index].receiptNumber;
      const updated = await applyOwnerDetails(await processEntryPhotos(
        normalizeEntry({ ...input, receiptNumber: nextReceiptNumber }, user, entries[index]),
        input
      ));
      entries[index] = updated;
      await writeEntries(entries);
      await audit(updated.id, user, "edited");
      return send(res, 200, { entry: publicEntry(updated) });
    }
  }

  if (pathname === "/api/analytics" && req.method === "GET") {
    if (!requireRole(user, ["analyst", "admin"])) return sendError(res, 403, "Only analysts can view analytics");
    return send(res, 200, analytics(await readEntries()));
  }

  if (pathname === "/api/users" && req.method === "GET") {
    if (!requireRole(user, ["admin", "reviewer"])) return sendError(res, 403, "Only admins and reviewers can manage users");
    const users = (await readUsers()).map(({ password, ...item }) => item);
    return send(res, 200, { users });
  }

  if (pathname === "/api/users" && req.method === "POST") {
    if (!requireRole(user, ["admin", "reviewer"])) return sendError(res, 403, "Only admins and reviewers can manage users");
    const input = await readJson(req);
    const username = String(input.username || input.email || "").trim();
    const fullName = String(input.name || input.fullName || username).trim();
    const rawPassword = input.password || crypto.randomBytes(6).toString("hex");
    const newUser = {
      id: crypto.createHash("sha1").update(username).digest("hex").slice(0, 12),
      name: fullName,
      username,
      email: username,
      password: hashPassword(rawPassword),
      role: input.role || "staff",
      active: String(input.active || "true"),
      createdAt: new Date().toISOString()
    };
    await appendUser(newUser);
    return send(res, 201, { user: { ...newUser, password: undefined }, temporaryPassword: rawPassword });
  }

  const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && req.method === "PATCH") {
    if (!requireRole(user, ["admin", "reviewer"])) return sendError(res, 403, "Only admins and reviewers can manage users");
    const users = await readUsers();
    const index = users.findIndex((item) => item.id === userMatch[1]);
    if (index === -1) return sendError(res, 404, "User not found");
    const input = await readJson(req);
    users[index] = {
      ...users[index],
      name: input.name ?? users[index].name,
      username: input.username ?? users[index].username,
      email: input.username ?? users[index].email,
      role: input.role ?? users[index].role,
      active: input.active ?? users[index].active
    };
    await writeUsers(users);
    const { password: _password, ...safeUser } = users[index];
    return send(res, 200, { user: safeUser });
  }

  const userResetMatch = pathname.match(/^\/api\/users\/([^/]+)\/reset-password$/);
  if (userResetMatch && req.method === "POST") {
    if (!requireRole(user, ["admin", "reviewer"])) return sendError(res, 403, "Only admins and reviewers can manage users");
    const users = await readUsers();
    const index = users.findIndex((item) => item.id === userResetMatch[1]);
    if (index === -1) return sendError(res, 404, "User not found");
    const input = await readJson(req);
    const rawPassword = String(input.password || crypto.randomBytes(6).toString("hex"));
    if (!rawPassword.trim()) return sendError(res, 400, "Password is required");
    users[index] = {
      ...users[index],
      password: hashPassword(rawPassword)
    };
    await writeUsers(users);
    const { password: _password, ...safeUser } = users[index];
    return send(res, 200, { user: safeUser, temporaryPassword: rawPassword });
  }

  return sendError(res, 404, "API route not found");
}

function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!filePath.startsWith(PUBLIC_DIR)) return sendError(res, 403, "Forbidden");
  fs.readFile(filePath, (error, data) => {
    if (error) return sendError(res, 404, "Not found");
    res.writeHead(200, {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream"
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const startedAt = Date.now();
  req.requestId = crypto.randomUUID();
  res.on("finish", () => {
    logEvent("info", "HTTP request completed", {
      ...res._tracklyLogContext,
      status: res.statusCode,
      durationMs: Date.now() - startedAt
    });
  });
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    const user = parseSession(req);
    res._tracklyLogContext = {
      requestId: req.requestId,
      method: req.method,
      route: pathname,
      actor: user?.email || user?.username || "",
      ip: req.socket?.remoteAddress || ""
    };
    if (pathname.startsWith("/api/")) return await handleApi(req, res, user, pathname);
    serveStatic(req, res, pathname);
  } catch (error) {
    const status = error?.status && Number.isFinite(Number(error.status)) ? Number(error.status) : 500;
    logEvent(status >= 500 ? "error" : "warn", "Unhandled request error", {
      ...res._tracklyLogContext,
      status,
      error: serializeError(error)
    });
    sendError(res, status, error.message || "Server error");
  }
});

server.listen(PORT, HOST, () => {
  logEvent("info", "Trackly server started", {
    host: HOST,
    port: PORT,
    publicBaseUrl: PUBLIC_BASE_URL,
    googleMode: google.enabled ? "enabled" : "demo",
    credentialsSource: google.credentialsSource,
    credentialFile: google.credentialsFile || null
  });
});
