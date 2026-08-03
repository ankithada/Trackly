export function bindOwnerManagement({
  state,
  api,
  renderApp,
  loadOwners,
  loadEntries,
  submitButtonFor,
  runWithButton
}) {
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
}
