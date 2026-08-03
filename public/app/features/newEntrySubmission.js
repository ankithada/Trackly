export function bindNewEntrySubmission({
  state,
  api,
  renderApp,
  loadEntries,
  loadOwners,
  loadNextReceipt,
  setupOwnerSearchDropdown,
  syncOwnerDetails,
  syncVehicleTypeField,
  formPayload,
  submitButtonFor,
  runWithButton,
  formatMoney
}) {
  const entryForm = document.querySelector("#entryForm");
  if (!entryForm) return;

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
