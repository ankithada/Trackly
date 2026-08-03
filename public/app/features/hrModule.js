import { api } from "../shared/api.js";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function renderMetricCard(title, value, hint) {
  return `
    <div class="card admin-inner-card">
      <h3>${escapeHtml(title)}</h3>
      <p style="font-size:1.6rem;font-weight:700;margin:0.4rem 0;">${escapeHtml(value)}</p>
      <small>${escapeHtml(hint)}</small>
    </div>
  `;
}

export function renderHrModule({ state }) {
  const analytics = state.hrData?.analytics || null;
  const attendanceSummary = analytics?.attendance ? Object.entries(analytics.attendance).map(([label, count]) => `${label}: ${count}`).join(" • ") : "No analytics yet";
  const leaveSummary = analytics?.leaveRequests ? Object.entries(analytics.leaveRequests).map(([label, count]) => `${label}: ${count}`).join(" • ") : "No leave analytics yet";
  const payrollSummary = analytics?.payrolls ? Object.entries(analytics.payrolls).map(([label, count]) => `${label}: ${count}`).join(" • ") : "No payroll analytics yet";

  return `
    <section class="card admin-section">
      <div class="admin-section-head">
        <div>
          <h3>HR Module</h3>
          <p>Independent attendance, leave, and payroll workspace.</p>
        </div>
        <button type="button" class="secondary" id="refreshHrDataBtn">Refresh HR Data</button>
      </div>

      <div class="grid two">
        ${renderMetricCard("Attendance", analytics ? Object.values(analytics.attendance || {}).reduce((sum, value) => sum + Number(value || 0), 0) : 0, "Tracked attendance records")}
        ${renderMetricCard("Leave", analytics ? Object.values(analytics.leaveRequests || {}).reduce((sum, value) => sum + Number(value || 0), 0) : 0, "Leave requests captured")}
        ${renderMetricCard("Payroll", analytics ? Object.values(analytics.payrolls || {}).reduce((sum, value) => sum + Number(value || 0), 0) : 0, "Payroll records generated")}
      </div>

      <div class="grid two" style="margin-top:1rem;">
        <div class="card admin-inner-card">
          <h3>Attendance Check-In</h3>
          <form id="hrAttendanceForm">
            <div class="field"><label>Employee ID</label><input name="employeeId" type="text" required></div>
            <div class="field"><label>Check In Time</label><input name="checkInTime" type="datetime-local"></div>
            <button type="submit" class="solid-action">Check In</button>
          </form>
        </div>
        <div class="card admin-inner-card">
          <h3>Leave Application</h3>
          <form id="hrLeaveForm">
            <div class="field"><label>Employee ID</label><input name="employeeId" type="text" required></div>
            <div class="field"><label>Leave Type</label><input name="leaveType" type="text" value="Casual Leave"></div>
            <div class="field"><label>Start Date</label><input name="startDate" type="date" required></div>
            <div class="field"><label>End Date</label><input name="endDate" type="date" required></div>
            <div class="field"><label>Reason</label><input name="reason" type="text"></div>
            <button type="submit" class="solid-action">Apply Leave</button>
          </form>
        </div>
      </div>

      <div class="card admin-inner-card" style="margin-top:1rem;">
        <h3>Payroll Generation</h3>
        <form id="hrPayrollForm">
          <div class="grid two">
            <div class="field"><label>Employee ID</label><input name="employeeId" type="text" required></div>
            <div class="field"><label>Month</label><input name="month" type="month" required></div>
          </div>
          <div class="grid two">
            <div class="field"><label>Working Days</label><input name="workingDays" type="number" value="22"></div>
            <div class="field"><label>Overtime Hours</label><input name="overtimeHours" type="number" value="0"></div>
          </div>
          <button type="submit" class="solid-action">Generate Payroll</button>
        </form>
      </div>

      <div class="card admin-inner-card" style="margin-top:1rem;">
        <h3>Analytics Snapshot</h3>
        <p><strong>Attendance:</strong> ${escapeHtml(attendanceSummary)}</p>
        <p><strong>Leave:</strong> ${escapeHtml(leaveSummary)}</p>
        <p><strong>Payroll:</strong> ${escapeHtml(payrollSummary)}</p>
      </div>
    </section>
  `;
}

async function loadHrData(state) {
  const result = await api("/api/hr/analytics");
  state.hrData = result;
}

export function bindHrModule({ state, renderApp }) {
  const refreshButton = document.querySelector("#refreshHrDataBtn");
  refreshButton?.addEventListener("click", async () => {
    try {
      await loadHrData(state);
      renderApp();
    } catch (error) {
      alert(error.message);
    }
  });

  const attendanceForm = document.querySelector("#hrAttendanceForm");
  attendanceForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/hr/attendance/checkin", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form))
      });
      await loadHrData(state);
      renderApp();
      alert("Attendance checked in");
    } catch (error) {
      alert(error.message);
    }
  });

  const leaveForm = document.querySelector("#hrLeaveForm");
  leaveForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/hr/leave/apply", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form))
      });
      await loadHrData(state);
      renderApp();
      alert("Leave request submitted");
    } catch (error) {
      alert(error.message);
    }
  });

  const payrollForm = document.querySelector("#hrPayrollForm");
  payrollForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/hr/payroll/generate", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form))
      });
      await loadHrData(state);
      renderApp();
      alert("Payroll generated");
    } catch (error) {
      alert(error.message);
    }
  });
}
