import { startApp } from "./app/appRuntime.js";

<<<<<<< HEAD
const state = {
  user: null,
  config: null,
  entries: [],
  owners: [],
  fleetDetails: [],
  nextReceiptNumber: "",
  users: [],
  debitEntries: [],
  consolidatedEntries: [],
  ownerAdvances: [],
  view: "entry",
  selectedEntry: null,
  selectedReviewIds: [],
  consolidatedCreditDraft: null,
  debitDraft: null,
  ownerDraft: null,
  fleetDraft: null,
  ownerAdvanceDraft: null,
  adminTab: "users",
  ownerSearch: "",
  ownerAdvanceFilterOwner: "",
  ownerAdvanceFilterFrom: "",
  ownerAdvanceFilterTo: "",
  ownerAdvancePage: 1,
  activeOwnerName: "",
  dashboardMonth: "all",
  dashboardDateFrom: DASHBOARD_DEFAULT_FROM_ISO,
  dashboardDateTo: TODAY_ISO,
  dashboardOwnerFilterOwner: "",
  dashboardOwnerFilterCategory: "all",
  dashboardOwnerFilterTransactions: "all",
  dashboardOwnerFilterRevenue: "all",
  dashboardOwnerPage: 1,
  reviewSidebarOpen: true,
  reviewOwnerFilter: "",
  reviewPaymentFilter: "",
  reviewVehicleCategoryFilter: "",
  reviewPage: 1,
  reviewPageSize: 10,
  reviewDate: TODAY_ISO,
  reviewFilter: "Unreviewed"
};

const REVIEW_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const PHOTO_UPLOAD_CONFIG = {
  maxFileBytes: 15 * 1024 * 1024,
  maxCompressedBytes: 3 * 1024 * 1024,
  maxPayloadBytes: 22 * 1024 * 1024,
  maxImageDimension: 1200,
  minCompressQuality: 0.35,
  qualityStep: 0.1
};

const roleViews = {
  staff: ["entry"],
  reviewer: ["entry","review", "admin"],
  analyst: ["dashboard"],
  admin: ["dashboard", "entry", "review", "admin"]
};

const titles = {
  dashboard: "Revenue Dashboard",
  entry: "Daily Loading Entry",
  review: "Reviewer Queue",
  admin: "User Administration"
};

const contractBrandLines = [
  "Marketing, Sieving & Transportation Contract",
  "of S&G Pvt. Ltd.",
  "GSTN: 08AANCA9021D1ZS"
];

const app = document.querySelector("#app");

const selectorClassMap = [
  ["body", "bg-slate-50 text-slate-900 antialiased"],
  ["#app", "min-h-screen"],
  [".login-shell", "min-h-screen grid lg:grid-cols-[minmax(320px,460px)_1fr] bg-trackly-900"],
  [".login-art", "p-8 md:p-12 text-white flex flex-col justify-between gap-10"],
  [".login-panel", "grid place-items-center p-6 md:p-8 bg-slate-50"],
  [".panel", "w-full max-w-[460px] rounded-lg border border-slate-200 bg-white p-6 shadow-soft"],
  [".app-shell", "min-h-screen grid lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] overflow-x-hidden"],
  [".sidebar", "bg-trackly-900 text-white p-5 md:p-6 flex flex-col gap-5"],
  [".nav", "grid gap-2"],
  [".user-chip", "mt-auto border-t border-white/15 pt-5 text-slate-200"],
  [".content", "min-w-0"],
  [".topbar", "min-h-[74px] border-b border-slate-200 bg-white px-4 py-4 md:px-7 flex items-center justify-between gap-4"],
  [".title-block", "grid gap-1"],
  [".site-title", "text-lg font-black text-trackly-700"],
  [".site-detail", "text-sm font-semibold text-slate-500"],
  [".workspace", "px-4 pb-10 pt-6 md:px-7 overflow-x-hidden"],
  [".card", "rounded-lg border border-slate-200 bg-white p-4 md:p-[18px] shadow-sm"],
  [".field", "grid gap-1.5"],
  ["label", "text-[13px] font-semibold text-slate-700"],
  ["input, select, textarea", "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-trackly-500 focus:ring-2 focus:ring-trackly-100"],
  [".actions", "flex flex-wrap items-center gap-3"],
  [".badge", "inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-extrabold"],
  [".table-wrap", "overflow-auto rounded-lg border border-slate-200 bg-white"],
  ["table", "w-full min-w-[900px] border-collapse"],
  ["th", "bg-slate-100 text-[11px] font-bold uppercase tracking-[0.04em] text-slate-700"],
  ["th, td", "border-b border-slate-200 px-3 py-3 text-left align-top"],
  [".form-section", "grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:p-[18px]"],
  [".receipt-strip", "flex min-h-[52px] items-center justify-between gap-4 rounded-lg border border-slate-300 bg-slate-200 px-4 py-3"],
  [".choice-group", "flex flex-wrap gap-2.5 border-b border-slate-200 pb-2.5"],
  [".upload-tile", "grid min-h-[132px] cursor-pointer place-items-center content-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3.5 text-center"],
  [".review-dialog-backdrop", "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"],
  [".review-dialog-shell", "w-full max-w-5xl rounded-lg border border-slate-200 bg-white shadow-soft"],
  [".review-detail-card", "rounded-lg border border-slate-200 bg-white"],
  [".review-entry-card, .review-stream-card, .review-sidebar-pane > *, .review-content-pane > *", "rounded-lg border border-slate-200 bg-white shadow-sm"],
  [".photo-card img", "h-48 w-full rounded-md object-cover"],
  [".empty", "rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500"]
];

const buttonSelectorIcons = [
  ["#logoutBtn", "log-out"],
  ["#refreshBtn", "refresh-cw"],
  ['[data-view="dashboard"]', "layout-dashboard"],
  ['[data-view="entry"]', "plus"],
  ['[data-view="review"]', "list"],
  ['[data-view="admin"]', "users"],
  ["#openDebitDialog", "minus-circle"],
  ["#createConsolidatedCredit", "layers"],
  ["#clearSelectedReviews", "x"],
  ["#downloadDraft", "download"],
  ["#addTransactionBtn", "plus"],
  ["#loginForm button[type='submit']", "log-in"],
  ["#entryForm button[type='submit']", "send"],
  ["#userForm button[type='submit']", "user-plus"],
  ["#ownerForm button[type='submit']", "building-2"],
  ["#fleetForm button[type='submit']", "truck"],
  ["#debitEntryForm button[type='submit']", "wallet"],
  ["#consolidatedCreditForm button[type='submit']", "receipt"],
  ["#cancelOwnerEdit", "x"],
  ["#cancelFleetEdit", "x"]
];

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

function setButtonBusy(button, busy, busyLabel = "Please wait...") {
  if (!button) return;
  if (!button.dataset.defaultLabel) button.dataset.defaultLabel = button.textContent.trim();
  button.disabled = busy;
  button.textContent = busy ? busyLabel : button.dataset.defaultLabel;
}

async function runWithButton(button, busyLabel, work) {
  if (button?.disabled) return;
  setButtonBusy(button, true, busyLabel);
  try {
    return await work();
  } finally {
    setButtonBusy(button, false);
  }
}

