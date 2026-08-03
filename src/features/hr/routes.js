const { calculatePayroll, buildMonthlyAttendanceSummary } = require("./payroll");

function buildDefaultState() {
  return {
    attendance: [],
    leaveRequests: [],
    salaryStructures: [],
    payrolls: [],
    payslips: []
  };
}

function getState(ctx) {
  const existing = ctx.hrState || null;
  if (existing) return existing;
  const next = buildDefaultState();
  ctx.hrState = next;
  return next;
}

function ensureRole(user, ctx, roles) {
  return ctx.requireRole(user, roles);
}

async function handleRoutes(req, res, user, pathname, ctx) {
  if (!pathname.startsWith("/api/hr")) return false;

  const state = getState(ctx);

  if (pathname === "/api/hr/health" && req.method === "GET") {
    ctx.send(res, 200, { ok: true, module: "hr", features: ["attendance", "leave", "salary-structure", "payroll", "payslip"] });
    return true;
  }

  if (pathname === "/api/hr/attendance/checkin" && req.method === "POST") {
    if (!ensureRole(user, ctx, ["employee", "hr", "admin"])) {
      ctx.sendError(res, 403, "Only employees, HR, or admins can check in");
      return true;
    }
    const input = await ctx.readJson(req);
    const today = new Date().toISOString().slice(0, 10);
    const existing = state.attendance.find((record) => String(record.employeeId) === String(input.employeeId || user.id) && String(record.attendanceDate || "") === today);
    if (existing) {
      ctx.sendError(res, 409, "Attendance already checked in for today");
      return true;
    }
    const attendance = {
      id: `${Date.now()}`,
      employeeId: String(input.employeeId || user.id),
      attendanceDate: today,
      checkInTime: input.checkInTime || new Date().toISOString(),
      checkOutTime: null,
      workingHours: 0,
      attendanceStatus: "Pending",
      approvalStatus: "Pending",
      reviewedBy: null,
      reviewedAt: null,
      reviewRemarks: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.attendance.push(attendance);
    ctx.send(res, 201, { attendance });
    return true;
  }

  if (pathname === "/api/hr/attendance/checkout" && req.method === "POST") {
    if (!ensureRole(user, ctx, ["employee", "hr", "admin"])) {
      ctx.sendError(res, 403, "Only employees, HR, or admins can check out");
      return true;
    }
    const input = await ctx.readJson(req);
    const today = new Date().toISOString().slice(0, 10);
    const record = state.attendance.find((item) => String(item.employeeId) === String(input.employeeId || user.id) && String(item.attendanceDate || "") === today && !item.checkOutTime);
    if (!record) {
      ctx.sendError(res, 404, "No active attendance found for today");
      return true;
    }
    const checkOutTime = input.checkOutTime || new Date().toISOString();
    const checkInTime = new Date(record.checkInTime);
    const checkOutDate = new Date(checkOutTime);
    const hoursDiff = Math.max(0, (checkOutDate.getTime() - checkInTime.getTime()) / (1000 * 60 * 60));
    record.checkOutTime = checkOutTime;
    record.workingHours = Number(hoursDiff.toFixed(2));
    record.attendanceStatus = input.attendanceStatus || "Pending";
    record.updatedAt = new Date().toISOString();
    ctx.send(res, 200, { attendance: record });
    return true;
  }

  if (pathname === "/api/hr/attendance/my-attendance" && req.method === "GET") {
    const employeeId = String(user.id);
    const records = state.attendance.filter((item) => String(item.employeeId) === employeeId);
    ctx.send(res, 200, { attendance: records });
    return true;
  }

  if (pathname === "/api/hr/attendance/history" && req.method === "GET") {
    ctx.send(res, 200, { attendance: state.attendance });
    return true;
  }

  if (pathname.match(/^\/api\/hr\/attendance\/[^/]+\/review$/) && req.method === "PUT") {
    if (!ensureRole(user, ctx, ["hr", "admin"])) {
      ctx.sendError(res, 403, "Only HR or admins can review attendance");
      return true;
    }
    const id = pathname.split("/")[4];
    const record = state.attendance.find((item) => String(item.id) === id);
    if (!record) {
      ctx.sendError(res, 404, "Attendance not found");
      return true;
    }
    const input = await ctx.readJson(req);
    record.approvalStatus = input.approvalStatus || record.approvalStatus;
    record.reviewedBy = user.id;
    record.reviewedAt = new Date().toISOString();
    record.reviewRemarks = input.reviewRemarks || record.reviewRemarks;
    record.attendanceStatus = input.attendanceStatus || record.attendanceStatus;
    record.updatedAt = new Date().toISOString();
    ctx.send(res, 200, { attendance: record });
    return true;
  }

  if (pathname === "/api/hr/leave/apply" && req.method === "POST") {
    if (!ensureRole(user, ctx, ["employee", "hr", "admin"])) {
      ctx.sendError(res, 403, "Only employees, HR, or admins can apply for leave");
      return true;
    }
    const input = await ctx.readJson(req);
    const request = {
      id: `${Date.now()}`,
      employeeId: String(input.employeeId || user.id),
      leaveType: input.leaveType || "Casual Leave",
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason || "",
      attachment: input.attachment || null,
      status: "Applied",
      reviewRemarks: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.leaveRequests.push(request);
    ctx.send(res, 201, { leaveRequest: request });
    return true;
  }

  if (pathname === "/api/hr/leave/my-leaves" && req.method === "GET") {
    const employeeId = String(user.id);
    const leaves = state.leaveRequests.filter((item) => String(item.employeeId) === employeeId);
    ctx.send(res, 200, { leaveRequests: leaves });
    return true;
  }

  if (pathname.match(/^\/api\/hr\/leave\/[^/]+\/(approve|reject)$/) && req.method === "PUT") {
    if (!ensureRole(user, ctx, ["hr", "admin"])) {
      ctx.sendError(res, 403, "Only HR or admins can review leave requests");
      return true;
    }
    const id = pathname.split("/")[4];
    const action = pathname.split("/")[5];
    const request = state.leaveRequests.find((item) => String(item.id) === id);
    if (!request) {
      ctx.sendError(res, 404, "Leave request not found");
      return true;
    }
    const input = await ctx.readJson(req);
    request.status = action === "approve" ? "Approved" : "Rejected";
    request.reviewRemarks = input.reviewRemarks || null;
    request.updatedAt = new Date().toISOString();
    ctx.send(res, 200, { leaveRequest: request });
    return true;
  }

  if (pathname === "/api/hr/salary-structure" && req.method === "POST") {
    if (!ensureRole(user, ctx, ["hr", "admin"])) {
      ctx.sendError(res, 403, "Only HR or admins can manage salary structures");
      return true;
    }
    const input = await ctx.readJson(req);
    const structure = {
      id: `${Date.now()}`,
      employeeId: input.employeeId,
      basicSalary: input.basicSalary || 0,
      hra: input.hra || 0,
      conveyanceAllowance: input.conveyanceAllowance || 0,
      specialAllowance: input.specialAllowance || 0,
      medicalAllowance: input.medicalAllowance || 0,
      otherAllowances: input.otherAllowances || 0,
      pfDeduction: input.pfDeduction || 0,
      esiDeduction: input.esiDeduction || 0,
      professionalTax: input.professionalTax || 0,
      otherDeductions: input.otherDeductions || 0,
      grossSalary: input.grossSalary || 0,
      netSalary: input.netSalary || 0,
      salaryType: input.salaryType || "Monthly",
      createdAt: new Date().toISOString()
    };
    state.salaryStructures.push(structure);
    ctx.send(res, 201, { salaryStructure: structure });
    return true;
  }

  if (pathname.match(/^\/api\/hr\/salary-structure\/[^/]+$/) && req.method === "GET") {
    const employeeId = pathname.split("/")[4];
    const structures = state.salaryStructures.filter((item) => String(item.employeeId) === employeeId);
    ctx.send(res, 200, { salaryStructures: structures });
    return true;
  }

  if (pathname === "/api/hr/payroll/generate" && req.method === "POST") {
    if (!ensureRole(user, ctx, ["hr", "admin"])) {
      ctx.sendError(res, 403, "Only HR or admins can generate payroll");
      return true;
    }
    const input = await ctx.readJson(req);
    const structure = state.salaryStructures.find((item) => String(item.employeeId) === String(input.employeeId));
    if (!structure) {
      ctx.sendError(res, 404, "Salary structure not found for employee");
      return true;
    }
    const attendanceForMonth = state.attendance.filter((item) => String(item.employeeId) === String(input.employeeId) && String(item.attendanceDate || "").slice(0, 7) === String(input.month || ""));
    const payroll = calculatePayroll({
      salaryStructure: structure,
      attendanceRecords: attendanceForMonth,
      month: input.month,
      year: input.year,
      workingDays: input.workingDays || 22,
      overtimeHours: input.overtimeHours || 0,
      employeeId: input.employeeId
    });
    state.payrolls.push({ id: `${Date.now()}`, ...payroll, status: "Draft", createdAt: new Date().toISOString() });
    ctx.send(res, 201, { payroll: state.payrolls[state.payrolls.length - 1] });
    return true;
  }

  if (pathname.match(/^\/api\/hr\/payroll\/[^/]+$/) && req.method === "GET") {
    const employeeId = pathname.split("/")[4];
    const payrolls = state.payrolls.filter((item) => String(item.employeeId) === employeeId);
    ctx.send(res, 200, { payrolls });
    return true;
  }

  if (pathname === "/api/hr/payroll/approve" && req.method === "POST") {
    if (!ensureRole(user, ctx, ["hr", "admin"])) {
      ctx.sendError(res, 403, "Only HR or admins can approve payroll");
      return true;
    }
    const input = await ctx.readJson(req);
    const payroll = state.payrolls.find((item) => String(item.id) === String(input.id));
    if (!payroll) {
      ctx.sendError(res, 404, "Payroll not found");
      return true;
    }
    payroll.status = "Approved";
    ctx.send(res, 200, { payroll });
    return true;
  }

  if (pathname === "/api/hr/payroll/mark-paid" && req.method === "POST") {
    if (!ensureRole(user, ctx, ["hr", "admin"])) {
      ctx.sendError(res, 403, "Only HR or admins can mark payroll as paid");
      return true;
    }
    const input = await ctx.readJson(req);
    const payroll = state.payrolls.find((item) => String(item.id) === String(input.id));
    if (!payroll) {
      ctx.sendError(res, 404, "Payroll not found");
      return true;
    }
    payroll.status = "Paid";
    ctx.send(res, 200, { payroll });
    return true;
  }

  if (pathname === "/api/hr/analytics" && req.method === "GET") {
    const summary = {
      attendance: buildMonthlyAttendanceSummary(state.attendance),
      leaveRequests: state.leaveRequests.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}),
      payrolls: state.payrolls.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {})
    };
    ctx.send(res, 200, { analytics: summary });
    return true;
  }

  return false;
}

module.exports = {
  handleRoutes
};
