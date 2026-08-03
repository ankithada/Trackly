export function bindVerifyEntry({
  state,
  api,
  renderApp,
  loadEntries,
  loadOwners,
  collectReviewTransactions,
  transactionRowTemplate,
  formatMoney,
  setGlobalButtonLock
}) {
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
}