function setGlobalBusyOverlay(visible, message = "Processing review...") {
  const existing = document.querySelector("#globalBusyOverlay");
  if (!visible) {
    existing?.remove();
    return;
  }

  const safeMessage = String(message || "Processing review...");
  if (existing) {
    const textNode = existing.querySelector("[data-busy-message]");
    if (textNode) textNode.textContent = safeMessage;
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "globalBusyOverlay";
  overlay.className = "global-busy-overlay";
  overlay.innerHTML = `
    <div class="global-busy-card" role="status" aria-live="polite" aria-busy="true">
      <div class="global-busy-spinner" aria-hidden="true"></div>
      <div class="global-busy-text" data-busy-message>${escapeHtml(safeMessage)}</div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function setGlobalButtonLock(locked, triggerButton = null, triggerBusyLabel = "Processing...") {
  const buttons = Array.from(document.querySelectorAll("button"));
  buttons.forEach((button) => {
    if (locked) {
      button.dataset.lockPrevDisabled = button.disabled ? "1" : "0";
      if (button === triggerButton) {
        button.dataset.lockPrevLabel = button.textContent;
        button.textContent = triggerBusyLabel;
      }
      button.disabled = true;
      return;
    }

    if (button.dataset.lockPrevDisabled === "1") {
      button.disabled = true;
    } else if (button.dataset.lockPrevDisabled === "0") {
      button.disabled = false;
    }

    if (button === triggerButton && button.dataset.lockPrevLabel != null) {
      button.textContent = button.dataset.lockPrevLabel;
      delete button.dataset.lockPrevLabel;
    }

    delete button.dataset.lockPrevDisabled;
  });

  document.body.classList.toggle("busy", locked);
  setGlobalBusyOverlay(locked, triggerBusyLabel);
}

function submitButtonFor(form, event) {
  return event.submitter || form.querySelector("button[type='submit']");
}

function enhanceUi() {
  return;
}

function applyTailwindTheme() {
  selectorClassMap.forEach(([selector, classNames]) => {
    document.querySelectorAll(selector).forEach((node) => node.classList.add(...classNames.split(" ")));
  });

  document.querySelectorAll("button").forEach((button) => {
    const isDanger = button.classList.contains("danger") || /reject|disable/i.test(button.textContent || "");
    const isSecondary = button.classList.contains("secondary") || button.classList.contains("link-action") || button.classList.contains("ghost-action");
    button.classList.add("inline-flex", "items-center", "justify-center", "gap-2", "rounded-md", "border", "px-3.5", "py-2.5", "text-sm", "font-semibold", "transition", "focus:outline-none", "focus:ring-2", "focus:ring-trackly-100");
    if (isDanger) {
      button.classList.add("border-rose-300", "bg-rose-50", "text-rose-600", "hover:bg-rose-100");
    } else if (isSecondary) {
      button.classList.add("border-slate-200", "bg-white", "text-slate-700", "hover:bg-slate-50");
    } else {
      button.classList.add("border-trackly-600", "bg-trackly-600", "text-white", "hover:bg-trackly-700");
    }
  });

  document.querySelectorAll(".nav button").forEach((button) => {
    button.classList.add("w-full", "justify-start", "border", "border-transparent", "bg-transparent", "text-slate-200", "hover:bg-white/10", "hover:text-white");
    if (button.classList.contains("active")) {
      button.classList.add("border-white/15", "bg-white/10", "text-white");
    }
  });

  document.querySelectorAll(".status-line").forEach((node) => node.classList.add("flex", "flex-wrap", "gap-2.5"));
  document.querySelectorAll(".grid.two").forEach((node) => node.classList.add("grid-cols-1", "md:grid-cols-2"));
  document.querySelectorAll(".grid.three").forEach((node) => node.classList.add("grid-cols-1", "md:grid-cols-3"));
  document.querySelectorAll(".brand-stack").forEach((node) => node.classList.add("grid", "gap-2.5"));
  document.querySelectorAll(".brand-text").forEach((node) => node.classList.add("text-3xl", "font-black", "tracking-normal"));
  document.querySelectorAll(".brand-contract-copy").forEach((node) => node.classList.add("grid", "gap-0.5", "text-sm", "font-bold", "text-white/90"));
  document.querySelectorAll(".review-action-row, .review-inline-actions, .transaction-grid, .transaction-meta, .photo-grid, .payment-form-grid").forEach((node) => node.classList.add("grid", "gap-3"));
  document.querySelectorAll(".review-heading h2, .topbar h2").forEach((node) => node.classList.add("font-bold", "tracking-normal"));
}

function decorateButtonsWithIcons() {
  buttonSelectorIcons.forEach(([selector, iconName]) => {
    document.querySelectorAll(selector).forEach((button) => addIconToButton(button, iconName));
  });

  document.querySelectorAll("[data-select]").forEach((button) => addIconToButton(button, "eye"));
  document.querySelectorAll("[data-edit-owner], [data-edit-fleet]").forEach((button) => addIconToButton(button, "pencil"));
  document.querySelectorAll("[data-inline-review-action='Approved'], [data-review-action='Approved']").forEach((button) => addIconToButton(button, "check"));
  document.querySelectorAll("[data-inline-review-action='Rejected'], [data-review-action='Rejected']").forEach((button) => addIconToButton(button, "x"));
  document.querySelectorAll("[data-close-review], [data-close-consolidated-credit], [data-close-debit-dialog]").forEach((button) => {
    if (button.tagName === "BUTTON") addIconToButton(button, "x");
  });
}

function addIconToButton(button, iconName) {
  if (!button || button.dataset.iconApplied === "true") return;
  const label = button.textContent.trim();
  if (!label) return;
  button.dataset.iconApplied = "true";
  button.innerHTML = `<i data-lucide="${iconName}" class="h-4 w-4 shrink-0"></i><span>${escapeHtml(label)}</span>`;
}

async function init() {
  state.config = await api("/api/config/status");
  state.health = { googleConnected: false, pending: true };
  const me = await api("/api/auth/me");
  state.user = me.user;
  if (!state.user) {
    renderLogin();
    refreshHealthStatus();
    return;
  }
  state.view = roleViews[state.user.role][0];
  await loadOwners();
  await loadFleetDetails();
  await loadEntries();
  await loadDebitEntries();
  await loadConsolidatedEntries();
  await loadOwnerAdvances();
  await loadNextReceipt();
  if (["admin", "reviewer"].includes(state.user.role)) await loadUsers();
  renderApp();
  refreshHealthStatus();
}

async function refreshHealthStatus() {
  try {
    state.health = await api("/api/config/health");
  } catch (error) {
    state.health = { googleConnected: false, error: error.message || "Health check failed" };
  }
  if (!state.user) renderLogin();
  else renderApp();
}

async function loadEntries() {
  if (!state.user) return;
  const data = await api("/api/entries");
  state.entries = data.entries || [];
}

async function loadDebitEntries() {
  if (!state.user) return;
  const data = await api("/api/debit-entries");
  state.debitEntries = data.debitEntries || [];
}

async function loadConsolidatedEntries() {
  if (!state.user) return;
  const data = await api("/api/consolidated-entries");
  state.consolidatedEntries = data.consolidatedEntries || [];
}

async function loadOwnerAdvances() {
  if (!state.user) return;
  const data = await api("/api/owner-advances");
  state.ownerAdvances = data.ownerAdvances || [];
}

function renderLogin() {
  app.innerHTML = `
    <section class="login-shell">
      <div class="login-art">
        <div class="brand-stack">
          <div class="brand-text">Trackly</div>
		<br/>
          <div class="brand brand-login"><img src="/akshay-infrasys-logo.png" alt="Akshay Infrasys"></div>
	  
          <div class="brand-contract-copy">
            ${contractBrandLines.map((line) => `<span>${line}</span>`).join("")}
          </div>
        </div>
        <div>
          <h1>Sand Site Operations</h1><br/>
          <p>Daily loading entries, onsite review, revenue analysis, and admin controls in one place.</p>
        </div>
      </div>
      <div class="login-panel">
        <div class="panel">
          <h2>Sign in</h2>
          ${state.config.demoMode ? `<p class="notice">Demo mode: try staff@trackly.local / staff123, reviewer@trackly.local / review123, analyst@trackly.local / analyst123, or admin@trackly.local / admin123.</p>` : ""}
          <form id="loginForm">
            <div class="field"><label>${state.config.demoMode ? "Email" : "User Name"}</label><input name="${state.config.demoMode ? "email" : "username"}" type="text" required value="${state.config.demoMode ? "admin@trackly.local" : ""}"></div>
            <div class="field"><label>Password</label><input name="password" type="password" required value=""></div>
            <button type="submit">Sign in</button>
          </form>
        </div>
      </div>
    </section>
  `;
  document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = submitButtonFor(event.currentTarget, event);
    try {
      await runWithButton(button, "Signing in...", async () => {
        const result = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(form))
        });
        state.user = result.user;
        state.view = roleViews[state.user.role][0];
        await Promise.all([
          loadOwners(),
          loadFleetDetails(),
          loadEntries(),
          loadDebitEntries(),
          loadConsolidatedEntries(),
          loadOwnerAdvances(),
          loadNextReceipt(),
          ["admin", "reviewer"].includes(state.user.role) ? loadUsers() : Promise.resolve()
        ]);
        renderApp();
      });
    } catch (error) {
      alert(error.message);
    }
  });
  enhanceUi();
}

function renderApp() {
  const views = roleViews[state.user.role];
  app.innerHTML = `
    <section class="app-shell">
      <aside class="sidebar">
        <div class="brand-stack brand-sidebar-stack">
          <div class="brand-text brand-text-sidebar">Trackly</div>
          <div class="brand brand-sidebar"><img src="/akshay-infrasys-logo.png" alt="Akshay Infrasys"></div>
          <div class="brand-contract-copy brand-contract-sidebar">
            ${contractBrandLines.map((line) => `<span>${line}</span>`).join("")}
          </div>
        </div>
        <nav class="nav">
          ${views.map((view) => `<button class="${state.view === view ? "active" : ""}" data-view="${view}">${navLabel(view)}</button>`).join("")}
        </nav>
        <div class="user-chip">
          <strong>${state.user.name}</strong><br>
          ${state.user.role.toUpperCase()}<br>
          <small>${state.user.email}</small>
        </div>
        <button class="secondary" id="logoutBtn">Logout</button>
      </aside>
      <section class="content">
        <header class="topbar">
          <div class="title-block">
            <div class="site-title">Trackly</div>
            <div class="site-detail">${state.config.site.detail}</div>
            <h2>${titles[state.view]}</h2>
            <div class="status-line">
              <span class="badge">${state.config.demoMode ? "Demo Mode" : "Google Connected"}</span>
              <span class="badge pending">${pendingCount()} pending review</span>
              <span class="badge">${state.health?.googleConnected ? "Health OK" : "Health Failed"}</span>
            </div>
          </div>
          <button class="secondary" id="refreshBtn">Refresh</button>
        </header>
        <div class="workspace">${renderView()}</div>
      </section>
    </section>
  `;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      state.selectedEntry = null;
      if (state.view === "entry") Promise.all([
        loadOwners(),
        loadNextReceipt()
      ]).then(renderApp).catch((error) => alert(error.message));
      else if (state.view === "admin") Promise.all([
        ["admin", "reviewer"].includes(state.user.role) ? loadUsers() : Promise.resolve(),
        loadOwners(),
        loadFleetDetails(),
        loadOwnerAdvances()
      ]).then(renderApp).catch((error) => alert(error.message));
      else renderApp();
    });
  });
  document.querySelector("#logoutBtn").addEventListener("click", logout);
  document.querySelector("#refreshBtn").addEventListener("click", async () => {
    const button = document.querySelector("#refreshBtn");
    await runWithButton(button, "Refreshing...", async () => {
      await Promise.all([
        loadOwners(),
        loadFleetDetails(),
        loadEntries(),
        loadDebitEntries(),
        loadConsolidatedEntries(),
        loadOwnerAdvances(),
        loadNextReceipt(),
        ["admin", "reviewer"].includes(state.user.role) ? loadUsers() : Promise.resolve()
      ]);
      renderApp();
    });
  });
  bindView();
  enhanceUi();
}

function navLabel(view) {
  return {
    dashboard: "Dashboard",
    entry: "New Entry",
    review: "Review Queue",
    admin: "Admin"
  }[view];
}

function pendingCount() {
  return state.entries.filter((entry) => entry.status === "Pending Review").length;
}

function renderView() {
  try {
    if (state.view === "entry") return renderEntryForm();
    if (state.view === "review") return renderReview();
    if (state.view === "dashboard") return renderDashboard();
    if (state.view === "admin") return renderAdmin();
    return `<div class="empty">View not available.</div>`;
  } catch (error) {
    return `<div class="card"><h3>Could not load view</h3><p>${escapeHtml(error.message || "Unknown error")}</p></div>`;
  }
}

function renderEntryForm(entry = {}) {
  const receiptNumber = entry.receiptNumber || state.nextReceiptNumber || "Generating...";
  return `
    <div class="card">
      <form id="entryForm">
        <div class="receipt-strip">
          <span># Receipt Number</span>
          <strong>${receiptNumber}</strong>
        </div>
        <input name="receiptNumber" type="hidden" value="${receiptNumber === "Generating..." ? "" : receiptNumber}">
        <section class="form-section">
          <h3>Entry Identification</h3>
          <div class="grid two">
            ${field("serialNo", "S. No.", "text", entry.serialNo || "", {
              placeholder: "Enter serial number",
              pattern: "[0-9]{1,3}",
              maxlength: "3",
              inputmode: "numeric"
            })}
          </div>
        </section>
        
        <section class="form-section">
          <h3>Need to fill this form?</h3>
          ${choiceGroup("formReason", ["No Electricity", "Mining Server was down", "Heavy Traffic"], entry.formReason, true)}
          <h3>Is Ravanna Deducted?</h3>
          ${choiceGroup("ravannaDeducted", ["Yes", "No"], entry.ravannaDeducted, true)}
        </section>
        <section class="form-section">
          <h3>Vehicle Details</h3>
          <div class="grid two">
            ${selectField("vehicleCategory", "Vehicle Category", ["Tractor", "Dumper"], entry.vehicleCategory, "Select category")}
            ${field("vehicleNumber", "Vehicle Number", "text", entry.vehicleNumber || "", { placeholder: "e.g. TN 01 AB 1234" })}
            <div id="vehicleTypeField">${renderVehicleTypeField(entry.vehicleCategory, entry.vehicleType)}</div>
          </div>
        </section>
        <section class="form-section">
          <h3>Driver Details</h3>
          <div class="grid two">
            ${field("driverName", "Driver Name", "text", entry.driverName || "", { placeholder: "Full name" })}
            ${field("driverPhone", "Phone Number", "tel", entry.driverPhone || "", { placeholder: "10-digit mobile number", pattern: "[0-9]{10}" })}
          </div>
          ${field("driverLicenseNumber", "License Number", "text", entry.driverLicenseNumber || "", { placeholder: "Driving license no." })}
        </section>
        <section class="form-section">
          <h3>Owner Details</h3>
          ${ownerSelectField(entry)}
          <div class="grid two">
            ${field("ownerPhone", "Owner Phone", "tel", entry.ownerPhone || "", { placeholder: "Owner phone", required: false, readonly: true })}
            ${field("ownerAddress", "Owner Address", "text", entry.ownerAddress || "", { placeholder: "Owner address", required: false, readonly: true })}
          </div>
        </section>
        <section class="form-section">
          <h3>Entry & Exit Area</h3>
          <div class="grid two">
            ${field("entryAreaGate", "Entry Area / Gate", "text", entry.entryAreaGate || "", { placeholder: "e.g. Gate A, North Entrance" })}
            ${field("exitAreaGate", "Exit Area / Gate", "text", entry.exitAreaGate || "", { placeholder: "e.g. Gate B, South Exit" })}
          </div>
        </section>
        <section class="form-section">
          <h3>Weight Details</h3>
          <div class="grid three">
            ${field("tareWeightTons", "Tare Weight (Tons) - Empty Vehicle", "number", entry.tareWeightTons || "", { step: "0.01", placeholder: "e.g. 5.0" })}
            ${field("grossWeightTons", "Gross Weight (Tons) - Loaded", "number", entry.grossWeightTons || "", { step: "0.01", placeholder: "e.g. 15.0" })}
            ${field("netWeightTons", "Net Weight (Tons) - Sand Load", "number", entry.netWeightTons || "", { step: "0.01", placeholder: "Auto-calculated" })}
          </div>
        </section>
        <section class="form-section">
          <h3>Time Details</h3>
          <div class="grid two">
            ${field("entryTime", "Entry Time", "datetime-local", toDateTimeLocal(entry.entryTime), {})}
            ${field("exitTime", "Exit Time", "datetime-local", toDateTimeLocal(entry.exitTime), {})}
          </div>
        </section>
        <section class="form-section">
          <h3>Destination Details</h3>
          <div class="grid two">
            ${field("destinationName", "Name of Destination", "text", entry.destinationName || "", { placeholder: "e.g. Chennai Port, Site 4" })}
            ${field("distanceKm", "Distance to Travel (km)", "number", entry.distanceKm || "", { step: "0.01", placeholder: "e.g. 120" })}
          </div>
          ${field("validityTimeHours", "Validity Time (hrs)", "number", entry.validityTimeHours || "", { step: "0.01", placeholder: "e.g. 24" })}
        </section>
        <section class="form-section">
          <h3>Payment Details</h3>
          <div class="grid two">
            ${field("totalAmountInclGst", "Total Amount (incl. GST) (Rs.)", "number", entry.totalAmountInclGst || "", { step: "0.01", placeholder: "e.g. 2500" })}
            ${field("amountPaid", "Mineral Amount (Rs.)", "number", entry.amountPaid || "", { step: "0.01", placeholder: "Auto-calculated", readonly: true })}
          </div>
          ${selectField("paymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer","Advance", "Credit"], entry.paymentMode || "Cash")}
          ${textareaField("notes", "Notes (optional)", entry.notes || "", "Any additional remarks...", false)}
        </section>
        <section class="form-section">
          <h3>Photos <small>required photos from the daily entry sheet</small></h3>
          <div class="grid two">
            ${uploadField("driverPhoto", "Driver Photo", entry.driverPhotoUrl)}
            ${uploadField("numberPlatePhoto", "Number Plate", entry.numberPlatePhotoUrl)}
            ${uploadField("sideViewPhoto", "Side View", entry.sideViewPhotoUrl)}
            ${uploadField("frontViewPhoto", "Front View", entry.frontViewPhotoUrl)}
          </div>
        </section>
        <input name="date" type="hidden" value="${entry.date || new Date().toISOString().slice(0, 10)}">
        <input name="sandType" type="hidden" value="${entry.sandType || "River Sand"}">
        <input name="paymentStatus" type="hidden" value="${entry.paymentStatus || "Paid"}">
        <input name="staffNotes" type="hidden" value="${entry.staffNotes || ""}">
        <div class="actions">
          <button type="submit">${entry.id ? "Save Changes" : "Submit for Review"}</button>
          <span id="formTotal" class="badge">Total incl. GST: Rs. 0</span>
        </div>
      </form>
    </div>
  `;
}

function field(name, label, type, value, options = {}) {
  const required = options.required === false ? "" : "required";
  const step = options.step ? `step="${options.step}"` : "";
  const placeholder = options.placeholder ? `placeholder="${escapeAttr(options.placeholder)}"` : "";
  const pattern = options.pattern ? `pattern="${options.pattern}"` : "";
  const maxLength = options.maxlength ? `maxlength="${options.maxlength}"` : "";
  const inputMode = options.inputmode ? `inputmode="${escapeAttr(options.inputmode)}"` : "";
  const readOnly = options.readonly ? "readonly" : "";
  return `<div class="field"><label>${label} ${required ? "<span>*</span>" : ""}</label><input name="${name}" type="${type}" value="${escapeAttr(value)}" ${step} ${placeholder} ${pattern} ${maxLength} ${inputMode} ${readOnly} ${required}></div>`;
}

function selectField(name, label, options, value, placeholder = "") {
  return `<div class="field"><label>${label} <span>*</span></label><select name="${name}" required>
    ${placeholder ? `<option value="">${placeholder}</option>` : ""}
    ${options.map((item) => `<option value="${escapeAttr(item)}" ${value === item ? "selected" : ""}>${item}</option>`).join("")}
  </select></div>`;
}

function getVehicleTypeConfig(category) {
  if (category === "Tractor") {
    return {
      label: "Vehicle Type",
      placeholder: "Select type",
      options: ["Commercial", "Agriculture"]
    };
  }
  if (category === "Dumper") {
    return {
      label: "No. of Wheels",
      placeholder: "Select no. of wheels",
      options: ["10", "12", "14", "16", "18", "20", "22"]
    };
  }
  return {
    label: "Vehicle Type",
    placeholder: "Select vehicle category first",
    options: []
  };
}

function renderVehicleTypeField(category, value) {
  const config = getVehicleTypeConfig(category);
  return selectField("vehicleType", config.label, config.options, value, config.placeholder);
}

function textareaField(name, label, value, placeholder, required = true) {
  return `<div class="field"><label>${label} ${required ? "<span>*</span>" : ""}</label><textarea name="${name}" placeholder="${escapeAttr(placeholder || "")}" ${required ? "required" : ""}>${escapeHtml(value || "")}</textarea></div>`;
}

function ownerSelectField(entry) {
  const value = entry.ownerName || "";
  const ownerNames = Array.from(new Set(
    state.owners
      .map((owner) => String(owner.name || "").trim())
      .filter(Boolean)
  ));
  if (value && !ownerNames.some((name) => name.toLowerCase() === String(value).trim().toLowerCase())) {
    ownerNames.push(String(value).trim());
  }
  ownerNames.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const selectedOwner = state.owners.find((owner) => String(owner.name || "").trim().toLowerCase() === String(value || "").trim().toLowerCase());
  const currentBalance = Number(selectedOwner?.currentBalance || 0);
  return `<div class="field owner-dropdown-field"><label>Owner Name <span>*</span></label>
    <input type="hidden" name="ownerName" value="${escapeAttr(value)}" required>
    <div class="owner-dropdown" data-owner-dropdown>
      <input type="text" class="owner-search-input" value="${escapeAttr(value)}" placeholder="Search owner" autocomplete="off" data-owner-search-input>
      <button type="button" class="owner-dropdown-toggle" aria-label="Open owner list" data-owner-dropdown-toggle>▾</button>
      <div class="owner-dropdown-list" data-owner-dropdown-list hidden>
        ${ownerNames.map((name) => `<button type="button" class="owner-dropdown-option" data-owner-option="${escapeAttr(name)}">${escapeHtml(name)}</button>`).join("")}
        <div class="owner-dropdown-empty" data-owner-empty hidden>No owners found</div>
      </div>
    </div>
    <div class="owner-current-balance" data-owner-current-balance>Current Balance: Rs. ${formatMoney(currentBalance)}</div>
  </div>`;
}

function choiceGroup(name, options, value, required = false) {
  return `<div class="choice-group">${options.map((item) => `
    <label class="choice"><input type="radio" name="${name}" value="${escapeAttr(item)}" ${value === item ? "checked" : ""} ${required ? "required" : ""}><span>${item}</span></label>
  `).join("")}</div>`;
}

function uploadField(name, label, existingUrl) {
  return `<label class="upload-tile">
    <span>${label} <strong>*</strong></span>
    <input type="file" name="${name}" accept="image/jpeg,image/png,image/webp" ${existingUrl ? "" : "required"}>
    <b>Click or drag to upload</b>
    <small>JPG, PNG, WEBP - max 20 MB</small>
    ${existingUrl ? `<em>Uploaded</em>` : ""}
  </label>`;
}

function toDateTimeLocal(value) {
  return value ? String(value).slice(0, 16) : "";
}

function escapeAttr(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function escapeHtml(value) {
  return escapeAttr(value);
}

function renderReview() {
  const datedEntries = entriesForDate(state.entries, state.reviewDate);
  const reviewRecords = applyReviewAttributeFilters(reviewRecordsForFilter(state.reviewDate, state.reviewFilter));
  state.selectedReviewIds = state.selectedReviewIds.filter((id) => reviewRecords.some((entry) => entry.id === id));
  const selectedEntry = state.selectedEntry && reviewRecords.find((entry) => entry.id === state.selectedEntry.id)
    ? state.selectedEntry
    : null;
  state.selectedEntry = selectedEntry;

  return `
    <section class="review-shell ${state.reviewSidebarOpen ? "sidebar-open" : "sidebar-closed"}">
      <button type="button" class="secondary review-drawer-toggle visible-secondary" id="toggleReviewSidebar">
        ${state.reviewSidebarOpen ? "Hide Filters" : "Show Filters"}
      </button>
      <div class="review-layout ${state.reviewSidebarOpen ? "" : "drawer-collapsed"}">
      <div class="review-sidebar-pane ${state.reviewSidebarOpen ? "open" : "closed"}">
        <div class="review-heading">
          <h2>Review Entries</h2>
          <p>${formatReviewLongDate(state.reviewDate)}</p>
        </div>
        ${renderReviewCalendar()}
        ${renderReviewStatsCard(datedEntries)}
        ${renderReviewRevenueCard(datedEntries)}
      </div>
      <div class="review-content-pane">
        ${renderReviewEntriesPanel(reviewRecords)}
      </div>
      </div>
      ${selectedEntry ? renderReviewDetailDialog(selectedEntry) : ""}
      ${state.consolidatedCreditDraft ? renderConsolidatedCreditDialog() : ""}
      ${state.debitDraft ? renderDebitDialog() : ""}
    </section>
  `;
}

function renderEntriesTable(entries, selectable = false) {
  if (!entries.length) return `<div class="empty">No entries found.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Receipt</th><th>Date</th><th>Vehicle</th><th>Driver</th><th>Destination</th><th>Net Wt.</th><th>Amount</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${entries.map((entry) => `
            <tr>
              <td>${entry.receiptNumber || entry.id}</td>
              <td>${entry.date}</td>
              <td>${entry.vehicleNumber}</td>
              <td>${entry.driverName}</td>
              <td>${entry.destinationName || "-"}</td>
              <td>${formatMoney(entry.netWeightTons)} tons</td>
              <td>Rs. ${formatMoney(entry.totalAmountInclGst || entry.grossAmount)}</td>
              <td><span class="badge ${entry.status === "Approved" ? "approved" : entry.status === "Rejected" ? "rejected" : "pending"}">${entry.status}</span></td>
              <td class="actions">
                ${selectable ? `<button class="secondary" data-select="${entry.id}">Review</button>` : ""}
                <a href="/api/entries/${entry.id}/download" target="_blank"><button class="secondary" type="button">Download</button></a>
                ${entry.driveFileUrl ? `<a href="${entry.driveFileUrl}" target="_blank"><button class="secondary" type="button">Drive</button></a>` : ""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderReviewCalendar() {
  const date = new Date(`${state.reviewDate}T00:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  const selectedDay = date.getDate();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let index = 0; index < offset; index += 1) cells.push(`<span class="calendar-day muted"></span>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const selected = day === selectedDay;
    const hasEntries = entriesForDate(state.entries, iso).length > 0;
    cells.push(
      `<button type="button" class="calendar-day ${selected ? "selected" : ""} ${hasEntries ? "has-entries" : ""}" data-review-date="${iso}">${day}</button>`
    );
  }

  return `
    <div class="card review-calendar-card">
      <div class="calendar-header">
        <button type="button" class="icon-nav" data-calendar-shift="-1">&#8249;</button>
        <strong>${date.toLocaleString("en-US", { month: "long", year: "numeric" })}</strong>
        <button type="button" class="icon-nav" data-calendar-shift="1">&#8250;</button>
      </div>
      <div class="calendar-weekdays">
        ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="calendar-grid">${cells.join("")}</div>
    </div>
  `;
}

function isRevenueEligibleEntry(entry) {
  return String(entry?.status || "").trim() === "Approved";
}

function renderReviewStatsCard(entries) {
  const total = entries.length;
  const pending = entries.filter((entry) => entry.status === "Pending Review").length;
  const dupes = entries.filter((entry) => entry.status === "Duplicate").length;
  return `
    <div class="card review-summary-card">
      <div class="eyebrow">${formatReviewEyebrowDate(state.reviewDate)}</div>
      <div class="review-summary-grid">
        <div><strong>${total}</strong><span>Total</span></div>
        <div><strong>${pending}</strong><span>Pending</span></div>
        <div><strong>${dupes}</strong><span>Dupes</span></div>
      </div>
      <div class="verify-line">
        <span class="verify-icon">&#10003;</span>
        <div>
          <strong>Verify all ${pending} pending</strong>
          <small>Excludes duplicates</small>
        </div>
      </div>
    </div>
  `;
}

function renderReviewRevenueCard(entries) {
  const approvedEntries = entries.filter(isRevenueEligibleEntry);
  const dailyRevenue = approvedEntries.reduce((sum, entry) => sum + Number(entry.totalAmountInclGst || entry.grossAmount || 0), 0);
  const monthPrefix = state.reviewDate.slice(0, 7);
  const monthlyEntries = state.entries.filter((entry) => String(entry.date || "").startsWith(monthPrefix) && isRevenueEligibleEntry(entry));
  const monthlyRevenue = monthlyEntries.reduce((sum, entry) => sum + Number(entry.totalAmountInclGst || entry.grossAmount || 0), 0);
  const dailyDebits = state.debitEntries
    .filter((entry) => String(entry.date || "").slice(0, 10) === state.reviewDate)
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const monthlyDebits = state.debitEntries
    .filter((entry) => String(entry.date || "").startsWith(monthPrefix))
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  return `
    <div class="card revenue-summary-card">
      <div class="eyebrow">Revenue Overview</div>
      <div class="revenue-section">
        <div class="revenue-subtitle">Daily - ${formatReviewLongDate(state.reviewDate)}</div>
        <div class="revenue-metrics">
          <div class="revenue-tile">
            <strong>${entries.length}</strong>
            <span>Entries</span>
          </div>
          <div class="revenue-tile success">
            <strong>Rs. ${formatMoney(dailyRevenue)}</strong>
            <span>Credits</span>
          </div>
        </div>
        <div class="revenue-net">Net (Credits - Debits) <strong>Rs. ${formatMoney(dailyRevenue - dailyDebits)}</strong></div>
      </div>
      <div class="revenue-divider"></div>
      <div class="revenue-section">
        <div class="revenue-subtitle">Monthly - ${new Date(`${monthPrefix}-01T00:00:00`).toLocaleString("en-US", { month: "long", year: "numeric" })}</div>
        <div class="revenue-metrics">
          <div class="revenue-tile">
            <strong>${monthlyEntries.length}</strong>
            <span>Entries</span>
          </div>
          <div class="revenue-tile info">
            <strong>Rs. ${formatMoney(monthlyRevenue)}</strong>
            <span>Revenue</span>
          </div>
        </div>
      </div>
      <button type="button" class="secondary ghost-action" id="openDebitDialog">Add Debit / Petty Expense</button>
    </div>
  `;
}

function renderReviewListCard(entries) {
  return `
    <div class="card review-list-card">
      <div class="review-list-head">
        <h3>Review Entries</h3>
        <span>${entries.length}</span>
      </div>
      <div class="review-filter-row">
        ${["Unreviewed", "Approved", "Rejected"].map((filter) => `
          <button
            type="button"
            class="review-filter-chip ${state.reviewFilter === filter ? "active" : ""}"
            data-review-filter="${filter}"
          >${filter}</button>
        `).join("")}
      </div>
      ${entries.length ? `
        <div class="review-entry-list">
          ${entries.map((entry) => `
            <button type="button" class="review-entry-item ${state.selectedEntry?.id === entry.id ? "active" : ""}" data-select="${entry.id}">
              <div>
                <strong>#${entry.receiptNumber || entry.id}</strong>
                <span>${entry.driverName || "No driver name"}</span>
                <span>${entry.vehicleNumber || "-"}</span>
              </div>
              <small>${entry.status}</small>
            </button>
          `).join("")}
        </div>
      ` : `<div class="empty compact">No ${state.reviewFilter.toLowerCase()} entries for this date.</div>`}
    </div>
  `;
}

function renderReviewEntriesPanel(entries) {
  const allowBatchSelection = !["Consolidated Credits", "Debit Entries"].includes(state.reviewFilter);
  const selectedEntries = allowBatchSelection ? entries.filter((entry) => state.selectedReviewIds.includes(entry.id)) : [];
  const selectedTotal = selectedEntries.reduce((sum, entry) => sum + Number(entry.totalAmountInclGst || entry.grossAmount || 0), 0);
  const filteredDailyRevenue = entries.reduce((sum, entry) => sum + Number(entry.totalAmountInclGst || entry.grossAmount || 0), 0);
  const requestedPageSize = Number(state.reviewPageSize || 10);
  const pageSize = REVIEW_PAGE_SIZE_OPTIONS.includes(requestedPageSize) ? requestedPageSize : 10;
  const totalEntries = entries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const currentPage = Math.min(Math.max(1, Number(state.reviewPage || 1)), totalPages);
  const pageStart = totalEntries ? (currentPage - 1) * pageSize : 0;
  const pageEnd = totalEntries ? Math.min(pageStart + pageSize, totalEntries) : 0;
  const pagedEntries = entries.slice(pageStart, pageEnd);
  state.reviewPage = currentPage;
  state.reviewPageSize = pageSize;
  const ownerOptions = Array.from(new Set(
    state.entries
      .filter((entry) => String(entry.date || "").slice(0, 10) === state.reviewDate)
      .map((entry) => entry.ownerName)
      .filter(Boolean)
  )).sort();
  const vehicleCategoryOptions = Array.from(new Set(
    state.entries
      .filter((entry) => String(entry.date || "").slice(0, 10) === state.reviewDate)
      .map((entry) => entry.vehicleCategory)
      .filter(Boolean)
  )).sort();
  const paymentOptions = ["Cash", "UPI", "Bank Transfer", "Credit", "Advance", "Multiple"];
  return `
    <div class="card review-stream-card">
      <div class="review-list-head">
        <div>
          <h3>Review Entries</h3>
          <p class="review-panel-subtitle">${formatReviewLongDate(state.reviewDate)}</p>
        </div>
        <span>${entries.length}</span>
      </div>
      <div class="review-pagination-toolbar">
        <div class="field review-page-size-field">
          <label for="reviewPageSize">Entries per page</label>
          <select id="reviewPageSize">
            ${REVIEW_PAGE_SIZE_OPTIONS.map((size) => `<option value="${size}" ${pageSize === size ? "selected" : ""}>${size}</option>`).join("")}
          </select>
        </div>
        <div class="review-pagination-meta">Showing ${totalEntries ? pageStart + 1 : 0}-${pageEnd} of ${totalEntries}</div>
        <div class="review-pagination-actions">
          <button type="button" class="secondary" id="reviewPagePrev" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>
          <span class="review-pagination-page">Page ${currentPage} of ${totalPages}</span>
          <button type="button" class="secondary" id="reviewPageNext" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>
        </div>
      </div>
      <div class="review-filter-row">
        ${["Unreviewed", "Approved", "Rejected", "Consolidated Credits", "Debit Entries"].map((filter) => `
          <button
            type="button"
            class="review-filter-chip ${state.reviewFilter === filter ? "active" : ""}"
            data-review-filter="${filter}"
          >${filter}</button>
        `).join("")}
      </div>
      ${allowBatchSelection ? `
        <div class="review-attribute-filters">
          <div class="field">
            <label>Owner Name</label>
            <select id="reviewOwnerFilter">
              <option value="">All Owners</option>
              ${ownerOptions.map((ownerName) => `<option value="${escapeAttr(ownerName)}" ${state.reviewOwnerFilter === ownerName ? "selected" : ""}>${escapeHtml(ownerName)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Payment Mode</label>
            <select id="reviewPaymentFilter">
              <option value="">All Payment Modes</option>
              ${paymentOptions.map((mode) => `<option value="${escapeAttr(mode)}" ${state.reviewPaymentFilter === mode ? "selected" : ""}>${mode}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>Vehicle Category</label>
            <select id="reviewVehicleCategoryFilter">
              <option value="">All Vehicle Categories</option>
              ${vehicleCategoryOptions.map((category) => `<option value="${escapeAttr(category)}" ${state.reviewVehicleCategoryFilter === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="review-filter-revenue">Daily Revenue (Filtered): <strong>Rs. ${formatMoney(filteredDailyRevenue)}</strong></div>
      ` : ""}
      ${selectedEntries.length >= 2 ? `
        <div class="review-selection-bar">
          <div class="review-selection-copy">
            <strong>${selectedEntries.length} ${selectedEntries.length === 1 ? "entry" : "entries"} selected</strong>
            <span>Rs. ${formatMoney(selectedTotal)}</span>
          </div>
          <div class="review-selection-actions">
            <button type="button" class="secondary" id="clearSelectedReviews">Clear</button>
            <button type="button" id="createConsolidatedCredit">Create Consolidated Credit</button>
          </div>
        </div>
      ` : ""}
      ${totalEntries ? `
        <div class="review-stream-list">
          ${pagedEntries.map((entry) => renderReviewEntryCard(entry)).join("")}
        </div>
      ` : `<div class="empty compact">No ${state.reviewFilter.toLowerCase()} entries for this date.</div>`}
    </div>
  `;
}

function renderReviewEntryCard(entry) {
  if (entry.recordType === "consolidated") return renderConsolidatedReviewCard(entry);
  if (entry.recordType === "debit") return renderDebitReviewCard(entry);
  const statusClass = entry.status === "Approved" ? "approved" : entry.status === "Rejected" ? "rejected" : "pending";
  const isSelected = state.selectedReviewIds.includes(entry.id);
  const isReviewable = entry.status === "Pending Review";
  return `
    <div class="review-stream-item ${state.selectedEntry?.id === entry.id ? "active" : ""}">
      <div class="review-stream-top">
        <label class="review-check">
          <input type="checkbox" ${isSelected ? "checked" : ""} data-toggle-review-selection="${entry.id}" ${isReviewable ? "" : "disabled"}>
          <span></span>
        </label>
        <div class="review-stream-grid">
          <div class="review-fact">
            <span>Vehicle</span>
            <strong>${entry.vehicleNumber || "-"}</strong>
            <small>${[entry.vehicleCategory, entry.vehicleType].filter(Boolean).join(" - ") || "-"}</small>
          </div>
          <div class="review-fact">
            <span>Owner</span>
            <strong>${entry.ownerName || "-"}</strong>
            <small>${entry.ownerPhone || "-"}</small>
          </div>
          <div class="review-fact">
            <span>Driver</span>
            <strong>${entry.driverName || "-"}</strong>
            <small>${entry.driverPhone || "-"}</small>
          </div>
          <div class="review-fact">
            <span>Net Weight</span>
            <strong>${formatMoney(entry.netWeightTons)} kg</strong>
            <small>net</small>
          </div>
          <div class="review-fact amount">
            <span>Amount</span>
            <strong>Rs. ${formatMoney(entry.totalAmountInclGst || entry.grossAmount)}</strong>
            <small>${entry.paymentMode || "-"}</small>
          </div>
          <div class="review-status-meta">
            <span class="badge ${statusClass}">${entry.status === "Pending Review" ? "Pending" : entry.status}</span>
            <small>${formatReviewTimestamp(entry.entryTime || entry.createdAt || entry.date)}</small>
          </div>
        </div>
      </div>
      <div class="review-stream-bottom">
        <div class="review-meta-line">
          <span>By: ${entry.createdBy || state.user.name}</span>
          <span>#${entry.id}</span>
          <code>S. No.: ${entry.serialNo || "-"}</code>
          <code>Receipt: ${entry.receiptNumber || "-"}</code>
        </div>
        <div class="review-inline-actions">
          <button type="button" class="link-action" data-select="${entry.id}">View</button>
          ${isReviewable ? `<button type="button" data-inline-review-action="Approved" data-entry-id="${entry.id}">Verify</button>
          <button type="button" class="danger" data-inline-review-action="Rejected" data-entry-id="${entry.id}">Reject</button>` : ``}
        </div>
      </div>
    </div>
  `;
}

function renderConsolidatedReviewCard(entry) {
  return `
    <div class="review-stream-item">
      <div class="review-stream-grid review-alt-grid">
        <div class="review-fact">
          <span>Credit Entry</span>
          <strong>${entry.creditEntryId}</strong>
          <small>${entry.formEntry || "-"}</small>
        </div>
        <div class="review-fact">
          <span>Received By</span>
          <strong>${entry.receivedBy || "-"}</strong>
          <small>${entry.createdBy || "-"}</small>
        </div>
        <div class="review-fact amount">
          <span>Total Amount</span>
          <strong>Rs. ${formatMoney(entry.totalAmount)}</strong>
          <small>${entry.paymentMode || "-"}</small>
        </div>
        <div class="review-status-meta">
          <span class="badge approved">Consolidated Credit</span>
          <small>${formatReviewTimestamp(entry.createdDate || entry.date)}</small>
        </div>
      </div>
      <div class="review-stream-bottom">
        <div class="review-meta-line">
          <span>Created By: ${entry.createdBy || "-"}</span>
          <span>Date: ${entry.createdDate || entry.date || "-"}</span>
        </div>
      </div>
    </div>
  `;
}

function renderDebitReviewCard(entry) {
  return `
    <div class="review-stream-item">
      <div class="review-stream-grid review-alt-grid">
        <div class="review-fact">
          <span>Debit Entry</span>
          <strong>${entry.debitEntryId}</strong>
          <small>${entry.description || "-"}</small>
        </div>
        <div class="review-fact">
          <span>Category</span>
          <strong>${entry.category || "-"}</strong>
          <small>${entry.paidTo || "-"}</small>
        </div>
        <div class="review-fact amount">
          <span>Amount</span>
          <strong>Rs. ${formatMoney(entry.amount)}</strong>
          <small>${entry.paymentMode || "-"}</small>
        </div>
        <div class="review-status-meta">
          <span class="badge rejected">Debit Entry</span>
          <small>${formatReviewTimestamp(entry.createdDate || entry.date)}</small>
        </div>
      </div>
      <div class="review-stream-bottom">
        <div class="review-meta-line">
          <span>Created By: ${entry.createdBy || "-"}</span>
          <span>Date: ${entry.createdDate || entry.date || "-"}</span>
        </div>
      </div>
    </div>
  `;
}

function renderReviewDetail(entry) {
  const statusClass = entry.status === "Approved" ? "approved" : entry.status === "Rejected" ? "rejected" : "pending";
  const transactions = reviewTransactions(entry);
  const ownerRecord = state.owners.find((item) => String(item.name || "").trim().toLowerCase() === String(entry.ownerName || "").trim().toLowerCase());
  const ownerCurrentBalance = Number(ownerRecord?.currentBalance || 0);
  return `
    <div class="card review-detail-card">
      <div class="review-detail-topbar">
        <strong>Entry Details - #${entry.receiptNumber || entry.id}</strong>
        <button type="button" class="icon-close" data-close-review>&times;</button>
      </div>
      <div class="review-slip-card">
        <div class="contract-card">
          <div class="contract-mark"><img src="/akshay-infrasys-logo.png" alt="Akshay Infrasys"></div>
          <div class="contract-copy">
            ${contractBrandLines.map((line, index) => index === 0 ? `<strong>${line}</strong>` : `<span>${line}</span>`).join("")}
            <span>${state.config.site.name} - ${state.config.site.detail}</span>
          </div>
        </div>
        <div class="review-slip-header">
          <div>
            <div class="slip-title">Sand Loading Slip</div>
            <div class="slip-meta">S. No. ${entry.serialNo || "-"} · Entry #${entry.receiptNumber || entry.id} · ${formatEntryDateTime(entry.createdAt || entry.date)}</div>
            <div class="slip-identifier">#${entry.receiptNumber || entry.id}</div>
          </div>
          <span class="badge ${statusClass}">${entry.status === "Pending Review" ? "Pending" : entry.status}</span>
        </div>
        ${renderDetailSection("Vehicle Details", [
          ["Vehicle Number", entry.vehicleNumber],
          ["Vehicle Type", [entry.vehicleCategory, entry.vehicleType].filter(Boolean).join(" - ") || entry.vehicleType]
        ])}
        ${renderDetailSection("Driver Details", [
          ["Driver Name", entry.driverName],
          ["Phone No.", entry.driverPhone],
          ["License No.", entry.driverLicenseNumber]
        ])}
        ${renderDetailSection("Owner Details", [
          ["Owner Name", entry.ownerName],
          ["Phone", entry.ownerPhone],
          ["Address", entry.ownerAddress || "-"],
          ["Current Balance", `Rs. ${formatMoney(ownerCurrentBalance)}`]
        ])}
        ${renderDetailSection("Weight Details", [
          ["Tare Weight (Empty)", formatWeight(entry.tareWeightTons)],
          ["Gross Weight (Loaded)", formatWeight(entry.grossWeightTons)],
          ["Net Sand Weight", formatWeight(entry.netWeightTons)]
        ])}
        ${renderDetailSection("Time & Area", [
          ["Entry Time", formatEntryDateTime(entry.entryTime)],
          ["Exit Time", formatEntryDateTime(entry.exitTime)],
          ["Entry Area / Gate", entry.entryAreaGate],
          ["Exit Area / Gate", entry.exitAreaGate],
          ["Amount Paid (incl. GST)", `Rs. ${formatMoney(entry.totalAmountInclGst)}`],
          ["Payment Mode", entry.paymentMode]
        ])}
        ${renderDetailSection("Destination Details", [
          ["Destination", entry.destinationName],
          ["Distance", entry.distanceKm ? `${entry.distanceKm} km` : "-"],
          ["Validity Time", entry.validityTimeHours ? `${entry.validityTimeHours} hrs` : "-"]
        ])}
        ${renderPhotoSection(entry)}
        ${renderDetailSection("Staff Info", [
          ["Recorded By", entry.createdBy || state.user.name],
          ["Ravanna Deducted?", entry.ravannaDeducted],
          ["Need to fill this form?", entry.formReason]
        ])}
      </div>
      <div class="payment-box">
        <div class="payment-box-head">
          <strong>Payments</strong>
          <button type="button" class="link-action payment-add-link" id="addTransactionBtn">Add Transaction</button>
        </div>
        <div class="transaction-list" id="transactionList">
          ${transactions.map((transaction, index) => renderTransactionRow(transaction, index)).join("")}
        </div>
        ${textareaField("reviewerNotes", "Notes (optional)", entry.reviewerNotes || "", "Reviewer note...", false)}
        <div class="payment-total">Total Amount <strong id="transactionTotal">Rs. ${formatMoney(transactionSum(transactions))}</strong></div>
      </div>
      <div class="review-action-row">
        ${entry.status === "Pending Review" ? `
          <button type="button" data-review-action="Approved">Verify Entry</button>
          <button type="button" class="danger" data-review-action="Rejected">Reject Entry</button>
        ` : ""}
        <button type="button" class="secondary" id="downloadDraft">Download / Print</button>
      </div>
    </div>
  `;
}

function renderReviewDetailDialog(entry) {
  return `
    <div class="review-dialog-backdrop" data-close-review>
      <div class="review-dialog-shell" role="dialog" aria-modal="true" aria-label="Entry details">
        ${renderReviewDetail(entry)}
      </div>
    </div>
  `;
}

function reviewTransactions(entry) {
  if (Array.isArray(entry.transactions) && entry.transactions.length) {
    const transactions = entry.transactions.map((transaction, index) => ({
      id: transaction.id || `TX-${index + 1}`,
      amount: transaction.amount || "",
      mode: transaction.mode || "Cash",
      notes: transaction.notes || ""
    }));
    if (transactions.length === 1 && entry.totalAmountInclGst) {
      transactions[0].amount = entry.totalAmountInclGst;
    }
    return transactions;
  }
  return [{
    id: "TX-1",
    amount: entry.totalAmountInclGst || entry.amountPaid || "",
    mode: entry.paymentMode || "Cash",
    notes: ""
  }];
}

function renderTransactionRow(transaction, index) {
  return `
    <div class="transaction-row" data-transaction-row>
      <div class="transaction-grid">
        <div class="field">
          <label>Amount Paid (incl. GST) (Rs.)</label>
          <input type="number" name="transactionAmount" value="${escapeAttr(transaction.amount)}" step="0.01" placeholder="0">
        </div>
        <div class="field">
          <label>Mode</label>
          <select name="transactionMode">
            ${["Cash", "UPI", "Bank Transfer", "Advance", "Credit"].map((mode) => `
              <option value="${escapeAttr(mode)}" ${transaction.mode === mode ? "selected" : ""}>${mode}</option>
            `).join("")}
          </select>
        </div>
      </div>
      <div class="transaction-meta">
        <div class="field">
          <label>Notes (optional)</label>
          <input type="text" name="transactionNotes" value="${escapeAttr(transaction.notes)}" placeholder="Reference or remark">
        </div>
        <button type="button" class="secondary transaction-remove" data-remove-transaction ${index === 0 ? "disabled" : ""}>Remove</button>
      </div>
    </div>
  `;
}

function transactionRowTemplate(index) {
  return renderTransactionRow({ id: `TX-${index + 1}`, amount: "", mode: "Cash", notes: "" }, index);
}

function transactionSum(transactions) {
  return transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}

function renderConsolidatedCreditDialog() {
  const draft = state.consolidatedCreditDraft;
  const total = draft?.totalAmount || 0;
  return `
    <div class="review-dialog-backdrop" data-close-consolidated-credit>
      <div class="review-dialog-shell consolidated-dialog-shell" role="dialog" aria-modal="true" aria-label="Create consolidated credit">
        <div class="card review-detail-card consolidated-credit-card">
          <div class="review-detail-topbar">
            <strong>Create Consolidated Credit</strong>
            <button type="button" class="icon-close" data-close-consolidated-credit>&times;</button>
          </div>
          <div class="review-slip-card consolidated-credit-body">
            <div class="review-selection-bar consolidated-credit-summary">
              <div class="review-selection-copy">
                <strong>${draft.entries.length} ${draft.entries.length === 1 ? "entry" : "entries"} selected</strong>
                <span>Rs. ${formatMoney(total)}</span>
              </div>
            </div>
            <div class="detail-section" style="margin-top:0;padding-top:0;border-top:0">
              <h4>Selected Entries</h4>
              <div class="detail-grid">
                ${draft.entries.map((entry) => `
                  <div class="detail-row">
                    <span>${escapeHtml(entry.receiptNumber || entry.id)}</span>
                    <strong>Rs. ${formatMoney(entry.totalAmountInclGst || entry.grossAmount)}</strong>
                  </div>
                `).join("")}
              </div>
            </div>
            <form id="consolidatedCreditForm" class="consolidated-credit-form">
              <div class="grid two">
                ${field("consolidatedTotalAmount", "Total Amount", "number", total || "", { step: "0.01", placeholder: "0" })}
                ${field("consolidatedReceivedBy", "Received By", "text", draft.receivedBy || state.user.name || "", { placeholder: "Receiver name" })}
              </div>
              <div class="grid two">
                ${selectField("consolidatedPaymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer", "Advance", "Credit"], draft.paymentMode || "Cash")}
                ${field("consolidatedDate", "Date", "date", draft.date || state.reviewDate, { readonly: true })}
              </div>
              ${textareaField("consolidatedNotes", "Notes (optional)", draft.notes || "", "Add note...", false)}
              <div class="review-action-row consolidated-credit-actions">
                <button type="button" class="secondary" data-close-consolidated-credit>Cancel</button>
                <button type="submit">Submit Consolidated Credit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDebitDialog() {
  const draft = state.debitDraft || {};
  return `
    <div class="review-dialog-backdrop" data-close-debit-dialog>
      <div class="review-dialog-shell consolidated-dialog-shell" role="dialog" aria-modal="true" aria-label="Add debit or petty expense">
        <div class="card review-detail-card consolidated-credit-card">
          <div class="review-detail-topbar">
            <strong>Add Debit / Petty Expense</strong>
            <button type="button" class="icon-close" data-close-debit-dialog>&times;</button>
          </div>
          <div class="review-slip-card consolidated-credit-body">
            <form id="debitEntryForm" class="consolidated-credit-form">
              ${field("debitDate", "Date", "date", draft.date || state.reviewDate, {})}
              ${field("debitDescription", "Description", "text", draft.description || "", { placeholder: "e.g. Diesel for JCB, Office stationery..." })}
              ${field("debitAmount", "Amount (Rs.)", "number", draft.amount || "", { step: "0.01", placeholder: "0" })}
              <div class="grid two">
                ${selectField("debitCategory", "Category", ["Miscellaneous", "Fuel", "Maintenance", "Staff", "Transport", "Office"], draft.category || "Miscellaneous")}
                ${selectField("debitPaymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer","Advance", "Credit"], draft.paymentMode || "Cash")}
              </div>
              ${field("debitPaidTo", "Paid To", "text", draft.paidTo || "", { placeholder: "Person or vendor name", required: false })}
              ${textareaField("debitNotes", "Notes (optional)", draft.notes || "", "Additional details...", false)}
              <div class="review-action-row consolidated-credit-actions">
                <button type="button" class="secondary" data-close-debit-dialog>Cancel</button>
                <button type="submit" class="danger">Record Debit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

function collectReviewTransactions() {
  return Array.from(document.querySelectorAll("[data-transaction-row]"))
    .map((row, index) => ({
      id: `TX-${index + 1}`,
      amount: Number(row.querySelector("[name='transactionAmount']")?.value || 0),
      mode: row.querySelector("[name='transactionMode']")?.value || "Cash",
      notes: row.querySelector("[name='transactionNotes']")?.value || ""
    }))
    .filter((transaction) => Number(transaction.amount) > 0);
}

function renderDetailSection(title, rows) {
  return `
    <section class="detail-section">
      <h4>${title}</h4>
      <div class="detail-grid">
        ${rows.map(([label, value]) => `
          <div class="detail-row">
            <span>${label}</span>
            <strong>${escapeHtml(value || "-")}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function photoDisplayUrl(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/\/file\/d\/([^/]+)\//);
  if (match) return `/api/drive-image/${match[1]}`;
  return raw;
}

function renderPhotoSection(entry) {
  const photos = [
    ["Driver", entry.driverPhotoUrl],
    ["Number Plate", entry.numberPlatePhotoUrl],
    ["Side View", entry.sideViewPhotoUrl],
    ["Front View", entry.frontViewPhotoUrl]
  ].filter(([, value]) => value);

  if (!photos.length) return "";

  return `
    <section class="detail-section">
      <h4>Photos</h4>
      <div class="photo-grid">
        ${photos.map(([label, value]) => `
          <div class="photo-card">
            <span>${label}</span>
            <img src="${photoDisplayUrl(value)}" alt="${escapeAttr(label)}">
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDashboard() {
  const monthValue = state.dashboardMonth || "all";
  const selectedMonth = monthValue === "all" ? null : monthValue;
  const monthEntries = selectedMonth
    ? state.entries.filter((entry) => String(entry.date || "").startsWith(selectedMonth))
    : state.entries.slice();
  const monthDebits = selectedMonth
    ? state.debitEntries.filter((entry) => String(entry.date || "").startsWith(selectedMonth))
    : state.debitEntries.slice();
  const monthApproved = monthEntries.filter(isRevenueEligibleEntry);
  const pending = monthEntries.filter((entry) => entry.status === "Pending Review");
  const today = TODAY_ISO;
  const todaysEntries = state.entries.filter((entry) => entry.date === today);
  const todaysApproved = state.entries.filter((entry) => isRevenueEligibleEntry(entry) && entry.date === today);
  const monthTodaysApproved = monthApproved.filter((entry) => entry.date === today);
  const todaysDebits = monthDebits.filter((entry) => entry.date === today);
  const totalRevenue = sumAmount(monthApproved, "totalAmountInclGst", "grossAmount", "amountPaid");
  const monthRevenue = sumAmount(monthApproved, "totalAmountInclGst", "grossAmount", "amountPaid");
  const todayRevenue = sumAmount(todaysApproved, "totalAmountInclGst", "grossAmount", "amountPaid");
  const monthTodayRevenue = sumAmount(monthTodaysApproved, "totalAmountInclGst", "grossAmount", "amountPaid");
  const totalDebits = sumAmount(monthDebits, "amount");
  const monthDebitTotal = sumAmount(monthDebits, "amount");
  const todayDebitTotal = sumAmount(todaysDebits, "amount");
  const totalWeight = monthApproved.reduce((sum, entry) => sum + Number(entry.netWeightTons || 0), 0);
  const monthlyCreditSeries = monthlyRevenueSeries(monthApproved);
  const monthlyDebitSeries = monthlyRevenueSeries(monthDebits, "amount");
  const last30Series = buildLast30DaySeries(monthEntries, monthApproved);
  const vehicleBreakdown = breakdownMap(monthEntries, (entry) => {
    if (entry.vehicleCategory === "Dumper") return "Dumper";
    if (entry.vehicleCategory === "Tractor" && entry.vehicleType) return `Tractor - ${entry.vehicleType}`;
    return entry.vehicleCategory || "Unknown";
  }, (entry) => Number(entry.totalAmountInclGst || entry.grossAmount || entry.amountPaid || 0));
  const paymentModes = paymentModeDistribution(monthApproved);
  const recentActivity = monthEntries
    .slice()
    .sort((a, b) => String(b.entryTime || b.createdAt || "").localeCompare(String(a.entryTime || a.createdAt || "")))
    .slice(0, 5);
  return `
    <section class="dashboard-shell">
      <div class="dashboard-head">
        <div>
          <h3>Analytics Dashboard</h3>
          <p>Site overview and performance metrics</p>
        </div>
        <div class="dashboard-head-actions">
          <select id="dashboardMonthSelect" aria-label="Dashboard month filter">
            ${dashboardMonthOptions(monthValue)}
          </select>
        </div>
      </div>

      <div class="dashboard-section-label">Today</div>
      <div class="dashboard-metric-grid">
        ${dashboardMetricCard("Today's Trips", `${todaysEntries.length}`, "loading trips today", "blue")}
        ${dashboardMetricCard("Today's Revenue", `Rs ${formatMoney(todayRevenue)}`, "collected today", "green")}
        ${dashboardMetricCard("Pending Verification", `${pending.length}`, "awaiting review", "amber")}
        ${dashboardMetricCard("Verified Entries", `${monthApproved.length}`, "total verified", "mint")}
      </div>

      <div class="dashboard-section-label">All Time</div>
      <div class="dashboard-metric-grid">
        ${dashboardMetricCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Trips` : "Total Trips", `${monthEntries.length}`, selectedMonth ? "selected month" : "all months", "slate")}
        ${dashboardMetricCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Revenue` : "Total Revenue", `Rs ${formatMoney(totalRevenue)}`, selectedMonth ? "selected month" : "all months", "green")}
        ${dashboardMetricCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Pending` : "Pending Verification", `${pending.length}`, selectedMonth ? "selected month" : "all months", "violet")}
        ${dashboardMetricCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Sand` : "Sand Mined", `${formatWeight(totalWeight)} T`, selectedMonth ? "selected month" : "all months", "orange")}
      </div>

      <div class="dashboard-section-label">Credits vs Debits</div>
      <div class="dashboard-balance-grid">
        ${dashboardBalanceCard("Gross Credits (Revenue)", `Rs ${formatMoney(totalRevenue)}`, `${selectedMonth ? formatMonthLabel(selectedMonth) : "All months"} • ${monthApproved.length} trips`, "green")}
        ${dashboardBalanceCard("Total Debits (Expenses)", `Rs ${formatMoney(totalDebits)}`, `${selectedMonth ? formatMonthLabel(selectedMonth) : "All months"} • ${monthDebits.length} entries`, "red")}
        ${dashboardBalanceCard("Net Position", `Rs ${formatMoney(totalRevenue - totalDebits)}`, "surplus · Credits - Debits", "slate")}
      </div>
      <div class="dashboard-mini-grid">
        ${dashboardMiniCard("Today Credits", `Rs ${formatMoney(monthTodayRevenue)}`, "green")}
        ${dashboardMiniCard("Today Debits", `Rs ${formatMoney(todayDebitTotal)}`, "red")}
        ${dashboardMiniCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Credits` : "This Month Credits", `Rs ${formatMoney(monthRevenue)}`, "blue")}
        ${dashboardMiniCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Debits` : "This Month Debits", `Rs ${formatMoney(monthDebitTotal)}`, "orange")}
      </div>

      <div class="dashboard-chart-block">
        <h4>Monthly Credits vs Debits</h4>
        ${renderBarChart(monthlyCreditSeries, monthlyDebitSeries)}
      </div>

      <div class="dashboard-chart-block">
        <h4>Daily Trips & Revenue</h4>
        ${renderLineChart(last30Series)}
      </div>

      <div class="dashboard-split-grid">
        <div class="dashboard-chart-block">
          <h4>Monthly Revenue</h4>
          ${renderBarChart(monthlyCreditSeries)}
        </div>
        <div class="dashboard-chart-block">
          <h4>Vehicle Type Breakdown</h4>
          ${renderDonutChart(vehicleBreakdown)}
        </div>
      </div>

      <div class="dashboard-chart-block owner-transactions-widget">
        ${renderOwnerTransactionsWidget(monthEntries)}
      </div>

      <div class="dashboard-split-grid">
        <div class="dashboard-chart-block">
          <h4>Payment Mode Distribution</h4>
          ${renderPaymentModeList(paymentModes)}
        </div>
        <div class="dashboard-chart-block">
          <h4>Recent Activity</h4>
          ${renderRecentActivity(recentActivity)}
        </div>
      </div>
    </section>
  `;
}

function dashboardMetricCard(title, value, hint, tone) {
  return `
    <article class="dashboard-metric-card dashboard-tone-${tone}">
      <div class="dashboard-card-copy">
        <span>${title}</span>
        <strong>${value}</strong>
        <small>${hint}</small>
      </div>
      <div class="dashboard-card-icon"></div>
    </article>
  `;
}

function dashboardBalanceCard(title, value, hint, tone) {
  return `
    <article class="dashboard-balance-card dashboard-tone-${tone}">
      <span>${title}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </article>
  `;
}

function dashboardMiniCard(title, value, tone) {
  return `
    <article class="dashboard-mini-card dashboard-tone-${tone}">
      <span>${title}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function dashboardMonthOptions(selectedValue) {
  const months = Array.from(new Set(state.entries.map((entry) => String(entry.date || "").slice(0, 7)).filter(Boolean))).sort();
  const values = ["all", ...months];
  return values.map((value) => `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${value === "all" ? "All months" : formatMonthLabel(value)}</option>`).join("");
}

function sumAmount(rows, ...keys) {
  return rows.reduce((sum, row) => {
    const value = keys.reduce((picked, key) => (picked ? picked : Number(row[key] || 0)), 0);
    return sum + Number(value || 0);
  }, 0);
}

function filterRowsByDateRange(rows, fromDate, toDate, dateKey = "date") {
  const from = String(fromDate || "").slice(0, 10);
  const to = String(toDate || "").slice(0, 10);
  if (!from || !to) return rows;
  return rows.filter((row) => {
    const date = String(row?.[dateKey] || "").slice(0, 10);
    return Boolean(date) && date >= from && date <= to;
  });
}

function buildLast30DaySeries(entries, approvedEntries) {
  const dates = entries
    .map((entry) => String(entry.date || "").slice(0, 10))
    .filter(Boolean)
    .sort();
  if (!dates.length) return [];
  const start = new Date(`${dates[0]}T00:00:00`);
  const end = new Date(`${dates[dates.length - 1]}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const tripMap = distributionMap(entries.filter((entry) => entry.date), (entry) => entry.date);
  const revenueMap = approvedEntries.reduce((acc, entry) => {
    const key = entry.date;
    acc[key] = (acc[key] || 0) + Number(entry.totalAmountInclGst || entry.grossAmount || entry.amountPaid || 0);
    return acc;
  }, {});
  const result = [];
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({
      label: key.slice(5),
      trips: Number(tripMap[key] || 0),
      revenue: Number(revenueMap[key] || 0)
    });
  }
  return result;
}

function monthlyRevenueSeries(rows, amountKey = "totalAmountInclGst") {
  return rows.reduce((acc, row) => {
    const key = String(row.date || "").slice(0, 7);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + Number(row[amountKey] || row.grossAmount || row.amountPaid || 0);
    return acc;
  }, {});
}

function distributionMap(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function breakdownMap(rows, keyFn, amountFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) || "Unknown";
    const amount = Number(amountFn(row) || 0);
    if (!acc[key]) acc[key] = { count: 0, amount: 0 };
    acc[key].count += 1;
    acc[key].amount += amount;
    return acc;
  }, {});
}

function paymentModeDistribution(entries) {
  return entries.reduce((acc, entry) => {
    const key = entry.paymentMode || "Unknown";
    if (!acc[key]) acc[key] = { count: 0, amount: 0 };
    acc[key].count += 1;
    acc[key].amount += Number(entry.totalAmountInclGst || entry.grossAmount || entry.amountPaid || 0);
    return acc;
  }, {});
}

function renderBarChart(primaryMap, secondaryMap = null) {
  const labels = Array.from(new Set([...Object.keys(primaryMap || {}), ...Object.keys(secondaryMap || {})])).sort();
  if (!labels.length) return `<div class="empty">No data available yet.</div>`;
  const primaryValues = labels.map((label) => Number(primaryMap[label] || 0));
  const secondaryValues = labels.map((label) => Number(secondaryMap?.[label] || 0));
  const maxValue = Math.max(1, ...primaryValues, ...secondaryValues);
  const chartWidth = Math.max(520, labels.length * (secondaryMap ? 72 : 56));
  const chartHeight = 220;
  const baseY = 184;
  const barArea = 150;
  const slot = chartWidth / labels.length;
  const barWidth = secondaryMap ? Math.min(22, slot / 3) : Math.min(34, slot / 1.8);
  const svgBars = labels.map((label, index) => {
    const center = slot * index + slot / 2;
    const primaryHeight = (primaryValues[index] / maxValue) * barArea;
    const secondaryHeight = secondaryMap ? (secondaryValues[index] / maxValue) * barArea : 0;
    const primaryValue = primaryValues[index];
    const secondaryValue = secondaryValues[index];
    const primaryX = center - (secondaryMap ? barWidth + 4 : barWidth / 2) + barWidth / 2;
    const secondaryX = center + 4 + barWidth / 2;
    return `
      <g>
        <rect x="${center - (secondaryMap ? barWidth + 4 : barWidth / 2)}" y="${baseY - primaryHeight}" width="${barWidth}" height="${primaryHeight}" rx="4" class="chart-bar-primary"></rect>
        ${secondaryMap ? `<rect x="${center + 4}" y="${baseY - secondaryHeight}" width="${barWidth}" height="${secondaryHeight}" rx="4" class="chart-bar-secondary"></rect>` : ""}
        <text x="${primaryX}" y="${Math.max(16, baseY - primaryHeight - 6)}" text-anchor="middle" class="chart-value-label">${formatMoney(primaryValue)}</text>
        ${secondaryMap ? `<text x="${secondaryX}" y="${Math.max(16, baseY - secondaryHeight - 6)}" text-anchor="middle" class="chart-value-label">${formatMoney(secondaryValue)}</text>` : ""}
        <text x="${center}" y="208" text-anchor="middle" class="chart-axis-label">${formatMonthLabelShort(label)}</text>
      </g>
    `;
  }).join("");
  return `
    <div class="chart-wrap">
      <svg viewBox="0 0 ${chartWidth} ${chartHeight}" class="dashboard-chart-svg" role="img" aria-label="Bar chart">
        <line x1="20" y1="${baseY}" x2="${chartWidth - 20}" y2="${baseY}" class="chart-grid-line"></line>
        ${svgBars}
      </svg>
      ${secondaryMap ? `<div class="chart-legend"><span><i class="legend-primary"></i>Credits (Revenue)</span><span><i class="legend-secondary"></i>Debits (Expenses)</span></div>` : ""}
    </div>
  `;
}

function renderLineChart(series) {
  if (!series.length) return `<div class="empty">No data available yet.</div>`;
  const chartWidth = 900;
  const chartHeight = 260;
  const left = 32;
  const bottom = 210;
  const usableWidth = chartWidth - 72;
  const maxTrips = Math.max(1, ...series.map((item) => item.trips));
  const maxRevenue = Math.max(1, ...series.map((item) => item.revenue));
  const tripPoints = series.map((item, index) => {
    const x = left + (index / Math.max(1, series.length - 1)) * usableWidth;
    const y = bottom - (item.trips / maxTrips) * 150;
    return `${x},${y}`;
  }).join(" ");
  const revenuePoints = series.map((item, index) => {
    const x = left + (index / Math.max(1, series.length - 1)) * usableWidth;
    const y = bottom - (item.revenue / maxRevenue) * 150;
    return `${x},${y}`;
  }).join(" ");
  const labels = series.map((item, index) => {
    const x = left + (index / Math.max(1, series.length - 1)) * usableWidth;
    return `<text x="${x}" y="232" text-anchor="middle" class="chart-axis-label">${item.label}</text>`;
  }).join("");
  const pointLabels = series.map((item, index) => {
    const x = left + (index / Math.max(1, series.length - 1)) * usableWidth;
    const revenueY = bottom - (item.revenue / maxRevenue) * 150;
    const tripsY = bottom - (item.trips / maxTrips) * 150;
    return `
      <g>
        <circle cx="${x}" cy="${revenueY}" r="3" class="chart-point chart-point-revenue"></circle>
        <text x="${x}" y="${Math.max(14, revenueY - 8)}" text-anchor="middle" class="chart-value-label">${formatMoney(item.revenue)}</text>
        <circle cx="${x}" cy="${tripsY}" r="3" class="chart-point chart-point-trips"></circle>
        <text x="${x}" y="${Math.max(14, tripsY - 8)}" text-anchor="middle" class="chart-value-label chart-value-label-muted">${item.trips}</text>
      </g>
    `;
  }).join("");
  const gridLines = [0, 1, 2, 3, 4].map((step) => {
    const y = bottom - (step / 4) * 150;
    return `<line x1="${left}" y1="${y}" x2="${chartWidth - 28}" y2="${y}" class="chart-grid-line"></line>`;
  }).join("");
  return `
    <div class="chart-wrap">
      <svg viewBox="0 0 ${chartWidth} ${chartHeight}" class="dashboard-chart-svg" role="img" aria-label="Daily trips and revenue chart">
        ${gridLines}
        <polyline points="${revenuePoints}" class="chart-line chart-line-revenue"></polyline>
        <polyline points="${tripPoints}" class="chart-line chart-line-trips"></polyline>
        ${pointLabels}
        ${labels}
      </svg>
      <div class="chart-legend"><span><i class="legend-revenue"></i>Revenue (Rs)</span><span><i class="legend-trips"></i>Trips</span></div>
    </div>
  `;
}

function renderDonutChart(map) {
  const items = Object.entries(map).sort(([, a], [, b]) => (b.amount || b) - (a.amount || a));
  if (!items.length) return `<div class="empty">No data available yet.</div>`;
  const totalCount = items.reduce((sum, [, value]) => sum + Number(value.count || value || 0), 0);
  const totalRevenue = items.reduce((sum, [, value]) => sum + Number(value.amount || 0), 0);
  const colors = ["#64748b", "#94a3b8", "#0f766e", "#f59e0b", "#7c3aed", "#ef4444", "#10b981"];
  let offset = 0;
  const rings = items.map(([, value], index) => {
    const weight = Number(value.count || value || 0);
    const length = (weight / Math.max(1, totalCount)) * 100;
    const dash = `${length} ${100 - length}`;
    const segment = `<circle cx="70" cy="70" r="52" fill="none" stroke="${colors[index % colors.length]}" stroke-width="22" stroke-dasharray="${dash}" stroke-dashoffset="${-offset}" pathLength="100"></circle>`;
    offset += length;
    return segment;
  }).join("");
  return `
    <div class="donut-layout">
      <svg viewBox="0 0 140 140" class="donut-chart" role="img" aria-label="Vehicle type breakdown">
        ${rings}
        <circle cx="70" cy="70" r="34" class="donut-hole"></circle>
        <text x="70" y="59" text-anchor="middle" class="donut-subtitle">Revenue</text>
        <text x="70" y="76" text-anchor="middle" class="donut-total">Rs ${formatMoney(totalRevenue)}</text>
        <text x="70" y="92" text-anchor="middle" class="donut-subtitle">${totalCount} entries</text>
      </svg>
      <div class="chart-legend stacked">
        ${items.map(([label, value], index) => {
          const count = Number(value.count || value || 0);
          const amount = Number(value.amount || 0);
          const percentage = Math.round((count / Math.max(1, totalCount)) * 100);
          return `<span><i style="background:${colors[index % colors.length]}"></i>${label} ${count} trips • Rs ${formatMoney(amount)} (${percentage}%)</span>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderOwnerTransactionsWidget(entries) {
  const ownerCategoryMap = entries.reduce((acc, entry) => {
    const ownerName = String(entry.ownerName || "Not Filled").trim() || "Not Filled";
    const vehicleCategory = String(entry.vehicleCategory || "Unknown").trim() || "Unknown";
    const key = `${ownerName}__${vehicleCategory}`;
    if (!acc[key]) {
      acc[key] = {
        ownerName,
        vehicleCategory,
        transactions: 0,
        revenue: 0
      };
    }
    acc[key].transactions += 1;
    acc[key].revenue += Number(entry.totalAmountInclGst || entry.grossAmount || entry.amountPaid || 0);
    return acc;
  }, {});

  const rows = Object.values(ownerCategoryMap)
    .sort((a, b) => b.transactions - a.transactions || a.ownerName.localeCompare(b.ownerName, undefined, { sensitivity: "base" }) || a.vehicleCategory.localeCompare(b.vehicleCategory, undefined, { sensitivity: "base" }))
    .map((row) => ({
      ownerName: row.ownerName,
      vehicleCategory: row.vehicleCategory,
      transactions: row.transactions,
      monthlyRevenue: row.revenue
    }));

  const categoryOptions = Array.from(new Set(rows.map((row) => row.vehicleCategory).filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const ownerQuery = String(state.dashboardOwnerFilterOwner || "").trim().toLowerCase();
  const categoryFilter = String(state.dashboardOwnerFilterCategory || "all");
  const transactionFilter = String(state.dashboardOwnerFilterTransactions || "all");
  const revenueFilter = String(state.dashboardOwnerFilterRevenue || "all");

  const filteredRows = rows.filter((row) => {
    const ownerMatch = !ownerQuery || row.ownerName.toLowerCase().includes(ownerQuery);
    const categoryMatch = categoryFilter === "all" || row.vehicleCategory === categoryFilter;
    const transactionMatch = transactionFilter === "all"
      || (transactionFilter === "100_plus" && row.transactions >= 100)
      || (transactionFilter === "50_99" && row.transactions >= 50 && row.transactions <= 99)
      || (transactionFilter === "below_50" && row.transactions < 50);
    const revenueMatch = revenueFilter === "all"
      || (revenueFilter === "500000_plus" && row.monthlyRevenue >= 500000)
      || (revenueFilter === "200000_499999" && row.monthlyRevenue >= 200000 && row.monthlyRevenue < 500000)
      || (revenueFilter === "below_200000" && row.monthlyRevenue < 200000);
    return ownerMatch && categoryMatch && transactionMatch && revenueMatch;
  });

  const limitedRows = filteredRows.slice(0, 10);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(limitedRows.length / pageSize));
  const safePage = Math.min(Math.max(1, Number(state.dashboardOwnerPage || 1)), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = limitedRows.slice(start, start + pageSize);
  state.dashboardOwnerPage = safePage;

  return `
    <div class="owner-widget-head">
      <h4>Top 10 Owners by Monthly Transactions</h4>
      <div class="owner-widget-filter-wrap">
        <input id="dashboardOwnerFilterOwner" type="text" placeholder="Owner name" value="${escapeAttr(state.dashboardOwnerFilterOwner || "")}" aria-label="Filter by owner name">
        <select id="dashboardOwnerFilterCategory" aria-label="Filter by vehicle category">
          <option value="all" ${categoryFilter === "all" ? "selected" : ""}>All Categories</option>
          ${categoryOptions.map((category) => `<option value="${escapeAttr(category)}" ${categoryFilter === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
        </select>
        <select id="dashboardOwnerFilterTransactions" aria-label="Filter by transactions">
          <option value="all" ${transactionFilter === "all" ? "selected" : ""}>All Transactions</option>
          <option value="100_plus" ${transactionFilter === "100_plus" ? "selected" : ""}>100+</option>
          <option value="50_99" ${transactionFilter === "50_99" ? "selected" : ""}>50-99</option>
          <option value="below_50" ${transactionFilter === "below_50" ? "selected" : ""}>Below 50</option>
        </select>
        <select id="dashboardOwnerFilterRevenue" aria-label="Filter by monthly revenue">
          <option value="all" ${revenueFilter === "all" ? "selected" : ""}>All Revenue</option>
          <option value="500000_plus" ${revenueFilter === "500000_plus" ? "selected" : ""}>Rs 5,00,000+</option>
          <option value="200000_499999" ${revenueFilter === "200000_499999" ? "selected" : ""}>Rs 2,00,000 - 4,99,999</option>
          <option value="below_200000" ${revenueFilter === "below_200000" ? "selected" : ""}>Below Rs 2,00,000</option>
        </select>
      </div>
    </div>
    <div class="owner-widget-table-wrap">
      <table class="owner-widget-table">
        <thead>
          <tr>
            <th>Owner Name <span class="sort-hint">↕</span></th>
            <th>Transactions <span class="sort-hint">↕</span></th>
            <th>Vehicle Category <span class="sort-hint">↕</span></th>
            <th>Monthly Revenue <span class="sort-hint">↕</span></th>
          </tr>
        </thead>
        <tbody>
          ${pageRows.length ? pageRows.map((row) => `
            <tr>
              <td>${escapeHtml(row.ownerName)}</td>
              <td>${row.transactions}</td>
              <td>${escapeHtml(row.vehicleCategory)}</td>
              <td>Rs ${formatMoney(row.monthlyRevenue)}</td>
            </tr>
          `).join("") : `<tr><td colspan="4" class="owner-widget-empty">No owners match current filters.</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="owner-widget-footer">
      <span>Page ${safePage} of ${totalPages}</span>
      <div class="owner-widget-pagination">
        <button type="button" id="ownerWidgetPrev" class="owner-page-btn" ${safePage <= 1 ? "disabled" : ""} aria-label="Previous page">‹</button>
        <button type="button" id="ownerWidgetNext" class="owner-page-btn" ${safePage >= totalPages ? "disabled" : ""} aria-label="Next page">›</button>
      </div>
    </div>
  `;
}

function renderAppPreservingViewport(options = {}) {
  const { focusSelector = "", cursorAtEnd = false } = options;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  renderApp();
  window.scrollTo(scrollX, scrollY);
  if (focusSelector) {
    const target = document.querySelector(focusSelector);
    if (target && typeof target.focus === "function") {
      target.focus({ preventScroll: true });
      if (cursorAtEnd && typeof target.value === "string" && typeof target.setSelectionRange === "function") {
        const end = target.value.length;
        target.setSelectionRange(end, end);
      }
    }
  }
}

function renderPaymentModeList(map) {
  const items = Object.entries(map).sort(([, a], [, b]) => b.amount - a.amount);
  if (!items.length) return `<div class="empty">No payment data available yet.</div>`;
  const maxAmount = Math.max(1, ...items.map(([, value]) => value.amount));
  return `
    <div class="payment-mode-list">
      ${items.map(([label, value]) => `
        <div class="payment-mode-row">
          <div class="payment-mode-top">
            <strong>${label}</strong>
            <span>${value.count} trips • Rs ${formatMoney(value.amount)}</span>
          </div>
          <div class="payment-mode-bar"><span style="width:${(value.amount / maxAmount) * 100}%"></span></div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderRecentActivity(entries) {
  if (!entries.length) return `<div class="empty">No recent activity yet.</div>`;
  return `
    <div class="recent-activity-list">
      ${entries.map((entry) => `
        <article class="recent-activity-item">
          <div>
            <strong>${escapeHtml(entry.vehicleNumber || entry.receiptNumber || entry.id)}</strong>
            <div class="recent-activity-meta">${escapeHtml(entry.driverName || entry.ownerName || "-")}</div>
          </div>
          <div class="recent-activity-side">
            <strong>Rs ${formatMoney(Number(entry.totalAmountInclGst || entry.grossAmount || entry.amountPaid || 0))}</strong>
            <span class="badge ${entry.status === "Approved" ? "approved" : entry.status === "Rejected" ? "rejected" : "pending"}">${escapeHtml((entry.status || "Pending").replace("Pending Review", "Pending"))}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function formatMonthLabel(value) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return value || "";
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
}

function formatMonthLabelShort(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}$/.test(value)) {
    return new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }
  if (/^\d{2}-\d{2}$/.test(value)) {
    const [month, day] = value.split("-");
    return `${day}/${month}`;
  }
  return value;
}

function renderAdmin() {
  const ownerList = state.owners
    .filter((owner) => {
      const query = state.ownerSearch.trim().toLowerCase();
      if (!query) return true;
      return [owner.name, owner.phone, owner.address].some((value) => String(value || "").toLowerCase().includes(query));
    });
  const activeOwnerName = state.activeOwnerName || state.ownerDraft?.name || "";
  const activeFleetDetails = state.fleetDetails.filter((fleet) => fleet.ownerName === activeOwnerName);
  const ownerDraft = state.ownerDraft || { name: "", phone: "", address: "" };
  const fleetDraft = state.fleetDraft || { ownerName: activeOwnerName, vehicleNumber: "", vehicleCategory: "", vehicleType: "", status: "Active", notes: "" };
  return `
    <div class="admin-stack">
      <div class="admin-tab-row">
        ${[
          ["users", "User Master"],
          ["owners", "Owner Master"],
          ["ownerAdvances", "Owner Advances"]
        ].map(([tab, label]) => `
          <button type="button" class="admin-tab-chip ${state.adminTab === tab ? "active" : ""}" data-admin-tab="${tab}">${label}</button>
        `).join("")}
      </div>

      ${state.adminTab === "users" ? `
      <section class="card admin-section">
        <div class="admin-section-head">
          <div>
            <h3>User Master</h3>
            <p>Add and manage application users.</p>
          </div>
        </div>
        <div class="grid two">
          <div class="card admin-inner-card">
            <h3>Add User</h3>
            <form id="userForm">
              ${field("fullName", "Full Name", "text", "", { placeholder: "e.g. Virendra Singh" })}
              ${field("username", "User Name", "text", "")}
              ${field("password", "Temporary Password", "text", "")}
              <div class="field"><label>Role</label><select name="role">
                <option value="staff">Staff</option>
                <option value="reviewer">Reviewer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select></div>
              <button type="submit" class="solid-action">Create User</button>
            </form>
          </div>
          <div class="card admin-inner-card">
            <h3>System Setup</h3>
            <p><strong>Storage:</strong> ${state.config.demoMode ? "Demo memory storage" : "Google Sheets and Drive"}</p>
            <p>Connected sheet tabs: Daily Entry Form, Owner Master, Owner Fleet Details, Owner Advance, Users, Reviewed Entries, and Receipt Registry.</p>
            <p><strong>Health:</strong> ${state.health?.googleConnected ? "OK" : "Failed"}</p>
            ${state.health?.driveFolder ? `<p><strong>Drive folder:</strong> ${state.health.driveFolder.name || state.health.driveFolder.id}</p>` : ""}
            ${state.health?.error ? `<p><strong>Health error:</strong> ${state.health.error.message || state.health.error}</p>` : ""}
          </div>
        </div>
        <div>
          ${renderUsersTable()}
        </div>
      </section>
      ` : state.adminTab === "ownerAdvances" ? `
      <section class="card admin-section">
        <div class="admin-section-head">
          <div>
            <h3>Owner Advances</h3>
            <p>Record advance credits received from owners. Multiple credits can be added for the same owner.</p>
          </div>
        </div>
        <div class="grid two">
          <div class="card admin-inner-card">
            <h3>${state.ownerAdvanceDraft ? "Edit Owner Advance" : "Add Owner Advance"}</h3>
            <form id="ownerAdvanceForm">
              ${renderOwnerAdvanceOwnerField(state.ownerAdvanceDraft || {})}
              <div class="grid two">
                ${field("ownerAdvanceDate", "Date", "date", state.ownerAdvanceDraft?.date || new Date().toISOString().slice(0, 10), {})}
                ${field("ownerAdvanceAmount", "Amount (Rs.)", "number", state.ownerAdvanceDraft?.amount || "", { step: "0.01", placeholder: "0" })}
              </div>
              ${field("ownerAdvanceCurrentBalance", "Current Balance (optional)", "number", state.ownerAdvanceDraft?.currentBalance || "", { step: "0.01", required: false, placeholder: "Set exact balance if owner had previous used advances" })}
              ${selectField("ownerAdvancePaymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer", "Credit", "Advance"], state.ownerAdvanceDraft?.paymentMode || "Cash")}
              ${textareaField("ownerAdvanceNotes", "Notes (optional)", state.ownerAdvanceDraft?.notes || "", "Add context for this credit...", false)}
              <div class="actions">
                <button type="submit" class="solid-action">${state.ownerAdvanceDraft ? "Update Advance Credit" : "Add Advance Credit"}</button>
                ${state.ownerAdvanceDraft ? `<button type="button" class="secondary visible-secondary" id="cancelOwnerAdvanceEdit">Cancel</button>` : ""}
              </div>
            </form>
          </div>
          <div class="card admin-inner-card">
            <h3>Advance Credits History</h3>
            <div class="grid three">
              ${selectField(
                "ownerAdvanceFilterOwner",
                "Filter by Owner",
                state.owners
                  .map((owner) => String(owner.name || "").trim())
                  .filter(Boolean)
                  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
                state.ownerAdvanceFilterOwner || "",
                "All Owners"
              )}
              ${field("ownerAdvanceFilterFrom", "From Date", "date", state.ownerAdvanceFilterFrom || "", { required: false })}
              ${field("ownerAdvanceFilterTo", "To Date", "date", state.ownerAdvanceFilterTo || "", { required: false })}
            </div>
            ${renderOwnerAdvancesTable()}
          </div>
        </div>
      </section>
      ` : `
      <section class="card admin-section">
        <div class="admin-section-head">
          <div>
            <h3>Owner Master</h3>
            <p>Add and update owners from the Owner Master sheet tab. Fleet details for the selected owner are managed here as part of owner details.</p>
          </div>
        </div>
        <div class="admin-owner-layout">
          <div class="admin-form-pane">
            <form id="ownerForm">
              ${field("name", "Owner Name", "text", ownerDraft.name || "")}
              ${field("phone", "Phone Number", "tel", ownerDraft.phone || "", { required: false, placeholder: "10-digit mobile number" })}
              ${field("address", "Address", "text", ownerDraft.address || "", { required: false, placeholder: "Owner address" })}
              <div class="actions">
                <button type="submit" class="solid-action">${state.ownerDraft ? "Update Owner" : "Add Owner"}</button>
                ${state.ownerDraft ? `<button type="button" class="secondary visible-secondary" id="cancelOwnerEdit">Cancel</button>` : ""}
              </div>
            </form>
            <div class="admin-owner-fleet-block">
              <div class="admin-list-head">
                <h4>Fleet Details</h4>
                <span>${activeOwnerName ? `${activeFleetDetails.length} for ${activeOwnerName}` : "Select owner first"}</span>
              </div>
              ${activeOwnerName ? `
              <form id="fleetForm">
                ${field("ownerNameDisplay", "Owner Name", "text", activeOwnerName, { readonly: true, required: false })}
                <input type="hidden" name="ownerName" value="${escapeAttr(activeOwnerName)}">
                <div class="grid two">
                  ${field("vehicleNumber", "Vehicle Number", "text", fleetDraft.vehicleNumber || "", { placeholder: "RJ 24 RA 7986" })}
                  ${selectField("vehicleCategory", "Vehicle Category", ["Tractor", "Dumper"], fleetDraft.vehicleCategory || "", "Select category")}
                </div>
                <div class="grid two">
                  ${field("vehicleType", "Vehicle Type", "text", fleetDraft.vehicleType || "", { required: false, placeholder: "Commercial / 10 Wheels" })}
                  ${selectField("status", "Status", ["Active", "Inactive"], fleetDraft.status || "Active")}
                </div>
                ${textareaField("notes", "Notes (optional)", fleetDraft.notes || "", "Extra fleet details...", false)}
                <div class="actions">
                  <button type="submit" class="solid-action">${state.fleetDraft ? "Update Fleet" : "Add Fleet"}</button>
                  ${state.fleetDraft ? `<button type="button" class="secondary visible-secondary" id="cancelFleetEdit">Cancel</button>` : ""}
                </div>
              </form>
              ${renderFleetTable(activeFleetDetails, activeOwnerName)}
              ` : `<div class="empty compact">Create or select an owner to add fleet details.</div>`}
            </div>
          </div>
          <div class="admin-list-pane">
            <div class="admin-list-head">
              <h4>Owners</h4>
              <span id="ownerListCount">${ownerList.length} shown</span>
            </div>
            <div class="field admin-search-field">
              <label>Search Owner</label>
              <input id="ownerSearchInput" type="text" value="${escapeAttr(state.ownerSearch)}" placeholder="Search by owner, phone, or address">
            </div>
            <div class="admin-scroll-panel">
              ${renderOwnersTable(ownerList)}
            </div>
          </div>
        </div>
      </section>
      `}
    </div>
  `;
}

function renderOwnerAdvanceOwnerField(draft = {}) {
  const ownerNames = state.owners
    .map((owner) => String(owner.name || "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const ownerValue = String(draft.ownerName || "").trim();
  const listOptions = ownerValue && !ownerNames.some((name) => name.toLowerCase() === ownerValue.toLowerCase())
    ? [ownerValue, ...ownerNames]
    : ownerNames;
  return `
    <div class="field">
      <label>Owner Name <span>*</span></label>
      <input type="text" name="ownerName" list="ownerAdvanceOwnerOptions" value="${escapeAttr(ownerValue)}" placeholder="Search or select owner" required autocomplete="off">
      <datalist id="ownerAdvanceOwnerOptions">
        ${listOptions.map((name) => `<option value="${escapeAttr(name)}"></option>`).join("")}
      </datalist>
    </div>
  `;
}

function renderOwnerAdvancesTable() {
  const ownerQuery = String(state.ownerAdvanceFilterOwner || "").trim().toLowerCase();
  const fromDate = String(state.ownerAdvanceFilterFrom || "").trim();
  const toDate = String(state.ownerAdvanceFilterTo || "").trim();
  const rows = [...(state.ownerAdvances || [])]
    .filter((entry) => {
      const ownerName = String(entry.ownerName || "").toLowerCase();
      const entryDate = String(entry.date || entry.createdDate || "").slice(0, 10);
      if (ownerQuery && !ownerName.includes(ownerQuery)) return false;
      if (fromDate && entryDate && entryDate < fromDate) return false;
      if (toDate && entryDate && entryDate > toDate) return false;
      return true;
    })
    .sort((a, b) => String(b.date || b.createdDate || "").localeCompare(String(a.date || a.createdDate || "")));

  const pageSize = 10;
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(Math.max(1, Number(state.ownerAdvancePage || 1)), totalPages);
  const startIndex = totalRows ? (currentPage - 1) * pageSize : 0;
  const endIndex = totalRows ? Math.min(startIndex + pageSize, totalRows) : 0;
  const pagedRows = rows.slice(startIndex, endIndex);
  state.ownerAdvancePage = currentPage;

  if (!rows.length) return `<div class="empty compact">No owner advances recorded yet.</div>`;
  return `
    <div class="actions" style="justify-content: space-between; margin-bottom: 10px;">
      <span class="badge">Showing ${startIndex + 1}-${endIndex} of ${totalRows}</span>
      <div class="actions">
        <button type="button" class="secondary visible-secondary" id="ownerAdvancePrev" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>
        <span class="badge">Page ${currentPage} / ${totalPages}</span>
        <button type="button" class="secondary visible-secondary" id="ownerAdvanceNext" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Date</th><th>Owner</th><th>Amount</th><th>Current Balance</th><th>Payment Mode</th><th>Notes</th><th>Created By</th><th>Actions</th></tr></thead>
        <tbody>
          ${pagedRows.map((entry) => `
            <tr>
              <td>${escapeHtml(entry.ownerAdvanceId || "-")}</td>
              <td>${escapeHtml(entry.date || entry.createdDate || "-")}</td>
              <td>${escapeHtml(entry.ownerName || "-")}</td>
              <td>Rs. ${formatMoney(Number(entry.amount || 0))}</td>
              <td>Rs. ${formatMoney(Number(entry.currentBalance || 0))}</td>
              <td>${escapeHtml(entry.paymentMode || "-")}</td>
              <td>${escapeHtml(entry.notes || "-")}</td>
              <td>${escapeHtml(entry.createdBy || "-")}</td>
              <td><button type="button" class="secondary visible-secondary" data-edit-owner-advance="${escapeAttr(entry.ownerAdvanceId || "")}">Edit</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderUsersTable() {
  if (!state.users.length) return `<div class="empty">No users loaded yet.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Full Name</th><th>User Name</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.users.map((user) => `
            <tr>
              <td>${user.name}</td>
              <td>${user.username || user.email}</td>
              <td>${user.role}</td>
              <td><span class="badge ${user.active === "false" ? "rejected" : "approved"}">${user.active === "false" ? "Disabled" : "Active"}</span></td>
              <td class="actions">
                <button class="secondary visible-secondary" data-user-reset="${user.id}">Reset Password</button>
                <button class="${user.active === "false" ? "secondary visible-secondary" : "danger"}" data-user-toggle="${user.id}" data-active="${user.active === "false" ? "true" : "false"}">${user.active === "false" ? "Enable" : "Disable"}</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderOwnersTable(owners = state.owners) {
  if (!owners.length) return `<div class="empty">No owners loaded yet.</div>`;
  return `
    <div class="table-wrap owner-table-wrap">
      <table>
        <thead><tr><th>Owner Name</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody>
          ${owners.map((owner) => `
            <tr data-owner-row>
              <td>${escapeHtml(owner.name)}</td>
              <td>${escapeHtml(owner.phone || "-")}</td>
              <td>${escapeHtml(owner.address || "-")}</td>
              <td><button class="secondary visible-secondary" data-edit-owner="${escapeAttr(owner.name)}">Edit</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFleetTable(fleetDetails = state.fleetDetails, activeOwnerName = "") {
  if (!activeOwnerName) return `<div class="empty">Pick an owner to view fleet details.</div>`;
  if (!fleetDetails.length) return `<div class="empty">No fleet details loaded yet for ${escapeHtml(activeOwnerName)}.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Fleet ID</th><th>Owner Name</th><th>Vehicle Number</th><th>Category</th><th>Type</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody>
          ${fleetDetails.map((fleet) => `
            <tr>
              <td>${escapeHtml(fleet.fleetId)}</td>
              <td>${escapeHtml(fleet.ownerName)}</td>
              <td>${escapeHtml(fleet.vehicleNumber)}</td>
              <td>${escapeHtml(fleet.vehicleCategory || "-")}</td>
              <td>${escapeHtml(fleet.vehicleType || "-")}</td>
              <td>${escapeHtml(fleet.status || "Active")}</td>
              <td>${escapeHtml(fleet.notes || "-")}</td>
              <td><button class="secondary visible-secondary" data-edit-fleet="${escapeAttr(fleet.fleetId)}">Edit</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function bindView() {
  document.querySelector("#toggleReviewSidebar")?.addEventListener("click", () => {
    state.reviewSidebarOpen = !state.reviewSidebarOpen;
    renderApp();
  });

  document.querySelector("#dashboardMonthSelect")?.addEventListener("change", (event) => {
    state.dashboardMonth = event.currentTarget.value || "all";
    renderApp();
  });

  document.querySelector("#dashboardOwnerFilterOwner")?.addEventListener("input", (event) => {
    state.dashboardOwnerFilterOwner = String(event.currentTarget.value || "");
    state.dashboardOwnerPage = 1;
    renderAppPreservingViewport({ focusSelector: "#dashboardOwnerFilterOwner", cursorAtEnd: true });
  });

  document.querySelector("#dashboardOwnerFilterCategory")?.addEventListener("change", (event) => {
    state.dashboardOwnerFilterCategory = String(event.currentTarget.value || "all");
    state.dashboardOwnerPage = 1;
    renderAppPreservingViewport({ focusSelector: "#dashboardOwnerFilterCategory" });
  });

  document.querySelector("#dashboardOwnerFilterTransactions")?.addEventListener("change", (event) => {
    state.dashboardOwnerFilterTransactions = String(event.currentTarget.value || "all");
    state.dashboardOwnerPage = 1;
    renderAppPreservingViewport({ focusSelector: "#dashboardOwnerFilterTransactions" });
  });

  document.querySelector("#dashboardOwnerFilterRevenue")?.addEventListener("change", (event) => {
    state.dashboardOwnerFilterRevenue = String(event.currentTarget.value || "all");
    state.dashboardOwnerPage = 1;
    renderAppPreservingViewport({ focusSelector: "#dashboardOwnerFilterRevenue" });
  });

  document.querySelector("#ownerWidgetPrev")?.addEventListener("click", () => {
    state.dashboardOwnerPage = Math.max(1, Number(state.dashboardOwnerPage || 1) - 1);
    renderAppPreservingViewport();
  });

  document.querySelector("#ownerWidgetNext")?.addEventListener("click", () => {
    state.dashboardOwnerPage = Number(state.dashboardOwnerPage || 1) + 1;
    renderAppPreservingViewport();
  });

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.adminTab = button.dataset.adminTab;
      renderApp();
    });
  });

  document.querySelector("#ownerSearchInput")?.addEventListener("input", (event) => {
    state.ownerSearch = event.currentTarget.value || "";
    const query = state.ownerSearch.trim().toLowerCase();
    const rows = document.querySelectorAll("[data-owner-row]");
    let visibleCount = 0;
    rows.forEach((row) => {
      const matches = !query || row.textContent.toLowerCase().includes(query);
      row.style.display = matches ? "" : "none";
      if (matches) visibleCount += 1;
    });
    const countNode = document.querySelector("#ownerListCount");
    if (countNode) countNode.textContent = `${visibleCount} shown`;
  });

  document.querySelector("[name='ownerAdvanceFilterOwner']")?.addEventListener("change", (event) => {
    state.ownerAdvanceFilterOwner = event.currentTarget.value || "";
    state.ownerAdvancePage = 1;
    renderApp();
  });

  document.querySelector("[name='ownerAdvanceFilterFrom']")?.addEventListener("change", (event) => {
    state.ownerAdvanceFilterFrom = event.currentTarget.value || "";
    state.ownerAdvancePage = 1;
    renderApp();
  });

  document.querySelector("[name='ownerAdvanceFilterTo']")?.addEventListener("change", (event) => {
    state.ownerAdvanceFilterTo = event.currentTarget.value || "";
    state.ownerAdvancePage = 1;
    renderApp();
  });

  document.querySelector("#ownerAdvancePrev")?.addEventListener("click", () => {
    state.ownerAdvancePage = Math.max(1, Number(state.ownerAdvancePage || 1) - 1);
    renderApp();
  });

  document.querySelector("#ownerAdvanceNext")?.addEventListener("click", () => {
    state.ownerAdvancePage = Number(state.ownerAdvancePage || 1) + 1;
    renderApp();
  });

  document.querySelectorAll("[data-edit-owner-advance]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = state.ownerAdvances.find((entry) => entry.ownerAdvanceId === button.dataset.editOwnerAdvance);
      if (!record) return;
      state.ownerAdvanceDraft = { ...record, currentBalance: record.currentBalance || "" };
      renderApp();
    });
  });

  document.querySelector("#cancelOwnerAdvanceEdit")?.addEventListener("click", () => {
    state.ownerAdvanceDraft = null;
    renderApp();
  });

  const ownerAdvanceAmountInput = document.querySelector("[name='ownerAdvanceAmount']");
  const ownerAdvanceCurrentBalanceInput = document.querySelector("[name='ownerAdvanceCurrentBalance']");
  if (ownerAdvanceAmountInput && ownerAdvanceCurrentBalanceInput) {
    ownerAdvanceCurrentBalanceInput.dataset.lastAutoValue = ownerAdvanceCurrentBalanceInput.value || "";

    const syncOwnerAdvanceCurrentBalance = () => {
      if (state.ownerAdvanceDraft) return;
      const nextAmount = String(ownerAdvanceAmountInput.value || "");
      const currentValue = String(ownerAdvanceCurrentBalanceInput.value || "");
      const lastAutoValue = String(ownerAdvanceCurrentBalanceInput.dataset.lastAutoValue || "");
      if (!currentValue || currentValue === lastAutoValue) {
        ownerAdvanceCurrentBalanceInput.value = nextAmount;
        ownerAdvanceCurrentBalanceInput.dataset.lastAutoValue = nextAmount;
      }
    };

    ownerAdvanceAmountInput.addEventListener("input", syncOwnerAdvanceCurrentBalance);

    ownerAdvanceCurrentBalanceInput.addEventListener("input", () => {
      if (state.ownerAdvanceDraft) return;
      const amountValue = String(ownerAdvanceAmountInput.value || "");
      const balanceValue = String(ownerAdvanceCurrentBalanceInput.value || "");
      if (!balanceValue || balanceValue === amountValue) {
        ownerAdvanceCurrentBalanceInput.dataset.lastAutoValue = balanceValue;
      }
    });

    syncOwnerAdvanceCurrentBalance();
  }

  document.querySelector("#ownerAdvanceForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      ownerName: form.querySelector("[name='ownerName']")?.value || "",
      amount: form.querySelector("[name='ownerAdvanceAmount']")?.value || 0,
      currentBalance: form.querySelector("[name='ownerAdvanceCurrentBalance']")?.value || "",
      paymentMode: form.querySelector("[name='ownerAdvancePaymentMode']")?.value || "Cash",
      date: form.querySelector("[name='ownerAdvanceDate']")?.value || new Date().toISOString().slice(0, 10),
      notes: form.querySelector("[name='ownerAdvanceNotes']")?.value || ""
    };
    const button = submitButtonFor(form, event);
    try {
      await runWithButton(button, "Saving...", async () => {
        const editingId = state.ownerAdvanceDraft?.ownerAdvanceId || "";
        if (editingId) {
          await api(`/api/owner-advances/${encodeURIComponent(editingId)}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          });
        } else {
          await api("/api/owner-advances", {
            method: "POST",
            body: JSON.stringify(payload)
          });
        }
        state.ownerAdvanceDraft = null;
        state.ownerAdvancePage = 1;
        await Promise.all([loadOwnerAdvances(), loadOwners()]);
        renderApp();
      });
    } catch (error) {
      alert(error.message);
    }
  });

  document.querySelector("#reviewOwnerFilter")?.addEventListener("change", (event) => {
    state.reviewOwnerFilter = event.currentTarget.value || "";
    state.selectedReviewIds = [];
    state.selectedEntry = null;
    state.reviewPage = 1;
    renderApp();
  });

  document.querySelector("#reviewPaymentFilter")?.addEventListener("change", (event) => {
    state.reviewPaymentFilter = event.currentTarget.value || "";
    state.selectedReviewIds = [];
    state.selectedEntry = null;
    state.reviewPage = 1;
    renderApp();
  });

  document.querySelector("#reviewVehicleCategoryFilter")?.addEventListener("change", (event) => {
    state.reviewVehicleCategoryFilter = event.currentTarget.value || "";
    state.selectedReviewIds = [];
    state.selectedEntry = null;
    state.reviewPage = 1;
    renderApp();
  });

  document.querySelector("#reviewPageSize")?.addEventListener("change", (event) => {
    const nextSize = Number(event.currentTarget.value || 10);
    state.reviewPageSize = REVIEW_PAGE_SIZE_OPTIONS.includes(nextSize) ? nextSize : 10;
    state.reviewPage = 1;
    renderApp();
  });

  document.querySelector("#reviewPagePrev")?.addEventListener("click", () => {
    state.reviewPage = Math.max(1, Number(state.reviewPage || 1) - 1);
    renderApp();
  });

  document.querySelector("#reviewPageNext")?.addEventListener("click", () => {
    state.reviewPage = Number(state.reviewPage || 1) + 1;
    renderApp();
  });

  const entryForm = document.querySelector("#entryForm");
  if (entryForm) {
    const updateTotal = () => {
      const form = new FormData(entryForm);
      const tare = Number(form.get("tareWeightTons") || 0);
      const gross = Number(form.get("grossWeightTons") || 0);
      const net = Math.max(0, gross - tare);
      const netInput = entryForm.querySelector("[name='netWeightTons']");
      if (netInput && !netInput.matches(":focus")) netInput.value = net ? net.toFixed(2) : "";
      const total = Number(form.get("totalAmountInclGst") || 0);
      const mineralAmount = total > 0 ? total / 1.05 : 0;
      const mineralInput = entryForm.querySelector("[name='amountPaid']");
      if (mineralInput && !mineralInput.matches(":focus")) mineralInput.value = mineralAmount ? mineralAmount.toFixed(2) : "";
      const totalInput = entryForm.querySelector("[name='totalAmountInclGst']");
      const badge = document.querySelector("#formTotal");
      if (badge) badge.textContent = `Total incl. GST: Rs. ${formatMoney(total)}`;
    };
    entryForm.addEventListener("input", updateTotal);
    setupOwnerSearchDropdown(entryForm);
    entryForm.addEventListener("change", () => syncOwnerDetails(entryForm));
    entryForm.querySelector("[name='vehicleCategory']")?.addEventListener("change", () => syncVehicleTypeField(entryForm));
    updateTotal();
    syncOwnerDetails(entryForm);
    syncVehicleTypeField(entryForm);
    entryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const ownerName = String(entryForm.querySelector("[name='ownerName']")?.value || "").trim();
      const paymentMode = String(entryForm.querySelector("[name='paymentMode']")?.value || "").trim();
      if (ownerName && paymentMode.toLowerCase() === "advance") {
        const owner = state.owners.find((item) => String(item.name || "").trim().toLowerCase() === ownerName.toLowerCase());
        const currentBalance = Number(owner?.currentBalance || 0);
        if (!owner || currentBalance <= 0) {
          alert(`Advance payment is not allowed for ${ownerName} because Current Balance is zero.`);
          return;
        }
      }
      const button = submitButtonFor(entryForm, event);
      try {
        await runWithButton(button, state.selectedEntry ? "Saving..." : "Submitting...", async () => {
          const payload = await formPayload(entryForm);
          if (state.selectedEntry) {
            const updated = await api(`/api/entries/${state.selectedEntry.id}`, { method: "PATCH", body: payload });
            state.selectedEntry = updated.entry;
            await Promise.all([loadEntries(), loadOwners(), loadNextReceipt()]);
          } else {
            const created = await api("/api/entries", { method: "POST", body: payload });
            state.nextReceiptNumber = created.nextReceiptNumber || "";
            await Promise.all([loadEntries(), loadOwners()]);
          }
          renderApp();
        });
      } catch (error) {
        alert(error.message);
      }
    });
  }

  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedEntry = state.entries.find((entry) => entry.id === button.dataset.select);
      renderApp();
    });
  });

  document.querySelectorAll("[data-inline-review-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const entry = state.entries.find((item) => item.id === button.dataset.entryId);
      if (!entry) return;
      try {
        const busyLabel = button.dataset.inlineReviewAction === "Approved" ? "Verifying..." : "Rejecting...";
        setGlobalButtonLock(true, button, busyLabel);
        await api(`/api/entries/${entry.id}/review`, {
          method: "POST",
          body: JSON.stringify({
            status: button.dataset.inlineReviewAction,
            reviewerNotes: entry.reviewerNotes || "",
            amountPaid: entry.totalAmountInclGst,
            paymentMode: entry.paymentMode
          })
        });
        state.selectedReviewIds = state.selectedReviewIds.filter((id) => id !== entry.id);
        if (state.selectedEntry?.id === entry.id) state.selectedEntry = null;
        await Promise.all([loadEntries(), loadOwners()]);
        renderApp();
      } catch (error) {
        alert(error.message);
      } finally {
        setGlobalButtonLock(false, button);
      }
    });
  });

  document.querySelectorAll("[data-review-date]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reviewDate = button.dataset.reviewDate;
      state.selectedEntry = null;
      state.selectedReviewIds = [];
      state.reviewPage = 1;
      renderApp();
    });
  });

  document.querySelectorAll("[data-calendar-shift]").forEach((button) => {
    button.addEventListener("click", () => {
      const shift = Number(button.dataset.calendarShift || 0);
      const [year, month] = String(state.reviewDate || "").split("-").map((part) => Number(part));
      if (!Number.isFinite(year) || !Number.isFinite(month)) return;
      const nextMonthIndex = month - 1 + shift;
      const nextDate = new Date(year, nextMonthIndex, 1);
      const nextIso = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-01`;
      state.reviewDate = nextIso;
      state.selectedEntry = null;
      state.selectedReviewIds = [];
      state.reviewPage = 1;
      renderApp();
    });
  });

  document.querySelectorAll("[data-review-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reviewFilter = button.dataset.reviewFilter;
      state.selectedEntry = null;
      state.selectedReviewIds = [];
      state.reviewPage = 1;
      if (["Consolidated Credits", "Debit Entries"].includes(state.reviewFilter)) {
        state.reviewOwnerFilter = "";
        state.reviewPaymentFilter = "";
        state.reviewVehicleCategoryFilter = "";
      }
      renderApp();
    });
  });

  document.querySelectorAll("[data-toggle-review-selection]").forEach((input) => {
    input.addEventListener("change", () => {
      const entryId = input.dataset.toggleReviewSelection;
      if (!entryId || input.disabled) return;
      if (input.checked) {
        state.selectedReviewIds = Array.from(new Set([...state.selectedReviewIds, entryId]));
      } else {
        state.selectedReviewIds = state.selectedReviewIds.filter((id) => id !== entryId);
      }
      renderApp();
    });
  });

  document.querySelector("#clearSelectedReviews")?.addEventListener("click", () => {
    state.selectedReviewIds = [];
    renderApp();
  });

  document.querySelector("#openDebitDialog")?.addEventListener("click", () => {
    state.debitDraft = {
      date: state.reviewDate,
      description: "",
      amount: "",
      category: "Miscellaneous",
      paymentMode: "Cash",
      paidTo: "",
      notes: ""
    };
    renderApp();
  });

  document.querySelector("#createConsolidatedCredit")?.addEventListener("click", () => {
    const selectedEntries = state.entries.filter((entry) => state.selectedReviewIds.includes(entry.id));
    if (!selectedEntries.length) return;
    state.consolidatedCreditDraft = {
      entryIds: selectedEntries.map((entry) => entry.id),
      entries: selectedEntries,
      totalAmount: selectedEntries.reduce((sum, entry) => sum + Number(entry.totalAmountInclGst || entry.grossAmount || 0), 0),
      receivedBy: state.user.name || "",
      paymentMode: "Cash",
      notes: "",
      date: state.reviewDate
    };
    renderApp();
  });

  document.querySelectorAll("[data-close-consolidated-credit]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.currentTarget !== event.target && event.currentTarget.hasAttribute("data-close-consolidated-credit")) return;
      state.consolidatedCreditDraft = null;
      renderApp();
    });
  });

  document.querySelectorAll("[data-close-debit-dialog]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.currentTarget !== event.target && event.currentTarget.hasAttribute("data-close-debit-dialog")) return;
      state.debitDraft = null;
      renderApp();
    });
  });

  document.querySelector("#debitEntryForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      date: form.querySelector("[name='debitDate']")?.value || state.reviewDate,
      description: form.querySelector("[name='debitDescription']")?.value || "",
      amount: form.querySelector("[name='debitAmount']")?.value || 0,
      category: form.querySelector("[name='debitCategory']")?.value || "Miscellaneous",
      paymentMode: form.querySelector("[name='debitPaymentMode']")?.value || "Cash",
      paidTo: form.querySelector("[name='debitPaidTo']")?.value || "",
      notes: form.querySelector("[name='debitNotes']")?.value || ""
    };
    try {
      await api("/api/debit-entries", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      state.debitDraft = null;
      await loadDebitEntries();
      renderApp();
    } catch (error) {
      alert(error.message);
    }
  });

  document.querySelector("#consolidatedCreditForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.consolidatedCreditDraft) return;
    const form = event.currentTarget;
    const payload = {
      entryIds: state.consolidatedCreditDraft.entryIds,
      totalAmount: form.querySelector("[name='consolidatedTotalAmount']")?.value || 0,
      receivedBy: form.querySelector("[name='consolidatedReceivedBy']")?.value || "",
      paymentMode: form.querySelector("[name='consolidatedPaymentMode']")?.value || "Cash",
      notes: form.querySelector("[name='consolidatedNotes']")?.value || ""
    };
    try {
      await api("/api/consolidated-entries", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      state.selectedReviewIds = [];
      state.consolidatedCreditDraft = null;
      renderApp();
    } catch (error) {
      alert(error.message);
    }
  });

  document.querySelectorAll("[data-close-review]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.currentTarget !== event.target && event.currentTarget.hasAttribute("data-close-review")) return;
      state.selectedEntry = null;
      renderApp();
    });
  });

  const transactionList = document.querySelector("#transactionList");
  const updateTransactionTotal = () => {
    const totalNode = document.querySelector("#transactionTotal");
    if (!transactionList || !totalNode) return;
    const total = collectReviewTransactions().reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    totalNode.textContent = `Rs. ${formatMoney(total)}`;
  };

  document.querySelector("#addTransactionBtn")?.addEventListener("click", () => {
    if (!transactionList) return;
    transactionList.insertAdjacentHTML("beforeend", transactionRowTemplate(transactionList.querySelectorAll("[data-transaction-row]").length));
    bindTransactionRowEvents();
    updateTransactionTotal();
  });

  function bindTransactionRowEvents() {
    document.querySelectorAll("[data-remove-transaction]").forEach((button) => {
      button.onclick = () => {
        button.closest("[data-transaction-row]")?.remove();
        syncTransactionRemoveState();
        updateTransactionTotal();
      };
    });
    transactionList?.querySelectorAll("input, select").forEach((fieldNode) => {
      fieldNode.oninput = updateTransactionTotal;
      fieldNode.onchange = updateTransactionTotal;
    });
    syncTransactionRemoveState();
  }

  function syncTransactionRemoveState() {
    const rows = document.querySelectorAll("[data-transaction-row]");
    rows.forEach((row, index) => {
      const button = row.querySelector("[data-remove-transaction]");
      if (button) button.disabled = rows.length === 1 || index === 0;
    });
  }

  bindTransactionRowEvents();

  document.querySelectorAll("[data-review-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!state.selectedEntry) return;
      const notes = document.querySelector("[name='reviewerNotes']")?.value || "";
      const transactions = collectReviewTransactions();
      const amountPaid = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
      const paymentMode = transactions.length === 1 ? transactions[0].mode : "Multiple";
      try {
        const busyLabel = button.dataset.reviewAction === "Approved" ? "Verifying..." : "Rejecting...";
        setGlobalButtonLock(true, button, busyLabel);
        await api(`/api/entries/${state.selectedEntry.id}/review`, {
          method: "POST",
          body: JSON.stringify({
            status: button.dataset.reviewAction,
            reviewerNotes: notes,
            amountPaid,
            paymentMode,
            transactions
          })
        });
        state.selectedReviewIds = state.selectedReviewIds.filter((id) => id !== state.selectedEntry.id);
        state.selectedEntry = null;
        await Promise.all([loadEntries(), loadOwners()]);
        renderApp();
      } catch (error) {
        alert(error.message);
      } finally {
        setGlobalButtonLock(false, button);
      }
    });
  });

  const downloadDraft = document.querySelector("#downloadDraft");
  if (downloadDraft) {
    downloadDraft.addEventListener("click", () => {
      window.open(`/api/entries/${state.selectedEntry.id}/download`, "_blank");
    });
  }

  const userForm = document.querySelector("#userForm");
  const ownerForm = document.querySelector("#ownerForm");
  if (ownerForm) {
    ownerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = submitButtonFor(ownerForm, event);
      try {
        await runWithButton(button, "Saving...", async () => {
          const formData = Object.fromEntries(new FormData(ownerForm));
          if (state.ownerDraft?.originalName) {
            await api(`/api/owners/${encodeURIComponent(state.ownerDraft.originalName)}`, {
              method: "PATCH",
              body: JSON.stringify(formData)
            });
          } else {
            await api("/api/owners", {
              method: "POST",
              body: JSON.stringify(formData)
            });
          }
          state.ownerDraft = null;
          await Promise.all([loadOwners(), loadEntries()]);
          renderApp();
        });
      } catch (error) {
        alert(error.message);
      }
    });
  }

  document.querySelector("#cancelOwnerEdit")?.addEventListener("click", () => {
    state.ownerDraft = null;
    renderApp();
  });

  document.querySelectorAll("[data-edit-owner]").forEach((button) => {
    button.addEventListener("click", () => {
      const owner = state.owners.find((item) => item.name === button.dataset.editOwner);
      if (!owner) return;
      state.ownerDraft = {
        originalName: owner.name,
        name: owner.name,
        phone: owner.phone || "",
        address: owner.address || ""
      };
      state.activeOwnerName = owner.name;
      state.fleetDraft = null;
      renderApp();
    });
  });

  const fleetForm = document.querySelector("#fleetForm");
  if (fleetForm) {
    fleetForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = submitButtonFor(fleetForm, event);
      try {
        await runWithButton(button, "Saving...", async () => {
          const formData = Object.fromEntries(new FormData(fleetForm));
          if (state.fleetDraft?.fleetId) {
            await api(`/api/fleet/${encodeURIComponent(state.fleetDraft.fleetId)}`, {
              method: "PATCH",
              body: JSON.stringify(formData)
            });
          } else {
            await api("/api/fleet", {
              method: "POST",
              body: JSON.stringify(formData)
            });
          }
          state.fleetDraft = null;
          await loadFleetDetails();
          renderApp();
        });
      } catch (error) {
        alert(error.message);
      }
    });
  }

  document.querySelector("#cancelFleetEdit")?.addEventListener("click", () => {
    state.fleetDraft = null;
    renderApp();
  });

  document.querySelectorAll("[data-edit-fleet]").forEach((button) => {
    button.addEventListener("click", () => {
      const fleet = state.fleetDetails.find((item) => item.fleetId === button.dataset.editFleet);
      if (!fleet) return;
      state.fleetDraft = { ...fleet };
      state.activeOwnerName = fleet.ownerName;
      renderApp();
    });
  });

  if (userForm) {
    userForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = submitButtonFor(userForm, event);
      try {
        await runWithButton(button, "Saving...", async () => {
          const result = await api("/api/users", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(userForm))) });
          userForm.reset();
          await loadUsers();
          renderApp();
          if (result.temporaryPassword) alert(`Temporary password for ${result.user.username}: ${result.temporaryPassword}`);
        });
      } catch (error) {
        alert(error.message);
      }
    });
  }

  document.querySelectorAll("[data-user-toggle]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await runWithButton(button, "Saving...", async () => {
          await api(`/api/users/${button.dataset.userToggle}`, {
            method: "PATCH",
            body: JSON.stringify({ active: button.dataset.active })
          });
          await loadUsers();
          renderApp();
        });
      } catch (error) {
        alert(error.message);
      }
    });
  });

  document.querySelectorAll("[data-user-reset]").forEach((button) => {
    button.addEventListener("click", async () => {
      const nextPassword = window.prompt("Enter new password for this user");
      if (nextPassword == null) return;
      if (!nextPassword.trim()) {
        alert("Password is required");
        return;
      }
      try {
        await runWithButton(button, "Resetting...", async () => {
          const result = await api(`/api/users/${button.dataset.userReset}/reset-password`, {
            method: "POST",
            body: JSON.stringify({ password: nextPassword.trim() })
          });
          alert(`Password reset for ${result.user.username}`);
        });
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function setupOwnerSearchDropdown(form) {
  const wrapper = form.querySelector("[data-owner-dropdown]");
  if (!wrapper) return;
  const hiddenInput = form.querySelector("[name='ownerName']");
  const searchInput = wrapper.querySelector("[data-owner-search-input]");
  const list = wrapper.querySelector("[data-owner-dropdown-list]");
  const toggle = wrapper.querySelector("[data-owner-dropdown-toggle]");
  const options = Array.from(wrapper.querySelectorAll("[data-owner-option]"));
  const empty = wrapper.querySelector("[data-owner-empty]");
  if (!hiddenInput || !searchInput || !list || !toggle) return;
  const optionValues = options.map((option) => String(option.textContent || option.dataset.ownerOption || "").trim());

  const setOwnerName = (value) => {
    hiddenInput.value = value;
    searchInput.value = value;
    syncOwnerDetails(form);
  };

  const openList = () => {
    list.hidden = false;
    wrapper.classList.add("open");
  };

  const closeList = () => {
    list.hidden = true;
    wrapper.classList.remove("open");
  };

  const filterOptions = () => {
    const query = String(searchInput.value || "").trim().toLowerCase();
    let visible = 0;
    options.forEach((option, index) => {
      const value = String(optionValues[index] || "");
      const matches = !query || value.toLowerCase().includes(query);
      option.hidden = !matches;
      option.style.display = matches ? "" : "none";
      if (matches) visible += 1;
    });
    if (empty) empty.hidden = visible > 0;
  };

  searchInput.addEventListener("focus", () => {
    openList();
    filterOptions();
  });

  searchInput.addEventListener("input", () => {
    hiddenInput.value = String(searchInput.value || "").trim();
    syncOwnerDetails(form);
    openList();
    filterOptions();
  });

  searchInput.addEventListener("keyup", () => {
    openList();
    filterOptions();
  });

  searchInput.addEventListener("search", () => {
    openList();
    filterOptions();
  });

  toggle.addEventListener("click", () => {
    if (list.hidden) {
      openList();
      filterOptions();
      searchInput.focus({ preventScroll: true });
    } else {
      closeList();
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const selected = String(option.dataset.ownerOption || "");
      setOwnerName(selected);
      closeList();
      searchInput.focus({ preventScroll: true });
    });
  });

  wrapper.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!wrapper.contains(document.activeElement)) closeList();
    }, 0);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeList();
  });

  setOwnerName(String(hiddenInput.value || "").trim());
  filterOptions();
}

