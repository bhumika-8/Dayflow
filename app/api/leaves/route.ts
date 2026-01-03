import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import type { LeaveRequest } from "@/lib/types"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")

  let leaves = db.leaves

  if (session.role === "employee") {
    leaves = leaves.filter((l) => l.employeeId === session.employeeId)
  }

  if (status) {
    leaves = leaves.filter((l) => l.status === status)
  }

  // Sort by applied date descending
  leaves = [...leaves].sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())

  return NextResponse.json({ leaves })
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session || !session.employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: session.employeeId,
      employeeName: session.name,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: "pending",
      appliedDate: new Date().toISOString(),
    }

    db.leaves.push(newLeave)

    return NextResponse.json({ leave: newLeave })
  } catch (error) {
    console.error("[v0] Create leave error:", error)
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
  }
}
