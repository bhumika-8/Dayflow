import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Employee } from "@/lib/types"

export async function GET() {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ employees: db.employees })
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    const newEmployee: Employee = {
      id: Date.now().toString(),
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      department: data.department,
      position: data.position,
      salary: Number.parseFloat(data.salary),
      joiningDate: data.joiningDate,
      status: "active",
      profileImage: data.profileImage,
    }

    db.employees.push(newEmployee)

    return NextResponse.json({ employee: newEmployee })
  } catch (error) {
    console.error("[v0] Create employee error:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
