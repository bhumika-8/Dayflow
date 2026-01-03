import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  const session = await getSession()

  if (!session || !session.employeeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    // Find today's record
    const recordIndex = db.attendance.findIndex(
      (a) => a.employeeId === session.employeeId && a.date === today && a.checkIn && !a.checkOut,
    )

    if (recordIndex === -1) {
      return NextResponse.json({ error: "No check-in found for today" }, { status: 400 })
    }

    // Calculate work hours
    const checkIn = db.attendance[recordIndex].checkIn!
    const [checkInHour, checkInMin] = checkIn.split(":").map(Number)
    const [checkOutHour, checkOutMin] = currentTime.split(":").map(Number)
    const workHours = Math.round(((checkOutHour * 60 + checkOutMin - (checkInHour * 60 + checkInMin)) / 60) * 10) / 10

    db.attendance[recordIndex].checkOut = currentTime
    db.attendance[recordIndex].workHours = workHours

    return NextResponse.json({ record: db.attendance[recordIndex] })
  } catch (error) {
    console.error("[v0] Check-out error:", error)
    return NextResponse.json({ error: "Failed to check out" }, { status: 500 })
  }
}
