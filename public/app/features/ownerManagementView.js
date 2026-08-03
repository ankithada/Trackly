export function renderOwnerManagementPanel({
  state,
  ownerList,
  activeOwnerName,
  activeFleetDetails,
  ownerDraft,
  fleetDraft,
  field,
  selectField,
  textareaField,
  renderFleetTable,
  renderOwnersTable,
  escapeAttr
}) {
  return `
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
  `;
}
