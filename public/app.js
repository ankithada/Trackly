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
  view: "entry",
  selectedEntry: null,
  selectedReviewIds: [],
  consolidatedCreditDraft: null,
  debitDraft: null,
  ownerDraft: null,
  fleetDraft: null,
  adminTab: "users",
  ownerSearch: "",
  activeOwnerName: "",
  dashboardMonth: "all",
  reviewSidebarOpen: true,
  reviewOwnerFilter: "",
  reviewPaymentFilter: "",
  reviewDate: new Date().toISOString().slice(0, 10),
  reviewFilter: "Unreviewed"
};

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
  try {
    state.health = await api("/api/config/health");
  } catch (error) {
    state.health = { googleConnected: false, error: error.message || "Health check failed" };
  }
  const me = await api("/api/auth/me");
  state.user = me.user;
  if (!state.user) return renderLogin();
  state.view = roleViews[state.user.role][0];
  await loadOwners();
  await loadFleetDetails();
  await loadEntries();
  await loadDebitEntries();
  await loadConsolidatedEntries();
  await loadNextReceipt();
  if (["admin", "reviewer"].includes(state.user.role)) await loadUsers();
  renderApp();
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
      if (state.view === "entry") loadNextReceipt().then(renderApp).catch((error) => alert(error.message));
      else if (state.view === "admin") Promise.all([
        ["admin", "reviewer"].includes(state.user.role) ? loadUsers() : Promise.resolve(),
        loadOwners(),
        loadFleetDetails()
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
          ${selectField("paymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer", "Credit"], entry.paymentMode || "Cash")}
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
  const readOnly = options.readonly ? "readonly" : "";
  return `<div class="field"><label>${label} ${required ? "<span>*</span>" : ""}</label><input name="${name}" type="${type}" value="${escapeAttr(value)}" ${step} ${placeholder} ${pattern} ${readOnly} ${required}></div>`;
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
  const ownerNames = state.owners.map((owner) => owner.name);
  const options = value && !ownerNames.includes(value)
    ? [{ name: value, phone: entry.ownerPhone || "", address: entry.ownerAddress || "" }, ...state.owners]
    : state.owners;
  return `<div class="field"><label>Owner Name <span>*</span></label><select name="ownerName" required>
    <option value="">Select owner</option>
    ${options.map((owner) => `<option value="${escapeAttr(owner.name)}" ${owner.name === value ? "selected" : ""}>${owner.name}</option>`).join("")}
  </select></div>`;
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
  const ownerOptions = Array.from(new Set(
    state.entries
      .filter((entry) => String(entry.date || "").slice(0, 10) === state.reviewDate)
      .map((entry) => entry.ownerName)
      .filter(Boolean)
  )).sort();
  const paymentOptions = ["Cash", "UPI", "Bank Transfer", "Credit", "Multiple"];
  return `
    <div class="card review-stream-card">
      <div class="review-list-head">
        <div>
          <h3>Review Entries</h3>
          <p class="review-panel-subtitle">${formatReviewLongDate(state.reviewDate)}</p>
        </div>
        <span>${entries.length}</span>
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
        </div>
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
      ${entries.length ? `
        <div class="review-stream-list">
          ${entries.map((entry) => renderReviewEntryCard(entry)).join("")}
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
            <div class="slip-meta">Entry #${entry.receiptNumber || entry.id} · ${formatEntryDateTime(entry.createdAt || entry.date)}</div>
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
          ["Address", entry.ownerAddress || "-"]
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
            ${["Cash", "UPI", "Bank Transfer", "Credit"].map((mode) => `
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
                ${selectField("consolidatedPaymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer", "Credit"], draft.paymentMode || "Cash")}
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
                ${selectField("debitPaymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer", "Credit"], draft.paymentMode || "Cash")}
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
  const approved = state.entries.filter(isRevenueEligibleEntry);
  const pending = state.entries.filter((entry) => entry.status === "Pending Review");
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const selectedMonth = monthValue === "all" ? null : monthValue;
  const activeMonth = selectedMonth || currentMonth;
  const monthEntries = state.entries.filter((entry) => String(entry.date || "").startsWith(activeMonth));
  const monthApproved = approved.filter((entry) => String(entry.date || "").startsWith(activeMonth));
  const monthDebits = state.debitEntries.filter((entry) => String(entry.date || "").startsWith(activeMonth));
  const todaysEntries = state.entries.filter((entry) => entry.date === today);
  const todaysApproved = approved.filter((entry) => entry.date === today);
  const todaysDebits = state.debitEntries.filter((entry) => entry.date === today);
  const totalRevenue = sumAmount(approved, "totalAmountInclGst", "grossAmount", "amountPaid");
  const monthRevenue = sumAmount(monthApproved, "totalAmountInclGst", "grossAmount", "amountPaid");
  const todayRevenue = sumAmount(todaysApproved, "totalAmountInclGst", "grossAmount", "amountPaid");
  const totalDebits = sumAmount(state.debitEntries, "amount");
  const monthDebitTotal = sumAmount(monthDebits, "amount");
  const todayDebitTotal = sumAmount(todaysDebits, "amount");
  const totalWeight = approved.reduce((sum, entry) => sum + Number(entry.netWeightTons || 0), 0);
  const monthlyCreditSeries = monthlyRevenueSeries(approved);
  const monthlyDebitSeries = monthlyRevenueSeries(state.debitEntries, "amount");
  const last30Series = buildLast30DaySeries(state.entries, approved);
  const vehicleBreakdown = distributionMap(monthEntries, (entry) => {
    if (entry.vehicleCategory === "Dumper") return "Dumper";
    if (entry.vehicleCategory === "Tractor" && entry.vehicleType) return `Tractor - ${entry.vehicleType}`;
    return entry.vehicleCategory || "Unknown";
  });
  const ownerBreakdown = distributionMap(monthEntries, (entry) => entry.ownerName || "Not Filled");
  const paymentModes = paymentModeDistribution(monthApproved);
  const recentActivity = state.entries
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
        ${dashboardMetricCard("Verified Entries", `${approved.length}`, "total verified", "mint")}
      </div>

      <div class="dashboard-section-label">All Time</div>
      <div class="dashboard-metric-grid">
        ${dashboardMetricCard("Total Trips", `${state.entries.length}`, "all loading trips", "slate")}
        ${dashboardMetricCard("Total Revenue", `Rs ${formatMoney(totalRevenue)}`, "total collected", "green")}
        ${dashboardMetricCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Trips` : "This Month Trips", `${monthEntries.length}`, selectedMonth ? "selected month" : "current month", "violet")}
        ${dashboardMetricCard("Sand Mined", `${formatWeight(totalWeight)} T`, "total net weight", "orange")}
      </div>

      <div class="dashboard-section-label">Credits vs Debits</div>
      <div class="dashboard-balance-grid">
        ${dashboardBalanceCard("Gross Credits (Revenue)", `Rs ${formatMoney(totalRevenue)}`, `all time • ${approved.length} trips`, "green")}
        ${dashboardBalanceCard("Total Debits (Expenses)", `Rs ${formatMoney(totalDebits)}`, `all time • ${state.debitEntries.length} entries`, "red")}
        ${dashboardBalanceCard("Net Position", `Rs ${formatMoney(totalRevenue - totalDebits)}`, "surplus · Credits - Debits", "slate")}
      </div>
      <div class="dashboard-mini-grid">
        ${dashboardMiniCard("Today Credits", `Rs ${formatMoney(todayRevenue)}`, "green")}
        ${dashboardMiniCard("Today Debits", `Rs ${formatMoney(todayDebitTotal)}`, "red")}
        ${dashboardMiniCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Credits` : "This Month Credits", `Rs ${formatMoney(monthRevenue)}`, "blue")}
        ${dashboardMiniCard(selectedMonth ? `${formatMonthLabel(selectedMonth)} Debits` : "This Month Debits", `Rs ${formatMoney(monthDebitTotal)}`, "orange")}
      </div>

      <div class="dashboard-chart-block">
        <h4>Monthly Credits vs Debits</h4>
        ${renderBarChart(monthlyCreditSeries, monthlyDebitSeries)}
      </div>

      <div class="dashboard-chart-block">
        <h4>Daily Trips & Revenue - Last 30 Days</h4>
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

      <div class="dashboard-chart-block">
        <h4>Entries per Owner</h4>
        ${renderBarChart(ownerBreakdown)}
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

function buildLast30DaySeries(entries, approvedEntries) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 29);
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
    return `
      <g>
        <rect x="${center - (secondaryMap ? barWidth + 4 : barWidth / 2)}" y="${baseY - primaryHeight}" width="${barWidth}" height="${primaryHeight}" rx="4" class="chart-bar-primary"></rect>
        ${secondaryMap ? `<rect x="${center + 4}" y="${baseY - secondaryHeight}" width="${barWidth}" height="${secondaryHeight}" rx="4" class="chart-bar-secondary"></rect>` : ""}
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
        ${labels}
      </svg>
      <div class="chart-legend"><span><i class="legend-revenue"></i>Revenue (Rs)</span><span><i class="legend-trips"></i>Trips</span></div>
    </div>
  `;
}

function renderDonutChart(map) {
  const items = Object.entries(map).sort(([, a], [, b]) => b - a);
  if (!items.length) return `<div class="empty">No data available yet.</div>`;
  const total = items.reduce((sum, [, value]) => sum + value, 0);
  const colors = ["#64748b", "#94a3b8", "#0f766e", "#f59e0b", "#7c3aed", "#ef4444", "#10b981"];
  let offset = 0;
  const rings = items.map(([, value], index) => {
    const length = (value / total) * 100;
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
        <text x="70" y="66" text-anchor="middle" class="donut-total">${total}</text>
        <text x="70" y="82" text-anchor="middle" class="donut-subtitle">entries</text>
      </svg>
      <div class="chart-legend stacked">
        ${items.map(([label, value], index) => `<span><i style="background:${colors[index % colors.length]}"></i>${label} ${Math.round((value / total) * 100)}%</span>`).join("")}
      </div>
    </div>
  `;
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
          ["owners", "Owner Master"]
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
            <p>Connected sheet tabs: Daily Entry Form, Owner Master, Owner Fleet Details, Users, Reviewed Entries, and Receipt Registry.</p>
            <p><strong>Health:</strong> ${state.health?.googleConnected ? "OK" : "Failed"}</p>
            ${state.health?.driveFolder ? `<p><strong>Drive folder:</strong> ${state.health.driveFolder.name || state.health.driveFolder.id}</p>` : ""}
            ${state.health?.error ? `<p><strong>Health error:</strong> ${state.health.error.message || state.health.error}</p>` : ""}
          </div>
        </div>
        <div>
          ${renderUsersTable()}
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

  document.querySelector("#reviewOwnerFilter")?.addEventListener("change", (event) => {
    state.reviewOwnerFilter = event.currentTarget.value || "";
    state.selectedReviewIds = [];
    state.selectedEntry = null;
    renderApp();
  });

  document.querySelector("#reviewPaymentFilter")?.addEventListener("change", (event) => {
    state.reviewPaymentFilter = event.currentTarget.value || "";
    state.selectedReviewIds = [];
    state.selectedEntry = null;
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
    entryForm.addEventListener("change", () => syncOwnerDetails(entryForm));
    entryForm.querySelector("[name='vehicleCategory']")?.addEventListener("change", () => syncVehicleTypeField(entryForm));
    updateTotal();
    syncOwnerDetails(entryForm);
    syncVehicleTypeField(entryForm);
    entryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = submitButtonFor(entryForm, event);
      try {
        await runWithButton(button, state.selectedEntry ? "Saving..." : "Submitting...", async () => {
          const payload = await formPayload(entryForm);
          if (state.selectedEntry) {
            const updated = await api(`/api/entries/${state.selectedEntry.id}`, { method: "PATCH", body: payload });
            state.selectedEntry = updated.entry;
            await Promise.all([loadEntries(), loadNextReceipt()]);
          } else {
            const created = await api("/api/entries", { method: "POST", body: payload });
            state.nextReceiptNumber = created.nextReceiptNumber || "";
            await loadEntries();
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
        await runWithButton(button, button.dataset.inlineReviewAction === "Approved" ? "Verifying..." : "Rejecting...", async () => {
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
          await loadEntries();
          renderApp();
        });
      } catch (error) {
        alert(error.message);
      }
    });
  });

  document.querySelectorAll("[data-review-date]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reviewDate = button.dataset.reviewDate;
      state.selectedEntry = null;
      state.selectedReviewIds = [];
      renderApp();
    });
  });

  document.querySelectorAll("[data-calendar-shift]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = new Date(`${state.reviewDate}T00:00:00`);
      current.setMonth(current.getMonth() + Number(button.dataset.calendarShift || 0));
      const next = new Date(current.getFullYear(), current.getMonth(), 1);
      state.reviewDate = next.toISOString().slice(0, 10);
      state.selectedEntry = null;
      state.selectedReviewIds = [];
      renderApp();
    });
  });

  document.querySelectorAll("[data-review-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reviewFilter = button.dataset.reviewFilter;
      state.selectedEntry = null;
      state.selectedReviewIds = [];
      if (["Consolidated Credits", "Debit Entries"].includes(state.reviewFilter)) {
        state.reviewOwnerFilter = "";
        state.reviewPaymentFilter = "";
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
        await loadEntries();
        renderApp();
      } catch (error) {
        alert(error.message);
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
  const ownerName = new FormData(form).get("ownerName");
  const owner = state.owners.find((item) => item.name === ownerName);
  const phoneInput = form.querySelector("[name='ownerPhone']");
  const addressInput = form.querySelector("[name='ownerAddress']");
  if (!phoneInput || !addressInput) return;
  phoneInput.value = owner ? owner.phone || "" : "";
  addressInput.value = owner ? owner.address || "" : "";
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
