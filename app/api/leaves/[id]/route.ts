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

    const leaveIndex = db.leaves.findIndex((l) => l.id === id)

    if (leaveIndex === -1) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    db.leaves[leaveIndex] = {
      ...db.leaves[leaveIndex],
      status: data.status,
      reviewedBy: session.name,
      reviewedDate: new Date().toISOString(),
    }

    return NextResponse.json({ leave: db.leaves[leaveIndex] })
  } catch (error) {
    console.error("[v0] Update leave error:", error)
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const leaveIndex = db.leaves.findIndex((l) => l.id === id)

    if (leaveIndex === -1) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    // Only admin or the employee who created it can delete
    if (session.role !== "admin" && db.leaves[leaveIndex].employeeId !== session.employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    db.leaves.splice(leaveIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete leave error:", error)
    return NextResponse.json({ error: "Failed to delete leave request" }, { status: 500 })
  }
}
