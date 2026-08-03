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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
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

export {
  escapeHtml,
  setButtonBusy,
  runWithButton,
  setGlobalBusyOverlay,
  setGlobalButtonLock,
  submitButtonFor,
  enhanceUi,
  applyTailwindTheme,
  decorateButtonsWithIcons,
  addIconToButton
};
