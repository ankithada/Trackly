function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAttendanceStatus(status) {
  return String(status || "Pending").trim();
}

function calculatePayroll({ salaryStructure = {}, attendanceRecords = [], month, year, workingDays = 22, overtimeHours = 0, employeeId }) {
  const grossSalary = toNumber(salaryStructure.grossSalary || salaryStructure.basicSalary || 0);
  const otherDeductions = toNumber(salaryStructure.otherDeductions || 0);
  const perDaySalary = workingDays > 0 ? grossSalary / workingDays : 0;
  const attendanceSummary = attendanceRecords.reduce((acc, record) => {
    const status = normalizeAttendanceStatus(record.attendanceStatus);
    if (status === "Present" || status === "Late" || status === "Work From Home" || status === "On Duty") acc.presentDays += 1;
    if (status === "Absent") acc.absentDays += 1;
    if (status === "Half Day") acc.halfDays += 1;
    if (status === "Paid Leave" || status === "Casual Leave" || status === "Sick Leave" || status === "Earned Leave" || status === "Maternity Leave" || status === "Paternity Leave") acc.paidLeaves += 1;
    if (status === "Unpaid Leave") acc.unpaidLeaves += 1;
    if (status === "Late") acc.lateDays += 1;
    return acc;
  }, { presentDays: 0, absentDays: 0, halfDays: 0, paidLeaves: 0, unpaidLeaves: 0, lateDays: 0 });

  const absentDeduction = attendanceSummary.absentDays * perDaySalary;
  const halfDayDeduction = attendanceSummary.halfDays * (perDaySalary / 2);
  const leaveDeduction = attendanceSummary.unpaidLeaves * perDaySalary;
  const overtimeRate = workingDays > 0 ? perDaySalary / 8 : 0;
  const overtimeAmount = toNumber(overtimeHours || 0) * overtimeRate;
  const netPayableSalary = grossSalary - absentDeduction - halfDayDeduction - leaveDeduction - otherDeductions + overtimeAmount;
  const payslipSummary = [
    `Gross Salary: ${grossSalary.toFixed(2)}`,
    `Attendance Deduction: ${absentDeduction.toFixed(2)}`,
    `Leave Deduction: ${leaveDeduction.toFixed(2)}`,
    `Other Deduction: ${otherDeductions.toFixed(2)}`,
    `Overtime Amount: ${overtimeAmount.toFixed(2)}`,
    `Net Salary: ${netPayableSalary.toFixed(2)}`
  ].join(" | ");

  return {
    employeeId: employeeId || salaryStructure.employeeId || "",
    month: month || "",
    year: year || "",
    grossSalary,
    workingDays,
    presentDays: attendanceSummary.presentDays,
    absentDays: attendanceSummary.absentDays,
    paidLeaves: attendanceSummary.paidLeaves,
    unpaidLeaves: attendanceSummary.unpaidLeaves,
    halfDays: attendanceSummary.halfDays,
    lateDays: attendanceSummary.lateDays,
    perDaySalary,
    attendanceDeduction: absentDeduction + halfDayDeduction,
    leaveDeduction,
    overtimeHours: toNumber(overtimeHours || 0),
    overtimeAmount,
    otherDeduction: otherDeductions,
    netPayableSalary,
    netSalary: netPayableSalary,
    payslipSummary
  };
}

function buildMonthlyAttendanceSummary(attendanceRecords = []) {
  return attendanceRecords.reduce((acc, record) => {
    const status = normalizeAttendanceStatus(record.attendanceStatus);
    if (!acc[status]) acc[status] = 0;
    acc[status] += 1;
    return acc;
  }, {});
}

module.exports = {
  calculatePayroll,
  buildMonthlyAttendanceSummary
};
