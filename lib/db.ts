import type { User, Employee, AttendanceRecord, LeaveRequest, PayrollRecord } from "./types"
import bcrypt from "bcryptjs"

// In-memory database (replace with actual DB in production)
export const db = {
  users: [] as User[],
  employees: [] as Employee[],
  attendance: [] as AttendanceRecord[],
  leaves: [] as LeaveRequest[],
  payroll: [] as PayrollRecord[],
}

// Initialize with demo data
export async function initializeDatabase() {
  if (db.users.length === 0) {
    const hashedAdminPass = await bcrypt.hash("admin123", 10)
    const hashedEmpPass = await bcrypt.hash("emp123", 10)

    db.users.push(
      {
        id: "1",
        email: "admin@company.com",
        password: hashedAdminPass,
        name: "Admin User",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        email: "john.doe@company.com",
        password: hashedEmpPass,
        name: "John Doe",
        role: "employee",
        employeeId: "EMP001",
        department: "Engineering",
        position: "Senior Developer",
        salary: 80000,
        joiningDate: "2023-01-15",
        createdAt: new Date().toISOString(),
      },
    )

    db.employees.push({
      id: "2",
      employeeId: "EMP001",
      name: "John Doe",
      email: "john.doe@company.com",
      department: "Engineering",
      position: "Senior Developer",
      salary: 80000,
      joiningDate: "2023-01-15",
      status: "active",
    })

    // Sample attendance
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      db.attendance.push({
        id: `att-${i}`,
        employeeId: "EMP001",
        date: date.toISOString().split("T")[0],
        checkIn: "09:00",
        checkOut: "18:00",
        status: "present",
        workHours: 9,
      })
    }

    // Sample leave requests
    db.leaves.push({
      id: "leave-1",
      employeeId: "EMP001",
      employeeName: "John Doe",
      leaveType: "casual",
      startDate: "2024-02-01",
      endDate: "2024-02-03",
      reason: "Personal work",
      status: "pending",
      appliedDate: new Date().toISOString(),
    })
  }
}

export async function findUserByEmail(email: string) {
  return db.users.find((u) => u.email === email)
}

export async function createUser(userData: Omit<User, "id" | "createdAt">) {
  const user: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  return user
}