async function formPayload(form) {
  const formData = new FormData();
  const rawFormData = new FormData(form);
  const photoLabels = {
    driverPhoto: "Driver Photo",
    numberPlatePhoto: "Number Plate",
    sideViewPhoto: "Side View",
    frontViewPhoto: "Front View"
  };
  const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  for (const [key, value] of rawFormData.entries()) {
    if (value instanceof File) {
      if (!value.name) continue;
      const photoLabel = photoLabels[key] || key;
      if (!allowedPhotoTypes.has(value.type)) throw new Error(`${photoLabel} must be JPG, PNG, or WEBP`);
      if (value.size > PHOTO_UPLOAD_CONFIG.maxFileBytes) throw new Error(`${photoLabel} must be ${PHOTO_UPLOAD_CONFIG.maxFileBytes / (1024 * 1024)} MB or smaller`);
      const blob = await fileToBlob(value, photoLabel);
      formData.append(key, blob, value.name);
      continue;
    }
    formData.append(key, value);
  }

  return formData;
}

function fileToBlob(file, label) {
  return new Promise(async (resolve, reject) => {
    try {
      const imageType = file.type.toLowerCase();
      if (!imageType.startsWith("image/") || file.size <= 1024 * 1024) {
        return resolve(file);
      }

      const image = await loadImageBitmap(file);
      const maxDimension = PHOTO_UPLOAD_CONFIG.maxImageDimension;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);

      let quality = 0.85;
      let blob = await canvasToBlob(canvas, "image/jpeg", quality);
      while (blob.size > PHOTO_UPLOAD_CONFIG.maxCompressedBytes && quality > PHOTO_UPLOAD_CONFIG.minCompressQuality) {
        quality = Math.max(PHOTO_UPLOAD_CONFIG.minCompressQuality, quality - PHOTO_UPLOAD_CONFIG.qualityStep);
        blob = await canvasToBlob(canvas, "image/jpeg", quality);
      }

      if (blob.size > PHOTO_UPLOAD_CONFIG.maxCompressedBytes) {
        throw new Error(`${label} could not be compressed below ${PHOTO_UPLOAD_CONFIG.maxCompressedBytes / (1024 * 1024)} MB. Please choose a smaller photo.`);
      }

      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImageBitmap(file) {
  return new Promise((resolve, reject) => {
    if (window.createImageBitmap) {
      createImageBitmap(file).then(resolve, () => loadImageElement(file, resolve, reject));
      return;
    }
    loadImageElement(file, resolve, reject);
  });
}

function loadImageElement(file, resolve, reject) {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = URL.createObjectURL(file);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Image compression failed"));
      resolve(blob);
    }, type, quality);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function loadUsers() {
  if (!state.user || !["admin", "reviewer"].includes(state.user.role)) return;
  const data = await api("/api/users");
  state.users = data.users || [];
}

async function loadOwners() {
  if (!state.user) return;
  const data = await api("/api/owners");
  state.owners = data.owners || [];
}

async function loadFleetDetails() {
  if (!state.user) return;
  const data = await api("/api/fleet");
  state.fleetDetails = data.fleetDetails || [];
}

async function loadNextReceipt() {
  if (!state.user || !roleViews[state.user.role]?.includes("entry")) return;
  const data = await api("/api/entries/next-receipt");
  state.nextReceiptNumber = data.receiptNumber || "";
}

function syncOwnerDetails(form) {
  const ownerName = String(new FormData(form).get("ownerName") || "").trim();
  const owner = state.owners.find((item) => String(item.name || "").trim().toLowerCase() === ownerName.toLowerCase());
  const phoneInput = form.querySelector("[name='ownerPhone']");
  const addressInput = form.querySelector("[name='ownerAddress']");
  const balanceNode = form.querySelector("[data-owner-current-balance]");
  if (!phoneInput || !addressInput) return;
  phoneInput.value = owner ? owner.phone || "" : "";
  addressInput.value = owner ? owner.address || "" : "";
  if (balanceNode) {
    const currentBalance = Number(owner?.currentBalance || 0);
    balanceNode.textContent = `Current Balance: Rs. ${formatMoney(currentBalance)}`;
  }
}

function syncVehicleTypeField(form) {
  const category = new FormData(form).get("vehicleCategory");
  const wrapper = form.querySelector("#vehicleTypeField");
  const currentValue = form.querySelector("[name='vehicleType']")?.value || "";
  if (!wrapper) return;
  const config = getVehicleTypeConfig(category);
  const nextValue = config.options.includes(currentValue) ? currentValue : "";
  wrapper.innerHTML = renderVehicleTypeField(category, nextValue);
}

function entriesForDate(entries, isoDate) {
  return entries.filter((entry) => String(entry.date || "").slice(0, 10) === isoDate);
}

function reviewRecordsForFilter(isoDate, filter) {
  if (filter === "Consolidated Credits") {
    return state.consolidatedEntries
      .filter((entry) => String(entry.date || entry.createdDate || "").slice(0, 10) === isoDate)
      .map((entry) => ({ ...entry, id: entry.creditEntryId, recordType: "consolidated" }));
  }
  if (filter === "Debit Entries") {
    return state.debitEntries
      .filter((entry) => String(entry.date || entry.createdDate || "").slice(0, 10) === isoDate)
      .map((entry) => ({ ...entry, id: entry.debitEntryId, recordType: "debit" }));
  }
  return filterReviewEntries(entriesForDate(state.entries, isoDate), filter);
}

function applyReviewAttributeFilters(records) {
  return records.filter((record) => {
    if (record.recordType) return true;
    if (state.reviewOwnerFilter && (record.ownerName || "") !== state.reviewOwnerFilter) return false;
    if (state.reviewPaymentFilter && (record.paymentMode || "") !== state.reviewPaymentFilter) return false;
    if (state.reviewVehicleCategoryFilter && (record.vehicleCategory || "") !== state.reviewVehicleCategoryFilter) return false;
    return true;
  });
}

function filterReviewEntries(entries, filter) {
  if (filter === "Approved") return entries.filter((entry) => entry.status === "Approved");
  if (filter === "Rejected") return entries.filter((entry) => entry.status === "Rejected");
  return entries.filter((entry) => entry.status === "Pending Review");
}

function formatReviewLongDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatReviewEyebrowDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

function formatReviewTimestamp(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatEntryDateTime(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatWeight(value) {
  const number = Number(value || 0);
  return `${formatMoney(number)} kg`;
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" });
  state.user = null;
  renderLogin();
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

init().catch((error) => {
  app.innerHTML = `<div class="panel" style="margin:40px auto"><h2>Trackly could not start</h2><p>${error.message}</p></div>`;
});
=======
startApp();
>>>>>>> origin/main
