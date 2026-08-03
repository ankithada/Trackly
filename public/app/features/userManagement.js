export function bindUserManagement({
  api,
  renderApp,
  loadUsers,
  submitButtonFor,
  runWithButton
}) {
  const userForm = document.querySelector("#userForm");
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
