import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    const employeeIndex = db.employees.findIndex((e) => e.id === id)

    if (employeeIndex === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    db.employees[employeeIndex] = {
      ...db.employees[employeeIndex],
      ...data,
      salary: data.salary ? Number.parseFloat(data.salary) : db.employees[employeeIndex].salary,
    }

    return NextResponse.json({ employee: db.employees[employeeIndex] })
  } catch (error) {
    console.error("[v0] Update employee error:", error)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const employeeIndex = db.employees.findIndex((e) => e.id === id)

    if (employeeIndex === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    db.employees.splice(employeeIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete employee error:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}
