# HR Module

This module provides an independent HR feature set for attendance, leave, salary structures, payroll, and analytics without overlapping existing Trackly operational flows.

## Supported API routes
- GET /api/hr/health
- POST /api/hr/attendance/checkin
- POST /api/hr/attendance/checkout
- GET /api/hr/attendance/my-attendance
- GET /api/hr/attendance/history
- PUT /api/hr/attendance/:id/review
- POST /api/hr/leave/apply
- GET /api/hr/leave/my-leaves
- PUT /api/hr/leave/:id/approve
- PUT /api/hr/leave/:id/reject
- POST /api/hr/salary-structure
- GET /api/hr/salary-structure/:employeeId
- POST /api/hr/payroll/generate
- GET /api/hr/payroll/:employeeId
- POST /api/hr/payroll/approve
- POST /api/hr/payroll/mark-paid
- GET /api/hr/analytics
