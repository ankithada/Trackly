export function renderUserManagementPanel({ state, field, renderUsersTable }) {
  return `
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
  `;
}
