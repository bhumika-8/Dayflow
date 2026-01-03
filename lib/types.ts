export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "employee"
  employeeId?: string
  department?: string
  position?: string
  salary?: number
  joiningDate?: string
  profileImage?: string
  createdAt: string
}

export interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  department: string
  position: string
  salary: number
  joiningDate: string
  profileImage?: string
  status: "active" | "inactive"
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: "present" | "absent" | "late" | "half-day"
  workHours?: number
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  leaveType: "sick" | "casual" | "annual" | "unpaid"
  startDate: string
  endDate: string
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedDate: string
  reviewedBy?: string
  reviewedDate?: string
}

export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: "pending" | "processed" | "paid"
  paymentDate?: string
}
