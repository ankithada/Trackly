export function renderNewEntryForm({
  entry = {},
  state,
  field,
  selectField,
  renderVehicleTypeField,
  toDateTimeLocal,
  ownerSelectField,
  textareaField,
  uploadField
}) {
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
          ${selectField("paymentMode", "Payment Mode", ["Cash", "UPI", "Bank Transfer", "Advance", "Credit"], entry.paymentMode || "Cash")}
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

function choiceGroup(name, options, value, required = false) {
  return `<div class="choice-group">${options.map((item) => `
    <label class="choice"><input type="radio" name="${name}" value="${item}" ${value === item ? "checked" : ""} ${required ? "required" : ""}><span>${item}</span></label>
  `).join("")}</div>`;
}
