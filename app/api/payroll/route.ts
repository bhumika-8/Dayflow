import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import type { PayrollRecord } from "@/lib/types"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const employeeId = searchParams.get("employeeId")

  let payroll = db.payroll

  if (session.role === "employee") {
    payroll = payroll.filter((p) => p.employeeId === session.employeeId)
  } else if (employeeId) {
    payroll = payroll.filter((p) => p.employeeId === employeeId)
  }

  // Sort by year and month descending
  payroll = [...payroll].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return Number.parseInt(b.month) - Number.parseInt(a.month)
  })

  return NextResponse.json({ payroll })
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    const newPayroll: PayrollRecord = {
      id: Date.now().toString(),
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      month: data.month,
      year: Number.parseInt(data.year),
      basicSalary: Number.parseFloat(data.basicSalary),
      allowances: Number.parseFloat(data.allowances),
      deductions: Number.parseFloat(data.deductions),
      netSalary:
        Number.parseFloat(data.basicSalary) + Number.parseFloat(data.allowances) - Number.parseFloat(data.deductions),
      status: "pending",
    }

    db.payroll.push(newPayroll)

    return NextResponse.json({ payroll: newPayroll })
  } catch (error) {
    console.error("[v0] Create payroll error:", error)
    return NextResponse.json({ error: "Failed to create payroll record" }, { status: 500 })
  }
}
