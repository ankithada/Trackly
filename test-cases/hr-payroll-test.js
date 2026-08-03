const assert = require('assert');
const { calculatePayroll } = require('../src/features/hr/payroll');

const structure = {
  basicSalary: 50000,
  hra: 5000,
  conveyanceAllowance: 2000,
  specialAllowance: 3000,
  medicalAllowance: 1000,
  otherAllowances: 1000,
  pfDeduction: 1800,
  esiDeduction: 500,
  professionalTax: 200,
  otherDeductions: 100
};

const payroll = calculatePayroll({
  salaryStructure: structure,
  attendanceRecords: [{ workingHours: 8 }, { workingHours: 8 }],
  month: '2026-07',
  workingDays: 22,
  overtimeHours: 2,
  employeeId: 'EMP-001'
});

assert.strictEqual(payroll.employeeId, 'EMP-001');
assert.ok(payroll.grossSalary > 0, 'gross salary should be positive');
assert.ok(payroll.netSalary > 0, 'net salary should be positive');
assert.ok(payroll.payslipSummary.includes('Net Salary'), 'payslip summary should include net salary');
console.log('hr payroll test passed');
