import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    const payrollIndex = db.payroll.findIndex((p) => p.id === id)

    if (payrollIndex === -1) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 })
    }

    db.payroll[payrollIndex] = {
      ...db.payroll[payrollIndex],
      ...data,
      paymentDate: data.status === "paid" ? new Date().toISOString() : db.payroll[payrollIndex].paymentDate,
    }

    return NextResponse.json({ payroll: db.payroll[payrollIndex] })
  } catch (error) {
    console.error("[v0] Update payroll error:", error)
    return NextResponse.json({ error: "Failed to update payroll record" }, { status: 500 })
  }
}
