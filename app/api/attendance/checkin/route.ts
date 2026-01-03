import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import type { AttendanceRecord } from "@/lib/types"

export async function POST() {
  const session = await getSession()

  if (!session || !session.employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    // Check if already checked in today
    const existingRecord = db.attendance.find(
      (a) => a.employeeId === session.employeeId && a.date === today && a.checkIn,
    )

    if (existingRecord) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId: session.employeeId,
      date: today,
      checkIn: currentTime,
      status: "present",
    }

    db.attendance.push(newRecord)

    return NextResponse.json({ record: newRecord })
  } catch (error) {
    console.error("[v0] Check-in error:", error)
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 })
  }
}
